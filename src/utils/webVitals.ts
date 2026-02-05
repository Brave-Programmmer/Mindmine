/**
 * Web Vitals and Performance Monitoring
 * Tracks Core Web Vitals: LCP, FID, CLS
 */

interface VitalsData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  entries?: PerformanceEntryList;
}

/**
 * Report Core Web Vitals to analytics
 * Usage in client-side scripts only
 */
export function reportWebVitals(onPerfEntry?: (metric: VitalsData) => void) {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const lastEntry = list.getEntries().pop();
        if (lastEntry) {
          const lcpValue = lastEntry.startTime;
          if (onPerfEntry) {
            onPerfEntry({
              name: 'LCP',
              value: lcpValue,
              rating:
                lcpValue < 2500 ? 'good' : lcpValue < 4000 ? 'needs-improvement' : 'poor',
            });
          }
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observer error:', e);
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidValue = (entry as any).processingDuration;
          if (onPerfEntry && fidValue) {
            onPerfEntry({
              name: 'FID',
              value: fidValue,
              rating:
                fidValue < 100 ? 'good' : fidValue < 300 ? 'needs-improvement' : 'poor',
            });
          }
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observer error:', e);
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            if (onPerfEntry) {
              onPerfEntry({
                name: 'CLS',
                value: clsValue,
                rating:
                  clsValue < 0.1
                    ? 'good'
                    : clsValue < 0.25
                      ? 'needs-improvement'
                      : 'poor',
              });
            }
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observer error:', e);
    }
  }
}

/**
 * Send metrics to analytics endpoint (e.g., Google Analytics, Vercel Analytics)
 */
export function sendMetricsToAnalytics(metric: VitalsData) {
  if (typeof window !== 'undefined' && 'navigator' in window) {
    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      const body = JSON.stringify(metric);
      navigator.sendBeacon('/api/metrics', body);
    }
  }
}

/**
 * Get current page performance metrics
 */
export function getPageMetrics() {
  if (typeof window === 'undefined') return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  return {
    // Time to First Byte
    ttfb: navigation?.responseStart - navigation?.requestStart,
    // First Contentful Paint
    fcp: paint.find((p) => p.name === 'first-contentful-paint')?.startTime,
    // DOM Content Loaded
    domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
    // Load time
    loadTime: navigation?.loadEventEnd - navigation?.loadEventStart,
    // Total resources loaded
    resourceCount: performance.getEntriesByType('resource').length,
  };
}

/**
 * Monitor resource loading performance
 */
export function monitorResourcePerformance() {
  if (typeof window === 'undefined') return;

  const resourceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resource = entry as PerformanceResourceTiming;
      const duration = resource.duration;
      const size = resource.transferSize || 0;

      // Flag slow resources (> 3 seconds)
      if (duration > 3000) {
        console.warn(`Slow resource: ${resource.name} (${duration.toFixed(2)}ms)`);
      }

      // Flag large resources (> 1MB)
      if (size > 1000000) {
        console.warn(`Large resource: ${resource.name} (${(size / 1024 / 1024).toFixed(2)}MB)`);
      }
    }
  });

  resourceObserver.observe({ entryTypes: ['resource'] });
}
