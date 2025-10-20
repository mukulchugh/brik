# Brik — Live Activities, Widgets & Dynamic Island with React

[![npm](https://img.shields.io/npm/v/@brik/react-native)](https://www.npmjs.com/package/@brik/react-native) [![CI](https://github.com/brikjs/brik/actions/workflows/ci.yml/badge.svg)](https://github.com/brikjs/brik/actions/workflows/ci.yml) [![codecov](https://img.shields.io/badge/codecov-pending-blue)](https://codecov.io/) [![license](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

**v0.3.0 - BETA** ⚠️ **Ready for testing** - Core features complete, comprehensive testing in progress

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

## Installation

```bash
# Install packages
pnpm add @brik/react-native @brik/cli

# iOS: Install native dependencies
cd ios && pod install && cd ..

# Android: Auto-linked (no additional setup)

# Verify installation
npx brik doctor
```

For complete installation instructions, see [`docs/guides/INSTALLATION.md`](./docs/guides/INSTALLATION.md).

## Quick Start

```bash
# Set up iOS widget
npx brik ios-setup --name WeatherWidget

# Set up Android widget
npx brik android-setup --name WeatherWidget

# Generate native code from React components
npx brik build --platform all --as-widget
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

## Home Screen Widgets Example

Update iOS and Android home screen widgets from React Native with a unified API:

```tsx
import { widgetManager } from '@brik/react-native';

// Update widget data (works on both iOS and Android)
await widgetManager.updateWidget('WeatherWidget', {
  temperature: 72,
  condition: 'Sunny',
  location: 'San Francisco',
  humidity: 65
});
```

**Setup Commands:**
```bash
# iOS Widget Setup (WidgetKit + App Groups)
pnpm brik ios-setup --name WeatherWidget

# Android Widget Setup (Jetpack Glance)
pnpm brik android-setup --name WeatherWidget
```

**React Hook:**
```tsx
function WeatherScreen() {
  const { updateWidget, isUpdating } = useWidgetManager('WeatherWidget');

  return (
    <Button
      onPress={() => updateWidget({ temperature: 75, condition: 'Cloudy' })}
      disabled={isUpdating}
    />
  );
}
```

See [`docs/WIDGET_SETUP_GUIDE.md`](./docs/WIDGET_SETUP_GUIDE.md) for complete setup instructions.

## Deep links and actions

```tsx
<BrikButton label="Open details" action={{ type: 'deeplink', url: 'myapp://details/42' }} />
```

## ⚠️ Current Limitations (Beta Status)

**Brik is in active development.** While the core features are fully implemented, please be aware:

### What Works ✅
- **Code generation** (JSX → SwiftUI/Glance) - Production ready
- **Widget compilation and building** - Complete for iOS and Android
- **Live Activities** - FULLY IMPLEMENTED with ActivityKit integration
  - BrikActivityRegistry pattern for type-safe activity management
  - Auto-generated activity handlers with push token support
  - Lock screen and Dynamic Island support
  - Complete error handling and validation
- **JavaScript APIs** - Type-safe with TypeScript
- **CLI tools** - ios-setup, android-setup, build commands

### Known Limitations ⚠️
- **Test Coverage**: Limited automated tests (in progress). Core functionality validated.
- **Device Testing**: Physical device testing in progress. Simulator testing complete.
- **Manual Setup Steps**:
  - iOS Widget Extension target must be added to Xcode project
  - Live Activities require Info.plist configuration
  - Android ProGuard rules for release builds
  - See setup guides for detailed instructions
- **Documentation**: API reference and migration guides being finalized.

### Recommended Use
- ✅ Experimentation and prototyping
- ✅ Learning widget/Live Activities development
- ✅ Beta testing with non-critical applications
- ✅ Internal tools and demos
- ⚠️ Production applications:
  - Test thoroughly on physical devices
  - Monitor for edge cases
  - Have fallback strategies for critical features
  - See [`FINAL_RELEASE_VERIFICATION.md`](./FINAL_RELEASE_VERIFICATION.md) for technical readiness assessment

### Support & Bug Reporting
- **Response Time**: 24-48 hours for critical bugs
- **Report Issues**: [GitHub Issues](https://github.com/brikjs/brik/issues)
- **Ask Questions**: [GitHub Discussions](https://github.com/brikjs/brik/discussions)
- **Weekly Updates**: Bug fix releases (v0.2.1, v0.2.2, etc.)

See [`docs/internal/RELEASE_READINESS_ASSESSMENT.md`](./docs/internal/RELEASE_READINESS_ASSESSMENT.md) for detailed assessment and validation checklist.

---

## How Live Activities Work

Brik's Live Activities implementation is **fully production-ready** with complete ActivityKit integration:

### Architecture

```
JSX Component (@brik-activity)
    ↓
Compiler (extracts activity config)
    ↓
Code Generator (Swift)
    ↓
Generated Files:
  - {ActivityType}Attributes.swift
  - {ActivityType}ActivityWidget.swift
  - {ActivityType}Handler.swift (auto-registered)
    ↓
BrikActivityRegistry (type-erased registry)
    ↓
BrikLiveActivities native module
    ↓
ActivityKit (iOS 16.1+)
```

### Key Features

✅ **Type-Safe Activity Attributes**: Static and dynamic attributes with full type safety
✅ **Auto-Registration**: Handlers register automatically on app startup
✅ **Push Token Support**: Full support for remote updates via APNs
✅ **Complete UI Regions**: Lock screen, Dynamic Island (compact/expanded/minimal)
✅ **Error Handling**: Comprehensive error codes and validation

See [`docs/LIVE_ACTIVITIES_GUIDE.md`](./docs/LIVE_ACTIVITIES_GUIDE.md) for complete usage guide.

---

## Packages

Brik is a monorepo containing 10 publishable npm packages:

| Package | Version | Description |
|---------|---------|-------------|
| [@brik/react-native](./packages/brik-react-native) | 0.3.0 | React Native bridge, Live Activities & widget APIs |
| [@brik/cli](./packages/brik-cli) | 0.3.0 | CLI tools for building and setting up widgets |
| [@brik/core](./packages/brik-core) | 0.3.0 | Core compiler and type system |
| [@brik/compiler](./packages/brik-compiler) | 0.3.0 | JSX/TSX to native code compiler |
| [@brik/target-swiftui](./packages/brik-target-swiftui) | 0.3.0 | SwiftUI code generation |
| [@brik/target-compose](./packages/brik-target-compose) | 0.3.0 | Jetpack Compose code generation |
| [@brik/schemas](./packages/brik-schemas) | 0.3.0 | Shared type definitions and schemas |
| [@brik/babel-plugin](./packages/brik-babel-plugin) | 0.3.0 | Babel transform plugin |
| [@brik/metro-plugin](./packages/brik-metro-plugin) | 0.3.0 | Metro bundler integration |
| [@brik/expo-plugin](./packages/brik-expo-plugin) | 0.3.0 | Expo config plugin |

**Example Apps:**
- [`examples/brik-expo-app`](./examples/brik-expo-app) - Expo + Weather widget demo (ready to run)
- [`examples/brik-example-app`](./examples/brik-example-app) - React Native CLI example

---

## Documentation

### User Guides
- **Getting Started:** [`docs/GETTING_STARTED.md`](./docs/GETTING_STARTED.md)
- **Live Activities Guide:** [`docs/LIVE_ACTIVITIES_GUIDE.md`](./docs/LIVE_ACTIVITIES_GUIDE.md) - Complete implementation guide
- **Widget Setup Guide:** [`docs/WIDGET_SETUP_GUIDE.md`](./docs/WIDGET_SETUP_GUIDE.md)
- **Installation Guide:** [`docs/guides/INSTALLATION.md`](./docs/guides/INSTALLATION.md)
- **Architecture:** [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)

### Package Management & Publishing
- **Setup Guide:** [`docs/setup/SETUP_COMPLETE.md`](./docs/setup/SETUP_COMPLETE.md) - Complete npm publishing guide
- **Package Analysis:** [`docs/setup/PACKAGE_MANAGEMENT_ANALYSIS.md`](./docs/setup/PACKAGE_MANAGEMENT_ANALYSIS.md) - Monorepo strategy & recommendations
- **Quick Reference:** [`docs/setup/README.md`](./docs/setup/README.md) - Publishing commands & status

### Project Status
- **Current Status:** [`docs/status/PROJECT_STATUS.md`](./docs/status/PROJECT_STATUS.md)

---

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/mukulchugh/brik.git
cd brik

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck
```

### Monorepo Structure

```
brik/
├── packages/          # 10 npm packages
│   ├── brik-core/
│   ├── brik-compiler/
│   ├── brik-react-native/
│   ├── brik-cli/
│   └── ...
├── examples/          # Example apps
│   └── brik-example-app/
├── docs/              # Documentation
│   ├── setup/        # Publishing guides
│   ├── guides/       # User guides
│   └── internal/     # Internal docs
└── .changeset/       # Version management
```

### Publishing

```bash
# Create a changeset
pnpm changeset

# Version packages
pnpm version-packages

# Build and publish to npm
pnpm release
```

See [`docs/setup/SETUP_COMPLETE.md`](./docs/setup/SETUP_COMPLETE.md) for detailed publishing instructions.

### Contributing

See [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) for contribution guidelines.
