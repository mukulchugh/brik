import { BrikButton, BrikImage, BrikStack, BrikText, BrikView } from '@brik/react-native';
import React from 'react';

export function WidgetDemo() {
  return (
    <BrikStack
      axis="vertical"
      style={{ gap: 8, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 12 }}
    >
      <BrikText style={{ fontSize: 18, fontWeight: '700' }}>📱 Widget Demo</BrikText>

      <BrikView style={{ backgroundColor: '#e3f2fd', padding: 8, borderRadius: 8 }}>
        <BrikText style={{ fontSize: 14, color: '#1976d2' }}>
          This component can be used as a homescreen widget!
        </BrikText>
      </BrikView>

      <BrikImage
        uri="https://picsum.photos/150/100"
        style={{ width: 150, height: 100, borderRadius: 8 }}
      />

      <BrikStack axis="horizontal" style={{ gap: 8 }}>
        <BrikView style={{ backgroundColor: '#4caf50', padding: 6, borderRadius: 6 }}>
          <BrikText style={{ color: 'white', fontSize: 12 }}>✅ Active</BrikText>
        </BrikView>
        <BrikView style={{ backgroundColor: '#ff9800', padding: 6, borderRadius: 6 }}>
          <BrikText style={{ color: 'white', fontSize: 12 }}>⚡ Fast</BrikText>
        </BrikView>
      </BrikStack>

      <BrikButton label="Tap Widget" />
    </BrikStack>
  );
}
