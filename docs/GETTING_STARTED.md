# Getting Started with Brik

Brik lets you build native iOS/Android widgets and Live Activities from React components.

## Installation

### React Native (Expo)

```bash
# Install packages
pnpm add @brik/react-native @brik/cli

# Add to app.json
{
  "plugins": ["@brik/expo-plugin"]
}
```

### React Native (Bare)

```bash
# Install packages
pnpm add @brik/react-native @brik/cli

# iOS: Add pod
cd ios && pod install
```

## Create Your First Widget

### 1. Create a Widget Component

Create `src/MyWidget.tsx`:

```tsx
import { BrikView, BrikText, BrikStack } from '@brik/react-native';

export function MyWidget() {
  return (
    <BrikView style={{ padding: 16, backgroundColor: '#FFFFFF', borderRadius: 12 }}>
      <BrikStack axis="vertical" style={{ gap: 8 }}>
        <BrikText style={{ fontSize: 18, fontWeight: '700' }}>
          Hello Brik!
        </BrikText>
        <BrikText style={{ fontSize: 14, color: '#666666' }}>
          Your first native widget
        </BrikText>
      </BrikStack>
    </BrikView>
  );
}
```

### 2. Generate Native Code

```bash
# For iOS
pnpm brik build --platform ios --as-widget

# For Android
pnpm brik build --platform android --as-widget

# For both
pnpm brik build --platform all --as-widget
```

This generates:
- **iOS**: `ios/brik/Generated/*.swift` + `ios/BrikWidget/BrikWidget.swift`
- **Android**: `android/brik/src/main/java/generated/*.kt`

### 3. Add Widget to Native Project

#### iOS (Xcode)

1. Open `ios/*.xcworkspace` in Xcode
2. File → New → Target → Widget Extension
3. Name it "BrikWidget"
4. Delete the template files
5. Add files from `ios/brik/Generated/` and `ios/BrikWidget/`
6. Build and run

#### Android (Android Studio)

1. Open `android/` in Android Studio
2. Add widget receiver to `AndroidManifest.xml`:

```xml
<receiver
    android:name="generated.MyWidgetReceiver"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/my_widget_info" />
</receiver>
```

3. Create `res/xml/my_widget_info.xml`
4. Build and run

## Create a Live Activity (iOS 16.1+)

### 1. Define Activity Component

Create `src/OrderActivity.tsx`:

```tsx
import { BrikView, BrikText, BrikProgressBar } from '@brik/react-native';

/** @brik-activity */
export function OrderTrackingActivity() {
  return {
    activityType: 'OrderTracking',

    attributes: {
      static: {
        orderId: 'string',
        merchantName: 'string',
      },
      dynamic: {
        status: 'string',
        progress: 'number',
        eta: 'number',
      }
    },

    regions: {
      lockScreen: (
        <BrikView style={{ padding: 16 }}>
          <BrikText>Order #{orderId} from {merchantName}</BrikText>
          <BrikProgressBar progress={progress} />
          <BrikText>{status} • ETA: {eta} min</BrikText>
        </BrikView>
      ),

      dynamicIsland: {
        compact: <BrikProgressBar progress={progress} />,
        minimal: <BrikText>🍕</BrikText>,
        expanded: (
          <BrikView style={{ padding: 12 }}>
            <BrikText>Order #{orderId}</BrikText>
            <BrikProgressBar progress={progress} />
            <BrikText>{status} • {eta} min</BrikText>
          </BrikView>
        )
      }
    }
  };
}
```

### 2. Generate Activity Code

```bash
pnpm brik build --platform ios
```

This auto-detects `@brik-activity` and generates:
- `ios/BrikActivities/OrderTrackingActivity.swift`

### 3. Control from JavaScript

```tsx
import { Brik } from '@brik/react-native';
import React from 'react';
import { Button } from 'react-native';

export function OrderScreen() {
  const [activityId, setActivityId] = React.useState(null);

  const startTracking = async () => {
    const activity = await Brik.startActivity({
      activityType: 'OrderTracking',
      attributes: {
        static: { orderId: '12345', merchantName: 'Acme Pizza' },
        dynamic: { status: 'preparing', progress: 0.2, eta: 20 }
      }
    });
    setActivityId(activity.id);
  };

  const updateStatus = async () => {
    await Brik.updateActivity(activityId, {
      dynamic: { status: 'delivering', progress: 0.8, eta: 5 }
    });
  };

  const complete = async () => {
    await Brik.endActivity(activityId);
  };

  return (
    <>
      <Button title="Start Order" onPress={startTracking} />
      <Button title="Update Status" onPress={updateStatus} />
      <Button title="Complete" onPress={complete} />
    </>
  );
}
```

## Available Components

- `BrikView` - Container
- `BrikText` - Text display
- `BrikStack` - Horizontal/vertical layout
- `BrikButton` - Tappable button
- `BrikImage` - Image from URL
- `BrikSpacer` - Flexible space
- `BrikProgressBar` - Progress indicator
- `BrikList` - Scrollable list (partial support)

## CLI Commands

```bash
# Scan for Brik components
pnpm brik scan

# Build for specific platform
pnpm brik build --platform ios
pnpm brik build --platform android
pnpm brik build --platform all

# Mark as widget
pnpm brik build --platform ios --as-widget

# Check environment
pnpm brik doctor

# Clean generated files
pnpm brik clean

# iOS widget setup helper
pnpm brik ios-setup
```

## Next Steps

- **Widgets:** See example app in `examples/rn-expo-app`
- **Live Activities:** See `docs/LIVE_ACTIVITIES.md`
- **Styling:** See `docs/STYLING_AND_ACTIONS.md`
- **Architecture:** See `docs/ARCHITECTURE.md`






