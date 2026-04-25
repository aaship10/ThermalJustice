/**
 * Portfolio Utilities — Client-side portfolio selection and nearest-key snapping
 */

/**
 * Parse a portfolio key into its alpha and budget components.
 * Key format: "alpha_0.4_budget_5.0"
 */
export function parsePortfolioKey(key) {
  const match = key.match(/alpha_([\d.]+)_budget_([\d.]+)/);
  if (!match) return null;
  return {
    alpha: parseFloat(match[1]),
    budget: parseFloat(match[2]),
  };
}

/**
 * Build a portfolio key from alpha and budget values.
 */
export function buildPortfolioKey(alpha, budget) {
  return `alpha_${alpha.toFixed(1)}_budget_${budget.toFixed(1)}`;
}

/**
 * Find the nearest precomputed portfolio key for a given alpha × budget combination.
 * Uses Euclidean distance in the (alpha, budget_normalized) space.
 * This ensures the app never crashes or returns empty when an exact match doesn't exist.
 */
export function findNearestPortfolioKey(portfolios, targetAlpha, targetBudget) {
  // First try exact match
  const exactKey = buildPortfolioKey(targetAlpha, targetBudget);
  if (portfolios[exactKey]) return exactKey;

  // Find nearest by Euclidean distance
  // Normalize budget to [0,1] range for fair distance comparison with alpha
  const allKeys = Object.keys(portfolios);
  if (allKeys.length === 0) return null;

  // Get budget range for normalization
  const budgets = allKeys.map(k => parsePortfolioKey(k)?.budget).filter(Boolean);
  const minBudget = Math.min(...budgets);
  const maxBudget = Math.max(...budgets);
  const budgetRange = maxBudget - minBudget || 1;

  let bestKey = allKeys[0];
  let bestDist = Infinity;

  for (const key of allKeys) {
    const parsed = parsePortfolioKey(key);
    if (!parsed) continue;

    const alphaDiff = parsed.alpha - targetAlpha;
    const budgetDiff = (parsed.budget - targetBudget) / budgetRange;
    const dist = Math.sqrt(alphaDiff * alphaDiff + budgetDiff * budgetDiff);

    if (dist < bestDist) {
      bestDist = dist;
      bestKey = key;
    }
  }

  return bestKey;
}

/**
 * Get intervention centroids from GeoJSON features.
 * Returns a map of block_id → [lng, lat] centroid.
 */
export function getBlockCentroids(geojson) {
  const centroids = {};
  if (!geojson?.features) return centroids;

  for (const feature of geojson.features) {
    const coords = feature.geometry.coordinates[0];
    const lngs = coords.slice(0, -1).map(c => c[0]);
    const lats = coords.slice(0, -1).map(c => c[1]);
    centroids[feature.properties.block_id] = [
      lngs.reduce((a, b) => a + b, 0) / lngs.length,
      lats.reduce((a, b) => a + b, 0) / lats.length,
    ];
  }

  return centroids;
}

/**
 * Compute summary statistics for a portfolio.
 */
export function computePortfolioStats(portfolio) {
  if (!portfolio?.interventions?.length) {
    return {
      totalCost: 0,
      avgDeltaT: 0,
      peopleProtected: 0,
      interventionCounts: { tree_planting: 0, cool_pavement: 0, green_roof: 0, pocket_park: 0 },
      neighborhoods: [],
    };
  }

  const counts = { tree_planting: 0, cool_pavement: 0, green_roof: 0, pocket_park: 0 };
  const neighborhoods = new Set();

  for (const intervention of portfolio.interventions) {
    counts[intervention.type] = (counts[intervention.type] || 0) + 1;
    // Extract neighborhood from block_id prefix
    const prefix = intervention.block_id.split('_')[0];
    const PREFIXES = { YRW: 'Yerawada', KTR: 'Kothrud', KGP: 'Koregaon Park', HDP: 'Hadapsar', BHS: 'Bhosari' };
    if (PREFIXES[prefix]) neighborhoods.add(PREFIXES[prefix]);
  }

  return {
    totalCost: portfolio.total_cost_crore,
    avgDeltaT: portfolio.total_delta_t,
    peopleProtected: portfolio.people_protected,
    interventionCounts: counts,
    neighborhoods: Array.from(neighborhoods),
  };
}
