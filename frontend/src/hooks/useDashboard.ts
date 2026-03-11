import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchDashboardData, fetchDashboardMeta } from '../services/api';
import { DashboardData, DashboardFilters, DashboardMeta } from '../types';

const useDashboard = (filters: Partial<DashboardFilters> = {}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [meta, setMeta] = useState<DashboardMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  const fetchData = useCallback(async (currentFilters: Partial<DashboardFilters>) => {
    setLoading(true);
    setError(null);

    try {
      const [metaResponse, dataResponse] = await Promise.all([
        fetchDashboardMeta(),
        fetchDashboardData(currentFilters),
      ]);

      setMeta(metaResponse);
      setData(dataResponse);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(filters);
  }, [fetchData, filters.timeRange, filters.category]);

  const refetch = useCallback(() => {
    fetchData(filters);
  }, [fetchData, filters]);

  return { data, meta, loading, error, refetch };
};

export default useDashboard;
