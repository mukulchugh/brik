# Brik Installation Guide

Complete installation guide for using Brik in your React Native project.

## Prerequisites

### For All Platforms
- Node.js 18+
- React Native 0.78+ or Expo SDK 51+
- pnpm, npm, or yarn

### For iOS
- macOS with Xcode 14+
- CocoaPods
- iOS 14.0+ deployment target

### For Android
- Android Studio
- Android SDK 21+ (recommended: 31+)
- Kotlin 1.9+
- Gradle 7.0+

---

## Quick Start

### 1. Install Packages

```bash
# Using pnpm (recommended)
pnpm add @brik/react-native @brik/cli

# Using npm
npm install @brik/react-native @brik/cli

# Using yarn
yarn add @brik/react-native @brik/cli
```

### 2. Install Native Dependencies

#### iOS

```bash
cd ios && pod install && cd ..
```

The native module will be automatically linked via CocoaPods autolinking.

#### Android

No additional setup required - the native module will be automatically linked via React Native autolinking.

### 3. Verify Installation

```bash
npx brik doctor
```

This will check your environment and confirm that Brik is properly installed.

---

## Project Setup

### React Native CLI Projects

#### iOS Setup

1. **Update Podfile** (if needed):

The module should autolink automatically. If you encounter issues, add to your Podfile:

```ruby
pod 'BrikReactNative', :path => '../node_modules/@brik/react-native'
```

2. **Set Minimum iOS Version**:

Ensure your Podfile has at least iOS 14.0:

```ruby
platform :ios, '14.0'
```

3. **Install Pods**:

```bash
cd ios && pod install && cd ..
```

#### Android Setup

1. **Update build.gradle** (app level):

Ensure you have Kotlin support. In `android/build.gradle`:

```gradle
buildscript {
    ext.kotlin_version = '1.9.0'

    dependencies {
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}
```

2. **Set Minimum SDK Version**:

In `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        minSdkVersion 21  // Minimum supported
        targetSdkVersion 34
    }
}
```

3. **Verify Autolinking**:

The module should autolink automatically. To verify, check that `BrikWidgetPackage` is registered in your `MainApplication.kt` or `MainApplication.java`.

### Expo Managed Projects

#### Add Expo Plugin

1. **Install Expo Plugin** (if available):

```bash
pnpm add @brik/expo-plugin
```

2. **Update app.json**:

```json
{
  "expo": {
    "plugins": ["@brik/expo-plugin"]
  }
}
```

3. **Prebuild**:

```bash
npx expo prebuild
```

---

## Setting Up Widgets

### iOS Widget Setup

```bash
npx brik ios-setup --name WeatherWidget
```

This generates:
- Widget extension Swift files
- App Groups entitlements
- Timeline Provider with data sharing
- WidgetKit configuration

**Next Steps:**
1. Open your `.xcworkspace` in Xcode
2. Follow the configuration steps in [`docs/WIDGET_SETUP_GUIDE.md`](./docs/WIDGET_SETUP_GUIDE.md)

### Android Widget Setup

```bash
npx brik android-setup --name WeatherWidget
```

This generates:
- Glance widget Kotlin files
- Widget configuration XML
- SharedPreferences integration
- Widget receiver

**Next Steps:**
1. Follow the manual configuration steps in [`docs/WIDGET_SETUP_GUIDE.md`](./docs/WIDGET_SETUP_GUIDE.md)
2. Add required dependencies to `build.gradle`
3. Register widget receiver in `AndroidManifest.xml`

---

## Basic Usage

### Import and Use

```typescript
import { widgetManager } from '@brik/react-native';

// Update widget from anywhere in your app
await widgetManager.updateWidget('WeatherWidget', {
  temperature: 72,
  condition: 'Sunny',
  location: 'San Francisco'
});
```

### Using React Hook

```typescript
import { useWidgetManager } from '@brik/react-native';

function WeatherScreen() {
  const { updateWidget, isUpdating } = useWidgetManager('WeatherWidget');

  const handleUpdate = async () => {
    await updateWidget({
      temperature: 75,
      condition: 'Partly Cloudy'
    });
  };

  return (
    <Button
      onPress={handleUpdate}
      disabled={isUpdating}
      title="Update Widget"
    />
  );
}
```

---

## Troubleshooting

### iOS Issues

**Module not found:**
```bash
cd ios && pod install && cd ..
```

**Build errors:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

**Module 'BrikReactNative' not found:**
- Clean Xcode build folder (⌘⇧K)
- Delete DerivedData
- Rebuild

### Android Issues

**Module not linking:**
- Clean build: `cd android && ./gradlew clean && cd ..`
- Rebuild: `npx react-native run-android`

**Kotlin version conflicts:**
- Ensure `kotlin_version = '1.9.0'` in `android/build.gradle`

**Gradle sync failed:**
- Invalidate caches in Android Studio
- Sync project with Gradle files

### General Issues

**Command not found: brik**
```bash
# Install CLI globally (optional)
npm install -g @brik/cli

# Or use npx
npx brik --help
```

**TypeScript errors:**
```bash
# Rebuild TypeScript
pnpm build  # or npm run build
```

---

## Verification

### Test Native Module

```typescript
import { widgetManager } from '@brik/react-native';

// Check if widgets are supported
const supported = await widgetManager.areWidgetsSupported();
console.log('Widgets supported:', supported);

// Get App Group ID (iOS) or SharedPreferences name (Android)
const identifier = await widgetManager.getAppGroupIdentifier();
console.log('Storage identifier:', identifier);
```

### Test CLI Commands

```bash
# Check environment
npx brik doctor

# Scan for Brik components
npx brik scan

# Get help
npx brik --help
```

---

## Next Steps

- **Widget Setup**: See [`docs/WIDGET_SETUP_GUIDE.md`](./docs/WIDGET_SETUP_GUIDE.md) for complete widget setup instructions
- **Examples**: Check [`examples/WidgetExampleComponent.tsx`](./examples/WidgetExampleComponent.tsx) for usage examples
- **Live Activities**: See [`docs/LIVE_ACTIVITIES.md`](./docs/LIVE_ACTIVITIES.md) for Live Activities setup (iOS only)
- **API Reference**: See [`docs/WIDGET_SETUP_GUIDE.md#api-reference`](./docs/WIDGET_SETUP_GUIDE.md#api-reference) for complete API documentation

---

## Package Structure

When you install `@brik/react-native`, you get:

```
@brik/react-native/
├── dist/                   # Compiled TypeScript
│   └── src/
│       ├── index.js
│       ├── widget-manager.js
│       └── live-activities.js
├── ios/                    # iOS native module
│   ├── BrikWidgetManager.swift
│   ├── BrikWidgetManager.m
│   └── BrikLiveActivities.swift
├── android/                # Android native module
│   ├── build.gradle
│   └── src/main/
│       ├── AndroidManifest.xml
│       └── java/com/brik/
│           ├── BrikWidgetManager.kt
│           └── BrikWidgetPackage.kt
└── BrikReactNative.podspec # CocoaPods spec
```

---

## Minimum Required Files

For the package to work, you must have:

**iOS:**
- ✅ `BrikReactNative.podspec` - CocoaPods integration
- ✅ `ios/BrikWidgetManager.swift` - Widget manager
- ✅ `ios/BrikWidgetManager.m` - React Native bridge

**Android:**
- ✅ `android/build.gradle` - Gradle configuration
- ✅ `android/src/main/AndroidManifest.xml` - Manifest
- ✅ `android/src/main/java/com/brik/BrikWidgetManager.kt` - Widget manager
- ✅ `android/src/main/java/com/brik/BrikWidgetPackage.kt` - Module registration

**JavaScript:**
- ✅ `dist/src/index.js` - Main entry point
- ✅ `dist/src/widget-manager.js` - Widget manager API

All these files are included when you install the package from npm.

---

## Support

For issues and questions:
- **GitHub Issues**: https://github.com/brikjs/brik/issues
- **Documentation**: See `docs/` directory
- **Examples**: See `examples/` directory

---

## License

MIT © Brik
