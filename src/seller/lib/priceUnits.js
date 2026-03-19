// =============================================
// DATA OPTIONS
// =============================================
export const CATEGORIES = [
  { value: 'clones', label: '🌱 Clones' },
  { value: 'seeds', label: '🫘 Seeds' },
  { value: 'buds', label: '🌿 Buds' },
];

export const PRICE_UNITS_ALL = [
  { value: 'per_clone', label: 'Per Clone', categories: ['clones'] },
  { value: 'per_pack', label: 'Per Pack', categories: ['clones', 'seeds'] },
  { value: 'per_seed', label: 'Per Seed', categories: ['seeds'] },
  { value: 'per_gram', label: 'Per Gram (g)', categories: ['buds'] },
  { value: 'per_ounce', label: 'Per Ounce (oz)', categories: ['buds'] },
  { value: 'per_100g', label: 'Per 100 Grams', categories: ['buds'] },
  { value: 'each', label: 'Each', categories: ['clones', 'seeds', 'buds'] },
];

// Legacy constant for backward compatibility
export const PRICE_UNITS = PRICE_UNITS_ALL;

// Get filtered price units based on category
export const getPriceUnitsForCategory = (category) => {
  if (!category) return PRICE_UNITS_ALL;
  return PRICE_UNITS_ALL.filter(u => u.categories.includes(category));
};

export const GROWING_METHODS = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'greenhouse', label: 'Greenhouse' },
  { value: 'hydroponic', label: 'Hydroponic' },
  { value: 'organic', label: 'Organic' },
  { value: 'living-soil', label: 'Living Soil' },
];

export const CERTIFICATIONS = [
  { value: 'organic', label: 'Organic Certified' },
  { value: 'lab-tested', label: 'Lab Tested' },
  { value: 'pest-free', label: 'Pest Free Certified' },
  { value: 'gmp', label: 'GMP Certified' },
  { value: 'local-licensed', label: 'Locally Licensed' },
];

export const FARM_SIZES = [
  { value: 'home', label: 'Home Grow' },
  { value: 'small', label: 'Small Operation (< 50 plants)' },
  { value: 'medium', label: 'Medium (50-200 plants)' },
  { value: 'large', label: 'Large (200-1000 plants)' },
  { value: 'commercial', label: 'Commercial (1000+ plants)' },
];
