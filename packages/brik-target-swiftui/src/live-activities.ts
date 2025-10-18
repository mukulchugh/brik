import type { Node as IRNode, Root as IRRoot } from '@brik/core';
import fs from 'fs-extra';
import path from 'path';

/**
 * Live Activities Generator for iOS
 * Generates ActivityAttributes and Activity views for lock screen and Dynamic Island
 */

// Import the emitNode function from the main generator
// We'll need to make it exportable
import { emitNodeForActivity } from './index';

interface LiveActivityConfig {
  activityType: string;
  attributes: {
    static: Record<string, any>;
    dynamic: Record<string, any>;
  };
  regions: {
    lockScreen?: IRNode;
    dynamicIsland?: {
      compact?: IRNode;
      expanded?: IRNode;
      minimal?: IRNode;
    };
  };
}

function swiftTypeFromTypeName(typeName: string): string {
  switch (typeName.toLowerCase()) {
    case 'string':
      return 'String';
    case 'number':
      return 'Double';
    case 'int':
    case 'integer':
      return 'Int';
    case 'boolean':
    case 'bool':
      return 'Bool';
    case 'date':
      return 'Date';
    default:
      return 'String';
  }
}

function generateActivityAttributes(config: LiveActivityConfig): string {
  const { activityType, attributes } = config;

  // Generate static attributes struct
  const staticProps = Object.entries(attributes.static)
    .map(([key, typeName]) => `    let ${key}: ${swiftTypeFromTypeName(typeName as string)}`)
    .join('\n');

  // Generate dynamic attributes struct (ContentState)
  const dynamicProps = Object.entries(attributes.dynamic)
    .map(([key, typeName]) => `        let ${key}: ${swiftTypeFromTypeName(typeName as string)}`)
    .join('\n');

  return `import ActivityKit
import Foundation

struct ${activityType}Attributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
${dynamicProps}
    }

${staticProps}
}
`;
}

function generateActivityViews(config: LiveActivityConfig, activityType: string): string {
  const { regions } = config;

  // Generate lock screen view from IR node
  const lockScreenView = regions.lockScreen
    ? emitNodeForActivity(regions.lockScreen, 12).trimStart()
    : 'Text("Activity")';

  // Generate Dynamic Island views from IR nodes
  const compactLeadingView = regions.dynamicIsland?.compact
    ? emitNodeForActivity(regions.dynamicIsland.compact, 16).trimStart()
    : 'Text("•")';

  const minimalView = regions.dynamicIsland?.minimal
    ? emitNodeForActivity(regions.dynamicIsland.minimal, 16).trimStart()
    : 'Text("-")';

  // For expanded view, we'll use the full expanded node
  // If not provided, create a default expanded view
  const expandedView = regions.dynamicIsland?.expanded
    ? emitNodeForActivity(regions.dynamicIsland.expanded, 20).trimStart()
    : 'Text("Expanded")';

  return `import ActivityKit
import SwiftUI

struct ${activityType}ActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: ${activityType}Attributes.self) { context in
            // Lock Screen / Banner UI
            ${lockScreenView}
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded leading region
                DynamicIslandExpandedRegion(.leading) {
                    ${expandedView}
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
                ${compactLeadingView}
            } compactTrailing: {
                Text("")
            } minimal: {
                ${minimalView}
            }
        }
    }
}
`;
}

function generateActivityHandler(config: LiveActivityConfig): string {
  const { activityType, attributes } = config;

  // Generate static attribute assignments
  const staticAssignments = Object.entries(attributes.static)
    .map(([key, typeName]) => {
      const swiftType = swiftTypeFromTypeName(typeName as string);
      return `        guard let ${key} = staticAttributes["${key}"] as? ${swiftType} else {
            throw BrikActivityError.invalidAttributes("Missing or invalid '${key}' in static attributes")
        }`;
    })
    .join('\n');

  const staticParams = Object.keys(attributes.static)
    .map(key => `${key}: ${key}`)
    .join(', ');

  // Generate dynamic attribute assignments
  const dynamicAssignments = Object.entries(attributes.dynamic)
    .map(([key, typeName]) => {
      const swiftType = swiftTypeFromTypeName(typeName as string);
      return `        guard let ${key} = dynamicAttributes["${key}"] as? ${swiftType} else {
            throw BrikActivityError.invalidAttributes("Missing or invalid '${key}' in dynamic attributes")
        }`;
    })
    .join('\n');

  const dynamicParams = Object.keys(attributes.dynamic)
    .map(key => `${key}: ${key}`)
    .join(', ');

  return `
@available(iOS 16.1, *)
class ${activityType}Handler: BrikActivityHandler {
    private var activities: [String: Activity<${activityType}Attributes>] = [:]

    func startActivity(staticAttributes: [String: Any], dynamicAttributes: [String: Any]) throws -> String {
        // Extract static attributes
${staticAssignments}

        // Extract dynamic attributes
${dynamicAssignments}

        // Create attributes
        let attrs = ${activityType}Attributes(${staticParams})
        let contentState = ${activityType}Attributes.ContentState(${dynamicParams})

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
${dynamicAssignments}

        // Create new content state
        let contentState = ${activityType}Attributes.ContentState(${dynamicParams})

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
private class ${activityType}HandlerRegistration {
    static let register: Void = {
        BrikActivityRegistry.shared.register(
            activityType: "${activityType}",
            handler: ${activityType}Handler()
        )
    }()
}

// Ensure registration happens
@available(iOS 16.1, *)
private let _${activityType.toLowerCase()}HandlerInit = ${activityType}HandlerRegistration.register
`;
}

export function generateLiveActivity(root: IRRoot): string | null {
  const liveActivity = (root as any).liveActivity as LiveActivityConfig | undefined;

  if (!liveActivity) return null;

  const activityType = liveActivity.activityType;

  // Generate attributes file
  const attributesCode = generateActivityAttributes(liveActivity);

  // Generate activity views
  const viewsCode = generateActivityViews(liveActivity, activityType);

  // Generate activity handler
  const handlerCode = generateActivityHandler(liveActivity);

  return `${attributesCode}\n\n${viewsCode}\n\n${handlerCode}`;
}

export async function writeLiveActivityFiles(roots: IRRoot[], iosDir: string): Promise<void> {
  const activitiesDir = path.join(iosDir, 'BrikActivities');
  await fs.mkdirp(activitiesDir);

  for (const root of roots) {
    const code = generateLiveActivity(root);
    if (code) {
      const activityType = ((root as any).liveActivity as LiveActivityConfig).activityType;
      const filename = `${activityType}Activity.swift`;
      await fs.writeFile(path.join(activitiesDir, filename), code, 'utf8');
      console.log(`✅ Generated Live Activity: ${filename}`);
    }
  }
}
