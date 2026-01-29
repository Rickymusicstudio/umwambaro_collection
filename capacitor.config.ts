import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.umwambaro.collections',
  appName: 'UMWAMBARO Collections',

  server: {
    url: 'https://umwambaro-collection.vercel.app',
    cleartext: false
  }
};

export default config;