# Brik Architecture - Complete End-to-End Flow Analysis

## 📊 Package Architecture

```
@brik/core              → IR compiler (TSX → JSON IR)
@brik/compiler          → Orchestrates compilation
@brik/target-swiftui    → IR → SwiftUI code generation
@brik/target-compose    → IR → Jetpack Compose generation
@brik/cli               → Build command & setup tools
@brik/expo-plugin       → Expo prebuild integration
@brik/react-native      → Native bridge (widgetManager, startActivity)
@brik/example-shared    → Example widgets (OrderTracking, Weather)
```

## 🔄 Complete Production Flow

### 1. TSX Widget Definition

```typescript
// src/widgets/OrderTrackingActivity.tsx
/** @brik-activity */
export function OrderTrackingActivity() {
  return {
    activityType: 'OrderTracking',
    attributes: {
      static: { orderId: 'string', merchant: 'string' },
      dynamic: { status: 'string', eta: 'number' }
    },
    regions: {
      lockScreen: <BrikView>...</BrikView>,
      dynamicIsland: { ... }
    }
  };
}
```

### 2. Compilation (brik build)

**Command**: `node brik-cli build --platform ios`

**Flow**:
1. `@brik/compiler` → Finds all files with `@brik-activity` or `@brik-widget`
2. `@brik/core` → Parses TSX → JSON IR (Intermediate Representation)
3. IR saved to `.brik/*.json`
4. `@brik/target-swiftui` → IR → Swift code
5. Output: `ios/BrikActivities/OrderTrackingActivity.swift`

**Generated Swift**:
```swift
struct OrderTrackingAttributes: ActivityAttributes { ... }
struct OrderTrackingActivityWidget: Widget { ... }
class OrderTrackingHandler: BrikActivityHandler { ... }
@objc class OrderTrackingHandlerRegistration: NSObject { ... }
```

### 3. iOS Project Setup (MISSING STEP!)

**This is what's broken!** The generated Swift file is NOT part of any widget extension target.

**What SHOULD happen** (missing from Brik):
1. Create widget extension target (e.g., `BrikWidget.appex`)
2. Add generated Swift files to widget target
3. Configure App Groups in both main app and widget
4. Set bundle IDs correctly (`com.app` and `com.app.widget`)
5. Add entitlements

**Current Brik approach**:
- ✅ Generates Swift code
- ❌ Does NOT create widget extension target
- ❌ Does NOT add files to Xcode project properly
- ⚠️  Expo plugin tries to use `addSourceFile()` which doesn't work for extensions

### 4. Native Bridge Usage

```typescript
import { startActivity, updateActivity, endActivity } from '@brik/react-native';

// Start Live Activity
const token = await startActivity({
  activityType: 'OrderTracking',
  attributes: {
    static: { orderId: '123', merchant: 'Coffee Shop' },
    dynamic: { status: 'Preparing', eta: 15 }
  }
});
```

**Native Flow**:
1. JS calls `BrikLiveActivities.startActivity()`
2. Swift `BrikActivityRegistry` looks up `OrderTrackingHandler`
3. Handler creates `Activity.request()`
4. Returns push token to JS

### 5. Registration System

**How it's supposed to work**:
```swift
// Auto-registration pattern
@objc class OrderTrackingHandlerRegistration: NSObject {
    @objc public static func register() {
        BrikActivityRegistry.shared.register(
            activityType: "OrderTracking",
            handler: OrderTrackingHandler()
        )
    }

    override init() {
        super.init()
        OrderTrackingHandlerRegistration.register()
    }
}

// Force instantiation
private let _ordertrackingHandlerInit = OrderTrackingHandlerRegistration()
```

**Problem**: Swift doesn't execute module-level code unless explicitly referenced. This registration never runs.

## 🚨 Critical Issues Found

### Issue #1: No Widget Extension Target

**Problem**: Brik generates Swift code but doesn't create the widget extension target.

**Why it matters**:
- Home screen widgets MUST be in a widget extension target
- Live Activities work from main app BUT widget UI must be in extension
- Without extension, generated widget code is useless

**Solution needed**:
```bash
brik ios-setup --name BrikWidget
```
Should create:
- Widget extension target
- Info.plist
- Entitlements
- Add to Xcode project
- Configure App Groups

### Issue #2: Auto-Registration Doesn't Work

**Problem**: `OrderTrackingHandlerRegistration` never instantiates because Swift optimizes away unused code.

**Solutions**:
1. **Option A**: Call explicitly from AppDelegate
   ```swift
   // AppDelegate.swift
   func application(_ application: UIApplication, didFinishLaunchingWithOptions ...) {
       if #available(iOS 16.1, *) {
           OrderTrackingHandlerRegistration.register()
       }
       return true
   }
   ```

2. **Option B**: Use `@_cdecl` for automatic loading
   ```swift
   @_cdecl("initOrderTrackingActivity")
   func initOrderTrackingActivity() {
       OrderTrackingHandlerRegistration.register()
   }
   ```

3. **Option C**: Register in BrikLiveActivities init
   ```swift
   class BrikLiveActivities: NSObject {
       override init() {
           super.init()
           registerAllActivities() // Call all registrations here
       }
   }
   ```

### Issue #3: Expo Plugin Incomplete

**Problem**: Expo plugin copies files but doesn't:
1. Create widget extension target
2. Properly add files to Xcode project
3. Configure bundle IDs
4. Set up App Groups in both targets

**Current code** (brik-expo-plugin/src/index.ts:126):
```typescript
project.addSourceFile(relativePath, {});
```

**Why it fails**:
- `addSourceFile()` adds to main app target only
- Widget files need to be in widget extension target
- No extension target exists to add them to!

### Issue #4: Missing Widget Extension Setup in CLI

**Current**: `brik ios-setup` creates extension BUT doesn't:
1. Add generated Swift files to the extension target
2. Update Xcode project file properly
3. Handle multiple widgets

**What's needed**: Integration with Xcode project modification (xcodeproj gem or similar)

## ✅ What Actually Works

1. **TSX → IR compilation**: Perfect
2. **IR → Swift code generation**: Generates valid Swift
3. **Native bridge**: BrikLiveActivities bridge works
4. **Registry pattern**: Code is correct, just not executing

## 🔧 Production-Ready Solution

### For Expo Apps

**Step 1**: Run build
```bash
cd examples/brik-expo
pnpm brik build --platform ios
```

**Step 2**: Create widget extension (MANUAL for now)
1. Open `ios/brikexpo.xcworkspace` in Xcode
2. File → New → Target → Widget Extension
3. Name: `BrikWidget`
4. Bundle ID: `com.anonymous.brikexpo.widget`
5. Enable App Groups in both targets: `group.com.anonymous.brikexpo`

**Step 3**: Add generated files to widget target
1. Find generated files in `ios/brikexpo/Generated/`
2. Drag `OrderTrackingActivity.swift` into Xcode
3. Check "BrikWidget" target membership
4. Uncheck "brikexpo" target

**Step 4**: Register in AppDelegate
```swift
import BrikReactNative

func application(_ application: UIApplication, didFinishLaunchingWithOptions ...) {
    // Register all activities
    if #available(iOS 16.1, *) {
        OrderTrackingHandlerRegistration.register()
    }
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
}
```

**Step 5**: Build and run
```bash
pnpm expo run:ios
```

### For Bare React Native

Same steps but without Expo prebuild.

## 📋 Recommended Fixes for Brik

### Priority 1: Fix ios-setup command

**File**: `packages/brik-cli/src/ios-widget-setup.ts`

**Add**:
1. Create widget extension using xcodeproj
2. Add all generated Swift files to extension target
3. Register activities in main app's AppDelegate
4. Generate manifest file listing all activities

### Priority 2: Fix auto-registration

**File**: `packages/brik-target-swiftui/src/live-activities.ts`

**Change registration pattern to**:
```swift
// Don't rely on module-level init
// Instead, export explicit registration function
@available(iOS 16.1, *)
public class BrikActivityRegistrations {
    public static func registerAll() {
        OrderTrackingHandlerRegistration.register()
        // ... other activities
    }
}
```

Then call from `BrikLiveActivities.m`:
```objc
+ (void)load {
    if (@available(iOS 16.1, *)) {
        [BrikActivityRegistrations registerAll];
    }
}
```

### Priority 3: Improve Expo plugin

**File**: `packages/brik-expo-plugin/src/index.ts`

**Add**:
1. Create widget extension target if missing
2. Add files to correct target
3. Generate registration calls in AppDelegate

### Priority 4: Add validation

**New file**: `packages/brik-cli/src/commands/validate.ts`

Check:
- Widget extension exists
- App Groups configured
- Bundle IDs hierarchical
- Generated files in correct target
- Registration calls present

## 🎯 Current Workaround

The standalone widget we created (`SimpleTestActivity.swift` + `StaticTestWidget.swift`) works because:
1. ✅ Created proper widget extension target
2. ✅ Added files to extension
3. ✅ Configured App Groups
4. ✅ No registration needed (WidgetKit auto-discovers `@main`)

This proves the iOS setup is correct - Brik's code generation just needs proper integration!

## 📊 Summary

**Brik Architecture**: ✅ Sound
**Code Generation**: ✅ Works
**Native Bridge**: ✅ Works
**iOS Integration**: ❌ Missing critical steps
**Registration**: ❌ Doesn't execute

**Root cause**: Brik generates correct code but doesn't integrate it into Xcode project properly. Missing widget extension target creation and file management.

**Fix complexity**: Medium - needs Xcode project manipulation (Ruby xcodeproj gem or similar)

**Workaround**: Manual Xcode setup (documented above)
