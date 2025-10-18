import { BrikButton, BrikImage, BrikStack, BrikText, BrikView } from '@brik/react-native';
import React from 'react';

export function SimpleTest() {
  return (
    <BrikStack axis="vertical" style={{ gap: 12, padding: 16 }}>
      <BrikText style={{ fontSize: 24, fontWeight: '700' }}>Hello</BrikText>
      <BrikImage
        uri="https://picsum.photos/200"
        style={{ width: 200, height: 120, borderRadius: 12 }}
      />
      <BrikView style={{ backgroundColor: '#eef', padding: 12, borderRadius: 8 }}>
        <BrikText numberOfLines={2}>Write once in JSX, run native as SwiftUI & Compose.</BrikText>
      </BrikView>
      <BrikButton
        label="Press me"
        action={{ type: 'deeplink', url: 'myapp://test' }}
        style={{ backgroundColor: '#10B981', padding: 12, borderRadius: 8 }}
      />
    </BrikStack>
  );
}
