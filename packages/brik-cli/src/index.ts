#!/usr/bin/env node
import { compileFiles } from '@brik/compiler';
import { writeComposeFiles } from '@brik/target-compose';
import { writeSwiftFiles } from '@brik/target-swiftui';
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { createWidgetFiles, getMainAppBundleId } from './xcode-utils';

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
  .description('Set up iOS widget extension (creates files, needs Xcode for target)')
  .option('-n, --name <name>', 'Widget extension name', 'BrikWidget')
  .action(async (opts) => {
    try {
      const cwd = process.cwd();
      const iosDir = path.join(cwd, 'ios');

      if (!(await fs.pathExists(iosDir))) {
        console.error('❌ ios/ directory not found. Are you in a React Native project?');
        process.exit(1);
      }

      const bundleId = getMainAppBundleId(iosDir);
      console.log(`📱 Main app bundle ID: ${bundleId || 'not found'}`);

      await createWidgetFiles(iosDir, opts.name);

      // List generated files
      const generatedDir = path.join(iosDir, 'brik', 'Generated');
      if (await fs.pathExists(generatedDir)) {
        const files = await fs.readdir(generatedDir);
        console.log(`\n📎 Generated files to add to ${opts.name} target:`);
        for (const file of files.filter((f) => f.endsWith('.swift'))) {
          console.log(`  - ${file}`);
        }
      }

      console.log('\n✅ Widget files created!');
      console.log('\n📋 Next steps:');
      console.log('1. Open ios/*.xcworkspace in Xcode');
      console.log('2. File → New → Target → Widget Extension');
      console.log(`3. Name: ${opts.name}`);
      console.log('4. Delete generated template, use our files instead');
      console.log('5. Build widget extension');
      console.log('\nOr see examples/rn-expo-app/WIDGET_SETUP.md for details');
    } catch (error) {
      console.error('❌ iOS setup failed:', error);
      process.exit(1);
    }
  });

program.parseAsync().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
