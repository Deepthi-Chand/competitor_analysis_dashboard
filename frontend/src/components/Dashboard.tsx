import { RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import useDashboard from '../hooks/useDashboard';
import { DashboardFilters } from '../types';
import ChartFour from './ChartFour';
import ChartOne from './ChartOne';
import ChartThree from './ChartThree';
import ChartTwo from './ChartTwo';
import GlobalFilter from './GlobalFilter';
import { Button } from './ui/button';

const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    timeRange: '30d',
    category: 'all',
  });
  const { data, meta, loading, error, refetch } = useDashboard(filters);

  const handleFilterChange = (filterId: string, value: string): void => {
    setFilters((prev) => ({ ...prev, [filterId]: value }));
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refetch}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              {meta?.lastUpdated
                ? `Last updated: ${new Date(meta.lastUpdated).toLocaleString()}`
                : 'Loading...'}
            </p>
          </div>
          <Button onClick={refetch} variant="outline" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          {meta?.filters?.map((filter) => (
            <GlobalFilter
              key={filter.id}
              label={filter.label}
              options={filter.options}
              value={filters[filter.id as keyof DashboardFilters] ?? ''}
              onChange={(value) => handleFilterChange(filter.id, value)}
            />
          ))}
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartOne
            data={data?.['chart-one']}
            title={meta?.charts?.find((c) => c.id === 'chart-one')?.title ?? 'Revenue Overview'}
            loading={loading}
          />
        </div>
        <div>
          <ChartFour
            data={data?.['chart-four']}
            title={meta?.charts?.find((c) => c.id === 'chart-four')?.title ?? 'Distribution Analysis'}
            loading={loading}
          />
        </div>
        <div>
          <ChartTwo
            data={data?.['chart-two']}
            title={meta?.charts?.find((c) => c.id === 'chart-two')?.title ?? 'User Analytics'}
            loading={loading}
          />
        </div>
        <div className="lg:col-span-2">
          <ChartThree
            data={data?.['chart-three']}
            title={meta?.charts?.find((c) => c.id === 'chart-three')?.title ?? 'Performance Metrics'}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
