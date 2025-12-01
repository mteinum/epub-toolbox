# EPUB Toolbox

[![Release](https://github.com/mteinum/epub-toolbox/actions/workflows/release.yml/badge.svg)](https://github.com/mteinum/epub-toolbox/actions/workflows/release.yml)
[![GitHub release](https://img.shields.io/github/v/release/mteinum/epub-toolbox)](https://github.com/mteinum/epub-toolbox/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Visual Studio Code extension for reading and previewing EPUB files directly in your editor.

## Features

- 📚 **Full EPUB Support** - Read both EPUB 2 and EPUB 3 format ebooks
- 📖 **Hierarchical Table of Contents** - Navigate through chapters with an expandable tree structure
- 📊 **Book Metadata** - View title, author, publisher, and EPUB version
- 🖼️ **Cover Display** - See book covers when available
- 🎨 **Theme Integration** - Automatic light/dark mode support matching VS Code theme
- ⌨️ **Easy Navigation** - Previous/Next chapter buttons for seamless reading
- 🔍 **Active Chapter Highlighting** - Always know where you are in the book

## Usage

1. Open any `.epub` file in VS Code
2. The file will automatically open in the EPUB Preview editor
3. Use the Table of Contents sidebar to navigate chapters
4. Click Previous/Next buttons to move between chapters
5. The current chapter is automatically highlighted in the TOC

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "EPUB Toolbox"
4. Click Install

Or install directly from the command line:
```bash
code --install-extension morten-teinum.epub-toolbox
```

### From GitHub Releases

1. Download the `.vsix` file from [releases](https://github.com/mteinum/epub-toolbox/releases/latest)
2. Install via command line:
   ```bash
   code --install-extension epub-toolbox-*.vsix
   ```
3. Or in VS Code: Extensions → ⋯ (More Actions) → Install from VSIX

## Requirements

- VS Code version 1.80.0 or higher

## Support

If you find this extension helpful, consider supporting its development:

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/mteinum)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, build instructions, and release process.

## License

MIT

## Credits

Built with [epub.js](https://github.com/futurepress/epub.js/) - A JavaScript library for rendering ebooks.
