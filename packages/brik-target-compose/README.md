# @brik/target-compose

Jetpack Compose code generator for Brik - transforms IR to native Android widgets.

## Overview

Generates native Jetpack Compose code from Brik's Intermediate Representation (IR).

## Installation

```bash
pnpm add @brik/target-compose
```

## Usage

```typescript
import { generateCompose } from '@brik/target-compose';

const kotlinCode = generateCompose(irNode);

console.log(kotlinCode);
// Output:
// Column(
//   modifier = Modifier.padding(8.dp),
//   verticalArrangement = Arrangement.Top
// ) {
//   Text(
//     text = "Hello",
//     fontSize = 16.sp,
//     color = Color(0xFF000000)
//   )
// }
```

## Mappings

| Brik Component | Jetpack Compose Output |
|----------------|------------------------|
| BrikView | Column / Row |
| BrikText | Text |
| BrikButton | Button |
| BrikImage | Image (Coil) |
| BrikProgressBar | LinearProgressIndicator |
| BrikSpacer | Spacer |
| BrikStack | Column / Row |

## License

MIT © Mukul Chugh
