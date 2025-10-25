import { NativeModules, Button, View, Text, StyleSheet } from 'react-native';

const { SimpleTestActivityBridge } = NativeModules;

export function TestWidget() {
  const startWidget = async () => {
    try {
      console.log('Starting test widget...');
      const result = await SimpleTestActivityBridge.startTestActivity();
      console.log('✅ Test widget started:', result);
      alert('Test widget started! Check your Lock Screen or Dynamic Island');
    } catch (error) {
      console.error('❌ Failed to start test widget:', error);
      alert(`Failed: ${error}`);
    }
  };

  const updateWidget = async () => {
    try {
      console.log('Updating test widget...');
      await SimpleTestActivityBridge.updateTestActivity('Updated at ' + new Date().toLocaleTimeString());
      console.log('✅ Test widget updated');
      alert('Widget updated!');
    } catch (error) {
      console.error('❌ Failed to update test widget:', error);
      alert(`Failed: ${error}`);
    }
  };

  const endWidget = async () => {
    try {
      console.log('Ending test widget...');
      await SimpleTestActivityBridge.endTestActivity();
      console.log('✅ Test widget ended');
      alert('Widget ended!');
    } catch (error) {
      console.error('❌ Failed to end test widget:', error);
      alert(`Failed: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔵 Static Widget Test</Text>
      <Text style={styles.subtitle}>Home Screen Widget (Works on Simulator!)</Text>

      <Text style={styles.instructions}>
        1. Long-press home screen{'\n'}
        2. Tap "+" icon{'\n'}
        3. Search for "Static Test"{'\n'}
        4. Add widget to home screen{'\n'}
        5. Then use buttons below to update
      </Text>

      <View style={styles.buttonContainer}>
        <Button title="Initialize Widget" onPress={startWidget} />
        <Button title="Update Widget" onPress={updateWidget} />
        <Button title="Clear Widget" onPress={endWidget} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  instructions: {
    fontSize: 13,
    color: '#444',
    marginBottom: 16,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 10,
  },
});
