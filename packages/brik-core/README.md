# @brik/core

Core utilities and type system for Brik - shared across compiler, runtime, and code generation.

## Overview

`@brik/core` provides the foundational types, utilities, and helpers used by all Brik packages. It's a low-level package that most users won't interact with directly.

## Features

- **Type Definitions**: Core TypeScript types for IR, components, and styles
- **Style Normalization**: Convert React Native styles to native formats
- **AST Utilities**: Helper functions for Babel AST manipulation
- **Validation Helpers**: Type guards and validation functions
- **Constants**: Shared constants across all packages

## Installation

```bash
pnpm add @brik/core
```

> **Note**: This package is typically installed as a dependency of other Brik packages. Most users should use `@brik/react-native` or `@brik/cli` instead.

## Usage

### Style Normalization

```typescript
import { normalizeStyle } from '@brik/core';

const reactStyle = {
  padding: 16,
  backgroundColor: '#FF0000',
  flexDirection: 'row'
};

const normalized = normalizeStyle(reactStyle);
// {
//   padding: { top: 16, right: 16, bottom: 16, left: 16 },
//   background: { color: '#FF0000' },
//   layout: { direction: 'row' }
// }
```

### Type Definitions

```typescript
import type {
  IRNode,
  IRRoot,
  BrikComponent,
  StyleProps
} from '@brik/core';

const node: IRNode = {
  type: 'View',
  props: {},
  children: []
};
```

### Component Type Guards

```typescript
import { isViewNode, isTextNode } from '@brik/core';

if (isViewNode(node)) {
  // TypeScript knows node is ViewNode
  console.log(node.children);
}
```

## API Reference

### Style Utilities

#### `normalizeStyle(style: ReactStyle): NormalizedStyle`

Converts React Native style objects to normalized format for code generation.

**Example:**
```typescript
normalizeStyle({
  marginTop: 10,
  marginBottom: 20,
  paddingHorizontal: 15
});
// Returns:
// {
//   margin: { top: 10, bottom: 20 },
//   padding: { left: 15, right: 15 }
// }
```

#### `flattenStyles(styles: StyleArray): FlatStyle`

Flattens and merges multiple style objects.

```typescript
flattenStyles([
  { padding: 10 },
  { padding: 20, margin: 5 }
]);
// Returns: { padding: 20, margin: 5 }
```

### Type Guards

#### `isViewNode(node: IRNode): node is ViewNode`
#### `isTextNode(node: IRNode): node is TextNode`
#### `isButtonNode(node: IRNode): node is ButtonNode`
#### `isImageNode(node: IRNode): node is ImageNode`

Type guards for IR node types with TypeScript narrowing.

### Constants

```typescript
import {
  SUPPORTED_COMPONENTS,
  SUPPORTED_PROPS,
  DEFAULT_STYLES
} from '@brik/core';

console.log(SUPPORTED_COMPONENTS);
// ['BrikView', 'BrikText', 'BrikButton', ...]
```

## Type System

### IR (Intermediate Representation)

```typescript
export interface IRRoot {
  type: 'Root';
  tree: IRNode;
  metadata?: {
    componentName: string;
    filePath: string;
  };
}

export type IRNode =
  | ViewNode
  | TextNode
  | ButtonNode
  | ImageNode
  | StackNode
  | ListNode
  | SpacerNode
  | ProgressBarNode;

export interface ViewNode {
  type: 'View';
  props: ViewProps;
  children: IRNode[];
}

export interface TextNode {
  type: 'Text';
  props: TextProps;
  content?: string;
}
```

### Style Types

```typescript
export interface StyleProps {
  layout?: LayoutStyle;
  typography?: TypographyStyle;
  background?: BackgroundStyle;
  border?: BorderStyle;
  spacing?: SpacingStyle;
}

export interface LayoutStyle {
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end' | 'space-between';
  gap?: number;
}

export interface TypographyStyle {
  fontSize?: number;
  fontWeight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
}
```

## Advanced Usage

### Custom AST Traversal

```typescript
import { traverseAST, visitNode } from '@brik/core';

traverseAST(ast, {
  enter(node) {
    if (node.type === 'JSXElement') {
      // Process JSX elements
    }
  }
});
```

### Style Merging

```typescript
import { mergeStyles } from '@brik/core';

const merged = mergeStyles(
  { padding: 10, margin: 5 },
  { padding: 20 }  // Override
);
// Result: { padding: 20, margin: 5 }
```

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test --watch

# Coverage
pnpm test --coverage
```

## Dependencies

- `@brik/schemas` - Zod validation schemas
- `@babel/core` - AST manipulation
- `@babel/parser` - JavaScript/TypeScript parsing
- `@babel/traverse` - AST traversal
- `@babel/types` - AST node type definitions

## Used By

- `@brik/compiler` - JSX/TSX compilation
- `@brik/target-swiftui` - SwiftUI code generation
- `@brik/target-compose` - Compose code generation
- `@brik/react-native` - Runtime components
- `@brik/cli` - Command-line interface

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm typecheck
```

## License

MIT © Mukul Chugh

## Links

- [Documentation](../../docs)
- [Main Repository](https://github.com/mukulchugh/brik)
- [npm Package](https://www.npmjs.com/package/@brik/core)
