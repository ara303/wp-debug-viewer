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
            // Allow the webview to load resources from the extension directory
            localResourceRoots: [this._extensionUri]
        };

        // Set the HTML content
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Setup the file monitoring
        this._startWatcher();

        // Re-setup watcher if settings change
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('wpDebugViewer.path')) {
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

        // Initial Read
        this._readAndDisplay(fullPath);

        // Create FileSystemWatcher (Works remotely)
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
            
            // Convert to string
            const text = Buffer.from(content).toString('utf8');
            
            if (text.trim().length === 0) {
                this._updateContent('Log file is empty.');
                return;
            }

            // Get last 200 lines (performance optimization)
            const lines = text.split('\n');
            const tail = lines.slice(-200).join('\n');

            this._updateContent(tail);
        } catch (err) {
            // Specifically handle file not found
            if (err.code === 'FileNotFound' || err.name === 'EntryNotFound (FileSystemError)') {
                 this._updateContent(`File not found at:\n${fullPath}\n\nCheck your setting 'wpDebugViewer.path'.`);
            } else {
                 this._updateContent(`Error reading log:\n${err.message}`);
            }
        }
    }

    _updateContent(text) {
        if (this._view) {
            this._view.webview.postMessage({ command: 'update', text: text });
        }
    }

    _getHtmlForWebview(webview) {
        // Essential for allowing scripts to run
        const cspSource = webview.cspSource;

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <!-- Security Policy: Allow scripts and styles -->
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src ${cspSource} 'unsafe-inline';">
            <style>
                body { 
                    margin: 0; 
                    padding: 0; 
                    background-color: var(--vscode-sideBar-background); 
                    color: var(--vscode-editor.foreground); 
                    font-family: var(--vscode-editor-font-family); 
                    font-size: var(--vscode-editor-font-size); 
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
            <div id="log">Initializing...</div>
            <script>
                const logDiv = document.getElementById('log');
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.command === 'update') {
                        logDiv.innerText = message.text;
                        // Auto-scroll to bottom
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