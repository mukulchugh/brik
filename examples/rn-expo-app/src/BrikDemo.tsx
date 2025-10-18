import { BrikButton, BrikImage, BrikStack, BrikText, BrikView } from '@brik/react-native';
import React from 'react';

export function BrikDemo() {
  return (
    <BrikStack axis="column" style={{ gap: 12, padding: 16 }}>
      <BrikText style={{ fontSize: 24, fontWeight: '700' }}>Brik 👋</BrikText>
      <BrikImage
        uri="https://picsum.photos/200"
        style={{ width: 200, height: 120, borderRadius: 12 }}
      />
      <BrikView style={{ backgroundColor: '#eef', padding: 12, borderRadius: 8 }}>
        <BrikText numberOfLines={2}>Write once in JSX, run native as SwiftUI & Compose.</BrikText>
      </BrikView>
      <BrikButton
        label="Press me"
        action={{ type: 'deeplink', url: 'myapp://demo' }}
        style={{ backgroundColor: '#3B82F6', padding: 12, borderRadius: 8 }}
      />
    </BrikStack>
  );
}
