const CACHE_NAME = '2gishack-cache-v1';
const DATA_CACHE_NAME = '2gishack-data-cache-v1';

export class CacheManager {
  static async precacheResources(urls: string[]): Promise<void> {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urls);
  }

  static async cacheData(url: string, data: Response): Promise<void> {
    const cache = await caches.open(DATA_CACHE_NAME);
    await cache.put(url, data);
  }

  static async getCachedData(url: string): Promise<Response | undefined> {
    const cache = await caches.open(DATA_CACHE_NAME);
    return await cache.match(url);
  }

  static async clearOldCaches(currentCaches: string[]): Promise<void> {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((cacheName) => !currentCaches.includes(cacheName))
        .map((cacheName) => caches.delete(cacheName))
    );
  }

  static async updateCache(url: string): Promise<Response | null> {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const cache = await caches.open(DATA_CACHE_NAME);
        await cache.put(url, response.clone());
        return response;
      }
      return null;
    } catch {
      return null;
    }
  }

  static async getCacheSize(): Promise<number> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  }

  static async clearCache(): Promise<void> {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
  }
}


