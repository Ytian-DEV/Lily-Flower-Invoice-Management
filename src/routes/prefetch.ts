/**
 * Warms the browser cache with the pages staff open most, a few seconds after the
 * current page has loaded, so moving between them does not wait on the network.
 */
export function prefetchCommonPages() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
    .connection;

  if (connection?.saveData) {
    return;
  }

  const load = () => {
    void import('@/pages/DashboardPage');
    void import('@/pages/OrdersPage');
    void import('@/pages/OrderDetailPage');
    void import('@/pages/OrderFormPage');
  };

  // Wait until the first screen is fully done, then use idle time only.
  const schedule = () =>
    window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(load, { timeout: 5000 });
      } else {
        load();
      }
    }, 3000);

  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
  }
}
