# WP Debug Viewer

Visual Studio Code extension to show WordPress `debug.log` file in a dedicated panel ("Sidebar" in VSC vocabulary). Keep the terminal where you're actually typing visible and view debugging info differently.

**[Install now](https://marketplace.visualstudio.com/items?itemName=ara303.wp-debug-viewer)**

## Features

- **Sidebar integration**: Debug display separate from your terminal and/or editor panels.
- **Hot reload**: Automatically watches the log file and streams new entries as they happen.
- **Remote support**: Works seamlessly with VS Code Remote (WSL or  Dev Containers) by using the Workspace file system API.
- **Configurable**: Default path is `wp-content/debug.log` but can be pointed to any file path relative to your workspace root.

## Requirements

Set the following constants in `wp-config.php`:

```php
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false ); // Optional
```

## Installation

Download from the **[Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ara303.wp-debug-viewer)**.

Or manually:

1.  Download the `.vsix` file provided (or clone repo and package with `vsce package`).
2.  Open to Visual Studio Code's Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3.  Click the "..." (Views and More Actions) menu in the top-right corner of the Extensions sidebar.
4.  Select **Install from VSIX...** and choose the downloaded file.

## Usage

1.  Open a WordPress project folder in VS Code.
2.  Click the **WP Debug Viewer** icon in the Activity Bar (the strip on the left or right side of the window).
3.  The sidebar will open and display the contents of your `debug.log`.

### Panel position
If you want the log viewer on the right (so you can have your normal terminal below your work area):
1.  Drag **WP Debug Viewer** icon from the left Activity Bar.
2.  Drop it onto the right Activity Bar.

## Settings

*   `wpDebugViewer.path`: The relative path to `debug.log` from the workspace root. Default: `wp-content/debug.log`
*   `wpDebugViewer.fontSize`: Font size in pixels for the log output panel. Default: `12`

### Custom `debug.log` file path
1.  Search for **WP Debug Viewer** in your Settings page (File > Preferences > Settings, or `Ctrl` + `,`).
2.  Update **Path** relative to the workspace root (e.g., `your/path/to/debug.log`).
3.  Alternatively, add `"wpDebugViewer.path": "your/path/to/debug.log"` to `settings.json` directly.

### Custom font size
1.  Search for **WP Debug Viewer** in your Settings page (File > Preferences > Settings, or `Ctrl` + `,`).
2.  Update **Font Size** to the desired pixel value (e.g., `14`).
3.  Alternatively, add `"wpDebugViewer.fontSize": 14` to `settings.json` directly.

## Credits

Loosely inspired by the extension [WP Debug Log Panel](https://marketplace.visualstudio.com/items?itemName=Profet.wp-debug-log-panel), but that wasn't suitable for me as it appears to be abandoned, has a hard coded path to `debug.log`, and uses the built-in terminal rather than a separate view for monitoring.
