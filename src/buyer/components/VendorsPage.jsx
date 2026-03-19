import { useState, useEffect } from 'react';
import { colors } from '../../shared/theme';
import { useIsMobile } from '../../shared/hooks/useIsMobile';
import { supabase } from '../../shared/supabase';

// =============================================
// VENDORS PAGE
// =============================================
export const VendorsPage = ({ t = (key) => key }) => {
  const isMobile = useIsMobile();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendors = async () => {
      setError(null);
      const { data, error } = await supabase.from('profiles').select('*').eq('is_active', true).limit(100);
      if (error) {
        setError('Unable to load vendors. Please try again.');
        setLoading(false);
        return;
      }
      if (data) setVendors(data);
      setLoading(false);
    };
    fetchVendors();
  }, []);

  return (
    <section style={{ minHeight: '100vh', padding: isMobile ? '80px 16px 40px' : '120px 24px 80px', background: `linear-gradient(180deg, ${colors.cream} 0%, ${colors.peach} 50%, ${colors.cream} 100%)` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 60 }}>
          <h2 style={{ fontSize: isMobile ? 28 : 48, fontWeight: 800, color: colors.dark, marginBottom: 16 }}>{t('vendors_title')} 🌿</h2>
          <p style={{ fontSize: 18, color: colors.gray }}>{t('vendors_subtitle')}</p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }} aria-label="Loading vendors">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background: colors.white, borderRadius: 24, padding: 32, boxShadow: '0 4px 20px rgba(45, 125, 70, 0.1)', textAlign: 'center' }}>
                <div className="skeleton-loading" style={{ width: 100, height: 100, borderRadius: '50%', margin: '0 auto 20px' }} />
                <div className="skeleton-loading" style={{ height: 24, borderRadius: 8, marginBottom: 12, width: '60%', margin: '0 auto 12px' }} />
                <div className="skeleton-loading" style={{ height: 16, borderRadius: 8, width: '40%', margin: '0 auto' }} />
              </div>
            ))}
          </div>
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
        ) : vendors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, background: colors.white, borderRadius: 24 }}>
            <span style={{ fontSize: 64 }}>🌱</span>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: colors.dark, marginTop: 20 }}>{t('vendors_coming')}</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {vendors.map(vendor => (
              <div key={vendor.id} style={{ background: colors.white, borderRadius: 24, padding: 32, boxShadow: '0 4px 20px rgba(45, 125, 70, 0.1)', textAlign: 'center' }}>
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: colors.gradient1, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {vendor.profile_photo_url ? (
                    <img src={vendor.profile_photo_url} alt={vendor.business_name || 'Vendor'} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 48 }}>🌿</span>
                  )}
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: colors.dark }}>{vendor.farm_name || vendor.display_name}</h3>
                {vendor.location && <p style={{ color: colors.gray, marginTop: 8 }}>📍 {vendor.location}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
