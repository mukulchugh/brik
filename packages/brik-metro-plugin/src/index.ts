export interface BrikMetroPluginOptions {
  enableBabelPlugin?: boolean;
  enableTransform?: boolean;
}

export function brikMetroPlugin(options: BrikMetroPluginOptions = {}) {
  const { enableBabelPlugin = true, enableTransform = true } = options;

  return (config: any) => {
    // Simple Metro config enhancement for Brik
    const mergedConfig = {
      ...config,
      transformer: {
        ...config.transformer,
        babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
      },
    };

    // Add Babel plugin if enabled
    if (enableBabelPlugin) {
      // This would be handled by the babel plugin configuration
      // in the project's babel.config.js or metro.config.js
    }

    return mergedConfig;
  };
}

export default brikMetroPlugin;
