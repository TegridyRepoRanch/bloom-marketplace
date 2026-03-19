import { colors } from '../../shared/theme';
import { useLanguage } from '../hooks/useLanguage';
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
          background: colors.gradient1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {listing.images && listing.images[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: 40 }}>🌿</span>
          )}
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
          {listing.quantity_available && (
            <p style={{ fontSize: 13, color: colors.gray, marginTop: 4 }}>
              {listing.quantity_available} available
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

