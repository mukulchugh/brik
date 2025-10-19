package com.brik

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import com.facebook.react.bridge.*
import org.json.JSONObject

/**
 * BrikWidgetManager
 *
 * Native module for updating Android home screen widgets from React Native.
 * Uses SharedPreferences to share data between the main app and widget provider.
 */
class BrikWidgetManager(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val PREFS_NAME = "BrikWidgetPrefs"
        private const val KEY_PREFIX = "widget_data_"
    }

    override fun getName(): String = "BrikWidgetManager"

    private fun getSharedPreferences(): SharedPreferences {
        return reactApplicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    /**
     * Update widget data
     *
     * @param widgetId Unique identifier for the widget type
     * @param data Map of data to be accessed by the widget
     * @param promise Promise to resolve/reject
     */
    @ReactMethod
    fun updateWidget(widgetId: String, data: ReadableMap, promise: Promise) {
        try {
            val prefs = getSharedPreferences()
            val editor = prefs.edit()

            // Convert ReadableMap to JSON
            val jsonObject = convertMapToJson(data)

            // Add metadata
            jsonObject.put("_timestamp", System.currentTimeMillis())
            jsonObject.put("_widgetId", widgetId)
            jsonObject.put("_updatedAt", java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", java.util.Locale.US).format(java.util.Date()))

            // Store as JSON string
            val storageKey = KEY_PREFIX + widgetId
            editor.putString(storageKey, jsonObject.toString())
            editor.apply()

            // Trigger widget refresh
            refreshWidgets()

            val resultMap = Arguments.createMap()
            resultMap.putBoolean("success", true)
            resultMap.putString("widgetId", widgetId)
            resultMap.putString("prefsName", PREFS_NAME)
            promise.resolve(resultMap)
        } catch (e: Exception) {
            promise.reject("UPDATE_ERROR", "Failed to update widget: ${e.message}", e)
        }
    }

    /**
     * Get widget data
     *
     * @param widgetId Widget identifier
     * @param promise Promise to resolve with data or null
     */
    @ReactMethod
    fun getWidgetData(widgetId: String, promise: Promise) {
        try {
            val prefs = getSharedPreferences()
            val storageKey = KEY_PREFIX + widgetId
            val jsonString = prefs.getString(storageKey, null)

            if (jsonString != null) {
                val jsonObject = JSONObject(jsonString)
                val resultMap = convertJsonToMap(jsonObject)
                promise.resolve(resultMap)
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.reject("GET_ERROR", "Failed to get widget data: ${e.message}", e)
        }
    }

    /**
     * Clear widget data
     *
     * @param widgetId Widget identifier
     * @param promise Promise to resolve
     */
    @ReactMethod
    fun clearWidgetData(widgetId: String, promise: Promise) {
        try {
            val prefs = getSharedPreferences()
            val editor = prefs.edit()
            val storageKey = KEY_PREFIX + widgetId
            editor.remove(storageKey)
            editor.apply()

            // Trigger widget refresh
            refreshWidgets()

            val resultMap = Arguments.createMap()
            resultMap.putBoolean("success", true)
            resultMap.putString("widgetId", widgetId)
            promise.resolve(resultMap)
        } catch (e: Exception) {
            promise.reject("CLEAR_ERROR", "Failed to clear widget data: ${e.message}", e)
        }
    }

    /**
     * Check if widgets are supported
     *
     * @param promise Promise to resolve with boolean
     */
    @ReactMethod
    fun areWidgetsSupported(promise: Promise) {
        // Widgets are supported on all Android versions that React Native supports
        promise.resolve(true)
    }

    /**
     * Get SharedPreferences name (for debugging)
     *
     * @param promise Promise to resolve with prefs name
     */
    @ReactMethod
    fun getAppGroupIdentifier(promise: Promise) {
        promise.resolve(PREFS_NAME)
    }

    /**
     * Trigger widget refresh by sending broadcast
     */
    private fun refreshWidgets() {
        try {
            val context = reactApplicationContext
            val intent = Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
            intent.setPackage(context.packageName)
            context.sendBroadcast(intent)
        } catch (e: Exception) {
            // Silently fail if widget refresh fails
            android.util.Log.e("BrikWidgetManager", "Failed to refresh widgets", e)
        }
    }

    /**
     * Convert ReadableMap to JSONObject
     */
    private fun convertMapToJson(readableMap: ReadableMap): JSONObject {
        val jsonObject = JSONObject()
        val iterator = readableMap.keySetIterator()

        while (iterator.hasNextKey()) {
            val key = iterator.nextKey()
            when (readableMap.getType(key)) {
                ReadableType.Null -> jsonObject.put(key, JSONObject.NULL)
                ReadableType.Boolean -> jsonObject.put(key, readableMap.getBoolean(key))
                ReadableType.Number -> jsonObject.put(key, readableMap.getDouble(key))
                ReadableType.String -> jsonObject.put(key, readableMap.getString(key))
                ReadableType.Map -> jsonObject.put(key, convertMapToJson(readableMap.getMap(key)!!))
                ReadableType.Array -> jsonObject.put(key, convertArrayToJson(readableMap.getArray(key)!!))
            }
        }

        return jsonObject
    }

    /**
     * Convert ReadableArray to JSONArray
     */
    private fun convertArrayToJson(readableArray: ReadableArray): org.json.JSONArray {
        val jsonArray = org.json.JSONArray()

        for (i in 0 until readableArray.size()) {
            when (readableArray.getType(i)) {
                ReadableType.Null -> jsonArray.put(JSONObject.NULL)
                ReadableType.Boolean -> jsonArray.put(readableArray.getBoolean(i))
                ReadableType.Number -> jsonArray.put(readableArray.getDouble(i))
                ReadableType.String -> jsonArray.put(readableArray.getString(i))
                ReadableType.Map -> jsonArray.put(convertMapToJson(readableArray.getMap(i)))
                ReadableType.Array -> jsonArray.put(convertArrayToJson(readableArray.getArray(i)))
            }
        }

        return jsonArray
    }

    /**
     * Convert JSONObject to WritableMap
     */
    private fun convertJsonToMap(jsonObject: JSONObject): WritableMap {
        val map = Arguments.createMap()
        val iterator = jsonObject.keys()

        while (iterator.hasNext()) {
            val key = iterator.next()
            val value = jsonObject.get(key)

            when (value) {
                is JSONObject -> map.putMap(key, convertJsonToMap(value))
                is org.json.JSONArray -> map.putArray(key, convertJsonToArray(value))
                is Boolean -> map.putBoolean(key, value)
                is Int -> map.putInt(key, value)
                is Double -> map.putDouble(key, value)
                is String -> map.putString(key, value)
                else -> map.putNull(key)
            }
        }

        return map
    }

    /**
     * Convert JSONArray to WritableArray
     */
    private fun convertJsonToArray(jsonArray: org.json.JSONArray): WritableArray {
        val array = Arguments.createArray()

        for (i in 0 until jsonArray.length()) {
            val value = jsonArray.get(i)

            when (value) {
                is JSONObject -> array.pushMap(convertJsonToMap(value))
                is org.json.JSONArray -> array.pushArray(convertJsonToArray(value))
                is Boolean -> array.pushBoolean(value)
                is Int -> array.pushInt(value)
                is Double -> array.pushDouble(value)
                is String -> array.pushString(value)
                else -> array.pushNull()
            }
        }

        return array
    }
}
