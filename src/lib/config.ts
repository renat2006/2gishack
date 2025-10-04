import type { AppConfig } from '@/types';

export const appConfig: AppConfig = {
  name: '2GIS Hack PWA',
  version: '1.0.0',
  environment: (process.env.NODE_ENV as AppConfig['environment']) || 'development',
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 30000,
  },
  cache: {
    enabled: true,
    ttl: 3600,
  },
  features: {
    offlineMode: true,
    analytics: false,
    pushNotifications: false,
  },
};


