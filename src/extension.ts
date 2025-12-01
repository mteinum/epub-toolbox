import * as vscode from 'vscode';
import { EpubEditorProvider } from './epubProvider';

export function activate(context: vscode.ExtensionContext) {
    const provider = new EpubEditorProvider(context);
    
    const registration = vscode.window.registerCustomEditorProvider(
        'epubToolbox.epubPreview',
        provider,
        {
            webviewOptions: {
                retainContextWhenHidden: false
            },
            supportsMultipleEditorsPerDocument: false
        }
    );
    
    context.subscriptions.push(registration);
}

export function deactivate() {}
