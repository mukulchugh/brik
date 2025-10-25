# @brik/target-swiftui

SwiftUI code generator for Brik - transforms IR to native iOS widgets and Live Activities.

## Overview

Generates native SwiftUI code from Brik's Intermediate Representation (IR).

## Installation

```bash
pnpm add @brik/target-swiftui
```

## Usage

```typescript
import { generateSwiftUI } from '@brik/target-swiftui';

const swiftCode = generateSwiftUI(irNode);

console.log(swiftCode);
// Output:
// VStack(alignment: .leading, spacing: 8) {
//   Text("Hello")
//     .font(.system(size: 16))
//     .foregroundColor(Color(hex: "#000000"))
// }
```

## Mappings

| Brik Component | SwiftUI Output |
|----------------|----------------|
| BrikView | VStack / HStack |
| BrikText | Text |
| BrikButton | Button |
| BrikImage | AsyncImage |
| BrikProgressBar | ProgressView |
| BrikSpacer | Spacer |
| BrikStack | VStack / HStack |

## License

MIT © Mukul Chugh
