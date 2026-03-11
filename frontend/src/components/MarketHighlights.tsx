import { Info } from 'lucide-react';
import React from 'react';
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { MarketHighlightsData } from '../types';
import { formatEnrollment } from '../utils/dataTransform';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface MarketHighlightsProps {
  data: MarketHighlightsData | null;
  loading: boolean;
}

const MarketHighlights: React.FC<MarketHighlightsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card className="p-3 h-full border-t-4 border-t-purple-600">
        <div className="flex items-center gap-1 mb-2">
          <h3 className="text-base font-bold text-purple-900">Market Highlights</h3>
          <Info className="h-3 w-3 text-gray-400" />
        </div>
        <div className="flex gap-4 justify-center mb-4">
          <Skeleton className="h-48 w-24" />
          <Skeleton className="h-48 w-24" />
        </div>
        <Skeleton className="h-10 w-full" />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-3 h-full border-t-4 border-t-purple-600">
        <div className="flex items-center gap-1 mb-2">
          <h3 className="text-base font-bold text-purple-900">Market Highlights</h3>
          <Info className="h-3 w-3 text-gray-400" />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-gray-400">No data for selected filters</div>
        </div>
      </Card>
    );
  }

  const growthPositive = data.enrollment_growth_pct >= 0;

  const period1Data = [
    { name: 'Eligibles', value: data.period1.eligibles, fill: '#E5E7EB' },
    { name: 'Enrollments', value: data.period1.enrollments, fill: '#9CA3AF' },
  ];

  const period2Data = [
    { name: 'Eligibles', value: data.period2.eligibles, fill: '#E5E7EB' },
    { name: 'Enrollments', value: data.period2.enrollments, fill: '#9CA3AF' },
  ];

  return (
    <Card className="p-3 h-full flex flex-col border-t-4 border-t-purple-600">
      <div className="flex items-center gap-1 mb-1">
        <h3 className="text-base font-bold text-purple-900">Market Highlights</h3>
        <Info className="h-3 w-3 text-gray-400" />
      </div>
      <p className="text-[11px] text-gray-500 italic mb-2">Market metrics for the states and counties selected</p>
      
      <div className="flex-1 flex gap-2">
        {/* Period 1 */}
        <div className="flex-1">
          <div className="text-center mb-1">
            <div className="text-[11px] font-bold text-gray-600 uppercase">Penetration</div>
            <div className="text-lg font-bold text-gray-800">{data.period1.penetration_pct.toFixed(1)}%</div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={period1Data} margin={{ top: 15, right: 5, left: 5, bottom: 20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {period1Data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="top" 
                  formatter={(val: number) => formatEnrollment(val)} 
                  style={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="text-center text-[12px] text-gray-600 -mt-2">{data.period1.month} {data.period1.year}</div>
        </div>

        {/* Period 2 */}
        <div className="flex-1">
          <div className="text-center mb-1">
            <div className="text-[11px] font-bold text-gray-600 uppercase">Penetration</div>
            <div className="text-lg font-bold text-gray-800">{data.period2.penetration_pct.toFixed(1)}%</div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={period2Data} margin={{ top: 15, right: 5, left: 5, bottom: 20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {period2Data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="top" 
                  formatter={(val: number) => formatEnrollment(val)} 
                  style={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="text-center text-[12px] text-gray-600 -mt-2">{data.period2.month} {data.period2.year}</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2 mb-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-200"></div>
          <span className="text-[11px] text-gray-600">Eligibles</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-400"></div>
          <span className="text-[11px] text-gray-600">Enrollments</span>
        </div>
      </div>

      <div className="border-t pt-2">
        <div className="text-center">
          <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Enrollment Growth</div>
          <div className={`text-xl font-bold ${growthPositive ? 'text-green-600' : 'text-red-600'}`}>
            {data.enrollment_growth_pct >= 0 ? '+' : ''}{data.enrollment_growth_pct.toFixed(2)}%
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MarketHighlights;
