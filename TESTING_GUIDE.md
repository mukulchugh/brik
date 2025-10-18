# Testing Guide - Live Activities Native Module

**Branch**: `feature/native-module-v0.2.1`
**Status**: Implementation Complete, Manual Xcode Testing Required
**Date**: October 18, 2025

---

## 🎯 What's Been Implemented

✅ **Complete ActivityKit Integration** (3 commits, 1,091 lines):

1. **BrikActivityRegistry.swift** (156 lines)
   - Type-erased registry for managing different activity types
   - Protocol-based handler system
   - Push token tracking with ID mapping

2. **BrikLiveActivities.swift** (220 lines)
   - Full React Native bridge to ActivityKit
   - Real Activity.request() calls (not mocks!)
   - Complete lifecycle management (start, update, end)

3. **Enhanced Code Generation** (133 lines)
   - Generates concrete handlers for each activity type
   - Auto-registration on app startup
   - Type-safe attribute marshalling

4. **Generated Example** - `OrderTrackingActivity.swift` (200 lines)
   - Complete Activity implementation
   - Lock screen + Dynamic Island views
   - OrderTrackingHandler with auto-registration

---

## 📁 File Locations

### Native Module (in package):
```
packages/brik-react-native/ios/
├── BrikActivityRegistry.swift      ← Registry system
├── BrikLiveActivities.swift        ← Native module
├── BrikLiveActivities.m            ← Objective-C bridge
└── BrikReactNative.podspec         ← CocoaPods spec
```

### Generated Activity (in example app):
```
examples/rn-expo-app/ios/
├── BrikActivities/
│   └── OrderTrackingActivity.swift  ← Generated from JSX
└── BrikExpoExample.xcworkspace      ← Open this in Xcode
```

### React Code (source):
```
examples/rn-expo-app/src/
├── LiveActivityDemo.tsx             ← Activity definition (@brik-activity)
└── LiveActivityScreen.tsx           ← UI to test from app
```

---

## 🛠️ Manual Testing in Xcode

### Current Issue:
CocoaPods is having trouble with `ReactAppDependencyProvider` dependency (Expo/RN compatibility issue). However, the native module files exist and can be manually added to Xcode.

### Step-by-Step Instructions:

#### 1. Open Project in Xcode:
```bash
open /Users/mukulchugh/Work/Products/brik-critical/examples/rn-expo-app/ios/BrikExpoExample.xcworkspace
```

#### 2. Verify Files in Project Navigator:

Check if these files are visible:
- ✅ `BrikActivities/OrderTrackingActivity.swift`
- ❓ `BrikActivityRegistry.swift` (may need manual add)
- ❓ `BrikLiveActivities.swift` (may need manual add)
- ❓ `BrikLiveActivities.m` (may need manual add)

#### 3. Add Missing Native Module Files (if not present):

**If BrikLiveActivities files are missing**:

1. In Xcode, right-click on `BrikExpoExample` in Project Navigator
2. Select "Add Files to 'BrikExpoExample'..."
3. Navigate to:
   ```
   /Users/mukulchugh/Work/Products/brik-critical/packages/brik-react-native/ios/
   ```
4. Select ALL three files:
   - `BrikActivityRegistry.swift`
   - `BrikLiveActivities.swift`
   - `BrikLiveActivities.m`
5. **IMPORTANT**: Uncheck "Copy items if needed"
6. Target: Select `BrikExpoExample`
7. Click "Add"

#### 4. Configure Build Settings:

1. Select `BrikExpoExample` target
2. Go to "Build Settings"
3. Search for "Swift Language Version"
4. Ensure it's set to "Swift 5" or later
5. Search for "Defines Module"
6. Set to "Yes"

#### 5. Add Bridging Header (if needed):

If prompted about Swift/Objective-C bridging:
1. Let Xcode create the bridging header automatically
2. OR manually create `BrikExpoExample-Bridging-Header.h`

#### 6. Build the Project:

1. Select target device:
   - **Recommended**: iPhone 15 Pro (iOS 17.5) simulator
     - Supports Dynamic Island simulation
   - **Alternative**: Any iOS 16.1+ simulator/device

2. Build: **⌘ + B**

3. Check for errors:
   - **Expected**: Build should succeed
   - **If errors**: Check console output for Swift/linking errors

#### 7. Run the App:

1. Run: **⌘ + R**
2. Wait for simulator to launch
3. App should open to main screen

---

## 🧪 Testing the Live Activity

### In the React Native App:

1. **Navigate to Live Activity Demo**:
   - Look for "Live Activity Demo" screen
   - Should show start/update/end buttons

2. **Start Activity**:
   - Tap "Start Activity" button
   - **Expected**: Alert showing activity ID
   - **Console should show**:
     ```
     [Brik] Registered activity handler: OrderTracking
     ```

3. **View on Lock Screen**:
   - Lock the simulator: **⌘ + L**
   - **Expected**: Order tracking banner appears below clock
   - Shows: Pizza emoji, "Order #12345", progress bar, ETA

4. **Test Dynamic Island** (iPhone 14 Pro+ only):
   - Unlock simulator
   - Look at top of screen
   - **Expected**: Compact view showing pizza emoji + small progress bar
   - Tap to expand → Full order details

5. **Update Activity**:
   - Unlock simulator
   - Return to app
   - Tap "Update Activity"
   - Lock again: **⌘ + L**
   - **Expected**: Progress bar updates, ETA decreases, status changes

6. **End Activity**:
   - Unlock, return to app
   - Tap "End Activity"
   - Lock again: **⌘ + L**
   - **Expected**: Activity banner dismisses after ~4 seconds

---

## 🐛 Troubleshooting

### Issue: "No such module 'ActivityKit'"

**Fix**: Ensure deployment target is iOS 16.1+
1. Select project in Navigator
2. Select target `BrikExpoExample`
3. General → Deployment Info → iOS Deployment Target → 16.1

### Issue: "Cannot find 'BrikActivityRegistry' in scope"

**Fix**: Add import and ensure file is in target
1. Check file is in Project Navigator
2. Select the file → Target Membership → Check `BrikExpoExample`

### Issue: "Use of undeclared type 'BrikActivityError'"

**Fix**: Ensure BrikActivityRegistry.swift is compiled before BrikLiveActivities.swift
1. Build Phases → Compile Sources
2. Drag `BrikActivityRegistry.swift` above `BrikLiveActivities.swift`

### Issue: Activity doesn't appear on lock screen

**Check**:
1. Console for error messages
2. Settings → Face ID & Passcode → Allow access when locked → Live Activities (ON)
3. iOS version 16.1+ (simulator or device)

### Issue: "Activity.request() failed"

**Possible causes**:
1. Missing attributes in JS call
2. Type mismatch (e.g., passing string instead of number)
3. iOS < 16.1
4. Live Activities disabled in Settings

**Debug**:
- Check console for specific BrikActivityError message
- Verify JS payload matches expected types

---

## ✅ Success Criteria

### Minimum Viable Test:
- ✅ App builds without errors
- ✅ Console shows: `[Brik] Registered activity handler: OrderTracking`
- ✅ Start button returns activity ID
- ✅ Activity appears on lock screen

### Full Test:
- ✅ All above, plus:
- ✅ Update changes visible content
- ✅ Dynamic Island shows compact view (iPhone 14 Pro+)
- ✅ End dismisses activity
- ✅ Multiple start/end cycles work

---

## 📊 Expected Console Output

### On App Launch:
```
[Brik] Registered activity handler: OrderTracking
```

### On Start Activity:
```
[ActivityKit] Activity requested successfully
Activity ID: 1A2B3C4D-5E6F-...
Push Token: a1b2c3d4e5f6...
```

### On Update:
```
[ActivityKit] Activity updated
```

### On End:
```
[ActivityKit] Activity ended with policy: default
```

### On Error:
```
[Brik] Error: Unknown activity type: SomeActivity. Make sure you've run 'pnpm brik build'
```

---

## 🔄 If Changes Needed

### To Regenerate Activity Code:

1. Edit `LiveActivityDemo.tsx`
2. Run codegen:
   ```bash
   cd /Users/mukulchugh/Work/Products/brik-critical/examples/rn-expo-app
   node ../../packages/brik-cli/dist/index.js build --platform ios
   ```
3. Rebuild in Xcode: **⌘ + B**

### To Modify Native Module:

1. Edit Swift files in:
   ```
   /Users/mukulchugh/Work/Products/brik-critical/packages/brik-react-native/ios/
   ```
2. Rebuild in Xcode (no codegen needed)

---

## 📝 Test Results Template

After testing, document results:

```markdown
## Test Results - [Date]

**Device/Simulator**: iPhone 15 Pro (iOS 17.5)
**Build Status**: ✅ Success / ❌ Failed
**Console Registration**: ✅ Yes / ❌ No

### Activity Lifecycle:
- Start: ✅ / ❌ (Activity ID: _______)
- Lock Screen Display: ✅ / ❌
- Update: ✅ / ❌
- End: ✅ / ❌

### Dynamic Island (if applicable):
- Compact View: ✅ / ❌ / N/A
- Expanded View: ✅ / ❌ / N/A
- Minimal View: ✅ / ❌ / N/A

### Issues Encountered:
- [List any errors, unexpected behavior]

### Screenshots:
- [Attach screenshots of lock screen, Dynamic Island]
```

---

## 🚀 Next Steps After Successful Testing

1. **Document Results**: Fill out test results template above
2. **Fix Bugs**: Address any issues found during testing
3. **Merge to Main**: If all tests pass
4. **Release v0.2.1**: Tag and publish
5. **Phase 2**: Move to comprehensive unit tests (next todo)

---

## 📚 Related Documentation

- `NATIVE_MODULE_IMPLEMENTATION.md` - Complete implementation details
- `docs/LIVE_ACTIVITIES.md` - User-facing Live Activities guide
- `IMPLEMENTATION_ROADMAP.md` - Full project roadmap

---

## 🆘 Need Help?

**If build fails completely**:
1. Clean build folder: Xcode → Product → Clean Build Folder (⇧⌘K)
2. Delete Derived Data
3. Restart Xcode
4. Try again

**If Activity doesn't work**:
1. Check iOS version (must be 16.1+)
2. Verify Live Activities enabled in Settings
3. Check console for error messages
4. Ensure OrderTrackingActivity.swift was generated

**For debugging**:
- Enable verbose logging in Xcode console
- Check ActivityKit framework is linked
- Verify React Native bridge is active
- Use breakpoints in BrikLiveActivities.swift

---

**Status**: Ready for manual Xcode testing
**All code committed and pushed to**: `feature/native-module-v0.2.1`
