import { BrikButton, BrikImage, BrikStack, BrikText } from '@brik/react-native';
import React from 'react';

export function SimpleTest() {
  return (
    <BrikStack axis="vertical" style={{ gap: 12, padding: 16 }}>
      <BrikText style={{ fontSize: 24 }}>Hello</BrikText>
      <BrikImage uri="https://picsum.photos/200" style={{ width: 200, height: 120, borderRadius: 12 }} />
      <BrikButton label="Press me" onPress={() => console.log('pressed')} />
    </BrikStack>
  );
}
