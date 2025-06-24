
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.wheelerstaffing.recruitflow',
  appName: 'wheeler-recruit-flow',
  webDir: 'dist',
  server: {
    url: 'https://5b9f1f59-0d79-4145-804c-12689091eb54.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;
