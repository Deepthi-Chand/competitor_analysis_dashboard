import { Info, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CAFilterState, MarketShareOrg } from '../types';
import { getOrgColor } from '../utils/colors';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface MarketShareProps {
  data: MarketShareOrg[];
  loading: boolean;
  filters: CAFilterState;
}

const MONTH_NAMES: Record<number, string> = {
  1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May', 6: 'June',
  7: 'July', 8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December'
};


const MarketShare: React.FC<MarketShareProps> = ({ data, loading, filters }) => {
  const monthName = MONTH_NAMES[filters.period_to_month] || 'February';
  const year = filters.period_to_year || 2026;

  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => b.market_share_pct - a.market_share_pct);
  }, [data]);

  const pieData = useMemo(() => {
    return sortedData.map(org => ({
      name: org.org,
      value: org.market_share_pct,
    }));
  }, [sortedData]);


  if (loading) {
    return (
      <Card className="p-3 h-full border-t-4 border-t-purple-600">
        <div className="flex items-center gap-1 mb-2">
          <h3 className="text-sm font-semibold text-purple-900">Market Share</h3>
          <span className="text-[10px] text-gray-500">({monthName} {year})</span>
          <Info className="h-3 w-3 text-gray-400" />
        </div>
        <div className="flex gap-2">
          <div className="w-2/5 flex items-center justify-center">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
          <div className="w-3/5 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-3 h-full border-t-4 border-t-purple-600">
        <div className="flex items-center gap-1 mb-2">
          <h3 className="text-sm font-semibold text-purple-900">Market Share</h3>
          <span className="text-[10px] text-gray-500">({monthName} {year})</span>
          <Info className="h-3 w-3 text-gray-400" />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-gray-400">No data for selected filters</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3 h-full flex flex-col border-t-4 border-t-purple-600">
      <div className="flex items-center gap-1 mb-2">
        <h3 className="text-base font-bold text-purple-900">Market Share</h3>
        <span className="text-[11px] text-gray-500">({monthName} {year})</span>
        <Info className="h-3 w-3 text-gray-400" />
      </div>
      
      {/* Pie chart - centered at top */}
      <div className="flex justify-center mb-2">
        <ResponsiveContainer width={180} height={140}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={60}
              dataKey="value"
              paddingAngle={1}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getOrgColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}%`,
                name
              ]}
              contentStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Table - below the chart */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1 grid grid-cols-12 gap-1 px-1 flex-shrink-0">
          <div className="col-span-5">Parent Organization</div>
          <div className="col-span-3 text-center">Market Share</div>
          <div className="col-span-4 text-center">Growth Over Market Avg.</div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-0.5 px-1 min-h-0 max-h-[120px]">
          {sortedData.map((org, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-1 items-center text-[11px] py-0.5">
                <div className="col-span-5 flex items-center gap-1">
                  <div
                    className="w-1.5 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: getOrgColor(org.org) }}
                  />
                  <span className="truncate font-medium text-gray-700">{org.org}</span>
                </div>
                <div className="col-span-3 text-center font-semibold text-gray-700">
                  {org.market_share_pct.toFixed(2)}%
                </div>
                <div className={`col-span-4 flex items-center justify-center gap-0.5 font-medium ${org.above_avg === null ? 'text-gray-400' : org.above_avg ? 'text-green-600' : 'text-red-600'}`}>
                  {org.above_avg === null ? null : org.above_avg ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{org.growth_vs_avg !== null ? `${(org.growth_vs_avg ?? 0) > 0 ? '+' : ''}${org.growth_vs_avg?.toFixed(1)}%` : 'N/A'}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
};

export default MarketShare;
