import fs from 'fs-extra';
import path from 'path';

/**
 * Automated iOS Widget Extension Setup
 * Creates a WidgetKit extension target and configures the Xcode project
 */

export interface WidgetSetupOptions {
  iosDir: string;
  widgetName?: string;
  bundleId?: string;
}

export async function setupIOSWidget(options: WidgetSetupOptions): Promise<void> {
  const { iosDir, widgetName = 'BrikWidget', bundleId } = options;

  console.log('🍎 Setting up iOS Widget Extension...');

  // 1. Create widget directory if it doesn't exist
  const widgetDir = path.join(iosDir, widgetName);
  await fs.mkdirp(widgetDir);

  // 2. Create Widget Swift file
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
            Text("Brik Widget")
        }
        .configurationDisplayName("Brik Widget")
        .description("Native widget built with Brik")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let entries: [SimpleEntry] = [
            SimpleEntry(date: Date())
        ]
        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
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

  // 5. Print manual steps needed
  console.log('\n⚠️  Manual steps required in Xcode:');
  console.log('1. Open the .xcworkspace file in Xcode');
  console.log('2. File → New → Target → Widget Extension');
  console.log(`3. Name: ${widgetName}`);
  console.log('4. Delete generated files, use the ones we created');
  console.log('5. Add generated Swift files from ios/brik/Generated/ to the widget target');
  console.log('6. Build and run the widget extension scheme');
  console.log('\nAlternatively, see WIDGET_SETUP.md for detailed instructions.');
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
