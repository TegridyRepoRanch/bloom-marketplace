import { colors } from '../../shared/theme';
import { useLanguage } from '../hooks/useLanguage';
import { OptimizedImage } from '../../shared/components/OptimizedImage';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export const ListingCard = ({ listing, onEdit, onToggleAvailability, onDelete }) => {
  const { t } = useLanguage();
  return (
    <Card hover style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Image */}
        <div style={{
          width: 100,
          height: 100,
          borderRadius: 12,
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <OptimizedImage
            src={listing.images?.[0]}
            alt={listing.title}
            fallbackEmoji="🌿"
            width={200}
            style={{ width: 100, height: 100, background: colors.gradient1 }}
          />
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 600,
              color: colors.dark,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {listing.title}
            </h3>
            <span style={{
              padding: '4px 10px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600,
              background: listing.is_available ? colors.mint : colors.lightGray,
              color: listing.is_available ? colors.dark : colors.white,
              flexShrink: 0,
              marginLeft: 8,
            }}>
              {listing.is_available ? t('status_active') : t('status_hidden')}
            </span>
          </div>

          <p style={{
            fontSize: 20,
            fontWeight: 700,
            color: colors.primary,
          }}>
            ฿{parseFloat(listing.price).toFixed(0)}
            <span style={{ fontSize: 14, fontWeight: 400, color: colors.gray }}> {t('per_unit')}</span>
          </p>
          {/* BUG FIX: Use != null to correctly show quantity when it's 0 */}
          {listing.quantity_available != null && (
            <p style={{
              fontSize: 13,
              color: listing.quantity_available <= 0 ? colors.error : colors.gray,
              marginTop: 4,
              fontWeight: listing.quantity_available <= 0 ? 600 : 400,
            }}>
              {listing.quantity_available <= 0 ? 'Sold out' : `${listing.quantity_available} available`}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: 10,
        marginTop: 16,
        paddingTop: 16,
        borderTop: `1px solid ${colors.blush}`,
      }}>
        <Button
          variant="secondary"
          onClick={() => onEdit(listing)}
          style={{ flex: 1, padding: '10px 16px', fontSize: 14 }}
        >
          {t('btn_edit')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => onToggleAvailability(listing)}
          style={{ flex: 1, padding: '10px 16px', fontSize: 14 }}
        >
          {listing.is_available ? t('btn_hide') : t('btn_show')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => onDelete(listing)}
          style={{ padding: '10px 16px', fontSize: 14, color: colors.error }}
        >
          🗑️
        </Button>
      </div>
    </Card>
  );
};
