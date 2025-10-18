# Brik Project - Comprehensive Understanding

## Overview
**Brik** is a cross-platform widget development framework that enables React Native developers to write UI components once in JSX/TSX and compile them into native widgets for both iOS (SwiftUI) and Android (Jetpack Compose). The core philosophy is "Write once, run native" - specifically targeting homescreen widgets and app widgets.

## Core Architecture

```
JSX/TSX → Babel Parser → Intermediate Representation (IR) → Platform Code Generation
                                                         ├─ SwiftUI (iOS)
                                                         └─ Jetpack Compose (Android)
```

## Package Ecosystem

### Core Infrastructure
- **`@brik/schemas`** - Defines IR structure with Zod schemas for components, styles, and widget metadata
- **`@brik/core`** - Validation and error handling foundation using the schemas
- **`@brik/compiler`** - Babel-powered JSX/TSX parser that converts Brik components to IR

### Code Generation Targets
- **`@brik/target-swiftui`** - Generates SwiftUI views and WidgetKit extensions for iOS
- **`@brik/target-compose`** - Creates Kotlin Composable functions and Glance AppWidget providers for Android

### Developer Tools
- **`@brik/cli`** - Command-line interface with `scan`, `build`, `doctor`, and `clean` commands
- **`@brik/react-native`** - React Native implementations for development/testing
- **`@brik/expo-plugin`** - Expo Config Plugin for automated build integration
- **`@brik/metro-plugin`** - Metro bundler integration
- **`@brik/babel-plugin`** - Babel transformation plugin

## Component System

### Available Components
1. **BrikView** - Container component (maps to VStack/Column)
2. **BrikText** - Text display with typography options
3. **BrikButton** - Interactive button with press handlers
4. **BrikImage** - Image component with remote URL support
5. **BrikStack** - Flexible layout container (horizontal/vertical)

### Style Categories
- **Layout**: Flexbox, dimensions, positioning, padding/margin
- **Typography**: Font size, weight, color, text truncation
- **Colors**: Background color, opacity
- **Borders**: Border radius

## Example Applications

### Expo Example (`examples/rn-expo-app`)
Complete React Native Expo application featuring:
- **BrikDemo**: Showcases all component types with styling
- **WidgetDemo**: Widget-specific design with multiple elements
- **SimpleTest**: Basic component example
- Configured with `@brik/expo-plugin` for automatic native code generation

### Bare React Native Example (`examples/bare-rn-app`)
Placeholder for React Native CLI integration patterns

## Development Workflow

1. **Write** - Create Brik components using React Native implementations
2. **Test** - Develop and test in React Native environment
3. **Compile** - Use `brik build` command or Expo plugin to generate native code
4. **Deploy** - Integrate generated SwiftUI/Compose code into native projects

## Widget Integration

### iOS (SwiftUI)
- Generates SwiftUI view structs with WidgetKit configuration
- Maps Brik styles to SwiftUI modifiers
- Creates proper widget metadata for different sizes

### Android (Jetpack Compose)
- Creates Kotlin Composable functions
- Generates Glance AppWidget providers
- Configures Android manifest for widget receivers

## Key Technical Features

- **Type Safety**: Full TypeScript support across entire pipeline
- **Monorepo Architecture**: Well-organized packages with clear separation
- **Cross-Platform Styling**: Normalized style system for consistent appearance
- **Widget-First Design**: Optimized specifically for homescreen widgets
- **Developer Experience**: Familiar JSX/React patterns with native performance
- **Build Integration**: Seamless integration with Expo and React Native CLI workflows

## File Structure
```
/Users/mukulchugh/Work/Products/brik/
├── packages/           # Core framework packages
│   ├── brik-core/      # Validation and error handling
│   ├── brik-schemas/   # IR type definitions
│   ├── brik-compiler/  # JSX to IR compilation
│   ├── brik-target-*   # Platform code generators
│   ├── brik-cli/       # Command line tools
│   └── brik-*-plugin/  # Build system integrations
├── examples/           # Sample applications
│   ├── rn-expo-app/    # Complete Expo example
│   └── bare-rn-app/    # React Native CLI example
└── docs/              # Project documentation
```

## Value Proposition
Brik bridges the gap between React Native's component model and native widget development, allowing developers to leverage their existing React skills to create performant, platform-specific homescreen widgets without learning SwiftUI or Jetpack Compose directly.