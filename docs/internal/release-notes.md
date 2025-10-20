# Brik v0.1.0 - First Release

## Overview

Brik is a comprehensive transpilation system that enables React Native developers to build native widgets, Live Activities, and Dynamic Island UIs using a single JSX/TSX codebase. Write once in React, deploy as native SwiftUI (iOS) and Glance (Android) widgets.

## What's Included

### Core Architecture

**Packages:**

- `@brik/schemas` - Zod-validated IR (Intermediate Representation) with comprehensive type safety
- `@brik/core` - IR validation and error handling
- `@brik/compiler` - Babel-powered JSX/TSX → IR compiler
- `@brik/react-native` - React Native components for development and preview
- `@brik/target-swiftui` - SwiftUI/WidgetKit code generator
- `@brik/target-compose` - Glance/Compose code generator
- `@brik/cli` - Command-line interface for building widgets
- `@brik/expo-plugin` - Expo config plugin for automated integration
- `@brik/metro-plugin` - Metro bundler integration
- `@brik/babel-plugin` - Babel transformation plugin

### Components

**8 UI Primitives:**

1. `BrikView` - Container component (maps to VStack/Column)
2. `BrikText` - Text display with typography controls
3. `BrikButton` - Interactive button with actions
4. `BrikImage` - Image component with remote URLs
5. `BrikStack` - Flexible horizontal/vertical layout
6. `BrikSpacer` - Flexible spacing element
7. `BrikProgressBar` - Progress indicators (determinate/indeterminate)
8. `BrikList` - Scrollable list container

### Styling System

**Complete CSS-like styling:**

- **Layout**: width, height, min/max dimensions, flex, padding, margin, gap, positioning, z-index, aspect ratio
- **Typography**: fontSize, fontWeight, fontFamily, fontStyle, color, textAlign, textTransform, lineHeight, letterSpacing, numberOfLines, ellipsizeMode
- **Colors**: backgroundColor, opacity, tintColor (with hex parsing: #RGB, #ARGB, #RRGGBB, #AARRGGBB)
- **Borders**: borderRadius (including individual corners), borderWidth, borderColor, borderStyle
- **Shadows**: shadowColor, shadowOpacity, shadowRadius, shadowOffset, elevation (Android)

### Actions & Deep Linking

**4 Action Types:**

1. **Deep Link** - Open specific app screens with parameters
2. **Open App** - Launch app from widget
3. **Refresh** - Trigger widget data refresh
4. **Custom** - Custom action handlers with parameters

Actions work on any component (Text, Image, View, Button, Stack).

### Platform Generation

**iOS (SwiftUI/WidgetKit):**

- Full SwiftUI view generation
- `Link` and `widgetURL` for deep linking
- Proper alignment mapping (HStack/VStack)
- AsyncImage with placeholder support
- WidgetKit extension scaffolding
- Timeline provider generation

**Android (Glance/AppWidget):**

- Glance widget API (not standard Compose)
- `GlanceAppWidget` and `GlanceAppWidgetReceiver`
- `actionStartActivity` for deep links
- `actionRunCallback` for refresh actions
- Proper `GlanceModifier` usage
- Widget provider and XML configuration

## Key Features

### Write Once, Run Native

```tsx
/** @brik */
export function MyWidget() {
  return (
    <BrikView style={{ padding: 16, backgroundColor: '#FFFFFF', borderRadius: 16 }}>
      <BrikText style={{ fontSize: 20, fontWeight: '700' }}>Hello Widget</BrikText>
      <BrikButton
        label="Open App"
        action={{
          type: 'deeplink',
          url: 'myapp://home',
          params: { source: 'widget' },
        }}
      />
    </BrikView>
  );
}
```

### Automatic Platform Conversion

**Input:** JSX/TSX with Brik components
↓
**IR:** JSON intermediate representation with validation
↓
**iOS:** SwiftUI WidgetKit extension
**Android:** Glance AppWidget

### Type Safety

Every node, style property, and action is validated with Zod schemas. Invalid IR is caught at compile time with detailed error messages.

### Hot Reload Ready

React Native components mirror the widget primitives, enabling instant iteration during development.

## Getting Started

### Installation

```bash
# Install Brik packages
pnpm add @brik/react-native @brik/cli

# Expo projects
pnpm add @brik/expo-plugin
```

### Basic Usage

1. **Create a widget component:**

```tsx
// src/MyWidget.tsx
import { BrikView, BrikText, BrikButton } from '@brik/react-native';

/** @brik */
export function MyWidget() {
  return (
    <BrikView style={{ padding: 16 }}>
      <BrikText>My First Widget</BrikText>
      <BrikButton label="Tap me" action={{ type: 'deeplink', url: 'myapp://home' }} />
    </BrikView>
  );
}
```

2. **Build for platforms:**

```bash
# Generate native code
pnpm brik build --platform all --as-widget

# Scan for components
pnpm brik scan

# Check environment
pnpm brik doctor

# Clean generated files
pnpm brik clean
```

3. **Configure Expo (optional):**

```json
{
  "plugins": [["@brik/expo-plugin", { "platform": "all" }]]
}
```

## Examples

See `examples/rn-expo-app/src/` for:

- `BrikDemo.tsx` - Basic widget example
- `AdvancedDemo.tsx` - Complete widget with actions, styling, progress bars

## Documentation

- `docs/GETTING_STARTED.md` - Quick start guide
- `docs/STYLING_AND_ACTIONS.md` - Complete styling and actions reference
- `docs/ARCHITECTURE.md` - Pipeline and architecture overview
- `docs/IR_SPEC.md` - Intermediate representation specification
- `IMPLEMENTATION_PLAN.md` - Full roadmap and feature plan

## What's Working

✅ Complete JSX → IR → Native compilation pipeline
✅ All 8 UI components with full prop support
✅ Comprehensive styling system (layout, typography, colors, borders, shadows)
✅ Actions and deep linking on any component
✅ Glance widget generation for Android
✅ SwiftUI widget generation for iOS
✅ React Native development components
✅ CLI with scan/build/doctor/clean commands
✅ Expo plugin integration
✅ Type-safe IR validation
✅ Hex color parsing for both platforms

## Known Limitations

This is a first release focused on core widget functionality:

⚠️ **Not Yet Implemented:**

- Live Activities (schema ready, implementation pending)
- Dynamic Island variants (schema ready, implementation pending)
- Server push infrastructure for updates
- watchOS widget support
- Hot reload for widgets
- Timeline data providers
- Remote data binding
- Widget configuration UI
- Xcode extension auto-creation
- Advanced list rendering with data

⚠️ **Platform-Specific:**

- iOS: Manual WidgetKit extension setup required
- Android: Glance dependency must be added manually
- Images: Remote URLs require network permissions

## Roadmap

**Phase 4: Live Activities** (4 weeks)

- Activity attributes model
- Lock screen layouts
- Dynamic Island compact/expanded/minimal
- Start/update/end APIs

**Phase 5: Server Push** (4 weeks)

- APNs/FCM integration
- Push token management
- Activity state store
- Server SDK

**Phase 6: watchOS & Advanced Surfaces** (2 weeks)

- watchOS widget generation
- Dynamic Island animations
- Control Center widgets (iOS 18)

**Phase 7: Developer Experience** (2 weeks)

- Hot reload for widgets
- Widget preview app
- IR visualizer
- Timeline debugger

## Contributing

See `docs/CONTRIBUTING.md` for guidelines.

## License

MIT License - see `LICENSE` file.

## Support

- GitHub Issues: Report bugs and request features
- Discussions: Ask questions and share widgets

---

**Built for the React Native community by developers who believe native widgets shouldn't require native code.**
