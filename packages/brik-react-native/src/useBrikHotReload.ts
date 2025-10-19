/**
 * Brik Hot Reload Client Hook
 * Add this to your React Native app to enable hot reload for widgets
 */
import { useEffect } from 'react';
import { DevSettings, NativeModules, Platform } from 'react-native';

interface HotReloadConfig {
  url?: string;
  enabled?: boolean;
  onReload?: () => void;
  onError?: (error: Error) => void;
}

export function useBrikHotReload(config: HotReloadConfig = {}) {
  const {
    url = 'ws://localhost:8089',
    enabled = __DEV__,
    onReload,
    onError
  } = config;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;
    const reconnectDelay = 2000;

    const connect = () => {
      try {
        console.log('[Brik] Connecting to hot reload server...');
        ws = new WebSocket(url);

        ws.onopen = () => {
          console.log('[Brik] Hot reload connected');
          reconnectAttempts = 0;
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            if (message.type === 'reload') {
              console.log('[Brik] Reloading widgets...', {
                components: message.components,
                buildTime: message.buildTime,
                changedPath: message.changedPath
              });

              // Trigger widget refresh
              if (NativeModules.BrikWidgetManager) {
                NativeModules.BrikWidgetManager.reloadAllWidgets();
              }

              // For Live Activities
              if (NativeModules.BrikLiveActivities) {
                NativeModules.BrikLiveActivities.refreshAll();
              }

              // Call custom reload handler
              onReload?.();

              // On iOS, we can also trigger a widget timeline reload
              if (Platform.OS === 'ios' && NativeModules.WidgetKit) {
                NativeModules.WidgetKit.reloadAllTimelines();
              }
            } else if (message.type === 'error') {
              console.error('[Brik] Build error:', message.error);
              onError?.(new Error(message.error));
            } else if (message.type === 'connected') {
              console.log('[Brik] Server acknowledged connection');
            }
          } catch (error) {
            console.error('[Brik] Failed to parse message:', error);
          }
        };

        ws.onerror = (error) => {
          console.warn('[Brik] Hot reload connection error:', error);
          onError?.(error as Error);
        };

        ws.onclose = () => {
          console.log('[Brik] Hot reload disconnected');
          ws = null;

          // Attempt to reconnect
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`[Brik] Reconnecting in ${reconnectDelay}ms... (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
            reconnectTimeout = setTimeout(connect, reconnectDelay);
          } else {
            console.warn('[Brik] Max reconnection attempts reached');
          }
        };
      } catch (error) {
        console.error('[Brik] Failed to connect to hot reload server:', error);
        onError?.(error as Error);
      }
    };

    // Initial connection
    connect();

    // Add dev menu item for manual refresh
    if (Platform.OS === 'ios' && DevSettings) {
      DevSettings.addMenuItem('Reload Brik Widgets', () => {
        console.log('[Brik] Manual widget reload triggered');
        if (NativeModules.BrikWidgetManager) {
          NativeModules.BrikWidgetManager.reloadAllWidgets();
        }
      });
    }

    // Cleanup
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [enabled, url, onReload, onError]);
}

// Export a simple version for quick setup
export function enableBrikHotReload() {
  useBrikHotReload();
}