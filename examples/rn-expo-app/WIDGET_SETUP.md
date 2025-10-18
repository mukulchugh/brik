# Widget Setup Guide

## Current Status

✅ **Native widget code generated:**

- iOS: `ios/brik/Generated/*.swift` (5 widget views)
- Android: `android/brik/.../generated/*.kt` (5 Glance widgets)

⚠️ **Widget extension not yet integrated:**

- iOS: WidgetKit extension target needs to be created in Xcode
- Android: Widget is partially configured, needs final wiring

## Quick Setup

### Option 1: Use Existing BrikWidget Directory (Fastest)

The folder `ios/BrikWidget/` already exists with a `BrikWidget.swift` file. We just need to add it as a target.

**In Xcode:**

1. Open `ios/BrikExpoExample.xcworkspace`
2. File → New → Target
3. Select "Widget Extension"
4. Product Name: `BrikWidget`
5. Include Configuration Intent: No
6. Click Finish → Activate scheme
7. Delete the generated template files
8. Add our generated Swift files to the target:
   - Select `ios/brik/Generated/src_AdvancedDemo_tsx.swift`
   - Target Membership: Check "BrikWidget"
9. Update `BrikWidget.swift` to use our view (see below)
10. Build widget extension (⌘R with BrikWidget scheme selected)

### Option 2: Automated CLI (Coming in Future Release)

```bash
# This will be available in v0.2.0
brik ios create-extension --name BrikWidget
```

## Manual iOS Widget Integration

### 1. Create Widget Extension Target in Xcode

Since the automated target creation isn't ready yet, here's the manual process:

**Steps:**

1. Open `ios/BrikExpoExample.xcworkspace` in Xcode
2. In Project Navigator, select the blue "BrikExpoExample" project
3. At bottom, click "+" to add new target
4. Search for "Widget Extension" → Select → Next
5. Product Name: `BrikWidget`
6. Organization Identifier: Same as main app
7. Uncheck "Include Configuration Intent"
8. Click Finish
9. When prompted "Activate BrikWidget scheme?", click **Activate**

### 2. Configure the Widget

Replace the generated `BrikWidget.swift` content with:

```swift
import WidgetKit
import SwiftUI

@main
struct BrikWidgets: WidgetBundle {
    var body: some Widget {
        BrikWidget()
    }
}

struct BrikWidget: Widget {
    let kind: String = "BrikWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            src_AdvancedDemo_tsx() // Your generated widget view
        }
        .configurationDisplayName("Brik Widget")
        .description("Native widget built with Brik")
        .supportedFamilies([.systemMedium])
    }
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let entries: [SimpleEntry] = [
            SimpleEntry(date: Date())
        ]
        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
}
```

### 3. Add Generated Files to Widget Target

1. In Xcode, select `ios/brik/Generated/src_AdvancedDemo_tsx.swift`
2. In File Inspector (right panel):
   - Under "Target Membership"
   - Check ✅ **BrikWidget**
   - Keep ✅ **BrikExpoExample** (for preview)

### 4. Build Widget Extension

1. Select **BrikWidget** scheme (top bar)
2. Select iPhone 15 simulator
3. Press ⌘R to build and run
4. Widget extension installs to simulator

### 5. Add Widget to Home Screen

1. In simulator, go to home screen
2. Long press on empty space
3. Tap "+" button (top left)
4. Search for "Brik" or scroll to find it
5. Select your widget
6. Choose size and add to home screen

## Android Widget Setup

The Android side is simpler since the Expo plugin handles most of it:

### 1. Verify Configuration

Check `android/app/src/main/AndroidManifest.xml` has:

```xml
<receiver
    android:name="com.brik.example.generated.src_AdvancedDemo_tsxReceiver"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/brik_widget_info" />
</receiver>
```

### 2. Build APK

```bash
cd android
./gradlew assembleDebug
```

### 3. Install and Add Widget

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

Then on device/emulator:

1. Long press home screen
2. Tap "Widgets"
3. Find "Brik Widget"
4. Drag to home screen

## Current Limitation

**iOS WidgetKit extension creation is manual** - This is documented in:

- `PROJECT_STATUS.md` under "Requires Manual Setup"
- `RELEASE_NOTES.md` under "Known Limitations"

**Phase 3.2 (not yet complete):** iOS WidgetKit Automation

- CLI command to create Widget Extension target
- Xcode project manipulation (pbxproj editing)
- Automatic target linking

This will be automated in a future release, but for now, follow the manual steps above.

## Verification

After setup, you should see:

- **iOS**: Native SwiftUI widget on home screen
- **Android**: Native Glance widget on home screen
- **Changes**: Edit React code → rebuild → widget updates

Both will show your AdvancedDemo content natively rendered!
