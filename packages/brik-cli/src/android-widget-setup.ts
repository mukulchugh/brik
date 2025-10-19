import fs from 'fs-extra';
import path from 'path';

/**
 * Automated Android Widget Setup
 * Creates Glance widget files and configures the Android project
 */

export interface AndroidWidgetSetupOptions {
  androidDir: string;
  widgetName?: string;
  packageName?: string;
}

export async function setupAndroidWidget(options: AndroidWidgetSetupOptions): Promise<void> {
  const { androidDir, widgetName = 'BrikWidget', packageName } = options;

  console.log('🤖 Setting up Android Widget (Glance)...');

  // Determine package name
  const effectivePackageName = packageName || await getPackageName(androidDir);
  if (!effectivePackageName) {
    throw new Error('Could not determine package name. Please provide it with --package-name');
  }

  console.log(`📦 Package name: ${effectivePackageName}`);

  const packagePath = effectivePackageName.replace(/\./g, '/');
  const widgetDir = path.join(androidDir, 'app/src/main/java', packagePath, 'widgets');

  await fs.mkdirp(widgetDir);

  // 1. Create Glance Widget file
  const widgetKotlinContent = `package ${effectivePackageName}.widgets

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.*
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import org.json.JSONObject

/**
 * ${widgetName}
 *
 * Glance-based home screen widget for Android
 * Reads data from SharedPreferences written by BrikWidgetManager
 */
class ${widgetName} : GlanceAppWidget() {
    companion object {
        private const val PREFS_NAME = "BrikWidgetPrefs"
        private const val KEY_PREFIX = "widget_data_"
        private const val WIDGET_ID = "${widgetName}"
    }

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val widgetData = getWidgetData(context)

        provideContent {
            ${widgetName}Content(widgetData)
        }
    }

    /**
     * Read widget data from SharedPreferences
     */
    private fun getWidgetData(context: Context): Map<String, Any?>? {
        try {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val storageKey = KEY_PREFIX + WIDGET_ID
            val jsonString = prefs.getString(storageKey, null) ?: return null

            val jsonObject = JSONObject(jsonString)
            val map = mutableMapOf<String, Any?>()

            jsonObject.keys().forEach { key ->
                map[key] = jsonObject.get(key)
            }

            return map
        } catch (e: Exception) {
            android.util.Log.e("${widgetName}", "Failed to read widget data", e)
            return null
        }
    }
}

/**
 * Widget UI Content
 */
@Composable
fun ${widgetName}Content(data: Map<String, Any?>?) {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(ColorProvider(androidx.compose.ui.graphics.Color.White))
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        if (data != null) {
            // TODO: Replace with your generated widget content
            // Example: Display data from React Native
            Text(
                text = "Brik Widget",
                style = TextStyle(
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = ColorProvider(androidx.compose.ui.graphics.Color.Black)
                )
            )

            Spacer(modifier = GlanceModifier.height(8.dp))

            Text(
                text = "Data loaded: \${data.size} keys",
                style = TextStyle(
                    fontSize = 14.sp,
                    color = ColorProvider(androidx.compose.ui.graphics.Color.Gray)
                )
            )
        } else {
            Text(
                text = "Brik Widget",
                style = TextStyle(
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = ColorProvider(androidx.compose.ui.graphics.Color.Black)
                )
            )

            Spacer(modifier = GlanceModifier.height(8.dp))

            Text(
                text = "Waiting for data...",
                style = TextStyle(
                    fontSize = 14.sp,
                    color = ColorProvider(androidx.compose.ui.graphics.Color.Gray)
                )
            )
        }
    }
}

/**
 * Widget Receiver
 * Required for Android to recognize the widget
 */
class ${widgetName}Receiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = ${widgetName}()
}
`;

  await fs.writeFile(path.join(widgetDir, `${widgetName}.kt`), widgetKotlinContent);
  console.log(`✅ Created ${widgetName}.kt`);

  // 2. Create XML widget info file
  const resDir = path.join(androidDir, 'app/src/main/res');
  const xmlDir = path.join(resDir, 'xml');
  await fs.mkdirp(xmlDir);

  const widgetInfoXml = `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/widget_description"
    android:initialLayout="@layout/widget_loading"
    android:minWidth="180dp"
    android:minHeight="110dp"
    android:previewImage="@drawable/widget_preview"
    android:resizeMode="horizontal|vertical"
    android:targetCellWidth="3"
    android:targetCellHeight="2"
    android:updatePeriodMillis="900000"
    android:widgetCategory="home_screen" />
`;

  await fs.writeFile(path.join(xmlDir, `${widgetName.toLowerCase()}_info.xml`), widgetInfoXml);
  console.log(`✅ Created ${widgetName.toLowerCase()}_info.xml`);

  // 3. Create placeholder layout (Glance will override this)
  const layoutDir = path.join(resDir, 'layout');
  await fs.mkdirp(layoutDir);

  const loadingLayoutXml = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:gravity="center"
    android:orientation="vertical"
    android:background="#FFFFFF">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Brik Widget"
        android:textSize="18sp"
        android:textStyle="bold"
        android:textColor="#000000" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp"
        android:text="Loading..."
        android:textSize="14sp"
        android:textColor="#666666" />

</LinearLayout>
`;

  await fs.writeFile(path.join(layoutDir, 'widget_loading.xml'), loadingLayoutXml);
  console.log(`✅ Created widget_loading.xml`);

  // 4. Add strings to res/values/strings.xml if needed
  const valuesDir = path.join(resDir, 'values');
  await fs.mkdirp(valuesDir);

  console.log(`\n⚠️  Manual steps required:`);
  console.log('1. Add to android/app/build.gradle dependencies:');
  console.log('   implementation "androidx.glance:glance-appwidget:1.0.0"');
  console.log('   implementation "androidx.glance:glance-material3:1.0.0"');
  console.log('');
  console.log('2. Add to android/app/src/main/res/values/strings.xml:');
  console.log(`   <string name="widget_description">Brik Widget powered by React Native</string>`);
  console.log('');
  console.log('3. Add to android/app/src/main/AndroidManifest.xml inside <application>:');
  console.log(`   <receiver
       android:name="${effectivePackageName}.widgets.${widgetName}Receiver"
       android:exported="true">
       <intent-filter>
           <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
       </intent-filter>
       <meta-data
           android:name="android.appwidget.provider"
           android:resource="@xml/${widgetName.toLowerCase()}_info" />
   </receiver>`);
  console.log('');
  console.log('4. Add placeholder drawable (widget_preview.png) to res/drawable/');
  console.log('5. Build and run your Android app');
  console.log('6. Long-press home screen → Widgets → Find your widget');
}

/**
 * Get package name from AndroidManifest.xml
 */
async function getPackageName(androidDir: string): Promise<string | null> {
  try {
    const manifestPath = path.join(androidDir, 'app/src/main/AndroidManifest.xml');

    if (!await fs.pathExists(manifestPath)) {
      return null;
    }

    const manifestContent = await fs.readFile(manifestPath, 'utf8');
    const match = manifestContent.match(/package="([^"]+)"/);

    if (match && match[1]) {
      return match[1];
    }
  } catch (error) {
    console.warn('Failed to read AndroidManifest.xml:', error);
  }

  return null;
}
