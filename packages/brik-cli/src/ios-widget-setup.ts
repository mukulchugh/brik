import fs from 'fs-extra';
import path from 'path';

/**
 * Automated iOS Widget Extension Setup
 * Creates a WidgetKit extension target and configures the Xcode project
 * with App Groups for data sharing
 */

export interface WidgetSetupOptions {
  iosDir: string;
  widgetName?: string;
  bundleId?: string;
  appGroupId?: string; // Optional custom App Group ID
}

export async function setupIOSWidget(options: WidgetSetupOptions): Promise<void> {
  const { iosDir, widgetName = 'BrikWidget', bundleId, appGroupId } = options;

  console.log('🍎 Setting up iOS Widget Extension...');

  // 1. Create widget directory if it doesn't exist
  const widgetDir = path.join(iosDir, widgetName);
  await fs.mkdirp(widgetDir);

  // Determine App Group ID
  const effectiveBundleId = bundleId || 'com.app';
  const effectiveAppGroupId = appGroupId || `group.${effectiveBundleId}.widgets`;
  console.log(`📦 App Group ID: ${effectiveAppGroupId}`);

  // 2. Create Widget Swift file with UserDefaults data reading
  const widgetSwiftContent = `import WidgetKit
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
            // Import your generated widget views here
            // Example: src_AdvancedDemo_tsx()
            WidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Brik Widget")
        .description("Native widget built with Brik")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct Provider: TimelineProvider {
    // App Group identifier - MUST match BrikWidgetManager
    let appGroupIdentifier = "${effectiveAppGroupId}"

    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), widgetData: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), widgetData: getWidgetData())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let currentDate = Date()
        let widgetData = getWidgetData()

        let entry = SimpleEntry(date: currentDate, widgetData: widgetData)

        // Update every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    // Read widget data from shared UserDefaults
    private func getWidgetData() -> [String: Any]? {
        guard let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
            print("[Brik] Failed to access App Group: \\(appGroupIdentifier)")
            return nil
        }

        // Read from the same key pattern as BrikWidgetManager
        let storageKey = "widget_data_${widgetName}"

        guard let jsonString = sharedDefaults.string(forKey: storageKey),
              let jsonData = jsonString.data(using: .utf8),
              let data = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any] else {
            print("[Brik] No widget data found for key: \\(storageKey)")
            return nil
        }

        return data
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let widgetData: [String: Any]?
}

struct WidgetEntryView: View {
    var entry: SimpleEntry

    var body: some View {
        if let data = entry.widgetData {
            // TODO: Replace with your generated widget view
            // Example: src_AdvancedDemo_tsx(data: data)
            VStack {
                Text("Brik Widget")
                    .font(.headline)
                Text("Data loaded: \\(data.count) keys")
                    .font(.caption)
            }
        } else {
            VStack {
                Text("Brik Widget")
                    .font(.headline)
                Text("Waiting for data...")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
        }
    }
}
`;

  await fs.writeFile(path.join(widgetDir, `${widgetName}.swift`), widgetSwiftContent);
  console.log(`✅ Created ${widgetName}.swift`);

  // 3. Create Info.plist for widget
  const infoPlistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
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

  await fs.writeFile(path.join(widgetDir, 'Info.plist'), infoPlistContent);
  console.log(`✅ Created Info.plist`);

  // 4. Create Assets.xcassets for widget
  const assetsDir = path.join(widgetDir, 'Assets.xcassets');
  await fs.mkdirp(path.join(assetsDir, 'AppIcon.appiconset'));
  await fs.writeFile(
    path.join(assetsDir, 'AppIcon.appiconset', 'Contents.json'),
    JSON.stringify(
      {
        images: [
          {
            idiom: 'universal',
            platform: 'ios',
            size: '1024x1024',
          },
        ],
        info: {
          author: 'xcode',
          version: 1,
        },
      },
      null,
      2,
    ),
  );
  await fs.writeFile(
    path.join(assetsDir, 'Contents.json'),
    JSON.stringify(
      {
        info: {
          author: 'xcode',
          version: 1,
        },
      },
      null,
      2,
    ),
  );
  console.log(`✅ Created Assets.xcassets`);

  // 5. Create entitlements file for widget extension
  const widgetEntitlementsContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.application-groups</key>
    <array>
        <string>${effectiveAppGroupId}</string>
    </array>
</dict>
</plist>
`;

  await fs.writeFile(path.join(widgetDir, `${widgetName}.entitlements`), widgetEntitlementsContent);
  console.log(`✅ Created ${widgetName}.entitlements`);

  // 6. Create/update main app entitlements
  const mainAppName = await findMainAppName(iosDir);
  if (mainAppName) {
    const mainAppEntitlementsPath = path.join(iosDir, mainAppName, `${mainAppName}.entitlements`);

    // Check if entitlements already exist
    let mainAppEntitlementsContent = '';
    if (await fs.pathExists(mainAppEntitlementsPath)) {
      console.log(`📝 Updating existing entitlements for main app...`);
      mainAppEntitlementsContent = await fs.readFile(mainAppEntitlementsPath, 'utf8');

      // Check if App Group is already present
      if (mainAppEntitlementsContent.includes(effectiveAppGroupId)) {
        console.log(`✅ App Group already configured in main app`);
      } else {
        // Add App Group to existing entitlements
        mainAppEntitlementsContent = mainAppEntitlementsContent.replace(
          '</dict>\n</plist>',
          `    <key>com.apple.security.application-groups</key>
    <array>
        <string>${effectiveAppGroupId}</string>
    </array>
</dict>
</plist>`
        );
        await fs.writeFile(mainAppEntitlementsPath, mainAppEntitlementsContent);
        console.log(`✅ Updated ${mainAppName}.entitlements with App Group`);
      }
    } else {
      // Create new entitlements file for main app
      console.log(`📝 Creating new entitlements for main app...`);
      mainAppEntitlementsContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.application-groups</key>
    <array>
        <string>${effectiveAppGroupId}</string>
    </array>
</dict>
</plist>
`;
      await fs.writeFile(mainAppEntitlementsPath, mainAppEntitlementsContent);
      console.log(`✅ Created ${mainAppName}.entitlements`);
    }
  }

  // 7. Print manual steps needed
  console.log('\n⚠️  Manual steps required in Xcode:');
  console.log('1. Open the .xcworkspace file in Xcode');
  console.log('2. File → New → Target → Widget Extension');
  console.log(`3. Name: ${widgetName}`);
  console.log('4. Delete generated files, use the ones we created');
  console.log(`5. Add ${widgetName}.entitlements to the widget target build settings:`);
  console.log(`   - Select widget target → Build Settings → Code Signing Entitlements`);
  console.log(`   - Set to: ${widgetName}/${widgetName}.entitlements`);
  console.log(`6. Add ${mainAppName}.entitlements to the main app target (if newly created)`);
  console.log('7. Add generated Swift files from ios/brik/Generated/ to the widget target');
  console.log('8. Build and run the widget extension scheme');
  console.log(`\n📦 App Group configured: ${effectiveAppGroupId}`);
  console.log('   This App Group enables data sharing between the app and widget.');
}

/**
 * Find the main app directory name
 */
async function findMainAppName(iosDir: string): Promise<string | null> {
  try {
    const files = await fs.readdir(iosDir);

    // Look for .xcodeproj to derive app name
    const xcodeproj = files.find((f) => f.endsWith('.xcodeproj'));
    if (xcodeproj) {
      return xcodeproj.replace('.xcodeproj', '');
    }

    // Fallback: look for directories with .app-like structure
    for (const file of files) {
      const stat = await fs.stat(path.join(iosDir, file));
      if (stat.isDirectory() && !file.includes('.') && file !== 'Pods') {
        return file;
      }
    }
  } catch (error) {
    console.warn('Failed to find main app name:', error);
  }

  return null;
}

export async function linkGeneratedFilesToWidget(
  iosDir: string,
  widgetName: string,
): Promise<void> {
  const generatedDir = path.join(iosDir, 'brik', 'Generated');
  const files = await fs.readdir(generatedDir);

  console.log(`\n📎 Generated files to add to ${widgetName} target:`);
  for (const file of files) {
    if (file.endsWith('.swift')) {
      console.log(`  - ${file}`);
    }
  }

  console.log('\nAdd these files to your widget target in Xcode:');
  console.log('1. Select each file in Project Navigator');
  console.log('2. File Inspector (right panel) → Target Membership');
  console.log(`3. Check ✅ ${widgetName}`);
}
