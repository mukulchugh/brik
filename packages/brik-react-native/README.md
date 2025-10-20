# @brik/react-native

React Native bridge for Brik - Build native iOS and Android widgets with React.

## Features

- ✅ **iOS Widgets** (WidgetKit) - iOS 14+
- ✅ **Android Widgets** (Jetpack Glance) - Android 12+
- ✅ **Live Activities** (ActivityKit) - iOS 16.1+
- ✅ **Dynamic Island** - iPhone 14 Pro+
- ✅ **Type-safe APIs** - Full TypeScript support
- ✅ **React hooks** - `useWidgetManager`, `useBrikHotReload`
- ✅ **Performance monitoring** - Built-in telemetry

## Installation

```bash
# Install package
pnpm add @brik/react-native

# iOS: Install CocoaPods dependencies
cd ios && pod install && cd ..

# Android: Auto-linked via React Native
```

## Quick Start

### Update Home Screen Widgets

```typescript
import { widgetManager } from '@brik/react-native';

// Update widget data (works on both iOS and Android)
await widgetManager.updateWidget('WeatherWidget', {
  temperature: 72,
  condition: 'Sunny',
  location: 'San Francisco'
});
```

### Live Activities

```typescript
import { startActivity, updateActivity, endActivity } from '@brik/react-native';

// Start a Live Activity
const activity = await startActivity({
  activityType: 'OrderTracking',
  attributes: {
    static: { orderId: '12345' },
    dynamic: { status: 'preparing', eta: 20 }
  }
});

// Update in real-time
await updateActivity(activity.id, {
  dynamic: { status: 'delivering', eta: 5 }
});

// End activity
await endActivity(activity.id);
```

### React Hooks

```typescript
import { useWidgetManager } from '@brik/react-native';

function WeatherScreen() {
  const { updateWidget, isUpdating } = useWidgetManager('WeatherWidget');

  const handleUpdate = async () => {
    await updateWidget({
      temperature: 75,
      condition: 'Cloudy'
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

## API Reference

### Widget Manager

```typescript
class WidgetManager {
  // Update widget data
  updateWidget(widgetId: string, data: WidgetData): Promise<void>;

  // Update specific widget kind (iOS only)
  updateWidgetKind(widgetKind: string): Promise<void>;

  // Get current widget data
  getWidgetData(widgetId: string): Promise<WidgetData | null>;

  // Clear widget data
  clearWidgetData(widgetId: string): Promise<void>;

  // Check if widgets are supported
  areWidgetsSupported(): Promise<boolean>;

  // Get App Group identifier (iOS only, for debugging)
  getAppGroupIdentifier(): Promise<string | null>;

  // Update multiple widgets at once
  updateMultiple(updates: Record<string, WidgetData>): Promise<void>;
}

// Singleton instance
export const widgetManager: WidgetManager;
```

### Live Activities

```typescript
// Start a Live Activity
function startActivity<TStatic, TDynamic>(
  options: StartActivityOptions<TStatic, TDynamic>
): Promise<Activity>;

// Update an active Live Activity
function updateActivity<TDynamic>(
  activityId: string,
  options: UpdateActivityOptions<TDynamic>
): Promise<void>;

// End a Live Activity
function endActivity(
  activityId: string,
  dismissalPolicy?: 'immediate' | 'default' | 'after'
): Promise<void>;

// Get all active Live Activities
function getActiveActivities(): Promise<Activity[]>;

// Check if Live Activities are supported
function areActivitiesSupported(): Promise<boolean>;

// Get push token for remote updates
function getPushToken(activityId: string): Promise<string | null>;
```

### React Hooks

```typescript
// Hook for widget updates
function useWidgetManager(widgetId: string): {
  updateWidget: (data: WidgetData, options?: WidgetUpdateOptions) => Promise<void>;
  clearWidget: () => Promise<void>;
  isUpdating: boolean;
};

// Hook for hot reload in development
function useBrikHotReload(config?: {
  enabled?: boolean;
  reconnectInterval?: number;
  onReload?: () => void;
  onError?: (error: Error) => void;
}): void;
```

### UI Components

```typescript
// Available Brik components for widgets
import {
  BrikText,
  BrikView,
  BrikButton,
  BrikImage,
  BrikStack,
  BrikSpacer,
  BrikProgressBar,
  BrikList
} from '@brik/react-native';
```

## Configuration

### iOS Setup

1. **Create Widget Extension**:
   ```bash
   npx brik ios-setup --name WeatherWidget
   ```

2. **Configure App Groups**:
   - Add App Groups capability in Xcode
   - Use identifier: `group.{bundle-id}.widgets`

3. **Build widget code**:
   ```bash
   npx brik build --platform ios --as-widget
   ```

### Android Setup

1. **Create Widget**:
   ```bash
   npx brik android-setup --name WeatherWidget
   ```

2. **Build widget code**:
   ```bash
   npx brik build --platform android --as-widget
   ```

## Platform Support

| Feature | iOS | Android |
|---------|-----|---------|
| Home Screen Widgets | ✅ 14+ | ✅ 12+ |
| Lock Screen Widgets | ✅ 16+ | ❌ |
| Live Activities | ✅ 16.1+ | ❌ |
| Dynamic Island | ✅ 14 Pro+ | ❌ |
| Widget Update API | ✅ | ✅ |
| Deep Linking | ✅ | ✅ |
| Hot Reload | ✅ | ✅ |

## Native Module Details

### iOS

**Native Modules**:
- `BrikWidgetManager` - Widget data management via UserDefaults + App Groups
- `BrikLiveActivities` - ActivityKit integration for Live Activities

**Technologies**:
- WidgetKit for widgets
- ActivityKit for Live Activities
- Swift 5.0+

### Android

**Native Module**:
- `BrikWidgetManager` - Widget data management via SharedPreferences

**Technologies**:
- Jetpack Glance for widgets
- Jetpack Compose for UI
- Kotlin coroutines

## Performance Monitoring

```typescript
import { performanceMonitor, telemetry } from '@brik/react-native';

// Start timing an operation
performanceMonitor.startTimer('widget-update');

// End timing and record metric
const duration = performanceMonitor.endTimer('widget-update');

// Get performance stats
const stats = performanceMonitor.getStats('widget-update');
console.log(`Avg: ${stats.avg}ms, P95: ${stats.p95}ms`);

// Track custom events
telemetry.track('widget-update-success', { widgetId: 'WeatherWidget' });

// Subscribe to telemetry events
const unsubscribe = telemetry.onEvent((event) => {
  console.log('Telemetry:', event);
});
```

## Troubleshooting

### iOS

**Widgets not updating?**
- Verify App Groups are configured in both main app and widget extension
- Check that bundle IDs match
- Ensure widget extension is added to the app target

**Live Activities not appearing?**
- Check iOS version (16.1+ required)
- Verify `NSSupportsLiveActivities` is `YES` in Info.plist
- Device must support Dynamic Island for iPhone 14 Pro+ features

### Android

**Widgets not showing?**
- Verify widget is registered in AndroidManifest.xml
- Check that Glance dependencies are included
- Ensure minimum SDK is 31 (Android 12)

**Widget not updating?**
- Check SharedPreferences key matches widget ID
- Verify BrikWidgetManager is accessible
- Check logs for serialization errors

## Examples

See the [`examples`](../../examples/) directory for complete working examples:
- [`brik-expo-app`](../../examples/brik-expo-app) - Expo app with weather widget
- [`brik-example-app`](../../examples/brik-example-app) - React Native CLI app

## Documentation

- [Main README](../../README.md)
- [Widget Setup Guide](../../docs/WIDGET_SETUP_GUIDE.md)
- [Live Activities Guide](../../docs/LIVE_ACTIVITIES_GUIDE.md)
- [Architecture](../../docs/ARCHITECTURE.md)

## License

MIT © Mukul Chugh

## Status

**v0.3.0** - Beta release

- ✅ Core functionality complete
- ✅ Production-ready native modules
- ⏳ Comprehensive testing in progress
- ⏳ Documentation being finalized

See [FINAL_RELEASE_VERIFICATION.md](../../FINAL_RELEASE_VERIFICATION.md) for detailed technical assessment.
