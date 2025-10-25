# @brik/compiler

JSX/TSX compiler for Brik - transforms React components to native SwiftUI and Jetpack Compose code.

## Overview

The Brik compiler is the core transformation engine that converts your React/TSX components into native iOS (SwiftUI) and Android (Jetpack Compose) code. It's used internally by `@brik/cli` and build tools.

## Features

- **TSX → Native**: Compiles React components to SwiftUI and Compose
- **IR Generation**: Creates validated Intermediate Representation (JSON)
- **Widget Detection**: Finds `@brik-widget` and `@brik-activity` annotations
- **Multi-target**: Generates code for iOS and Android simultaneously
- **Type-safe**: Full TypeScript support with Zod validation

## Installation

```bash
pnpm add @brik/compiler
```

## Usage

### Programmatic API

```typescript
import { compileComponent } from '@brik/compiler';

const result = await compileComponent({
  filePath: './src/widgets/MyWidget.tsx',
  platform: 'ios',
  outputDir: './ios/Generated'
});

console.log(result.swiftCode);
```

### With CLI

Most users should use `@brik/cli` instead:

```bash
pnpm add @brik/cli
pnpm brik build --platform all --as-widget
```

## Architecture

```
TSX Source → Babel Parser → AST → IR Generator → Platform Codegen
                                    ↓
                              Zod Validation
                                    ↓
                         SwiftUI Code | Compose Code
```

### Pipeline Steps

1. **Parse**: Use Babel to parse TSX into AST
2. **Transform**: Convert AST to Intermediate Representation (IR)
3. **Validate**: Validate IR against Zod schemas
4. **Generate**: Produce platform-specific code (SwiftUI/Compose)

## API Reference

### `compileComponent(options)`

Compiles a single TSX file to native code.

**Parameters:**
- `filePath` (string): Path to TSX file
- `platform` ('ios' | 'android' | 'all'): Target platform(s)
- `outputDir` (string): Output directory for generated code
- `asWidget` (boolean): Generate widget instead of view

**Returns:**
```typescript
{
  ir: IRRoot,           // Intermediate representation
  swiftCode?: string,   // Generated SwiftUI code
  kotlinCode?: string   // Generated Compose code
}
```

### `findBrikComponents(dir)`

Scans directory for Brik components with annotations.

**Parameters:**
- `dir` (string): Directory to scan

**Returns:**
```typescript
{
  widgets: string[],        // Files with @brik-widget
  activities: string[]      // Files with @brik-activity
}
```

## Component Detection

The compiler looks for special annotations:

```tsx
/** @brik-widget */
export function MyWidget() {
  return <BrikView>...</BrikView>;
}

/** @brik-activity */
export function MyActivity() {
  return {
    activityType: 'OrderTracking',
    attributes: { ... },
    regions: { ... }
  };
}
```

## IR (Intermediate Representation)

The compiler generates a JSON IR that's platform-agnostic:

```json
{
  "type": "Root",
  "tree": {
    "type": "View",
    "children": [
      {
        "type": "Text",
        "props": { "content": "Hello" }
      }
    ]
  }
}
```

See [`../../docs/technical/ir-spec.md`](../../docs/technical/ir-spec.md) for full IR specification.

## Supported Components

- `BrikView` → SwiftUI `VStack`/`HStack` | Compose `Column`/`Row`
- `BrikText` → SwiftUI `Text` | Compose `Text`
- `BrikButton` → SwiftUI `Button` | Compose `Button`
- `BrikImage` → SwiftUI `Image` | Compose `Image`
- `BrikProgressBar` → SwiftUI `ProgressView` | Compose `LinearProgressIndicator`
- `BrikSpacer` → SwiftUI `Spacer` | Compose `Spacer`

## Advanced Usage

### Custom Code Generation

```typescript
import { generateSwiftUI } from '@brik/target-swiftui';
import { generateCompose } from '@brik/target-compose';

const ir = { /* your IR */ };

const swiftCode = generateSwiftUI(ir);
const kotlinCode = generateCompose(ir);
```

### Validation Only

```typescript
import { validateIR } from '@brik/schemas';

try {
  const validIR = validateIR(untrustedIR);
  console.log('✅ IR is valid');
} catch (error) {
  console.error('❌ Invalid IR:', error);
}
```

## Dependencies

- `@brik/core` - Core utilities and types
- `@brik/schemas` - Zod validation schemas
- `@brik/target-swiftui` - SwiftUI code generator
- `@brik/target-compose` - Jetpack Compose code generator
- `@babel/parser` - TSX parsing
- `@babel/traverse` - AST traversal

## Related Packages

- [`@brik/cli`](../brik-cli) - Command-line interface
- [`@brik/react-native`](../brik-react-native) - React Native components
- [`@brik/expo-plugin`](../brik-expo-plugin) - Expo integration
- [`@brik/metro-plugin`](../brik-metro-plugin) - Metro bundler plugin

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm typecheck

# Test
pnpm test
```

## License

MIT © Mukul Chugh

## Links

- [Documentation](../../docs)
- [Main Repository](https://github.com/mukulchugh/brik)
- [npm Package](https://www.npmjs.com/package/@brik/compiler)
