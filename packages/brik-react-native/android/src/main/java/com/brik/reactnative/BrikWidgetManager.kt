package com.brik.reactnative

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.updateAll
import com.facebook.react.bridge.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject

/**
 * BrikWidgetManager
 *
 * Native module for updating Android home screen widgets from React Native.
 * Uses Jetpack Glance (built on Jetpack Compose) for modern widget development.
 * Shares data via SharedPreferences accessible to the widget.
 */
class BrikWidgetManager(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val sharedPrefsName = "BrikWidgetData"
    private val coroutineScope = CoroutineScope(Dispatchers.Main)

    override fun getName(): String = "BrikWidgetManager"

    /**
     * Update widget data
     *
     * @param widgetId - Unique identifier for the widget type
     * @param data - Map of data to be accessed by the widget
     */
    @ReactMethod
    fun updateWidget(
        widgetId: String,
        data: ReadableMap,
        promise: Promise
    ) {
        try {
            // Get shared preferences
            val sharedPrefs = getSharedPreferences()
            val editor = sharedPrefs.edit()

            // Convert ReadableMap to JSON string
            val jsonData = JSONObject().apply {
                put("_timestamp", System.currentTimeMillis())
                put("_widgetId", widgetId)

                // Convert ReadableMap to JSONObject
                data.toHashMap().forEach { (key, value) ->
                    put(key, value)
                }
            }

            // Save to shared preferences
            val storageKey = "widget_data_$widgetId"
            editor.putString(storageKey, jsonData.toString())
            editor.apply()

            // Update all Glance widgets
            updateAllWidgets()

            // Return success
            val result = WritableNativeMap().apply {
                putBoolean("success", true)
                putString("widgetId", widgetId)
                putString("sharedPrefsName", sharedPrefsName)
            }
            promise.resolve(result)

        } catch (e: Exception) {
            promise.reject("UPDATE_ERROR", "Failed to update widget: ${e.message}", e)
        }
    }

    /**
     * Get widget data
     */
    @ReactMethod
    fun getWidgetData(widgetId: String, promise: Promise) {
        try {
            val sharedPrefs = getSharedPreferences()
            val storageKey = "widget_data_$widgetId"
            val jsonString = sharedPrefs.getString(storageKey, null)

            if (jsonString != null) {
                val jsonData = JSONObject(jsonString)
                val result = WritableNativeMap()

                jsonData.keys().forEach { key ->
                    when (val value = jsonData.get(key)) {
                        is String -> result.putString(key, value)
                        is Int -> result.putInt(key, value)
                        is Double -> result.putDouble(key, value)
                        is Boolean -> result.putBoolean(key, value)
                        is Long -> result.putDouble(key, value.toDouble())
                    }
                }
                promise.resolve(result)
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.reject("READ_ERROR", "Failed to read widget data: ${e.message}", e)
        }
    }

    /**
     * Clear widget data
     */
    @ReactMethod
    fun clearWidgetData(widgetId: String, promise: Promise) {
        try {
            val sharedPrefs = getSharedPreferences()
            val editor = sharedPrefs.edit()
            val storageKey = "widget_data_$widgetId"

            editor.remove(storageKey)
            editor.apply()

            // Update widgets to reflect cleared data
            updateAllWidgets()

            val result = WritableNativeMap().apply {
                putBoolean("success", true)
                putString("widgetId", widgetId)
            }
            promise.resolve(result)

        } catch (e: Exception) {
            promise.reject("CLEAR_ERROR", "Failed to clear widget data: ${e.message}", e)
        }
    }

    /**
     * Force update all widgets
     */
    @ReactMethod
    fun forceUpdateAllWidgets(promise: Promise) {
        try {
            updateAllWidgets()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("UPDATE_ERROR", "Failed to update widgets: ${e.message}", e)
        }
    }

    /**
     * Check if widgets are supported
     */
    @ReactMethod
    fun areWidgetsSupported(promise: Promise) {
        // Glance widgets require API 21+ (Android 5.0)
        val isSupported = android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP
        promise.resolve(isSupported)
    }

    /**
     * Get list of installed widgets for this app
     */
    @ReactMethod
    fun getInstalledWidgets(promise: Promise) {
        try {
            val appWidgetManager = AppWidgetManager.getInstance(reactContext)
            val widgetProviders = getWidgetProviders()
            val result = WritableNativeArray()

            widgetProviders.forEach { componentName ->
                val widgetIds = appWidgetManager.getAppWidgetIds(componentName)
                if (widgetIds.isNotEmpty()) {
                    val widgetInfo = WritableNativeMap().apply {
                        putString("className", componentName.className)
                        putInt("count", widgetIds.size)
                        putArray("ids", WritableNativeArray().apply {
                            widgetIds.forEach { pushInt(it) }
                        })
                    }
                    result.pushMap(widgetInfo)
                }
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("LIST_ERROR", "Failed to list widgets: ${e.message}", e)
        }
    }

    // Helper methods

    private fun getSharedPreferences(): SharedPreferences {
        return reactContext.getSharedPreferences(sharedPrefsName, Context.MODE_PRIVATE)
    }

    private fun updateAllWidgets() {
        coroutineScope.launch {
            try {
                // Update all Glance widgets
                // This requires your widget classes to extend GlanceAppWidget
                BrikGlanceWidgets.forEach { widget ->
                    widget.updateAll(reactContext)
                }

                // Also trigger standard AppWidget update for legacy widgets
                val appWidgetManager = AppWidgetManager.getInstance(reactContext)
                getWidgetProviders().forEach { componentName ->
                    val widgetIds = appWidgetManager.getAppWidgetIds(componentName)
                    if (widgetIds.isNotEmpty()) {
                        val updateIntent = Intent(reactContext, componentName.javaClass).apply {
                            action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                            putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, widgetIds)
                        }
                        reactContext.sendBroadcast(updateIntent)
                    }
                }
            } catch (e: Exception) {
                // Log error but don't crash
                android.util.Log.e("BrikWidgetManager", "Failed to update widgets", e)
            }
        }
    }

    private fun getWidgetProviders(): List<ComponentName> {
        // Return list of widget provider components
        // These should be defined in your AndroidManifest.xml
        return listOf(
            // Example: ComponentName(reactContext, BrikWeatherWidget::class.java)
        )
    }

    companion object {
        // List of Glance widgets to update
        // Add your GlanceAppWidget implementations here
        val BrikGlanceWidgets = listOf<GlanceAppWidget>(
            // Example: WeatherGlanceWidget()
        )
    }
}