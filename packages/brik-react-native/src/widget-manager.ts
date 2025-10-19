/**
 * Widget Manager API for Brik
 * Enables React Native apps to update home screen widgets
 */

import { NativeModules, Platform } from 'react-native';

const { BrikWidgetManager } = NativeModules;

export interface WidgetUpdateOptions {
  /**
   * Force immediate update (iOS only)
   * Default: true
   */
  immediate?: boolean;

  /**
   * TTL for widget data in seconds
   * After this time, widget should show stale/placeholder state
   */
  ttl?: number;
}

export interface WidgetData {
  [key: string]: any;
}

/**
 * Widget Manager
 * Main API for updating widget data from React Native
 */
export class WidgetManager {
  /**
   * Update widget data
   *
   * @param widgetId - Unique identifier for the widget (e.g., 'WeatherWidget')
   * @param data - Data object that will be accessible to the widget
   * @param options - Update options
   *
   * @example
   * ```typescript
   * await widgetManager.updateWidget('WeatherWidget', {
   *   temperature: 72,
   *   condition: 'Sunny',
   *   location: 'San Francisco'
   * });
   * ```
   */
  async updateWidget(
    widgetId: string,
    data: WidgetData,
    options?: WidgetUpdateOptions
  ): Promise<void> {
    if (!BrikWidgetManager) {
      console.warn('[Brik] Widget Manager is not available on this platform');
      return;
    }

    // Add metadata
    const widgetData = {
      ...data,
      _updatedAt: new Date().toISOString(),
      ...(options?.ttl && { _ttl: options.ttl }),
    };

    try {
      const result = await BrikWidgetManager.updateWidget(widgetId, widgetData);
      console.log(`[Brik] Widget updated: ${widgetId}`, result);
    } catch (error) {
      console.error(`[Brik] Failed to update widget: ${widgetId}`, error);
      throw error;
    }
  }

  /**
   * Update specific widget kind (iOS only)
   * Useful when you have multiple widgets and want to update only specific ones
   *
   * @param widgetKind - The kind string defined in your widget
   */
  async updateWidgetKind(widgetKind: string): Promise<void> {
    if (!BrikWidgetManager) {
      return;
    }

    if (Platform.OS !== 'ios') {
      console.warn('[Brik] updateWidgetKind is only supported on iOS');
      return;
    }

    try {
      await BrikWidgetManager.updateWidgetKind(widgetKind);
      console.log(`[Brik] Widget kind updated: ${widgetKind}`);
    } catch (error) {
      console.error(`[Brik] Failed to update widget kind: ${widgetKind}`, error);
      throw error;
    }
  }

  /**
   * Get current widget data
   *
   * @param widgetId - Widget identifier
   * @returns Widget data or null if not found
   */
  async getWidgetData(widgetId: string): Promise<WidgetData | null> {
    if (!BrikWidgetManager) {
      return null;
    }

    try {
      const data = await BrikWidgetManager.getWidgetData(widgetId);
      return data;
    } catch (error) {
      console.error(`[Brik] Failed to get widget data: ${widgetId}`, error);
      return null;
    }
  }

  /**
   * Clear widget data
   *
   * @param widgetId - Widget identifier
   */
  async clearWidgetData(widgetId: string): Promise<void> {
    if (!BrikWidgetManager) {
      return;
    }

    try {
      await BrikWidgetManager.clearWidgetData(widgetId);
      console.log(`[Brik] Widget data cleared: ${widgetId}`);
    } catch (error) {
      console.error(`[Brik] Failed to clear widget data: ${widgetId}`, error);
      throw error;
    }
  }

  /**
   * Get App Group identifier (iOS only)
   * Useful for debugging
   */
  async getAppGroupIdentifier(): Promise<string | null> {
    if (!BrikWidgetManager) {
      return null;
    }

    if (Platform.OS !== 'ios') {
      return null;
    }

    try {
      const appGroup = await BrikWidgetManager.getAppGroupIdentifier();
      return appGroup;
    } catch (error) {
      console.error('[Brik] Failed to get App Group identifier', error);
      return null;
    }
  }

  /**
   * Check if widgets are supported on this device
   */
  async areWidgetsSupported(): Promise<boolean> {
    if (!BrikWidgetManager) {
      return false;
    }

    try {
      const supported = await BrikWidgetManager.areWidgetsSupported();
      return supported;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update multiple widgets at once
   *
   * @param updates - Map of widgetId to data
   *
   * @example
   * ```typescript
   * await widgetManager.updateMultiple({
   *   'WeatherWidget': { temp: 72, condition: 'Sunny' },
   *   'CalendarWidget': { events: [...] }
   * });
   * ```
   */
  async updateMultiple(
    updates: Record<string, WidgetData>,
    options?: WidgetUpdateOptions
  ): Promise<void> {
    const promises = Object.entries(updates).map(([widgetId, data]) =>
      this.updateWidget(widgetId, data, options)
    );

    await Promise.all(promises);
  }
}

/**
 * Default widget manager instance
 */
export const widgetManager = new WidgetManager();

/**
 * Hook for React components to update widgets
 *
 * @param widgetId - Widget identifier
 * @returns Update function and loading state
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { updateWidget, isUpdating } = useWidgetManager('WeatherWidget');
 *
 *   const handleUpdate = async () => {
 *     await updateWidget({ temp: 72, condition: 'Sunny' });
 *   };
 *
 *   return <Button onPress={handleUpdate} disabled={isUpdating} />;
 * }
 * ```
 */
export function useWidgetManager(widgetId: string) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const updateWidget = React.useCallback(
    async (data: WidgetData, options?: WidgetUpdateOptions) => {
      setIsUpdating(true);
      try {
        await widgetManager.updateWidget(widgetId, data, options);
      } finally {
        setIsUpdating(false);
      }
    },
    [widgetId]
  );

  const clearWidget = React.useCallback(async () => {
    setIsUpdating(true);
    try {
      await widgetManager.clearWidgetData(widgetId);
    } finally {
      setIsUpdating(false);
    }
  }, [widgetId]);

  return {
    updateWidget,
    clearWidget,
    isUpdating,
  };
}

// Re-export for convenience
import React from 'react';
