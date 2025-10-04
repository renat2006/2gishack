export type * from './pwa';

export interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'production' | 'test';
  api: {
    baseUrl: string;
    timeout: number;
  };
  cache: {
    enabled: boolean;
    ttl: number;
  };
  features: {
    offlineMode: boolean;
    analytics: boolean;
    pushNotifications: boolean;
  };
}
