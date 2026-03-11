import { ChevronDown } from 'lucide-react';
import React from 'react';
import { CAFilterState, FilterOptions } from '../types';
import { getStatesInRegion } from '../utils/regionMapping';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface GlobalFilterProps {
  filters: CAFilterState;
  filterOptions: FilterOptions | null;
  onChange: (updated: Partial<CAFilterState>) => void;
}

const YEARS = [2023, 2024, 2025, 2026];
const MONTHS = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
];

const GlobalFilter: React.FC<GlobalFilterProps> = ({ filters, filterOptions, onChange }) => {
  const allStates = filterOptions?.states || [];
  const availableStates = filters.region && filters.region !== 'All'
    ? getStatesInRegion(filters.region, allStates.filter(s => s !== 'All'))
    : allStates;
  
  const counties = filterOptions?.counties[filters.state] || [];

  const renderMultiSelect = (
    label: string,
    options: string[],
    selected: string[],
    onUpdate: (values: string[]) => void
  ) => {
    const displayText = selected.length === 0
      ? 'All'
      : selected.length === 1
      ? selected[0]
      : `${selected.length} selected`;

    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <button className="h-8 px-3 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 flex items-center justify-between gap-2 min-w-[140px]">
              <span className="truncate">{displayText}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-2">
              {options.map((option) => {
                const isChecked = selected.includes(option);
                return (
                  <label
                    key={option}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onUpdate([...selected, option]);
                        } else {
                          onUpdate(selected.filter((v) => v !== option));
                        }
                      }}
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-end gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Period
          </label>
          <div className="flex items-center gap-2">
            <Select
              value={String(filters.period_from_year)}
              onValueChange={(v) => onChange({ period_from_year: Number(v) })}
            >
              <SelectTrigger className="h-8 w-20 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(filters.period_from_month)}
              onValueChange={(v) => onChange({ period_from_month: Number(v) })}
            >
              <SelectTrigger className="h-8 w-16 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month.value} value={String(month.value)}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-gray-400">—</span>
            <Select
              value={String(filters.period_to_year)}
              onValueChange={(v) => onChange({ period_to_year: Number(v) })}
            >
              <SelectTrigger className="h-8 w-20 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(filters.period_to_month)}
              onValueChange={(v) => onChange({ period_to_month: Number(v) })}
            >
              <SelectTrigger className="h-8 w-16 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month.value} value={String(month.value)}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Region
          </label>
          <Select
            value={filters.region}
            onValueChange={(v) => onChange({ region: v, state: 'All', county: 'All' })}
          >
            <SelectTrigger className="h-8 w-32 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterOptions?.regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            State
          </label>
          <Select
            value={filters.state}
            onValueChange={(v) => onChange({ state: v, county: 'All' })}
          >
            <SelectTrigger className="h-8 w-32 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            County
          </label>
          <Select
            value={filters.county}
            onValueChange={(v) => onChange({ county: v })}
          >
            <SelectTrigger className="h-8 w-32 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {counties.map((county) => (
                <SelectItem key={county} value={county}>
                  {county}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Ind-Grp Plans
          </label>
          <Select
            value={filters.ind_grp_plans}
            onValueChange={(v) => onChange({ ind_grp_plans: v, ma_mapd_pdp: [], snp_plan_type: [], plan_type: [] })}
          >
            <SelectTrigger className="h-8 w-40 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterOptions?.ind_grp_options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {renderMultiSelect(
          'MA-MAPD-PDP',
          filterOptions?.ma_mapd_pdp_options || [],
          filters.ma_mapd_pdp,
          (values) => onChange({ ma_mapd_pdp: values, snp_plan_type: [], plan_type: [] })
        )}

        {renderMultiSelect(
          'SNP Plan Type',
          filterOptions?.snp_plan_types || [],
          filters.snp_plan_type,
          (values) => onChange({ snp_plan_type: values, plan_type: [] })
        )}

        {renderMultiSelect(
          'Plan Type',
          filterOptions?.plan_types || [],
          filters.plan_type,
          (values) => onChange({ plan_type: values })
        )}

      </div>
    </div>
  );
};

export default GlobalFilter;
