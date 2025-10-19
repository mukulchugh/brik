/**
 * Performance Monitoring System for Brik v0.3.0
 * Enterprise-grade telemetry and metrics for production debugging
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
  tags?: Record<string, string>;
}

export interface CompilationMetrics {
  totalDuration: number;
  parseTime: number;
  transformTime: number;
  generateTime: number;
  filesProcessed: number;
  linesOfCode: number;
}

export interface RuntimeMetrics {
  activityStartTime: number;
  activityUpdateTime: number;
  activityEndTime: number;
  pushTokenRetrievalTime: number;
  widgetRenderTime: number;
}

export interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
}

/**
 * Performance Monitor
 * Tracks and reports performance metrics for optimization
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();
  private enabled: boolean = true;

  /**
   * Enable/disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Start timing an operation
   */
  startTimer(name: string, tags?: Record<string, string>): void {
    if (!this.enabled) return;
    this.timers.set(name, performance.now());
    if (tags) {
      this.timers.set(`${name}_tags`, JSON.stringify(tags) as any);
    }
  }

  /**
   * End timing and record metric
   */
  endTimer(name: string): number {
    if (!this.enabled) return 0;

    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`[Brik Performance] No timer found for: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    const tagsJson = this.timers.get(`${name}_tags`);
    const tags = tagsJson && typeof tagsJson === 'string' ? JSON.parse(tagsJson) : undefined;

    this.recordMetric({
      name,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags,
    });

    this.timers.delete(name);
    if (tagsJson) this.timers.delete(`${name}_tags`);

    return duration;
  }

  /**
   * Record a custom metric
   */
  recordMetric(metric: PerformanceMetric): void {
    if (!this.enabled) return;
    this.metrics.push(metric);

    // Auto-cleanup old metrics (keep last 1000)
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(filter?: { name?: string; since?: number }): PerformanceMetric[] {
    let filtered = this.metrics;

    if (filter?.name) {
      filtered = filtered.filter((m) => m.name === filter.name);
    }

    if (filter?.since) {
      filtered = filtered.filter((m) => m.timestamp >= filter.since!);
    }

    return filtered;
  }

  /**
   * Get summary statistics for a metric
   */
  getStats(metricName: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const values = this.metrics
      .filter((m) => m.name === metricName)
      .map((m) => m.value)
      .sort((a, b) => a - b);

    if (values.length === 0) return null;

    const percentile = (p: number) => {
      const index = Math.ceil((p / 100) * values.length) - 1;
      return values[index];
    };

    return {
      count: values.length,
      min: values[0],
      max: values[values.length - 1],
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      p50: percentile(50),
      p95: percentile(95),
      p99: percentile(99),
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.timers.clear();
  }

  /**
   * Export metrics for external analysis
   */
  export(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const metricNames = [...new Set(this.metrics.map((m) => m.name))];
    const lines: string[] = [
      '='.repeat(80),
      'BRIK PERFORMANCE REPORT',
      '='.repeat(80),
      `Generated: ${new Date().toISOString()}`,
      `Total Metrics: ${this.metrics.length}`,
      '',
    ];

    for (const name of metricNames) {
      const stats = this.getStats(name);
      if (!stats) continue;

      lines.push(`${name}:`);
      lines.push(`  Count: ${stats.count}`);
      lines.push(`  Min: ${stats.min.toFixed(2)}ms`);
      lines.push(`  Max: ${stats.max.toFixed(2)}ms`);
      lines.push(`  Avg: ${stats.avg.toFixed(2)}ms`);
      lines.push(`  P50: ${stats.p50.toFixed(2)}ms`);
      lines.push(`  P95: ${stats.p95.toFixed(2)}ms`);
      lines.push(`  P99: ${stats.p99.toFixed(2)}ms`);
      lines.push('');
    }

    lines.push('='.repeat(80));
    return lines.join('\n');
  }
}

/**
 * Singleton performance monitor
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for measuring function performance
 */
export function measurePerformance(metricName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const name = metricName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      performanceMonitor.startTimer(name);
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        performanceMonitor.endTimer(name);
      }
    };

    return descriptor;
  };
}

/**
 * Track Live Activity performance
 */
export class ActivityPerformanceTracker {
  private activityMetrics: Map<string, RuntimeMetrics> = new Map();

  recordActivityStart(activityId: string, duration: number): void {
    const metrics = this.activityMetrics.get(activityId) || {
      activityStartTime: 0,
      activityUpdateTime: 0,
      activityEndTime: 0,
      pushTokenRetrievalTime: 0,
      widgetRenderTime: 0,
    };

    metrics.activityStartTime = duration;
    this.activityMetrics.set(activityId, metrics);

    performanceMonitor.recordMetric({
      name: 'activity.start',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags: { activityId },
    });
  }

  recordActivityUpdate(activityId: string, duration: number): void {
    const metrics = this.activityMetrics.get(activityId);
    if (metrics) {
      metrics.activityUpdateTime = duration;
    }

    performanceMonitor.recordMetric({
      name: 'activity.update',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags: { activityId },
    });
  }

  recordActivityEnd(activityId: string, duration: number): void {
    const metrics = this.activityMetrics.get(activityId);
    if (metrics) {
      metrics.activityEndTime = duration;
    }

    performanceMonitor.recordMetric({
      name: 'activity.end',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags: { activityId },
    });

    // Cleanup
    this.activityMetrics.delete(activityId);
  }

  getActivityMetrics(activityId: string): RuntimeMetrics | undefined {
    return this.activityMetrics.get(activityId);
  }
}

/**
 * Singleton activity performance tracker
 */
export const activityPerformanceTracker = new ActivityPerformanceTracker();

/**
 * Production telemetry hook
 */
export interface TelemetryEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
}

export type TelemetryCallback = (event: TelemetryEvent) => void;

class TelemetrySystem {
  private callbacks: TelemetryCallback[] = [];

  /**
   * Register a telemetry callback
   */
  onEvent(callback: TelemetryCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) this.callbacks.splice(index, 1);
    };
  }

  /**
   * Track an event
   */
  track(event: string, properties?: Record<string, any>): void {
    const telemetryEvent: TelemetryEvent = {
      event,
      properties,
      timestamp: Date.now(),
    };

    this.callbacks.forEach((callback) => {
      try {
        callback(telemetryEvent);
      } catch (error) {
        console.error('[Brik Telemetry] Callback error:', error);
      }
    });
  }
}

/**
 * Singleton telemetry system
 */
export const telemetry = new TelemetrySystem();
