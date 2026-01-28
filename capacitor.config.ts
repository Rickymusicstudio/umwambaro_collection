import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.umwambaro.collections',
  appName: 'UMWAMBARO Collections',
  webDir: '.next',
  server: {
    url: 'umwambaro-collection.vercel.app',
    cleartext: true
  }
};

export default config;