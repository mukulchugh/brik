/**
 * Brik Expo (Old Architecture) - Expo + Old Arch
 * Tests v0.3.0 features on Expo with Old Architecture (Paper)
 */

import { BrikDemoApp } from '@brik/example-shared';
import React from 'react';

export default function App(): React.JSX.Element {
  return (
    <BrikDemoApp
      title="Brik Expo (Old Arch)"
      enableHotReload={__DEV__}
      showHotReloadStatus={true}
    />
  );
}
