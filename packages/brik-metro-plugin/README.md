# @brik/metro-plugin

Metro bundler plugin for Brik - enables hot reload and development workflows.

## Installation

```bash
pnpm add @brik/metro-plugin
```

## Usage

Add to your `metro.config.js`:

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withBrikPlugin } = require('@brik/metro-plugin');

const config = getDefaultConfig(__dirname);

module.exports = withBrikPlugin(config);
```

## Features

- Hot reload for widget changes
- Automatic widget recompilation
- Development mode optimizations
- Watch mode for native code generation

## License

MIT © Mukul Chugh
