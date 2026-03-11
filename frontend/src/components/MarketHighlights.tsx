import React from 'react';
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CAFilterState, MarketHighlightsData } from '../types';
import { formatEnrollment, formatPercentage } from '../utils/dataTransform';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface MarketHighlightsProps {
  data: MarketHighlightsData | null;
  loading: boolean;
  filters: CAFilterState;
}

const MarketHighlights: React.FC<MarketHighlightsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card className="p-4 h-full">
        <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Market Highlights</h3>
        <div className="flex gap-4 justify-center mb-4">
          <Skeleton className="h-56 w-24" />
          <Skeleton className="h-56 w-24" />
        </div>
        <Skeleton className="h-12 w-full" />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-4 h-full">
        <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Market Highlights</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-gray-400">No data for selected filters</div>
        </div>
      </Card>
    );
  }

  const chartData = [
    {
      name: data.period1.month,
      eligibles: data.period1.eligibles,
      enrollments: data.period1.enrollments,
      penetration: data.period1.penetration_pct,
    },
    {
      name: data.period2.month,
      eligibles: data.period2.eligibles,
      enrollments: data.period2.enrollments,
      penetration: data.period2.penetration_pct,
    },
  ];

  const growthPositive = data.enrollment_growth_pct >= 0;

  return (
    <Card className="p-4 h-full flex flex-col">
      <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Market Highlights</h3>
      
      <div className="flex-1 mb-4">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 30, right: 10, left: 10, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => formatEnrollment(val)} />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatEnrollment(value),
                name === 'eligibles' ? 'Eligibles' : 'Enrollments'
              ]}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="eligibles" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-elig-${index}`} fill="#94A3B8" />
              ))}
              <LabelList dataKey="eligibles" position="top" formatter={(val: number) => formatEnrollment(val)} style={{ fontSize: 10, fill: '#64748B' }} />
            </Bar>
            <Bar dataKey="enrollments" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-enr-${index}`} fill="#8B5CF6" />
              ))}
              <LabelList dataKey="enrollments" position="top" formatter={(val: number) => formatEnrollment(val)} style={{ fontSize: 10, fill: '#7C3AED' }} />
            </Bar>
            <LabelList
              dataKey="penetration"
              position="top"
              offset={45}
              formatter={(val: number) => formatPercentage(val)}
              style={{ fontSize: 11, fontWeight: 600, fill: '#1E293B' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="border-t pt-3">
        <div className="text-center">
          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Enrollment Growth</div>
          <div className={`text-2xl font-bold ${growthPositive ? 'text-green-600' : 'text-red-600'}`}>
            {data.enrollment_growth_pct >= 0 ? '+' : ''}{data.enrollment_growth_pct.toFixed(1)}%
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MarketHighlights;
