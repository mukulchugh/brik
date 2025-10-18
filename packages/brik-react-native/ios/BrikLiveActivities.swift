import Foundation
import ActivityKit
import React

@objc(BrikLiveActivities)
class BrikLiveActivities: NSObject {

    // Track activity types by ID for updates/ends
    private var activityTypes: [String: String] = [:]

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
            reject("UNSUPPORTED", "Live Activities require iOS 16.1 or later", nil)
            return
        }

        // Validate activity type
        guard let activityType = options["activityType"] as? String else {
            reject("INVALID_ARGS", "activityType is required", nil)
            return
        }

        // Validate attributes
        guard let attributes = options["attributes"] as? NSDictionary else {
            reject("INVALID_ARGS", "attributes is required", nil)
            return
        }

        guard let staticAttrs = attributes["static"] as? [String: Any] else {
            reject("INVALID_ARGS", "attributes.static is required", nil)
            return
        }

        guard let dynamicAttrs = attributes["dynamic"] as? [String: Any] else {
            reject("INVALID_ARGS", "attributes.dynamic is required", nil)
            return
        }

        // Optional parameters
        let staleDate: Date? = {
            if let staleDateStr = options["staleDate"] as? String {
                return ISO8601DateFormatter().date(from: staleDateStr)
            }
            return nil
        }()

        let relevanceScore = options["relevanceScore"] as? Double

        // Start activity via registry
        do {
            let result = try BrikActivityRegistry.shared.startActivity(
                activityType: activityType,
                staticAttributes: staticAttrs,
                dynamicAttributes: dynamicAttrs,
                staleDate: staleDate,
                relevanceScore: relevanceScore
            )

            // Store activity type for later updates
            if let activityId = result["id"] as? String {
                activityTypes[activityId] = activityType
            }

            resolve(result)
        } catch let error as BrikActivityError {
            reject("ACTIVITY_ERROR", error.errorDescription ?? "Unknown error", nil)
        } catch {
            reject("ACTIVITY_ERROR", "Failed to start activity: \(error.localizedDescription)", nil)
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
            reject("UNSUPPORTED", "Live Activities require iOS 16.1 or later", nil)
            return
        }

        // Get activity type
        guard let activityType = activityTypes[activityId] else {
            reject("NOT_FOUND", "Activity not found: \(activityId)", nil)
            return
        }

        // Validate dynamic attributes
        guard let dynamicAttrs = options["dynamic"] as? [String: Any] else {
            reject("INVALID_ARGS", "options.dynamic is required", nil)
            return
        }

        // Update activity via registry
        do {
            try BrikActivityRegistry.shared.updateActivity(
                activityId: activityId,
                activityType: activityType,
                dynamicAttributes: dynamicAttrs
            )
            resolve(nil)
        } catch let error as BrikActivityError {
            reject("ACTIVITY_ERROR", error.errorDescription ?? "Unknown error", nil)
        } catch {
            reject("ACTIVITY_ERROR", "Failed to update activity: \(error.localizedDescription)", nil)
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
            reject("UNSUPPORTED", "Live Activities require iOS 16.1 or later", nil)
            return
        }

        // Get activity type
        guard let activityType = activityTypes[activityId] else {
            reject("NOT_FOUND", "Activity not found: \(activityId)", nil)
            return
        }

        // End activity via registry
        do {
            try BrikActivityRegistry.shared.endActivity(
                activityId: activityId,
                activityType: activityType,
                dismissalPolicy: dismissalPolicy
            )
            activityTypes.removeValue(forKey: activityId)
            resolve(nil)
        } catch let error as BrikActivityError {
            reject("ACTIVITY_ERROR", error.errorDescription ?? "Unknown error", nil)
        } catch {
            reject("ACTIVITY_ERROR", "Failed to end activity: \(error.localizedDescription)", nil)
        }
    }

    @objc
    func getActiveActivities(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.1, *) else {
            reject("UNSUPPORTED", "Live Activities require iOS 16.1 or later", nil)
            return
        }

        let activityIds = BrikActivityRegistry.shared.getActiveActivityIds()

        let activities: [[String: Any]] = activityIds.compactMap { activityId in
            guard let activityType = activityTypes[activityId] else { return nil }

            return [
                "id": activityId,
                "activityType": activityType,
                "state": "active"
            ]
        }

        resolve(activities)
    }

    @objc
    func areActivitiesSupported(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        if #available(iOS 16.1, *) {
            resolve(ActivityAuthorizationInfo().areActivitiesEnabled)
        } else {
            resolve(false)
        }
    }

    @objc
    func getPushToken(
        _ activityId: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.1, *) else {
            reject("UNSUPPORTED", "Live Activities require iOS 16.1 or later", nil)
            return
        }

        guard let activityType = activityTypes[activityId] else {
            reject("NOT_FOUND", "Activity not found: \(activityId)", nil)
            return
        }

        do {
            if let state = try BrikActivityRegistry.shared.getActivityState(
                activityId: activityId,
                activityType: activityType
            ), let pushToken = state["pushToken"] as? String {
                resolve(pushToken)
            } else {
                resolve(nil)
            }
        } catch let error as BrikActivityError {
            reject("ACTIVITY_ERROR", error.errorDescription ?? "Unknown error", nil)
        } catch {
            reject("ACTIVITY_ERROR", "Failed to get push token: \(error.localizedDescription)", nil)
        }
    }
}
