# Brik Testing Documentation

This directory contains testing documentation and guides for the Brik project.

## 📚 Available Guides

### [E2E Testing Plan](./E2E_TESTING_PLAN.md)
**Comprehensive end-to-end testing strategy using Maestro**

- 📋 Complete testing strategy for Brik
- 🎯 Test flows for all features (widgets, Live Activities, deep linking)
- 🔧 CI/CD integration with GitHub Actions
- 📊 Metrics and reporting
- 🚀 Maestro Cloud setup
- 🧪 Hybrid approach for widget testing

**Topics covered:**
- App-level testing with Maestro
- Widget/Extension testing (manual + XCUITest)
- Integration testing
- CI/CD workflows
- Test data management
- Best practices

---

### [Maestro Quick Start Guide](./MAESTRO_QUICK_START.md)
**Get started with Maestro in 30 minutes**

- ⚡ Fast setup guide
- 🎯 First test in 10 minutes
- 🛠️ Common commands and examples
- 🐛 Troubleshooting tips
- ✅ Best practices

**Perfect for:**
- First-time Maestro users
- Quick reference
- Team onboarding

---

## 🚀 Quick Start

### 1. Install Maestro (5 min)

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
export PATH="$PATH:$HOME/.maestro/bin"
maestro --version
```

### 2. Create First Test (10 min)

```yaml
# .maestro/flows/smoke-test.yaml
appId: com.mukulchugh.brik-example-app
---
- clearState
- launchApp
- assertVisible: "Brik Example App"
```

### 3. Run Tests

```bash
cd examples/brik-example-app
maestro test .maestro/flows
```

---

## 📖 Testing Strategy Overview

### What We Test

| Component | Tool | Coverage |
|-----------|------|----------|
| **Main App** | Maestro | ✅ Full automation |
| **Widget APIs** | Maestro | ✅ Full automation |
| **Live Activities APIs** | Maestro | ✅ Full automation |
| **Deep Linking** | Maestro | ✅ Full automation |
| **Widget UI (iOS)** | XCUITest + Manual | ⚠️ Partial automation |
| **Widget UI (Android)** | Espresso + Manual | ⚠️ Partial automation |

### Test Pyramid

```
        /\
       /  \        E2E Tests (Maestro)
      /____\       - Critical user paths
     /      \      - Widget updates
    /        \     - Live Activities
   /   UI     \    - Deep linking
  /____________\

  Integration Tests
  - CLI commands
  - Code generation
  - Build system

  Unit Tests
  - Core compiler
  - Type validation
  - Helpers
```

---

## 🎯 Test Coverage Goals

### Phase 1: Core Flows ✅
- [x] App launch and navigation
- [x] Widget update API
- [x] Live Activity lifecycle
- [x] Deep linking
- [x] Error handling

### Phase 2: CI Integration 🚧
- [ ] GitHub Actions workflow
- [ ] Maestro Cloud setup
- [ ] Test reporting
- [ ] Automated runs on PR

### Phase 3: Advanced Testing 📅
- [ ] XCUITest for widget UI
- [ ] Performance testing
- [ ] Accessibility testing
- [ ] Visual regression

---

## 🔧 Tools & Frameworks

### Primary: Maestro
- **What:** Cross-platform E2E mobile testing
- **Why:** YAML-based, cross-platform, low learning curve
- **Use for:** Main app testing, API testing

### Secondary: XCUITest (iOS)
- **What:** Native iOS UI testing framework
- **Why:** Access to widget extensions
- **Use for:** Widget UI verification

### Secondary: Espresso (Android)
- **What:** Native Android UI testing framework
- **Why:** Access to widget components
- **Use for:** Android widget testing

---

## 📁 Directory Structure

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
│       └── ios/
│           └── BrikExampleAppUITests/
│               └── WidgetTests.swift
├── .github/
│   └── workflows/
│       └── maestro-tests.yml
└── docs/
    └── testing/
        ├── E2E_TESTING_PLAN.md
        ├── MAESTRO_QUICK_START.md
        └── README.md (this file)
```

---

## 🏃 Running Tests

### Locally

```bash
# iOS
cd examples/brik-example-app
npx react-native run-ios --simulator "iPhone 15 Pro"
maestro test .maestro/flows

# Android
npx react-native run-android
maestro test .maestro/flows

# Specific flow
maestro test .maestro/flows/03-live-activity.yaml

# With tags
maestro test .maestro/flows --include-tags=smoke,critical
```

### CI/CD

```bash
# GitHub Actions (automatic on PR)
# See .github/workflows/maestro-tests.yml

# Maestro Cloud
maestro cloud \
  --apiKey $MAESTRO_CLOUD_API_KEY \
  --app-file ./app.apk \
  .maestro/flows
```

---

## 🐛 Debugging

### Screenshots
```bash
# Automatically saved on failure
~/.maestro/tests/<timestamp>/screenshots/
```

### Maestro Studio
```bash
# Visual test runner
maestro studio

# Step-by-step execution
# Element inspection
# Real-time command testing
```

### Logs
```bash
# Verbose logging
maestro test .maestro/flows --debug

# Export logs
maestro test .maestro/flows --format junit --output results.xml
```

---

## 📊 Metrics & Reporting

### Key Metrics
- **Test Coverage:** User journeys covered
- **Pass Rate:** Success percentage
- **Execution Time:** Average per flow
- **Flakiness:** Retry/failure ratio

### Reports
- JUnit XML for CI integration
- Screenshots on failure
- Video recordings (Maestro Cloud)
- Execution logs

---

## ✅ Best Practices

### Writing Tests
1. ✅ Use `testID` for element targeting
2. ✅ One flow = one user scenario
3. ✅ Clear, descriptive names
4. ✅ Tag tests appropriately
5. ✅ Handle async with timeouts, not sleeps
6. ✅ Take screenshots at key steps

### Organizing Tests
1. ✅ Group by feature/user journey
2. ✅ Use tags for filtering (`smoke`, `critical`, etc.)
3. ✅ Separate iOS/Android specific tests
4. ✅ Keep flows focused and concise
5. ✅ Reuse common actions via helper flows

### CI/CD
1. ✅ Run smoke tests on every PR
2. ✅ Full suite on main branch
3. ✅ Parallel execution for speed
4. ✅ Automatic notifications on failure
5. ✅ Artifact upload (screenshots, logs)

---

## 🚧 Known Limitations

### Widget Testing
- ⚠️ **Maestro cannot directly test iOS WidgetKit widgets**
  - Widgets run in separate extension process
  - Solution: Test app APIs + manual widget verification
  - Alternative: XCUITest for widget UI

- ⚠️ **Live Activities lock screen testing limited**
  - Maestro has limited lock screen access
  - Solution: Hybrid testing (Maestro + manual)

### Platform-Specific
- ⚠️ iOS: Physical devices not supported (simulators only)
- ✅ Android: Full support for emulators and devices

---

## 📚 Resources

### Documentation
- **Maestro Official:** https://maestro.mobile.dev
- **React Native Support:** https://docs.maestro.dev/platform-support/react-native
- **Maestro Cloud:** https://cloud.mobile.dev

### Examples
- **Official Examples:** [GitHub - mobile-dev-inc/maestro](https://github.com/mobile-dev-inc/maestro/tree/main/maestro-test)
- **React Native Examples:** [GitHub - kiki-le-singe/react-native-maestro](https://github.com/kiki-le-singe/react-native-maestro)

### Community
- **Discord:** [Maestro Community](https://discord.gg/mobile-dev)
- **GitHub Issues:** [mobile-dev-inc/maestro](https://github.com/mobile-dev-inc/maestro/issues)

---

## 🗺️ Roadmap

### Q1 2025
- [x] Testing strategy documentation
- [x] Maestro setup guide
- [ ] Initial test flows
- [ ] CI/CD integration

### Q2 2025
- [ ] XCUITest for widgets
- [ ] Maestro Cloud setup
- [ ] Performance testing
- [ ] 80% coverage goal

### Q3 2025
- [ ] Accessibility testing
- [ ] Visual regression
- [ ] Test data management
- [ ] Mock server integration

---

## 🤝 Contributing

### Adding Tests
1. Create flow in `.maestro/flows/`
2. Use descriptive name and tags
3. Add documentation to flow
4. Test locally before PR
5. Update this README if needed

### Improving Documentation
1. Identify gaps or unclear sections
2. Create/update markdown files
3. Add examples where helpful
4. Submit PR with changes

---

## 📞 Support

- **Questions:** [GitHub Discussions](https://github.com/mukulchugh/brik/discussions)
- **Bug Reports:** [GitHub Issues](https://github.com/mukulchugh/brik/issues)
- **Maestro Help:** [Maestro Discord](https://discord.gg/mobile-dev)

---

**Last Updated:** January 2025
**Status:** 🚧 In Progress
**Coverage:** 🎯 Phase 1 Complete, Phase 2 In Progress
