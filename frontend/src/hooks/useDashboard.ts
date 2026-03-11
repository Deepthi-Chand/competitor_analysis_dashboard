import { useCallback, useEffect, useState } from 'react';
import {
  fetchBottomGrid,
  fetchFilterOptions,
  fetchMarketHighlights,
  fetchMarketShare,
  fetchMonthlyTrend,
} from '../services/api';
import {
  BottomGridRow,
  CAFilterState,
  DEFAULT_FILTERS,
  FilterOptions,
  MarketHighlightsData,
  MarketShareOrg,
  MonthlyTrendPoint,
} from '../types';

interface DashboardState {
  filterOptions: FilterOptions | null;
  highlights:   MarketHighlightsData | null;
  trend:        MonthlyTrendPoint[];
  marketShare:  MarketShareOrg[];
  bottomGrid:   BottomGridRow[];
  loading:      boolean;
  error:        string | null;
}

const useDashboard = (filters: CAFilterState = DEFAULT_FILTERS) => {
  const [state, setState] = useState<DashboardState>({
    filterOptions: null,
    highlights:    null,
    trend:         [],
    marketShare:   [],
    bottomGrid:    [],
    loading:       true,
    error:         null,
  });

  const fetchAll = useCallback(async (f: CAFilterState) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const filterOptions = await fetchFilterOptions();
      
      if (f.parent_orgs.length === 0 && filterOptions.parent_orgs && filterOptions.parent_orgs.length > 0) {
        setState(prev => ({ ...prev, filterOptions, loading: false }));
        return;
      }
      
      const [highlights, trend, marketShare, bottomGrid] = await Promise.all([
        fetchMarketHighlights(f),
        fetchMonthlyTrend(f),
        fetchMarketShare(f),
        fetchBottomGrid(f),
      ]);
      setState({ filterOptions, highlights, trend, marketShare, bottomGrid, loading: false, error: null });
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setState(prev => ({
        ...prev,
        loading: false,
        error: e.response?.data?.message || e.message || 'Failed to load dashboard data',
      }));
    }
  }, []);

  const filtersJson = JSON.stringify(filters);
  useEffect(() => { 
    fetchAll(filters); 
  }, [fetchAll, filtersJson]);

  const refetch = useCallback(() => fetchAll(filters), [fetchAll, filters]);

  return { ...state, refetch };
};

export default useDashboard;
