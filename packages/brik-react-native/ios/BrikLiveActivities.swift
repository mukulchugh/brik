import Foundation
import ActivityKit
import React

@objc(BrikLiveActivities)
class BrikLiveActivities: NSObject {

    private var activeActivities: [String: any ActivityAttributes] = [:]

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc
    func startActivity(_ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {

        guard #available(iOS 16.1, *) else {
            reject("UNSUPPORTED", "Live Activities require iOS 16.1 or later", nil)
            return
        }

        guard let activityType = options["activityType"] as? String else {
            reject("INVALID_ARGS", "activityType is required", nil)
            return
        }

        guard let attributes = options["attributes"] as? NSDictionary else {
            reject("INVALID_ARGS", "attributes is required", nil)
            return
        }

        // TODO: Dynamic activity creation based on activityType
        // For now, we'll return a mock response

        let activityId = UUID().uuidString

        let result: [String: Any] = [
            "id": activityId,
            "activityType": activityType,
            "state": "active",
            "startDate": ISO8601DateFormatter().string(from: Date())
        ]

        resolve(result)
    }

    @objc
    func updateActivity(_ activityId: String, options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {

        guard #available(iOS 16.1, *) else {
            reject("UNSUPPORTED", "Live Activities require iOS 16.1 or later", nil)
            return
        }

        // TODO: Update the activity with new dynamic state

        resolve(nil)
    }

    @objc
    func endActivity(_ activityId: String, dismissalPolicy: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {

        guard #available(iOS 16.1, *) else {
            reject("UNSUPPORTED", "Live Activities require iOS 16.1 or later", nil)
            return
        }

        // TODO: End the activity with specified dismissal policy

        resolve(nil)
    }

    @objc
    func getActiveActivities(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {

        guard #available(iOS 16.1, *) else {
            reject("UNSUPPORTED", "Live Activities require iOS 16.1 or later", nil)
            return
        }

        // TODO: Return all active activities

        resolve([])
    }

    @objc
    func areActivitiesSupported(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {

        if #available(iOS 16.1, *) {
            resolve(ActivityAuthorizationInfo().areActivitiesEnabled)
        } else {
            resolve(false)
        }
    }
}
