import { useState, useEffect, useMemo } from 'react';
import { colors } from '../../shared/theme';
import { useIsMobile } from '../../shared/hooks/useIsMobile';
import { supabase } from '../../shared/supabase';
import { useDebounce } from '../hooks/useDebounce';
import { ProductCard, LoadingSkeleton } from './ProductCard';

// =============================================
// PRODUCTS PAGE WITH CATEGORY TABS
// =============================================
export const ProductsPage = ({ onSelectProduct, t = (key) => key }) => {
  const isMobile = useIsMobile();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('clones');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterProvince, setFilterProvince] = useState('');

  const categories = [
    { id: 'clones', label: t('cat_clones'), emoji: '🌱' },
    { id: 'seeds', label: t('cat_seeds'), emoji: '🫘' },
    { id: 'buds', label: t('cat_buds'), emoji: '🌿' },
  ];

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      let query = supabase
        .from('listings')
        .select('*, profiles(display_name, farm_name, location, phone, promptpay_id)')
        .eq('is_available', true);

      // Filter by category if not all
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
      if (error) {
        setError(t('error_load'));
        setLoading(false);
        return;
      }
      if (data) setListings(data);
      setLoading(false);
    };
    fetchListings();
  }, [selectedCategory]);

  // Debounced search for performance
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Extract unique provinces for filter (memoized)
  const uniqueProvinces = useMemo(() => [...new Set(listings
    .filter(l => l.profiles?.location)
    .map(l => l.profiles.location)
  )].sort(), [listings]);

  // Apply client-side filtering and sorting (memoized)
  const filtered = useMemo(() => {
    let result = [...listings];
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(l =>
        l.title?.toLowerCase().includes(term) ||
        l.description?.toLowerCase().includes(term) ||
        l.profiles?.farm_name?.toLowerCase().includes(term)
      );
    }
    const minPrice = Number(priceMin);
    if (priceMin && !isNaN(minPrice)) {
      result = result.filter(l => parseFloat(l.price) >= minPrice);
    }
    const maxPrice = Number(priceMax);
    if (priceMax && !isNaN(maxPrice)) {
      result = result.filter(l => parseFloat(l.price) <= maxPrice);
    }
    if (filterProvince) {
      result = result.filter(l => l.profiles?.location === filterProvince);
    }
    // Sort with spread to avoid mutation
    if (sortBy === 'price_asc') {
      result = [...result].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'price_desc') {
      result = [...result].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else {
      result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return result;
  }, [listings, debouncedSearch, priceMin, priceMax, filterProvince, sortBy]);

  return (
    <section style={{ minHeight: '100vh', padding: isMobile ? '80px 16px 40px' : '120px 24px 80px', background: colors.cream }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 60 }}>
          <h2 style={{ fontSize: isMobile ? 28 : 48, fontWeight: 800, color: colors.dark, marginBottom: 16 }}>{t('products_title')} <span aria-hidden="true">🌿</span></h2>
          <p style={{ fontSize: 18, color: colors.gray, marginBottom: 40 }}>{t('products_subtitle')}</p>

          {/* Category Tabs */}
          <div role="tablist" aria-label="Product categories" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={selectedCategory === cat.id}
                aria-controls="product-grid"
                aria-label={`Filter by ${cat.label}`}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: isMobile ? '10px 16px' : '12px 28px',
                  borderRadius: 25,
                  border: selectedCategory === cat.id ? 'none' : `2px solid ${colors.dark}`,
                  background: selectedCategory === cat.id ? colors.gradient1 : colors.white,
                  color: selectedCategory === cat.id ? colors.white : colors.dark,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  boxShadow: selectedCategory === cat.id ? '0 4px 15px rgba(45, 125, 70, 0.3)' : 'none',
                }}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{
          background: colors.white,
          borderRadius: 12,
          padding: isMobile ? '16px' : '24px',
          marginBottom: 40,
          boxShadow: '0 4px 15px rgba(45, 125, 70, 0.08)',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: isMobile ? 12 : 16,
        }} className="filter-bar">
          {/* Search Input */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.gray, marginBottom: 8, textTransform: 'uppercase' }}>{t('filter_search')}</label>
            <input
              type="text"
              placeholder={t('filter_search_placeholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: `2px solid ${colors.lightGray}`,
                borderRadius: 12,
                fontSize: 14,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = colors.primary}
              onBlur={e => e.target.style.borderColor = colors.lightGray}
            />
          </div>

          {/* Min Price Input */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.gray, marginBottom: 8, textTransform: 'uppercase' }}>{t('filter_min_price')}</label>
            <input
              type="number"
              placeholder="฿0"
              value={priceMin}
              onChange={e => setPriceMin(e.target.value)}
              min="0"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: `2px solid ${priceMin && priceMax && Number(priceMin) > Number(priceMax) ? colors.error : colors.lightGray}`,
                borderRadius: 12,
                fontSize: 14,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = colors.primary}
              onBlur={e => e.target.style.borderColor = priceMin && priceMax && Number(priceMin) > Number(priceMax) ? colors.error : colors.lightGray}
            />
            {priceMin && priceMax && Number(priceMin) > Number(priceMax) && (
              <div style={{ fontSize: 12, color: colors.error, marginTop: 4 }}>Min price must be less than or equal to max price</div>
            )}
          </div>

          {/* Max Price Input */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.gray, marginBottom: 8, textTransform: 'uppercase' }}>{t('filter_max_price')}</label>
            <input
              type="number"
              placeholder="฿999,999"
              value={priceMax}
              onChange={e => setPriceMax(e.target.value)}
              min="0"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: `2px solid ${priceMin && priceMax && Number(priceMin) > Number(priceMax) ? colors.error : colors.lightGray}`,
                borderRadius: 12,
                fontSize: 14,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = colors.primary}
              onBlur={e => e.target.style.borderColor = priceMin && priceMax && Number(priceMin) > Number(priceMax) ? colors.error : colors.lightGray}
            />
          </div>

          {/* Sort Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.gray, marginBottom: 8, textTransform: 'uppercase' }}>{t('filter_sort')}</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: `2px solid ${colors.lightGray}`,
                borderRadius: 12,
                fontSize: 14,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                background: colors.white,
                color: colors.dark,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = colors.primary}
              onBlur={e => e.target.style.borderColor = colors.lightGray}
            >
              <option value="newest">{t('filter_sort_newest')}</option>
              <option value="price_asc">{t('filter_sort_price_asc')}</option>
              <option value="price_desc">{t('filter_sort_price_desc')}</option>
            </select>
          </div>

          {/* Province Filter */}
          {uniqueProvinces.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.gray, marginBottom: 8, textTransform: 'uppercase' }}>{t('filter_province')}</label>
              <select
                value={filterProvince}
                onChange={e => setFilterProvince(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `2px solid ${colors.lightGray}`,
                  borderRadius: 12,
                  fontSize: 14,
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  background: colors.white,
                  color: colors.dark,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = colors.primary}
                onBlur={e => e.target.style.borderColor = colors.lightGray}
              >
                <option value="">{t('filter_all_provinces')}</option>
                {uniqueProvinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Filters Button */}
          {(searchTerm || priceMin || priceMax || filterProvince || sortBy !== 'newest') && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setPriceMin('');
                  setPriceMax('');
                  setFilterProvince('');
                  setSortBy('newest');
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  background: colors.mint,
                  color: colors.dark,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
                onMouseEnter={e => e.target.style.background = colors.primary}
                onMouseLeave={e => e.target.style.background = colors.mint}
              >
                {t('filter_clear')}
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <LoadingSkeleton isMobile={isMobile} />
        ) : error ? (
          <div role="alert" style={{ textAlign: 'center', padding: 80, background: colors.white, borderRadius: 24 }}>
            <span style={{ fontSize: 64 }} aria-hidden="true">⚠️</span>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: colors.dark, marginTop: 20 }}>{error}</h3>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 24,
                padding: '12px 32px',
                background: colors.primary,
                color: colors.white,
                border: 'none',
                borderRadius: 25,
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              {t('retry')}
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div role="status" style={{ textAlign: 'center', padding: 80, background: colors.white, borderRadius: 24, boxShadow: '0 4px 20px rgba(45, 125, 70, 0.08)' }}>
            <div style={{ fontSize: 80, marginBottom: 20, animation: 'float 4s ease-in-out infinite' }} aria-hidden="true">🌱</div>
            <h3 style={{ fontSize: 28, fontWeight: 800, color: colors.dark, marginBottom: 12 }}>{t('no_listings', { category: t('cat_' + selectedCategory) })}</h3>
            <p style={{ color: colors.gray, fontSize: 16, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
              {t('no_listings_sub', { category: t('cat_' + selectedCategory) })}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {categories.filter(c => c.id !== selectedCategory).map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{
                  padding: '10px 24px', borderRadius: 25, border: `2px solid ${colors.primary}`,
                  background: 'transparent', color: colors.primary, fontWeight: 600, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.3s ease',
                }}
                aria-label={`Browse ${cat.label} instead`}
                >
                  {cat.emoji} Browse {cat.label}
                </button>
              ))}
            </div>
            <p style={{ color: colors.lightGray, fontSize: 13, marginTop: 24 }}>Want to sell {selectedCategory}? <a href="seller.html" style={{ color: colors.primary, fontWeight: 600, textDecoration: 'none' }}>Become a vendor</a></p>
          </div>
        ) : filtered.length === 0 ? (
          <div role="status" style={{ textAlign: 'center', padding: 80, background: colors.white, borderRadius: 24, boxShadow: '0 4px 20px rgba(45, 125, 70, 0.08)' }}>
            <div style={{ fontSize: 80, marginBottom: 20 }} aria-hidden="true">🔍</div>
            <h3 style={{ fontSize: 28, fontWeight: 800, color: colors.dark, marginBottom: 12 }}>{t('filter_no_match')}</h3>
            <p style={{ color: colors.gray, fontSize: 16, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
              {t('filter_no_match_sub')}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setPriceMin('');
                setPriceMax('');
                setFilterProvince('');
                setSortBy('newest');
              }}
              style={{
                padding: '12px 32px',
                background: colors.primary,
                color: colors.white,
                border: 'none',
                borderRadius: 25,
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              {t('filter_clear')}
            </button>
          </div>
        ) : (
          <div id="product-grid" role="tabpanel" style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(155px, 1fr))' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: isMobile ? 12 : 24 }}>
            {filtered.map(listing => (
              <ProductCard key={listing.id} listing={listing} onClick={() => onSelectProduct(listing)} t={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
