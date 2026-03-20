import { useState } from 'react';
import { colors } from '../../shared/theme';
import { useIsMobile } from '../../shared/hooks/useIsMobile';
import { OptimizedImage } from '../../shared/components/OptimizedImage';
import { getPriceUnitLabel } from '../lib/priceUnits';
import { ShareButtons } from './ShareButtons';
import { Accordion } from './Accordion';

// =============================================
// PRODUCT DETAIL PAGE
// =============================================
export const ProductDetailPage = ({ product, onBack, onAddToCart, t = (key) => key }) => {
  const isMobile = useIsMobile();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // All product images (handle legacy single-image and multi-image)
  const images = product.images && product.images.length > 0 ? product.images : [];
  const currentImage = images[selectedImageIndex] || null;

  return (
    <section style={{ minHeight: '100vh', padding: '120px 24px 80px', background: colors.cream }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 24px', borderRadius: 30,
          border: 'none', background: colors.white,
          color: colors.dark, fontWeight: 600, fontSize: 16,
          cursor: 'pointer', marginBottom: 32,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>
          ← {t('back_products')}
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 48,
          background: colors.white,
          borderRadius: 32,
          padding: isMobile ? 20 : 40,
          boxShadow: '0 10px 40px rgba(45, 125, 70, 0.15)',
        }}>
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div style={{
              width: '100%',
              aspectRatio: isMobile ? '4 / 3' : '1',
              borderRadius: 20,
              overflow: 'hidden',
              marginBottom: images.length > 1 ? 12 : 0,
            }}>
              <OptimizedImage
                src={currentImage}
                alt={product.title}
                fallbackEmoji={product.category === 'seeds' ? '🫘' : product.category === 'buds' ? '🌿' : '🌱'}
                width={isMobile ? 640 : 960}
                sizes="(max-width: 768px) 100vw, 50vw"
                eager
                style={{
                  width: '100%',
                  height: '100%',
                  background: colors.gradient1,
                }}
              />
            </div>

            {/* Thumbnail strip (if multiple images) */}
            {images.length > 1 && (
              <div style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                paddingBottom: 4,
              }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 10,
                      overflow: 'hidden',
                      border: idx === selectedImageIndex
                        ? `3px solid ${colors.primary}`
                        : '3px solid transparent',
                      cursor: 'pointer',
                      flexShrink: 0,
                      padding: 0,
                      background: 'none',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <OptimizedImage
                      src={img}
                      alt={`${product.title} thumbnail ${idx + 1}`}
                      width={128}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 style={{ fontSize: isMobile ? 24 : 36, fontWeight: 800, color: colors.dark, marginBottom: 16 }}>
              {product.title}
            </h1>

            {product.profiles && (
              <p style={{ fontSize: 16, color: colors.gray, marginBottom: 24 }}>
                by <strong>{product.profiles.farm_name || product.profiles.display_name}</strong>
                {product.profiles.location && ` \u2022 ${product.profiles.location}`}
              </p>
            )}

            <p style={{ fontSize: isMobile ? 36 : 48, fontWeight: 800, color: colors.primary, marginBottom: 24 }}>
              ฿{parseFloat(product.price).toFixed(0)}
              <span style={{ fontSize: 18, fontWeight: 400, color: colors.gray }}> {getPriceUnitLabel(product.price_unit, t, product.category)}</span>
            </p>

            {product.description && (
              <p style={{ fontSize: 16, color: colors.gray, lineHeight: 1.8, marginBottom: 32 }}>
                {product.description}
              </p>
            )}

            {product.growing_method && (
              <div style={{ marginBottom: 32 }}>
                <span style={{
                  padding: '8px 16px',
                  background: colors.peach,
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 500,
                  color: colors.dark,
                }}>
                  🌱 {product.growing_method}
                </span>
              </div>
            )}

            {/* BUG FIX: Use != null to correctly handle quantity_available of 0 */}
            {product.quantity_available != null && (
              <p style={{
                fontSize: 14,
                color: product.quantity_available <= 0 ? colors.error : colors.mint,
                fontWeight: 600,
                marginBottom: 32,
              }}>
                {product.quantity_available <= 0
                  ? `✗ ${t('out_of_stock')}`
                  : `✓ ${product.quantity_available} ${t('available')}`}
              </p>
            )}

            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <span style={{ fontWeight: 600, color: colors.dark }}>{t('quantity')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{
                  width: 44, height: 44, borderRadius: '50%',
                  border: `2px solid ${colors.blush}`, background: colors.white,
                  fontSize: 20, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans',
                }}>-</button>
                <span style={{ fontSize: 20, fontWeight: 700, color: colors.dark, minWidth: 40, textAlign: 'center' }}>
                  {quantity}
                </span>
                <button onClick={() => {
                  const maxQty = product.quantity_available || 999;
                  setQuantity(Math.min(maxQty, quantity + 1));
                }} disabled={product.quantity_available != null && product.quantity_available > 0 && quantity >= product.quantity_available} style={{
                  width: 44, height: 44, borderRadius: '50%',
                  border: `2px solid ${colors.blush}`, background: colors.white,
                  fontSize: 20, cursor: (product.quantity_available != null && product.quantity_available > 0 && quantity >= product.quantity_available) ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans',
                  opacity: (product.quantity_available != null && product.quantity_available > 0 && quantity >= product.quantity_available) ? 0.5 : 1,
                }}>+</button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.quantity_available != null && product.quantity_available <= 0}
              className={added ? 'animate-bounce' : ''}
              style={{
                width: '100%',
                padding: '20px 40px',
                borderRadius: 30,
                border: 'none',
                background: (product.quantity_available != null && product.quantity_available <= 0)
                  ? colors.lightGray
                  : added ? colors.mint : colors.gradient1,
                color: colors.white,
                fontWeight: 700,
                fontSize: 18,
                cursor: (product.quantity_available != null && product.quantity_available <= 0) ? 'not-allowed' : 'pointer',
                boxShadow: (product.quantity_available != null && product.quantity_available <= 0)
                  ? 'none'
                  : '0 8px 30px rgba(45, 125, 70, 0.4)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                transition: 'all 0.3s ease',
              }}
            >
              {product.quantity_available != null && product.quantity_available <= 0
                ? t('out_of_stock')
                : added ? '✓ ' + t('add_to_cart') + '!' : `${t('add_to_cart')} - ฿${(product.price * quantity).toFixed(0)}`}
            </button>

            {/* Share Buttons */}
            <div style={{ marginTop: 24 }}>
              <ShareButtons
                url={`https://siamclones.com/?listing=${product.id}`}
                text={`${t('share_listing_text')} ${product.title} - ฿${parseFloat(product.price).toFixed(0)}`}
                t={t}
                compact
              />
            </div>

            {/* Delivery Info Accordion */}
            <div style={{ marginTop: 32, borderTop: `1px solid ${colors.blush}`, paddingTop: 24 }}>
              <Accordion items={[
                { q: `⚡ ${t('delivery_how_title')}`, a: (
                  <div>
                    <p style={{ marginBottom: 8 }}>1. {t('delivery_how_1')}</p>
                    <p style={{ marginBottom: 8 }}>2. {t('delivery_how_2')}</p>
                    <p>3. {t('delivery_how_3')}</p>
                  </div>
                )},
                { q: `🔄 ${t('returns_title')}`, a: t('returns_desc') },
              ]} t={t} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
