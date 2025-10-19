/**
 * Live Activities API for React Native
 * Enables starting, updating, and ending Live Activities from JavaScript
 */

import { NativeModules, Platform } from 'react-native';

const { BrikLiveActivities } = NativeModules;

export interface ActivityAttributes<TStatic = any, TDynamic = any> {
  static: TStatic;
  dynamic: TDynamic;
}

export interface Activity {
  id: string;
  activityType: string;
  state: 'active' | 'ended' | 'dismissed';
  startDate: Date;
}

export interface StartActivityOptions<TStatic = any, TDynamic = any> {
  activityType: string;
  attributes: ActivityAttributes<TStatic, TDynamic>;
  staleDate?: Date;
  relevanceScore?: number; // 0-1
}

export interface UpdateActivityOptions<TDynamic = any> {
  dynamic: TDynamic;
  staleDate?: Date;
  relevanceScore?: number;
}

/**
 * Start a new Live Activity
 *
 * @example
 * const activity = await Brik.startActivity({
 *   activityType: 'OrderTracking',
 *   attributes: {
 *     static: { orderId: '12345', merchant: 'Acme' },
 *     dynamic: { status: 'preparing', eta: 15 }
 *   }
 * });
 */
export async function startActivity<TStatic = any, TDynamic = any>(
  options: StartActivityOptions<TStatic, TDynamic>,
): Promise<Activity> {
  if (Platform.OS !== 'ios') {
    throw new Error('Live Activities are only supported on iOS 16.1+');
  }

  if (!BrikLiveActivities) {
    throw new Error('BrikLiveActivities native module not found. Make sure the native module is linked.');
  }

  try {
    const result = await BrikLiveActivities.startActivity(options);
    return {
      id: result.id,
      activityType: result.activityType,
      state: result.state,
      startDate: new Date(result.startDate),
    };
  } catch (error) {
    console.error('[Brik] Failed to start Live Activity:', error);
    throw error;
  }
}

/**
 * Update an existing Live Activity
 *
 * @example
 * await Brik.updateActivity(activity.id, {
 *   dynamic: { status: 'delivering', eta: 5 }
 * });
 */
export async function updateActivity<TDynamic = any>(
  activityId: string,
  options: UpdateActivityOptions<TDynamic>,
): Promise<void> {
  if (Platform.OS !== 'ios') {
    throw new Error('Live Activities are only supported on iOS 16.1+');
  }

  if (!BrikLiveActivities) {
    throw new Error('BrikLiveActivities native module not found. Make sure the native module is linked.');
  }

  try {
    await BrikLiveActivities.updateActivity(activityId, options);
  } catch (error) {
    console.error('[Brik] Failed to update Live Activity:', error);
    throw error;
  }
}

/**
 * End a Live Activity
 *
 * @example
 * await Brik.endActivity(activity.id);
 */
export async function endActivity(
  activityId: string,
  dismissalPolicy: 'immediate' | 'default' | 'after' = 'default',
): Promise<void> {
  if (Platform.OS !== 'ios') {
    throw new Error('Live Activities are only supported on iOS 16.1+');
  }

  if (!BrikLiveActivities) {
    throw new Error('BrikLiveActivities native module not found. Make sure the native module is linked.');
  }

  try {
    await BrikLiveActivities.endActivity(activityId, dismissalPolicy);
  } catch (error) {
    console.error('[Brik] Failed to end Live Activity:', error);
    throw error;
  }
}

/**
 * Get all active Live Activities
 */
export async function getActiveActivities(): Promise<Activity[]> {
  if (Platform.OS !== 'ios') {
    return [];
  }

  if (!BrikLiveActivities) {
    console.warn('[Brik] BrikLiveActivities native module not found');
    return [];
  }

  try {
    const activities = await BrikLiveActivities.getActiveActivities();
    return activities.map((a: any) => ({
      id: a.id,
      activityType: a.activityType,
      state: a.state,
      startDate: new Date(a.startDate),
    }));
  } catch (error) {
    console.error('[Brik] Failed to get active activities:', error);
    return [];
  }
}

/**
 * Check if Live Activities are supported on this device
 */
export async function areActivitiesSupported(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  if (!BrikLiveActivities) {
    return false;
  }

  try {
    const supported = await BrikLiveActivities.areActivitiesSupported();
    return supported;
  } catch (error) {
    console.error('[Brik] Failed to check Live Activities support:', error);
    return false;
  }
}

/**
 * Get the push token for an activity (for remote updates)
 *
 * @example
 * const pushToken = await Brik.getPushToken(activity.id);
 * // Send pushToken to your server for remote updates
 */
export async function getPushToken(activityId: string): Promise<string | null> {
  if (Platform.OS !== 'ios') {
    throw new Error('Live Activities are only supported on iOS 16.1+');
  }

  if (!BrikLiveActivities) {
    throw new Error('BrikLiveActivities native module not found. Make sure the native module is linked.');
  }

  try {
    const token = await BrikLiveActivities.getPushToken(activityId);
    return token;
  } catch (error) {
    console.error('[Brik] Failed to get push token:', error);
    return null;
  }
}

// Export all APIs
export const Brik = {
  startActivity,
  updateActivity,
  endActivity,
  getActiveActivities,
  areActivitiesSupported,
  getPushToken,
};

export default Brik;
