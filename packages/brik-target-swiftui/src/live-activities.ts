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

export function generateLiveActivity(root: IRRoot): string | null {
  const liveActivity = (root as any).liveActivity as LiveActivityConfig | undefined;

  if (!liveActivity) return null;

  const activityType = liveActivity.activityType;

  // Generate attributes file
  const attributesCode = generateActivityAttributes(liveActivity);

  // Generate activity views
  const viewsCode = generateActivityViews(liveActivity, activityType);

  return `${attributesCode}\n\n${viewsCode}`;
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
