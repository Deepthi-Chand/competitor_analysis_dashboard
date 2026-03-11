import { ChevronDown, Info } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MonthlyTrendPoint } from '../types';
import { getOrgColor } from '../utils/colors';
import { formatEnrollment } from '../utils/dataTransform';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Skeleton } from './ui/skeleton';

interface MonthlyTrendProps {
  data: MonthlyTrendPoint[];
  loading: boolean;
  selectedOrgs: string[];
  allOrgs: string[];
  onOrgsChange: (orgs: string[]) => void;
}


const MonthlyTrend: React.FC<MonthlyTrendProps> = ({ data, loading, selectedOrgs, allOrgs, onOrgsChange }) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'fitted'>('monthly');

  const orgDisplayText = selectedOrgs.length === 0
    ? 'All'
    : selectedOrgs.length === 1
    ? selectedOrgs[0]
    : `${selectedOrgs.length} selected`;

  const orgKeys = useMemo(() => {
    if (!data || data.length === 0) return [];
    const keys = Object.keys(data[0]).filter(k => !['period', 'year', 'month_num'].includes(k));
    return keys;
  }, [data]);

  const orgDataByOrg = useMemo(() => {
    if (!data || data.length === 0 || orgKeys.length === 0) return [];
    return orgKeys.map(org => {
      const orgData = data.map(point => ({
        period: point.period,
        year: point.year,
        month_num: point.month_num,
        value: typeof point[org] === 'number' ? point[org] as number : 0,
      }));
      const values = orgData.map(d => d.value);
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const startValue = orgData[0]?.value ?? 0;
      const endValue = orgData[orgData.length - 1]?.value ?? 0;

      // MoM: compare each month to the previous month
      const momData = orgData.slice(1).map((point, i) => {
        const prevValue = orgData[i].value;
        const change = prevValue > 0 ? ((point.value - prevValue) / prevValue) * 100 : 0;
        return { period: point.period, value: change };
      });

      // QoQ: group by calendar quarter (Q1=Jan-Mar, Q2=Apr-Jun, Q3=Jul-Sep, Q4=Oct-Dec)
      const quarterMap = new Map<string, { total: number; count: number }>();
      orgData.forEach(p => {
        const q = Math.ceil(p.month_num / 3);
        const key = `${p.year}-Q${q}`;
        const existing = quarterMap.get(key) ?? { total: 0, count: 0 };
        quarterMap.set(key, { total: existing.total + p.value, count: existing.count + 1 });
      });
      const sortedQuarters = Array.from(quarterMap.entries()).sort(([a], [b]) => a.localeCompare(b));
      const qoqData = sortedQuarters.slice(1).map(([key, curr], i) => {
        const prevAvg = sortedQuarters[i][1].total / sortedQuarters[i][1].count;
        const currAvg = curr.total / curr.count;
        const change = prevAvg > 0 ? ((currAvg - prevAvg) / prevAvg) * 100 : 0;
        return { period: key, value: change };
      });

      // YoY: compare same month_num one year prior using a lookup map
      const valueByYM = new Map<string, number>();
      orgData.forEach(p => valueByYM.set(`${p.year}-${p.month_num}`, p.value));
      const yoyData = orgData
        .filter(p => valueByYM.has(`${p.year - 1}-${p.month_num}`))
        .map(p => {
          const prevYearValue = valueByYM.get(`${p.year - 1}-${p.month_num}`)!;
          const change = prevYearValue > 0 ? ((p.value - prevYearValue) / prevYearValue) * 100 : 0;
          return { period: p.period, value: change };
        });
      
      return {
        org,
        color: getOrgColor(org),
        data: orgData,
        startValue,
        endValue,
        minVal,
        maxVal,
        momData,
        qoqData,
        yoyData
      };
    }).sort((a, b) => b.endValue - a.endValue);
  }, [data, orgKeys]);

  const OrgPicker = (
    <Popover>
      <PopoverTrigger asChild>
        <button className="h-6 px-2 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 flex items-center gap-1 max-w-[160px]">
          <span className="truncate">{orgDisplayText}</span>
          <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 max-h-64 overflow-y-auto">
        <div className="space-y-1">
          {allOrgs.map((org) => (
            <label key={org} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <Checkbox
                checked={selectedOrgs.includes(org)}
                onCheckedChange={(checked) => {
                  onOrgsChange(
                    checked ? [...selectedOrgs, org] : selectedOrgs.filter((o) => o !== org)
                  );
                }}
              />
              <span className="text-xs">{org}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );

  if (loading) {
    return (
      <Card className="p-3 h-full border-t-4 border-t-purple-600">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <h3 className="text-base font-bold text-purple-900">Monthly Trend</h3>
            <Info className="h-3 w-3 text-gray-400" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-3 h-full border-t-4 border-t-purple-600">
        <div className="flex items-center gap-1 mb-2">
          <h3 className="text-base font-bold text-purple-900">Monthly Trend</h3>
          <Info className="h-3 w-3 text-gray-400" />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-gray-400">No data for selected filters</div>
        </div>
      </Card>
    );
  }

  const periods = data.map(d => d.period);

  return (
    <Card className="p-3 h-full flex flex-col border-t-4 border-t-purple-600">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <h3 className="text-base font-bold text-purple-900">Monthly Trend</h3>
          <Info className="h-3 w-3 text-gray-400" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-gray-600 uppercase">Parent Organization</span>
            {OrgPicker}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-gray-600 uppercase">Select View</span>
            <div className="flex text-[10px]">
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-2 py-0.5 border border-gray-300 rounded-l ${
                  viewMode === 'monthly' ? 'bg-gray-100 font-medium' : 'bg-white text-gray-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setViewMode('fitted')}
                className={`px-2 py-0.5 border border-l-0 border-gray-300 rounded-r ${
                  viewMode === 'fitted' ? 'bg-gray-100 font-medium' : 'bg-white text-gray-600'
                }`}
              >
                Fitted View
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'monthly' ? (
        /* Monthly View - Stacked line charts - one per org */
        <div className="flex-1 overflow-y-auto">
          {orgDataByOrg.map((orgItem, idx) => (
            <div key={orgItem.org} className="flex items-center h-[40px] border-b border-gray-100 last:border-b-0">
              {/* Org name with color indicator */}
              <div className="w-[100px] flex-shrink-0 flex items-center gap-1 pr-2">
                <div 
                  className="w-1.5 h-4 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: orgItem.color }} 
                />
                <span className="text-[11px] font-medium text-gray-700 truncate" title={orgItem.org}>
                  {orgItem.org}
                </span>
              </div>
              
              {/* Start value */}
              <div className="w-[55px] flex-shrink-0 text-right pr-2">
                <span className="text-[11px] font-semibold text-gray-600">
                  {formatEnrollment(orgItem.startValue)}
                </span>
              </div>
              
              {/* Line chart */}
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={orgItem.data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="period" hide />
                    <YAxis 
                      hide 
                      domain={[
                        orgItem.minVal === orgItem.maxVal ? orgItem.minVal * 0.9 : orgItem.minVal,
                        orgItem.minVal === orgItem.maxVal ? orgItem.maxVal * 1.1 : orgItem.maxVal
                      ]} 
                    />
                    <Tooltip
                      formatter={(value: number) => formatEnrollment(value)}
                      contentStyle={{ fontSize: 9 }}
                      labelStyle={{ fontSize: 9 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={orgItem.color}
                      strokeWidth={2}
                      dot={{ r: 2, fill: orgItem.color }}
                      activeDot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* End value */}
              <div className="w-[55px] flex-shrink-0 text-left pl-2">
                <span className="text-[11px] font-semibold" style={{ color: orgItem.color }}>
                  {formatEnrollment(orgItem.endValue)}
                </span>
              </div>
            </div>
          ))}
          
          {/* X-axis labels row */}
          <div className="flex items-center h-[20px]">
            <div className="w-[100px] flex-shrink-0" />
            <div className="w-[55px] flex-shrink-0" />
            <div className="flex-1 flex justify-between px-1 text-[10px] text-gray-500">
              {data.length > 0 && (
                <>
                  <span>{data[0]?.period}</span>
                  {data.length > 4 && <span>{data[Math.floor(data.length / 4)]?.period}</span>}
                  {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.period}</span>}
                  {data.length > 4 && <span>{data[Math.floor(data.length * 3 / 4)]?.period}</span>}
                  <span>{data[data.length - 1]?.period}</span>
                </>
              )}
            </div>
            <div className="w-[55px] flex-shrink-0" />
          </div>
        </div>
      ) : (
        /* Fitted View - MoM, QoQ, YoY trends */
        <div className="flex-1 overflow-y-auto">
          {/* Header row */}
          <div className="flex items-center h-[24px] border-b border-gray-200 bg-gray-50">
            <div className="w-[100px] flex-shrink-0 px-2">
              <span className="text-[10px] font-bold text-gray-600 uppercase">Organization</span>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2">
              <div className="text-center text-[10px] font-bold text-gray-600 uppercase">MoM</div>
              <div className="text-center text-[10px] font-bold text-gray-600 uppercase">QoQ</div>
              <div className="text-center text-[10px] font-bold text-gray-600 uppercase">YoY</div>
            </div>
          </div>
          
          {orgDataByOrg.map((orgItem) => (
            <div key={orgItem.org} className="flex items-center h-[50px] border-b border-gray-100 last:border-b-0">
              {/* Org name with color indicator */}
              <div className="w-[100px] flex-shrink-0 flex items-center gap-1 pr-2">
                <div 
                  className="w-1.5 h-4 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: orgItem.color }} 
                />
                <span className="text-[11px] font-medium text-gray-700 truncate" title={orgItem.org}>
                  {orgItem.org}
                </span>
              </div>
              
              {/* Three trend charts: MoM, QoQ, YoY */}
              <div className="flex-1 grid grid-cols-3 gap-2 h-full">
                {/* MoM Chart */}
                <div className="h-full">
                  {orgItem.momData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={orgItem.momData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <XAxis dataKey="period" hide />
                        <YAxis hide domain={['dataMin', 'dataMax']} />
                        <Tooltip
                          formatter={(value: number) => `${value.toFixed(1)}%`}
                          contentStyle={{ fontSize: 11 }}
                          labelStyle={{ fontSize: 11 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={orgItem.color}
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[10px] text-gray-400">N/A</div>
                  )}
                </div>
                
                {/* QoQ Chart */}
                <div className="h-full">
                  {orgItem.qoqData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={orgItem.qoqData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <XAxis dataKey="period" hide />
                        <YAxis hide domain={['dataMin', 'dataMax']} />
                        <Tooltip
                          formatter={(value: number) => `${value.toFixed(1)}%`}
                          contentStyle={{ fontSize: 11 }}
                          labelStyle={{ fontSize: 11 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={orgItem.color}
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[10px] text-gray-400">N/A</div>
                  )}
                </div>
                
                {/* YoY Chart */}
                <div className="h-full">
                  {orgItem.yoyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={orgItem.yoyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <XAxis dataKey="period" hide />
                        <YAxis hide domain={['dataMin', 'dataMax']} />
                        <Tooltip
                          formatter={(value: number) => `${value.toFixed(1)}%`}
                          contentStyle={{ fontSize: 11 }}
                          labelStyle={{ fontSize: 11 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={orgItem.color}
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[10px] text-gray-400">N/A</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default MonthlyTrend;
