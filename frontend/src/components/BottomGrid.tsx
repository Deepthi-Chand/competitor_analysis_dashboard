import React, { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, Cell, LabelList, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { BottomGridRow } from '../types';
import { getOrgColor, getPlanTypeColor } from '../utils/colors';
import { formatEnrollment } from '../utils/dataTransform';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface BottomGridProps {
  data: BottomGridRow[];
  loading: boolean;
}

interface PlanTypeDataPoint {
  year: number;
  [planType: string]: number;
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
        <div className="hidden xl:flex flex-col gap-3">
          <div className="h-10" />
          <div className="h-32 flex items-center justify-center">
            <div className="transform -rotate-90 whitespace-nowrap text-[11px] font-bold text-gray-600 uppercase tracking-wide">
              Market Share
            </div>
          </div>
          <div className="h-32 flex items-center justify-center">
            <div className="transform -rotate-90 whitespace-nowrap text-[11px] font-bold text-gray-600 uppercase tracking-wide">
              No of Plans
            </div>
          </div>
          <div className="h-32 flex items-center justify-center">
            <div className="transform -rotate-90 whitespace-nowrap text-[11px] font-bold text-gray-600 uppercase tracking-wide">
              Enrollments
            </div>
          </div>
          <div className="h-40 flex items-center justify-center">
            <div className="transform -rotate-90 whitespace-nowrap text-[11px] font-bold text-gray-600 uppercase tracking-wide">
              Plan Type Enrollments
            </div>
          </div>
        </div>

        {/* Organization columns */}
        {limitedData.slice(0, isLargeScreen ? 5 : 3).map((row, idx) => {
          const color = getOrgColor(row.org);
          const planTypeData = row.plan_type_enrollments.reduce((acc, item) => {
            const existing = acc.find(x => x.year === item.year);
            if (existing) {
              existing[item.plan_type] = item.value;
            } else {
              acc.push({ year: item.year, [item.plan_type]: item.value });
            }
            return acc;
          }, [] as PlanTypeDataPoint[]);

          const planTypes = Array.from(new Set(row.plan_type_enrollments.map(x => x.plan_type)))
            .filter(pt => row.plan_type_enrollments.some(x => x.plan_type === pt && x.value > 0));

          return (
            <div key={idx} className="flex flex-col gap-3">
              {/* Org name header */}
              <div
                className="h-10 flex items-center justify-center text-[12px] font-bold text-gray-800 rounded px-1 text-center leading-tight"
                style={{ backgroundColor: color }}
              >
                {row.org}
              </div>

              {/* Market Share mini chart */}
              <div className="h-32 border border-gray-100 rounded p-1">
                <div className="xl:hidden text-[10px] font-bold text-gray-600 uppercase tracking-wide text-center">Market Share</div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={row.market_share} margin={{ top: 12, right: 30, left: 30, bottom: 15 }}>
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={color}
                      strokeWidth={2}
                      dot={{ r: 3, fill: color }}
                    >
                      <LabelList
                        dataKey="value"
                        position="top"
                        formatter={(val: number) => `${val.toFixed(1)}%`}
                        style={{ fontSize: 10, fill: '#374151', fontWeight: 600 }}
                      />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* No of Plans mini chart */}
              <div className="h-32 border border-gray-100 rounded p-1">
                <div className="xl:hidden text-[10px] font-bold text-gray-600 uppercase tracking-wide text-center">No of Plans</div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={row.num_plans} margin={{ top: 12, right: 15, left: 15, bottom: 15 }}>
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                      {row.num_plans.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={color} fillOpacity={0.85} />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="top"
                        style={{ fontSize: 10, fill: '#374151', fontWeight: 600 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Enrollments mini chart */}
              <div className="h-32 border border-gray-100 rounded p-1">
                <div className="xl:hidden text-[10px] font-bold text-gray-600 uppercase tracking-wide text-center">Enrollments</div>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={row.enrollments} margin={{ top: 12, right: 30, left: 30, bottom: 15 }}>
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={color}
                      fill={color}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    >
                      <LabelList
                        dataKey="value"
                        position="top"
                        formatter={(val: number) => formatEnrollment(val)}
                        style={{ fontSize: 10, fill: '#374151', fontWeight: 600 }}
                      />
                    </Area>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Plan Type Enrollments mini chart */}
              <div className="h-40 border border-gray-100 rounded p-1">
                <div className="xl:hidden text-[10px] font-bold text-gray-600 uppercase tracking-wide text-center">Plan Type Enrollments</div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={planTypeData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="year" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(year: number) => `'${String(year).slice(2)}`} />
                    <YAxis hide />
                    <Legend
                      wrapperStyle={{ fontSize: 8, paddingTop: 2 }}
                      iconSize={8}
                      layout="horizontal"
                      align="center"
                      verticalAlign="bottom"
                    />
                    {planTypes.map((planType) => (
                      <Line
                        key={planType}
                        type="monotone"
                        dataKey={planType}
                        stroke={getPlanTypeColor(planType)}
                        strokeWidth={2}
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
