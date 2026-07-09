import { useCallback, useEffect, useState } from 'react';

import {
  getDashboardAnalytics,
  type DashboardAnalytics,
} from '@/features/dashboard/services/dashboardAnalytics';

interface DashboardAnalyticsState {
  data: DashboardAnalytics | null;
  error: string | null;
  isLoading: boolean;
  refresh: () => void;
}

export function useDashboardAnalytics(): DashboardAnalyticsState {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadAnalytics() {
      setIsLoading(true);
      setError(null);

      try {
        const analytics = await getDashboardAnalytics();

        if (isActive) {
          setData(analytics);
        }
      } catch (analyticsError) {
        if (isActive) {
          setError(
            analyticsError instanceof Error
              ? analyticsError.message
              : 'Dashboard analytics could not be loaded.',
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadAnalytics();

    const interval = window.setInterval(loadAnalytics, 60_000);

    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, [refreshKey]);

  return { data, error, isLoading, refresh };
}
