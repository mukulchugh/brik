# Brik Documentation

**v0.3.0** - Complete documentation for building native widgets and Live Activities with React

## 📚 User Guides

### Getting Started
- **[Getting Started](./GETTING_STARTED.md)** - Quick start guide
- **[Installation Guide](./guides/INSTALLATION.md)** - Detailed installation
- **[Widget Setup Guide](./WIDGET_SETUP_GUIDE.md)** - Complete widget setup

### Features
- **[Live Activities Guide](./LIVE_ACTIVITIES_GUIDE.md)** - Live Activities + Dynamic Island
- **[Live Activities Setup](./guides/LIVE_ACTIVITIES_SETUP.md)** - Step-by-step setup
- **[Live Activities Backend](./guides/LIVE_ACTIVITIES_BACKEND.md)** - Server integration
- **[Hot Reload](./HOT_RELOAD.md)** - Development hot reload
- **[Styling & Actions](./STYLING_AND_ACTIONS.md)** - Customize widgets

### Platform-Specific
- **[Android ProGuard Setup](./guides/ANDROID_PROGUARD_SETUP.md)** - Release builds

## 🏗️ Technical Documentation

### Architecture
- **[Architecture](./ARCHITECTURE.md)** - System design
- **[IR Specification](./IR_SPEC.md)** - IR format
- **[Component Mappings](./MAPPINGS.md)** - React to native

### Integration
- **[Backend Integration](./BACKEND_INTEGRATION.md)** - Server-side setup

## 🧪 Testing

- **[E2E Testing Plan](./testing/E2E_TESTING_PLAN.md)** - Testing strategy
- **[Maestro Quick Start](./testing/MAESTRO_QUICK_START.md)** - UI testing
- **[Testing Guide](./guides/TESTING_GUIDE.md)** - Test instructions
- **[Run Guide](./guides/RUN_GUIDE.md)** - Running examples

## 📦 Package Management

- **[Setup Complete](./setup/SETUP_COMPLETE.md)** - npm publishing
- **[Package Analysis](./setup/PACKAGE_MANAGEMENT_ANALYSIS.md)** - Monorepo strategy
- **[Quick Reference](./setup/README.md)** - Publishing commands

## 📊 Status & Roadmap

- **[Current Status](./status/CURRENT_STATUS.md)** - Development progress
- **[Roadmap](./ROADMAP.md)** - Future plans
- **[Contributing](./CONTRIBUTING.md)** - How to contribute
- **[Security](./SECURITY.md)** - Security policy

## 🔍 Release Documentation

- **[Release Verification](../FINAL_RELEASE_VERIFICATION.md)** - v0.3.0 technical assessment
- **[Codebase Review](./CODEBASE_REVIEW.md)** - Code quality
- **[Validation Summary](./VALIDATION_SUMMARY.md)** - Feature validation

## Quick Links

### Installation
```bash
pnpm add @brik/react-native @brik/cli
```

### Create Widget
```tsx
import { BrikView, BrikText } from '@brik/react-native';

export function MyWidget() {
  return (
    <BrikView style={{ padding: 16 }}>
      <BrikText>Hello Brik!</BrikText>
    </BrikView>
  );
}
```

### Generate Code
```bash
pnpm brik build --platform ios --as-widget
```

## Supported Platforms

- ✅ iOS Home Screen (WidgetKit)
- ✅ iOS Lock Screen (WidgetKit)
- ✅ iOS Live Activities (ActivityKit)
- ✅ iOS Dynamic Island
- ✅ Android Home Screen (Glance)
- 🔜 Apple Watch (v0.4.0)

## Components

- BrikView - Container
- BrikText - Text
- BrikStack - Layout
- BrikButton - Button
- BrikImage - Images
- BrikProgressBar - Progress
- BrikSpacer - Spacing
- BrikList - Lists

## Live Activities API

```tsx
import { Brik } from '@brik/react-native';

// Start activity
const activity = await Brik.startActivity({...});

// Update
await Brik.updateActivity(activity.id, {...});

// End
await Brik.endActivity(activity.id);
```

## 📱 Example Apps

- **[brik-expo-app](../examples/brik-expo-app/)** - Expo + Weather widget (ready to run)
- **[brik-example-app](../examples/brik-example-app/)** - React Native CLI example

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/brikjs/brik/issues)
- **Discussions**: [GitHub Discussions](https://github.com/brikjs/brik/discussions)
- **Main README**: [../README.md](../README.md)






