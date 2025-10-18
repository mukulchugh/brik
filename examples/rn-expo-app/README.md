# Brik Expo Example App

This example demonstrates how to build native iOS and Android widgets using Brik with Expo.

## What's Included

### Widget Examples

1. **AdvancedDemo** (`src/AdvancedDemo.tsx`)
   - Profile header with clickable avatar
   - Stats grid (followers/following/posts)
   - Progress bar with percentage
   - Action buttons with deep links
   - Complete styling (shadows, borders, colors)

2. **BrikDemo** (`src/BrikDemo.tsx`)
   - Basic widget components
   - Image loading
   - Text styling
   - Button with action

3. **WidgetDemo** (`src/WidgetDemo.tsx`)
   - Additional widget patterns

4. **SimpleTest** (`src/SimpleTest.tsx`)
   - Minimal example for testing

## Quick Start

### Development Preview

1. **Install dependencies:**

```bash
pnpm install
```

2. **Start Expo:**

```bash
pnpm start
```

3. **Run on device/simulator:**

```bash
# iOS
pnpm ios

# Android
pnpm android
```

You'll see all widget examples rendered as React Native components for instant preview and iteration.

### Build Native Widgets

1. **Generate native code:**

```bash
pnpm build:native --as-widget
```

This will:

- Parse all `*.tsx` files for Brik components
- Generate SwiftUI code in `ios/brik/Generated/`
- Generate Glance widget code in `android/brik/.../generated/`

2. **Check generated files:**

```bash
# iOS SwiftUI
cat ios/brik/Generated/src_AdvancedDemo_tsx.swift

# Android Glance
cat android/brik/src/main/java/generated/src_AdvancedDemo_tsx.kt
```

### Deploy Widgets

#### iOS Widget Setup

1. Open `ios/BrikExpoExample.xcworkspace` in Xcode
2. The WidgetKit extension target already exists as `BrikWidget`
3. The generated SwiftUI views are in `ios/brik/Generated/`
4. Update `BrikWidget.swift` to use your generated view:

```swift
struct BrikWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "BrikWidget", provider: Provider()) { entry in
            src_AdvancedDemo_tsx() // Use your generated view
        }
        .configurationDisplayName("My Widget")
        .description("Built with Brik")
        .supportedFamilies([.systemMedium])
    }
}
```

5. Build and run the widget extension
6. Add widget to home screen

#### Android Widget Setup

1. Open `android/` in Android Studio
2. The Glance dependency is already configured
3. The widget receiver is in `android/brik/.../generated/`
4. Ensure `AndroidManifest.xml` has the receiver registered:

```xml
<receiver
    android:name=".generated.src_AdvancedDemo_tsxReceiver"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/brik_widget_info" />
</receiver>
```

5. Build and install APK
6. Add widget from launcher

## Project Structure

```
rn-expo-app/
├── src/
│   ├── App.tsx              # Main app with all examples
│   ├── AdvancedDemo.tsx     # Full-featured widget
│   ├── BrikDemo.tsx         # Basic widget
│   ├── WidgetDemo.tsx       # Widget patterns
│   └── SimpleTest.tsx       # Minimal test
├── ios/
│   ├── brik/Generated/      # Generated SwiftUI code
│   └── BrikWidget/          # WidgetKit extension
├── android/
│   └── brik/.../generated/  # Generated Glance code
└── package.json

```

## CLI Commands

```bash
# Scan for Brik components
node ../../packages/brik-cli/dist/index.js scan

# Build native code (development)
node ../../packages/brik-cli/dist/index.js build --platform all

# Build as widgets (with metadata)
node ../../packages/brik-cli/dist/index.js build --platform all --as-widget

# Build iOS only
node ../../packages/brik-cli/dist/index.js build --platform ios --as-widget

# Build Android only
node ../../packages/brik-cli/dist/index.js build --platform android --as-widget

# Check environment
node ../../packages/brik-cli/dist/index.js doctor

# Clean generated files
node ../../packages/brik-cli/dist/index.js clean
```

## Creating Your Own Widget

1. **Create a new component:**

```tsx
// src/MyWidget.tsx
import { BrikView, BrikText, BrikButton } from '@brik/react-native';

/** @brik */
export function MyWidget() {
  return (
    <BrikView style={{ padding: 16 }}>
      <BrikText style={{ fontSize: 20, fontWeight: '700' }}>My Widget</BrikText>
      <BrikButton
        label="Open App"
        action={{
          type: 'deeplink',
          url: 'myapp://home',
        }}
      />
    </BrikView>
  );
}
```

2. **Import in App.tsx** for preview
3. **Run build:**

```bash
pnpm build:native --as-widget
```

4. Generated files will appear in `ios/brik/Generated/` and `android/brik/.../generated/`

## Features Demonstrated

### Styling

- Layouts (padding, margin, gap, flexDirection)
- Typography (fontSize, fontWeight, color, textAlign)
- Colors (backgroundColor, hex colors with parsing)
- Borders (borderRadius, individual corners)
- Shadows (shadowColor, shadowOpacity, shadowRadius, shadowOffset)

### Components

- BrikView - Containers
- BrikText - Text with styling
- BrikButton - Interactive buttons
- BrikImage - Remote images
- BrikStack - Horizontal/vertical layouts
- BrikProgressBar - Progress indicators
- BrikSpacer - Flexible spacing

### Actions

- Deep links to app screens
- Refresh widget
- Custom actions
- Parameter passing

## Troubleshooting

### Build Errors

- Ensure all packages are built: `pnpm build` from repo root
- Check for TypeScript errors in your components
- Validate IR with: `pnpm brik scan`

### iOS Widget Not Showing

- Verify widget extension is added to Xcode project
- Check that generated view name matches in BrikWidget.swift
- Rebuild widget extension target
- Check console for errors

### Android Widget Not Showing

- Verify Glance dependency in build.gradle
- Check receiver registration in AndroidManifest.xml
- Ensure XML provider file exists in res/xml/
- Check Logcat for errors

## Next Steps

- Explore the generated native code
- Customize widget styling
- Add your own actions
- Test on real devices
- See `docs/STYLING_AND_ACTIONS.md` for complete API reference

## Learn More

- [Brik Documentation](../../docs/)
- [Styling Guide](../../docs/STYLING_AND_ACTIONS.md)
- [Implementation Plan](../../IMPLEMENTATION_PLAN.md)
