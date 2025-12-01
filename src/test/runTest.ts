import * as path from 'path';
import * as fs from 'fs';
import { runTests } from '@vscode/test-electron';

async function main() {
    try {
        // The folder containing the Extension Manifest package.json
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');

        // The path to test runner
        const extensionTestsPath = path.resolve(__dirname, './suite/index');

        // Try to use local VS Code installation if it exists (for local dev with proxy issues)
        let vscodeExecutablePath: string | undefined;
        const localVSCodePath = '/Applications/Visual Studio Code.app/Contents/MacOS/Electron';
        
        if (process.platform === 'darwin' && fs.existsSync(localVSCodePath)) {
            vscodeExecutablePath = localVSCodePath;
        }

        // Download VS Code, unzip it and run the integration test
        await runTests({ 
            extensionDevelopmentPath, 
            extensionTestsPath,
            vscodeExecutablePath,
            version: 'stable'
        });
    } catch (err) {
        console.error('Failed to run tests:', err);
        process.exit(1);
    }
}

main();
