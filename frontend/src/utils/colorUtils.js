/**
 * TVS → Color Mapping Utilities
 * 7-step color ramp: Deep Blue → Cool Blue → Cool Teal → Heat Yellow → Heat Orange → Heat Red → Deep Red
 */

const TVS_COLOR_STOPS = [
  { stop: 0.0, color: [49, 54, 149] },   // #313695
  { stop: 0.167, color: [69, 117, 180] }, // #4575B4
  { stop: 0.333, color: [116, 173, 209] },// #74ADD1
  { stop: 0.5, color: [254, 224, 144] },  // #FEE090
  { stop: 0.667, color: [253, 174, 97] }, // #FDAE61
  { stop: 0.833, color: [244, 109, 67] }, // #F46D43
  { stop: 1.0, color: [215, 48, 39] },    // #D73027
];

const LST_COLOR_STOPS = [
  { stop: 28, color: [69, 117, 180] },    // Cool blue
  { stop: 33, color: [116, 173, 209] },   // Light blue
  { stop: 38, color: [255, 255, 255] },   // White
  { stop: 43, color: [253, 174, 97] },    // Orange
  { stop: 48, color: [215, 48, 39] },     // Red
  { stop: 52, color: [165, 0, 38] },      // Deep red
];

function interpolateColor(stops, value) {
  if (value <= stops[0].stop) return stops[0].color;
  if (value >= stops[stops.length - 1].stop) return stops[stops.length - 1].color;

  for (let i = 0; i < stops.length - 1; i++) {
    if (value >= stops[i].stop && value <= stops[i + 1].stop) {
      const t = (value - stops[i].stop) / (stops[i + 1].stop - stops[i].stop);
      return [
        Math.round(stops[i].color[0] + t * (stops[i + 1].color[0] - stops[i].color[0])),
        Math.round(stops[i].color[1] + t * (stops[i + 1].color[1] - stops[i].color[1])),
        Math.round(stops[i].color[2] + t * (stops[i + 1].color[2] - stops[i].color[2])),
      ];
    }
  }
  return stops[stops.length - 1].color;
}

export function tvsToColor(tvs) {
  const [r, g, b] = interpolateColor(TVS_COLOR_STOPS, tvs);
  return `rgb(${r}, ${g}, ${b})`;
}

export function tvsToHex(tvs) {
  const [r, g, b] = interpolateColor(TVS_COLOR_STOPS, tvs);
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

export function lstToColor(lst) {
  const [r, g, b] = interpolateColor(LST_COLOR_STOPS, lst);
  return `rgb(${r}, ${g}, ${b})`;
}

export function lstToHex(lst) {
  const [r, g, b] = interpolateColor(LST_COLOR_STOPS, lst);
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

/** Mapbox GL JS expression for TVS color ramp */
export const TVS_FILL_COLOR_EXPRESSION = [
  'interpolate',
  ['linear'],
  ['get', 'tvs'],
  0.0, '#313695',
  0.167, '#4575B4',
  0.333, '#74ADD1',
  0.5, '#FEE090',
  0.667, '#FDAE61',
  0.833, '#F46D43',
  1.0, '#D73027',
];

/** Mapbox GL JS expression for LST color ramp */
export const LST_FILL_COLOR_EXPRESSION = [
  'interpolate',
  ['linear'],
  ['get', 'lst_mean'],
  28, '#4575B4',
  33, '#74ADD1',
  38, '#FFFFFF',
  43, '#FDAE61',
  48, '#D73027',
  52, '#A50026',
];

/** SHAP feature name to human-readable label mapping */
export const SHAP_LABELS = {
  lst_mean: 'Surface Temperature',
  poverty_proxy: 'Economic Deprivation',
  elderly_frac: 'Elderly Population',
  ndvi: 'Vegetation Cover',
  impervious: 'Impervious Surface',
  bldg_density: 'Building Density',
  canyon_ar: 'Street Canyon Ratio',
  park_dist: 'Distance to Parks',
};

/** Intervention type labels and colors */
export const INTERVENTION_CONFIG = {
  tree_planting: { label: 'Tree Planting', icon: '🌳', color: '#22C55E', markerColor: '#16A34A' },
  cool_pavement: { label: 'Cool Pavement', icon: '🚧', color: '#9CA3AF', markerColor: '#6B7280' },
  green_roof: { label: 'Green Roof', icon: '🏠', color: '#0D9488', markerColor: '#0F766E' },
  pocket_park: { label: 'Pocket Park', icon: '🌿', color: '#166534', markerColor: '#15803D' },
};

export const TVS_LEGEND_STOPS = [
  { value: 0.0, label: '0.0', color: '#313695' },
  { value: 0.17, label: '0.17', color: '#4575B4' },
  { value: 0.33, label: '0.33', color: '#74ADD1' },
  { value: 0.5, label: '0.50', color: '#FEE090' },
  { value: 0.67, label: '0.67', color: '#FDAE61' },
  { value: 0.83, label: '0.83', color: '#F46D43' },
  { value: 1.0, label: '1.0', color: '#D73027' },
];
