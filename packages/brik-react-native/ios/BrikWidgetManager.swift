import Foundation
import WidgetKit
import React

/**
 * BrikWidgetManager
 *
 * Native module for updating iOS home screen widgets from React Native.
 * Uses App Groups and UserDefaults to share data between the main app and widget extension.
 */
@objc(BrikWidgetManager)
class BrikWidgetManager: NSObject {

    // App Group identifier - must match in entitlements and widget extension
    // Format: group.{bundle_id}.widgets
    private var appGroupIdentifier: String {
        guard let bundleId = Bundle.main.bundleIdentifier else {
            return "group.com.app.widgets" // Fallback
        }
        return "group.\(bundleId).widgets"
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }

    /**
     * Update widget data
     *
     * @param widgetId - Unique identifier for the widget type
     * @param data - Dictionary of data to be accessed by the widget
     */
    @objc
    func updateWidget(
        _ widgetId: String,
        data: NSDictionary,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        // Get shared UserDefaults
        guard let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
            reject("APP_GROUP_ERROR", "Failed to access App Group: \(appGroupIdentifier)", nil)
            return
        }

        // Convert NSDictionary to [String: Any]
        guard let dataDict = data as? [String: Any] else {
            reject("INVALID_DATA", "Widget data must be a dictionary", nil)
            return
        }

        // Create storage key
        let storageKey = "widget_data_\(widgetId)"

        // Add metadata
        var widgetData = dataDict
        widgetData["_timestamp"] = Date().timeIntervalSince1970
        widgetData["_widgetId"] = widgetId

        // Save to shared storage
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: widgetData, options: [])

            // Validate data size (UserDefaults practical limit is ~1MB)
            let maxDataSize = 1_000_000 // 1MB in bytes
            if jsonData.count > maxDataSize {
                reject("DATA_TOO_LARGE", "Widget data exceeds 1MB limit (\(jsonData.count) bytes). Consider reducing data size.", nil)
                return
            }

            let jsonString = String(data: jsonData, encoding: .utf8)
            sharedDefaults.set(jsonString, forKey: storageKey)
            // Note: synchronize() is deprecated since iOS 12 and is now a no-op
            // UserDefaults automatically syncs periodically

            // Reload all widget timelines
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }

            resolve([
                "success": true,
                "widgetId": widgetId,
                "appGroup": appGroupIdentifier
            ])
        } catch {
            reject("SERIALIZATION_ERROR", "Failed to serialize widget data: \(error.localizedDescription)", nil)
        }
    }

    /**
     * Update specific widget kind (for when you have multiple widgets)
     */
    @objc
    func updateWidgetKind(
        _ widgetKind: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadTimelines(ofKind: widgetKind)
            resolve([
                "success": true,
                "widgetKind": widgetKind
            ])
        } else {
            reject("UNSUPPORTED", "Widgets require iOS 14.0 or later", nil)
        }
    }

    /**
     * Get widget data
     */
    @objc
    func getWidgetData(
        _ widgetId: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
            reject("APP_GROUP_ERROR", "Failed to access App Group: \(appGroupIdentifier)", nil)
            return
        }

        let storageKey = "widget_data_\(widgetId)"

        guard let jsonString = sharedDefaults.string(forKey: storageKey),
              let jsonData = jsonString.data(using: .utf8) else {
            resolve(nil)
            return
        }

        do {
            let data = try JSONSerialization.jsonObject(with: jsonData, options: [])
            resolve(data)
        } catch {
            reject("DESERIALIZATION_ERROR", "Failed to deserialize widget data: \(error.localizedDescription)", nil)
        }
    }

    /**
     * Clear widget data
     */
    @objc
    func clearWidgetData(
        _ widgetId: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
            reject("APP_GROUP_ERROR", "Failed to access App Group: \(appGroupIdentifier)", nil)
            return
        }

        let storageKey = "widget_data_\(widgetId)"
        sharedDefaults.removeObject(forKey: storageKey)
        sharedDefaults.synchronize()

        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }

        resolve([
            "success": true,
            "widgetId": widgetId
        ])
    }

    /**
     * Get App Group identifier for debugging
     */
    @objc
    func getAppGroupIdentifier(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        resolve(appGroupIdentifier)
    }

    /**
     * Check if widgets are available
     */
    @objc
    func areWidgetsSupported(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        if #available(iOS 14.0, *) {
            resolve(true)
        } else {
            resolve(false)
        }
    }
}
