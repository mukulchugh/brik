# Live Activities Setup Guide

Complete manual setup guide for iOS Live Activities with Brik.

**Last Updated:** 2025-10-20
**Applies to:** Brik v0.2.0+
**Requirements:** iOS 16.1+, Xcode 14.1+, React Native 0.70+

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Automated Setup (CLI)](#automated-setup-cli)
4. [Manual Setup](#manual-setup)
5. [Verification Steps](#verification-steps)
6. [Testing Your Live Activity](#testing-your-live-activity)
7. [Troubleshooting](#troubleshooting)

---

## Overview

Live Activities display real-time information on the Lock Screen and Dynamic Island (iPhone 14 Pro+). They require:

1. **Main app configuration** - Info.plist with `NSSupportsLiveActivities`
2. **Widget Extension target** - Separate Xcode target for the Live Activity
3. **App Groups** - Shared data storage between app and extension
4. **ActivityKit code generation** - Brik generates Swift code for your activities

---

## Prerequisites

### System Requirements

- macOS 12.0+ (Monterey or later)
- Xcode 14.1+ (for iOS 16.1 SDK)
- React Native 0.70+ project
- CocoaPods installed

### Device Requirements

- iOS 16.1+ device or simulator
- iPhone 14 Pro/Pro Max for Dynamic Island testing (simulator works)

### Brik Packages

```bash
pnpm add @brik/react-native @brik/cli
# or
pnpm add @brik/react-native @brik/cli
```

---

## Automated Setup (CLI)

The CLI command automates most of the setup process.

### Step 1: Run iOS Setup Command

```bash
npx brik ios-setup --name LiveActivityWidget
```

**What this generates:**

✅ `ios/LiveActivityWidget/LiveActivityWidget.swift` - Widget extension entry point
✅ `ios/LiveActivityWidget/Info.plist` - Widget extension configuration
✅ `ios/LiveActivityWidget/LiveActivityWidget.entitlements` - Widget App Groups
✅ `ios/YourApp/YourApp.entitlements` - Main app App Groups
✅ `ios/LiveActivityWidget/Assets.xcassets` - Widget assets
✅ **Updates** `ios/YourApp/Info.plist` with `NSSupportsLiveActivities = true`

**CLI Output:**
```
🍎 Setting up iOS Widget Extension...
📦 App Group ID: group.com.yourapp.widgets
✅ Created LiveActivityWidget.swift
✅ Created Info.plist
✅ Created Assets.xcassets
✅ Created LiveActivityWidget.entitlements
✅ Created YourApp.entitlements
📝 Enabling Live Activities support in Info.plist...
✅ Added NSSupportsLiveActivities to Info.plist

⚠️  Manual steps required in Xcode:
1. Open the .xcworkspace file in Xcode
2. File → New → Target → Widget Extension
3. Name: LiveActivityWidget
4. Delete generated files, use the ones we created
5. Add LiveActivityWidget.entitlements to the widget target build settings:
   - Select widget target → Build Settings → Code Signing Entitlements
   - Set to: LiveActivityWidget/LiveActivityWidget.entitlements
6. Add YourApp.entitlements to the main app target (if newly created)
7. In main app target → Build Settings → Code Signing Entitlements
   - Set to: YourApp/YourApp.entitlements
8. Add generated Swift files from ios/brik/Generated/ to the widget target
9. Build and run the widget extension scheme

📦 App Group configured: group.com.yourapp.widgets
   This App Group enables data sharing between the app and widget.

🔴 Live Activities enabled: NSSupportsLiveActivities = true
   Your app can now display Live Activities on the Lock Screen and Dynamic Island.
```

### Step 2: Follow Manual Xcode Steps

See [Manual Setup](#manual-setup) section below for detailed Xcode configuration steps.

---

## Manual Setup

If you need to manually configure Live Activities or troubleshoot automated setup:

### 1. Configure Main App Info.plist

Add to `ios/YourApp/Info.plist`:

```xml
<key>NSSupportsLiveActivities</key>
<true/>
```

**Location:** Add before the closing `</dict>` tag.

**Why:** This tells iOS that your app supports starting Live Activities.

### 2. Create Widget Extension Target

1. Open `ios/YourApp.xcworkspace` in Xcode
2. Click on your project in Project Navigator
3. Click the `+` button at the bottom of the Targets list
4. Filter for "Widget Extension"
5. Click "Next"
6. Configure:
   - **Product Name:** `LiveActivityWidget` (or your chosen name)
   - **Bundle Identifier:** `com.yourapp.LiveActivityWidget`
   - **Minimum Deployment:** iOS 16.1
7. Click "Finish"
8. Click "Activate" when prompted to activate the scheme

### 3. Configure App Groups

#### Main App Entitlements

Create or edit `ios/YourApp/YourApp.entitlements`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.application-groups</key>
    <array>
        <string>group.com.yourapp.widgets</string>
    </array>
</dict>
</plist>
```

**Set in Xcode:**
1. Select main app target
2. Build Settings → Code Signing Entitlements
3. Set to: `YourApp/YourApp.entitlements`

#### Widget Extension Entitlements

Create `ios/LiveActivityWidget/LiveActivityWidget.entitlements`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.application-groups</key>
    <array>
        <string>group.com.yourapp.widgets</string>
    </array>
</dict>
</plist>
```

**Set in Xcode:**
1. Select widget target
2. Build Settings → Code Signing Entitlements
3. Set to: `LiveActivityWidget/LiveActivityWidget.entitlements`

**⚠️ Critical:** Both must have the **exact same** App Group ID.

### 4. Update BrikWidgetManager App Group

Edit `node_modules/@brik/react-native/ios/BrikWidgetManager.swift`:

Find line ~16:

```swift
let appGroupIdentifier = "group.com.yourapp.widgets"  // ← Update this
```

**Or** configure it via React Native at runtime:

```typescript
import { widgetManager } from '@brik/react-native';

// Configure App Group before using widgets
widgetManager.setAppGroupIdentifier('group.com.yourapp.widgets');
```

### 5. Generate Live Activity Code

Create your Live Activity definition in TypeScript:

**`src/OrderTrackingActivity.tsx`**

```typescript
import { LiveActivity } from '@brik/react-native';

export const OrderTrackingActivity = () => (
  <LiveActivity activityType="OrderTracking">
    {/* Static attributes (set once at start) */}
    <LiveActivity.Static
      orderId="string"
      storeName="string"
      orderTime="number"
    />

    {/* Dynamic attributes (can update) */}
    <LiveActivity.Dynamic
      status="string"
      eta="number"
      progress="number"
    />

    {/* Lock Screen UI */}
    <LiveActivity.LockScreen>
      {/* Your lock screen UI */}
    </LiveActivity.LockScreen>

    {/* Dynamic Island UI (iPhone 14 Pro+) */}
    <LiveActivity.DynamicIsland>
      <LiveActivity.DynamicIsland.Compact>
        {/* Compact leading view */}
      </LiveActivity.DynamicIsland.Compact>
      <LiveActivity.DynamicIsland.Minimal>
        {/* Minimal view */}
      </LiveActivity.DynamicIsland.Minimal>
      <LiveActivity.DynamicIsland.Expanded>
        {/* Expanded view */}
      </LiveActivity.DynamicIsland.Expanded>
    </LiveActivity.DynamicIsland>
  </LiveActivity>
);
```

### 6. Run Code Generation

```bash
npx brik build --platform ios
```

This generates Swift code in `ios/brik/Generated/`:
- `OrderTrackingActivity.swift` - ActivityAttributes struct
- `OrderTrackingActivityWidget.swift` - SwiftUI views
- `OrderTrackingHandler.swift` - Auto-registration handler

### 7. Add Generated Files to Widget Target

1. In Xcode Project Navigator, right-click widget target
2. Add Files to "LiveActivityWidget"
3. Navigate to `ios/brik/Generated/`
4. Select all `.swift` files
5. ✅ Check "Copy items if needed"
6. ✅ Ensure widget target is selected
7. Click "Add"

**Verify target membership:**
1. Select any generated `.swift` file
2. File Inspector (right panel) → Target Membership
3. ✅ Ensure `LiveActivityWidget` is checked

### 8. Build Widget Extension

1. Select `LiveActivityWidget` scheme (next to Run button)
2. Select a simulator or device (iOS 16.1+)
3. Press ⌘B to build
4. Fix any build errors
5. Press ⌘R to run

---

## Verification Steps

### 1. Verify Info.plist Configuration

**Main App Info.plist:**

```bash
cat ios/YourApp/Info.plist | grep -A 1 NSSupportsLiveActivities
```

Expected output:
```xml
<key>NSSupportsLiveActivities</key>
<true/>
```

### 2. Verify App Groups Match

**Main app:**
```bash
cat ios/YourApp/YourApp.entitlements
```

**Widget extension:**
```bash
cat ios/LiveActivityWidget/LiveActivityWidget.entitlements
```

Both should have the same `<string>group.com.yourapp.widgets</string>`.

### 3. Verify Code Generation

```bash
ls ios/brik/Generated/
```

Expected files:
- `OrderTrackingActivity.swift`
- `OrderTrackingActivityWidget.swift`
- `OrderTrackingHandler.swift`

### 4. Verify Xcode Build Settings

**Main app target:**
1. Build Settings → Code Signing Entitlements
2. Should show: `YourApp/YourApp.entitlements`

**Widget target:**
1. Build Settings → Code Signing Entitlements
2. Should show: `LiveActivityWidget/LiveActivityWidget.entitlements`

---

## Testing Your Live Activity

### Start a Live Activity

```typescript
import { Brik } from '@brik/react-native';

const startOrder = async () => {
  try {
    const result = await Brik.startActivity(
      'OrderTracking',
      // Static attributes (set once)
      {
        orderId: 'ORD-12345',
        storeName: 'Pizza Palace',
        orderTime: Date.now()
      },
      // Dynamic attributes (can update)
      {
        status: 'preparing',
        eta: 30,
        progress: 0.1
      }
    );

    console.log('Activity started!');
    console.log('Activity ID:', result.activityId);
    console.log('Push Token:', result.pushToken); // For remote updates
  } catch (error) {
    console.error('Failed to start activity:', error);
  }
};
```

### Update a Live Activity

```typescript
const updateOrder = async (activityId: string) => {
  await Brik.updateActivity(activityId, {
    status: 'delivering',
    eta: 5,
    progress: 0.9
  });
};
```

### End a Live Activity

```typescript
const completeOrder = async (activityId: string) => {
  await Brik.endActivity(activityId, {
    dismissalPolicy: 'immediate' // or 'after(seconds)'
  });
};
```

### Check Support

```typescript
const checkSupport = async () => {
  const supported = await Brik.areActivitiesSupported();
  console.log('Live Activities supported:', supported);
  // Returns true on iOS 16.1+ devices
};
```

---

## Troubleshooting

### Build Error: "Cannot find 'BrikActivityRegistry' in scope"

**Cause:** Generated files not added to widget target

**Fix:**
1. Select `OrderTrackingActivity.swift` in Project Navigator
2. File Inspector → Target Membership
3. ✅ Check `LiveActivityWidget`
4. Repeat for all generated files
5. Clean build folder (⌘⇧K) and rebuild

### Runtime Error: "Live Activities require iOS 16.1 or later"

**Cause:** Running on iOS < 16.1

**Fix:**
- Use iOS 16.1+ simulator
- Deploy to iOS 16.1+ device
- Check with `Brik.areActivitiesSupported()` before calling

### Activity Doesn't Appear on Lock Screen

**Possible causes:**

1. **Missing Info.plist key:**
   - Verify `NSSupportsLiveActivities = true` in main app Info.plist
   - Rebuild app (not just widget extension)

2. **App Groups mismatch:**
   - Check both entitlements have same App Group ID
   - Verify BrikWidgetManager uses same App Group
   - Clean and rebuild both targets

3. **Widget target not running:**
   - Run widget extension scheme (⌘R)
   - Check scheme is set to "LiveActivityWidget"

4. **ActivityKit restrictions:**
   - Live Activities only work on Lock Screen
   - Lock device (⌘L in simulator) to see activity
   - Swipe down from top to view Lock Screen

### App Groups Not Working

**Symptom:** Widget shows "Waiting for data" or no data

**Debug steps:**

1. Check App Group ID format:
   ```
   ✅ group.com.company.appname.widgets
   ❌ com.company.appname.widgets (missing "group.")
   ❌ group.com.company.appname (missing ".widgets")
   ```

2. Verify in BrikWidgetManager.swift:
   ```swift
   // Line ~16
   let appGroupIdentifier = "group.com.yourapp.widgets"
   ```

3. Check UserDefaults access:
   ```swift
   // In widget code
   let defaults = UserDefaults(suiteName: "group.com.yourapp.widgets")
   print("App Group defaults:", defaults != nil ? "✅" : "❌")
   ```

### Push Tokens Always `null`

**Cause:** Not requesting with push type

**Fix:** Generated code should use:
```swift
let activity = try Activity<OrderTrackingAttributes>.request(
    attributes: attrs,
    content: initialContent,
    pushType: .token  // ← Required for push token
)
```

Verify in `OrderTrackingHandler.swift` generated by Brik.

### Dynamic Island Not Showing

**Requirements:**
- iPhone 14 Pro / Pro Max or later
- iOS 16.1+
- Compact, Minimal, and Expanded views defined

**Check:**
1. Using iPhone 14 Pro simulator (not regular iPhone 14)
2. Activity is currently active
3. All three Dynamic Island regions are implemented in your TSX

### Build Error: "Code signing entitlements file not found"

**Fix:**
1. Verify file exists: `ios/YourApp/YourApp.entitlements`
2. Check path in Build Settings is relative to project root
3. Should be: `YourApp/YourApp.entitlements` (not absolute path)
4. Clean build folder and retry

---

## Best Practices

### 1. Always Check Support

```typescript
const supported = await Brik.areActivitiesSupported();
if (!supported) {
  // Show fallback UI or notification
  return;
}
```

### 2. Store Activity IDs

```typescript
const [activityId, setActivityId] = useState<string | null>(null);

const startActivity = async () => {
  const result = await Brik.startActivity(...);
  setActivityId(result.activityId); // Store for updates
};

const updateActivity = async () => {
  if (activityId) {
    await Brik.updateActivity(activityId, {...});
  }
};
```

### 3. Handle Errors Gracefully

```typescript
try {
  await Brik.startActivity(...);
} catch (error) {
  if (error.code === 'ACTIVITY_LIMIT_EXCEEDED') {
    Alert.alert('Too many active activities');
  } else if (error.code === 'UNSUPPORTED') {
    Alert.alert('Update to iOS 16.1+ for Live Activities');
  } else {
    Alert.alert('Failed to start activity', error.message);
  }
}
```

### 4. Clean Up Activities

```typescript
useEffect(() => {
  return () => {
    // End activity when component unmounts
    if (activityId) {
      Brik.endActivity(activityId);
    }
  };
}, [activityId]);
```

### 5. Use Semantic Dismissal Policies

```typescript
// Immediate dismissal for completed actions
await Brik.endActivity(activityId, {
  dismissalPolicy: 'immediate'
});

// Delayed dismissal for informational activities
await Brik.endActivity(activityId, {
  dismissalPolicy: 'after',
  seconds: 300 // 5 minutes
});
```

---

## Next Steps

- **Remote Updates:** See [Live Activities Backend Integration Guide](LIVE_ACTIVITIES_BACKEND.md)
- **Advanced UI:** Customize generated SwiftUI views in `ios/brik/Generated/`
- **Testing:** See [Testing Guide](TESTING_GUIDE.md) for device testing checklist
- **Production:** See [Release Readiness Assessment](../internal/RELEASE_READINESS_ASSESSMENT.md)

---

## Support

**Issues:** Report bugs at GitHub Issues
**Questions:** Ask in GitHub Discussions
**Documentation:** See `docs/` directory for comprehensive guides

**Known Limitations (v0.2.0):**
- Manual Widget Extension target creation required
- Manual entitlements configuration required
- CLI cannot modify Xcode project files automatically

**Future Improvements (v0.3.0+):**
- Automated Xcode project file modification
- One-command complete setup
- Validation and troubleshooting CLI commands
