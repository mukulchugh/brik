import fs from 'fs-extra';
import path from 'path';
// @ts-ignore - xcode package doesn't have types
import xcode from 'xcode';

export interface XcodeWidgetOptions {
  projectPath: string; // Path to .xcodeproj
  widgetName: string;
  bundleId: string;
  teamId?: string;
}

export async function addWidgetExtensionTarget(options: XcodeWidgetOptions): Promise<void> {
  const { projectPath, widgetName, bundleId } = options;

  console.log(`📝 Parsing Xcode project: ${projectPath}`);

  const proj = xcode.project(projectPath);

  return new Promise((resolve, reject) => {
    proj.parse((err: any) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        // Add widget extension target
        const targetName = widgetName;
        const targetType = 'app_extension';
        const targetSubtype = 'widget_extension';

        // Create target
        const target = proj.addTarget(targetName, targetType, targetSubtype);

        if (!target) {
          throw new Error('Failed to create widget target');
        }

        console.log(`✅ Added ${widgetName} target to Xcode project`);

        // Set bundle identifier
        const widgetBundleId = `${bundleId}.${widgetName}`;
        proj.updateBuildProperty(
          'PRODUCT_BUNDLE_IDENTIFIER',
          widgetBundleId,
          undefined,
          targetName,
        );
        proj.updateBuildProperty('PRODUCT_NAME', widgetName, undefined, targetName);
        proj.updateBuildProperty('IPHONEOS_DEPLOYMENT_TARGET', '14.0', undefined, targetName);
        proj.updateBuildProperty('SWIFT_VERSION', '5.0', undefined, targetName);
        proj.updateBuildProperty('TARGETED_DEVICE_FAMILY', '1,2', undefined, targetName);

        console.log(`✅ Configured bundle ID: ${widgetBundleId}`);

        // Write updated project file
        fs.writeFileSync(projectPath, proj.writeSync());
        console.log(`✅ Saved Xcode project`);

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

export async function createWidgetFiles(iosDir: string, widgetName: string): Promise<void> {
  const widgetDir = path.join(iosDir, widgetName);
  await fs.mkdirp(widgetDir);

  // Widget Swift file
  const widgetSwift = `import WidgetKit
import SwiftUI

@main
struct BrikWidgets: WidgetBundle {
    var body: some Widget {
        ${widgetName}()
    }
}

struct ${widgetName}: Widget {
    let kind: String = "${widgetName}"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            src_AdvancedDemo_tsx()
        }
        .configurationDisplayName("Brik Widget")
        .description("Native widget built with Brik")
        .supportedFamilies([.systemMedium])
    }
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        completion(SimpleEntry(date: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let timeline = Timeline(entries: [SimpleEntry(date: Date())], policy: .atEnd)
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
}
`;

  await fs.writeFile(path.join(widgetDir, `${widgetName}.swift`), widgetSwift);

  // Info.plist
  const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>${widgetName}</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>NSExtension</key>
    <dict>
        <key>NSExtensionPointIdentifier</key>
        <string>com.apple.widgetkit-extension</string>
    </dict>
    <key>MinimumOSVersion</key>
    <string>14.0</string>
</dict>
</plist>
`;

  await fs.writeFile(path.join(widgetDir, 'Info.plist'), infoPlist);

  console.log(`✅ Created widget files in ${widgetDir}`);
}

export function getMainAppBundleId(iosDir: string): string | null {
  try {
    const files = fs.readdirSync(iosDir);
    const projectFile = files.find((f) => f.endsWith('.xcodeproj'));
    if (!projectFile) return null;

    const projectPath = path.join(iosDir, projectFile, 'project.pbxproj');
    const content = fs.readFileSync(projectPath, 'utf8');

    // Extract bundle ID from project file
    const match = content.match(/PRODUCT_BUNDLE_IDENTIFIER = ([^;]+);/);
    if (match) {
      return match[1].replace(/"/g, '').trim();
    }
  } catch (error) {
    console.error('Failed to extract bundle ID:', error);
  }

  return null;
}
