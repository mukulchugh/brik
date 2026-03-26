import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { createWidgetFiles, getMainAppBundleId } from '../src/xcode-utils';

describe('xcode-utils', () => {
  it('extracts bundle id from Xcode project file', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'brik-cli-'));
    const iosDir = path.join(tmp, 'ios');
    const projDir = path.join(iosDir, 'Demo.xcodeproj');

    await fs.mkdirp(projDir);
    await fs.writeFile(
      path.join(projDir, 'project.pbxproj'),
      'PRODUCT_BUNDLE_IDENTIFIER = com.example.demo;\n'
    );

    expect(getMainAppBundleId(iosDir)).toBe('com.example.demo');
  });

  it('creates widget swift and plist files', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'brik-cli-'));
    const iosDir = path.join(tmp, 'ios');

    await createWidgetFiles(iosDir, 'WeatherWidget');

    const swiftPath = path.join(iosDir, 'WeatherWidget', 'WeatherWidget.swift');
    const plistPath = path.join(iosDir, 'WeatherWidget', 'Info.plist');

    expect(await fs.pathExists(swiftPath)).toBe(true);
    expect(await fs.pathExists(plistPath)).toBe(true);

    const swift = await fs.readFile(swiftPath, 'utf8');
    expect(swift).toContain('struct WeatherWidget: Widget');

    const plist = await fs.readFile(plistPath, 'utf8');
    expect(plist).toContain('<string>WeatherWidget</string>');
  });
});
