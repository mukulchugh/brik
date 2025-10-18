# Changelog

All notable changes to Brik will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-01-XX

### Added - Live Activities & Dynamic Island 🎉

**Live Activities (iOS 16.1+)**
- ✨ Full Live Activities support with ActivityKit integration
- ✨ Lock screen banner views with real-time updates
- ✨ Dynamic Island support (compact, minimal, expanded regions)
- ✨ Native module bridge for start/update/end operations
- ✨ TypeScript API for activity lifecycle management

**Code Generation**
- 🔧 Compiler now detects `@brik-activity` JSDoc comments
- 🔧 Automatic parsing of activity configuration objects
- 🔧 IR generation for lock screen and Dynamic Island regions
- 🔧 SwiftUI ActivityKit code generation
- 🔧 Activity attributes struct generation with type inference

**React Native API**
- 📱 `Brik.startActivity()` - Start Live Activities from JavaScript
- 📱 `Brik.updateActivity()` - Update activity state in real-time
- 📱 `Brik.endActivity()` - End activities with dismissal policies
- 📱 `Brik.getActiveActivities()` - Query current activities
- 📱 `Brik.areActivitiesSupported()` - Platform capability detection
- 📱 Platform-specific error handling (iOS 16.1+ required)

**Native iOS Modules**
- 🍎 `BrikLiveActivities.swift` - Swift module for ActivityKit
- 🍎 `BrikLiveActivities.m` - Objective-C bridge
- 🍎 Proper iOS version checking
- 🍎 Activity lifecycle management
- 🍎 Push token support (foundation)

**Examples**
- 📚 LiveActivityScreen component with full UI
- 📚 OrderTrackingActivity example
- 📚 Integration with example app
- 📚 Testing instructions

### Enhanced

**Widget Generation**
- ⚡ Improved SwiftUI code generation
- ⚡ Better IR node rendering for activities
- ⚡ Export `emitNode` function for reusability

**Package Management**
- 📦 All packages bumped to v0.2.0
- 📦 Added descriptions to all package.json files
- 📦 Added repository links and bug tracker URLs
- 📦 Added npm keywords for discoverability
- 📦 Created .npmignore files for all packages

**Testing**
- ✅ Added `--passWithNoTests` to all test scripts
- ✅ Improved test infrastructure

**Documentation**
- 📝 Updated README with Live Activities examples
- 📝 Created VALIDATION_REPORT.md
- 📝 Enhanced LIVE_ACTIVITIES.md guide
- 📝 Updated supported platforms list

### Fixed
- 🐛 iOS native module file structure
- 🐛 Package files configuration for npm

### Package Updates

**@brik/react-native@0.2.0**
- Live Activities API
- Native iOS module
- ios/ folder included in package

**@brik/compiler@0.2.0**
- @brik-activity detection
- Activity config parsing
- Multi-region IR generation

**@brik/target-swiftui@0.2.0**
- Live Activity code generation
- ActivityAttributes generation
- Dynamic Island support

**@brik/cli@0.2.0**
- Automatic Live Activity detection
- Integrated activity generation

**All Other Packages@0.2.0**
- Metadata improvements
- npm publication ready

---

## [0.1.0] - 2024-09-XX

### Initial Release

**Core Features**
- JSX/TSX to native widget transpilation
- iOS WidgetKit code generation (SwiftUI)
- Android Glance widget generation (Kotlin)
- 8 UI components (Text, View, Stack, Button, Image, Spacer, ProgressBar, List)
- 60+ style properties support
- Deep linking and actions
- Development-time preview components

**Architecture**
- IR (Intermediate Representation) with Zod validation
- Compiler package with Babel AST traversal
- Target-specific code generators
- CLI tools for code generation

**Documentation**
- Getting started guide
- Architecture documentation
- IR specification
- Style mapping documentation

**Examples**
- React Native Expo example app
- Widget demos
- Component examples

**Packages (v0.1.0)**
- @brik/core
- @brik/schemas
- @brik/compiler
- @brik/cli
- @brik/react-native
- @brik/target-swiftui
- @brik/target-compose
- @brik/expo-plugin
- @brik/babel-plugin
- @brik/metro-plugin
- @brik/test-utils

---

[0.2.0]: https://github.com/brikjs/brik/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/brikjs/brik/releases/tag/v0.1.0
