export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export interface AppManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  background_color: string;
  theme_color: string;
  orientation?: 'portrait' | 'landscape' | 'any';
  icons: ManifestIcon[];
  screenshots?: ManifestScreenshot[];
  categories?: string[];
  shortcuts?: ManifestShortcut[];
}

export interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'maskable' | 'any' | 'monochrome';
}

export interface ManifestScreenshot {
  src: string;
  sizes: string;
  type: string;
}

export interface ManifestShortcut {
  name: string;
  short_name?: string;
  description?: string;
  url: string;
  icons?: ManifestIcon[];
}

export interface ServiceWorkerMessage {
  type: 'SKIP_WAITING' | 'CACHE_URLS' | 'CLEAR_CACHE' | 'GET_VERSION';
  payload?: unknown;
}

export interface CacheStrategy {
  name: string;
  pattern: RegExp | ((url: URL) => boolean);
  handler: 'CacheFirst' | 'NetworkFirst' | 'StaleWhileRevalidate' | 'NetworkOnly' | 'CacheOnly';
  options?: CacheOptions;
}

export interface CacheOptions {
  cacheName?: string;
  expiration?: {
    maxEntries?: number;
    maxAgeSeconds?: number;
  };
  networkTimeoutSeconds?: number;
  rangeRequests?: boolean;
}


