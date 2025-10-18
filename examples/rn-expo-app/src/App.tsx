import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { BrikDemo } from './BrikDemo';

export default function App() {
  return (
    <SafeAreaView>
      <StatusBar />
      <BrikDemo />
    </SafeAreaView>
  );
}
