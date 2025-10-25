import ActivityKit
import Foundation
import BrikReactNative

struct OrderTrackingAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        let status: String
        let eta: Double
    }

    let orderId: String
    let merchant: String
}


import ActivityKit
import SwiftUI

struct OrderTrackingActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: OrderTrackingAttributes.self) { context in
            // Lock Screen / Banner UI
            VStack(alignment: .leading, spacing: 0) {
              HStack(alignment: .center, spacing: 12) {
                VStack(alignment: .leading, spacing: 0) {
                  Text("🍕").font(.system(size: 24)).foregroundStyle(Color(.sRGB, red: 1.000, green: 1.000, blue: 1.000, opacity: 1.000))
                }.frame(width: 50, height: 50).background(Color(.sRGB, red: 0.231, green: 0.510, blue: 0.965, opacity: 1.000)).cornerRadius(25)
                VStack(alignment: .center, spacing: 4) {
                  Text("Order #12345").font(.system(size: 16)).fontWeight(.bold)
                  Text("Coffee Shop").font(.system(size: 14)).foregroundStyle(Color(.sRGB, red: 0.420, green: 0.447, blue: 0.502, opacity: 1.000))
                }
              }
              HStack(alignment: .center, spacing: 8) {
                Text("Preparing").font(.system(size: 14)).fontWeight(.medium).foregroundStyle(Color(.sRGB, red: 0.216, green: 0.255, blue: 0.318, opacity: 1.000))
                Text("• ETA: 15 min").font(.system(size: 14)).foregroundStyle(Color(.sRGB, red: 0.420, green: 0.447, blue: 0.502, opacity: 1.000))
              }
            }.background(Color(.sRGB, red: 1.000, green: 1.000, blue: 1.000, opacity: 1.000)).cornerRadius(16).padding(16)
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded leading region
                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading, spacing: 0) {
                      HStack(alignment: .center, spacing: 12) {
                        Text("🍕").font(.system(size: 18))
                        VStack(alignment: .center, spacing: 0) {
                          Text("Order #12345").font(.system(size: 14)).fontWeight(.bold)
                          Text("Coffee Shop").font(.system(size: 12)).foregroundStyle(Color(.sRGB, red: 0.420, green: 0.447, blue: 0.502, opacity: 1.000))
                        }
                      }
                      HStack(alignment: .center, spacing: 8) {
                        Text("Preparing").font(.system(size: 12)).fontWeight(.medium)
                        Text("• ETA: 15 min").font(.system(size: 12)).foregroundStyle(Color(.sRGB, red: 0.420, green: 0.447, blue: 0.502, opacity: 1.000))
                      }
                    }.padding(12)
                }

                // Expanded trailing region
                DynamicIslandExpandedRegion(.trailing) {
                    Text("")
                }

                // Expanded bottom region
                DynamicIslandExpandedRegion(.bottom) {
                    Text("")
                }
            } compactLeading: {
                HStack(alignment: .center, spacing: 4) {
                  Text("🍕").font(.system(size: 12))
                }
            } compactTrailing: {
                Text("")
            } minimal: {
                Text("🍕").font(.system(size: 10))
            }
        }
    }
}



@available(iOS 16.1, *)
class OrderTrackingHandler: BrikActivityHandler {
    private var activities: [String: Activity<OrderTrackingAttributes>] = [:]

    func startActivity(staticAttributes: [String: Any], dynamicAttributes: [String: Any]) throws -> String {
        // Extract static attributes
        guard let orderId = staticAttributes["orderId"] as? String else {
            throw BrikActivityError.invalidAttributes("Missing or invalid 'orderId' in static attributes")
        }
        guard let merchant = staticAttributes["merchant"] as? String else {
            throw BrikActivityError.invalidAttributes("Missing or invalid 'merchant' in static attributes")
        }

        // Extract dynamic attributes
        guard let status = dynamicAttributes["status"] as? String else {
            throw BrikActivityError.invalidAttributes("Missing or invalid 'status' in dynamic attributes")
        }
        guard let eta = dynamicAttributes["eta"] as? Double else {
            throw BrikActivityError.invalidAttributes("Missing or invalid 'eta' in dynamic attributes")
        }

        // Create attributes
        let attrs = OrderTrackingAttributes(orderId: orderId, merchant: merchant)
        let contentState = OrderTrackingAttributes.ContentState(status: status, eta: eta)

        // Request activity
        do {
            let activity = try Activity.request(
                attributes: attrs,
                content: .init(state: contentState, staleDate: nil),
                pushType: .token
            )

            // Store activity by push token
            let pushTokenString = activity.pushToken?.hexString ?? ""
            activities[pushTokenString] = activity

            return pushTokenString
        } catch {
            throw BrikActivityError.activityCreationFailed(error)
        }
    }

    func updateActivity(token: String, dynamicAttributes: [String: Any]) throws {
        guard let activity = activities[token] else {
            throw BrikActivityError.activityNotFound(token)
        }

        // Extract dynamic attributes
        guard let status = dynamicAttributes["status"] as? String else {
            throw BrikActivityError.invalidAttributes("Missing or invalid 'status' in dynamic attributes")
        }
        guard let eta = dynamicAttributes["eta"] as? Double else {
            throw BrikActivityError.invalidAttributes("Missing or invalid 'eta' in dynamic attributes")
        }

        // Create new content state
        let contentState = OrderTrackingAttributes.ContentState(status: status, eta: eta)

        // Update activity
        Task {
            await activity.update(
                .init(state: contentState, staleDate: nil)
            )
        }
    }

    func endActivity(token: String, dismissalPolicy: ActivityUIDismissalPolicy) throws {
        guard let activity = activities[token] else {
            throw BrikActivityError.activityNotFound(token)
        }

        // End activity
        Task {
            await activity.end(dismissalPolicy: dismissalPolicy)
        }

        // Remove from tracking
        activities.removeValue(forKey: token)
    }

    func getActivityState(token: String) throws -> [String: Any]? {
        guard let activity = activities[token] else {
            return nil
        }

        return [
            "pushToken": token,
            "state": "active"
        ]
    }
}

// Auto-register handler on app startup
@available(iOS 16.1, *)
@objc public class OrderTrackingHandlerRegistration: NSObject {
    @objc public static func register() {
        BrikActivityRegistry.shared.register(
            activityType: "OrderTracking",
            handler: OrderTrackingHandler()
        )
    }

    // Force registration via Objective-C runtime
    @objc override public class func load() {
        if #available(iOS 16.1, *) {
            OrderTrackingHandlerRegistration.register()
        }
    }
}
