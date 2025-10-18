import { Brik, type Activity } from '@brik/react-native';
import React, { useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Live Activity Screen
 * Demonstrates starting, updating, and ending Live Activities
 */
export function LiveActivityScreen() {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [progress, setProgress] = useState(0.2);
  const [eta, setEta] = useState(20);
  const [status, setStatus] = useState('preparing');
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  React.useEffect(() => {
    // Check if Live Activities are supported
    Brik.areActivitiesSupported().then(setIsSupported).catch(() => setIsSupported(false));
  }, []);

  const handleStartActivity = async () => {
    try {
      const newActivity = await Brik.startActivity({
        activityType: 'OrderTracking',
        attributes: {
          static: {
            orderId: '12345',
            merchantName: 'Acme Pizza',
            itemCount: 3,
          },
          dynamic: {
            status: 'preparing',
            eta: 20,
            progress: 0.2,
          },
        },
        staleDate: new Date(Date.now() + 3600000), // 1 hour
        relevanceScore: 1.0,
      });

      setActivity(newActivity);
      Alert.alert('Success', `Activity started: ${newActivity.id}`);
    } catch (error) {
      Alert.alert('Error', `Failed to start activity: ${error}`);
    }
  };

  const handleUpdateActivity = async () => {
    if (!activity) {
      Alert.alert('Error', 'No active activity');
      return;
    }

    try {
      const newProgress = Math.min(progress + 0.2, 1.0);
      const newEta = Math.max(eta - 5, 0);
      const newStatus = newProgress < 0.5 ? 'preparing' : newProgress < 0.8 ? 'delivering' : 'arriving';

      await Brik.updateActivity(activity.id, {
        dynamic: {
          status: newStatus,
          eta: newEta,
          progress: newProgress,
        },
      });

      setProgress(newProgress);
      setEta(newEta);
      setStatus(newStatus);

      Alert.alert('Success', 'Activity updated');
    } catch (error) {
      Alert.alert('Error', `Failed to update activity: ${error}`);
    }
  };

  const handleEndActivity = async () => {
    if (!activity) {
      Alert.alert('Error', 'No active activity');
      return;
    }

    try {
      await Brik.endActivity(activity.id, 'default');
      setActivity(null);
      setProgress(0.2);
      setEta(20);
      setStatus('preparing');
      Alert.alert('Success', 'Activity ended');
    } catch (error) {
      Alert.alert('Error', `Failed to end activity: ${error}`);
    }
  };

  if (isSupported === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Checking support...</Text>
      </View>
    );
  }

  if (!isSupported) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Live Activities Not Supported</Text>
        <Text style={styles.subtitle}>
          Live Activities require iOS 16.1 or later and must be enabled in Settings.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Live Activity Demo</Text>
        <Text style={styles.subtitle}>
          Test Live Activities for lock screen and Dynamic Island
        </Text>

        {activity && (
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Active Activity</Text>
            <Text style={styles.statusValue}>ID: {activity.id}</Text>
            <Text style={styles.statusValue}>Type: {activity.activityType}</Text>
            <Text style={styles.statusValue}>Status: {status}</Text>
            <Text style={styles.statusValue}>Progress: {Math.round(progress * 100)}%</Text>
            <Text style={styles.statusValue}>ETA: {eta} min</Text>
          </View>
        )}

        <View style={styles.buttonGroup}>
          <Button
            title="Start Activity"
            onPress={handleStartActivity}
            disabled={activity !== null}
          />
        </View>

        <View style={styles.buttonGroup}>
          <Button
            title="Update Activity"
            onPress={handleUpdateActivity}
            disabled={activity === null}
          />
        </View>

        <View style={styles.buttonGroup}>
          <Button
            title="End Activity"
            onPress={handleEndActivity}
            disabled={activity === null}
            color="#dc2626"
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How to Test:</Text>
          <Text style={styles.infoText}>
            1. Generate native code: pnpm brik build --platform ios{'\n'}
            2. Open ios/*.xcworkspace in Xcode{'\n'}
            3. Build and run on physical iOS 16.1+ device{'\n'}
            4. Tap "Start Activity" to show on lock screen{'\n'}
            5. Lock your device to see the Live Activity{'\n'}
            6. On iPhone 14 Pro+, see Dynamic Island{'\n'}
            7. Tap "Update" to change status/progress{'\n'}
            8. Tap "End" to dismiss the activity
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  buttonGroup: {
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e3a8a',
    lineHeight: 20,
  },
});
