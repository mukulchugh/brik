import { describe, it, expect } from 'vitest';
import { compileFiles } from '../src/index';
import path from 'path';

describe('React hooks validation', () => {
  it('throws an error if a React hook is used', async () => {
    await expect(compileFiles({
      projectRoot: __dirname,
      entries: ['mock-hook-widget.tsx'],
    })).rejects.toThrowError(/Unsupported React hook 'useState'/);
  });
});
