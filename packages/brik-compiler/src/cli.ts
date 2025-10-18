#!/usr/bin/env node
import { compileFiles } from './index';

async function main() {
  const cwd = process.cwd();
  await compileFiles({ projectRoot: cwd });
  console.log('brik-compiler: IR emitted to .brik');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});






