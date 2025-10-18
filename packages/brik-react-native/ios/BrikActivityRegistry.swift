import Foundation
import ActivityKit

/**
 * BrikActivityRegistry
 *
 * Type-erased registry for managing Live Activities with different attribute types.
 * Generated activity files register themselves on startup via the @_dynamicReplacement pattern.
 */

@available(iOS 16.1, *)
public protocol BrikActivityHandler {
    /// Create and start an activity with the given attributes
    func startActivity(staticAttributes: [String: Any], dynamicAttributes: [String: Any]) throws -> String

    /// Update an existing activity's dynamic content
    func updateActivity(token: String, dynamicAttributes: [String: Any]) throws

    /// End an activity with the specified dismissal policy
    func endActivity(token: String, dismissalPolicy: ActivityUIDismissalPolicy) throws

    /// Get the current state of an activity
    func getActivityState(token: String) throws -> [String: Any]?
}

@available(iOS 16.1, *)
public class BrikActivityRegistry {
    public static let shared = BrikActivityRegistry()

    private var handlers: [String: BrikActivityHandler] = [:]
    private var activityTokens: [String: String] = [:] // activityId -> pushToken

    private init() {}

    /// Register an activity handler for a specific activity type
    public func register(activityType: String, handler: BrikActivityHandler) {
        handlers[activityType] = handler
        print("[Brik] Registered activity handler: \(activityType)")
    }

    /// Start a new activity
    public func startActivity(
        activityType: String,
        staticAttributes: [String: Any],
        dynamicAttributes: [String: Any],
        staleDate: Date?,
        relevanceScore: Double?
    ) throws -> [String: Any] {
        guard let handler = handlers[activityType] else {
            throw BrikActivityError.unknownActivityType(activityType)
        }

        let pushToken = try handler.startActivity(
            staticAttributes: staticAttributes,
            dynamicAttributes: dynamicAttributes
        )

        let activityId = UUID().uuidString
        activityTokens[activityId] = pushToken

        return [
            "id": activityId,
            "activityType": activityType,
            "pushToken": pushToken,
            "state": "active",
            "startDate": ISO8601DateFormatter().string(from: Date())
        ]
    }

    /// Update an existing activity
    public func updateActivity(activityId: String, activityType: String, dynamicAttributes: [String: Any]) throws {
        guard let handler = handlers[activityType] else {
            throw BrikActivityError.unknownActivityType(activityType)
        }

        guard let pushToken = activityTokens[activityId] else {
            throw BrikActivityError.activityNotFound(activityId)
        }

        try handler.updateActivity(token: pushToken, dynamicAttributes: dynamicAttributes)
    }

    /// End an activity
    public func endActivity(activityId: String, activityType: String, dismissalPolicy: String) throws {
        guard let handler = handlers[activityType] else {
            throw BrikActivityError.unknownActivityType(activityType)
        }

        guard let pushToken = activityTokens[activityId] else {
            throw BrikActivityError.activityNotFound(activityId)
        }

        let policy: ActivityUIDismissalPolicy
        switch dismissalPolicy {
        case "immediate":
            policy = .immediate
        case "after":
            policy = .after(.now + 4.0) // 4 seconds
        default:
            policy = .default
        }

        try handler.endActivity(token: pushToken, dismissalPolicy: policy)
        activityTokens.removeValue(forKey: activityId)
    }

    /// Get all active activity IDs
    public func getActiveActivityIds() -> [String] {
        return Array(activityTokens.keys)
    }

    /// Get activity state
    public func getActivityState(activityId: String, activityType: String) throws -> [String: Any]? {
        guard let handler = handlers[activityType] else {
            throw BrikActivityError.unknownActivityType(activityType)
        }

        guard let pushToken = activityTokens[activityId] else {
            return nil
        }

        return try handler.getActivityState(token: pushToken)
    }
}

@available(iOS 16.1, *)
public enum BrikActivityError: LocalizedError {
    case unknownActivityType(String)
    case activityNotFound(String)
    case invalidAttributes(String)
    case activityCreationFailed(Error)
    case activityUpdateFailed(Error)

    public var errorDescription: String? {
        switch self {
        case .unknownActivityType(let type):
            return "Unknown activity type: \(type). Make sure you've run 'pnpm brik build' to generate the activity code."
        case .activityNotFound(let id):
            return "Activity not found: \(id)"
        case .invalidAttributes(let message):
            return "Invalid attributes: \(message)"
        case .activityCreationFailed(let error):
            return "Failed to create activity: \(error.localizedDescription)"
        case .activityUpdateFailed(let error):
            return "Failed to update activity: \(error.localizedDescription)"
        }
    }
}

// Extension for push token conversion
@available(iOS 16.1, *)
extension Data {
    var hexString: String {
        map { String(format: "%02x", $0) }.joined()
    }
}
