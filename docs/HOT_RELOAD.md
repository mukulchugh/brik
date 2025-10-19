# Brik Hot Reload Documentation

## Overview

Brik Hot Reload provides real-time widget development with automatic code generation and native widget updates. When you modify your Brik components, the changes are instantly compiled and pushed to your native widgets without requiring a full app rebuild.

## Features

- 🔥 **Instant Updates**: Changes to Brik components are reflected immediately
- 📱 **Native Widget Refresh**: Automatically updates iOS widgets and Android home screen widgets
- 🔌 **WebSocket Communication**: Real-time connection between dev server and app
- 🎯 **Incremental Builds**: Only rebuilds changed components for faster updates
- 🛠️ **Developer Tools**: Integrated with React Native dev menu for manual refresh
- 🔄 **Auto-reconnect**: Automatically reconnects if connection is lost

## Installation

The hot reload functionality is built into `@brik/cli` and `@brik/react-native` packages.

```bash
# Install dependencies
pnpm add -D chokidar ws chalk ora debounce
```

## Usage

### 1. Start the Hot Reload Server

Run the watch command in your project directory:

```bash
# Start hot reload for iOS widgets
brik watch --platform ios

# Start hot reload for Android widgets
brik watch --platform android

# Start hot reload for both platforms
brik watch --platform all

# With custom options
brik watch --platform ios --port 8090 --auto-reload --verbose
```

#### Command Options

- `--platform <platform>`: Target platform (ios|android|all)
- `--as-widget`: Mark roots as widgets
- `--out-dir <dir>`: Output directory (default: .brik)
- `--port <port>`: WebSocket server port (default: 8089)
- `--auto-reload`: Auto-reload native widgets
- `--verbose`: Verbose output

### 2. Enable Hot Reload in Your React Native App

Add the hot reload hook to your app's entry point:

```tsx
// App.tsx
import { useBrikHotReload } from '@brik/react-native';

function App() {
  // Enable hot reload in development
  useBrikHotReload();

  // Or with custom configuration
  useBrikHotReload({
    url: 'ws://localhost:8089',
    enabled: __DEV__,
    onReload: () => console.log('Widgets reloaded!'),
    onError: (error) => console.error('Hot reload error:', error)
  });

  return (
    // Your app content
  );
}
```

#### Hook Options

- `url`: WebSocket server URL (default: ws://localhost:8089)
- `enabled`: Enable/disable hot reload (default: __DEV__)
- `onReload`: Callback when widgets are reloaded
- `onError`: Error handler callback

### 3. Create Brik Widgets

Create widgets using Brik components:

```tsx
// src/WeatherWidget.tsx
import { BrikView, BrikText, BrikStack } from '@brik/react-native';

/**
 * @brik-widget
 */
export function WeatherWidget() {
  return (
    <BrikView style={{ padding: 16, backgroundColor: '#4A90E2' }}>
      <BrikStack axis="horizontal">
        <BrikText style={{ fontSize: 24, color: '#FFFFFF' }}>
          San Francisco
        </BrikText>
        <BrikSpacer />
        <BrikText style={{ fontSize: 48, color: '#FFFFFF' }}>
          72°
        </BrikText>
      </BrikStack>
    </BrikView>
  );
}
```

### 4. See Changes in Real-Time

1. Make changes to your widget components
2. Save the file
3. Watch the console output:
   ```
   📝 File changed: src/WeatherWidget.tsx
   ✅ Built 1 component(s) for iOS in 125ms
   ```
4. Your native widgets automatically update!

## How It Works

### Architecture

```
┌──────────────┐     File Change      ┌──────────────┐
│  File        │───────────────────────▶│   Watcher    │
│  System      │                       │  (chokidar)  │
└──────────────┘                       └──────────────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │   Compiler   │
                                       │  (Babel/TSC) │
                                       └──────────────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ Code Gen     │
                                       │(Swift/Kotlin)│
                                       └──────────────┘
                                              │
                                              ▼
                                       ┌──────────────┐
         WebSocket Message            │  WebSocket   │
       ◀─────────────────────────────│   Server     │
       │                              └──────────────┘
       ▼
┌──────────────┐                      ┌──────────────┐
│ React Native │─────────────────────▶│   Native     │
│     App      │  Widget Reload API   │   Widgets    │
└──────────────┘                      └──────────────┘
```

### Workflow

1. **File Watching**: Chokidar monitors your source files for changes
2. **Compilation**: Modified files are compiled from TSX/JSX to IR
3. **Code Generation**: IR is translated to native code (SwiftUI/Compose)
4. **Notification**: WebSocket server notifies connected clients
5. **Widget Refresh**: Native modules trigger widget timeline reload

## Native Integration

### iOS (WidgetKit)

The hot reload system integrates with WidgetKit to refresh widget timelines:

```swift
// Triggered by hot reload
WidgetCenter.shared.reloadAllTimelines()
```

### Android (Glance)

For Android widgets using Glance:

```kotlin
// Triggered by hot reload
GlanceAppWidgetManager.updateAll(context)
```

## Advanced Features

### Incremental Builds

The hot reload system uses smart caching to only rebuild changed components:

```typescript
// Only rebuilds if IR has changed
const hasChanges = await this.checkForChanges(roots);
if (!hasChanges && changedPath) {
  this.spinner.info('No changes in generated code');
  return;
}
```

### Auto-Reconnect

The client automatically reconnects if the connection is lost:

```typescript
// Automatic reconnection with exponential backoff
if (reconnectAttempts < maxReconnectAttempts) {
  reconnectAttempts++;
  console.log(`Reconnecting in ${reconnectDelay}ms...`);
  reconnectTimeout = setTimeout(connect, reconnectDelay);
}
```

### Dev Menu Integration

On iOS, a dev menu item is added for manual widget refresh:

```typescript
DevSettings.addMenuItem('Reload Brik Widgets', () => {
  NativeModules.BrikWidgetManager.reloadAllWidgets();
});
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check that the hot reload server is running
   - Verify the WebSocket port is not blocked
   - Ensure the URL matches (localhost vs IP address)

2. **Widgets Not Updating**
   - Verify native modules are properly linked
   - Check that widgets are registered with the OS
   - Ensure you're running in development mode

3. **Compilation Errors**
   - Check console output for detailed error messages
   - Verify your Brik components follow the correct syntax
   - Ensure all dependencies are installed

### Debug Mode

Enable verbose logging for detailed output:

```bash
brik watch --verbose
```

This will show:
- File change events
- Compilation steps
- WebSocket connections
- Native module calls

## Best Practices

1. **Development Only**: Hot reload should only be enabled in development
2. **Error Handling**: Always provide error callbacks for debugging
3. **Performance**: Use incremental builds for large projects
4. **Testing**: Test widget updates on real devices when possible

## Limitations

- Hot reload only works with Brik components (not native code)
- Some widget changes may require a full app restart
- Live Activities require iOS 16.1+ for dynamic updates
- Android widget updates may have OS-imposed rate limits

## Example Project

See the `examples/brik-example-app` directory for a complete working example with hot reload enabled.

---

## API Reference

### CLI Commands

```bash
brik watch [options]
brik dev [options]  # Alias for watch
```

### React Native API

```typescript
// Hook with all options
useBrikHotReload({
  url?: string;
  enabled?: boolean;
  onReload?: () => void;
  onError?: (error: Error) => void;
});

// Simple enable
enableBrikHotReload();
```

### WebSocket Protocol

Messages sent from server to client:

```typescript
// Reload message
{
  type: 'reload',
  timestamp: number,
  components: number,
  buildTime: number,
  changedPath?: string
}

// Error message
{
  type: 'error',
  error: string,
  timestamp: number
}

// Connection confirmation
{
  type: 'connected',
  timestamp: number
}
```

## Contributing

Hot reload is a core feature of Brik. To contribute:

1. Check existing issues for hot reload improvements
2. Test changes with multiple platforms
3. Ensure WebSocket compatibility
4. Update documentation for new features

## Support

For issues with hot reload:
- Check the [GitHub Issues](https://github.com/mukulchugh/brik/issues)
- Review console output for errors
- Enable verbose mode for debugging
- Join our Discord for community support