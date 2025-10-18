import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, Text, View } from 'react-native';
import { AdvancedDemo } from './AdvancedDemo';
import { BrikDemo } from './BrikDemo';
import { SimpleTest } from './SimpleTest';
import { WidgetDemo } from './WidgetDemo';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar />
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
            Brik Widget Examples
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 24, color: '#666' }}>
            Preview widgets in development. Run `pnpm build:native --as-widget` to generate native
            code.
          </Text>
        </View>

        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Advanced Demo</Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
            Full-featured widget with actions, styling, and progress bars
          </Text>
          <AdvancedDemo />
        </View>

        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Brik Demo</Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
            Basic widget example
          </Text>
          <BrikDemo />
        </View>

        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Widget Demo</Text>
          <WidgetDemo />
        </View>

        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Simple Test</Text>
          <SimpleTest />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
