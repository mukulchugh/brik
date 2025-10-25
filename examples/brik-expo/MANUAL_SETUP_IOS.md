# iOS Live Activities Manual Setup Guide

## Overview

After running `pnpm expo prebuild`, the Brik Expo plugin automatically copies Live Activity Swift files to `ios/brikexpo/Generated/`. However, these files must be **manually added to the Xcode project** to be compiled.

## Prerequisites

- Xcode 14.0+ installed
- iOS 16.2+ deployment target (for Live Activities)
- Example app prebuilt: `pnpm expo prebuild --platform ios`

## Step-by-Step Setup

### 1. Open Xcode Project

```bash
cd examples/brik-expo
open ios/brikexpo.xcworkspace
```

**Important**: Open the `.xcworkspace`, NOT the `.xcodeproj` file.

### 2. Add Generated Swift Files to Xcode

1. In Xcode's left sidebar (Project Navigator), right-click on the **`brikexpo`** folder (blue icon)
2. Select **"Add Files to 'brikexpo'..."**
3. Navigate to `ios/brikexpo/Generated/`
4. Select **`OrderTrackingActivity.swift`**
5. **Important**: In the dialog, ensure these options are checked:
   - ✅ **"Copy items if needed"** (should be UNCHECKED - files are already in place)
   - ✅ **"Create groups"** (NOT "Create folder references")
   - ✅ **"Add to targets: brikexpo"** (main app target)
6. Click **"Add"**

### 3. Verify File is Added to Build Phases

1. Select the **`brikexpo`** target in the project navigator
2. Go to **"Build Phases"** tab
3. Expand **"Compile Sources"**
4. Verify `OrderTrackingActivity.swift` is listed

If it's not there:
1. Click the **"+"** button at the bottom of "Compile Sources"
2. Search for `OrderTrackingActivity.swift`
3. Add it

### 4. Clean and Rebuild

```bash
# In terminal
cd examples/brik-expo
rm -rf ios/build

# Then rebuild
pnpm expo run:ios
```

OR in Xcode:
1. Product → Clean Build Folder (⇧⌘K)
2. Product → Run (⌘R)

## Verification

After rebuilding, test the Live Activity:

1. App should launch on iPhone 15 Pro simulator
2. Tap **"Start Activity"** button
3. **Expected**: Live Activity starts successfully
4. **Error gone**: No more "Unknown activity type: OrderTracking" error

## Troubleshooting

### Error: "Unknown activity type: OrderTracking" persists

**Cause**: Swift file not compiled

**Solution**:
1. Check Build Phases → Compile Sources includes `OrderTrackingActivity.swift`
2. Clean build folder and rebuild
3. Check Console.app for "[Brik] Registered activity handler: OrderTracking" message

### Error: "Use of unresolved identifier 'BrikActivityRegistry'"

**Cause**: Missing BrikReactNative framework

**Solution**:
1. Verify `pod install` ran successfully
2. Check Podfile.lock includes `BrikReactNative`
3. Re-run: `cd ios && pod install && cd ..`

### Error: "Module 'ActivityKit' not found"

**Cause**: Deployment target < iOS 16.1

**Solution**:
1. Update `ios/Podfile`:
   ```ruby
   platform :ios, '16.2'  # Change from '13.4'
   ```
2. Re-run: `cd ios && pod install && cd ..`

## File Structure After Setup

```
ios/
├── brikexpo/
│   ├── Generated/
│   │   └── OrderTrackingActivity.swift  ← Copied by plugin
│   ├── AppDelegate.swift
│   └── Info.plist
├── brikexpo.xcodeproj/
│   └── project.pbxproj  ← OrderTrackingActivity.swift added here manually
└── Pods/
```

## What Happens at Runtime

1. **App Launch**: `OrderTrackingHandlerRegistration` runs automatically
2. **Registration**: Handler registered with `BrikActivityRegistry`
3. **Available**: `Brik.startActivity({ activityType: 'OrderTracking', ... })` now works
4. **Live Activity**: Appears on Lock Screen and Dynamic Island

## Future Automation

The manual Xcode step is required because:
- Expo prebuild doesn't support programmatic `.pbxproj` modification for Swift files
- Config plugins can't add files to Compile Sources
- Xcode project structure is complex and fragile

**Potential Solutions**:
1. Use `@bacons/xcode` library to programmatically modify `.pbxproj`
2. Create a post-prebuild script using PBXProj parser
3. Contribute to Expo to support Swift file injection in config plugins

For now, **manual setup is the recommended approach** (5 minutes, one-time).

## Next Steps

After completing this setup:
1. Test all Live Activity features (start, update, end)
2. Test on physical iOS device (16.2+)
3. Verify Dynamic Island UI on iPhone 14 Pro+ simulator
4. Check memory usage in Xcode Instruments (should be <30MB)

## Related Files

- Widget code: `packages/brik-example-shared/src/widgets/OrderTrackingActivity.tsx`
- Generated Swift: `packages/brik-example-shared/ios/BrikActivities/OrderTrackingActivity.swift`
- Registry: `packages/brik-react-native/ios/BrikActivityRegistry.swift`
- Live Activities module: `packages/brik-react-native/ios/BrikLiveActivities.swift`
