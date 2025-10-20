# Brik Documentation

**v0.3.0** - Complete documentation for building native widgets and Live Activities with React

## 📚 User Guides

### Getting Started
- **[Getting Started](./getting-started.md)** - Quick start guide
- **[Installation Guide](./guides/installation.md)** - Detailed installation
- **[Widget Setup Guide](./guides/widget-setup-guide.md)** - Complete widget setup
- **[Mise Setup Guide](./setup/mise-guide.md)** - Tool version management

### Features
- **[Live Activities Guide](./guides/live-activities-guide.md)** - Live Activities + Dynamic Island
- **[Live Activities Setup](./guides/live-activities-setup.md)** - Step-by-step setup
- **[Live Activities Backend](./guides/live-activities-backend.md)** - Server integration
- **[Live Activities Reference](./guides/live-activities.md)** - Complete reference
- **[Hot Reload](./hot-reload.md)** - Development hot reload
- **[Styling & Actions](./technical/styling-and-actions.md)** - Customize widgets

### Platform-Specific
- **[Android ProGuard Setup](./guides/android-proguard-setup.md)** - Release builds
- **[Run Guide](./guides/run-guide.md)** - Running examples

## 🏗️ Technical Documentation

### Architecture
- **[Architecture](./architecture.md)** - System design
- **[IR Specification](./technical/ir-spec.md)** - IR format
- **[Component Mappings](./technical/mappings.md)** - React to native

### Integration
- **[Backend Integration](./backend-integration.md)** - Server-side setup

## 🧪 Testing

- **[E2E Testing Plan](./testing/e2e-testing-plan.md)** - Testing strategy
- **[Maestro Quick Start](./testing/maestro-quick-start.md)** - UI testing
- **[Testing Guide](./guides/testing-guide.md)** - Test instructions
- **[Testing README](./testing/README.md)** - Testing overview

## 📦 Package Management

- **[Setup Complete](./setup/setup-complete.md)** - npm publishing
- **[Package Analysis](./setup/package-management-analysis.md)** - Monorepo strategy
- **[Quick Reference](./setup/README.md)** - Publishing commands

## 📊 Status & Roadmap

- **[Current Status](./status/current-status.md)** - Development progress
- **[v0.3.0 Status](./status/v0.3.0-status.md)** - Release status
- **[Roadmap](./roadmap.md)** - Future plans
- **[Contributing](./contributing.md)** - How to contribute
- **[Security](./security.md)** - Security policy

## 🔍 Internal Documentation

Release and validation documentation (for maintainers):
- **[Final Release Verification](./internal/final-release-verification.md)** - v0.3.0 technical assessment
- **[Competitive Validation Report](./internal/competitive-validation-report.md)** - Market validation
- **[Example Apps Validation](./internal/example-apps-validation.md)** - App testing results
- **[Codebase Review](./internal/codebase-review.md)** - Code quality
- **[Validation Summary](./internal/validation-summary.md)** - Feature validation

## Quick Links

### Installation
```bash
# Using mise (recommended)
mise install
mise run setup

# Manual
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

- **[brik-expo](../examples/brik-expo/)** - Expo + Old Architecture
- **[brik-expo-arch](../examples/brik-expo-arch/)** - Expo + New Architecture
- **[brik-rn](../examples/brik-rn/)** - React Native CLI + New Architecture
- **[brik-rn-arch](../examples/brik-rn-arch/)** - React Native CLI + Old Architecture

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/brikjs/brik/issues)
- **Discussions**: [GitHub Discussions](https://github.com/brikjs/brik/discussions)
- **Main README**: [../README.md](../README.md)
