import * as vscode from 'vscode';
import * as path from 'path';

export class EpubEditorProvider implements vscode.CustomReadonlyEditorProvider {
    constructor(private readonly context: vscode.ExtensionContext) {}

    async openCustomDocument(
        uri: vscode.Uri,
        openContext: vscode.CustomDocumentOpenContext,
        token: vscode.CancellationToken
    ): Promise<vscode.CustomDocument> {
        return { uri, dispose: () => {} };
    }

    async resolveCustomEditor(
        document: vscode.CustomDocument,
        webviewPanel: vscode.WebviewPanel,
        token: vscode.CancellationToken
    ): Promise<void> {
        // Configure webview
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'out', 'webview')
            ]
        };

        // Set webview HTML
        webviewPanel.webview.html = this.getWebviewContent(webviewPanel.webview);

        // Read EPUB file
        try {
            const fileData = await vscode.workspace.fs.readFile(document.uri);
            
            // Send file data to webview
            webviewPanel.webview.postMessage({
                type: 'loadEpub',
                data: Array.from(fileData)
            });
        } catch (error) {
            vscode.window.showErrorMessage(
                `Failed to read EPUB file: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            
            webviewPanel.webview.postMessage({
                type: 'error',
                message: 'Failed to load EPUB file'
            });
        }

        // Handle messages from webview
        webviewPanel.webview.onDidReceiveMessage(
            message => {
                switch (message.type) {
                    case 'error':
                        vscode.window.showErrorMessage(`EPUB Error: ${message.message}`);
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    private getWebviewContent(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'out', 'webview', 'preview.js')
        );

        const codiconsUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.context.extensionUri,
                'node_modules',
                '@vscode/codicons',
                'dist',
                'codicon.css'
            )
        );

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource}; img-src ${webview.cspSource} data: blob:; font-src ${webview.cspSource};">
    <link href="${codiconsUri}" rel="stylesheet" />
    <title>EPUB Preview</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            display: flex;
            height: 100vh;
            overflow: hidden;
        }

        /* Sidebar */
        #sidebar {
            width: 300px;
            background-color: var(--vscode-sideBar-background);
            border-right: 1px solid var(--vscode-sideBar-border);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        /* Metadata section */
        #metadata {
            padding: 16px;
            border-bottom: 1px solid var(--vscode-sideBar-border);
        }

        #metadata h1 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--vscode-foreground);
        }

        #metadata .meta-item {
            font-size: 12px;
            margin-bottom: 4px;
            color: var(--vscode-descriptionForeground);
        }

        #metadata .meta-label {
            font-weight: 600;
            color: var(--vscode-foreground);
        }

        #cover-container {
            margin-top: 12px;
            text-align: center;
        }

        #cover-image {
            max-width: 100%;
            max-height: 200px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        /* Table of Contents */
        #toc-container {
            flex: 1;
            overflow-y: auto;
            padding: 8px 0;
        }

        #toc-container h2 {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--vscode-descriptionForeground);
            padding: 8px 16px;
            margin-bottom: 4px;
        }

        #toc {
            list-style: none;
        }

        #toc ul {
            list-style: none;
            padding-left: 16px;
        }

        #toc li {
            position: relative;
        }

        .toc-item {
            display: flex;
            align-items: center;
            padding: 4px 16px;
            cursor: pointer;
            color: var(--vscode-foreground);
            text-decoration: none;
            transition: background-color 0.1s;
        }

        .toc-item:hover {
            background-color: var(--vscode-list-hoverBackground);
        }

        .toc-item.active {
            background-color: var(--vscode-list-activeSelectionBackground);
            color: var(--vscode-list-activeSelectionForeground);
        }

        .toc-icon {
            margin-right: 6px;
            flex-shrink: 0;
        }

        .toc-expand {
            margin-right: 2px;
            cursor: pointer;
            flex-shrink: 0;
            width: 16px;
            text-align: center;
        }

        .toc-expand.empty {
            visibility: hidden;
        }

        .toc-label {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 13px;
        }

        .toc-children {
            display: none;
        }

        .toc-children.expanded {
            display: block;
        }

        /* Main content area */
        #main {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        #toolbar {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            background-color: var(--vscode-editor-background);
            border-bottom: 1px solid var(--vscode-panel-border);
            gap: 8px;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 6px 12px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 2px;
            cursor: pointer;
            font-size: 13px;
            transition: background-color 0.1s;
        }

        .btn:hover:not(:disabled) {
            background-color: var(--vscode-button-hoverBackground);
        }

        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .btn .codicon {
            margin-right: 4px;
        }

        #epub-viewer {
            flex: 1;
            overflow: auto;
            background-color: var(--vscode-editor-background);
        }

        /* Loading and error states */
        #loading, #error {
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 32px;
            text-align: center;
        }

        #loading.visible, #error.visible {
            display: flex;
        }

        .spinner {
            border: 3px solid var(--vscode-editorWidget-background);
            border-top: 3px solid var(--vscode-progressBar-background);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        #error .codicon {
            font-size: 48px;
            color: var(--vscode-errorForeground);
            margin-bottom: 16px;
        }

        #error-message {
            color: var(--vscode-foreground);
            font-size: 14px;
            max-width: 400px;
        }

        /* EPUB content styling */
        #epub-viewer iframe {
            border: none;
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    <div id="sidebar">
        <div id="metadata">
            <h1 id="book-title">Loading...</h1>
            <div id="book-author" class="meta-item"></div>
            <div id="book-publisher" class="meta-item"></div>
            <div id="book-version" class="meta-item"></div>
            <div id="cover-container" style="display: none;">
                <img id="cover-image" alt="Book cover">
            </div>
        </div>
        <div id="toc-container">
            <h2>Table of Contents</h2>
            <ul id="toc"></ul>
        </div>
    </div>
    
    <div id="main">
        <div id="toolbar">
            <button id="prev-btn" class="btn" disabled>
                <i class="codicon codicon-chevron-left"></i>
                Previous
            </button>
            <button id="next-btn" class="btn" disabled>
                Next
                <i class="codicon codicon-chevron-right"></i>
            </button>
        </div>
        <div id="epub-viewer"></div>
        <div id="loading">
            <div class="spinner"></div>
            <div>Loading EPUB...</div>
        </div>
        <div id="error">
            <i class="codicon codicon-error"></i>
            <div id="error-message"></div>
        </div>
    </div>

    <script src="${scriptUri}"></script>
</body>
</html>`;
    }
}
