# Widget Setup Guide

Complete guide for setting up home screen widgets with Brik on iOS and Android.

## Overview

Brik enables you to create home screen widgets that display data from your React Native app using a unified API. The same TypeScript code updates widgets on both iOS (using WidgetKit) and Android (using Jetpack Glance).

## Features

- ✅ **Cross-platform API**: Same TypeScript code for iOS and Android
- ✅ **Automatic data syncing**: Updates widgets from React Native
- ✅ **Native performance**: Uses WidgetKit (iOS) and Glance (Android)
- ✅ **Type-safe**: Full TypeScript support
- ✅ **CLI automation**: Automated setup commands

---

## Prerequisites

### iOS
- iOS 14.0+
- Xcode 12.0+
- CocoaPods

### Android
- Android 12+ (API 31+) recommended
- Android Studio
- Gradle 7.0+

---

## Installation

### 1. Install Brik Packages

```bash
npm install @brik/react-native @brik/cli
# or
pnpm add @brik/react-native @brik/cli
```

### 2. Install Native Dependencies

#### iOS

Add to your Podfile if not already present:
```ruby
pod 'BrikReactNative', :path => '../node_modules/@brik/react-native'
```

Then run:
```bash
cd ios && pod install
```

#### Android

The native module will be auto-linked by React Native.

---

## iOS Setup

### Step 1: Run Setup Command

```bash
pnpm brik ios-setup --name WeatherWidget
```

This generates:
- `ios/WeatherWidget/WeatherWidget.swift` - Widget implementation
- `ios/WeatherWidget/Info.plist` - Widget configuration
- `ios/WeatherWidget/WeatherWidget.entitlements` - App Groups configuration
- `ios/YourApp/YourApp.entitlements` - Main app App Groups configuration
- `ios/WeatherWidget/Assets.xcassets` - Widget assets

### Step 2: Configure Xcode

1. Open `ios/YourApp.xcworkspace` in Xcode

2. **Create Widget Extension Target**:
   - File → New → Target
   - Choose "Widget Extension"
   - Name: `WeatherWidget` (must match --name parameter)
   - Click "Activate" when prompted

3. **Delete Generated Files**:
   - Delete the auto-generated `WeatherWidget` folder
   - Keep the generated files from our CLI

4. **Add Entitlements**:
   - Select widget target in Project Navigator
   - Build Settings → Code Signing Entitlements
   - Set to: `WeatherWidget/WeatherWidget.entitlements`

   - Select main app target
   - Build Settings → Code Signing Entitlements
   - Set to: `YourApp/YourApp.entitlements`

5. **Add Generated Code** (if using Brik code generation):
   - Add files from `ios/brik/Generated/` to widget target
   - Select each file → File Inspector → Target Membership → Check WeatherWidget

6. **Build Widget Extension**:
   - Select WeatherWidget scheme
   - Build and run (⌘R)

### Step 3: Verify App Groups

The App Group ID format: `group.{bundle_id}.widgets`

Example: If your app bundle is `com.company.myapp`, the App Group is `group.com.company.myapp.widgets`

---

## Android Setup

### Step 1: Run Setup Command

```bash
pnpm brik android-setup --name WeatherWidget
```

This generates:
- `android/app/src/main/java/{package}/widgets/WeatherWidget.kt` - Glance widget
- `android/app/src/main/res/xml/weatherwidget_info.xml` - Widget configuration
- `android/app/src/main/res/layout/widget_loading.xml` - Loading placeholder

### Step 2: Add Dependencies

Add to `android/app/build.gradle`:

```gradle
dependencies {
    // ... existing dependencies

    implementation "androidx.glance:glance-appwidget:1.0.0"
    implementation "androidx.glance:glance-material3:1.0.0"
}
```

### Step 3: Register Widget in Manifest

Add to `android/app/src/main/AndroidManifest.xml` inside `<application>`:

```xml
<receiver
    android:name=".widgets.WeatherWidgetReceiver"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/weatherwidget_info" />
</receiver>
```

### Step 4: Add String Resources

Add to `android/app/src/main/res/values/strings.xml`:

```xml
<string name="widget_description">Weather widget powered by Brik</string>
```

### Step 5: Add Widget Preview (Optional)

Create a preview image: `android/app/src/main/res/drawable/widget_preview.png` (180x110dp minimum)

### Step 6: Build and Test

```bash
npx react-native run-android
```

Then long-press home screen → Widgets → Find your widget

---

## Usage in React Native

### Basic Usage

```typescript
import { widgetManager } from '@brik/react-native';

// Update widget data
await widgetManager.updateWidget('WeatherWidget', {
  temperature: 72,
  condition: 'Sunny',
  location: 'San Francisco',
  humidity: 65,
  windSpeed: 10
});
```

### Using React Hook

```typescript
import { useWidgetManager } from '@brik/react-native';

function WeatherScreen() {
  const { updateWidget, isUpdating } = useWidgetManager('WeatherWidget');

  const handleWeatherUpdate = async (data) => {
    await updateWidget({
      temperature: data.temp,
      condition: data.condition,
      location: data.location
    });
  };

  return (
    <Button
      onPress={() => handleWeatherUpdate(weatherData)}
      disabled={isUpdating}
      title="Update Widget"
    />
  );
}
```

### Update Multiple Widgets

```typescript
await widgetManager.updateMultiple({
  'WeatherWidget': { temp: 72, condition: 'Sunny' },
  'CalendarWidget': { events: [...] },
  'StatsWidget': { steps: 10000, calories: 500 }
});
```

### Clear Widget Data

```typescript
await widgetManager.clearWidgetData('WeatherWidget');
```

### Check Platform Support

```typescript
const supported = await widgetManager.areWidgetsSupported();
if (supported) {
  // Update widgets
}
```

---

## Advanced Configuration

### Custom App Group ID (iOS)

```bash
pnpm brik ios-setup --name MyWidget --app-group group.com.custom.id
```

### Custom Package Name (Android)

```bash
pnpm brik android-setup --name MyWidget --package-name com.custom.package
```

### Widget Update Options

```typescript
await widgetManager.updateWidget('WeatherWidget', data, {
  immediate: true,  // Force immediate update (iOS only)
  ttl: 3600        // Time-to-live in seconds
});
```

---

## How It Works

### iOS Data Flow

```
React Native widgetManager.updateWidget()
    ↓
BrikWidgetManager.swift
    ↓
UserDefaults (App Group: group.{bundle}.widgets)
    ↓
WidgetKit Timeline Provider reads UserDefaults
    ↓
Widget UI displays data
```

**Storage**:
- **Location**: UserDefaults with App Group suite name
- **Key Pattern**: `widget_data_{widgetId}`
- **Format**: JSON string

### Android Data Flow

```
React Native widgetManager.updateWidget()
    ↓
BrikWidgetManager.kt
    ↓
SharedPreferences (BrikWidgetPrefs)
    ↓
Glance Widget provideGlance() reads SharedPreferences
    ↓
Widget UI displays data
```

**Storage**:
- **Location**: SharedPreferences named "BrikWidgetPrefs"
- **Key Pattern**: `widget_data_{widgetId}`
- **Format**: JSON string

---

## Troubleshooting

### iOS

**Widget not appearing in gallery**:
- Verify App Groups entitlements are configured
- Check that both app and widget extension have matching App Group IDs
- Rebuild both targets
- Restart iOS Simulator or device

**Widget shows "Waiting for data"**:
- Call `widgetManager.updateWidget()` from your React Native app
- Check console for `[Brik]` error messages
- Verify App Group ID matches in both Swift files

**Build errors**:
- Clean build folder (⌘⇧K)
- Delete DerivedData
- `cd ios && pod install`

### Android

**Widget not in picker**:
- Verify receiver is registered in AndroidManifest.xml
- Check package name matches
- Rebuild app

**Widget shows loading**:
- Call `widgetManager.updateWidget()` from React Native
- Check Logcat for `[BrikWidgetManager]` messages
- Verify SharedPreferences name is "BrikWidgetPrefs"

**Gradle sync errors**:
- Verify Glance dependencies are added
- Clean and rebuild: `cd android && ./gradlew clean`

---

## Examples

See `examples/` directory for complete working examples:
- `examples/BrikTestApp/` - React Native CLI example
- `examples/rn-expo-app/` - Expo example

---

## API Reference

### WidgetManager

#### `updateWidget(widgetId: string, data: WidgetData, options?: WidgetUpdateOptions): Promise<void>`

Updates widget data.

**Parameters**:
- `widgetId`: Unique widget identifier
- `data`: Object with widget data
- `options`: Optional update options

**Example**:
```typescript
await widgetManager.updateWidget('WeatherWidget', {
  temperature: 72,
  condition: 'Sunny'
});
```

#### `getWidgetData(widgetId: string): Promise<WidgetData | null>`

Retrieves current widget data.

#### `clearWidgetData(widgetId: string): Promise<void>`

Clears widget data.

#### `areWidgetsSupported(): Promise<boolean>`

Checks if widgets are supported on the current device.

#### `getAppGroupIdentifier(): Promise<string | null>`

Gets the App Group ID (iOS) or SharedPreferences name (Android) for debugging.

### useWidgetManager Hook

```typescript
const {
  updateWidget,
  clearWidget,
  isUpdating
} = useWidgetManager(widgetId);
```

---

## Next Steps

- Customize generated widget UI code
- Add multiple widget sizes (small, medium, large)
- Implement widget configuration screens
- Add deep links from widgets to app

## Support

For issues and questions:
- GitHub Issues: https://github.com/your-org/brik/issues
- Documentation: See `WIDGET_IMPLEMENTATION_STATUS.md` for implementation details
