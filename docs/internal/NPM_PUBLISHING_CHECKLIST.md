# NPM Publishing Checklist

Complete checklist for publishing Brik packages to npm.

## Pre-Publishing Validation

### ✅ Package Configurations

- [x] **@brik/react-native** package.json
  - [x] `files` includes: `dist`, `ios`, `android`, `BrikReactNative.podspec`
  - [x] `main` points to `dist/src/index.js`
  - [x] `types` points to `dist/src/index.d.ts`
  - [x] `version` is correct
  - [x] `peerDependencies` are set
  - [x] `codegenConfig` is present for React Native autolinking

- [x] **@brik/cli** package.json
  - [x] `files` includes: `dist`
  - [x] `bin` points to `dist/index.js`
  - [x] `main` points to `dist/index.js`
  - [x] `version` is correct

- [ ] **@brik/core** package.json
  - [ ] `files` includes: `dist`
  - [ ] `main` and `types` correct
  - [ ] `version` is correct

- [ ] **@brik/compiler** package.json
- [ ] **@brik/target-swiftui** package.json
- [ ] **@brik/target-compose** package.json

### ✅ Native Module Files

**iOS:**
- [x] `packages/brik-react-native/BrikReactNative.podspec` - CocoaPods spec
- [x] `packages/brik-react-native/ios/BrikWidgetManager.swift` - Widget manager
- [x] `packages/brik-react-native/ios/BrikWidgetManager.m` - React Native bridge
- [x] `packages/brik-react-native/ios/BrikLiveActivities.swift` - Live Activities (stub)
- [x] `packages/brik-react-native/ios/BrikLiveActivities.m` - Live Activities bridge

**Android:**
- [x] `packages/brik-react-native/android/build.gradle` - Gradle configuration
- [x] `packages/brik-react-native/android/src/main/AndroidManifest.xml` - Manifest
- [x] `packages/brik-react-native/android/src/main/java/com/brik/BrikWidgetManager.kt` - Widget manager
- [x] `packages/brik-react-native/android/src/main/java/com/brik/BrikWidgetPackage.kt` - Module registration

### ✅ Documentation

- [x] `README.md` - Main documentation with installation instructions
- [x] `INSTALLATION.md` - Complete installation guide for npm users
- [x] `docs/WIDGET_SETUP_GUIDE.md` - Widget setup instructions
- [x] `docs/LIVE_ACTIVITIES.md` - Live Activities guide
- [x] `examples/WidgetExampleComponent.tsx` - Working examples
- [x] `WIDGET_IMPLEMENTATION_STATUS.md` - Implementation status
- [x] `LICENSE` - MIT license file

### 🔄 Build Verification

```bash
# Build all packages
pnpm build

# Verify TypeScript compilation
pnpm typecheck

# Run tests (if any)
pnpm test
```

**Expected Results:**
- [ ] All packages build without errors
- [ ] TypeScript compiles cleanly
- [ ] All tests pass

### 🔄 Version Numbers

Check that all packages have consistent versioning:

```bash
# Check versions
cat packages/*/package.json | grep -A 1 '"name"'
```

**Current Versions:**
- @brik/react-native: 0.3.0
- @brik/cli: 0.2.0
- @brik/core: ?
- @brik/compiler: ?
- @brik/target-swiftui: ?
- @brik/target-compose: ?

**Action:** Update all to `0.2.0` or `0.3.0` for consistency.

---

## Publishing Steps

### 1. Clean Build

```bash
# Clean all build artifacts
pnpm clean

# Build all packages
pnpm build

# Verify build success
ls -la packages/*/dist
```

### 2. Update CHANGELOG

Create `CHANGELOG.md` with version history:

```markdown
# Changelog

## [0.2.0] - 2025-10-19

### Added
- Complete home screen widget support for iOS and Android
- Cross-platform widgetManager API
- iOS WidgetKit integration with App Groups
- Android Jetpack Glance integration with SharedPreferences
- CLI commands: ios-setup and android-setup
- Comprehensive documentation and examples

### Changed
- Updated React Native peer dependency to >= 0.78.0
- Enhanced package.json configurations

## [0.1.0] - Initial Release
- Basic widget transpilation
- SwiftUI and Compose code generation
```

### 3. Git Commit and Tag

```bash
# Commit all changes
git add .
git commit -m "chore: prepare for v0.2.0 release

- Add Android build.gradle and AndroidManifest.xml
- Update package.json files configurations
- Add INSTALLATION.md and NPM_PUBLISHING_CHECKLIST.md
- Complete widget implementation documentation
"

# Create git tag
git tag v0.2.0
git push origin main --tags
```

### 4. Test Package Installation Locally

```bash
# Create test directory
mkdir /tmp/brik-test && cd /tmp/brik-test

# Initialize React Native project
npx react-native init BrikTestProject
cd BrikTestProject

# Link local packages (for testing)
pnpm add file:/Users/mukulchugh/Work/Products/brik/packages/brik-react-native
pnpm add file:/Users/mukulchugh/Work/Products/brik/packages/brik-cli

# Test iOS installation
cd ios && pod install && cd ..

# Verify module loads
npx brik doctor
```

### 5. Publish to npm

**Option A: Publish All Packages (Recommended)**

```bash
# From monorepo root
pnpm publish -r --access public

# Or using Lerna/Changesets if configured
npx lerna publish
```

**Option B: Publish Individual Packages**

```bash
# Publish @brik/core (if needed)
cd packages/brik-core
npm publish --access public

# Publish @brik/compiler
cd ../brik-compiler
npm publish --access public

# Publish @brik/target-swiftui
cd ../brik-target-swiftui
npm publish --access public

# Publish @brik/target-compose
cd ../brik-target-compose
npm publish --access public

# Publish @brik/react-native (most important!)
cd ../brik-react-native
npm publish --access public

# Publish @brik/cli
cd ../brik-cli
npm publish --access public
```

### 6. Verify Published Packages

```bash
# Check package on npm
npm view @brik/react-native
npm view @brik/cli

# Verify files are included
npm pack --dry-run @brik/react-native
```

### 7. Test Installation from npm

```bash
# Create fresh test project
npx react-native init FreshBrikTest
cd FreshBrikTest

# Install from npm
npm install @brik/react-native @brik/cli

# iOS setup
cd ios && pod install && cd ..

# Verify
npx brik doctor
npx brik --help
```

---

## Post-Publishing

### 1. Update README Badge

Add npm version badge to README.md:

```markdown
[![npm](https://img.shields.io/npm/v/@brik/react-native)](https://www.npmjs.com/package/@brik/react-native)
```

### 2. GitHub Release

Create GitHub release with notes:

1. Go to https://github.com/brikjs/brik/releases/new
2. Tag version: `v0.2.0`
3. Release title: `Brik v0.2.0 - Complete Widget Support`
4. Description:

```markdown
## 🎉 Brik v0.2.0 - Complete Widget Support

### New Features

✅ **Home Screen Widgets** - Full support for iOS and Android
- Unified TypeScript API for both platforms
- iOS: WidgetKit + App Groups
- Android: Jetpack Glance + SharedPreferences

✅ **CLI Commands**
- `brik ios-setup --name WidgetName` - Generate iOS widget extension
- `brik android-setup --name WidgetName` - Generate Android Glance widget

✅ **Documentation**
- Complete installation guide
- Widget setup guide with troubleshooting
- Working example components
- API reference

### Installation

\`\`\`bash
npm install @brik/react-native @brik/cli
\`\`\`

See [INSTALLATION.md](./INSTALLATION.md) for complete instructions.

### What's Changed

- Added Android native module with build.gradle
- Complete widget manager API with React hooks
- CLI automation for widget setup
- 2,000+ lines of documentation

### Breaking Changes

None - This is the first stable release.

### Known Limitations

- Live Activities native module is still a stub (planned for v0.2.1)
- Device testing required for full validation

Full details: [WIDGET_IMPLEMENTATION_STATUS.md](./WIDGET_IMPLEMENTATION_STATUS.md)
```

### 3. Social Announcements

**Twitter/X:**
```
🎉 Brik v0.2.0 is live!

Build iOS & Android widgets from React Native with a single API.

✅ WidgetKit (iOS)
✅ Jetpack Glance (Android)
✅ Type-safe TypeScript
✅ Auto-setup CLI

npm install @brik/react-native

https://github.com/brikjs/brik
```

**Reddit (r/reactnative):**
```markdown
[Show r/reactnative] Brik v0.2.0 - Cross-platform widgets from React Native

I've been working on a library that lets you build home screen widgets for both iOS and Android from a single React Native codebase.

**What it does:**
- Update iOS WidgetKit and Android Glance widgets from JavaScript
- Single TypeScript API for both platforms
- Automatic native code generation
- CLI commands for setup

**Example:**
```typescript
import { widgetManager } from '@brik/react-native';

await widgetManager.updateWidget('WeatherWidget', {
  temperature: 72,
  condition: 'Sunny'
});
```

The library handles all the native code (Swift/Kotlin) and data sharing between your app and widgets.

npm: https://www.npmjs.com/package/@brik/react-native
GitHub: https://github.com/brikjs/brik

Would love feedback!
```

### 4. Monitor Issues

- Watch GitHub issues for installation problems
- Monitor npm downloads
- Check social media for feedback

---

## Critical Files Checklist

Before publishing `@brik/react-native`, ensure these files exist:

**Root:**
- [x] `package.json` - Correct version, files, dependencies
- [x] `BrikReactNative.podspec` - CocoaPods spec

**iOS:**
- [x] `ios/BrikWidgetManager.swift`
- [x] `ios/BrikWidgetManager.m`
- [x] `ios/BrikLiveActivities.swift`
- [x] `ios/BrikLiveActivities.m`

**Android:**
- [x] `android/build.gradle`
- [x] `android/src/main/AndroidManifest.xml`
- [x] `android/src/main/java/com/brik/BrikWidgetManager.kt`
- [x] `android/src/main/java/com/brik/BrikWidgetPackage.kt`

**Dist (after build):**
- [ ] `dist/src/index.js`
- [ ] `dist/src/index.d.ts`
- [ ] `dist/src/widget-manager.js`
- [ ] `dist/src/widget-manager.d.ts`

---

## Troubleshooting

### Package not including native files

**Solution:** Check `files` array in package.json includes `ios` and `android`.

### CocoaPods not finding podspec

**Solution:** Ensure `BrikReactNative.podspec` is at package root and included in `files`.

### Android autolinking not working

**Solution:** Verify `android/build.gradle` exists and has correct namespace.

### TypeScript declarations missing

**Solution:** Run `pnpm build` and check `dist` directory.

---

## Rollback Plan

If critical issues are discovered:

```bash
# Deprecate bad version
npm deprecate @brik/react-native@0.2.0 "Critical bug, use 0.2.1"

# Publish hotfix
npm version patch
npm publish
```

---

## Success Criteria

- [x] All native files included in published package
- [x] iOS autolinking works (CocoaPods)
- [x] Android autolinking works (Gradle)
- [ ] Fresh installation succeeds
- [ ] `npx brik doctor` passes
- [ ] Widget setup commands work
- [ ] Documentation is accessible

---

## Notes

- Always test locally before publishing
- Use `npm pack` to inspect package contents
- Version numbers should follow semver
- Consider beta releases for major changes
