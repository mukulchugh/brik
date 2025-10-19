import chokidar from 'chokidar';
import debounce from 'debounce';
import { compileFiles } from '@brik/compiler';
import { writeSwiftFiles } from '@brik/target-swiftui';
import { writeComposeFiles } from '@brik/target-compose';
import WebSocket from 'ws';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface HotReloadOptions {
  projectRoot: string;
  platform: 'ios' | 'android' | 'all';
  asWidget: boolean;
  outDir: string;
  verbose: boolean;
  port?: number;
  autoReloadNative?: boolean;
}

export class BrikHotReloader {
  private watcher: any | null = null;
  private wsServer: WebSocket.Server | null = null;
  private spinner: any = null;
  private lastBuildTime: number = 0;
  private buildCache: Map<string, string> = new Map();
  private clients: Set<WebSocket> = new Set();

  constructor(private options: HotReloadOptions) {}

  async start() {
    console.log(chalk.cyan('🔥 Brik Hot Reload Starting...'));
    console.log(chalk.gray(`Watching: ${this.options.projectRoot}`));
    console.log(chalk.gray(`Platform: ${this.options.platform}`));

    // Start WebSocket server for live updates
    if (this.options.port) {
      await this.startWebSocketServer();
    }

    // Setup file watcher
    this.setupWatcher();

    // Do initial build
    await this.rebuild();

    console.log(chalk.green('✨ Hot reload ready!'));
    console.log(chalk.gray('Watching for changes...'));
    console.log(chalk.gray('Press Ctrl+C to stop'));
  }

  private setupWatcher() {
    const watchPatterns = [
      '**/*.tsx',
      '**/*.jsx',
      '**/*.ts',
      '**/*.js'
    ];

    const ignoredPaths = [
      '**/node_modules/**',
      '**/.brik/**',
      '**/dist/**',
      '**/build/**',
      '**/ios/build/**',
      '**/android/build/**',
      '**/*.test.*',
      '**/*.spec.*'
    ];

    this.watcher = chokidar.watch(watchPatterns, {
      cwd: this.options.projectRoot,
      ignored: ignoredPaths,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100
      }
    });

    // Debounce rebuild to handle multiple file changes
    const debouncedRebuild = debounce(async (path: string) => {
      await this.rebuild(path);
    }, 500);

    this.watcher
      .on('add', (path: string) => {
        console.log(chalk.yellow(`📝 File added: ${path}`));
        debouncedRebuild(path);
      })
      .on('change', (path: string) => {
        console.log(chalk.yellow(`📝 File changed: ${path}`));
        debouncedRebuild(path);
      })
      .on('unlink', (path: string) => {
        console.log(chalk.yellow(`🗑  File removed: ${path}`));
        debouncedRebuild(path);
      })
      .on('error', (error: Error) => {
        console.error(chalk.red('❌ Watcher error:'), error);
      });
  }

  private async rebuild(changedPath?: string) {
    const startTime = Date.now();

    // Skip if build is too recent (prevent double builds)
    if (startTime - this.lastBuildTime < 200) {
      return;
    }

    this.lastBuildTime = startTime;

    this.spinner = ora({
      text: changedPath
        ? `Rebuilding after change to ${chalk.cyan(changedPath)}...`
        : 'Building Brik components...',
      color: 'cyan'
    }).start();

    try {
      // Compile TypeScript/JSX to IR
      const roots = await compileFiles({
        projectRoot: this.options.projectRoot,
        asWidget: this.options.asWidget,
        outDir: this.options.outDir,
      });

      if (roots.length === 0) {
        this.spinner.warn('No Brik components found');
        return;
      }

      // Check if output actually changed (incremental build optimization)
      const hasChanges = await this.checkForChanges(roots);
      if (!hasChanges && changedPath) {
        this.spinner.info('No changes in generated code');
        return;
      }

      // Generate native code
      const platforms: string[] = [];

      if (this.options.platform === 'ios' || this.options.platform === 'all') {
        await writeSwiftFiles(roots, path.join(this.options.projectRoot, 'ios'));
        platforms.push('iOS');
      }

      if (this.options.platform === 'android' || this.options.platform === 'all') {
        await writeComposeFiles(roots, path.join(this.options.projectRoot, 'android'), this.options.asWidget);
        platforms.push('Android');
      }

      const buildTime = Date.now() - startTime;
      this.spinner.succeed(
        `Built ${roots.length} component(s) for ${platforms.join(' & ')} in ${chalk.cyan(`${buildTime}ms`)}`
      );

      // Notify connected clients
      this.notifyClients({
        type: 'reload',
        timestamp: Date.now(),
        components: roots.length,
        buildTime,
        changedPath
      });

      // Auto-reload native app if configured
      if (this.options.autoReloadNative) {
        await this.reloadNativeApp();
      }

      // Update cache
      this.updateCache(roots);

    } catch (error) {
      this.spinner.fail('Build failed');
      console.error(chalk.red('❌ Error:'), error);

      // Notify clients of error
      this.notifyClients({
        type: 'error',
        error: String(error),
        timestamp: Date.now()
      });
    }
  }

  private async checkForChanges(roots: any[]): Promise<boolean> {
    // Simple change detection based on IR hash
    const newHash = JSON.stringify(roots);
    const cacheKey = 'last-build';
    const oldHash = this.buildCache.get(cacheKey);

    if (oldHash === newHash) {
      return false;
    }

    this.buildCache.set(cacheKey, newHash);
    return true;
  }

  private updateCache(roots: any[]) {
    // Store build artifacts for incremental builds
    for (const root of roots) {
      this.buildCache.set(root.rootId, JSON.stringify(root));
    }
  }

  private async startWebSocketServer() {
    const port = this.options.port || 8089;

    this.wsServer = new WebSocket.Server({ port });

    this.wsServer.on('connection', (ws: WebSocket) => {
      console.log(chalk.green('📱 Client connected for hot reload'));
      this.clients.add(ws);

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(chalk.gray('📱 Client disconnected'));
      });

      ws.on('error', (error: Error) => {
        console.error(chalk.red('WebSocket error:'), error);
        this.clients.delete(ws);
      });

      // Send initial state
      ws.send(JSON.stringify({
        type: 'connected',
        timestamp: Date.now()
      }));
    });

    console.log(chalk.cyan(`🔌 WebSocket server running on port ${port}`));
  }

  private notifyClients(message: any) {
    if (!this.wsServer) return;

    const payload = JSON.stringify(message);

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }

    if (this.options.verbose && this.clients.size > 0) {
      console.log(chalk.gray(`📡 Notified ${this.clients.size} client(s)`));
    }
  }

  private async reloadNativeApp() {
    try {
      if (this.options.platform === 'ios' || this.options.platform === 'all') {
        // Trigger widget reload via WidgetCenter
        await this.reloadIOSWidgets();
      }

      if (this.options.platform === 'android' || this.options.platform === 'all') {
        // Trigger Android widget update
        await this.reloadAndroidWidgets();
      }
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Auto-reload failed:'), error);
    }
  }

  private async reloadIOSWidgets() {
    // Use xcrun simctl to reload widgets in simulator
    try {
      const { stdout } = await execAsync('xcrun simctl list devices booted');
      if (stdout.includes('(Booted)')) {
        // Reload all widgets
        await execAsync('xcrun simctl reload-timelines booted').catch(() => {
          // Fallback: restart the app
          console.log(chalk.gray('Reloading iOS widgets...'));
        });
      }
    } catch {
      // Simulator not running
    }
  }

  private async reloadAndroidWidgets() {
    // Use adb to trigger widget update
    try {
      await execAsync('adb shell am broadcast -a android.appwidget.action.APPWIDGET_UPDATE');
      console.log(chalk.gray('Reloading Android widgets...'));
    } catch {
      // ADB not available or device not connected
    }
  }

  async stop() {
    console.log(chalk.yellow('\n⏹  Stopping hot reload...'));

    if (this.watcher) {
      await this.watcher.close();
    }

    if (this.wsServer) {
      // Close all client connections
      for (const client of this.clients) {
        client.close();
      }
      this.clients.clear();

      // Close server
      await new Promise<void>((resolve) => {
        this.wsServer!.close(() => resolve());
      });
    }

    console.log(chalk.green('✅ Hot reload stopped'));
  }
}

// Helper function to integrate with React Native app
export function createHotReloadClient(url: string = 'ws://localhost:8089') {
  return `
// Brik Hot Reload Client
// Add this to your React Native app to enable hot reload
import { useEffect } from 'react';
import { DevSettings, NativeModules } from 'react-native';

export function useBrikHotReload() {
  useEffect(() => {
    if (__DEV__) {
      const ws = new WebSocket('${url}');

      ws.onopen = () => {
        console.log('[Brik] Hot reload connected');
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === 'reload') {
          console.log('[Brik] Reloading widgets...');

          // Trigger widget refresh
          if (NativeModules.BrikWidgetManager) {
            NativeModules.BrikWidgetManager.reloadAllWidgets();
          }

          // For Live Activities
          if (NativeModules.BrikLiveActivities) {
            // Refresh Live Activity content
            NativeModules.BrikLiveActivities.refreshAll();
          }
        }
      };

      ws.onerror = (error) => {
        console.warn('[Brik] Hot reload error:', error);
      };

      return () => {
        ws.close();
      };
    }
  }, []);
}
`;
}