import { BrikProgressBar, BrikStack, BrikText, BrikView } from '@brik/react-native';
import React from 'react';

/**
 * Live Activity Example - Order Tracking
 * This demonstrates a Live Activity that would appear on lock screen and Dynamic Island
 */

/** @brik-activity */
export function OrderTrackingActivity() {
  return {
    activityType: 'OrderTracking',
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
    regions: {
      // Lock Screen View
      lockScreen: (
        <BrikView
          style={{
            padding: 16,
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
          }}
        >
          <BrikStack axis="horizontal" style={{ gap: 12, marginBottom: 12 }}>
            <BrikView
              style={{
                width: 50,
                height: 50,
                backgroundColor: '#3B82F6',
                borderRadius: 25,
              }}
            >
              <BrikText
                style={{
                  fontSize: 24,
                  color: '#FFFFFF',
                  textAlign: 'center',
                }}
              >
                🍕
              </BrikText>
            </BrikView>
            <BrikStack axis="vertical" style={{ flex: 1, gap: 4 }}>
              <BrikText style={{ fontSize: 16, fontWeight: '700' }}>Order #12345</BrikText>
              <BrikText style={{ fontSize: 14, color: '#6B7280' }}>From Acme Pizza</BrikText>
            </BrikStack>
          </BrikStack>

          <BrikProgressBar
            progress={0.65}
            style={{ height: 8, marginBottom: 8, borderRadius: 4 }}
          />

          <BrikStack axis="horizontal" style={{ gap: 8 }}>
            <BrikText style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>
              Delivering
            </BrikText>
            <BrikText style={{ fontSize: 14, color: '#6B7280' }}>• ETA: 15 min</BrikText>
          </BrikStack>
        </BrikView>
      ),

      // Dynamic Island Views
      dynamicIsland: {
        // Compact - Small pill on top
        compact: (
          <BrikStack axis="horizontal" style={{ gap: 4 }}>
            <BrikText style={{ fontSize: 12 }}>🍕</BrikText>
            <BrikProgressBar progress={0.65} style={{ height: 4, width: 30 }} />
          </BrikStack>
        ),

        // Minimal - Smallest state
        minimal: <BrikText style={{ fontSize: 10 }}>🍕</BrikText>,

        // Expanded - Full Dynamic Island
        expanded: (
          <BrikView style={{ padding: 12 }}>
            <BrikStack axis="horizontal" style={{ gap: 12, marginBottom: 8 }}>
              <BrikText style={{ fontSize: 18 }}>🍕</BrikText>
              <BrikStack axis="vertical" style={{ flex: 1 }}>
                <BrikText style={{ fontSize: 14, fontWeight: '700' }}>Order #12345</BrikText>
                <BrikText style={{ fontSize: 12, color: '#6B7280' }}>Acme Pizza</BrikText>
              </BrikStack>
            </BrikStack>

            <BrikProgressBar
              progress={0.65}
              style={{ height: 6, marginBottom: 6, borderRadius: 3 }}
            />

            <BrikStack axis="horizontal" style={{ gap: 8 }}>
              <BrikText style={{ fontSize: 12, fontWeight: '500' }}>Delivering</BrikText>
              <BrikText style={{ fontSize: 12, color: '#6B7280' }}>• ETA: 15 min</BrikText>
            </BrikStack>
          </BrikView>
        ),
      },
    },
  };
}

/**
 * Usage Example:
 *
 * import { Brik } from '@brik/react-native/live-activities';
 *
 * // Start activity
 * const activity = await Brik.startActivity({
 *   activityType: 'OrderTracking',
 *   attributes: {
 *     static: { orderId: '12345', merchantName: 'Acme Pizza', itemCount: 3 },
 *     dynamic: { status: 'preparing', eta: 20, progress: 0.2 }
 *   }
 * });
 *
 * // Update activity
 * await Brik.updateActivity(activity.id, {
 *   dynamic: { status: 'delivering', eta: 15, progress: 0.65 }
 * });
 *
 * // End activity
 * await Brik.endActivity(activity.id);
 */
