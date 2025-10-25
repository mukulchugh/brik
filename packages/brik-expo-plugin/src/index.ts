import {
  AndroidConfig,
  ConfigPlugin,
  IOSConfig,
  withAndroidManifest,
  withAppBuildGradle,
  withDangerousMod,
  withXcodeProject,
} from '@expo/config-plugins';
import fs from 'fs';
import { execSync } from 'node:child_process';

type Options = { platform?: 'ios' | 'android' | 'all' };

export const withBrik: ConfigPlugin<Options> = (config, options) => {
  const platform = options?.platform ?? 'all';
  // Always run codegen first
  config = withDangerousMod(config, [
    'android',
    async (c) => {
      const root = c.modRequest.projectRoot;
      const cliPath = `${root}/../../packages/brik-cli/dist/index.js`;
      if (fs.existsSync(cliPath)) {
        execSync(`node ${cliPath} build --platform all --as-widget`, {
          stdio: 'inherit',
          cwd: root,
        });
      }
      return c;
    },
  ]);
  if (platform === 'ios' || platform === 'all') {
    config = withDangerousMod(config, [
      'ios',
      async (c) => {
        const root = c.modRequest.projectRoot;
        const cliPath = `${root}/../../packages/brik-cli/dist/index.js`;
        if (fs.existsSync(cliPath)) {
          execSync(`node ${cliPath} build --platform ios`, { stdio: 'inherit', cwd: root });
        } else {
          execSync('pnpm --silent -w run brik --platform ios', { stdio: 'inherit', cwd: root });
        }

        // Copy pre-generated Swift files from @brik/example-shared to iOS project
        const sharedPackageActivities = `${root}/../../packages/brik-example-shared/ios/BrikActivities`;
        if (fs.existsSync(sharedPackageActivities)) {
          // Find the iOS project directory (sanitized name from Expo)
          const iosDir = `${root}/ios`;
          const iosDirs = fs.existsSync(iosDir)
            ? fs.readdirSync(iosDir).filter(f => {
                const fullPath = `${iosDir}/${f}`;
                return fs.statSync(fullPath).isDirectory()
                  && f !== 'Pods'
                  && f !== 'build'
                  && !f.endsWith('.xcodeproj')
                  && !f.endsWith('.xcworkspace');
              })
            : [];

          if (iosDirs.length > 0) {
            const projectName = iosDirs[0];
            const iosSourceDir = `${iosDir}/${projectName}`;
            const generatedDir = `${iosSourceDir}/Generated`;
            fs.mkdirSync(generatedDir, { recursive: true });

            // Copy all Swift files from example-shared to iOS project
            const swiftFiles = fs.readdirSync(sharedPackageActivities).filter((f) => f.endsWith('.swift'));
            const copiedFiles: string[] = [];

            for (const file of swiftFiles) {
              const source = `${sharedPackageActivities}/${file}`;
              const dest = `${generatedDir}/${file}`;
              fs.copyFileSync(source, dest);
              console.log(`[Brik] Copied ${file} from example-shared to iOS project`);
              copiedFiles.push(file);
            }

            // Store copied files for later Xcode project modification
            if (copiedFiles.length > 0) {
              // Store in modResults for use in withXcodeProject
              c.modResults = { copiedSwiftFiles: copiedFiles };
              console.log(`[Brik] Prepared ${copiedFiles.length} Swift files for Xcode project`);
            }
          } else {
            console.log('[Brik] Warning: Could not find iOS project directory');
          }
        }

        return c;
      },
    ]);

    // Add Swift files to Xcode project
    config = withXcodeProject(config, (config) => {
      const project = config.modResults;
      const projectRoot = config.modRequest.projectRoot;
      const iosDir = `${projectRoot}/ios`;

      // Find project name
      const iosDirs = fs.existsSync(iosDir)
        ? fs.readdirSync(iosDir).filter(f => {
            const fullPath = `${iosDir}/${f}`;
            return fs.statSync(fullPath).isDirectory()
              && f !== 'Pods'
              && f !== 'build'
              && !f.endsWith('.xcodeproj')
              && !f.endsWith('.xcworkspace');
          })
        : [];

      if (iosDirs.length > 0) {
        const projectName = iosDirs[0];
        const generatedDir = `${iosDir}/${projectName}/Generated`;

        // Get list of Swift files to add
        const swiftFiles = fs.existsSync(generatedDir)
          ? fs.readdirSync(generatedDir).filter(f => f.endsWith('.swift'))
          : [];

        // Add each Swift file to the project
        for (const file of swiftFiles) {
          const relativePath = `${projectName}/Generated/${file}`;

          // Use Expo's Xcode utilities to add source file
          try {
            project.addSourceFile(relativePath, {});
            console.log(`[Brik] Added ${file} to Xcode project`);
          } catch (error) {
            console.log(`[Brik] Note: ${file} may already be in project or will need manual addition`);
          }
        }

        if (swiftFiles.length > 0) {
          console.log(`[Brik] Successfully processed ${swiftFiles.length} Swift files`);
        }
      }

      return config;
    });
  }
  if (platform === 'android' || platform === 'all') {
    config = withAppBuildGradle(config, (config) => {
      const implementation = 'implementation("androidx.glance:glance-appwidget:1.1.0")';
      if (!config.modResults.contents.includes('androidx.glance:glance-appwidget')) {
        config.modResults.contents = config.modResults.contents.replace(
          /dependencies\s*\{/,
          (m) => `${m}\n    ${implementation}`,
        );
      }
      return config;
    });

    config = withAndroidManifest(config, (config) => {
      const pkg = config.android?.package ?? 'com.example';
      const manifest = config.modResults;
      const app = AndroidConfig.Manifest.getMainApplication(manifest);
      if (app) {
        const receiverName = `${pkg}.generated.BrikWidgetReceiver`;
        const already = (app.receiver ?? []).some((r: any) => r.$['android:name'] === receiverName);
        if (!already) {
          app.receiver = app.receiver ?? [];
          app.receiver.push({
            $: { 'android:name': receiverName, 'android:exported': 'true' },
            'intent-filter': [
              { action: [{ $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } }] },
            ],
            'meta-data': [
              {
                $: {
                  'android:name': 'android.appwidget.provider',
                  'android:resource': '@xml/brik_widget_info',
                },
              },
            ],
          } as any);
        }
      }
      return config;
    });

    config = withDangerousMod(config, [
      'android',
      async (c) => {
        const projectRoot = c.modRequest.projectRoot;
        const appSrcMain = `${projectRoot}/android/app/src/main`;
        const xmlDir = `${appSrcMain}/res/xml`;
        fs.mkdirSync(xmlDir, { recursive: true });
        const infoXml = `<?xml version="1.0" encoding="utf-8"?>\n<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"\n    android:minWidth="110dp"\n    android:minHeight="110dp"\n    android:updatePeriodMillis="0"\n    android:resizeMode="horizontal|vertical"\n    android:widgetCategory="home_screen"/>`;
        fs.writeFileSync(`${xmlDir}/brik_widget_info.xml`, infoXml);

        const pkg = c.android?.package ?? 'com.example';
        const kotlinDir = `${appSrcMain}/java/${pkg.replace(/\./g, '/')}/generated`;
        fs.mkdirSync(kotlinDir, { recursive: true });

        // Copy pre-generated Kotlin files from @brik/example-shared
        const sharedPackageGenerated = `${projectRoot}/../../packages/brik-example-shared/android/brik/src/main/java/generated`;
        if (fs.existsSync(sharedPackageGenerated)) {
          const kotlinFiles = fs.readdirSync(sharedPackageGenerated).filter((f) => f.endsWith('.kt'));
          for (const file of kotlinFiles) {
            const source = `${sharedPackageGenerated}/${file}`;
            const dest = `${kotlinDir}/${file}`;

            // Read and update package name
            let content = fs.readFileSync(source, 'utf-8');
            content = content.replace(/^package\s+[^\s]+/, `package ${pkg}.generated`);
            fs.writeFileSync(dest, content);
            console.log(`[Brik] Copied ${file} from example-shared to Android project`);
          }
        } else {
          // Fallback: Create placeholder files
          const providerSrc = `package ${pkg}.generated\n\nimport androidx.glance.appwidget.GlanceAppWidget\nimport androidx.glance.appwidget.GlanceAppWidgetReceiver\n\nclass BrikWidgetReceiver : GlanceAppWidgetReceiver() {\n  override val glanceAppWidget: GlanceAppWidget = BrikWidget()\n}`;
          fs.writeFileSync(`${kotlinDir}/BrikWidgetReceiver.kt`, providerSrc);
          const widgetSrc = `package ${pkg}.generated\n\nimport androidx.glance.appwidget.GlanceAppWidget\nclass BrikWidget : GlanceAppWidget()`;
          fs.writeFileSync(`${kotlinDir}/BrikWidget.kt`, widgetSrc);
        }

        return c;
      },
    ]);
  }
  return config;
};

export default withBrik;
