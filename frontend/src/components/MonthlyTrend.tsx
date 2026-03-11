import { ChevronDown } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { LabelList, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MonthlyTrendPoint } from '../types';
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

  const CustomizedLastLabel = (props: any) => {
    const { x, y, value, index, data, dataKey } = props;
    if (index === data.length - 1) {
      return (
        <text x={x + 5} y={y} fill={orgColor(dataKey)} fontSize={10} fontWeight={600}>
          {formatEnrollment(value)}
        </text>
      );
    }
    return null;
  };

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
      <Card className="p-4 h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Monthly Trend</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Parent Org:</span>
            {OrgPicker}
          </div>
        </div>
        <Skeleton className="h-72 w-full" />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-4 h-full">
        <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Monthly Trend</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-gray-400">No data for selected filters</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Monthly Trend</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Parent Org:</span>
            {OrgPicker}
          </div>
          <div className="flex gap-1 border border-gray-300 rounded">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-2 py-1 text-xs font-medium ${
                viewMode === 'monthly' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('fitted')}
              className={`px-2 py-1 text-xs font-medium ${
                viewMode === 'fitted' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Fitted
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 10, right: 80, left: 10, bottom: 5 }}>
            <XAxis dataKey="period" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => formatEnrollment(val)} />
            <Tooltip
              formatter={(value: number) => formatEnrollment(value)}
              contentStyle={{ fontSize: 11 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {orgKeys.map((orgKey) => (
              <Line
                key={orgKey}
                type={viewMode === 'fitted' ? 'basis' : 'monotone'}
                dataKey={orgKey}
                stroke={orgColor(orgKey)}
                strokeWidth={2}
                dot={{ r: 3, fill: orgColor(orgKey) }}
                activeDot={{ r: 5 }}
              >
                <LabelList content={<CustomizedLastLabel data={data} dataKey={orgKey} />} />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default MonthlyTrend;
