/*import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.savego.app',
  appName: 'SaveGo',
  webDir: 'dist/status-saver-ios/browser'
};export default config; */

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.savego.app',
  appName: 'SaveGo',
  webDir: 'dist/status-saver-ios/browser',
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
