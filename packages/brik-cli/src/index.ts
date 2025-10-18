#!/usr/bin/env node
import { compileFiles } from '@brik/compiler';
import { writeComposeFiles } from '@brik/target-compose';
import { writeSwiftFiles } from '@brik/target-swiftui';
import { Command } from 'commander';
import path from 'path';

const program = new Command();
program.name('brik').description('Brik CLI – Write once, run native').version('0.1.0');

program
  .command('scan')
  .description('Find Brik JSX and print a plan')
  .action(async () => {
    const roots = await compileFiles({ projectRoot: process.cwd() });
    console.log(`Found ${roots.length} Brik roots`);
    for (const r of roots) console.log(` - ${r.rootId}`);
  });

program
  .command('build')
  .option('-p, --platform <platform>', 'ios|android|all', 'all')
  .option('--as-widget', 'mark roots as widgets', false)
  .description('Run compiler and targets to emit native code')
  .action(async (opts) => {
    const cwd = process.cwd();
    const roots = await compileFiles({ projectRoot: cwd, asWidget: opts.asWidget });
    if (opts.platform === 'ios' || opts.platform === 'all') {
      await writeSwiftFiles(roots, path.join(cwd, 'ios'));
      console.log('SwiftUI generated');
    }
    if (opts.platform === 'android' || opts.platform === 'all') {
      await writeComposeFiles(roots, path.join(cwd, 'android'));
      console.log('Compose generated');
    }
    console.log('brik build complete');
  });

program
  .command('doctor')
  .description('Check environment for React Native / toolchains')
  .action(async () => {
    console.log('Brik doctor: minimal checks');
    const hasNode = typeof process.version === 'string';
    console.log(`Node: ${hasNode ? process.version : 'missing'}`);
  });

program.parseAsync().catch((err) => {
  console.error(err);
  process.exit(1);
});
