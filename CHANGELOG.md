# Change Log

## Unreleased

- Highlight scientific notation, lowercase binary/octal/hexadecimal integers,
  and strictly placed digit separators as complete numeric tokens.

- Highlight all canonical typed numeric literals as one token, including
  integer-core `f32` and `f64` forms, without reserving suffix names.

- Highlight `switch`, `case`, and `default`; add a scoped-arm switch snippet
  and compiler checks for frontend validation, LLVM emission, and failed-output
  preservation.

- Align declaration modifiers with the compiler, including `override` for
  interface implementations.
- Add an `override` function snippet and syntax/compiler regression checks.

## 0.0.1

Initial Support for Syntax highlighting during Cloth development.
