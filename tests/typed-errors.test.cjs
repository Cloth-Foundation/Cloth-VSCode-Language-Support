const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const grammar = JSON.parse(fs.readFileSync(
    path.join(root, 'syntaxes/cloth.tmLanguage.json'), 'utf8'));

test('typed-error keywords have identifier boundaries', () => {
    const exceptionRule = grammar.repository.keywords.patterns.find(
        (item) => item.name === 'keyword.control.exception.cloth');
    const declarationRule = grammar.repository.keywords.patterns.find(
        (item) => item.name === 'keyword.declaration.cloth');
    assert.ok(exceptionRule);
    assert.ok(declarationRule);
    const exception = new RegExp(exceptionRule.match);
    const declaration = new RegExp(declarationRule.match);
    for (const keyword of ['throw', 'throws']) assert.ok(exception.test(keyword));
    for (const identifier of ['throwable', 'throwsValue']) {
        assert.ok(!exception.test(identifier));
    }
    assert.ok(declaration.test('error'));
    assert.ok(!declaration.test('errors'));
});

test('typed-error syntax checks and emits the explicit error ABI', {
    skip: !process.env.CLOTHC_UNDER_TEST,
}, () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'cloth-errors-'));
    try {
        const source = path.join(directory, 'EditorError.co');
        fs.writeFileSync(source,
            'error {\n' +
            '  EditorError(string message): Error(message) {}\n' +
            '  static func Fail(): int32 throws EditorError {\n' +
            '    throw EditorError("editor");\n' +
            '  }\n' +
            '  static func Main(): int32 throws EditorError { return Fail(); }\n' +
            '}\n');
        const check = spawnSync(process.env.CLOTHC_UNDER_TEST,
            ['--check', `--source-root=${directory}`, source],
            { encoding: 'utf8', timeout: 30000 });
        assert.ifError(check.error);
        assert.equal(check.status, 0, check.stderr);
        const output = path.join(directory, 'errors.ll');
        const emission = spawnSync(process.env.CLOTHC_UNDER_TEST,
            [`--emit-llvm=${output}`, `--source-root=${directory}`, source],
            { encoding: 'utf8', timeout: 30000 });
        assert.ifError(emission.error);
        assert.equal(emission.status, 0, emission.stderr);
        const llvm = fs.readFileSync(output, 'utf8');
        assert.match(llvm, /define ptr @_C/);
        assert.match(llvm, /ret ptr/);
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});
