# Brik — Live Activities, Widgets & Dynamic Island with React

[![npm](https://img.shields.io/npm/v/@brik/react-native)](https://www.npmjs.com/package/@brik/react-native) [![CI](https://github.com/brikjs/brik/actions/workflows/ci.yml/badge.svg)](https://github.com/brikjs/brik/actions/workflows/ci.yml) [![codecov](https://img.shields.io/badge/codecov-pending-blue)](https://codecov.io/) [![license](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

**v0.2.0 - BETA** ⚠️ **Important**: See [Current Limitations](#-current-limitations-beta-status) before using

Build native iOS/Android widgets and Live Activities from a single React codebase. No Swift/Kotlin, no Xcode/Android Studio, and no extra JS runtime.

- ⚡ Live Activities: Real-time updates on lock screen & Dynamic Island
- 🏠 Native widgets: iOS WidgetKit + Android Glance
- 🔗 Deep linking: Open app/screens with parameters from any widget tap
- 📱 Full platform support: Home screen, lock screen, Dynamic Island
- ✻ AI-agent friendly: Deterministic codegen, typed IR, simple APIs
- 🚀 @Expo + React Native ready: Works in managed and bare projects

## Supported surfaces

**iOS (Fully Supported):**
- ✅ Home Screen Widgets (WidgetKit) - iOS 14+
- ✅ Lock Screen Widgets (WidgetKit) - iOS 16+
- ✅ Live Activities (ActivityKit) - iOS 16.1+
- ✅ Dynamic Island - iPhone 14 Pro+
- 🔜 watchOS Widgets - Coming in v0.4.0

**Android (Fully Supported):**
- ✅ Home Screen Widgets (Glance) - Android 12+

**Development:**
- ✅ React Native preview components for testing

## How it works

JSX/TSX → IR → platform code

- IR validated with Zod, compiled to SwiftUI (iOS) and Glance/Compose (Android)
- CLI + Expo plugin run codegen and wire platform projects

## Quickstart

```bash
pnpm add @brik/react-native @brik/cli

# Expo (app.json)
# { "plugins": ["@brik/expo-plugin"] }

# Generate native code
pnpm brik build --platform all --as-widget
```

## Live Activities Example

```tsx
/** @brik-activity */
export function OrderTrackingActivity() {
  return {
    activityType: 'OrderTracking',
    attributes: {
      static: { orderId: 'string', merchantName: 'string' },
      dynamic: { status: 'string', eta: 'number', progress: 'number' }
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
        expanded: <BrikView>{/* Full UI */}</BrikView>
      }
    }
  };
}
```

Control from JavaScript:
```tsx
import { Brik } from '@brik/react-native';

// Start activity
const activity = await Brik.startActivity({
  activityType: 'OrderTracking',
  attributes: {
    static: { orderId: '12345', merchantName: 'Acme Pizza' },
    dynamic: { status: 'preparing', eta: 20, progress: 0.2 }
  }
});

// Update in real-time
await Brik.updateActivity(activity.id, {
  dynamic: { status: 'delivering', eta: 5, progress: 0.9 }
});

// End activity
await Brik.endActivity(activity.id);
```

## Deep links and actions

```tsx
<BrikButton label="Open details" action={{ type: 'deeplink', url: 'myapp://details/42' }} />
```

## ⚠️ Current Limitations (Beta Status)

**Brik is in active development.** While the code generation and architecture are solid, please be aware:

### What Works ✅
- Code generation (JSX → SwiftUI/Glance)
- Widget compilation and building
- JavaScript API interfaces
- Development workflow

### Known Limitations ⚠️
- **Live Activities Native Module**: Currently a stub implementation. The Swift native module (`BrikLiveActivities.swift`) returns mock data and does not perform actual ActivityKit operations on device. **Live Activities will not function on real iOS devices** until this is implemented (planned for v0.2.1).
- **Test Coverage**: Minimal test coverage (~0%). Integration and device testing needed.
- **Device Testing**: Limited validation on physical devices.

### Recommended Use
- ✅ Experimentation and prototyping
- ✅ Learning the architecture
- ✅ Contributing to development
- ❌ Production applications (not yet)

See [`PROJECT_REVIEW.md`](./PROJECT_REVIEW.md) for detailed assessment.

---

## Documentation

- **Project Review:** `PROJECT_REVIEW.md` - Comprehensive assessment and validation
- **Getting Started:** `docs/GETTING_STARTED.md`
- **Live Activities:** `docs/LIVE_ACTIVITIES.md` (Code generation complete, native module pending)
- **Validation Report:** `VALIDATION_REPORT.md` - Confirms real native widget generation
- **Architecture:** `docs/ARCHITECTURE.md`
