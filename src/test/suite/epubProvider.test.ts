import * as assert from 'assert';
import { EpubEditorProvider } from '../../epubProvider';
import * as vscode from 'vscode';

suite('EPUB Provider Test Suite', () => {
    test('EpubEditorProvider should be instantiable', () => {
        const mockContext: vscode.ExtensionContext = {
            subscriptions: [],
            extensionUri: vscode.Uri.file('/test')
        } as unknown as vscode.ExtensionContext;
        
        const provider = new EpubEditorProvider(mockContext);
        assert.ok(provider);
    });

    test('Provider should implement CustomReadonlyEditorProvider', () => {
        const mockContext: vscode.ExtensionContext = {
            subscriptions: [],
            extensionUri: vscode.Uri.file('/test')
        } as unknown as vscode.ExtensionContext;
        
        const provider = new EpubEditorProvider(mockContext);
        assert.ok(typeof provider.openCustomDocument === 'function');
        assert.ok(typeof provider.resolveCustomEditor === 'function');
    });
});
