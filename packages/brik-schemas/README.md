# @brik/schemas

Zod validation schemas and type definitions for Brik's Intermediate Representation (IR).

## Overview

`@brik/schemas` provides runtime validation schemas using Zod for all Brik data structures. It ensures type safety across the compilation pipeline from TSX to native code.

## Installation

```bash
pnpm add @brik/schemas
```

## Usage

```typescript
import { IRRootSchema, ViewNodeSchema, TextNodeSchema } from '@brik/schemas';

// Validate IR
const result = IRRootSchema.safeParse(untrustedData);

if (result.success) {
  console.log('✅ Valid IR:', result.data);
} else {
  console.error('❌ Invalid IR:', result.error);
}
```

## Schemas

### IR Node Schemas

- `IRRootSchema` - Root IR structure
- `ViewNodeSchema` - View/container nodes
- `TextNodeSchema` - Text nodes
- `ButtonNodeSchema` - Button nodes
- `ImageNodeSchema` - Image nodes
- `StackNodeSchema` - Stack layout nodes
- `ListNodeSchema` - List nodes
- `SpacerNodeSchema` - Spacer nodes
- `ProgressBarNodeSchema` - Progress bar nodes

### Style Schemas

- `LayoutStyleSchema` - Layout properties (direction, align, justify)
- `TypographyStyleSchema` - Text styling (fontSize, fontWeight, color)
- `BackgroundStyleSchema` - Background styling
- `BorderStyleSchema` - Border properties
- `SpacingStyleSchema` - Padding and margin

### Live Activities Schemas

- `ActivityAttributesSchema` - Activity attribute definitions
- `ActivityRegionsSchema` - Lock screen and Dynamic Island regions
- `DynamicIslandSchema` - Dynamic Island configurations

## Example

```typescript
import { z } from 'zod';
import { TypographyStyleSchema } from '@brik/schemas';

const typography = TypographyStyleSchema.parse({
  fontSize: 16,
  fontWeight: '600',
  color: '#000000',
  textAlign: 'center'
});

// TypeScript knows the exact type
console.log(typography.fontSize); // number
console.log(typography.fontWeight); // '100' | '200' | ... | '900'
```

## Development

```bash
pnpm build
pnpm typecheck
```

## License

MIT © Mukul Chugh
