import { Text } from 'react-native';
import { useState } from 'react';
export function MyWidget() {
  const [hello] = useState("Hi");
  return <Text label={hello} />;
}
