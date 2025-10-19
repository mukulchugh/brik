import React from 'react';
import {
  BrikView,
  BrikText,
  BrikStack,
  BrikImage,
  BrikSpacer,
  BrikButton,
} from '@brik/react-native';

/**
 * A simple weather widget to demonstrate hot reload
 * @brik-widget
 */
export function WeatherWidget() {
  return (
    <BrikView
      style={{
        padding: 16,
        backgroundColor: '#4A90E2',
        borderRadius: 12,
      }}
    >
      <BrikStack axis="horizontal">
        <BrikView>
          <BrikText
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: '#FFFFFF',
            }}
          >
            San Francisco
          </BrikText>
          <BrikText
            style={{
              fontSize: 14,
              color: '#E0E0E0',
            }}
          >
            Partly Cloudy
          </BrikText>
        </BrikView>

        <BrikSpacer />

        <BrikView>
          <BrikText
            style={{
              fontSize: 48,
              fontWeight: '300',
              color: '#FFFFFF',
            }}
          >
            72°
          </BrikText>
        </BrikView>
      </BrikStack>

      <BrikView style={{ marginTop: 16 }}>
        <BrikStack axis="horizontal">
          <BrikView style={{ alignItems: 'center', flex: 1 }}>
            <BrikText style={{ color: '#FFFFFF', fontSize: 12 }}>Mon</BrikText>
            <BrikText style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>68°</BrikText>
          </BrikView>
          <BrikView style={{ alignItems: 'center', flex: 1 }}>
            <BrikText style={{ color: '#FFFFFF', fontSize: 12 }}>Tue</BrikText>
            <BrikText style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>70°</BrikText>
          </BrikView>
          <BrikView style={{ alignItems: 'center', flex: 1 }}>
            <BrikText style={{ color: '#FFFFFF', fontSize: 12 }}>Wed</BrikText>
            <BrikText style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>75°</BrikText>
          </BrikView>
          <BrikView style={{ alignItems: 'center', flex: 1 }}>
            <BrikText style={{ color: '#FFFFFF', fontSize: 12 }}>Thu</BrikText>
            <BrikText style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>73°</BrikText>
          </BrikView>
        </BrikStack>
      </BrikView>

      <BrikButton
        label="Refresh"
        action={{ type: 'deeplink', url: 'brikapp://refresh-weather' }}
        style={{
          marginTop: 12,
          padding: 8,
          backgroundColor: '#FFFFFF20',
          borderRadius: 6,
        }}
      />
    </BrikView>
  );
}