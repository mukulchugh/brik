# @brik/expo-plugin

Expo config plugin for Brik - automatically configures native iOS and Android projects for widgets and Live Activities.

## Installation

```bash
pnpm add @brik/expo-plugin
```

## Usage

Add to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      "@brik/expo-plugin"
    ]
  }
}
```

## What It Does

### iOS

- Creates widget extension target
- Configures App Groups capability
- Sets up WidgetKit and ActivityKit entitlements
- Links native Brik modules

### Android

- Configures Glance widget receiver
- Sets up widget manifest entries
- Links Jetpack Compose dependencies

## Configuration

```json
{
  "expo": {
    "plugins": [
      [
        "@brik/expo-plugin",
        {
          "widgetName": "MyWidget",
          "appGroupId": "group.com.yourapp.widgets"
        }
      ]
    ]
  }
}
```

## Commands

After adding the plugin:

```bash
# Prebuild to apply native changes
npx expo prebuild

# Run iOS
npx expo run:ios

# Run Android
npx expo run:android
```

## License

MIT © Mukul Chugh
