const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const grammar = JSON.parse(fs.readFileSync(
    path.join(root, 'syntaxes/cloth.tmLanguage.json'), 'utf8'));
const numberPatterns = grammar.repository.numbers.patterns;

function rule(scope) {
    const pattern = numberPatterns.find((item) => item.name === scope);
    assert.ok(pattern, scope);
    return new RegExp(`^(?:${pattern.match})$`);
}

test('canonical numeric suffixes are highlighted atomically', () => {
    const integer = rule('constant.numeric.integer.cloth');
    const floating = rule('constant.numeric.float.cloth');
    for (const spelling of [
        '0i8', '127i8', '0i16', '32767i16', '0i32', '2147483647i32',
        '0i64', '9223372036854775807i64', '0u8', '255u8', '0u16',
        '65535u16', '0u32', '4294967295u32', '0u64',
        '18446744073709551615u64',
    ]) {
        assert.ok(integer.test(spelling), spelling);
        assert.ok(!floating.test(spelling), spelling);
    }
    for (const spelling of [
        '0f32', '1f32', '1.0f32', '0f64', '1f64', '1.0f64',
    ]) {
        assert.ok(floating.test(spelling), spelling);
        assert.ok(!integer.test(spelling), spelling);
    }
});

test('numeric highlighting rejects malformed tails and standalone names', () => {
    const integer = rule('constant.numeric.integer.cloth');
    const floating = rule('constant.numeric.float.cloth');
    for (const spelling of [
        '1i32value', '1f64name', '1I32', '1U8', '1F32', '1i7', '1u128',
        '1f16', '1i8u8', '1f32f64', '1byte', '1int', '1uint', '1float',
        '1.0i32', '1_000', 'i8',
    ]) {
        assert.ok(!integer.test(spelling), spelling);
        assert.ok(!floating.test(spelling), spelling);
    }
});

test('typed literal source checks, emits, and preserves completed output', {
    skip: !process.env.CLOTHC_UNDER_TEST,
}, () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'cloth-literals-'));
    try {
        const source = path.join(directory, 'Main.co');
        const valid = [
            'static final int8 Small = -128i8;',
            'static final uint64 Large = 18446744073709551615u64;',
            'static final float32 NegativeZero = -0.0f32;',
            'static func Main() { int64 value = 1i8; println(value); }',
            '',
        ].join('\n');
        fs.writeFileSync(source, valid);
        const invoke = (args) => {
            const result = spawnSync(process.env.CLOTHC_UNDER_TEST,
                [...args, source], { encoding: 'utf8', timeout: 30000 });
            assert.ifError(result.error);
            return result;
        };
        const checked = invoke(['--check']);
        assert.equal(checked.status, 0, checked.stderr);
        const output = path.join(directory, 'previous.ll');
        const emitted = invoke([`--emit-llvm=${output}`]);
        assert.equal(emitted.status, 0, emitted.stderr);
        const previous = fs.readFileSync(output, 'utf8');

        fs.writeFileSync(source, valid.replace('1i8', '1i7'));
        const failed = invoke([`--emit-llvm=${output}`]);
        assert.equal(failed.status, 1, failed.stderr);
        assert.match(failed.stderr, /invalid numeric suffix 'i7'/);
        assert.equal(fs.readFileSync(output, 'utf8'), previous);
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});
