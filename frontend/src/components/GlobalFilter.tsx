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

interface MonthYearOption {
  value: string;
  label: string;
  month: number;
  year: number;
}

// Generate combined month-year options (e.g., "Feb-2025")
function generateMonthYearOptions(years: number[]): MonthYearOption[] {
  return years.flatMap(year =>
    MONTHS.map(month => ({
      value: `${month.value}-${year}`,
      label: `${month.label}-${year}`,
      month: month.value,
      year: year,
    }))
  );
}

const GlobalFilter: React.FC<GlobalFilterProps> = ({ filters, filterOptions, onChange }) => {
  const allStates = filterOptions?.states || [];
  const availableStates = filters.region && filters.region !== 'All'
    ? getStatesInRegion(filters.region, allStates.filter(s => s !== 'All'))
    : allStates;
  
  const counties = filterOptions?.counties[filters.state] || [];
  const years = filterOptions?.years || [];
  const monthYearOptions = generateMonthYearOptions(years);

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
      : `Multiple values`;

    return (
      <div className="flex flex-col">
        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">
          {label}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <button className="h-6 px-2 text-[11px] text-purple-700 font-medium bg-transparent hover:bg-gray-50 flex items-center gap-1">
              <span className="truncate">{displayText}</span>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2">
            <div className="space-y-1">
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
                    <span className="text-xs">{option}</span>
                  </label>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const fromMonthLabel = MONTHS.find(m => m.value === filters.period_from_month)?.label || '';
  const toMonthLabel = MONTHS.find(m => m.value === filters.period_to_month)?.label || '';
  const fromValue = `${filters.period_from_month}-${filters.period_from_year}`;
  const toValue = `${filters.period_to_month}-${filters.period_to_year}`;
  const periodDisplay = `${fromMonthLabel}-${filters.period_from_year} to ${toMonthLabel}-${filters.period_to_year}`;

  // Filter options to prevent invalid date ranges
  const fromYearMonth = filters.period_from_year * 100 + filters.period_from_month;
  const toYearMonth = filters.period_to_year * 100 + filters.period_to_month;
  const validToOptions = monthYearOptions.filter(opt => opt.year * 100 + opt.month >= fromYearMonth);
  const validFromOptions = monthYearOptions.filter(opt => opt.year * 100 + opt.month <= toYearMonth);

  return (
    <div className="flex items-center gap-6 flex-wrap">
      {/* Period */}
      <div className="flex flex-col">
        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">Period</label>
        <Popover>
          <PopoverTrigger asChild>
            <button className="h-6 px-2 text-[11px] text-purple-700 font-medium bg-transparent hover:bg-gray-50 flex items-center gap-1">
              <span>{periodDisplay}</span>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-gray-500 uppercase">From</span>
                <Select
                  value={fromValue}
                  onValueChange={(v) => {
                    const opt = monthYearOptions.find(o => o.value === v);
                    if (opt) onChange({ period_from_month: opt.month, period_from_year: opt.year });
                  }}
                >
                  <SelectTrigger className="h-7 w-24 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {validFromOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-gray-400 text-xs mt-4">to</span>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-gray-500 uppercase">To</span>
                <Select
                  value={toValue}
                  onValueChange={(v) => {
                    const opt = monthYearOptions.find(o => o.value === v);
                    if (opt) onChange({ period_to_month: opt.month, period_to_year: opt.year });
                  }}
                >
                  <SelectTrigger className="h-7 w-24 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {validToOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Sales Region */}
      <div className="flex flex-col">
        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">Sales Region</label>
        <Select
          value={filters.region}
          onValueChange={(v) => onChange({ region: v, state: 'All', county: 'All' })}
        >
          <SelectTrigger className="h-6 w-auto min-w-[60px] border-0 shadow-none text-[11px] text-purple-700 font-medium p-0 px-2">
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

      {/* State */}
      <div className="flex flex-col">
        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">State</label>
        <Select
          value={filters.state}
          onValueChange={(v) => onChange({ state: v, county: 'All' })}
        >
          <SelectTrigger className="h-6 w-auto min-w-[60px] border-0 shadow-none text-[11px] text-purple-700 font-medium p-0 px-2">
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

      {/* County */}
      <div className="flex flex-col">
        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">County</label>
        <Select
          value={filters.county}
          onValueChange={(v) => onChange({ county: v })}
        >
          <SelectTrigger className="h-6 w-auto min-w-[60px] border-0 shadow-none text-[11px] text-purple-700 font-medium p-0 px-2">
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

      {/* Ind-Grp Plans */}
      <div className="flex flex-col">
        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">Ind-Grp Plans</label>
        <Select
          value={filters.ind_grp_plans}
          onValueChange={(v) => onChange({ ind_grp_plans: v, ma_mapd_pdp: [], snp_plan_type: [], plan_type: [] })}
        >
          <SelectTrigger className="h-6 w-auto min-w-[100px] border-0 shadow-none text-[11px] text-purple-700 font-medium p-0 px-2">
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
  );
};

export default GlobalFilter;
