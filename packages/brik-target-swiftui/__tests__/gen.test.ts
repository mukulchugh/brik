import { generateSwiftUI } from '../src/index';

describe('swiftui target', () => {
  it('generates Text', () => {
    const code = generateSwiftUI({
      version: 1,
      rootId: 'Demo',
      tree: { type: 'Text', text: 'Hello' } as any,
    });
    expect(code).toContain('Text("Hello")');
  });
});




