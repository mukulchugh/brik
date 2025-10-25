# @brik/test-utils

Testing utilities for Brik packages.

## Overview

Shared test helpers, mocks, and fixtures for testing Brik packages.

## Installation

```bash
pnpm add -D @brik/test-utils
```

## Usage

```typescript
import { mockIRNode, createTestComponent } from '@brik/test-utils';

describe('MyComponent', () => {
  it('should generate correct IR', () => {
    const ir = mockIRNode('View', { padding: 16 });
    expect(ir.type).toBe('View');
  });
});
```

## Utilities

- `mockIRNode(type, props)` - Create mock IR nodes
- `createTestComponent(tsx)` - Generate test components
- `validateGeneratedCode(code, platform)` - Validate generated code
- `fixtureIR` - Sample IR structures
- `fixtureComponents` - Sample TSX components

## License

MIT © Mukul Chugh
