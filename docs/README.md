# Brik Documentation

<p align="center"><strong>Brik</strong> — Write once, run native widgets.</p>

Build native iOS/Android widgets and Live Activities from React components. No Swift, no Kotlin, no extra runtime.

## Documentation Index

### Getting Started
- **[Getting Started Guide](./GETTING_STARTED.md)** - Installation and first widget
- **[Live Activities Guide](./LIVE_ACTIVITIES.md)** - iOS Live Activities and Dynamic Island

### Reference
- **[Architecture](./ARCHITECTURE.md)** - System design and data flow
- **[IR Specification](./IR_SPEC.md)** - Intermediate representation format
- **[Styling & Actions](./STYLING_AND_ACTIONS.md)** - Style properties and interactions
- **[Mappings](./MAPPINGS.md)** - React → Native mappings

### Development
- **[Contributing](./CONTRIBUTING.md)** - How to contribute
- **[Roadmap](./ROADMAP.md)** - Future plans
- **[Security](./SECURITY.md)** - Security considerations

### Project Root Documentation
- **[Validation Report](../VALIDATION_REPORT.md)** - Confirms real native widget generation
- **[Changelog](../CHANGELOG.md)** - Version history
- **[Next Steps](../NEXT_STEPS.md)** - Current status and roadmap

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

## Need Help?

- Check the [Getting Started Guide](./GETTING_STARTED.md)
- See [examples/rn-expo-app](../examples/rn-expo-app)
- Read [LIVE_ACTIVITIES.md](./LIVE_ACTIVITIES.md) for Live Activities
- Review [VALIDATION_REPORT.md](../VALIDATION_REPORT.md) for implementation details






