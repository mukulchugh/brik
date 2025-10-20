# @brik/example-shared

Shared widgets and UI components for Brik example apps.

## Purpose

This package contains all the shared code used across Brik example applications:
- **brik-expo-app** (Expo + New Architecture)
- **brik-example-app** (React Native CLI + Old Architecture)
- Future example apps

By centralizing the code, we ensure:
- ✅ **Consistency**: All apps use identical widgets and UI
- ✅ **Maintainability**: Update once, apply everywhere
- ✅ **Testing**: Single source of truth for test implementations
- ✅ **DRY**: Don't Repeat Yourself

## What's Included

### Widgets

#### `WeatherWidget`
Complete weather widget with:
- Current temperature and condition
- 4-day forecast
- Refresh button with deep link
- Responsive design

#### `OrderTrackingActivity`
Live Activity for order tracking with:
- Lock screen view
- Dynamic Island (compact, minimal, expanded)
- Real-time status updates

### Components

#### `BrikDemoApp`
Shared demo app component with:
- Live Activities controls (Start/Update/End)
- Performance monitoring stats
- Widget storage demo
- Error handling
- Optional hot reload status

## Usage

### In Example Apps

```tsx
// Expo App
import { BrikDemoApp, WeatherWidget, OrderTrackingActivity } from '@brik/example-shared';

export default function App() {
  return (
    <BrikDemoApp
      title="Brik Expo App"
      enableHotReload={__DEV__}
      showHotReloadStatus={true}
    />
  );
}
```

```tsx
// React Native CLI App
import { BrikDemoApp, WeatherWidget, OrderTrackingActivity } from '@brik/example-shared';

export default function App() {
  return (
    <BrikDemoApp
      title="Brik Test App"
      enableHotReload={false}
      showHotReloadStatus={false}
    />
  );
}
```

### Widget Compilation

```bash
# Compile widgets from shared package
cd examples/brik-expo-app
npx brik build --platform all --as-widget ../../packages/brik-example-shared/src/widgets/
```

## Benefits

### For Developers
- Write widget once, use in all example apps
- Easier to maintain and update
- Consistent behavior across platforms

### For Testing
- Single test suite covers all apps
- Easier to validate features
- Reduced code duplication

### For Users
- Consistent examples across documentation
- Clear reference implementation
- Easy to copy and adapt

## Structure

```
@brik/example-shared/
├── src/
│   ├── widgets/
│   │   ├── WeatherWidget.tsx        # Weather widget
│   │   └── OrderTrackingActivity.tsx # Live Activity
│   ├── components/
│   │   └── BrikDemoApp.tsx          # Shared app component
│   └── index.ts                      # Public exports
├── package.json
├── tsconfig.json
└── README.md
```

## Development

```bash
# Type check
pnpm typecheck

# Used by example apps via workspace protocol
# No build step required (TypeScript source is used directly)
```

## Version

Versioned together with Brik core packages (currently v0.3.0).

## License

MIT © Mukul Chugh
