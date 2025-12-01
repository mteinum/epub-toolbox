# Developer Guide

## Development Setup

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press F5 to open a new VS Code window with the extension loaded
5. Open an EPUB file to test

## Build Commands

- `npm run compile` - Compile the extension once
- `npm run watch` - Watch for changes and recompile
- `npm run package` - Package the extension as a VSIX file

## Project Structure

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

## Releasing

To create a new release, use the release script:

```bash
./scripts/release.sh 0.1.0
```

This script will:
1. Update the version in `package.json` and `package-lock.json`
2. Commit the version change
3. Create and push a git tag (`v0.1.0`)
4. GitHub Actions will automatically:
   - Build and package the extension
   - Create a GitHub release
   - Attach the `.vsix` file to the release
   - Publish to VS Code Marketplace

### Manual Release

Alternatively, you can manually create a release:

```bash
npm version 0.1.0 --no-git-tag-version
git add package.json package-lock.json
git commit -m "Bump version to 0.1.0"
git tag v0.1.0
git push origin main
git push origin v0.1.0
```

## Publishing to Marketplace

The extension automatically publishes to the VS Code Marketplace via GitHub Actions when a new tag is pushed.

### Prerequisites

1. **Azure DevOps Personal Access Token**:
   - Go to https://dev.azure.com
   - User Settings → Personal Access Tokens → New Token
   - Name: `GitHub Actions VSCE`
   - Organization: `All accessible organizations`
   - Scopes: **Marketplace (Publish)**
   - Copy the token

2. **Add to GitHub Secrets**:
   - Go to repository Settings → Secrets and variables → Actions
   - Add secret named `VSCE_PAT` with your Azure DevOps PAT

## Testing

### Running Tests

The project includes automated tests using Mocha and the VS Code Test Runner:

```bash
# Run all tests
npm test

# Run linter
npm run lint

# Compile tests only
npm run compile-tests
```

**Note**: Tests require downloading VS Code for the test environment. If you encounter network issues, the tests will run automatically in CI.

### Manual Testing

1. Run the extension in debug mode (F5)
2. Open an EPUB file to test functionality
3. Verify:
   - Table of contents loads correctly
   - Chapter navigation works
   - Metadata displays properly
   - Cover image shows when available
   - Theme integration works in light/dark modes

### Writing Tests

Test files are located in `src/test/suite/` and follow these conventions:

- Use Mocha TDD-style tests (`suite`, `test`, `assert`)
- Name test files with `.test.ts` extension
- Import VS Code API and extension modules as needed

Example test:

```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('My Test Suite', () => {
    test('should do something', () => {
        assert.strictEqual(1 + 1, 2);
    });
});
```

### Continuous Integration

Tests run automatically on:
- Push to `main` branch
- Pull requests to `main` branch
- All major platforms: Ubuntu, Windows, macOS

See `.github/workflows/test.yml` for the CI configuration.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Technical Details

### Technologies Used

- **TypeScript** - Extension code
- **epub.js** - EPUB parsing and rendering
- **esbuild** - Fast bundling
- **VS Code Extension API** - Custom editor provider

### Key Components

- **Custom Editor Provider**: Handles `.epub` files
- **Webview**: Renders EPUB content with epub.js
- **Message Passing**: Communication between extension and webview
- **Theme Integration**: Uses VS Code CSS variables for theming

## Troubleshooting

### Build Issues

If you encounter build errors:
```bash
rm -rf node_modules out
npm install
npm run compile
```

### Extension Not Loading

1. Check VS Code version (requires 1.80.0+)
2. Verify extension is activated (check Output → Extension Host)
3. Check for errors in Developer Tools (Help → Toggle Developer Tools)

### EPUB Not Rendering

1. Verify the EPUB file is valid
2. Check browser console in webview (right-click → Inspect)
3. Ensure epub.js bundle loaded correctly
