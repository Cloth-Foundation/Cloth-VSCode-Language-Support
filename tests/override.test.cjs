const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const grammar = readJson('syntaxes/cloth.tmLanguage.json');
const snippet = readJson('snippets/cloth.json')['Override function'];

function patterns(value) {
    if (!value || typeof value !== 'object') return [];
    return [value, ...Object.values(value).flatMap(patterns)];
}

test('override is a modifier, without introducing impl', () => {
    const rule = patterns(grammar).find((item) => item.name === 'storage.modifier.cloth');
    assert.ok(rule);
    const expression = new RegExp(rule.match);
    for (const modifier of ['override', 'abstract', 'final', 'sealed', 'static']) {
        assert.ok(expression.test(modifier), modifier);
    }
    for (const identifier of ['impl', 'overrides', 'my_override']) {
        assert.ok(!expression.test(identifier), identifier);
    }
});

test('override snippet is registered for Cloth and has an editable signature', () => {
    const manifest = readJson('package.json');
    assert.ok(manifest.contributes.snippets.some(
        (item) => item.language === 'cloth' && item.path === './snippets/cloth.json'));
    assert.equal(snippet.prefix, 'override');
    assert.equal(snippet.body[0], 'override func ${1:Render}(${2}): ${3:void} {');
    assert.ok(snippet.body.join('\n').includes('$0'));
});

test('expanded snippet satisfies an interface; removing override is rejected', {
    skip: !process.env.CLOTHC_UNDER_TEST,
}, () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'cloth-override-'));
    try {
        const body = snippet.body.join('\n')
            .replace(/\$\{\d+:([^}]+)\}/g, '$1')
            .replace(/\$\{\d+\}|\$\d+/g, '');
        fs.writeFileSync(path.join(directory, 'Renderable.co'),
            'interface { func Render(); }\n');
        for (const marked of [true, false]) {
            const method = marked ? body : body.replace('override ', '');
            const source = path.join(directory, 'Widget.co');
            fs.writeFileSync(source, `import Renderable;\nclass is Renderable {\n${method}\n}\n`);
            const result = spawnSync(process.env.CLOTHC_UNDER_TEST,
                ['--check', `--source-root=${directory}`, source], { encoding: 'utf8', timeout: 30000 });
            assert.ifError(result.error);
            assert.equal(result.status, marked ? 0 : 1, result.stderr);
            if (!marked) assert.match(result.stderr, /add 'override'/);
        }
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});
