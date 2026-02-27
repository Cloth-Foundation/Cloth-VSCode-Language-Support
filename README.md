# Cloth Language Support

Official Visual Studio Code extension for the Cloth programming language. This extension provides syntax highlighting and language support for `.co`, `.cloth`, and `.clib` files.

## Features

This extension provides comprehensive syntax highlighting for the Cloth programming language, including:

- **Keywords and Control Flow**: Full support for `if`, `else`, `for`, `while`, `switch`, `case`, `return`, and more
- **Type System**: Highlighting for primitive types (`i8`, `i16`, `i32`, `i64`, `u8`, `u16`, `u32`, `u64`, `f32`, `f64`, `bool`, `string`, `char`, `void`, `any`)
- **Memory Management**: Syntax highlighting for `new`, `delete`, `ref`, `shared`, `owned`, `atomic`
- **Object-Oriented Features**: Support for `class`, `struct`, `interface`, `enum` declarations
- **Function Declarations**: Proper highlighting for function definitions
- **Operators**: Complete operator support including arithmetic, logical, comparison, and special operators
- **Comments**: Both single-line (`//`) and multi-line (`/* */`) comment support
- **String Literals**: Support for both single and double-quoted strings with escape sequences
- **Number Formats**: Decimal, hexadecimal (`0x`), binary (`0b`), and floating-point numbers
- **Meta Keywords**: Built-in keywords like `SIZEOF`, `TYPEOF`, `LENGTH`, `ALIGNOF`, `MEMSPACE`
- **Modifiers**: Access modifiers (`public`, `private`, `internal`) and qualifiers (`static`, `abstract`, `final`, `override`)
- **Module System**: `module` and `import` statement highlighting
- **Custom File Icons**: Dedicated file icons for `.co`, `.cloth`, and `.clib` files

## Supported File Extensions

- `.co` - Primary Cloth source files
- `.cloth` - Alternative Cloth source files
- `.clib` - Cloth library files

## Installation

1. Open Visual Studio Code
2. Press `Ctrl+P` (or `Cmd+P` on macOS) to open the Quick Open dialog
3. Type `ext install Cloth.cloth` and press Enter
4. Reload Visual Studio Code when prompted

Alternatively, you can install the extension from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/).

## Requirements

- Visual Studio Code version 1.109.0 or higher

## Extension Settings

This extension does not contribute any VS Code settings at this time.

## Known Issues

None currently. Please report issues on the [GitHub repository](https://github.com/Cloth-Foundation/Cloth-VSCode-Language-Support).

## Release Notes

### 0.0.1

Initial release of Cloth Language Support:

- Complete syntax highlighting for Cloth language
- Support for `.co`, `.cloth`, and `.clib` file extensions
- Custom file icons
- Comprehensive pattern matching for all language constructs

---

## About Cloth

Cloth is a modern programming language designed for system programming with a focus on memory safety and performance. For more information, visit the [official Cloth website](https://cloth.dev).

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This extension is provided by Cloth Foundation.

**Enjoy coding in Cloth!**
