# E2E Testing Plan for Brik with Maestro

## Overview

This document outlines the end-to-end testing strategy for Brik using Maestro, a cross-platform mobile UI testing framework that supports iOS and Android.

**Testing Scope:**
- Example app (`brik-example-app`) functionality
- Widget compilation and generation flow
- Live Activities implementation
- React Native bridge APIs
- Deep linking from widgets
- Error handling and edge cases

**Key Challenge:** Maestro primarily tests main app UI. iOS widgets and Live Activities cannot be directly tested by Maestro as they run in separate extension processes. We'll use a hybrid approach combining Maestro for app testing and manual verification for widgets.

---

## Testing Strategy

### 1. App-Level Testing (Maestro)
- ✅ Main app UI and navigation
- ✅ Widget data updates via `widgetManager` API
- ✅ Live Activity lifecycle (start, update, end)
- ✅ Deep link handling when user opens app
- ✅ Error states and validation

### 2. Widget/Extension Testing (Manual + XCUITest)
- ⚠️ Widget appearance and layout
- ⚠️ Live Activity lock screen UI
- ⚠️ Dynamic Island interactions
- ⚠️ Widget data refresh
- 💡 **Alternative:** Use XCUITest for widget-specific tests

### 3. Integration Testing
- ✅ CLI commands (`brik build`, `brik ios-setup`)
- ✅ Code generation validation
- ✅ Build system integration

---

## Maestro Setup

### Installation

```bash
# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Add to PATH
export PATH="$PATH:$HOME/.maestro/bin"

# Verify installation
maestro --version

# Install iOS dependencies (Facebook IDB)
brew tap facebook/fb
brew install facebook/fb/idb-companion

# For Android
# Ensure Android Studio, SDK, and emulators are configured
```

### Project Structure

```
brik/
├── examples/
│   └── brik-example-app/
│       ├── .maestro/
│       │   ├── flows/
│       │   │   ├── 01-app-launch.yaml
│       │   │   ├── 02-widget-update.yaml
│       │   │   ├── 03-live-activity.yaml
│       │   │   ├── 04-deep-linking.yaml
│       │   │   └── 05-error-handling.yaml
│       │   ├── config.yaml
│       │   └── helpers/
│       │       └── common-actions.yaml
│       └── src/
├── .github/
│   └── workflows/
│       └── maestro-tests.yml
└── docs/
    └── testing/
        ├── E2E_TESTING_PLAN.md (this file)
        └── MAESTRO_GUIDE.md
```

---

## Test Flows

### Flow 1: App Launch & Basic Navigation

**File:** `.maestro/flows/01-app-launch.yaml`

```yaml
appId: com.mukulchugh.brik-example-app
name: App Launch and Navigation
tags:
  - "smoke"
  - "critical"
  - "on:pr"
---
# Clear app state
- clearState

# Launch app
- launchApp

# Verify app launched successfully
- assertVisible: "Brik Example App"

# Verify main components are present
- assertVisible:
    id: "app-container"

# Take screenshot
- takeScreenshot: "01-app-launched"
```

---

### Flow 2: Widget Manager API

**File:** `.maestro/flows/02-widget-update.yaml`

```yaml
appId: com.mukulchugh.brik-example-app
name: Widget Update Flow
tags:
  - "widget"
  - "api"
  - "on:pr"
env:
  WIDGET_NAME: "WeatherWidget"
---
- clearState
- launchApp

# Navigate to widget demo
- tapOn:
    id: "widget-demo-button"

- assertVisible: "Widget Manager Demo"

# Update widget data
- tapOn:
    id: "update-widget-button"

# Wait for update to complete
- assertVisible:
    id: "update-success-message"
    timeout: 5000

# Verify update status
- assertVisible: "Widget updated successfully"

# Take screenshot
- takeScreenshot: "02-widget-updated"

# Test error handling - invalid data
- tapOn:
    id: "test-invalid-data"

- assertVisible:
    text: "Invalid widget data"
    timeout: 3000

# Verify error is displayed
- assertVisible:
    id: "error-message"

- takeScreenshot: "02-widget-error"
```

---

### Flow 3: Live Activities Lifecycle

**File:** `.maestro/flows/03-live-activity.yaml`

```yaml
appId: com.mukulchugh.brik-example-app
name: Live Activities Full Lifecycle
tags:
  - "live-activity"
  - "critical"
  - "ios-only"
---
- clearState
- launchApp

# Navigate to Live Activity demo
- tapOn:
    id: "live-activity-demo"

- assertVisible: "Order Tracking Demo"

# Start Live Activity
- tapOn:
    id: "start-activity-button"

# Wait for activity to start
- assertVisible:
    text: "Activity started"
    timeout: 5000

# Verify activity ID is displayed
- assertVisible:
    id: "activity-id-display"

- takeScreenshot: "03-activity-started"

# Update activity
- tapOn:
    id: "update-progress-button"

- assertVisible:
    text: "Activity updated"
    timeout: 3000

- takeScreenshot: "03-activity-updated"

# End activity
- tapOn:
    id: "end-activity-button"

- assertVisible:
    text: "Activity ended"
    timeout: 3000

- takeScreenshot: "03-activity-ended"

# Verify activity is no longer active
- assertNotVisible:
    id: "active-activity-indicator"
```

---

### Flow 4: Deep Linking

**File:** `.maestro/flows/04-deep-linking.yaml`

```yaml
appId: com.mukulchugh.brik-example-app
name: Deep Link Handling
tags:
  - "deep-link"
  - "widget"
---
- clearState

# Open app via deep link
- launchApp:
    arguments:
      url: "brikexample://details/42"

# Verify deep link was handled
- assertVisible:
    text: "Order Details"
    timeout: 5000

# Verify correct data is displayed
- assertVisible: "Order #42"

- takeScreenshot: "04-deeplink-details"

# Test invalid deep link
- launchApp:
    clearState: true
    arguments:
      url: "brikexample://invalid/route"

# Should show error or fallback screen
- assertVisible:
    text: "Not Found"
    timeout: 3000

- takeScreenshot: "04-deeplink-error"
```

---

### Flow 5: Error Handling & Edge Cases

**File:** `.maestro/flows/05-error-handling.yaml`

```yaml
appId: com.mukulchugh.brik-example-app
name: Error Handling and Edge Cases
tags:
  - "error-handling"
  - "edge-cases"
---
- clearState
- launchApp

# Test 1: Widget Manager with no widget data
- tapOn:
    id: "widget-demo-button"

- tapOn:
    id: "clear-widget-button"

- assertVisible:
    text: "Widget cleared"
    timeout: 3000

# Test 2: Live Activity without permissions (iOS)
- tapOn:
    id: "live-activity-demo"

# Try to start activity
- tapOn:
    id: "start-activity-button"

# May show permission error or handle gracefully
- waitForAnimationToEnd

# Verify error handling
- assertVisible:
    id: "permission-error|activity-started"
    timeout: 5000

- takeScreenshot: "05-permission-handling"

# Test 3: Multiple rapid updates
- tapOn:
    id: "rapid-update-test"

- assertVisible:
    text: "Throttling active"
    timeout: 3000

- takeScreenshot: "05-throttling"

# Test 4: Network error simulation
- tapOn:
    id: "simulate-network-error"

- assertVisible:
    text: "Network error"
    timeout: 3000

- takeScreenshot: "05-network-error"
```

---

### Flow 6: Multi-Widget Scenario

**File:** `.maestro/flows/06-multi-widget.yaml`

```yaml
appId: com.mukulchugh.brik-example-app
name: Multiple Widgets Management
tags:
  - "widget"
  - "multi"
---
- clearState
- launchApp

- tapOn:
    id: "multi-widget-demo"

# Update multiple widgets
- tapOn:
    id: "update-all-button"

# Wait for all updates to complete
- assertVisible:
    text: "All widgets updated"
    timeout: 10000

# Verify each widget status
- assertVisible: "WeatherWidget: ✓"
- assertVisible: "CalendarWidget: ✓"
- assertVisible: "StatsWidget: ✓"

- takeScreenshot: "06-multi-widget-success"

# Clear specific widget
- tapOn:
    id: "clear-weather-widget"

- assertVisible:
    text: "WeatherWidget cleared"
    timeout: 3000

# Verify only one widget was cleared
- assertVisible: "CalendarWidget: ✓"
- assertVisible: "StatsWidget: ✓"
- assertNotVisible: "WeatherWidget: ✓"

- takeScreenshot: "06-selective-clear"
```

---

## CI/CD Integration

### GitHub Actions Workflow

**File:** `.github/workflows/maestro-tests.yml`

```yaml
name: Maestro E2E Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  maestro-ios:
    name: iOS E2E Tests
    runs-on: macos-14
    timeout-minutes: 60

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9.6.0

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages
        run: pnpm build

      - name: Setup iOS
        working-directory: examples/brik-example-app
        run: |
          cd ios
          pod install
          cd ..

      - name: Build iOS app
        working-directory: examples/brik-example-app
        run: |
          npx react-native run-ios --configuration Release --simulator "iPhone 15 Pro"

      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH

      - name: Run Maestro tests
        working-directory: examples/brik-example-app
        run: |
          maestro test .maestro/flows --format junit --output maestro-results.xml

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: maestro-ios-results
          path: examples/brik-example-app/maestro-results.xml

      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: maestro-ios-screenshots
          path: ~/.maestro/tests/**/*.png

  maestro-android:
    name: Android E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 60

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9.6.0

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages
        run: pnpm build

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Build Android app
        working-directory: examples/brik-example-app
        run: |
          cd android
          ./gradlew assembleRelease
          cd ..

      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH

      - name: Run Maestro tests
        working-directory: examples/brik-example-app
        run: |
          maestro test .maestro/flows --format junit --output maestro-results.xml

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: maestro-android-results
          path: examples/brik-example-app/maestro-results.xml

      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: maestro-android-screenshots
          path: ~/.maestro/tests/**/*.png

  maestro-cloud:
    name: Maestro Cloud Tests
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9.6.0

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages
        run: pnpm build

      - name: Build app
        working-directory: examples/brik-example-app
        run: |
          # Build both iOS and Android
          cd ios && pod install && cd ..
          npx react-native run-ios --configuration Release --simulator "iPhone 15 Pro"
          cd android && ./gradlew assembleRelease && cd ..

      - name: Install Maestro CLI
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH

      - name: Run tests on Maestro Cloud
        working-directory: examples/brik-example-app
        env:
          MAESTRO_CLOUD_API_KEY: ${{ secrets.MAESTRO_CLOUD_API_KEY }}
        run: |
          maestro cloud \
            --apiKey $MAESTRO_CLOUD_API_KEY \
            --app-file ios/build/Build/Products/Release-iphonesimulator/BrikExampleApp.app \
            --app-file android/app/build/outputs/apk/release/app-release.apk \
            .maestro/flows
```

---

## Configuration Files

### Maestro Config

**File:** `examples/brik-example-app/.maestro/config.yaml`

```yaml
# Maestro configuration for Brik Example App
name: Brik Example App E2E Tests
appId: com.mukulchugh.brik-example-app

# Default settings
env:
  SCREENSHOT_DIR: "screenshots"
  TIMEOUT: 30000

# Tags for test organization
tags:
  smoke: "Quick smoke tests"
  critical: "Critical user paths"
  widget: "Widget-related tests"
  live-activity: "Live Activity tests"
  ios-only: "iOS-specific tests"
  android-only: "Android-specific tests"
  on:pr: "Run on pull requests"
  on:nightly: "Run on nightly builds"

# Platform-specific config
ios:
  permissions:
    notifications: ALLOW
    location: DENY

android:
  permissions:
    notifications: ALLOW
    location: DENY
```

---

## Helper Flows

### Common Actions

**File:** `examples/brik-example-app/.maestro/helpers/common-actions.yaml`

```yaml
# Common reusable actions

# Navigate to home screen
- runFlow:
    when:
      visible: "Back"
    commands:
      - tapOn: "Back"
      - tapOn: "Home"

# Wait for network request
- runFlow:
    commands:
      - waitForAnimationToEnd
      - extendedWaitUntil:
          visible:
            id: "loading-indicator"
          timeout: 10000

# Dismiss any alerts
- runFlow:
    when:
      visible: "OK|Allow|Dismiss"
    commands:
      - tapOn: "OK|Allow|Dismiss"
```

---

## Testing Widgets (Hybrid Approach)

### Limitation

Maestro **cannot directly test iOS WidgetKit widgets or Live Activities** because they run in separate extension processes outside the main app.

### Solution: Hybrid Testing Strategy

#### 1. **Maestro Tests (App Side)**
Test the APIs and app functionality that controls widgets:
- Widget data updates via `widgetManager.updateWidget()`
- Live Activity lifecycle (`startActivity`, `updateActivity`, `endActivity`)
- API responses and error handling

#### 2. **XCUITest (Widget Side)**
For widget-specific UI testing on iOS:

**File:** `examples/brik-example-app/ios/BrikExampleAppUITests/WidgetTests.swift`

```swift
import XCTest

class WidgetTests: XCTestCase {
    func testWeatherWidgetAppearance() {
        // Launch the widget on simulator
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")

        // Add widget to home screen (manual setup required)
        // Verify widget displays correct data
        let widget = springboard.otherElements["WeatherWidget"]
        XCTAssertTrue(widget.exists)

        // Verify temperature is displayed
        let temperature = widget.staticTexts.containing(NSPredicate(format: "label CONTAINS '°'")).firstMatch
        XCTAssertTrue(temperature.exists)
    }

    func testLiveActivityLockScreen() {
        let app = XCUIApplication()
        app.launch()

        // Start Live Activity
        app.buttons["Start Live Activity"].tap()

        // Lock device (simulator shortcut: Cmd+L)
        // Verify Live Activity appears on lock screen
        // Note: This requires manual verification as XCUITest
        // has limited lock screen access
    }
}
```

#### 3. **Manual Testing Checklist**

Create a manual testing guide:

**File:** `docs/testing/WIDGET_MANUAL_TESTING.md`

- [ ] Home screen widget displays after `updateWidget()` call
- [ ] Widget data updates within 15 minutes
- [ ] Widget responds to taps (deep links work)
- [ ] Live Activity appears on lock screen
- [ ] Dynamic Island shows correct states (compact, minimal, expanded)
- [ ] Live Activity updates in real-time
- [ ] Widget handles missing/invalid data gracefully

---

## Test Data Management

### Environment Variables

**File:** `examples/brik-example-app/.maestro/.env`

```bash
# Test environment variables
WIDGET_NAME=WeatherWidget
ORDER_ID=12345
MERCHANT_NAME=Test Pizza Co
DEEP_LINK_BASE=brikexample://
```

### Test Fixtures

**File:** `examples/brik-example-app/.maestro/fixtures/widget-data.json`

```json
{
  "weatherWidget": {
    "temperature": 72,
    "condition": "Sunny",
    "location": "San Francisco",
    "humidity": 65
  },
  "orderTracking": {
    "orderId": "12345",
    "merchantName": "Test Pizza Co",
    "status": "preparing",
    "eta": 20,
    "progress": 0.3
  }
}
```

---

## Running Tests Locally

### iOS

```bash
# Navigate to example app
cd examples/brik-example-app

# Build and run app on simulator
npx react-native run-ios --simulator "iPhone 15 Pro"

# Run all Maestro tests
maestro test .maestro/flows

# Run specific flow
maestro test .maestro/flows/03-live-activity.yaml

# Run tests with specific tags
maestro test .maestro/flows --include-tags=smoke,critical

# Run with Maestro Studio (visual debugging)
maestro studio

# Record a new flow
maestro record .maestro/flows/new-flow.yaml
```

### Android

```bash
# Start emulator
emulator -avd Pixel_6_Pro_API_34

# Build and run app
npx react-native run-android

# Run Maestro tests
maestro test .maestro/flows

# Run Android-specific tests
maestro test .maestro/flows --include-tags=android-only
```

---

## Continuous Testing

### Maestro Cloud

For parallel execution and CI/CD:

```bash
# Upload and run tests in cloud
maestro cloud \
  --apiKey $MAESTRO_CLOUD_API_KEY \
  --app-file ./ios/build/BrikExampleApp.app \
  .maestro/flows

# Run with multiple devices
maestro cloud \
  --apiKey $MAESTRO_CLOUD_API_KEY \
  --app-file ./android/app/build/outputs/apk/release/app-release.apk \
  --device-locale en_US \
  --os-version 13,14 \
  .maestro/flows
```

### Maestro Studio

For test creation and debugging:

```bash
# Launch Maestro Studio
maestro studio

# 1. App launches in simulator
# 2. Click elements to generate commands
# 3. Test commands in real-time
# 4. Export to YAML flow
```

---

## Performance & Optimization

### Test Execution Speed

- **Parallel execution:** Run flows concurrently in Maestro Cloud
- **Tag filtering:** Run only relevant tests per PR
- **Smart waiting:** Maestro auto-waits for elements (no hardcoded sleeps)

### Flakiness Reduction

```yaml
# Use explicit timeouts
- assertVisible:
    id: "element"
    timeout: 10000

# Use retry logic
- runFlow:
    file: unstable-action.yaml
    retries: 3

# Wait for animations
- waitForAnimationToEnd

# Use visible percentage
- scrollUntilVisible:
    element:
      text: "Item"
    visibilityPercentage: 100
```

---

## Best Practices

### 1. **Use testID for Element Selection**

```tsx
// React Native component
<Button testID="start-activity-button" onPress={startActivity}>
  Start Live Activity
</Button>
```

```yaml
# Maestro flow
- tapOn:
    id: "start-activity-button"
```

### 2. **Organize Tests by User Journey**

- ✅ One flow = one user scenario
- ✅ Use descriptive names: `03-live-activity.yaml` not `test3.yaml`
- ✅ Tag tests for filtering

### 3. **Handle Platform Differences**

```yaml
# iOS-only test
tags:
  - "ios-only"
---
- launchApp
- runFlow:
    when:
      platform: iOS
    commands:
      - tapOn: "iOS-specific button"

# Android-only test
tags:
  - "android-only"
---
- launchApp
- runFlow:
    when:
      platform: Android
    commands:
      - tapOn: "Android-specific button"
```

### 4. **Use Screenshots for Debugging**

```yaml
- takeScreenshot: "before-action"
- tapOn: "button"
- takeScreenshot: "after-action"
```

### 5. **Test Error States**

```yaml
# Test permission denial
- tapOn: "request-notification"
- assertVisible: "Permission denied"

# Test network errors
- stopApp
- launchApp:
    arguments:
      mockNetworkError: true
- assertVisible: "Network error"
```

---

## Metrics & Reporting

### Key Metrics

- **Test Coverage:** % of user journeys covered
- **Pass Rate:** Tests passed / Total tests
- **Execution Time:** Time per flow
- **Flakiness:** Failed retries / Total runs

### Test Reports

Maestro generates:
- JUnit XML reports for CI
- Screenshots on failure
- Video recordings (Maestro Cloud)
- Execution logs

### Dashboard

Monitor in CI:
- Test trend over time
- Flaky test identification
- Performance regression detection

---

## Roadmap

### Phase 1: Core Flows (Week 1-2)
- [x] App launch
- [x] Widget update API
- [x] Live Activity lifecycle
- [x] Deep linking
- [x] Error handling

### Phase 2: CI Integration (Week 3)
- [ ] GitHub Actions workflow
- [ ] Maestro Cloud setup
- [ ] Test reporting
- [ ] Slack notifications

### Phase 3: Advanced Testing (Week 4+)
- [ ] XCUITest for widget UI
- [ ] Performance testing
- [ ] Accessibility testing
- [ ] Visual regression testing

### Phase 4: Optimization (Ongoing)
- [ ] Parallel execution
- [ ] Flakiness reduction
- [ ] Test data management
- [ ] Mock server integration

---

## Resources

### Documentation
- **Maestro Docs:** https://maestro.mobile.dev
- **React Native Support:** https://docs.maestro.dev/platform-support/react-native
- **Maestro Cloud:** https://cloud.mobile.dev

### Examples
- **Official Examples:** https://github.com/mobile-dev-inc/maestro/tree/main/maestro-test/src/test/resources
- **React Native Examples:** https://github.com/kiki-le-singe/react-native-maestro

### Tools
- **Maestro Studio:** Visual flow builder
- **Maestro Cloud:** CI/CD test execution
- **XCUITest:** iOS widget testing
- **Espresso/UIAutomator:** Android widget testing

---

## Conclusion

This E2E testing plan provides comprehensive coverage for the Brik example app using Maestro, with a hybrid approach for widget testing. The strategy balances:

- ✅ **Automated app testing** with Maestro (main app, APIs)
- ⚠️ **Manual widget verification** (lock screen, home screen)
- 🔧 **XCUITest integration** for iOS widget UI (optional)
- 🚀 **CI/CD integration** with GitHub Actions
- 📊 **Metrics and reporting** for quality assurance

**Next Steps:**
1. Set up Maestro in `brik-example-app`
2. Create initial test flows
3. Integrate with CI/CD
4. Iterate based on feedback and coverage gaps
