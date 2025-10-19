#!/usr/bin/env node
import { compileFiles } from '@brik/compiler';
import { writeComposeFiles } from '@brik/target-compose';
import { writeSwiftFiles } from '@brik/target-swiftui';
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { setupAndroidWidget } from './android-widget-setup';
import { setupIOSWidget } from './ios-widget-setup';
import { getMainAppBundleId } from './xcode-utils';
import { BrikHotReloader, createHotReloadClient } from './hot-reload';

const program = new Command();
program.name('brik').description('Brik CLI – Write once, run native').version('0.1.0');

program
  .command('scan')
  .description('Find Brik JSX and print a plan')
  .option('-v, --verbose', 'verbose output')
  .action(async (opts) => {
    try {
      const roots = await compileFiles({ projectRoot: process.cwd() });
      console.log(`Found ${roots.length} Brik roots`);
      for (const r of roots) {
        console.log(` - ${r.rootId}`);
        if (opts.verbose && (r as any).widget) {
          console.log(`   Widget: ${(r as any).widget.kind}`);
        }
      }
    } catch (error) {
      console.error('Error scanning files:', error);
      process.exit(1);
    }
  });

program
  .command('build')
  .option('-p, --platform <platform>', 'ios|android|all', 'all')
  .option('--as-widget', 'mark roots as widgets', false)
  .option('-o, --out-dir <dir>', 'output directory', '.brik')
  .option('-v, --verbose', 'verbose output')
  .description('Run compiler and targets to emit native code')
  .action(async (opts) => {
    try {
      const cwd = process.cwd();
      console.log('🔨 Building Brik components...');

      const roots = await compileFiles({
        projectRoot: cwd,
        asWidget: opts.asWidget,
        outDir: opts.outDir,
      });

      if (roots.length === 0) {
        console.log('⚠️  No Brik components found');
        return;
      }

      console.log(`📦 Found ${roots.length} component(s)`);

      if (opts.platform === 'ios' || opts.platform === 'all') {
        console.log('🍎 Generating SwiftUI code...');
        await writeSwiftFiles(roots, path.join(cwd, 'ios'));
        console.log('✅ SwiftUI generated');
      }

      if (opts.platform === 'android' || opts.platform === 'all') {
        console.log('🤖 Generating Compose code...');
        await writeComposeFiles(roots, path.join(cwd, 'android'), opts.asWidget);
        console.log('✅ Compose generated');
      }

      console.log('🎉 Brik build complete!');
    } catch (error) {
      console.error('❌ Build failed:', error);
      process.exit(1);
    }
  });

program
  .command('doctor')
  .description('Check environment for React Native / toolchains')
  .action(async () => {
    console.log('🔍 Brik Doctor - Environment Check');
    console.log('=====================================');

    // Node.js check
    const hasNode = typeof process.version === 'string';
    console.log(`Node.js: ${hasNode ? `✅ ${process.version}` : '❌ Missing'}`);

    // Check for React Native project
    const hasPackageJson = await fs.pathExists('package.json');
    const hasReactNative =
      hasPackageJson &&
      (await fs
        .readJson('package.json')
        .then((pkg) => pkg.dependencies?.['react-native'] || pkg.devDependencies?.['react-native'])
        .catch(() => false));
    console.log(`React Native: ${hasReactNative ? '✅ Found' : '❌ Not found'}`);

    // Check for iOS project
    const hasIos = await fs.pathExists('ios');
    console.log(`iOS project: ${hasIos ? '✅ Found' : '❌ Not found'}`);

    // Check for Android project
    const hasAndroid = await fs.pathExists('android');
    console.log(`Android project: ${hasAndroid ? '✅ Found' : '❌ Not found'}`);

    // Check for Brik components
    try {
      const roots = await compileFiles({ projectRoot: process.cwd() });
      console.log(
        `Brik components: ${roots.length > 0 ? `✅ ${roots.length} found` : '❌ None found'}`,
      );
    } catch (error) {
      console.log(`Brik components: ❌ Error scanning - ${error}`);
    }
  });

program
  .command('clean')
  .description('Clean generated files')
  .action(async () => {
    try {
      const cwd = process.cwd();
      const brikDir = path.join(cwd, '.brik');
      const iosDir = path.join(cwd, 'ios', 'brik');
      const androidDir = path.join(cwd, 'android', 'brik');

      await Promise.all([fs.remove(brikDir), fs.remove(iosDir), fs.remove(androidDir)]);

      console.log('🧹 Cleaned generated files');
    } catch (error) {
      console.error('❌ Clean failed:', error);
      process.exit(1);
    }
  });

program
  .command('ios-setup')
  .description('Set up iOS widget extension with App Groups for data sharing')
  .option('-n, --name <name>', 'Widget extension name', 'BrikWidget')
  .option('-b, --bundle-id <bundleId>', 'Main app bundle ID (auto-detected if not provided)')
  .option('-g, --app-group <appGroupId>', 'Custom App Group ID (defaults to group.{bundleId}.widgets)')
  .action(async (opts) => {
    try {
      const cwd = process.cwd();
      const iosDir = path.join(cwd, 'ios');

      if (!(await fs.pathExists(iosDir))) {
        console.error('❌ ios/ directory not found. Are you in a React Native project?');
        process.exit(1);
      }

      // Get or detect bundle ID
      const bundleId = opts.bundleId || getMainAppBundleId(iosDir);
      if (!bundleId) {
        console.error('❌ Could not detect bundle ID. Please provide it with --bundle-id');
        process.exit(1);
      }

      console.log(`📱 Main app bundle ID: ${bundleId}`);

      // Run the setup
      await setupIOSWidget({
        iosDir,
        widgetName: opts.name,
        bundleId,
        appGroupId: opts.appGroup,
      });

      // List generated files if they exist
      const generatedDir = path.join(iosDir, 'brik', 'Generated');
      if (await fs.pathExists(generatedDir)) {
        const files = await fs.readdir(generatedDir);
        const swiftFiles = files.filter((f) => f.endsWith('.swift'));
        if (swiftFiles.length > 0) {
          console.log(`\n📎 Generated Brik files to add to ${opts.name} target:`);
          for (const file of swiftFiles) {
            console.log(`  - ${file}`);
          }
        }
      }

      console.log('\n✅ Widget extension setup complete!');
    } catch (error) {
      console.error('❌ iOS setup failed:', error);
      process.exit(1);
    }
  });

program
  .command('android-setup')
  .description('Set up Android widget (Glance) with SharedPreferences for data sharing')
  .option('-n, --name <name>', 'Widget name', 'BrikWidget')
  .option('-p, --package-name <packageName>', 'App package name (auto-detected if not provided)')
  .action(async (opts) => {
    try {
      const cwd = process.cwd();
      const androidDir = path.join(cwd, 'android');

      if (!(await fs.pathExists(androidDir))) {
        console.error('❌ android/ directory not found. Are you in a React Native project?');
        process.exit(1);
      }

      console.log(`📱 Setting up Android widget: ${opts.name}`);

      // Run the setup
      await setupAndroidWidget({
        androidDir,
        widgetName: opts.name,
        packageName: opts.packageName,
      });

      console.log('\n✅ Android widget setup complete!');
    } catch (error) {
      console.error('❌ Android setup failed:', error);
      process.exit(1);
    }
  });

program
  .command('watch')
  .alias('dev')
  .description('Start development server with hot reload for widgets and Live Activities')
  .option('-p, --platform <platform>', 'ios|android|all', 'all')
  .option('--as-widget', 'mark roots as widgets', false)
  .option('-o, --out-dir <dir>', 'output directory', '.brik')
  .option('--port <port>', 'WebSocket server port', '8089')
  .option('--auto-reload', 'Auto-reload native widgets', false)
  .option('-v, --verbose', 'verbose output', false)
  .action(async (opts) => {
    try {
      console.log('🚀 Starting Brik development server...\n');

      const reloader = new BrikHotReloader({
        projectRoot: process.cwd(),
        platform: opts.platform as 'ios' | 'android' | 'all',
        asWidget: opts.asWidget,
        outDir: opts.outDir,
        verbose: opts.verbose,
        port: parseInt(opts.port),
        autoReloadNative: opts.autoReload,
      });

      await reloader.start();

      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        await reloader.stop();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await reloader.stop();
        process.exit(0);
      });

      // Keep the process alive
      process.stdin.resume();
    } catch (error) {
      console.error('❌ Failed to start hot reload:', error);
      process.exit(1);
    }
  });

program.parseAsync().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
