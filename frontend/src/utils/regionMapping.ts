// NOTE: Keep in sync with backend/src/utils/regionMapping.ts

export const REGIONS = ['North', 'East', 'South', 'West'];

export const STATE_TO_REGION: Record<string, string> = {
  // North
  'North Dakota': 'North',
  'South Dakota': 'North',
  'Minnesota': 'North',
  'Wisconsin': 'North',
  'Michigan': 'North',
  'Illinois': 'North',
  'Indiana': 'North',
  'Ohio': 'North',
  'Iowa': 'North',
  'Nebraska': 'North',
  'Kansas': 'North',
  'Missouri': 'North',
  
  // East
  'Maine': 'East',
  'New Hampshire': 'East',
  'Vermont': 'East',
  'Massachusetts': 'East',
  'Rhode Island': 'East',
  'Connecticut': 'East',
  'New York': 'East',
  'Pennsylvania': 'East',
  'New Jersey': 'East',
  'Delaware': 'East',
  'Maryland': 'East',
  'West Virginia': 'East',
  'Virginia': 'East',
  'North Carolina': 'East',
  'South Carolina': 'East',
  'Georgia': 'East',
  'Florida': 'East',
  
  // South
  'Kentucky': 'South',
  'Tennessee': 'South',
  'Alabama': 'South',
  'Mississippi': 'South',
  'Arkansas': 'South',
  'Louisiana': 'South',
  'Oklahoma': 'South',
  'Texas': 'South',
  
  // West
  'Montana': 'West',
  'Wyoming': 'West',
  'Colorado': 'West',
  'New Mexico': 'West',
  'Idaho': 'West',
  'Utah': 'West',
  'Arizona': 'West',
  'Nevada': 'West',
  'Washington': 'West',
  'Oregon': 'West',
  'California': 'West',
  'Alaska': 'West',
  'Hawaii': 'West',
};

export function getStatesInRegion(region: string, allStates: string[]): string[] {
  if (region === 'All') return allStates;
  
  return allStates.filter(state => STATE_TO_REGION[state] === region);
}

export function getRegionForState(state: string): string | undefined {
  return STATE_TO_REGION[state];
}
