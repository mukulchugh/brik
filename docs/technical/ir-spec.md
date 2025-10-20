# Brik Intermediate Representation (IR) Specification

## Overview

The Brik IR is a platform-agnostic JSON representation of UI components that serves as the bridge between React/JSX source code and native platform code (SwiftUI, Glance/Compose).

**Version:** 1

**Design Goals:**
- Platform-agnostic representation
- Strongly typed with Zod schemas
- Serializable and cacheable
- Deterministic code generation
- Extensible for future platforms

## IR Root Structure

```typescript
interface IRRoot {
  version: 1;
  rootId: string;
  tree: IRNode;
  widget?: WidgetMetadata;
  liveActivity?: LiveActivityConfig;
}
```

### Fields

- `version`: IR schema version (currently `1`)
- `rootId`: Unique identifier for this IR tree
- `tree`: Root node of the component tree
- `widget`: Optional widget metadata (for home/lock screen widgets)
- `liveActivity`: Optional Live Activity configuration (for iOS Live Activities)

## Node Types

### Base Node

All nodes share these common fields:

```typescript
interface BaseNode {
  id: string;           // Unique node identifier
  type: NodeType;       // Node type discriminator
  style?: StyleProps;   // Optional styling
  action?: Action;      // Optional tap/click action
}
```

### View Node

Container for other nodes:

```typescript
interface ViewNode extends BaseNode {
  type: 'View';
  children?: IRNode[];
}
```

**Example:**
```json
{
  "id": "view_1",
  "type": "View",
  "style": {
    "layout": { "padding": 16 },
    "colors": { "backgroundColor": "#FFFFFF" },
    "borders": { "borderRadius": 12 }
  },
  "children": [...]
}
```

### Text Node

Text display:

```typescript
interface TextNode extends BaseNode {
  type: 'Text';
  content: string;
  dynamic?: boolean;  // Whether content is a variable reference
}
```

**Example:**
```json
{
  "id": "text_1",
  "type": "Text",
  "content": "Hello World",
  "style": {
    "typography": {
      "fontSize": 18,
      "fontWeight": "700",
      "color": "#000000"
    }
  }
}
```

**Dynamic text:**
```json
{
  "id": "text_2",
  "type": "Text",
  "content": "userName",
  "dynamic": true
}
```

### Stack Node

Horizontal or vertical layout container:

```typescript
interface StackNode extends BaseNode {
  type: 'Stack';
  axis: 'horizontal' | 'vertical';
  children?: IRNode[];
}
```

**Example:**
```json
{
  "id": "stack_1",
  "type": "Stack",
  "axis": "horizontal",
  "style": {
    "layout": { "gap": 12 }
  },
  "children": [...]
}
```

### Button Node

Tappable button with label and action:

```typescript
interface ButtonNode extends BaseNode {
  type: 'Button';
  label: string;
  action: Action;
}
```

**Example:**
```json
{
  "id": "button_1",
  "type": "Button",
  "label": "Open App",
  "action": {
    "type": "deeplink",
    "url": "myapp://home"
  }
}
```

### Image Node

Image from URI or asset:

```typescript
interface ImageNode extends BaseNode {
  type: 'Image';
  uri: string;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}
```

**Example:**
```json
{
  "id": "image_1",
  "type": "Image",
  "uri": "https://example.com/photo.jpg",
  "resizeMode": "cover",
  "style": {
    "layout": { "width": 100, "height": 100 },
    "borders": { "borderRadius": 8 }
  }
}
```

### Spacer Node

Flexible spacing element:

```typescript
interface SpacerNode extends BaseNode {
  type: 'Spacer';
}
```

**Example:**
```json
{
  "id": "spacer_1",
  "type": "Spacer",
  "style": {
    "layout": { "flex": 1 }
  }
}
```

### ProgressBar Node

Progress indicator:

```typescript
interface ProgressBarNode extends BaseNode {
  type: 'ProgressBar';
  progress?: number;        // 0.0 to 1.0
  indeterminate?: boolean;  // Indeterminate/loading state
}
```

**Example:**
```json
{
  "id": "progress_1",
  "type": "ProgressBar",
  "progress": 0.75,
  "style": {
    "layout": { "height": 8 },
    "colors": { "tintColor": "#3B82F6" }
  }
}
```

### List Node

Scrollable list (simplified):

```typescript
interface ListNode extends BaseNode {
  type: 'List';
  horizontal?: boolean;
  children?: IRNode[];
}
```

**Example:**
```json
{
  "id": "list_1",
  "type": "List",
  "horizontal": false,
  "children": [...]
}
```

## Style Properties

Styles are categorized into five groups:

### Layout Styles

```typescript
interface LayoutStyle {
  width?: number;
  height?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
  padding?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  margin?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginHorizontal?: number;
  marginVertical?: number;
  flex?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number;
  flexDirection?: 'row' | 'column';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  gap?: number;
  position?: 'relative' | 'absolute';
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  zIndex?: number;
}
```

### Typography Styles

```typescript
interface TypographyStyle {
  fontSize?: number;
  fontWeight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic';
  color?: string;          // Hex color
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  lineHeight?: number;
  letterSpacing?: number;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}
```

### Color Styles

```typescript
interface ColorStyle {
  backgroundColor?: string;  // Hex color
  opacity?: number;          // 0.0 to 1.0
  tintColor?: string;        // Hex color (for images, progress bars)
}
```

### Border Styles

```typescript
interface BorderStyle {
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  borderWidth?: number;
  borderColor?: string;      // Hex color
  borderStyle?: 'solid' | 'dashed' | 'dotted';
}
```

### Shadow Styles

```typescript
interface ShadowStyle {
  shadowColor?: string;      // Hex color
  shadowOpacity?: number;    // 0.0 to 1.0
  shadowRadius?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  elevation?: number;        // Android-specific
}
```

### Complete StyleProps

```typescript
interface StyleProps {
  layout?: LayoutStyle;
  typography?: TypographyStyle;
  colors?: ColorStyle;
  borders?: BorderStyle;
  shadows?: ShadowStyle;
}
```

## Actions

Actions define interactivity:

```typescript
type Action = DeepLinkAction | OpenAppAction | RefreshAction | CustomAction;

interface DeepLinkAction {
  type: 'deeplink';
  url: string;
  params?: Record<string, any>;
}

interface OpenAppAction {
  type: 'openApp';
  appId?: string;
}

interface RefreshAction {
  type: 'refresh';
}

interface CustomAction {
  type: 'custom';
  params?: Record<string, any>;
}
```

## Widget Metadata

For home/lock screen widgets:

```typescript
interface WidgetMetadata {
  kind: string;                           // Widget identifier
  displayName?: string;                   // User-facing name
  description?: string;                   // User-facing description
  families: WidgetFamily[];               // Supported sizes
  supportedPlatforms?: Platform[];        // ios, android, watchos
  configurable?: boolean;                 // User-configurable
  timeline?: Timeline;                    // Update schedule
}

type WidgetFamily =
  | 'systemSmall'
  | 'systemMedium'
  | 'systemLarge'
  | 'systemExtraLarge'
  | 'accessoryCircular'
  | 'accessoryRectangular'
  | 'accessoryInline';

interface Timeline {
  policy: 'atEnd' | 'afterDate' | 'never';
  refreshInterval?: number;  // Seconds
}
```

## Live Activity Configuration

For iOS Live Activities:

```typescript
interface LiveActivityConfig {
  activityType: string;
  attributes: {
    static: Record<string, string>;   // Type names: 'string', 'number', 'boolean', etc.
    dynamic: Record<string, string>;
  };
  regions: {
    lockScreen?: IRNode;
    dynamicIsland?: {
      compact?: IRNode;
      minimal?: IRNode;
      expanded?: IRNode;
    };
  };
}
```

**Example:**
```json
{
  "activityType": "OrderTracking",
  "attributes": {
    "static": {
      "orderId": "string",
      "merchantName": "string"
    },
    "dynamic": {
      "status": "string",
      "eta": "number",
      "progress": "number"
    }
  },
  "regions": {
    "lockScreen": { "id": "view_1", "type": "View", ... },
    "dynamicIsland": {
      "compact": { "id": "progress_1", "type": "ProgressBar", ... },
      "minimal": { "id": "text_1", "type": "Text", ... },
      "expanded": { "id": "view_2", "type": "View", ... }
    }
  }
}
```

## Complete Example

```json
{
  "version": 1,
  "rootId": "MyWidget_root",
  "tree": {
    "id": "view_root",
    "type": "View",
    "style": {
      "layout": { "padding": 16 },
      "colors": { "backgroundColor": "#FFFFFF" },
      "borders": { "borderRadius": 12 },
      "shadows": {
        "shadowColor": "#000000",
        "shadowOpacity": 0.1,
        "shadowRadius": 8,
        "shadowOffsetY": 2
      }
    },
    "children": [
      {
        "id": "text_title",
        "type": "Text",
        "content": "Hello Brik",
        "style": {
          "typography": {
            "fontSize": 18,
            "fontWeight": "700",
            "color": "#1A1A1A"
          }
        }
      },
      {
        "id": "button_open",
        "type": "Button",
        "label": "Open App",
        "action": {
          "type": "deeplink",
          "url": "myapp://home"
        }
      }
    ]
  },
  "widget": {
    "kind": "MyWidget",
    "displayName": "My Widget",
    "families": ["systemSmall", "systemMedium"],
    "supportedPlatforms": ["ios", "android"]
  }
}
```

## Validation

All IR is validated using Zod schemas in `@brik/schemas`:

```typescript
import { z } from 'zod';

const IRNodeSchema = z.discriminatedUnion('type', [
  ViewNodeSchema,
  TextNodeSchema,
  StackNodeSchema,
  ButtonNodeSchema,
  ImageNodeSchema,
  SpacerNodeSchema,
  ProgressBarNodeSchema,
  ListNodeSchema,
]);

const IRRootSchema = z.object({
  version: z.literal(1),
  rootId: z.string(),
  tree: IRNodeSchema,
  widget: WidgetMetadataSchema.optional(),
  liveActivity: LiveActivityConfigSchema.optional(),
});
```

## Platform Code Generation

### SwiftUI (iOS)

IR nodes map to SwiftUI views:

- `View` → `VStack` or custom view
- `Stack(horizontal)` → `HStack`
- `Stack(vertical)` → `VStack`
- `Text` → `Text().font().foregroundColor()`
- `Button` → `Link(destination:) { ... }`
- `Image` → `AsyncImage(url:)`
- `ProgressBar` → `ProgressView(value:)`
- `Spacer` → `Spacer()`

### Glance/Compose (Android)

IR nodes map to Glance composables:

- `View` → `Column` with modifiers
- `Stack(horizontal)` → `Row`
- `Stack(vertical)` → `Column`
- `Text` → `Text(text, style = TextStyle(...))`
- `Button` → `Button(text, onClick = actionStartActivity(...))`
- `Image` → `Image(provider = ImageProvider(...))`
- `ProgressBar` → `LinearProgressIndicator(progress = ...)`
- `Spacer` → `Spacer(modifier = GlanceModifier.defaultWeight())`

## Extension Points

### Adding New Node Types

1. Define TypeScript interface extending `BaseNode`
2. Add to `@brik/schemas` Zod schema
3. Add React component in `@brik/react-native`
4. Add SwiftUI mapping in `@brik/target-swiftui`
5. Add Glance mapping in `@brik/target-compose`
6. Update compiler in `@brik/compiler` if needed

### Adding New Style Properties

1. Add to appropriate `StyleProps` subcategory
2. Update Zod schema
3. Implement platform mapping in generators

## Versioning

The IR version field enables future schema evolution:

- **Version 1**: Current schema (v0.1.0 - v0.2.0)
- **Version 2**: Planned (animations, gestures, advanced layouts)

Code generators must handle version checking and graceful degradation.

## References

- Implementation: `packages/brik-core/src/types.ts`
- Validation: `packages/brik-schemas/src/index.ts`
- Examples: `examples/rn-expo-app/src/widgets/`
