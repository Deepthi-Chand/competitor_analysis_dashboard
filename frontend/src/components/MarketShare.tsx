import React, { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { MarketShareOrg } from '../types';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface MarketShareProps {
  data: MarketShareOrg[];
  loading: boolean;
}

const ORG_COLORS: Record<string, string> = {
  'Elevance': '#6366F1',
  'Elevance Health': '#6366F1',
  'Humana Inc.': '#F472B6',
  'UHG': '#FBBF24',
  'CVS': '#818CF8',
  'MEDICAL MUTUAL OF OHIO': '#94A3B8',
  'Centene Corporation': '#FB923C',
  'Devoted Health, Inc.': '#34D399',
  'The Cigna Group': '#38BDF8',
};

const DEFAULT_ORG_COLOR = '#CBD5E1';

function orgColor(org: string): string {
  return ORG_COLORS[org] ?? DEFAULT_ORG_COLOR;
}

const MarketShare: React.FC<MarketShareProps> = ({ data, loading }) => {
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
      <Card className="p-4 h-full">
        <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Market Share</h3>
        <div className="flex gap-4">
          <div className="w-1/2 flex items-center justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
          <div className="w-1/2 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-4 h-full">
        <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Market Share</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-gray-400">No data for selected filters</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 h-full flex flex-col">
      <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Market Share</h3>
      
      <div className="flex gap-4 flex-1">
        <div className="w-1/2">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                dataKey="value"
                paddingAngle={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={orgColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`,
                  name
                ]}
                contentStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-1/2 flex flex-col">
          <div className="text-[9px] font-semibold text-gray-600 uppercase tracking-wide mb-2 grid grid-cols-12 gap-1">
            <div className="col-span-6">Organization</div>
            <div className="col-span-3 text-right">Share</div>
            <div className="col-span-3 text-right">vs Avg</div>
          </div>
          <div className="space-y-1 overflow-y-auto max-h-48 pr-2">
            {sortedData.map((org, idx) => {
              const isAboveAvg = org.above_avg;
              const growthVal = org.growth_vs_avg ?? 0;
              return (
                <div key={idx} className="grid grid-cols-12 gap-1 items-center text-[10px] py-0.5">
                  <div className="col-span-6 flex items-center gap-1">
                    <div
                      className="w-1 h-3.5 rounded"
                      style={{ backgroundColor: orgColor(org.org) }}
                    />
                    <span className="truncate font-medium text-gray-800">{org.org}</span>
                  </div>
                  <div className="col-span-3 text-right font-semibold text-gray-700">
                    {org.market_share_pct.toFixed(1)}%
                  </div>
                  <div className={`col-span-3 text-right font-semibold ${isAboveAvg ? 'text-green-600' : 'text-red-600'}`}>
                    {growthVal >= 0 ? '+' : ''}{growthVal.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MarketShare;
