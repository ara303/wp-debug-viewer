# WP Debug Viewer

Visual Studio Code extension to show WordPress `debug.log` file in a dedicated panel ("Sidebar," in VSC vocabulary) panel. Keep your Terminal panel available without having to swap views to view debugging output.

## Features

- **Sidebar Integration**: Lives in the Sidebar (Activity Bar), separate from your terminal and editor panels.
- **Real-time Updates**: Automatically watches the log file and streams new entries as they happen.
- **Remote Support**: Works seamlessly with VS Code Remote (SSH, WSL, Dev Containers) by using the Workspace file system API.
- **Configurable Path**: Defaults to `wp-content/debug.log` but can be pointed to any file path relative to your workspace root.
- **Performance**: Optimized to only render the last 200 lines to prevent lag with massive log files.

## Requirements

This extension requires a standard WordPress installation with debugging enabled. You must have the following constants set in your `wp-config.php` file for the log to be generated:

```php
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false ); // Optional: keeps errors off the screen and in the log only
```

## Installation

1.  Download the `.vsix` file provided (or package it yourself using `vsce package`).
2.  Open Visual Studio Code.
3.  Go to the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
4.  Click the "..." (Views and More Actions) menu in the top-right corner of the Extensions sidebar.
5.  Select **Install from VSIX...**.
6.  Choose the downloaded file.

## Usage

1.  Open a WordPress project folder in VS Code.
2.  Click the **WP Debug Viewer** icon in the Activity Bar (the strip on the left or right side of the window).
    *   *Note: If you don't see the icon, look for it in the "..." overflow menu or try reloading VS Code.*
3.  The sidebar will open and display the contents of your `debug.log`.
4.  If the file doesn't exist yet, the extension will wait for it to be created (it monitors for file creation).

### Moving the Panel
By default, VS Code places new sidebar items on the left. If you want the log viewer on the right (like the image in your requirements):
1.  Drag the **WP Debug Viewer** icon from the left Activity Bar.
2.  Drop it onto the right Activity Bar (where Copilot Chat or Outline might be).
3.  VS Code will remember this position.

## Extension Settings

This extension contributes the following settings:

*   `wpDebugViewer.path`: 
    *   The relative path to the debug log file from the workspace root.
    *   Default: `wp-content/debug.log`

### Changing the Log Path
1.  Go to **File > Preferences > Settings** (or `Ctrl+,`).
2.  Search for "WP Debug Viewer".
3.  Update the path if your log file is located elsewhere (e.g., `wp-content/logs/debug.log`).

----

### License
MIT
