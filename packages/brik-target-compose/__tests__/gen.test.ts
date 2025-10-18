import { generateCompose } from '../src/index';

describe('compose target', () => {
  it('generates Text', () => {
    const code = generateCompose({
      version: 1,
      rootId: 'Demo',
      tree: { type: 'Text', text: 'Hello' } as any,
    });
    expect(code).toContain('Text(text = "Hello"');
  });
});




