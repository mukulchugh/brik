# React to Native Mappings

This document describes how Brik React components and props map to native SwiftUI (iOS) and Glance/Compose (Android) code.

## Component Mappings

### BrikView

**React:**
```tsx
<BrikView style={{ padding: 16, backgroundColor: '#FFFFFF' }}>
  {children}
</BrikView>
```

**SwiftUI (iOS):**
```swift
VStack {
  // children
}
.padding(16)
.background(Color(red: 1.0, green: 1.0, blue: 1.0))
```

**Glance (Android):**
```kotlin
Column(
  modifier = GlanceModifier
    .padding(16.dp)
    .background(Color(0xFFFFFFFF))
) {
  // children
}
```

---

### BrikText

**React:**
```tsx
<BrikText style={{ fontSize: 18, fontWeight: '700', color: '#000000' }}>
  Hello World
</BrikText>
```

**SwiftUI (iOS):**
```swift
Text("Hello World")
  .font(.system(size: 18, weight: .bold))
  .foregroundColor(Color(red: 0.0, green: 0.0, blue: 0.0))
```

**Glance (Android):**
```kotlin
Text(
  text = "Hello World",
  style = TextStyle(
    fontSize = 18.sp,
    fontWeight = FontWeight.Bold,
    color = ColorProvider(Color(0xFF000000))
  )
)
```

---

### BrikStack

**React (Horizontal):**
```tsx
<BrikStack axis="horizontal" style={{ gap: 12 }}>
  {children}
</BrikStack>
```

**SwiftUI (iOS):**
```swift
HStack(spacing: 12) {
  // children
}
```

**Glance (Android):**
```kotlin
Row(
  horizontalAlignment = Alignment.Start,
  modifier = GlanceModifier
) {
  // children with Spacer(modifier = GlanceModifier.width(12.dp)) between items
}
```

**React (Vertical):**
```tsx
<BrikStack axis="vertical" style={{ gap: 8 }}>
  {children}
</BrikStack>
```

**SwiftUI (iOS):**
```swift
VStack(spacing: 8) {
  // children
}
```

**Glance (Android):**
```kotlin
Column(
  verticalAlignment = Alignment.Top,
  modifier = GlanceModifier
) {
  // children with Spacer(modifier = GlanceModifier.height(8.dp)) between items
}
```

---

### BrikButton

**React:**
```tsx
<BrikButton
  label="Open App"
  action={{ type: 'deeplink', url: 'myapp://home' }}
  style={{ backgroundColor: '#3B82F6', padding: 12 }}
/>
```

**SwiftUI (iOS):**
```swift
Link(destination: URL(string: "myapp://home")!) {
  Text("Open App")
    .padding(12)
    .background(Color(red: 0.23, green: 0.51, blue: 0.96))
}
```

**Glance (Android):**
```kotlin
Button(
  text = "Open App",
  onClick = actionStartActivity(
    Intent(Intent.ACTION_VIEW, Uri.parse("myapp://home"))
  ),
  modifier = GlanceModifier
    .padding(12.dp)
    .background(Color(0xFF3B82F6))
)
```

---

### BrikImage

**React:**
```tsx
<BrikImage
  uri="https://example.com/photo.jpg"
  style={{ width: 100, height: 100, borderRadius: 8 }}
  resizeMode="cover"
/>
```

**SwiftUI (iOS):**
```swift
AsyncImage(url: URL(string: "https://example.com/photo.jpg")) { image in
  image
    .resizable()
    .aspectRatio(contentMode: .fill)
    .frame(width: 100, height: 100)
    .clipShape(RoundedRectangle(cornerRadius: 8))
}
```

**Glance (Android):**
```kotlin
Image(
  provider = ImageProvider(Uri.parse("https://example.com/photo.jpg")),
  contentDescription = null,
  contentScale = ContentScale.Crop,
  modifier = GlanceModifier
    .size(100.dp)
    .cornerRadius(8.dp)
)
```

---

### BrikSpacer

**React:**
```tsx
<BrikSpacer flex={1} />
```

**SwiftUI (iOS):**
```swift
Spacer()
```

**Glance (Android):**
```kotlin
Spacer(modifier = GlanceModifier.defaultWeight())
```

---

### BrikProgressBar

**React (Determinate):**
```tsx
<BrikProgressBar progress={0.75} style={{ height: 8 }} />
```

**SwiftUI (iOS):**
```swift
ProgressView(value: 0.75)
  .frame(height: 8)
```

**Glance (Android):**
```kotlin
LinearProgressIndicator(
  progress = 0.75f,
  modifier = GlanceModifier.height(8.dp)
)
```

**React (Indeterminate):**
```tsx
<BrikProgressBar indeterminate style={{ height: 8 }} />
```

**SwiftUI (iOS):**
```swift
ProgressView()
  .frame(height: 8)
```

**Glance (Android):**
```kotlin
CircularProgressIndicator(
  modifier = GlanceModifier.size(8.dp)
)
```

---

### BrikList

**React:**
```tsx
<BrikList
  items={[1, 2, 3]}
  renderItem={(item) => <BrikText>{item}</BrikText>}
  horizontal={false}
/>
```

**SwiftUI (iOS):**
```swift
VStack {
  Text("1")
  Text("2")
  Text("3")
}
```

**Glance (Android):**
```kotlin
Column {
  Text("1")
  Text("2")
  Text("3")
}
```

*(Note: List rendering is simplified at build time - items must be static)*

---

## Style Property Mappings

### Layout

| React Property | SwiftUI | Glance/Compose |
|----------------|---------|----------------|
| `width: 100` | `.frame(width: 100)` | `.width(100.dp)` |
| `height: 100` | `.frame(height: 100)` | `.height(100.dp)` |
| `padding: 16` | `.padding(16)` | `.padding(16.dp)` |
| `paddingHorizontal: 12` | `.padding(.horizontal, 12)` | `.padding(horizontal = 12.dp)` |
| `paddingVertical: 8` | `.padding(.vertical, 8)` | `.padding(vertical = 8.dp)` |
| `margin: 16` | Not directly supported | `.padding(16.dp)` (outer) |
| `flex: 1` | `Spacer()` | `.defaultWeight()` |
| `flexDirection: 'row'` | `HStack` | `Row` |
| `flexDirection: 'column'` | `VStack` | `Column` |
| `alignItems: 'center'` | `.frame(alignment: .center)` | `Alignment.CenterHorizontally` |
| `justifyContent: 'space-between'` | HStack alignment | `Arrangement.SpaceBetween` |
| `gap: 12` | `spacing: 12` | Spacer between children |
| `position: 'absolute'` | `.position(...)` | Not supported |
| `zIndex: 10` | `.zIndex(10)` | Not supported |

### Typography

| React Property | SwiftUI | Glance/Compose |
|----------------|---------|----------------|
| `fontSize: 18` | `.font(.system(size: 18))` | `fontSize = 18.sp` |
| `fontWeight: '700'` | `.font(.system(weight: .bold))` | `fontWeight = FontWeight.Bold` |
| `fontWeight: '400'` | `.font(.system(weight: .regular))` | `fontWeight = FontWeight.Normal` |
| `fontWeight: '500'` | `.font(.system(weight: .medium))` | `fontWeight = FontWeight.Medium` |
| `fontStyle: 'italic'` | `.italic()` | `fontStyle = FontStyle.Italic` |
| `color: '#3B82F6'` | `.foregroundColor(Color(...))` | `color = ColorProvider(Color(...))` |
| `textAlign: 'center'` | `.multilineTextAlignment(.center)` | `textAlign = TextAlign.Center` |
| `textAlign: 'left'` | `.multilineTextAlignment(.leading)` | `textAlign = TextAlign.Start` |
| `textAlign: 'right'` | `.multilineTextAlignment(.trailing)` | `textAlign = TextAlign.End` |
| `lineHeight: 24` | `.lineSpacing(24)` | `lineHeight = 24.sp` |
| `numberOfLines: 2` | `.lineLimit(2)` | `maxLines = 2` |

### Colors

| React Property | SwiftUI | Glance/Compose |
|----------------|---------|----------------|
| `backgroundColor: '#FFFFFF'` | `.background(Color(red: 1, green: 1, blue: 1))` | `.background(Color(0xFFFFFFFF))` |
| `backgroundColor: '#3B82F6'` | `.background(Color(red: 0.23, green: 0.51, blue: 0.96))` | `.background(Color(0xFF3B82F6))` |
| `opacity: 0.5` | `.opacity(0.5)` | `.alpha(0.5f)` |
| `tintColor: '#FF0000'` | `.tint(Color(...))` or `.foregroundColor(...)` | `ColorFilter.tint(Color(...))` |

**Color Format Conversions:**

| Format | Example | SwiftUI | Glance |
|--------|---------|---------|--------|
| #RGB | `#F00` | `Color(red: 1, green: 0, blue: 0)` | `Color(0xFFFF0000)` |
| #ARGB | `#8F00` | `Color(red: 1, green: 0, blue: 0, opacity: 0.53)` | `Color(0x88FF0000)` |
| #RRGGBB | `#3B82F6` | `Color(red: 0.23, green: 0.51, blue: 0.96)` | `Color(0xFF3B82F6)` |
| #AARRGGBB | `#803B82F6` | `Color(red: 0.23, green: 0.51, blue: 0.96, opacity: 0.5)` | `Color(0x803B82F6)` |

### Borders

| React Property | SwiftUI | Glance/Compose |
|----------------|---------|----------------|
| `borderRadius: 12` | `.cornerRadius(12)` | `.cornerRadius(12.dp)` |
| `borderTopLeftRadius: 8` | `.clipShape(RoundedRectangle(...))` | Not directly supported |
| `borderWidth: 2` | `.border(Color.gray, width: 2)` | `.border(...)` |
| `borderColor: '#E5E7EB'` | `.border(Color(...), ...)` | `BorderStroke(2.dp, Color(...))` |

### Shadows

| React Property | SwiftUI | Glance/Compose |
|----------------|---------|----------------|
| `shadowColor: '#000000'` | `.shadow(color: Color.black, ...)` | Not directly supported |
| `shadowOpacity: 0.1` | `.shadow(color: Color.black.opacity(0.1), ...)` | Not supported |
| `shadowRadius: 8` | `.shadow(radius: 8)` | Not supported |
| `shadowOffsetX: 0, shadowOffsetY: 2` | `.shadow(x: 0, y: 2)` | Not supported |
| `elevation: 4` | Not applicable | `elevation = 4.dp` |

---

## Action Mappings

### Deep Link

**React:**
```tsx
action={{ type: 'deeplink', url: 'myapp://home', params: { id: 42 } }}
```

**SwiftUI (iOS):**
```swift
Link(destination: URL(string: "myapp://home?id=42")!) {
  // Content
}
```

**Glance (Android):**
```kotlin
onClick = actionStartActivity(
  Intent(Intent.ACTION_VIEW, Uri.parse("myapp://home?id=42"))
)
```

### Open App

**React:**
```tsx
action={{ type: 'openApp', appId: 'com.example.app' }}
```

**SwiftUI (iOS):**
```swift
Link(destination: URL(string: "myapp://")!) {
  // Content
}
```

**Glance (Android):**
```kotlin
onClick = actionStartActivity<MainActivity>()
```

### Refresh

**React:**
```tsx
action={{ type: 'refresh' }}
```

**SwiftUI (iOS):**
```swift
// Widget automatically refreshes via TimelineProvider
Button(action: {}) {
  // Content
}
```

**Glance (Android):**
```kotlin
onClick = actionRunCallback<RefreshAction>()
```

---

## ResizeMode Mappings

**BrikImage resizeMode:**

| React | SwiftUI | Glance |
|-------|---------|--------|
| `cover` | `.aspectRatio(contentMode: .fill)` | `ContentScale.Crop` |
| `contain` | `.aspectRatio(contentMode: .fit)` | `ContentScale.Fit` |
| `stretch` | `.scaledToFill()` | `ContentScale.FillBounds` |
| `center` | `.scaledToFit()` | `ContentScale.Inside` |

---

## Font Weight Mappings

| React | SwiftUI | Glance/Compose |
|-------|---------|----------------|
| `'100'` | `.ultraLight` | `FontWeight.W100` |
| `'200'` | `.thin` | `FontWeight.W200` |
| `'300'` | `.light` | `FontWeight.W300` |
| `'400'` | `.regular` | `FontWeight.Normal` |
| `'500'` | `.medium` | `FontWeight.Medium` |
| `'600'` | `.semibold` | `FontWeight.W600` |
| `'700'` | `.bold` | `FontWeight.Bold` |
| `'800'` | `.heavy` | `FontWeight.W800` |
| `'900'` | `.black` | `FontWeight.W900` |

---

## Alignment Mappings

### alignItems

| React | SwiftUI | Glance/Compose |
|-------|---------|----------------|
| `flex-start` | `.leading` / `.top` | `Alignment.Start` / `Alignment.Top` |
| `center` | `.center` | `Alignment.CenterVertically` / `Alignment.CenterHorizontally` |
| `flex-end` | `.trailing` / `.bottom` | `Alignment.End` / `Alignment.Bottom` |
| `stretch` | Frame expansion | `Alignment.Fill` |

### justifyContent

| React | SwiftUI | Glance/Compose |
|-------|---------|----------------|
| `flex-start` | Default HStack/VStack | `Arrangement.Start` |
| `center` | Spacer() around content | `Arrangement.Center` |
| `flex-end` | Spacer() before content | `Arrangement.End` |
| `space-between` | Spacer() between items | `Arrangement.SpaceBetween` |
| `space-around` | Padding around each | `Arrangement.SpaceAround` |

---

## Live Activity Mappings

### Activity Attributes

**React:**
```tsx
attributes: {
  static: { orderId: 'string', merchantName: 'string' },
  dynamic: { status: 'string', eta: 'number' }
}
```

**SwiftUI (iOS):**
```swift
struct OrderTrackingAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        let status: String
        let eta: Double
    }

    let orderId: String
    let merchantName: String
}
```

### Activity Type Mappings

| React Type | Swift Type |
|------------|------------|
| `'string'` | `String` |
| `'number'` | `Double` |
| `'boolean'` | `Bool` |
| `'date'` | `Date` |

### Activity Regions

**React:**
```tsx
regions: {
  lockScreen: <BrikView>...</BrikView>,
  dynamicIsland: {
    compact: <BrikProgressBar progress={0.5} />,
    minimal: <BrikText>🍕</BrikText>,
    expanded: <BrikView>...</BrikView>
  }
}
```

**SwiftUI (iOS):**
```swift
ActivityConfiguration(...) {
  // Lock screen content
  VStack { ... }
} dynamicIsland: { context in
  DynamicIsland {
    // Expanded
    DynamicIslandExpandedRegion(.leading) { ... }
  } compactLeading: {
    // Compact leading
    ProgressView(value: 0.5)
  } compactTrailing: {
    // Compact trailing (if any)
  } minimal: {
    // Minimal
    Text("🍕")
  }
}
```

---

## Platform Limitations

### iOS (SwiftUI)

**Not Supported:**
- CSS-like margins (use padding instead)
- Absolute positioning (limited support)
- Complex gradients (linear/radial only)
- Transform/rotate (limited)

### Android (Glance)

**Not Supported:**
- Shadows (no shadow API)
- Complex borders (radius per corner)
- Absolute positioning
- Custom fonts (system fonts only in basic Glance)
- Transform/animations

---

## Type Safety

All mappings are type-checked at compile time:

1. **React → IR**: Babel AST traversal validates component usage
2. **IR Validation**: Zod schemas enforce structure
3. **IR → Platform**: TypeScript generators ensure correct output

This guarantees that valid React code always produces valid native code.

---

## References

- SwiftUI Generator: `packages/brik-target-swiftui/src/index.ts`
- Glance Generator: `packages/brik-target-compose/src/index.ts`
- Style Parser: `packages/brik-compiler/src/style-parser.ts`
- IR Schemas: `packages/brik-schemas/src/index.ts`
