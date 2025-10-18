import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
  withAppBuildGradle,
  withDangerousMod,
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
        return c;
      },
    ]);
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
        const javaDir = `${appSrcMain}/java/${pkg.replace(/\./g, '/')}/generated`;
        fs.mkdirSync(javaDir, { recursive: true });
        const providerSrc = `package ${pkg}.generated\n\nimport androidx.glance.appwidget.GlanceAppWidget\nimport androidx.glance.appwidget.GlanceAppWidgetReceiver\n\nclass BrikWidgetReceiver : GlanceAppWidgetReceiver() {\n  override val glanceAppWidget: GlanceAppWidget = BrikWidget()\n}`;
        fs.writeFileSync(`${javaDir}/BrikWidgetReceiver.kt`, providerSrc);
        const widgetSrc = `package ${pkg}.generated\n\nimport androidx.glance.appwidget.GlanceAppWidget\nclass BrikWidget : GlanceAppWidget()`;
        fs.writeFileSync(`${javaDir}/BrikWidget.kt`, widgetSrc);
        return c;
      },
    ]);
  }
  return config;
};

export default withBrik;
