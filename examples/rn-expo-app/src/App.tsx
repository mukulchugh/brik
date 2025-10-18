import React from 'react';
import { SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { SimpleTest } from './SimpleTest';
import { WidgetDemo } from './WidgetDemo';

export default function App() {
  return (
    <SafeAreaView>
      <StatusBar />
      <ScrollView style={{ flex: 1 }}>
        <SimpleTest />
        <WidgetDemo />
      </ScrollView>
    </SafeAreaView>
  );
}
