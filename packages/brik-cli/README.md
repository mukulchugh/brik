# @brik/cli

Command-line tools for building native widgets with Brik.

## Installation

```bash
# Install globally
npm install -g @brik/cli

# Or use with npx
npx brik --help
```

## Commands

### `brik build`

Compile React components to native widget code.

```bash
# Build for all platforms
brik build --platform all

# Build as widget (includes widget configuration)
brik build --platform ios --as-widget ./src/widgets/WeatherWidget.tsx

# Build specific file
brik build --platform android --as-widget ./src/widgets/CalendarWidget.tsx

# Build entire directory
brik build --platform all --as-widget ./src/widgets/
```

**Options**:
- `--platform` - Target platform: `ios`, `android`, or `all`
- `--as-widget` - Generate as widget (includes widget configuration)
- `--project-root` - Project root directory (default: current directory)
- `--verbose` - Enable verbose logging

### `brik ios-setup`

Set up iOS widget extension.

```bash
# Create widget extension
brik ios-setup --name WeatherWidget

# With custom bundle ID
brik ios-setup --name WeatherWidget --bundle-id com.myapp.widgets
```

**What it does**:
- Creates widget extension target files
- Generates Info.plist configuration
- Sets up App Groups entitlements
- Creates Swift widget files

**Manual steps required**:
1. Add widget extension target in Xcode
2. Configure App Groups capability
3. Build and run

### `brik android-setup`

Set up Android widget.

```bash
# Create widget files
brik android-setup --name WeatherWidget

# With custom package
brik android-setup --name WeatherWidget --package com.myapp.widgets
```

**What it does**:
- Generates Kotlin widget files
- Creates widget configuration XML
- Sets up AndroidManifest entries
- Configures Glance dependencies

**Manual steps required**:
1. Add widget to AndroidManifest.xml (if not auto-added)
2. Verify Glance dependencies in build.gradle

### `brik doctor`

Verify Brik installation and project configuration.

```bash
brik doctor
```

**Checks**:
- ✅ Node.js version
- ✅ Package installation
- ✅ iOS configuration (if applicable)
- ✅ Android configuration (if applicable)
- ✅ Widget files
- ✅ Dependencies

### `brik watch`

Watch for file changes and rebuild automatically.

```bash
# Watch and rebuild on changes
brik watch --platform all --as-widget

# Watch specific directory
brik watch --platform ios --as-widget ./src/widgets/
```

**Options**:
- `--platform` - Target platform
- `--as-widget` - Build as widget
- `--verbose` - Enable verbose logging

## Usage Examples

### Initial Setup

```bash
# 1. Install Brik CLI
npm install -g @brik/cli

# 2. Set up iOS widget
brik ios-setup --name WeatherWidget

# 3. Set up Android widget
brik android-setup --name WeatherWidget

# 4. Build widget code
brik build --platform all --as-widget ./src/widgets/WeatherWidget.tsx

# 5. Verify setup
brik doctor
```

### Development Workflow

```bash
# Start watch mode
brik watch --platform all --as-widget ./src/widgets/

# Make changes to your widget components
# CLI automatically rebuilds on file changes
```

### Build for Production

```bash
# Build all widgets for iOS
brik build --platform ios --as-widget ./src/widgets/

# Build all widgets for Android
brik build --platform android --as-widget ./src/widgets/

# Build everything
brik build --platform all --as-widget ./src/widgets/
```

## Configuration

### Project Structure

```
my-app/
├── src/
│   └── widgets/
│       ├── WeatherWidget.tsx    # Your widget component
│       └── CalendarWidget.tsx
├── ios/
│   └── WeatherWidget/           # Generated iOS files
│       ├── WeatherWidget.swift
│       ├── Info.plist
│       └── WeatherWidget.entitlements
└── android/
    └── app/src/main/
        └── java/.../widgets/    # Generated Android files
            ├── WeatherWidget.kt
            └── WeatherWidgetReceiver.kt
```

### Widget Component Format

```tsx
/**
 * @brik-widget
 */
export function WeatherWidget() {
  return (
    <BrikView style={{ padding: 16 }}>
      <BrikText fontSize={20}>San Francisco</BrikText>
      <BrikText fontSize={48}>72°</BrikText>
      <BrikText>Sunny</BrikText>
    </BrikView>
  );
}
```

### Live Activity Component Format

```tsx
/**
 * @brik-activity
 */
export function OrderTracking() {
  return {
    activityType: 'OrderTracking',
    attributes: {
      static: { orderId: 'string' },
      dynamic: { status: 'string', eta: 'number' }
    },
    regions: {
      lockScreen: <BrikView>{/* Lock screen UI */}</BrikView>,
      dynamicIsland: {
        compact: <BrikProgressBar />,
        minimal: <BrikText>🍕</BrikText>,
        expanded: <BrikView>{/* Expanded UI */}</BrikView>
      }
    }
  };
}
```

## Output

### iOS (SwiftUI)

Generated files:
- `{WidgetName}.swift` - Main widget implementation
- `{WidgetName}Entry.swift` - Timeline entry
- `{WidgetName}Provider.swift` - Timeline provider
- `Info.plist` - Widget configuration
- `{WidgetName}.entitlements` - App Groups

### Android (Jetpack Glance)

Generated files:
- `{WidgetName}.kt` - Glance widget implementation
- `{WidgetName}Receiver.kt` - Broadcast receiver
- `{WidgetName}Info.xml` - Widget configuration
- `layout/widget_loading.xml` - Loading state

## Troubleshooting

### Build Fails

```bash
# Enable verbose logging
brik build --platform all --as-widget --verbose

# Check for TypeScript errors
npx tsc --noEmit

# Verify @brik/react-native is installed
npm ls @brik/react-native
```

### iOS Setup Issues

**App Groups not working?**
- Verify bundle ID matches in Xcode
- Check entitlements file is correct
- Ensure App Groups capability is enabled

**Widget extension not building?**
- Check Swift version (5.0+ required)
- Verify deployment target (iOS 14+)
- Ensure widget files are added to target

### Android Setup Issues

**Widget not appearing?**
- Check AndroidManifest.xml has receiver registered
- Verify Glance dependencies in build.gradle
- Ensure minimum SDK is 31 (Android 12)

**Build errors?**
- Check Kotlin version compatibility
- Verify Compose version matches Glance requirements
- Review ProGuard rules for release builds

## Advanced Usage

### Custom Build Configuration

Create `brik.config.js`:

```javascript
module.exports = {
  ios: {
    bundleId: 'com.myapp',
    appGroupId: 'group.com.myapp.widgets',
    deploymentTarget: '14.0'
  },
  android: {
    package: 'com.myapp',
    minSdk: 31,
    glanceVersion: '1.0.0'
  },
  compiler: {
    strictMode: true,
    preserveComments: false
  }
};
```

### CI/CD Integration

```bash
# In CI pipeline
npm install -g @brik/cli
brik build --platform all --as-widget ./src/widgets/
brik doctor

# Check for errors
if [ $? -ne 0 ]; then
  echo "Brik build failed"
  exit 1
fi
```

### Monorepo Setup

```bash
# Build from packages/widgets
cd packages/widgets
brik build --platform all --as-widget --project-root ../../apps/mobile

# Watch mode with custom root
brik watch --platform all --as-widget --project-root ../../apps/mobile
```

## API

### Programmatic Usage

```typescript
import { build, iosSetup, androidSetup } from '@brik/cli';

// Build widgets
await build({
  platform: 'all',
  asWidget: true,
  inputPath: './src/widgets/WeatherWidget.tsx',
  projectRoot: process.cwd(),
  verbose: true
});

// Set up iOS
await iosSetup({
  name: 'WeatherWidget',
  bundleId: 'com.myapp',
  projectRoot: process.cwd()
});

// Set up Android
await androidSetup({
  name: 'WeatherWidget',
  package: 'com.myapp',
  projectRoot: process.cwd()
});
```

## Examples

See [`examples`](../../examples/) directory:
- [`brik-expo-app`](../../examples/brik-expo-app) - Complete Expo example
- [`brik-example-app`](../../examples/brik-example-app) - React Native CLI example

## Documentation

- [Main README](../../README.md)
- [Widget Setup Guide](../../docs/WIDGET_SETUP_GUIDE.md)
- [Live Activities Guide](../../docs/LIVE_ACTIVITIES_GUIDE.md)

## License

MIT © Mukul Chugh
