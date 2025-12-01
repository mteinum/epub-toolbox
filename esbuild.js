const esbuild = require('esbuild');

const watch = process.argv.includes('--watch');

// Extension bundle
const extensionConfig = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'out/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  sourcemap: true,
  minify: !watch,
};

// Webview bundle
const webviewConfig = {
  entryPoints: ['src/webview/preview.js'],
  bundle: true,
  outfile: 'out/webview/preview.js',
  format: 'iife',
  platform: 'browser',
  sourcemap: true,
  minify: !watch,
};

async function build() {
  try {
    if (watch) {
      const ctxExtension = await esbuild.context(extensionConfig);
      const ctxWebview = await esbuild.context(webviewConfig);
      
      await ctxExtension.watch();
      await ctxWebview.watch();
      
      console.log('Watching for changes...');
    } else {
      await esbuild.build(extensionConfig);
      await esbuild.build(webviewConfig);
      console.log('Build complete');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
