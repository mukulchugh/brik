# Live Activities Guide

## Overview

Live Activities enable real-time, glanceable updates on the lock screen and Dynamic Island. Perfect for order tracking, ride sharing, sports scores, timers, and more.

## Requirements

- iOS 16.1+ (Live Activities)
- iOS 16.2+ (Dynamic Island on iPhone 14 Pro+)
- Android: Not yet supported (schema ready for future implementation)

## Creating a Live Activity

### 1. Define Activity Component

```tsx
import { BrikView, BrikText, BrikProgressBar, BrikStack } from '@brik/react-native';

/** @brik-activity */
export function OrderTrackingActivity() {
  return {
    activityType: 'OrderTracking',

    // Attribute types
    attributes: {
      static: {
        orderId: 'string',
        merchantName: 'string',
        itemCount: 'number',
      },
      dynamic: {
        status: 'string',
        eta: 'number',
        progress: 'number',
      },
    },

    // UI Regions
    regions: {
      // Lock Screen / Banner
      lockScreen: (
        <BrikView style={{ padding: 16, backgroundColor: '#FFF', borderRadius: 16 }}>
          <BrikText style={{ fontSize: 16, fontWeight: '700' }}>Order #{orderId}</BrikText>
          <BrikProgressBar progress={progress} />
          <BrikText style={{ fontSize: 14 }}>
            {status} • ETA: {eta} min
          </BrikText>
        </BrikView>
      ),

      // Dynamic Island
      dynamicIsland: {
        // Compact - Small pill
        compact: (
          <BrikStack axis="horizontal" style={{ gap: 4 }}>
            <BrikText>🍕</BrikText>
            <BrikProgressBar progress={progress} style={{ width: 30 }} />
          </BrikStack>
        ),

        // Minimal - Tiny indicator
        minimal: <BrikText>🍕</BrikText>,

        // Expanded - Full island
        expanded: (
          <BrikView style={{ padding: 12 }}>
            <BrikText style={{ fontSize: 14, fontWeight: '700' }}>Order #{orderId}</BrikText>
            <BrikProgressBar progress={progress} />
            <BrikText>
              {status} • {eta} min
            </BrikText>
          </BrikView>
        ),
      },
    },
  };
}
```

### 2. Build Activity Code

```bash
pnpm brik build --platform ios --as-activity
```

This generates:

- `ios/BrikActivities/OrderTrackingActivity.swift`
- Activity attributes struct
- Lock screen view
- Dynamic Island views

### 3. Start Activity from JavaScript

```tsx
import { Brik } from '@brik/react-native';
import React from 'react';
import { Button } from 'react-native';

export function OrderScreen({ orderId }) {
  const startTracking = async () => {
    const activity = await Brik.startActivity({
      activityType: 'OrderTracking',
      attributes: {
        static: {
          orderId: '12345',
          merchantName: 'Acme Pizza',
          itemCount: 3,
        },
        dynamic: {
          status: 'preparing',
          eta: 20,
          progress: 0.2,
        },
      },
      staleDate: new Date(Date.now() + 3600000), // 1 hour
      relevanceScore: 1.0,
    });

    console.log('Activity started:', activity.id);

    // Save activity ID for updates
    setActivityId(activity.id);
  };

  const updateTracking = async (activityId: string) => {
    await Brik.updateActivity(activityId, {
      dynamic: {
        status: 'delivering',
        eta: 15,
        progress: 0.65,
      },
    });
  };

  const completeOrder = async (activityId: string) => {
    await Brik.endActivity(activityId, 'immediate');
  };

  return (
    <>
      <Button title="Start Tracking" onPress={startTracking} />
      <Button title="Update Status" onPress={() => updateTracking(activityId)} />
      <Button title="Complete" onPress={() => completeOrder(activityId)} />
    </>
  );
}
```

## Activity Lifecycle

### Start

```ts
const activity = await Brik.startActivity({
  activityType: 'OrderTracking',
  attributes: { static: {...}, dynamic: {...} }
});
```

### Update

```ts
await Brik.updateActivity(activity.id, {
  dynamic: { status: 'updated', progress: 0.8 },
});
```

### End

```ts
await Brik.endActivity(activity.id);
```

## Dynamic Island Regions

### Compact

- Small pill next to notch
- Limited space (~44pt height)
- Show icon + minimal info

### Minimal

- Single icon or text
- Used when multiple activities active
- ~20pt circular area

### Expanded

- Full Dynamic Island takeover
- User long-presses compact view
- Rich content with actions

## Attribute Types

### Static Attributes

- Set once when activity starts
- Cannot be updated
- Examples: orderId, userName, itemName

### Dynamic Attributes

- Can be updated multiple times
- Trigger UI refresh
- Examples: status, progress, eta, score

## Best Practices

### 1. Keep Content Minimal

```tsx
// ✅ Good - Concise
<BrikText>Delivering • 15 min</BrikText>

// ❌ Too much text
<BrikText>Your order is currently being delivered by our driver and should arrive in approximately 15 minutes</BrikText>
```

### 2. Use Progress Indicators

```tsx
<BrikProgressBar progress={0.65} />
```

### 3. Appropriate Stale Dates

```ts
// ✅ Good - Relevant duration
staleDate: new Date(Date.now() + 3600000); // 1 hour for delivery

// ❌ Too long
staleDate: new Date(Date.now() + 86400000 * 7); // 7 days
```

### 4. Relevance Scores

```ts
// High priority (active delivery)
relevanceScore: 1.0;

// Medium priority (upcoming event)
relevanceScore: 0.5;

// Low priority (background task)
relevanceScore: 0.1;
```

## Platform Generation

### iOS (ActivityKit)

**Generated ActivityAttributes:**

```swift
struct OrderTrackingAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        let status: String
        let eta: Int
        let progress: Double
    }

    let orderId: String
    let merchantName: String
    let itemCount: Int
}
```

**Generated Activity Widget:**

```swift
struct OrderTrackingActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: OrderTrackingAttributes.self) { context in
            // Lock screen view (from IR)
            VStack {
                Text("Order #\\(context.attributes.orderId)")
                ProgressView(value: context.state.progress)
                Text("\\(context.state.status) • ETA: \\(context.state.eta) min")
            }
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded regions
            } compactLeading: {
                Text("🍕")
            } compactTrailing: {
                ProgressView(value: context.state.progress)
            } minimal: {
                Text("🍕")
            }
        }
    }
}
```

### Android (Future)

Android doesn't have Live Activities equivalent yet, but similar functionality could be achieved with:

- Ongoing notifications with progress
- Picture-in-Picture overlays
- Custom notification layouts

## Server Push Updates

### APNs Push Payload

```json
{
  "aps": {
    "timestamp": 1234567890,
    "event": "update",
    "content-state": {
      "status": "delivering",
      "eta": 10,
      "progress": 0.85
    }
  }
}
```

### Server SDK (Coming in Phase 5)

```ts
import { BrikServer } from '@brik/server';

const brik = new BrikServer({
  apnsKeyId: '...',
  apnsTeamId: '...',
  apnsKey: '...',
});

await brik.updateActivity(activityToken, {
  dynamic: { status: 'delivering', eta: 10, progress: 0.85 },
});
```

## Limitations (v0.1.0)

### Not Yet Implemented

- ❌ Native module bridge for start/update/end
- ❌ APNs push integration
- ❌ Activity state persistence
- ❌ Android support
- ❌ Actions in activity views

### Coming in Phase 4 (v0.2.0)

- ✅ Complete native module
- ✅ Activity state management
- ✅ Push token handling
- ✅ Full code generation from IR

### Coming in Phase 5 (v0.3.0)

- ✅ Server push infrastructure
- ✅ APNs/FCM integration
- ✅ @brik/server package
- ✅ Real-time updates

## Examples

See `examples/rn-expo-app/src/LiveActivityDemo.tsx` for complete working example.

## Learn More

- [Apple: ActivityKit Documentation](https://developer.apple.com/documentation/activitykit)
- [WWDC: Meet ActivityKit](https://developer.apple.com/videos/play/wwdc2022/10184/)
- [Human Interface Guidelines: Live Activities](https://developer.apple.com/design/human-interface-guidelines/live-activities)
