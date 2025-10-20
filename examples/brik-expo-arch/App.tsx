/**
 * Brik Expo (New Architecture) - Expo + New Arch
 * Tests v0.3.0 features on Expo with New Architecture (Fabric + TurboModules)
 */

import { BrikDemoApp } from '@brik/example-shared';
import React from 'react';

export default function App(): React.JSX.Element {
  return (
    <BrikDemoApp
      title="Brik Expo (New Arch)"
      enableHotReload={__DEV__}
      showHotReloadStatus={true}
    />
  );
}
