# Maestro Quick Start Guide for Brik

## Installation (5 minutes)

```bash
# Install Maestro CLI
curl -Ls "https://get.maestro.mobile.dev" | bash

# Add to PATH
export PATH="$PATH:$HOME/.maestro/bin"

# Verify installation
maestro --version

# Install iOS dependencies (macOS only)
brew tap facebook/fb
brew install facebook/fb/idb-companion
```

## Create Your First Test (10 minutes)

### 1. Create test directory

```bash
cd examples/brik-example-app
mkdir -p .maestro/flows
```

### 2. Write a simple test

**`.maestro/flows/01-smoke-test.yaml`**

```yaml
appId: com.mukulchugh.brik-example-app
name: Smoke Test - App Launch
tags:
  - smoke
---
- clearState
- launchApp
- assertVisible: "Brik Example App"
- takeScreenshot: "app-launched"
```

### 3. Run the test

```bash
# Start iOS simulator
npx react-native run-ios

# Run test
maestro test .maestro/flows/01-smoke-test.yaml
```

✅ **Success!** You just ran your first Maestro test!

---

## Add testID to Components (5 minutes)

Update your React Native components:

```tsx
// Before
<Button onPress={updateWidget}>
  Update Widget
</Button>

// After
<Button testID="update-widget-button" onPress={updateWidget}>
  Update Widget
</Button>
```

Now you can target it in tests:

```yaml
- tapOn:
    id: "update-widget-button"
```

---

## Visual Test Creation with Maestro Studio (10 minutes)

```bash
# Launch Maestro Studio
maestro studio

# 1. App opens in simulator
# 2. Click elements to generate commands
# 3. Commands appear in the right panel
# 4. Export to .maestro/flows/new-test.yaml
```

**Benefits:**
- 🎯 Point-and-click test creation
- 🔍 Inspect element properties
- ⚡ Real-time command testing
- 🤖 AI-powered suggestions

---

## Run Tests in CI (15 minutes)

### GitHub Actions (Simple)

**`.github/workflows/maestro.yml`**

```yaml
name: E2E Tests

on: [pull_request]

jobs:
  test:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9.6.0

      - run: pnpm install
      - run: pnpm build

      - name: Install Maestro
        run: curl -Ls "https://get.maestro.mobile.dev" | bash

      - name: Run tests
        run: |
          cd examples/brik-example-app
          npx react-native run-ios --simulator "iPhone 15 Pro"
          maestro test .maestro/flows
```

---

## Common Commands

```bash
# Run all tests
maestro test .maestro/flows

# Run specific test
maestro test .maestro/flows/01-smoke-test.yaml

# Run tests with tags
maestro test .maestro/flows --include-tags=smoke

# Open Maestro Studio
maestro studio

# Record a new test
maestro record .maestro/flows/new-test.yaml
```

---

## Example: Test Widget Update

**`.maestro/flows/02-widget-update.yaml`**

```yaml
appId: com.mukulchugh.brik-example-app
name: Widget Update Test
---
- clearState
- launchApp

# Navigate to widget demo
- tapOn:
    id: "widget-demo-tab"

# Update widget
- tapOn:
    id: "update-widget-button"

# Verify success
- assertVisible:
    text: "Widget updated successfully"
    timeout: 5000

# Take screenshot
- takeScreenshot: "widget-updated"
```

---

## Example: Test Live Activity

**`.maestro/flows/03-live-activity.yaml`**

```yaml
appId: com.mukulchugh.brik-example-app
name: Live Activity Test
tags:
  - live-activity
  - ios-only
---
- clearState
- launchApp

# Navigate to Live Activity demo
- tapOn:
    id: "live-activity-tab"

# Start activity
- tapOn:
    id: "start-activity-button"

- assertVisible: "Activity started"
- takeScreenshot: "activity-started"

# Update activity
- tapOn:
    id: "update-button"

- assertVisible: "Activity updated"
- takeScreenshot: "activity-updated"

# End activity
- tapOn:
    id: "end-button"

- assertVisible: "Activity ended"
```

---

## Debugging Failed Tests

### 1. Check screenshots

```bash
# Screenshots saved to:
~/.maestro/tests/<timestamp>/screenshots/
```

### 2. View logs

```bash
# Maestro shows detailed logs on failure
maestro test .maestro/flows/test.yaml --debug
```

### 3. Use Maestro Studio

```bash
# Run test step-by-step
maestro studio
# Load your flow
# Execute commands one at a time
```

---

## Best Practices

### ✅ DO

- Use `testID` for all interactive elements
- Write one flow per user scenario
- Use descriptive names: `login-flow.yaml` not `test1.yaml`
- Add tags for organization
- Take screenshots on important steps
- Use explicit timeouts for async operations

### ❌ DON'T

- Use hardcoded `sleep` commands (use `assertVisible` with timeout)
- Create mega-flows (keep them focused)
- Rely on text matching for buttons (use `testID`)
- Forget to `clearState` at the start of tests
- Test implementation details (test user behavior)

---

## Troubleshooting

### iOS Simulator not found

```bash
# List available simulators
xcrun simctl list devices

# Boot simulator
xcrun simctl boot "iPhone 15 Pro"
```

### Android Emulator not found

```bash
# List emulators
emulator -list-avds

# Start emulator
emulator -avd Pixel_6_Pro_API_34
```

### Element not found

```yaml
# Add explicit timeout
- assertVisible:
    id: "element"
    timeout: 10000

# Wait for animations
- waitForAnimationToEnd

# Use text fallback
- assertVisible:
    id: "button|Button Text"
```

---

## Next Steps

1. ✅ Install Maestro
2. ✅ Create first test
3. ✅ Add testIDs to components
4. ✅ Run tests locally
5. ⬜ Set up CI/CD
6. ⬜ Create test suite
7. ⬜ Monitor metrics

**Full documentation:** [`docs/testing/E2E_TESTING_PLAN.md`](./E2E_TESTING_PLAN.md)

---

## Resources

- **Maestro Docs:** https://maestro.mobile.dev
- **React Native Guide:** https://docs.maestro.dev/platform-support/react-native
- **Examples:** https://github.com/mobile-dev-inc/maestro/tree/main/maestro-test
- **Maestro Cloud:** https://cloud.mobile.dev (for CI/CD)

---

**Estimated setup time:** 30-45 minutes
**First test creation:** 10-15 minutes
**CI integration:** 15-30 minutes
