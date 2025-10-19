/**
 * Widget Configuration Utilities for Brik v0.3.0
 * Provides helpers for managing widget configurations, state, and updates
 */

import { Platform } from 'react-native';

export interface WidgetConfig {
  id: string;
  name: string;
  description?: string;
  platform: 'ios' | 'android' | 'both';
  kind: 'widget' | 'live-activity';
  family?: 'small' | 'medium' | 'large' | 'extra-large';
  updateInterval?: number; // in seconds
  supportsDynamicIsland?: boolean;
  supportsLockScreen?: boolean;
}

export interface WidgetState<T = any> {
  widgetId: string;
  data: T;
  lastUpdated: Date;
  version: number;
}

/**
 * Widget Configuration Manager
 */
export class WidgetConfigManager {
  private configs: Map<string, WidgetConfig> = new Map();
  private states: Map<string, WidgetState> = new Map();

  /**
   * Register a widget configuration
   */
  register(config: WidgetConfig): void {
    this.configs.set(config.id, config);
  }

  /**
   * Get a widget configuration
   */
  getConfig(widgetId: string): WidgetConfig | undefined {
    return this.configs.get(widgetId);
  }

  /**
   * Get all registered widgets
   */
  getAllConfigs(): WidgetConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Get widgets for current platform
   */
  getPlatformWidgets(): WidgetConfig[] {
    const currentPlatform = Platform.OS;
    return this.getAllConfigs().filter(
      (config) => config.platform === currentPlatform || config.platform === 'both'
    );
  }

  /**
   * Update widget state
   */
  updateState<T>(widgetId: string, data: T): void {
    const existing = this.states.get(widgetId);
    const version = existing ? existing.version + 1 : 1;

    this.states.set(widgetId, {
      widgetId,
      data,
      lastUpdated: new Date(),
      version,
    });
  }

  /**
   * Get widget state
   */
  getState<T>(widgetId: string): WidgetState<T> | undefined {
    return this.states.get(widgetId) as WidgetState<T> | undefined;
  }

  /**
   * Clear widget state
   */
  clearState(widgetId: string): void {
    this.states.delete(widgetId);
  }

  /**
   * Get stale widgets (not updated within their interval)
   */
  getStaleWidgets(): WidgetConfig[] {
    const now = Date.now();
    return this.getAllConfigs().filter((config) => {
      const state = this.states.get(config.id);
      if (!state || !config.updateInterval) return false;

      const timeSinceUpdate = now - state.lastUpdated.getTime();
      return timeSinceUpdate > config.updateInterval * 1000;
    });
  }
}

// Singleton instance
export const widgetConfigManager = new WidgetConfigManager();

/**
 * Helper function to create a widget config
 */
export function createWidgetConfig(config: WidgetConfig): WidgetConfig {
  widgetConfigManager.register(config);
  return config;
}

/**
 * Widget timeline helpers for iOS widgets
 */
export interface TimelineEntry<T = any> {
  date: Date;
  data: T;
  relevance?: number; // 0-1, higher is more relevant
}

export class WidgetTimeline<T = any> {
  private entries: TimelineEntry<T>[] = [];

  /**
   * Add an entry to the timeline
   */
  addEntry(entry: TimelineEntry<T>): void {
    this.entries.push(entry);
    this.entries.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Get entries after a specific date
   */
  getEntriesAfter(date: Date): TimelineEntry<T>[] {
    return this.entries.filter((entry) => entry.date > date);
  }

  /**
   * Get the next entry
   */
  getNextEntry(): TimelineEntry<T> | undefined {
    const now = new Date();
    return this.entries.find((entry) => entry.date > now);
  }

  /**
   * Clear old entries
   */
  clearOldEntries(): void {
    const now = new Date();
    this.entries = this.entries.filter((entry) => entry.date > now);
  }

  /**
   * Get all entries
   */
  getAllEntries(): TimelineEntry<T>[] {
    return [...this.entries];
  }
}

/**
 * Widget update scheduler
 */
export class WidgetUpdateScheduler {
  private timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Schedule periodic updates for a widget
   */
  schedule(
    widgetId: string,
    intervalSeconds: number,
    callback: () => void | Promise<void>
  ): void {
    // Clear existing timer
    this.cancel(widgetId);

    // Schedule new timer
    const timer = setInterval(async () => {
      try {
        await callback();
      } catch (error) {
        console.error(`[Brik] Widget update failed for ${widgetId}:`, error);
      }
    }, intervalSeconds * 1000);

    this.timers.set(widgetId, timer);
  }

  /**
   * Cancel scheduled updates
   */
  cancel(widgetId: string): void {
    const timer = this.timers.get(widgetId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(widgetId);
    }
  }

  /**
   * Cancel all scheduled updates
   */
  cancelAll(): void {
    this.timers.forEach((timer) => clearInterval(timer));
    this.timers.clear();
  }
}

// Singleton instance
export const widgetUpdateScheduler = new WidgetUpdateScheduler();

/**
 * Widget validation helpers
 */
export function validateWidgetData<T extends Record<string, any>>(
  data: T,
  schema: Record<keyof T, 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array'>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [key, expectedType] of Object.entries(schema)) {
    const value = data[key];

    if (value === undefined || value === null) {
      errors.push(`Missing required field: ${key}`);
      continue;
    }

    const actualType = Array.isArray(value) ? 'array' : typeof value === 'object' && value instanceof Date ? 'date' : typeof value;

    if (actualType !== expectedType) {
      errors.push(`Invalid type for ${key}: expected ${expectedType}, got ${actualType}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
