// Map database price_unit value to translated display label
// Falls back to category-smart default if price_unit is null (legacy listings)
export const getPriceUnitLabel = (priceUnit, t, category) => {
  const unitMap = {
    per_clone: 'per_clone',
    per_pack: 'per_pack',
    per_seed: 'per_seed',
    per_gram: 'per_gram',
    per_ounce: 'per_ounce',
    per_100g: 'per_100g',
    each: 'each',
  };
  const key = unitMap[priceUnit];
  if (key) return t(key);
  // Smart fallback based on category for legacy listings without price_unit
  const categoryDefaults = { clones: 'per_clone', seeds: 'per_seed', buds: 'per_gram' };
  const fallbackKey = categoryDefaults[category];
  return fallbackKey ? t(fallbackKey) : t('each');
};
