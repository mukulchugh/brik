/**
 * Example: Using Brik Widget Manager in React Native
 *
 * This example shows how to update home screen widgets from React Native.
 * Works on both iOS (WidgetKit) and Android (Jetpack Glance).
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { widgetManager, useWidgetManager } from '@brik/react-native';

// Example 1: Weather Widget with Hook
export function WeatherWidgetExample() {
  const { updateWidget, clearWidget, isUpdating } = useWidgetManager('WeatherWidget');
  const [weatherData, setWeatherData] = useState({
    temperature: 72,
    condition: 'Sunny',
    location: 'San Francisco',
    humidity: 65,
    windSpeed: 10
  });

  const handleUpdateWidget = async () => {
    try {
      await updateWidget(weatherData);
      Alert.alert('Success', 'Widget updated successfully!');
    } catch (error) {
      Alert.alert('Error', `Failed to update widget: ${error.message}`);
    }
  };

  const handleClearWidget = async () => {
    try {
      await clearWidget();
      Alert.alert('Success', 'Widget data cleared');
    } catch (error) {
      Alert.alert('Error', `Failed to clear widget: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather Widget Example</Text>

      <View style={styles.dataContainer}>
        <Text style={styles.label}>Temperature: {weatherData.temperature}°F</Text>
        <Text style={styles.label}>Condition: {weatherData.condition}</Text>
        <Text style={styles.label}>Location: {weatherData.location}</Text>
      </View>

      <Button
        title="Update Widget"
        onPress={handleUpdateWidget}
        disabled={isUpdating}
      />

      <View style={styles.spacer} />

      <Button
        title="Clear Widget"
        onPress={handleClearWidget}
        disabled={isUpdating}
        color="#ff6347"
      />

      {isUpdating && (
        <ActivityIndicator style={styles.loader} size="small" />
      )}
    </View>
  );
}

// Example 2: Multiple Widgets
export function MultipleWidgetsExample() {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateAllWidgets = async () => {
    setIsUpdating(true);
    try {
      await widgetManager.updateMultiple({
        'WeatherWidget': {
          temperature: 72,
          condition: 'Sunny',
          location: 'San Francisco'
        },
        'CalendarWidget': {
          events: [
            { title: 'Meeting', time: '10:00 AM' },
            { title: 'Lunch', time: '12:00 PM' }
          ],
          date: new Date().toISOString()
        },
        'StatsWidget': {
          steps: 10000,
          calories: 500,
          distance: 5.2
        }
      });

      Alert.alert('Success', 'All widgets updated!');
    } catch (error) {
      Alert.alert('Error', `Failed to update widgets: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Multiple Widgets Example</Text>

      <Button
        title="Update All Widgets"
        onPress={updateAllWidgets}
        disabled={isUpdating}
      />

      {isUpdating && (
        <ActivityIndicator style={styles.loader} size="small" />
      )}
    </View>
  );
}

// Example 3: Real-time Data Widget
export function RealTimeDataWidget() {
  const { updateWidget, isUpdating } = useWidgetManager('StatsWidget');
  const [stats, setStats] = useState({
    steps: 0,
    calories: 0,
    distance: 0
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        steps: prev.steps + Math.floor(Math.random() * 10),
        calories: prev.calories + Math.floor(Math.random() * 5),
        distance: prev.distance + (Math.random() * 0.1)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Auto-update widget when data changes
  useEffect(() => {
    if (stats.steps > 0) {
      updateWidget(stats).catch(console.error);
    }
  }, [stats.steps]); // Update every 10 steps

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Real-time Stats Widget</Text>

      <View style={styles.dataContainer}>
        <Text style={styles.stat}>Steps: {stats.steps}</Text>
        <Text style={styles.stat}>Calories: {stats.calories}</Text>
        <Text style={styles.stat}>Distance: {stats.distance.toFixed(2)} miles</Text>
      </View>

      <Text style={styles.info}>
        Widget auto-updates every 10 steps
      </Text>

      {isUpdating && (
        <Text style={styles.updateIndicator}>Updating widget...</Text>
      )}
    </View>
  );
}

// Example 4: Widget Platform Check
export function WidgetPlatformCheck() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [appGroupId, setAppGroupId] = useState<string | null>(null);

  useEffect(() => {
    checkSupport();
  }, []);

  const checkSupport = async () => {
    const isSupported = await widgetManager.areWidgetsSupported();
    const groupId = await widgetManager.getAppGroupIdentifier();

    setSupported(isSupported);
    setAppGroupId(groupId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Widget Platform Info</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Platform: {Platform.OS}</Text>
        <Text style={styles.label}>
          Widgets Supported: {supported === null ? 'Checking...' : supported ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.label}>
          Storage: {appGroupId || 'Not available'}
        </Text>
      </View>

      {!supported && supported !== null && (
        <Text style={styles.warning}>
          Widgets are not supported on this device
        </Text>
      )}
    </View>
  );
}

// Main Example Component
export function WidgetExamples() {
  return (
    <ScrollView style={styles.scrollView}>
      <Text style={styles.header}>Brik Widget Examples</Text>

      <WeatherWidgetExample />
      <MultipleWidgetsExample />
      <RealTimeDataWidget />
      <WidgetPlatformCheck />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          See WIDGET_SETUP_GUIDE.md for setup instructions
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333'
  },
  container: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  dataContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666'
  },
  stat: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500'
  },
  info: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8
  },
  updateIndicator: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 8,
    textAlign: 'center'
  },
  spacer: {
    height: 8
  },
  loader: {
    marginTop: 12
  },
  infoBox: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12
  },
  warning: {
    color: '#ff6347',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500'
  },
  footer: {
    padding: 20,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center'
  }
});

export default WidgetExamples;
