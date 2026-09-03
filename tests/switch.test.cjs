const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const grammar = readJson('syntaxes/cloth.tmLanguage.json');
const snippet = readJson('snippets/cloth.json')['Switch statement'];

test('switch keywords have identifier boundaries', () => {
    const rule = grammar.repository.keywords.patterns.find(
        (item) => item.name === 'keyword.control.conditional.cloth');
    const expression = new RegExp(rule.match);
    for (const keyword of ['switch', 'case', 'default']) assert.ok(expression.test(keyword));
    for (const name of ['switches', 'cases', 'default_value']) assert.ok(!expression.test(name));
});

test('switch snippet has explicit arm blocks and an editable selector', () => {
    assert.equal(snippet.prefix, 'switch');
    assert.equal(snippet.body[0], 'switch (${1:value}) {');
    assert.ok(snippet.body.includes('\tcase ${2:0}: {'));
    assert.ok(snippet.body.includes('\tdefault: {'));
    assert.match(snippet.description, /switch/i);
});

test('switch snippet checks, missing arm braces fail, and emission preserves output', {
    skip: !process.env.CLOTHC_UNDER_TEST,
}, () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'cloth-switch-'));
    try {
        const body = snippet.body.join('\n')
            .replace(/\$\{\d+:([^}]+)\}/g, '$1')
            .replace(/\$\{\d+\}|\$\d+/g, '');
        const source = path.join(directory, 'Example.co');
        const text = `static func Main() { int32 value = 0; ${body} }\n`;
        fs.writeFileSync(source, text);
        const invoke = (args) => {
            const result = spawnSync(process.env.CLOTHC_UNDER_TEST,
                [...args, source], { encoding: 'utf8', timeout: 30000 });
            assert.ifError(result.error);
            return result;
        };
        const checked = invoke(['--check']);
        assert.equal(checked.status, 0, checked.stderr);
        const output = path.join(directory, 'previous.ll');
        const emission = invoke([`--emit-llvm=${output}`]);
        assert.equal(emission.status, 0, emission.stderr);
        const previous = fs.readFileSync(output, 'utf8');
        assert.match(previous, /switch i32/);
        fs.writeFileSync(source, text.replace('case 0: {\n\t\t\n\t}', 'case 0: break;'));
        const invalid = invoke(['--check']);
        assert.equal(invalid.status, 1, invalid.stderr);
        assert.match(invalid.stderr, /before switch arm body/);
        const failedEmission = invoke([`--emit-llvm=${output}`]);
        assert.equal(failedEmission.status, 1, failedEmission.stderr);
        assert.equal(fs.readFileSync(output, 'utf8'), previous);
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});
