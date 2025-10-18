import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { compileFiles } from '../src/index';

describe('compiler', () => {
  it('emits IR to .brik', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'brik-'));
    const src = `import { BrikStack, BrikText } from '@brik/react-native';
export function Demo(){
  return (<BrikStack axis="column"><BrikText>Hi</BrikText></BrikStack>);
}`;
    await fs.outputFile(path.join(tmp, 'App.tsx'), src);
    const roots = await compileFiles({ projectRoot: tmp });
    expect(roots.length).toBe(1);
    const index = await fs.readJson(path.join(tmp, '.brik', 'index.json'));
    expect(index.count).toBe(1);
  });
});






