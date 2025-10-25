# React Native Widget Implementation Guide
## Complete Setup for iOS & Android Widgets Across All Architectures

> **Comprehensive guide for implementing widgets in React Native/Expo apps**
>
> Covers: Legacy Architecture, New Architecture (Fabric), Expo managed, React Native CLI
>
> Last Updated: October 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Existing NPM Packages](#existing-npm-packages)
3. [Architecture Comparison](#architecture-comparison)
4. [iOS Widget Setup (WidgetKit)](#ios-widget-setup-widgetkit)
5. [iOS Live Activities (ActivityKit)](#ios-live-activities-activitykit)
6. [Android Widget Setup (Glance)](#android-widget-setup-glance)
7. [Cross-Platform Considerations](#cross-platform-considerations)
8. [Brik Implementation](#brik-implementation)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### Widget Types

| Platform | Framework | Minimum Version | Use Case |
|----------|-----------|-----------------|----------|
| **iOS** | WidgetKit | iOS 14.0+ | Home Screen Widgets |
| **iOS** | ActivityKit | iOS 16.1+ | Live Activities (Dynamic Island) |
| **Android** | Glance (Compose) | Android 12+ | Modern home screen widgets |
| **Android** | RemoteViews | Android 8+ | Legacy home screen widgets |

### Key Challenges

1. **No React Native in Widgets**: Widgets run in separate processes and cannot use React Native directly
2. **Data Sharing**: Main app and widgets communicate via shared storage (App Groups, SharedPreferences)
3. **Native Code Required**: Widget UI must be written in native code (Swift/Kotlin)
4. **Architecture Differences**: New Architecture (Fabric) requires different setup than Legacy

---

## Existing NPM Packages

### iOS Packages

#### 1. `react-native-widget-extension` (bndkt)

**Latest**: v0.0.6 | **Focus**: iOS Widgets + Live Activities

```bash
npx expo install react-native-widget-extension
```

**Features**:
- ✅ iOS 16.2+ minimum deployment target
- ✅ Live Activities support
- ✅ Expo config plugin
- ✅ Swift-based widgets
- ❌ No Android support
- ❌ Requires manual Swift coding

**Configuration**:
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-widget-extension",
        {
          "frequentUpdates": true,
          "widgetsFolder": "widgets",
          "deploymentTarget": "16.2",
          "groupIdentifier": "group.com.example.app"
        }
      ]
    ]
  }
}
```

#### 2. `@bacons/apple-targets` (Evan Bacon)

**Latest**: v3.0.2 | **Focus**: All Apple Targets (Widgets, App Clips, etc.)

```bash
npx create-target widget
```

**Features**:
- ✅ Expo SDK 53+ support
- ✅ SwiftUI widget generation
- ✅ App Groups automatic setup
- ✅ Targets live outside `/ios` directory
- ❌ Experimental/beta status
- ❌ Requires CocoaPods 1.16.2+ (Ruby 3.2.0+)

**Usage**:
```bash
# Generate widget target
npx create-target widget MyWidget

# Configure in app.json
{
  "expo": {
    "plugins": [
      [
        "@bacons/apple-targets",
        {
          "targets": [
            {
              "name": "MyWidget",
              "type": "widget",
              "frameworks": ["WidgetKit", "SwiftUI"],
              "deploymentTarget": "16.0"
            }
          ]
        }
      ]
    ]
  }
}
```

### Android Packages

#### 3. `react-native-android-widget` (sAleksovski)

**Latest**: v0.17.1 | **Focus**: Android Widgets with React-like API

```bash
npm install react-native-android-widget
```

**Features**:
- ✅ React-like JSX syntax for widgets
- ✅ Runtime RemoteViews generation
- ✅ No native Android code needed
- ✅ Custom components (FlexWidget, TextWidget, etc.)
- ❌ No iOS support
- ❌ Runtime overhead (JSX → RemoteViews)

**Example**:
```tsx
import { FlexWidget, TextWidget } from 'react-native-android-widget';

function MyWidget() {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 16,
      }}
    >
      <TextWidget text="Hello Widget" />
    </FlexWidget>
  );
}
```

### Cross-Platform Packages

#### 4. `@bittingz/expo-widgets`

**Latest**: v0.1.0 | **Focus**: Unified API for iOS + Android

```bash
npx expo install @bittingz/expo-widgets
```

**Features**:
- ✅ Cross-platform API
- ✅ Expo config plugin
- ⚠️ Early stage, limited documentation
- ❌ Still requires native code for widget UI

---

## Architecture Comparison

### Legacy Architecture (Paper) vs New Architecture (Fabric)

| Aspect | Legacy (Paper) | New (Fabric) |
|--------|----------------|--------------|
| **JavaScript Engine** | JSC/Hermes | Hermes required |
| **Bridge** | Asynchronous JSON bridge | JSI (synchronous) |
| **TurboModules** | Not supported | Required for native modules |
| **Fabric Renderer** | Legacy renderer | New concurrent renderer |
| **Widget Impact** | Minimal - widgets are native | Must use TurboModules |

### Widget-Specific Considerations

**Widgets are NOT affected by architecture** because:
1. Widgets run in separate process (widget extension)
2. No React Native runtime in widgets
3. Pure native Swift/Kotlin code
4. Data sharing via App Groups/SharedPreferences

**Main app architecture matters for**:
1. Native module bridge (BrikWidgetManager, BrikLiveActivities)
2. Data updates from React Native side
3. Native module compatibility

---

## iOS Widget Setup (WidgetKit)

### Prerequisites

```bash
# Required versions
iOS: 14.0+
Xcode: 14.0+
CocoaPods: 1.12+
```

### Step 1: Configure App Groups

**app.json**:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.example.myapp",
      "infoPlist": {
        "NSSupportsLiveActivities": true
      },
      "entitlements": {
        "com.apple.security.application-groups": [
          "group.com.example.myapp"
        ]
      }
    }
  }
}
```

**Manual Xcode Setup** (if not using Expo):
1. Open Xcode → Select target → Signing & Capabilities
2. Click "+ Capability" → App Groups
3. Add `group.{bundle-identifier}`
4. Repeat for widget extension target

### Step 2: Create Widget Extension

**Option A: Using Xcode**

1. File → New → Target → Widget Extension
2. Name: "MyAppWidget"
3. Configure:
   - Include Configuration Intent: No (for simple widgets)
   - Include Live Activity: Yes (if needed)
4. Xcode creates: `MyAppWidget/MyAppWidget.swift`

**Option B: Using @bacons/apple-targets**

```bash
npx create-target widget MyAppWidget
```

### Step 3: Widget Code (Swift)

**MyAppWidget.swift**:
```swift
import WidgetKit
import SwiftUI

// MARK: - Data Model
struct WidgetData: Codable {
    let title: String
    let value: String
    let timestamp: Double
}

// MARK: - Timeline Provider
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), title: "Loading...", value: "")
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = loadData() ?? SimpleEntry(date: Date(), title: "No Data", value: "")
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let entry = loadData() ?? SimpleEntry(date: Date(), title: "No Data", value: "")
        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
    }

    // Load data from App Group
    private func loadData() -> SimpleEntry? {
        let sharedDefaults = UserDefaults(suiteName: "group.com.example.myapp")
        guard let jsonString = sharedDefaults?.string(forKey: "widget_data_mywidget"),
              let jsonData = jsonString.data(using: .utf8),
              let data = try? JSONDecoder().decode(WidgetData.self, from: jsonData) else {
            return nil
        }

        return SimpleEntry(
            date: Date(timeIntervalSince1970: data.timestamp),
            title: data.title,
            value: data.value
        )
    }
}

// MARK: - Entry
struct SimpleEntry: TimelineEntry {
    let date: Date
    let title: String
    let value: String
}

// MARK: - Widget View
struct MyAppWidgetView : View {
    var entry: Provider.Entry

    var body: some View {
        VStack(spacing: 8) {
            Text(entry.title)
                .font(.headline)
                .foregroundColor(.primary)

            Text(entry.value)
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(.blue)

            Text(entry.date, style: .relative)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color("WidgetBackground"))
    }
}

// MARK: - Widget Configuration
struct MyAppWidget: Widget {
    let kind: String = "MyAppWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            MyAppWidgetView(entry: entry)
        }
        .configurationDisplayName("My App Widget")
        .description("Shows data from My App")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// MARK: - Preview
struct MyAppWidget_Previews: PreviewProvider {
    static var previews: some View {
        MyAppWidgetView(entry: SimpleEntry(date: Date(), title: "Preview", value: "123"))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
```

### Step 4: Native Module (React Native Side)

**BrikWidgetManager.swift**:
```swift
import Foundation
import WidgetKit
import React

@objc(BrikWidgetManager)
class BrikWidgetManager: NSObject {

    private var appGroupIdentifier: String {
        guard let bundleId = Bundle.main.bundleIdentifier else {
            return "group.com.app"
        }
        return "group.\(bundleId)"
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc
    func updateWidget(
        _ widgetId: String,
        data: NSDictionary,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
            reject("APP_GROUP_ERROR", "Failed to access App Group", nil)
            return
        }

        guard let dataDict = data as? [String: Any] else {
            reject("INVALID_DATA", "Data must be a dictionary", nil)
            return
        }

        do {
            var widgetData = dataDict
            widgetData["_timestamp"] = Date().timeIntervalSince1970
            widgetData["_widgetId"] = widgetId

            let jsonData = try JSONSerialization.data(withJSONObject: widgetData, options: [])

            if jsonData.count > 1_000_000 {
                reject("DATA_TOO_LARGE", "Data exceeds 1MB limit", nil)
                return
            }

            let jsonString = String(data: jsonData, encoding: .utf8)
            sharedDefaults.set(jsonString, forKey: "widget_data_\(widgetId)")

            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }

            resolve(["success": true, "widgetId": widgetId])
        } catch {
            reject("SERIALIZATION_ERROR", error.localizedDescription, nil)
        }
    }
}
```

**BrikWidgetManager.m** (Bridge):
```objc
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BrikWidgetManager, NSObject)

RCT_EXTERN_METHOD(updateWidget:(NSString *)widgetId
                  data:(NSDictionary *)data
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
```

### Step 5: React Native Usage

```tsx
import { NativeModules, Platform } from 'react-native';

const { BrikWidgetManager } = NativeModules;

export const widgetManager = {
  async updateWidget(widgetId: string, data: any) {
    if (Platform.OS !== 'ios') {
      throw new Error('iOS only');
    }

    return await BrikWidgetManager.updateWidget(widgetId, data);
  },
};

// Usage in your app
function MyScreen() {
  const updateHomeWidget = async () => {
    try {
      await widgetManager.updateWidget('mywidget', {
        title: 'Sales Today',
        value: '$12,345',
      });
      console.log('Widget updated!');
    } catch (error) {
      console.error('Failed to update widget:', error);
    }
  };

  return <Button title="Update Widget" onPress={updateHomeWidget} />;
}
```

---

## iOS Live Activities (ActivityKit)

### Prerequisites

```bash
iOS: 16.1+
Xcode: 14.0+
```

### Step 1: Define ActivityAttributes

**OrderTrackingAttributes.swift**:
```swift
import ActivityKit
import SwiftUI

struct OrderTrackingAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var status: String
        var estimatedTime: Int
    }

    var orderId: String
    var storeName: String
}
```

### Step 2: Create Activity Widget

**OrderTrackingLiveActivity.swift**:
```swift
import ActivityKit
import WidgetKit
import SwiftUI

struct OrderTrackingLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: OrderTrackingAttributes.self) { context in
            // Lock screen / banner UI
            VStack {
                HStack {
                    Text(context.attributes.storeName)
                        .font(.headline)
                    Spacer()
                    Text(context.attributes.orderId)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                HStack {
                    Text("Status: \(context.state.status)")
                    Spacer()
                    Text("\(context.state.estimatedTime) min")
                        .fontWeight(.bold)
                }
            }
            .padding()
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded region
                DynamicIslandExpandedRegion(.leading) {
                    Text(context.attributes.storeName)
                        .font(.caption)
                }

                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(context.state.estimatedTime) min")
                        .fontWeight(.bold)
                }

                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.state.status)
                        .font(.caption2)
                }
            } compactLeading: {
                Image(systemName: "bag")
            } compactTrailing: {
                Text("\(context.state.estimatedTime)m")
            } minimal: {
                Image(systemName: "bag")
            }
        }
    }
}
```

### Step 3: Native Module for Live Activities

**BrikLiveActivities.swift**:
```swift
import Foundation
import ActivityKit
import React

@objc(BrikLiveActivities)
class BrikLiveActivities: NSObject {

    private var activities: [String: any ActivityProtocol] = [:]

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc
    func startActivity(
        _ options: NSDictionary,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.1, *) else {
            reject("UNSUPPORTED", "Live Activities require iOS 16.1+", nil)
            return
        }

        guard let activityType = options["activityType"] as? String else {
            reject("INVALID_ARGS", "activityType required", nil)
            return
        }

        // Handle specific activity types
        switch activityType {
        case "OrderTracking":
            startOrderTracking(options: options, resolve: resolve, reject: reject)
        default:
            reject("UNKNOWN_TYPE", "Unknown activity type: \(activityType)", nil)
        }
    }

    @available(iOS 16.1, *)
    private func startOrderTracking(
        options: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let attributes = options["attributes"] as? NSDictionary,
              let staticAttrs = attributes["static"] as? [String: Any],
              let dynamicAttrs = attributes["dynamic"] as? [String: Any],
              let orderId = staticAttrs["orderId"] as? String,
              let storeName = staticAttrs["storeName"] as? String,
              let status = dynamicAttrs["status"] as? String,
              let eta = dynamicAttrs["estimatedTime"] as? Int else {
            reject("INVALID_ATTRS", "Invalid attributes", nil)
            return
        }

        let activityAttributes = OrderTrackingAttributes(
            orderId: orderId,
            storeName: storeName
        )

        let contentState = OrderTrackingAttributes.ContentState(
            status: status,
            estimatedTime: eta
        )

        do {
            let activity = try Activity.request(
                attributes: activityAttributes,
                contentState: contentState,
                pushType: .token
            )

            let activityId = UUID().uuidString
            activities[activityId] = activity

            resolve([
                "id": activityId,
                "activityType": "OrderTracking",
                "pushToken": activity.pushToken?.hexString ?? "",
                "state": "active"
            ])
        } catch {
            reject("START_FAILED", error.localizedDescription, nil)
        }
    }

    @objc
    func updateActivity(
        _ activityId: String,
        options: NSDictionary,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.1, *) else {
            reject("UNSUPPORTED", "Live Activities require iOS 16.1+", nil)
            return
        }

        guard let activity = activities[activityId] as? Activity<OrderTrackingAttributes> else {
            reject("NOT_FOUND", "Activity not found", nil)
            return
        }

        guard let dynamicAttrs = options["dynamic"] as? [String: Any],
              let status = dynamicAttrs["status"] as? String,
              let eta = dynamicAttrs["estimatedTime"] as? Int else {
            reject("INVALID_ATTRS", "Invalid dynamic attributes", nil)
            return
        }

        let newState = OrderTrackingAttributes.ContentState(
            status: status,
            estimatedTime: eta
        )

        Task {
            await activity.update(using: newState)
            resolve(["success": true])
        }
    }

    @objc
    func endActivity(
        _ activityId: String,
        dismissalPolicy: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.1, *) else {
            reject("UNSUPPORTED", "Live Activities require iOS 16.1+", nil)
            return
        }

        guard let activity = activities[activityId] as? Activity<OrderTrackingAttributes> else {
            reject("NOT_FOUND", "Activity not found", nil)
            return
        }

        let policy: ActivityUIDismissalPolicy
        switch dismissalPolicy {
        case "default":
            policy = .default
        case "immediate":
            policy = .immediate
        case "after":
            policy = .after(.now + 10)
        default:
            policy = .default
        }

        Task {
            await activity.end(using: nil, dismissalPolicy: policy)
            activities.removeValue(forKey: activityId)
            resolve(["success": true])
        }
    }
}
```

### Step 4: React Native Usage

```tsx
import { NativeModules } from 'react-native';

const { BrikLiveActivities } = NativeModules;

export const Brik = {
  async startActivity(options: {
    activityType: string;
    attributes: {
      static: Record<string, any>;
      dynamic: Record<string, any>;
    };
  }) {
    return await BrikLiveActivities.startActivity(options);
  },

  async updateActivity(activityId: string, dynamic: Record<string, any>) {
    return await BrikLiveActivities.updateActivity(activityId, { dynamic });
  },

  async endActivity(activityId: string, dismissalPolicy: 'default' | 'immediate' | 'after' = 'default') {
    return await BrikLiveActivities.endActivity(activityId, dismissalPolicy);
  },
};

// Usage
function OrderTracker() {
  const [activityId, setActivityId] = useState<string | null>(null);

  const startTracking = async () => {
    const activity = await Brik.startActivity({
      activityType: 'OrderTracking',
      attributes: {
        static: {
          orderId: '12345',
          storeName: 'Coffee Shop',
        },
        dynamic: {
          status: 'preparing',
          estimatedTime: 15,
        },
      },
    });

    setActivityId(activity.id);
  };

  const updateStatus = async () => {
    if (!activityId) return;

    await Brik.updateActivity(activityId, {
      status: 'delivering',
      estimatedTime: 5,
    });
  };

  const completeOrder = async () => {
    if (!activityId) return;

    await Brik.endActivity(activityId, 'default');
    setActivityId(null);
  };

  return (
    <View>
      <Button title="Start Tracking" onPress={startTracking} />
      <Button title="Update Status" onPress={updateStatus} disabled={!activityId} />
      <Button title="Complete Order" onPress={completeOrder} disabled={!activityId} />
    </View>
  );
}
```

---

## Android Widget Setup (Glance)

### Prerequisites

```bash
Android: API 21+ (Android 5.0)
Glance: API 31+ (Android 12) recommended
```

### Step 1: Add Dependencies

**android/app/build.gradle**:
```gradle
dependencies {
    implementation("androidx.glance:glance-appwidget:1.1.0")
    implementation("androidx.glance:glance-material3:1.1.0")
}
```

### Step 2: Create Widget Info XML

**android/app/src/main/res/xml/my_widget_info.xml**:
```xml
<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="110dp"
    android:minHeight="110dp"
    android:updatePeriodMillis="0"
    android:previewImage="@drawable/widget_preview"
    android:initialLayout="@layout/widget_loading"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen"
    android:description="@string/widget_description" />
```

### Step 3: Widget Implementation (Kotlin)

**MyWidget.kt**:
```kotlin
package com.myapp.generated

import android.content.Context
import android.content.SharedPreferences
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent
import androidx.glance.layout.*
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class WidgetData(
    val title: String,
    val value: String,
    val timestamp: Long
)

class MyWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val data = loadWidgetData(context)

        provideContent {
            Column(
                modifier = GlanceModifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalAlignment = Alignment.Vertical.CenterVertically,
                horizontalAlignment = Alignment.Horizontal.CenterHorizontally
            ) {
                if (data != null) {
                    Text(
                        text = data.title,
                        style = TextStyle(
                            fontSize = 18.sp,
                            color = ColorProvider(Color.Black)
                        )
                    )

                    Spacer(modifier = GlanceModifier.height(8.dp))

                    Text(
                        text = data.value,
                        style = TextStyle(
                            fontSize = 24.sp,
                            color = ColorProvider(Color.Blue)
                        )
                    )

                    Spacer(modifier = GlanceModifier.height(4.dp))

                    Text(
                        text = "Updated ${System.currentTimeMillis() - data.timestamp}ms ago",
                        style = TextStyle(
                            fontSize = 12.sp,
                            color = ColorProvider(Color.Gray)
                        )
                    )
                } else {
                    Text(
                        text = "No Data",
                        style = TextStyle(
                            fontSize = 16.sp,
                            color = ColorProvider(Color.Gray)
                        )
                    )
                }
            }
        }
    }

    private fun loadWidgetData(context: Context): WidgetData? {
        val prefs: SharedPreferences = context.getSharedPreferences(
            "MyAppWidgetData",
            Context.MODE_PRIVATE
        )

        val jsonString = prefs.getString("widget_data_mywidget", null) ?: return null

        return try {
            Json.decodeFromString<WidgetData>(jsonString)
        } catch (e: Exception) {
            null
        }
    }
}

class MyWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = MyWidget()
}
```

### Step 4: Register in AndroidManifest.xml

**AndroidManifest.xml**:
```xml
<application>
    <!-- ... -->

    <receiver
        android:name=".generated.MyWidgetReceiver"
        android:exported="true">
        <intent-filter>
            <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
        </intent-filter>
        <meta-data
            android:name="android.appwidget.provider"
            android:resource="@xml/my_widget_info" />
    </receiver>
</application>
```

### Step 5: Native Module (React Native Side)

**BrikWidgetManagerModule.kt**:
```kotlin
package com.myapp

import android.content.Context
import android.content.SharedPreferences
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.updateAll
import com.facebook.react.bridge.*
import com.myapp.generated.MyWidget
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject

class BrikWidgetManagerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val coroutineScope = CoroutineScope(Dispatchers.Main)

    override fun getName(): String = "BrikWidgetManager"

    @ReactMethod
    fun updateWidget(
        widgetId: String,
        data: ReadableMap,
        promise: Promise
    ) {
        try {
            val context = reactApplicationContext
            val prefs: SharedPreferences = context.getSharedPreferences(
                "MyAppWidgetData",
                Context.MODE_PRIVATE
            )

            // Convert ReadableMap to JSON
            val jsonObject = JSONObject()
            val iterator = data.keySetIterator()
            while (iterator.hasNextKey()) {
                val key = iterator.nextKey()
                when (val value = data.getDynamic(key).type) {
                    ReadableType.String -> jsonObject.put(key, data.getString(key))
                    ReadableType.Number -> jsonObject.put(key, data.getDouble(key))
                    ReadableType.Boolean -> jsonObject.put(key, data.getBoolean(key))
                    else -> {}
                }
            }

            // Add metadata
            jsonObject.put("_timestamp", System.currentTimeMillis())
            jsonObject.put("_widgetId", widgetId)

            // Save to SharedPreferences
            prefs.edit()
                .putString("widget_data_$widgetId", jsonObject.toString())
                .apply()

            // Update widget
            coroutineScope.launch {
                try {
                    MyWidget().updateAll(context)

                    val result = Arguments.createMap().apply {
                        putBoolean("success", true)
                        putString("widgetId", widgetId)
                    }
                    promise.resolve(result)
                } catch (e: Exception) {
                    promise.reject("UPDATE_FAILED", e.message)
                }
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}
```

### Step 6: React Native Usage

```tsx
import { NativeModules, Platform } from 'react-native';

const { BrikWidgetManager } = NativeModules;

export const widgetManager = {
  async updateWidget(widgetId: string, data: any) {
    if (Platform.OS !== 'android') {
      throw new Error('Android only');
    }

    return await BrikWidgetManager.updateWidget(widgetId, data);
  },
};

// Usage
function MyScreen() {
  const updateWidget = async () => {
    try {
      await widgetManager.updateWidget('mywidget', {
        title: 'Sales Today',
        value: '$12,345',
      });
      console.log('Widget updated!');
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return <Button title="Update Widget" onPress={updateWidget} />;
}
```

---

## Cross-Platform Considerations

### Data Synchronization

**Best Practice: Unified API**

```tsx
// widgetManager.ts
import { NativeModules, Platform } from 'react-native';

const { BrikWidgetManager } = NativeModules;

export interface WidgetData {
  title: string;
  value: string;
  [key: string]: any;
}

export const widgetManager = {
  async updateWidget(widgetId: string, data: WidgetData): Promise<void> {
    if (!BrikWidgetManager) {
      throw new Error('Widget manager not available');
    }

    try {
      await BrikWidgetManager.updateWidget(widgetId, data);
    } catch (error) {
      console.error(`[${Platform.OS}] Widget update failed:`, error);
      throw error;
    }
  },

  async getAppGroupIdentifier(): Promise<string> {
    if (Platform.OS === 'ios' && BrikWidgetManager.getAppGroupIdentifier) {
      return await BrikWidgetManager.getAppGroupIdentifier();
    }
    return `com.${Platform.OS}.appgroup`;
  },

  async areWidgetsSupported(): Promise<boolean> {
    if (BrikWidgetManager.areWidgetsSupported) {
      return await BrikWidgetManager.areWidgetsSupported();
    }
    return false;
  },
};
```

### Shared Types

```tsx
// types.ts
export interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  supportedPlatforms: ('ios' | 'android')[];
  supportedSizes: WidgetSize[];
}

export type WidgetSize = 'small' | 'medium' | 'large' | 'extraLarge';

export interface WidgetUpdateOptions {
  immediate?: boolean;
  background?: boolean;
}
```

---

## Brik Implementation

### What Brik Provides

Brik is a **cross-platform widget framework** that:

1. ✅ **Compile-Time Code Generation**: TSX → Native (Swift + Kotlin)
2. ✅ **Single Codebase**: Write once in TSX, deploy to iOS & Android
3. ✅ **Type-Safe**: Full TypeScript support
4. ✅ **ActivityKit Support**: Live Activities with registry pattern
5. ✅ **Hot Reload**: WebSocket-based widget hot reload in development

### Key Differences from Other Libraries

| Feature | Brik | react-native-widget-extension | react-native-android-widget | @bacons/apple-targets |
|---------|------|------------------------------|-----------------------------|-----------------------|
| **Cross-Platform** | ✅ iOS + Android | ❌ iOS only | ❌ Android only | ❌ iOS only |
| **Code Generation** | ✅ Compile-time (TSX → Native) | ❌ Manual Swift | ✅ Runtime (JSX → RemoteViews) | ❌ Manual Swift |
| **Live Activities** | ✅ Full support | ✅ Full support | ❌ N/A | ✅ Manual setup |
| **Hot Reload** | ✅ WebSocket | ❌ | ❌ | ❌ |
| **Type Safety** | ✅ Full TypeScript | ⚠️ Partial | ⚠️ Partial | ⚠️ Partial |
| **Native Code Required** | ❌ Generated | ✅ Swift | ❌ None | ✅ Swift |

### Brik Architecture

```
┌─────────────────────────────────────────────────────┐
│                 React Native App                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  BrikView, BrikText, BrikButton (Components) │  │
│  │  @brik/react-native                          │  │
│  └──────────────────────────────────────────────┘  │
│                       │                              │
│                       ▼                              │
│  ┌──────────────────────────────────────────────┐  │
│  │  widgetManager.updateWidget(id, data)        │  │
│  │  Brik.startActivity(...)                     │  │
│  └──────────────────────────────────────────────┘  │
│                       │                              │
└───────────────────────┼──────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          │                           │
          ▼                           ▼
┌──────────────────┐        ┌──────────────────┐
│  iOS Native      │        │  Android Native  │
│  ┌────────────┐  │        │  ┌────────────┐  │
│  │WidgetKit   │  │        │  │Glance      │  │
│  │ActivityKit │  │        │  │AppWidget   │  │
│  └────────────┘  │        │  └────────────┘  │
│  ┌────────────┐  │        │  ┌────────────┐  │
│  │App Groups  │  │        │  │SharedPrefs │  │
│  │UserDefaults│  │        │  │            │  │
│  └────────────┘  │        │  └────────────┘  │
└──────────────────┘        └──────────────────┘

         │                           │
         ▼                           ▼
┌──────────────────┐        ┌──────────────────┐
│  Generated Swift │        │  Generated Kotlin│
│  OrderTracking   │        │  WeatherWidget.kt│
│  Activity.swift  │        │                  │
│  WeatherWidget   │        │  BrikWidgetMgr   │
│  .swift          │        │  .kt             │
└──────────────────┘        └──────────────────┘
```

### Brik Components

**1. Compiler** (`@brik/compiler`):
- Parses TSX files
- Generates IR (Intermediate Representation)
- Validates component usage

**2. Code Generators**:
- `@brik/target-swiftui`: TSX → SwiftUI
- `@brik/target-compose`: TSX → Jetpack Compose

**3. Runtime** (`@brik/react-native`):
- Native modules: `BrikWidgetManager`, `BrikLiveActivities`
- React components: `BrikView`, `BrikText`, etc.
- Hot reload: `useBrikHotReload` hook

**4. CLI** (`@brik/cli`):
- `brik build --platform ios/android`
- `brik watch` (hot reload server)
- `brik ios-setup --name WidgetName`

**5. Expo Plugin** (`@brik/expo-plugin`):
- Auto-configures Android manifest
- Adds Glance dependencies
- Runs code generation on prebuild

### Example Brik Widget

**Input (TSX)**:
```tsx
// WeatherWidget.tsx
import { BrikView, BrikText, BrikImage } from '@brik/react-native';

export function WeatherWidget() {
  return (
    <BrikView style={{ padding: 16, backgroundColor: '#FFFFFF', borderRadius: 12 }}>
      <BrikView style={{ flexDirection: 'row', alignItems: 'center' }}>
        <BrikImage
          source={{ uri: 'weather-icon' }}
          style={{ width: 48, height: 48 }}
        />
        <BrikView style={{ marginLeft: 12 }}>
          <BrikText style={{ fontSize: 24, fontWeight: '700' }}>72°F</BrikText>
          <BrikText style={{ fontSize: 14, color: '#666666' }}>Partly Cloudy</BrikText>
        </BrikView>
      </BrikView>
      <BrikText style={{ fontSize: 12, color: '#999999', marginTop: 8 }}>
        San Francisco, CA
      </BrikText>
    </BrikView>
  );
}
```

**Output (Swift)** - Generated:
```swift
import WidgetKit
import SwiftUI

struct WeatherWidget: Widget {
    let kind: String = "WeatherWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            WeatherWidgetView(entry: entry)
        }
        .configurationDisplayName("Weather")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct WeatherWidgetView: View {
    var entry: Provider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .center, spacing: 0) {
                Image(systemName: "cloud.sun.fill")
                    .resizable()
                    .frame(width: 48, height: 48)

                VStack(alignment: .leading, spacing: 0) {
                    Text("72°F")
                        .font(.system(size: 24))
                        .fontWeight(.bold)

                    Text("Partly Cloudy")
                        .font(.system(size: 14))
                        .foregroundColor(Color(hex: "666666"))
                }
                .padding(.leading, 12)
            }

            Text("San Francisco, CA")
                .font(.system(size: 12))
                .foregroundColor(Color(hex: "999999"))
                .padding(.top, 8)
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(12)
    }
}
```

**Output (Kotlin)** - Generated:
```kotlin
package com.myapp.generated

import androidx.glance.GlanceModifier
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.layout.*
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class WeatherWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            Column(
                modifier = GlanceModifier
                    .fillMaxSize()
                    .padding(16.dp)
                    .cornerRadius(12.dp)
                    .background(ColorProvider(Color.White)),
                verticalAlignment = Alignment.Start
            ) {
                Row(
                    modifier = GlanceModifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Image(
                        provider = ImageProvider(R.drawable.weather_icon),
                        contentDescription = "Weather",
                        modifier = GlanceModifier.size(48.dp)
                    )

                    Spacer(modifier = GlanceModifier.width(12.dp))

                    Column {
                        Text(
                            text = "72°F",
                            style = TextStyle(
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )

                        Text(
                            text = "Partly Cloudy",
                            style = TextStyle(
                                fontSize = 14.sp,
                                color = ColorProvider(Color(0xFF666666))
                            )
                        )
                    }
                }

                Spacer(modifier = GlanceModifier.height(8.dp))

                Text(
                    text = "San Francisco, CA",
                    style = TextStyle(
                        fontSize = 12.sp,
                        color = ColorProvider(Color(0xFF999999))
                    )
                )
            }
        }
    }
}
```

---

## Best Practices

### 1. Data Size Management

**Problem**: UserDefaults (iOS) and SharedPreferences (Android) have size limits

**Solution**:
```tsx
// Good: Store minimal data
await widgetManager.updateWidget('weather', {
  temp: 72,
  condition: 'cloudy',
  location: 'SF',
});

// Bad: Don't store large objects
await widgetManager.updateWidget('weather', {
  fullForecast: [...], // Huge array
  historicalData: [...], // Even bigger
  images: [...], // Binary data
});
```

**iOS Limit**: ~1MB per key (practical limit)
**Android Limit**: No hard limit but keep under 100KB

### 2. Update Frequency

**iOS**: Widgets update via Timeline (WidgetKit decides when)
**Android**: Can force updates but battery drain

```tsx
// Good: Update on significant events
const onOrderStatusChange = async (status: string) => {
  await widgetManager.updateWidget('order', { status });
};

// Bad: Don't spam updates
setInterval(() => {
  widgetManager.updateWidget('data', { time: Date.now() });
}, 1000); // ❌ Every second is too frequent
```

### 3. Error Handling

```tsx
async function updateWidgetSafely(widgetId: string, data: any) {
  try {
    // Validate data size
    const dataString = JSON.stringify(data);
    if (dataString.length > 100_000) {
      throw new Error('Data too large');
    }

    // Update widget
    await widgetManager.updateWidget(widgetId, data);

    console.log('Widget updated successfully');
  } catch (error) {
    console.error('Widget update failed:', error);

    // Log to analytics
    analytics.logError('widget_update_failed', {
      widgetId,
      error: error.message,
      platform: Platform.OS,
    });

    // Don't throw - failing widget shouldn't crash app
  }
}
```

### 4. Architecture-Specific Considerations

**New Architecture (Fabric + TurboModules)**:

```typescript
// Must use TurboModules
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  updateWidget(widgetId: string, data: Object): Promise<Object>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('BrikWidgetManager');
```

**Legacy Architecture (Paper)**:

```typescript
// Use NativeModules
import { NativeModules } from 'react-native';

const { BrikWidgetManager } = NativeModules;
```

### 5. Testing Widgets

**iOS**: Use Xcode Widget Simulator
```bash
# Run app in simulator
npx expo run:ios

# Add widget from home screen
# Long press → Add Widget → MyApp → Select widget
```

**Android**: Use Android Emulator
```bash
# Run app in emulator
npx expo run:android

# Add widget from home screen
# Long press → Widgets → MyApp → Drag widget
```

### 6. App Groups Setup (iOS)

**Critical**: Must match between app and widget extension

```swift
// In both main app and widget extension
let appGroupIdentifier = "group.com.example.myapp"
let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier)
```

**Common Mistakes**:
- ❌ Different group IDs in app vs widget
- ❌ Typo in group identifier
- ❌ Forgot to add entitlement to widget target

### 7. ProGuard/R8 (Android)

**Add to proguard-rules.pro**:
```pro
# Glance
-keep class androidx.glance.** { *; }
-dontwarn androidx.glance.**

# Your widget classes
-keep class com.myapp.generated.** { *; }

# Kotlin serialization (if used)
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt
```

### 8. Performance

**iOS**: Use SwiftUI @State sparingly in widgets
**Android**: Avoid complex Composables in Glance

```kotlin
// Good: Simple layout
Column {
    Text("Title")
    Text("Value")
}

// Bad: Complex nested layout
LazyColumn { // ❌ Not supported in Glance
    items(100) {
        ComplexRow(it)
    }
}
```

---

## Troubleshooting

### iOS Issues

#### 1. Widget Not Appearing

**Symptoms**: Widget doesn't show in widget picker

**Solutions**:
- Check widget extension target is included in scheme
- Verify `Info.plist` has correct `NSExtension` configuration
- Clean build folder: Xcode → Product → Clean Build Folder
- Reset simulator: Device → Erase All Content and Settings

#### 2. App Group Error

**Symptoms**: `Failed to access App Group`

**Solutions**:
- Check entitlements file has correct group ID
- Verify both app and widget targets have entitlement
- Check bundle IDs match between code and Xcode
- Re-sign app if needed

#### 3. Widget Shows "No Data"

**Symptoms**: Widget displays but shows placeholder

**Solutions**:
- Check `UserDefaults(suiteName:)` matches in app and widget
- Verify data is being saved: `sharedDefaults.synchronize()`
- Check data key matches: `widget_data_{widgetId}`
- Ensure JSON serialization succeeded

#### 4. Live Activity Not Starting

**Symptoms**: `startActivity` fails or returns error

**Solutions**:
- Check iOS version >= 16.1
- Verify `NSSupportsLiveActivities` in Info.plist
- Check ActivityAttributes struct is correct
- Ensure `Info.plist` has `NSSupportsLiveActivitiesFrequentUpdates`

### Android Issues

#### 1. Widget Not Registered

**Symptoms**: Widget doesn't appear in widget picker

**Solutions**:
- Check `AndroidManifest.xml` has receiver
- Verify `@xml/widget_info.xml` exists
- Check package name matches
- Rebuild app: `npx expo run:android --no-build-cache`

#### 2. SharedPreferences Not Working

**Symptoms**: Widget doesn't update with new data

**Solutions**:
- Check SharedPreferences name matches
- Use `Context.MODE_PRIVATE`
- Call `.apply()` or `.commit()` after edit
- Verify widget receiver has proper permissions

#### 3. Glance Compose Error

**Symptoms**: Build error with Glance dependencies

**Solutions**:
- Update Gradle: `gradle/wrapper/gradle-wrapper.properties`
- Check Android compileSdkVersion >= 31
- Update Glance to latest: `androidx.glance:glance-appwidget:1.1.0`
- Sync Gradle: Android Studio → File → Sync Project

#### 4. ProGuard Stripping Widget Code

**Symptoms**: Widget works in debug but fails in release

**Solutions**:
- Add ProGuard rules for Glance
- Keep widget classes: `-keep class com.myapp.generated.** { *; }`
- Check `minifyEnabled` in `build.gradle`

### Cross-Platform Issues

#### 1. Type Mismatch

**Symptoms**: Data types different between iOS and Android

**Solutions**:
```tsx
// Use consistent types
interface WidgetData {
  title: string;  // Not 'String' or 'NSString'
  value: number;  // Not 'int' or 'Double'
  flag: boolean;  // Not 'Bool' or 'Boolean'
}
```

#### 2. Date/Time Formatting

**Symptoms**: Timestamps different between platforms

**Solutions**:
```tsx
// Always use Unix timestamp (milliseconds)
const timestamp = Date.now();

// iOS
let date = Date(timeIntervalSince1970: timestamp / 1000)

// Android
val date = Date(timestamp)
```

#### 3. Module Not Found

**Symptoms**: `NativeModules.BrikWidgetManager is undefined`

**Solutions**:
- iOS: Run `pod install` in `ios/` directory
- Android: Clean and rebuild
- Check native module is linked correctly
- For New Arch: Ensure TurboModule is registered

---

## Conclusion

### Summary of Approaches

1. **Manual Native Development**
   - ✅ Full control
   - ✅ Access to all platform features
   - ❌ Write code twice (Swift + Kotlin)
   - ❌ Steep learning curve

2. **Platform-Specific Libraries**
   - `react-native-widget-extension` (iOS)
   - `react-native-android-widget` (Android)
   - ✅ Easier than manual
   - ❌ Still need two libraries
   - ❌ Different APIs

3. **Brik (This Project)**
   - ✅ Single codebase (TSX)
   - ✅ Cross-platform
   - ✅ Type-safe
   - ✅ Hot reload
   - ⚠️ Compile-time dependency

### Recommendations by Use Case

| Use Case | Recommendation | Why |
|----------|----------------|-----|
| **Expo Managed Workflow** | Brik or @bacons/apple-targets | Expo plugin support |
| **React Native CLI** | Brik or Manual | Full control needed |
| **iOS Only** | react-native-widget-extension | Mature, focused |
| **Android Only** | react-native-android-widget | React-like API |
| **Complex Widgets** | Manual Native | Access to all APIs |
| **Simple Widgets** | Brik | Fast development |
| **Legacy Arch** | Any approach works | No special requirements |
| **New Arch** | Brik (with TurboModules) | Native module compatibility |

### Next Steps

1. **Choose your approach** based on requirements
2. **Set up development environment** (Xcode, Android Studio)
3. **Configure app groups/shared storage**
4. **Implement widget UI** (native or generated)
5. **Create native modules** for data bridging
6. **Test on real devices** (simulators have limitations)
7. **Optimize for battery** and data usage
8. **Add analytics** to track widget usage

---

## Additional Resources

### Official Documentation

- **iOS WidgetKit**: https://developer.apple.com/documentation/widgetkit
- **iOS ActivityKit**: https://developer.apple.com/documentation/activitykit
- **Android Glance**: https://developer.android.com/jetpack/compose/glance
- **Expo Config Plugins**: https://docs.expo.dev/config-plugins/introduction/

### Libraries

- **react-native-widget-extension**: https://github.com/bndkt/react-native-widget-extension
- **react-native-android-widget**: https://github.com/sAleksovski/react-native-android-widget
- **@bacons/apple-targets**: https://github.com/EvanBacon/expo-apple-targets

### Community Guides

- Pete Arontoth's Interactive Widgets: https://www.peterarontoth.com/posts/interactive-widgets-in-expo-managed-workflows
- React Native University: https://www.reactnative.university/blog/live-activities-unleashed
- Medium Guides: Search "React Native widgets 2025"

---

**Last Updated**: October 2025
**Brik Version**: v0.3.0
**React Native**: 0.81.4
**Expo**: 54.0.13
