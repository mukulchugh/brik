# Brik - iOS & Android Run Guide

This guide explains how to run the Brik example app on iOS and Android to test Live Activities and widgets.

---

## Prerequisites

- **Node.js** 18+ and pnpm
- **iOS**: Xcode 16+ with iOS 16.1+ SDK
- **Android**: Android Studio with API 33+ SDK
- **React Native** development environment setup

---

## Current Status

✅ **Brik v0.3.0 Core**: All 11 packages building successfully
✅ **Test Suite**: 56 tests passing (22 error handling + 31 widget storage + 3 existing)
✅ **Metro Bundler**: Running on http://localhost:8081

⚠️ **Example App Dependencies**: Need version updates for React Native 0.79+

---

## Quick Start

### 1. Build Brik Packages

```bash
# From project root
cd /Users/mukulchugh/Work/Products/brik

# Build all packages
pnpm build

# Run tests
pnpm test
```

### 2. Start Metro Bundler

```bash
# Navigate to example app
cd examples/rn-expo-app

# Start Metro (in one terminal)
npx expo start --clear
```

### 3. Fix Dependency Versions (Required)

The example app needs React Native version updates:

```bash
cd examples/rn-expo-app

# Update to compatible versions
pnpm add react@19.0.0 react-native@0.79.6

# Clean and reinstall
rm -rf node_modules ios/Pods ios/Podfile.lock
pnpm install
cd ios && pod install && cd ..
```

---

## Running on iOS

### Option 1: Using Expo CLI (Recommended)

```bash
cd examples/rn-expo-app

# Run on iOS simulator
npx expo run:ios --device

# Or specify simulator
npx expo run:ios --simulator "iPhone 15"
```

### Option 2: Using Xcode

```bash
cd examples/rn-expo-app/ios

# Open workspace
open BrikExpoExample.xcworkspace

# In Xcode:
# 1. Select "BrikExpoExample" scheme
# 2. Select "iPhone 15" or iPhone 14 Pro+ simulator (for Dynamic Island)
# 3. Click "Run" (⌘R)
```

### Option 3: Direct xcodebuild

```bash
cd examples/rn-expo-app/ios

# List available simulators
xcrun simctl list devices | grep iPhone

# Build and run
xcodebuild -workspace BrikExpoExample.xcworkspace \
  -scheme BrikExpoExample \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  build

# Install on simulator
xcrun simctl install <UDID> <path-to-app>
xcrun simctl launch <UDID> com.mukulchugh.rn-expo-app
```

---

## Running on Android

### Option 1: Using Expo CLI

```bash
cd examples/rn-expo-app

# Run on Android emulator
npx expo run:android

# Or specify device
npx expo run:android --device
```

### Option 2: Using Android Studio

```bash
cd examples/rn-expo-app

# Open Android project
open -a "Android Studio" android/

# In Android Studio:
# 1. Wait for Gradle sync
# 2. Select device/emulator
# 3. Click "Run" (⇧F10)
```

### Option 3: Using adb directly

```bash
cd examples/rn-expo-app

# List devices
adb devices

# Build and install
cd android
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk

# Launch app
adb shell am start -n com.mukulchugh.rnexpoapp/.MainActivity
```

---

## Testing Live Activities (iOS Only)

Live Activities require iOS 16.1+ and work best on iPhone 14 Pro+ for Dynamic Island.

### 1. Start an Activity

```typescript
import { Brik } from '@brik/react-native';

// Start a Live Activity
const activity = await Brik.startActivity({
  activityType: 'OrderTracking',
  attributes: {
    static: {
      orderId: '12345',
      merchant: 'Coffee Shop'
    },
    dynamic: {
      status: 'preparing',
      eta: 15
    }
  }
});

console.log('Activity started:', activity.id);
```

### 2. Update the Activity

```typescript
// Update activity state
await Brik.updateActivity(activity.id, {
  dynamic: {
    status: 'delivering',
    eta: 5
  }
});
```

### 3. End the Activity

```typescript
// End activity
await Brik.endActivity(activity.id, 'default');
```

### 4. Get Push Token (for remote updates)

```typescript
const pushToken = await Brik.getPushToken(activity.id);
// Send this token to your server for remote updates
```

---

## Troubleshooting

### iOS Pod Install Fails

```bash
cd examples/rn-expo-app/ios

# Clear caches
rm -rf Pods Podfile.lock ~/Library/Developer/Xcode/DerivedData

# Update pods
pod deintegrate
pod install --repo-update
```

### Metro Bundler Port Conflict

```bash
# Kill process on port 8081
lsof -i :8081 | awk 'NR>1 {print $2}' | xargs kill -9

# Restart Metro
npx expo start --clear
```

### Android Gradle Issues

```bash
cd examples/rn-expo-app/android

# Clean build
./gradlew clean
./gradlew assembleDebug --refresh-dependencies
```

### Simulator Not Found

```bash
# List iOS simulators
xcrun simctl list devices | grep iPhone

# Boot simulator manually
xcrun simctl boot <UDID>

# List Android emulators
emulator -list-avds

# Start Android emulator
emulator -avd <AVD_NAME>
```

---

## Verifying Brik Features

### 1. Check Native Module Linkage

```typescript
import { NativeModules } from 'react-native';

console.log('BrikLiveActivities:', NativeModules.BrikLiveActivities);
// Should show native module methods
```

### 2. Test Error Handling

```typescript
import { errorHandler, BrikErrorCode, createError } from '@brik/core';

// Listen to errors
errorHandler.onError((error) => {
  console.log('Error:', error.getFormattedMessage());
});

// Trigger a test error
throw createError(
  BrikErrorCode.ACTIVITY_START_FAILED,
  'Test error'
);
```

### 3. Test Performance Monitoring

```typescript
import { performanceMonitor } from '@brik/react-native';

// Measure operation
performanceMonitor.startTimer('testOperation');
await doSomething();
const duration = performanceMonitor.endTimer('testOperation');

console.log(`Operation took ${duration}ms`);

// Get stats
const stats = performanceMonitor.getStats('testOperation');
console.log(stats); // { count, min, max, avg, p50, p95, p99 }
```

### 4. Test Widget Storage

```typescript
import { widgetStorage } from '@brik/react-native';

// Save data
await widgetStorage.save('myWidget', {
  value: 'test'
}, { ttl: 3600 });

// Load data
const data = await widgetStorage.load('myWidget');
console.log('Loaded:', data);
```

---

## Performance Testing

### Measure Activity Start Time

```typescript
import { performanceMonitor, activityPerformanceTracker } from '@brik/react-native';

performanceMonitor.startTimer('activity.start');

const activity = await Brik.startActivity({
  activityType: 'OrderTracking',
  attributes: { /* ... */ }
});

const duration = performanceMonitor.endTimer('activity.start');
console.log(`Activity started in ${duration}ms`);

// Get detailed metrics
const metrics = activityPerformanceTracker.getActivityMetrics(activity.id);
```

---

## CI/CD Integration

### Running Tests in CI

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
```

### iOS Build in CI

```yaml
ios-build:
  runs-on: macos-latest
  steps:
    - uses: actions/checkout@v3
    - run: cd examples/rn-expo-app/ios
    - run: pod install
    - run: |
        xcodebuild -workspace BrikExpoExample.xcworkspace \
          -scheme BrikExpoExample \
          -sdk iphonesimulator \
          build
```

---

## Next Steps

1. **Update Dependencies**: Fix React Native version mismatches
2. **Test Live Activities**: Run app on iPhone 14 Pro+ simulator
3. **Test Widgets**: Create and deploy test widgets
4. **Performance Validation**: Run benchmarks
5. **Documentation**: Complete API docs

---

## Support

- **Issues**: https://github.com/brikjs/brik/issues
- **Docs**: See `V0.3.0_STATUS.md` for complete feature documentation
- **Tests**: Run `pnpm test` to see test coverage

---

Built with ❤️ using [Claude Code](https://claude.com/claude-code)
