# Cloth Language Support

VS Code syntax highlighting, file icons, and snippets for Cloth. Cloth source
files use the `.co` extension; each file defines its own type.

## Interface implementations and overrides

Use `override` on a class function that implements an interface contract or
replaces an inherited class function. Type `override` and accept the snippet
to insert an editable function signature:

```cloth
// Renderable.co
interface {
  func Render();
}

// Widget.co
class is Renderable {
  override func Render() {
    println("Hello, Cloth!");
  }
}
```

Interface declarations themselves use plain `func`. Inherited implementations
need no redundant redeclaration. Capitalization determines visibility; public
interface functions start with an uppercase letter. There is no `impl` keyword.

## Development

Requires Node.js for support tests and VS Code 1.109.0 or newer to load the
extension. Run `npm install` and `npm run compile` to build the TypeScript
extension, then launch it from VS Code's Extension Development Host.

Run `npm test` for grammar and snippet checks. Set `CLOTHC_UNDER_TEST` to a
compiler executable to also compile the expanded snippet and verify that a
missing `override` is rejected. These checks use Node's built-in test runner
and do not require installed dependencies.

A Windows sanitizer compiler also needs its Clang ASan runtime directory on
`PATH`, matching the compiler's CTest environment.

## Current limitations

Highlighting is lexical, not a language server: it does not replace compiler
diagnostics, name resolution, or type checking. Some legacy grammar rules and
new-file generators predate the current language and may produce unsupported
syntax. Historical trait/library scaffolds and extension associations are not
compiler feature guarantees; use `.co` files and the compiler's language
contracts as the source of truth. Generator alignment is tracked separately
from interface-override support.
