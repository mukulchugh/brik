/**
 * Brik Expo App - Comprehensive Demo of Live Activities and Widgets
 * Tests all v0.3.0 features including error handling, performance monitoring, and storage
 */

import {Brik, performanceMonitor, widgetStorage, errorHandler, useBrikHotReload} from '@brik/react-native';
import React, {useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function App(): React.JSX.Element {
  const [activityId, setActivityId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Ready');

  // Enable hot reload for widgets in development
  useBrikHotReload({
    enabled: __DEV__,
    onReload: () => console.log('[Brik] Widgets reloaded!'),
    onError: (error) => console.error('[Brik] Hot reload error:', error)
  });

  // Set up error handler
  React.useEffect(() => {
    const unsubscribe = errorHandler.onError(error => {
      console.log('[Brik Error]', error.getFormattedMessage());
      Alert.alert('Brik Error', error.message);
    });

    return unsubscribe;
  }, []);

  const startActivity = async () => {
    try {
      performanceMonitor.startTimer('activity.start');
      setStatus('Starting activity...');

      const activity = await Brik.startActivity({
        activityType: 'OrderTracking',
        attributes: {
          static: {
            orderId: '12345',
            merchant: 'Coffee Shop',
          },
          dynamic: {
            status: 'preparing',
            eta: 15,
          },
        },
      });

      const duration = performanceMonitor.endTimer('activity.start');
      console.log(`Activity started in ${duration}ms`);

      setActivityId(activity.id);
      setStatus(`Activity started: ${activity.id}`);

      // Save activity info to storage
      await widgetStorage.save('lastActivity', {
        id: activity.id,
        startedAt: Date.now(),
      });
    } catch (error) {
      setStatus(`Error: ${error}`);
      console.error('Failed to start activity:', error);
    }
  };

  const updateActivity = async () => {
    if (!activityId) {
      Alert.alert('No Activity', 'Start an activity first');
      return;
    }

    try {
      setStatus('Updating activity...');

      await Brik.updateActivity(activityId, {
        dynamic: {
          status: 'delivering',
          eta: 5,
        },
      });

      setStatus('Activity updated');
    } catch (error) {
      setStatus(`Error: ${error}`);
      console.error('Failed to update activity:', error);
    }
  };

  const endActivity = async () => {
    if (!activityId) {
      Alert.alert('No Activity', 'Start an activity first');
      return;
    }

    try {
      setStatus('Ending activity...');

      await Brik.endActivity(activityId, 'default');

      setStatus('Activity ended');
      setActivityId(null);
    } catch (error) {
      setStatus(`Error: ${error}`);
      console.error('Failed to end activity:', error);
    }
  };

  const showPerformanceStats = () => {
    const stats = performanceMonitor.getStats('activity.start');
    if (stats) {
      const statsText = `
Performance Stats:
- Count: ${stats.count}
- Average: ${stats.avg.toFixed(2)}ms
- Min: ${stats.min}ms
- Max: ${stats.max}ms
- P50: ${stats.p50}ms
- P95: ${stats.p95}ms
- P99: ${stats.p99}ms
      `.trim();
      Alert.alert('Performance Stats', statsText);
    } else {
      Alert.alert('No Stats', 'Start an activity first to see stats');
    }
  };

  const checkStorage = async () => {
    const lastActivity = await widgetStorage.load('lastActivity');
    if (lastActivity) {
      Alert.alert(
        'Last Activity',
        `ID: ${lastActivity.id}\nStarted: ${new Date(
          lastActivity.startedAt,
        ).toLocaleString()}`,
      );
    } else {
      Alert.alert('No Data', 'No previous activity found');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <Text style={styles.title}>🧱 Brik Expo App</Text>
          <Text style={styles.subtitle}>Live Activities & Widgets Demo</Text>
          <Text style={styles.version}>v0.3.0</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={styles.statusText}>{status}</Text>
          {activityId && (
            <Text style={styles.activityId}>ID: {activityId}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Activities</Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={startActivity}>
            <Text style={styles.buttonText}>Start Activity</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonSecondary,
              !activityId && styles.buttonDisabled,
            ]}
            onPress={updateActivity}
            disabled={!activityId}>
            <Text style={styles.buttonText}>Update Activity</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonDanger,
              !activityId && styles.buttonDisabled,
            ]}
            onPress={endActivity}
            disabled={!activityId}>
            <Text style={styles.buttonText}>End Activity</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>v0.3.0 Features</Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonInfo]}
            onPress={showPerformanceStats}>
            <Text style={styles.buttonText}>Performance Stats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonInfo]}
            onPress={checkStorage}>
            <Text style={styles.buttonText}>Check Storage</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hot Reload Status</Text>
          <Text style={styles.hotReloadText}>
            {__DEV__ ? '🔥 Hot reload enabled' : '❄️ Production mode'}
          </Text>
          <Text style={styles.infoText}>
            Edit widget files and save to see changes instantly!
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Testing: Error Handling, Performance Monitoring, Widget Storage, Hot Reload
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6366f1',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  version: {
    fontSize: 12,
    color: 'white',
    opacity: 0.7,
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activityId: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#10b981',
  },
  buttonSecondary: {
    backgroundColor: '#6366f1',
  },
  buttonDanger: {
    backgroundColor: '#ef4444',
  },
  buttonInfo: {
    backgroundColor: '#3b82f6',
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  hotReloadText: {
    fontSize: 16,
    color: '#27AE60',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
  },
});