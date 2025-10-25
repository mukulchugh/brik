import { View, ScrollView, StyleSheet } from 'react-native';
import { BrikDemoApp } from '@brik/example-shared';
import { TestWidget } from './TestWidget';

export default function App() {
  return (
    <ScrollView style={styles.container}>
      <TestWidget />
      <BrikDemoApp title="Brik Expo" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
