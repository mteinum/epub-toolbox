# EPUB Toolbox

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

### From Source

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press F5 to open a new VS Code window with the extension loaded
5. Open an EPUB file to test

### From VSIX

1. Download the `.vsix` file from releases
2. Run `code --install-extension epub-toolbox-*.vsix`
3. Reload VS Code

## Development

### Build Commands

- `npm run compile` - Compile the extension once
- `npm run watch` - Watch for changes and recompile
- `npm run package` - Package the extension as a VSIX file

### Project Structure

```
epub-toolbox/
├── src/
│   ├── extension.ts          # Extension entry point
│   ├── epubProvider.ts       # Custom editor provider
│   └── webview/
│       └── preview.js        # Webview script with epub.js
├── out/                      # Compiled output
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript config
└── esbuild.js                # Build configuration
```

## Requirements

- VS Code version 1.80.0 or higher

## Known Issues

- None at this time

## Releasing

To create a new release, use the release script:

```bash
./scripts/release.sh 0.1.0
```

This script will:
1. Update the version in `package.json`
2. Commit the version change
3. Create and push a git tag (`v0.1.0`)
4. GitHub Actions will automatically:
   - Build and package the extension
   - Create a GitHub release
   - Attach the `.vsix` file to the release

Alternatively, you can manually create a release:
```bash
npm version 0.1.0 --no-git-tag-version
git add package.json
git commit -m "Bump version to 0.1.0"
git tag v0.1.0
git push origin main
git push origin v0.1.0
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Credits

Built with [epub.js](https://github.com/futurepress/epub.js/) - A JavaScript library for rendering ebooks.
