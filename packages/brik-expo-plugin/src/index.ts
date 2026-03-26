import { ConfigPlugin, withDangerousMod, withEntitlementsPlist } from '@expo/config-plugins';
import fs from 'fs';
import { execSync } from 'node:child_process';
import { configureXcodeProject } from './ios/xcode';

type Options = { platform?: 'ios' | 'android' | 'all'; widgetName?: string; appGroupId?: string };

export const withBrik: ConfigPlugin<Options> = (config, options) => {
  const platform = options?.platform ?? 'all';
  const widgetName = options?.widgetName ?? 'BrikWidget';
  const bundleIdentifier = config.ios?.bundleIdentifier || 'com.brik.app';
  const appGroupId = options?.appGroupId ?? `group.${bundleIdentifier}.widgets`;

  if (platform === 'android' || platform === 'all') {
    config = withDangerousMod(config, ['android', async (c) => {
      const root = c.modRequest.projectRoot;
      const cliPath = `${root}/../../packages/brik-cli/dist/index.js`;
      if (fs.existsSync(cliPath)) {
        execSync(`node ${cliPath} build --platform android --as-widget`, { stdio: 'inherit', cwd: root });
      }
      return c;
    }]);
  }

  if (platform === 'ios' || platform === 'all') {
    config = withDangerousMod(config, ['ios', async (c) => {
      const root = c.modRequest.projectRoot;
      const cliPath = `${root}/../../packages/brik-cli/dist/index.js`;
      if (fs.existsSync(cliPath)) {
        execSync(`node ${cliPath} ios-setup --name ${widgetName} --bundle-id ${bundleIdentifier}`, { stdio: 'inherit', cwd: root });
        execSync(`node ${cliPath} build --platform ios`, { stdio: 'inherit', cwd: root });
      } else {
        execSync(`pnpm --silent -w run brik ios-setup --name ${widgetName} --bundle-id ${bundleIdentifier}`, { stdio: 'inherit', cwd: root });
        execSync('pnpm --silent -w run brik build --platform ios', { stdio: 'inherit', cwd: root });
      }
      return c;
    }]);

    config = configureXcodeProject(config, {
      targetName: widgetName,
      bundleIdentifier: `${bundleIdentifier}.${widgetName}`,
      deploymentTarget: '16.0'
    });

    config = withEntitlementsPlist(config, (c) => {
      if (!c.modResults) c.modResults = {};
      c.modResults['com.apple.security.application-groups'] = [appGroupId];
      return c;
    });
  }
  return config;
};

export default withBrik;
