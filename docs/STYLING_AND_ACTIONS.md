# Styling and Actions Guide

## Custom Styling

Brik supports comprehensive styling with automatic mapping to native platforms (SwiftUI and Glance/Compose).

### Style Categories

#### Layout Styles

```tsx
<BrikView
  style={{
    width: 200,
    height: 100,
    minWidth: 100,
    maxWidth: 300,
    aspectRatio: 16 / 9,
    padding: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    margin: 8,
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  }}
>
  {/* Content */}
</BrikView>
```

#### Typography Styles

```tsx
<BrikText
  style={{
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'System',
    fontStyle: 'italic',
    color: '#1A1A1A',
    textAlign: 'center',
    textTransform: 'uppercase',
    lineHeight: 24,
    letterSpacing: 0.5,
    numberOfLines: 2,
    ellipsizeMode: 'tail',
  }}
>
  Styled Text
</BrikText>
```

#### Color Styles

```tsx
<BrikView
  style={{
    backgroundColor: '#3B82F6',
    opacity: 0.9,
    tintColor: '#FFFFFF', // For images
  }}
>
  {/* Content */}
</BrikView>
```

#### Border Styles

```tsx
<BrikView
  style={{
    borderRadius: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'solid',
  }}
>
  {/* Content */}
</BrikView>
```

#### Shadow Styles

```tsx
<BrikView
  style={{
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffsetX: 0,
    shadowOffsetY: 2,
    elevation: 4, // Android-specific
  }}
>
  {/* Content */}
</BrikView>
```

### Color Formats

Brik supports multiple color formats with automatic conversion:

- Hex: `#RGB`, `#ARGB`, `#RRGGBB`, `#AARRGGBB`
- Examples: `#FFF`, `#FF000000`, `#3B82F6`, `#FF3B82F6`

Platform mapping:

- iOS: Converted to `Color(.sRGB, red:, green:, blue:, opacity:)`
- Android: Converted to `Color(0xAARRGGBB)`

## Actions and Deep Linking

### Action Types

#### Deep Link

Open a specific screen or URL in your app:

```tsx
<BrikButton
  label="View Details"
  action={{
    type: 'deeplink',
    url: 'myapp://details/42',
    params: {
      itemId: 42,
      source: 'widget',
    },
  }}
/>
```

#### Open App

Launch your app (Android-specific):

```tsx
<BrikButton
  label="Launch App"
  action={{
    type: 'openApp',
    appId: 'com.example.myapp',
  }}
/>
```

#### Refresh

Trigger widget refresh:

```tsx
<BrikButton
  label="Refresh Data"
  action={{
    type: 'refresh',
  }}
/>
```

#### Custom

Custom action handler:

```tsx
<BrikButton
  label="Custom Action"
  action={{
    type: 'custom',
    params: {
      action: 'sync',
      force: true,
    },
  }}
/>
```

### Actions on Any Component

Actions can be applied to any Brik component:

```tsx
// Clickable text
<BrikText
  action={{ type: 'deeplink', url: 'myapp://profile' }}
  style={{ color: '#3B82F6' }}
>
  View Profile
</BrikText>

// Clickable image
<BrikImage
  uri="https://example.com/photo.jpg"
  action={{ type: 'deeplink', url: 'myapp://photo/123' }}
  style={{ width: 100, height: 100 }}
/>

// Clickable container
<BrikView
  action={{ type: 'deeplink', url: 'myapp://settings' }}
  style={{ padding: 16, backgroundColor: '#F3F4F6' }}
>
  <BrikText>Tap anywhere to open settings</BrikText>
</BrikView>
```

### Platform Generation

#### iOS (SwiftUI)

Actions generate:

- `Link(destination: URL(...))` for clickable elements
- `widgetURL(...)` for widget-level actions
- URL scheme handling for deep links

```swift
// Generated SwiftUI
Link(destination: URL(string: "myapp://details/42")!) {
    Text("View Details")
}
```

#### Android (Glance)

Actions generate:

- `actionStartActivity<MainActivity>()` for deep links
- `actionRunCallback<RefreshAction>()` for refresh
- Intent extras for parameters

```kotlin
// Generated Glance
Button(
    text = "View Details",
    onClick = actionStartActivity<MainActivity>(),
    modifier = GlanceModifier
)
```

## New Components

### BrikSpacer

Flexible spacing between elements:

```tsx
<BrikStack axis="horizontal">
  <BrikText>Left</BrikText>
  <BrikSpacer flex={1} />
  <BrikText>Right</BrikText>
</BrikStack>
```

### BrikProgressBar

Progress indicators:

```tsx
// Determinate
<BrikProgressBar
  progress={0.75}
  style={{ height: 8 }}
/>

// Indeterminate
<BrikProgressBar
  indeterminate
  style={{ height: 8 }}
/>
```

### BrikList

Scrollable lists (simplified):

```tsx
<BrikList
  items={[1, 2, 3, 4, 5]}
  renderItem={(item, index) => <BrikText key={index}>Item {item}</BrikText>}
  horizontal={false}
/>
```

## Complete Example

```tsx
import {
  BrikView,
  BrikText,
  BrikButton,
  BrikImage,
  BrikStack,
  BrikProgressBar,
  BrikSpacer,
} from '@brik/react-native';

/** @brik */
export function MyWidget() {
  return (
    <BrikView
      style={{
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
      }}
    >
      <BrikStack axis="horizontal" style={{ gap: 12, marginBottom: 12 }}>
        <BrikImage
          uri="https://picsum.photos/60"
          style={{ width: 60, height: 60, borderRadius: 30 }}
          action={{ type: 'deeplink', url: 'myapp://profile' }}
        />
        <BrikStack axis="vertical" style={{ flex: 1, gap: 4 }}>
          <BrikText style={{ fontSize: 18, fontWeight: '700', color: '#1A1A1A' }}>
            Welcome Back!
          </BrikText>
          <BrikText style={{ fontSize: 14, color: '#6B7280' }}>Your daily progress</BrikText>
        </BrikStack>
      </BrikStack>

      <BrikProgressBar progress={0.65} style={{ height: 8, marginBottom: 8 }} />

      <BrikText style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>65% Complete</BrikText>

      <BrikButton
        label="Open App"
        action={{
          type: 'deeplink',
          url: 'myapp://home',
          params: { source: 'widget' },
        }}
        style={{
          backgroundColor: '#3B82F6',
          padding: 12,
          borderRadius: 8,
        }}
      />
    </BrikView>
  );
}
```

## Widget Configuration

Mark your component for widget generation:

```tsx
/** @brik */
export function MyWidget() {
  // Component code
}
```

Build with widget flag:

```bash
pnpm brik build --platform all --as-widget
```

This will:

- Generate Glance widgets for Android
- Generate WidgetKit extensions for iOS
- Set up proper deep link handling
- Configure widget providers and receivers
