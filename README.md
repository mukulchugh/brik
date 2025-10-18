# Brik — Live Activities, Widgets & Dynamic Island with React

[![npm](https://img.shields.io/npm/v/@brik/react-native)](https://www.npmjs.com/package/@brik/react-native) [![CI](https://github.com/brikjs/brik/actions/workflows/ci.yml/badge.svg)](https://github.com/brikjs/brik/actions/workflows/ci.yml) [![codecov](https://img.shields.io/badge/codecov-pending-blue)](https://codecov.io/) [![license](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

Build native iOS/Android widgets and Live Activities from a single React codebase. No Swift/Kotlin, no Xcode/Android Studio, and no extra JS runtime.

- ⚡ Hot reload: iterate in JSX/TSX and preview instantly
- ⛽ Server push: real‑time updates for Live Activities
- 🔗 Deep linking: open app/screens with parameters from any widget tap
- ⌚ Apple Watch: watchOS widgets/complications support
- ✻ AI‑agent friendly: deterministic codegen, typed IR, simple APIs
- @Expo + React Native ready: works in managed and bare projects

## Supported surfaces

- iOS: Home/Lock Screen Widgets (WidgetKit), Live Activities + Dynamic Island, watchOS Widgets
- Android: Home Screen Widgets (Glance)
- Dev-time preview: React Native primitives that mirror widget UI

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

## Deep links and actions

```tsx
<BrikButton label="Open details" action={{ type: 'deeplink', url: 'myapp://details/42' }} />
```

Getting started: see `docs/GETTING_STARTED.md`.
