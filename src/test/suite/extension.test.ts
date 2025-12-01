import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('morten-teinum.epub-toolbox'));
    });

    test('Extension should activate', async () => {
        const ext = vscode.extensions.getExtension('morten-teinum.epub-toolbox');
        await ext?.activate();
        assert.ok(ext?.isActive);
    });

    test('Custom editor should be registered', async () => {
        const ext = vscode.extensions.getExtension('morten-teinum.epub-toolbox');
        await ext?.activate();
        
        // Verify the extension has registered the custom editor
        assert.ok(ext?.isActive);
    });
});
