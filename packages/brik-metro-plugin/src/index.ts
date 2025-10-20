export interface BrikMetroPluginOptions {
  enableTransform?: boolean;
}

export function brikMetroPlugin(options: BrikMetroPluginOptions = {}) {
  const { enableTransform = true } = options;

  return (config: any) => {
    // Simple Metro config enhancement for Brik
    const mergedConfig = {
      ...config,
      transformer: {
        ...config.transformer,
        babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
      },
    };

    // Future: Could add file watching and auto-run brik build here
    // For now, users should run `brik build` or `brik watch` separately

    return mergedConfig;
  };
}

export default brikMetroPlugin;
