# Android ProGuard/R8 Setup for Brik Widgets

Complete guide for configuring ProGuard/R8 code shrinking and obfuscation for Brik widgets in Android release builds.

**Last Updated:** 2025-10-20
**Applies to:** Brik v0.2.0+, React Native 0.70+, Android Gradle Plugin 7.0+

---

## Table of Contents

1. [Overview](#overview)
2. [Why ProGuard Rules Are Required](#why-proguard-rules-are-required)
3. [Quick Setup](#quick-setup)
4. [Detailed ProGuard Rules](#detailed-proguard-rules)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Configuration](#advanced-configuration)

---

## Overview

**ProGuard/R8** is Android's code shrinker and obfuscator that:
- Removes unused code (shrinking)
- Renames classes/methods to shorter names (obfuscation)
- Optimizes bytecode (optimization)

**Problem:** ProGuard/R8 may remove or rename Brik widget classes that are referenced via reflection or XML, causing **runtime crashes** in release builds.

**Solution:** Add ProGuard keep rules to preserve Brik widget classes.

---

## Why ProGuard Rules Are Required

### What ProGuard/R8 Does

In **release builds**, Android Gradle Plugin automatically enables R8 (successor to ProGuard) to:

1. **Remove unused code:**
   ```kotlin
   // If BrikWidgetManager is never directly imported in Kotlin/Java,
   // R8 assumes it's unused and removes it
   class BrikWidgetManager  // ← REMOVED by R8
   ```

2. **Rename classes:**
   ```kotlin
   // AndroidManifest.xml references:
   <receiver android:name=".widgets.WeatherWidgetReceiver" />

   // But R8 renames it to:
   class a extends GlanceAppWidgetReceiver  // ← Crash!
   ```

3. **Inline methods:**
   ```kotlin
   fun updateWidget() { /* ... */ }  // ← Inlined/removed
   ```

### Why Brik Widgets Break

Brik widgets use:
- **Reflection** in React Native bridge
- **XML references** in AndroidManifest.xml
- **Glance framework** dynamic instantiation

R8 doesn't detect these indirect references, so it removes/renames widget classes, causing:

```
java.lang.ClassNotFoundException: com.yourapp.widgets.WeatherWidgetReceiver
    at android.appwidget.AppWidgetHost.createView
```

---

## Quick Setup

### Step 1: Create ProGuard Rules File

Create `android/app/proguard-rules.pro` (if it doesn't exist):

```bash
touch android/app/proguard-rules.pro
```

### Step 2: Add Brik Widget Rules

Add to `android/app/proguard-rules.pro`:

```proguard
# ============================================================================
# Brik Widget Keep Rules
# ============================================================================

# Keep all Brik native module classes (React Native bridge)
-keep class com.brik.** { *; }

# Keep all widget receiver classes (referenced in AndroidManifest.xml)
-keep class **.widgets.*Receiver { *; }
-keep class **.widgets.*Provider { *; }

# Keep all Glance widget classes
-keep class androidx.glance.** { *; }
-keep interface androidx.glance.** { *; }

# Keep all widget data classes (used for JSON serialization)
-keepclassmembers class **.widgets.** {
    public <init>(...);
    public <fields>;
}

# Keep widget configuration classes
-keep class * extends androidx.glance.appwidget.GlanceAppWidget { *; }
-keep class * extends androidx.glance.appwidget.GlanceAppWidgetReceiver { *; }

# Keep Kotlin metadata for widget classes
-keepattributes *Annotation*, Signature, Exception
-keep class kotlin.Metadata { *; }

# Keep serialization for SharedPreferences data
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
```

### Step 3: Verify ProGuard is Enabled

Check `android/app/build.gradle`:

```gradle
android {
    buildTypes {
        release {
            minifyEnabled true  // ← Should be true for release
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 4: Test Release Build

```bash
cd android
./gradlew assembleRelease
```

If successful, your APK is at: `android/app/build/outputs/apk/release/app-release.apk`

---

## Detailed ProGuard Rules

### Rule Breakdown

#### 1. Keep Brik Native Modules

```proguard
-keep class com.brik.** { *; }
```

**Why:** React Native bridge uses reflection to call native methods.

**What it keeps:**
- `BrikWidgetManager.kt` - Widget data management
- `BrikWidgetModule.kt` - React Native module
- `BrikWidgetPackage.kt` - Package registration

**Without this:** `Method not found: updateWidget` errors in JavaScript.

#### 2. Keep Widget Receivers

```proguard
-keep class **.widgets.*Receiver { *; }
-keep class **.widgets.*Provider { *; }
```

**Why:** `AndroidManifest.xml` references receivers by full class name.

**Example manifest entry:**
```xml
<receiver android:name=".widgets.WeatherWidgetReceiver">
```

**Without this:** `ClassNotFoundException` when adding widget to home screen.

#### 3. Keep Glance Framework

```proguard
-keep class androidx.glance.** { *; }
-keep interface androidx.glance.** { *; }
```

**Why:** Glance uses internal reflection for composition.

**Without this:** Widget UI doesn't render, blank widget displayed.

#### 4. Keep Widget Data Classes

```proguard
-keepclassmembers class **.widgets.** {
    public <init>(...);
    public <fields>;
}
```

**Why:** JSON serialization for `SharedPreferences` needs field names.

**Example:**
```kotlin
data class WidgetData(
    val temperature: Int,  // ← Field name must be preserved
    val condition: String
)
```

**Without this:** Widget shows default/empty data after app restart.

#### 5. Keep Kotlin Metadata

```proguard
-keepattributes *Annotation*, Signature, Exception
-keep class kotlin.Metadata { *; }
```

**Why:** Kotlin reflection and coroutines need metadata annotations.

**Without this:** Kotlin coroutines crash, Glance composition fails.

---

## Verification

### 1. Build Release APK

```bash
cd android
./gradlew assembleRelease
```

### 2. Check Mapping File

ProGuard generates a mapping file showing what was renamed:

```bash
cat android/app/build/outputs/mapping/release/mapping.txt | grep -i "brik\|widget"
```

**Expected output:**
```
com.brik.BrikWidgetManager -> com.brik.BrikWidgetManager
com.yourapp.widgets.WeatherWidgetReceiver -> com.yourapp.widgets.WeatherWidgetReceiver
```

If you see shortened names like `a`, `b`, `c`, your keep rules aren't working.

### 3. Test on Device

```bash
# Install release build
adb install android/app/build/outputs/apk/release/app-release.apk

# Add widget to home screen
# Long-press → Widgets → Find your widget

# Update widget from app
# Should display data correctly
```

### 4. Check for Crashes

```bash
# Monitor logcat for crashes
adb logcat | grep -i "ClassNotFoundException\|MethodNotFoundException"
```

**Common crash signatures:**

❌ **Widget not appearing:**
```
ClassNotFoundException: com.yourapp.widgets.WeatherWidgetReceiver
```
→ Add `-keep class **.widgets.*Receiver { *; }`

❌ **Widget shows no data:**
```
org.json.JSONException: No value for temperature
```
→ Add `-keepclassmembers class **.widgets.** { public <fields>; }`

❌ **React Native bridge fails:**
```
MethodNotFoundException: updateWidget
```
→ Add `-keep class com.brik.** { *; }`

---

## Troubleshooting

### Problem: Release build crashes, debug works fine

**Cause:** ProGuard rules missing or incorrect.

**Solution:**
1. Verify `proguard-rules.pro` exists
2. Check `build.gradle` references it
3. Rebuild: `./gradlew clean assembleRelease`

### Problem: Widget receiver not found

**Error:**
```
android.content.ActivityNotFoundException:
  Unable to find explicit activity class {com.yourapp/com.yourapp.widgets.WeatherWidgetReceiver}
```

**Solution:**

Add to `proguard-rules.pro`:
```proguard
-keep class com.yourapp.widgets.WeatherWidgetReceiver { *; }
```

Or use wildcard:
```proguard
-keep class **.widgets.** { *; }
```

### Problem: Widget data not updating

**Symptom:** Widget shows stale/default data in release build.

**Cause:** Field names obfuscated, JSON parsing fails.

**Solution:**

Add to `proguard-rules.pro`:
```proguard
-keepclassmembers class **.widgets.** {
    <fields>;
}
```

Verify SharedPreferences key in `BrikWidgetManager.kt` matches JavaScript:

```kotlin
// Must match widgetManager.updateWidget("WeatherWidget", {...})
val key = "widget_data_WeatherWidget"
```

### Problem: Glance composition crashes

**Error:**
```
java.lang.IllegalStateException:
  Expected a composition to be available
```

**Cause:** Glance runtime classes were removed.

**Solution:**

Add to `proguard-rules.pro`:
```proguard
-keep class androidx.glance.** { *; }
-keep interface androidx.glance.** { *; }
-keepattributes *Annotation*
```

### Problem: Build increases app size significantly

**Symptom:** Release APK is larger than expected.

**Cause:** Too many `-keep` rules preventing optimization.

**Solution:**

Use specific keep rules instead of wildcards:

```proguard
# ❌ Too broad (keeps everything)
-keep class com.yourapp.** { *; }

# ✅ Specific (keeps only widgets)
-keep class com.yourapp.widgets.** { *; }
```

Enable R8 full mode for better optimization:

```gradle
// android/gradle.properties
android.enableR8.fullMode=true
```

---

## Advanced Configuration

### Minimal Keep Rules (Recommended)

For maximum optimization with safety:

```proguard
# Brik core (React Native bridge only)
-keep class com.brik.BrikWidgetManager { *; }
-keep class com.brik.BrikWidgetModule { *; }

# Your specific widget receivers (replace WeatherWidget)
-keep class com.yourapp.widgets.WeatherWidgetReceiver { *; }

# Glance runtime (minimum required)
-keep class androidx.glance.appwidget.** { *; }
-keep interface androidx.glance.appwidget.** { *; }

# Widget data serialization
-keepclassmembers class com.yourapp.widgets.** {
    <fields>;
}

# Kotlin metadata (coroutines)
-keepattributes *Annotation*
-keep class kotlin.Metadata { *; }
```

### Aggressive Optimization (Advanced)

If you need smallest APK size:

```proguard
# Only keep what's absolutely necessary
-keep,allowobfuscation class com.brik.BrikWidgetManager {
    public <methods>;
}

-keep class com.yourapp.widgets.*Receiver {
    public <init>(...);
}

# Allow optimization but prevent removal
-keepclassmembers,allowoptimization class androidx.glance.** {
    <methods>;
}
```

**Warning:** Test thoroughly on multiple devices.

### Debugging ProGuard Issues

Enable mapping file inspection:

```gradle
// android/app/build.gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'

        // Generate readable mapping
        buildConfigField "boolean", "ENABLE_PROGUARD_DEBUG", "true"
    }
}
```

View what was kept/removed:

```bash
# See all kept classes
cat android/app/build/outputs/mapping/release/usage.txt

# See removed classes
cat android/app/build/outputs/mapping/release/removed.txt

# See renamed classes
cat android/app/build/outputs/mapping/release/mapping.txt
```

### Consumerproguard Rules (Library Authors)

If publishing Brik as a library, add `android/consumer-rules.pro`:

```proguard
# These rules are automatically applied to apps using your library
-keep class com.brik.** { *; }
-keep class **.widgets.*Receiver { *; }
```

Reference in `build.gradle`:

```gradle
android {
    defaultConfig {
        consumerProguardFiles 'consumer-rules.pro'
    }
}
```

---

## Best Practices

### 1. Start Broad, Then Narrow

Begin with broad rules:
```proguard
-keep class **.widgets.** { *; }
```

Test thoroughly, then narrow down:
```proguard
-keep class com.yourapp.widgets.WeatherWidgetReceiver { *; }
```

### 2. Test Every Release Build

**Before submitting to Play Store:**

1. Build release APK: `./gradlew assembleRelease`
2. Install on physical device
3. Test widget addition
4. Test widget updates
5. Test app restart (data persistence)
6. Test widget deletion

### 3. Monitor Crash Reports

Enable crash reporting in production:

```kotlin
// In Application.onCreate()
if (!BuildConfig.DEBUG) {
    FirebaseCrashlytics.getInstance().setCrashlyticsCollectionEnabled(true)
}
```

Monitor for ProGuard-related crashes:
- `ClassNotFoundException`
- `MethodNotFoundException`
- `NoSuchFieldException`

### 4. Keep Rules in Version Control

Always commit `proguard-rules.pro` to git:

```bash
git add android/app/proguard-rules.pro
git commit -m "Add ProGuard rules for Brik widgets"
```

### 5. Document Custom Rules

Add comments explaining why each rule is needed:

```proguard
# Keep WeatherWidget receiver
# Referenced in AndroidManifest.xml line 42
-keep class com.yourapp.widgets.WeatherWidgetReceiver { *; }
```

---

## References

- [Android ProGuard Documentation](https://developer.android.com/studio/build/shrink-code)
- [R8 Full Mode](https://developer.android.com/studio/build/shrink-code#enable-r8-full-mode)
- [Glance ProGuard Rules](https://developer.android.com/jetpack/androidx/releases/glance#proguard)
- [React Native ProGuard](https://reactnative.dev/docs/signed-apk-android#enabling-proguard-to-reduce-the-size-of-the-apk-optional)

---

## Summary

**Required Steps:**

1. ✅ Create `android/app/proguard-rules.pro`
2. ✅ Add Brik widget keep rules
3. ✅ Verify `minifyEnabled true` in `build.gradle`
4. ✅ Test release build: `./gradlew assembleRelease`
5. ✅ Test on physical device

**Common Issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| Widget not appearing | Receiver class removed | `-keep class **.widgets.*Receiver { *; }` |
| Widget shows no data | Field names obfuscated | `-keepclassmembers class **.widgets.** { <fields>; }` |
| React Native bridge fails | Native module removed | `-keep class com.brik.** { *; }` |
| Glance composition crash | Glance classes removed | `-keep class androidx.glance.** { *; }` |

**Next Steps:**

- See [`WIDGET_SETUP_GUIDE.md`](../WIDGET_SETUP_GUIDE.md) for complete Android setup
- See [`INSTALLATION.md`](INSTALLATION.md) for installation instructions
- Report issues: [GitHub Issues](https://github.com/brikjs/brik/issues)

---

**Last Updated:** 2025-10-20
**Brik Version:** v0.2.0+
