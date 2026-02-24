const vscode = require('vscode');
const path = require('path');

class WpDebugViewProvider {
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
        this._view = undefined;
        this._watcher = undefined;
    }

    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        this._startWatcher();

        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('wpDebugViewer')) {
                this._startWatcher();
            }
        });
    }

    _startWatcher() {
        if (this._watcher) {
            this._watcher.dispose();
        }

        const config = vscode.workspace.getConfiguration('wpDebugViewer');
        const relativePath = config.get('path') || 'wp-content/debug.log';
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders) {
            this._updateContent('No workspace folder open.');
            return;
        }

        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        const fullPath = path.join(workspaceRoot, relativePath);

        this._readAndDisplay(fullPath);

        this._watcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(workspaceFolders[0], relativePath)
        );

        this._watcher.onDidChange(() => this._readAndDisplay(fullPath));
        this._watcher.onDidCreate(() => this._readAndDisplay(fullPath));
    }

    async _readAndDisplay(fullPath) {
        if (!this._view) return;

        try {
            const uri = vscode.Uri.file(fullPath);
            const content = await vscode.workspace.fs.readFile(uri);
            const text = Buffer.from(content).toString('utf8');

            if (text.trim().length === 0) {
                this._updateContent('Log file is empty.');
                return;
            }

            const lines = text.split('\n');
            const tail = lines.slice(-200).join('\n');

            this._updateContent(tail);
        } catch (err) {
            if (err.code === 'FileNotFound' || err.name === 'EntryNotFound (FileSystemError)') {
                this._updateContent(`File not found at:\n${fullPath}\n\nCheck your setting 'wpDebugViewer.path'.`);
            } else {
                this._updateContent(`Error reading log:\n${err.message}`);
            }
        }
    }

    _updateContent(text) {
        if (this._view) {
            const config = vscode.workspace.getConfiguration('wpDebugViewer');
            const fontSize = config.get('fontSize') || 12;
            this._view.webview.postMessage({ command: 'update', text, fontSize });
        }
    }

    _getHtmlForWebview(webview) {
        const cspSource = webview.cspSource;

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src ${cspSource} 'unsafe-inline';">
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background-color: var(--vscode-sideBar-background);
                    color: var(--vscode-editor-foreground);
                    font-family: var(--vscode-editor-font-family);
                    overflow: hidden;
                }
                #log {
                    width: 100%;
                    height: 100vh;
                    overflow-y: auto;
                    box-sizing: border-box;
                    padding: 10px;
                    white-space: pre-wrap;
                    word-break: break-all;
                }
            </style>
        </head>
        <body>
            <div id="log">Loading...</div>
            <script>
                const logDiv = document.getElementById('log');
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.command === 'update') {
                        logDiv.style.fontSize = message.fontSize + 'px';
                        logDiv.innerText = message.text;
                        logDiv.scrollTop = logDiv.scrollHeight;
                    }
                });
            </script>
        </body>
        </html>`;
    }
}

function activate(context) {
    console.log('WP Debug Viewer is active.');

    const provider = new WpDebugViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('wpDebugViewer.logView', provider)
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}