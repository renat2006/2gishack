export class PerformanceMonitor {
  static measure(name: string, startMark: string, endMark: string): number {
    if (typeof window === 'undefined') return 0;

    try {
      performance.mark(endMark);
      performance.measure(name, startMark, endMark);

      const measure = performance.getEntriesByName(name)[0];
      const duration = measure ? measure.duration : 0;

      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(name);

      return duration;
    } catch {
      return 0;
    }
  }

  static mark(name: string): void {
    if (typeof window === 'undefined') return;

    try {
      performance.mark(name);
    } catch {
      // Ignore errors
    }
  }

  static getNavigationTiming(): PerformanceNavigationTiming | null {
    if (typeof window === 'undefined') return null;

    const [navigationTiming] = performance.getEntriesByType(
      'navigation'
    ) as PerformanceNavigationTiming[];
    return navigationTiming || null;
  }

  static getResourceTimings(): PerformanceResourceTiming[] {
    if (typeof window === 'undefined') return [];

    return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  }

  static getCoreWebVitals(): Promise<{
    lcp?: number;
    fid?: number;
    cls?: number;
  }> {
    return new Promise((resolve) => {
      const vitals = {
        lcp: undefined as number | undefined,
        fid: undefined as number | undefined,
        cls: undefined as number | undefined,
      };

      if (typeof window === 'undefined') {
        resolve(vitals);
        return;
      }

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            vitals.lcp = entry.startTime;
          }
          if (entry.entryType === 'first-input') {
            vitals.fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
      } catch {
        // Browser doesn't support these metrics
      }

      setTimeout(() => {
        observer.disconnect();
        resolve(vitals);
      }, 5000);
    });
  }
}
