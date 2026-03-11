import { Info } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import useDashboard from '../hooks/useDashboard';
import { CAFilterState, DEFAULT_FILTERS } from '../types';
import BottomGrid from './BottomGrid';
import GlobalFilter from './GlobalFilter';
import MarketHighlights from './MarketHighlights';
import MarketShare from './MarketShare';
import MonthlyTrend from './MonthlyTrend';

const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<CAFilterState>(DEFAULT_FILTERS);
  const { filterOptions, highlights, trend, marketShare, bottomGrid, loading, error, refetch } = useDashboard(filters);

  useEffect(() => {
    if (filterOptions && filterOptions.parent_orgs && filterOptions.parent_orgs.length > 0 && filters.parent_orgs.length === 0) {
      const top5Orgs = filterOptions.parent_orgs.slice(0, 5);
      setFilters(prev => ({ ...prev, parent_orgs: top5Orgs }));
    }
  }, [filterOptions, filters.parent_orgs.length]);

  const handleFilterChange = useCallback((updated: Partial<CAFilterState>) => {
    setFilters(prev => ({ ...prev, ...updated }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-1.5">
          <div className="flex items-center gap-1 mb-1">
            <h1 className="text-xl font-bold text-purple-900">Competitor Analysis</h1>
            <Info className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <GlobalFilter filters={filters} filterOptions={filterOptions} onChange={handleFilterChange} />
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 py-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error} — <button onClick={refetch} className="underline">retry</button>
          </div>
        )}

        {/* Top row: Market Highlights | Monthly Trend | Market Share */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-12 lg:col-span-3">
            <MarketHighlights data={highlights} loading={loading} />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <MonthlyTrend
              data={trend}
              loading={loading}
              selectedOrgs={filters.parent_orgs}
              allOrgs={filterOptions?.parent_orgs ?? []}
              onOrgsChange={(orgs) => handleFilterChange({ parent_orgs: orgs })}
            />
          </div>
          <div className="col-span-12 lg:col-span-3">
            <MarketShare data={marketShare} loading={loading} filters={filters} />
          </div>
        </div>

        {/* Bottom: per-org grid */}
        <BottomGrid data={bottomGrid} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
