import { useState } from 'react';
import { colors } from '../../shared/theme';
import { useIsMobile } from '../../shared/hooks/useIsMobile';
import { getPriceUnitLabel } from '../lib/priceUnits';

// =============================================
// PRODUCT CARD
// =============================================
export const ProductCard = ({ listing, onClick, t = (key) => key }) => {
  const isMobile = useIsMobile();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
  <article
    onClick={onClick}
    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    tabIndex={0}
    role="button"
    aria-label={`${listing.title}, ฿${parseFloat(listing.price).toFixed(0)} per unit${listing.quantity_available ? `, ${listing.quantity_available} available` : ''}`}
    className="animate-fade-in-up product-card"
    style={{
      background: colors.white,
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(45, 125, 70, 0.1)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'scale(1.02) translateY(-6px)';
      e.currentTarget.style.boxShadow = '0 16px 48px rgba(45, 125, 70, 0.25)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'scale(1) translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(45, 125, 70, 0.1)';
    }}
  >
    <div style={{
      width: '100%',
      aspectRatio: '4 / 3',
      background: colors.gradient1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {!imgLoaded && !imgError && listing.images && listing.images[0] && (
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, rgba(45,125,70,0.1) 25%, rgba(45,125,70,0.05) 50%, rgba(45,125,70,0.1) 75%)',
          backgroundSize: '200% 100%',
          animation: 'skeleton-loading 1.5s infinite',
        }} />
      )}
      {listing.images && listing.images[0] && !imgError ? (
        <img
          src={listing.images[0]}
          alt={`Photo of ${listing.title}`}
          loading="lazy"
          className="product-card-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0.5, transition: 'opacity 0.3s ease' }}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      ) : (
        <span style={{ fontSize: 80 }} aria-hidden="true">🌿</span>
      )}
    </div>

    <div style={{ padding: isMobile ? 12 : 16 }}>
      {/* Badge row: Category + Stock */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{
          padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700,
          background: listing.category === 'clones' ? '#E8F5E9' : listing.category === 'seeds' ? '#FFF3E0' : '#F3E5F5',
          color: listing.category === 'clones' ? '#2E7D32' : listing.category === 'seeds' ? '#E65100' : '#7B1FA2',
          textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          {listing.category === 'clones' ? '🌱' : listing.category === 'seeds' ? '🫘' : '🌿'} {t('cat_' + (listing.category || 'clones'))}
        </span>
        {listing.quantity_available != null && (
          <span style={{
            padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700,
            background: listing.quantity_available <= 0 ? '#FFEBEE' : listing.quantity_available <= 5 ? '#FFF8E1' : '#E8F5E9',
            color: listing.quantity_available <= 0 ? '#C62828' : listing.quantity_available <= 5 ? '#F57F17' : '#2E7D32',
          }}>
            {listing.quantity_available <= 0 ? t('out_of_stock') : listing.quantity_available <= 5 ? `${t('low_stock')} (${listing.quantity_available})` : t('in_stock')}
          </span>
        )}
      </div>

      <h3 style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: colors.dark, marginBottom: 4, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {listing.title}
      </h3>

      {/* Vendor + Location */}
      {listing.profiles && (
        <p style={{ fontSize: 12, color: colors.gray, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {listing.profiles.farm_name || listing.profiles.display_name}
          {listing.profiles.location && <span> · {listing.profiles.location}</span>}
        </p>
      )}

      {/* Dispatch + Verified */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: colors.lightGray, display: 'flex', alignItems: 'center', gap: 3 }}>
          <span aria-hidden="true">⚡</span> {t('dispatch_time')}
        </span>
        <span style={{ fontSize: 11, color: '#2E7D32', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
          <span aria-hidden="true">✓</span> {t('verified_seller')}
        </span>
      </div>

      {/* Price */}
      <p style={{ fontSize: 22, fontWeight: 800, color: colors.primary, whiteSpace: 'nowrap' }}>
        ฿{parseFloat(listing.price).toFixed(0)}
        <span style={{ fontSize: 12, fontWeight: 400, color: colors.gray }}>/{getPriceUnitLabel(listing.price_unit, t, listing.category)}</span>
      </p>
    </div>
  </article>
  );
};

// =============================================
// LOADING SKELETON
// =============================================
export const LoadingSkeleton = ({ isMobile }) => (
  <div aria-label="Loading products" role="status" style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(155px, 1fr))' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: isMobile ? 12 : 24 }}>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} style={{
        background: colors.white,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(45, 125, 70, 0.1)',
      }}>
        <div className="skeleton-loading" style={{
          height: 160,
          marginBottom: 16,
        }} />
        <div style={{ padding: 16 }}>
          <div className="skeleton-loading" style={{
            height: 20,
            borderRadius: 8,
            marginBottom: 12,
          }} />
          <div className="skeleton-loading" style={{
            height: 16,
            borderRadius: 8,
            marginBottom: 16,
            width: '70%',
          }} />
          <div className="skeleton-loading" style={{
            height: 24,
            borderRadius: 8,
          }} />
        </div>
      </div>
    ))}
  </div>
);
