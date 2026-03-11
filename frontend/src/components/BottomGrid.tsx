import React, { useEffect, useState } from 'react';
import { Bar, BarChart, Cell, LabelList, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { BottomGridRow } from '../types';
import { formatEnrollment } from '../utils/dataTransform';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface BottomGridProps {
  data: BottomGridRow[];
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

const PLAN_TYPE_COLORS: Record<string, string> = {
  'HMO': '#6366F1',
  'HMO-POS': '#F472B6',
  'Local PPO': '#FBBF24',
  'Regional PPO': '#34D399',
  'PFFS': '#FB923C',
};

const DEFAULT_PLAN_TYPE_COLOR = '#94A3B8';

function planTypeColor(planType: string): string {
  return PLAN_TYPE_COLORS[planType] ?? DEFAULT_PLAN_TYPE_COLOR;
}

const BottomGrid: React.FC<BottomGridProps> = ({ data, loading }) => {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1280);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1280);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-gray-400">No data for selected filters</div>
        </div>
      </Card>
    );
  }

  const limitedData = data.slice(0, 5);

  return (
    <Card className="p-4">
      <div className="grid xl:grid-cols-[auto_repeat(5,1fr)] grid-cols-3 gap-4">
        {/* Row labels column - hidden on screens < 1280px */}
        <div className="hidden xl:flex flex-col justify-around">
          <div className="h-12" />
          <div className="h-32 flex items-center justify-center">
            <div className="transform -rotate-90 whitespace-nowrap text-[10px] font-bold text-gray-600 uppercase tracking-wide">
              Market Share
            </div>
          </div>
          <div className="h-32 flex items-center justify-center">
            <div className="transform -rotate-90 whitespace-nowrap text-[10px] font-bold text-gray-600 uppercase tracking-wide">
              No of Plans
            </div>
          </div>
          <div className="h-32 flex items-center justify-center">
            <div className="transform -rotate-90 whitespace-nowrap text-[10px] font-bold text-gray-600 uppercase tracking-wide">
              Enrollments
            </div>
          </div>
          <div className="h-40 flex items-center justify-center">
            <div className="transform -rotate-90 whitespace-nowrap text-[10px] font-bold text-gray-600 uppercase tracking-wide">
              Plan Type Enrollments
            </div>
          </div>
        </div>

        {/* Organization columns */}
        {limitedData.slice(0, isLargeScreen ? 5 : 3).map((row, idx) => {
          const color = orgColor(row.org);
          const planTypeData = row.plan_type_enrollments.reduce((acc, item) => {
            const existing = acc.find(x => x.year === item.year);
            if (existing) {
              existing[item.plan_type] = item.value;
            } else {
              acc.push({ year: item.year, [item.plan_type]: item.value });
            }
            return acc;
          }, [] as any[]);

          const planTypes = Array.from(new Set(row.plan_type_enrollments.map(x => x.plan_type)));

          return (
            <div key={idx} className="flex flex-col gap-2">
              {/* Org name header */}
              <div
                className="h-12 flex items-center justify-center text-xs font-bold text-white rounded px-2 text-center"
                style={{ backgroundColor: color }}
              >
                {row.org}
              </div>

              {/* Market Share mini chart */}
              <div className="h-32 border border-gray-200 rounded p-1">
                <div className="xl:hidden text-[9px] font-semibold text-gray-600 uppercase tracking-wide text-center mb-1">Market Share</div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={row.market_share} margin={{ top: 15, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="year" hide />
                    <YAxis hide />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={color}
                      strokeWidth={2}
                      dot={{ r: 4, fill: color }}
                    >
                      <LabelList
                        dataKey="value"
                        position="top"
                        formatter={(val: number) => val.toFixed(1)}
                        style={{ fontSize: 9, fill: color, fontWeight: 600 }}
                      />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* No of Plans mini chart */}
              <div className="h-32 border border-gray-200 rounded p-1">
                <div className="xl:hidden text-[9px] font-semibold text-gray-600 uppercase tracking-wide text-center mb-1">No of Plans</div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={row.num_plans} margin={{ top: 15, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="year" hide />
                    <YAxis hide />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                      {row.num_plans.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={color} fillOpacity={0.8} />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="top"
                        style={{ fontSize: 9, fill: color, fontWeight: 600 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Enrollments mini chart */}
              <div className="h-32 border border-gray-200 rounded p-1">
                <div className="xl:hidden text-[9px] font-semibold text-gray-600 uppercase tracking-wide text-center mb-1">Enrollments</div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={row.enrollments} margin={{ top: 15, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="year" hide />
                    <YAxis hide />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                      {row.enrollments.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="top"
                        formatter={(val: number) => formatEnrollment(val)}
                        style={{ fontSize: 9, fill: color, fontWeight: 600 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Plan Type Enrollments mini chart */}
              <div className="h-40 border border-gray-200 rounded p-1">
                <div className="xl:hidden text-[9px] font-semibold text-gray-600 uppercase tracking-wide text-center mb-1">Plan Type Enrollments</div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={planTypeData} margin={{ top: 5, right: 5, left: 5, bottom: 15 }}>
                    <XAxis dataKey="year" tick={{ fontSize: 8 }} />
                    <YAxis hide />
                    <Legend wrapperStyle={{ fontSize: 8 }} iconSize={6} />
                    {planTypes.map((planType) => (
                      <Line
                        key={planType}
                        type="monotone"
                        dataKey={planType}
                        stroke={planTypeColor(planType)}
                        strokeWidth={1.5}
                        dot={{ r: 2 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default BottomGrid;
