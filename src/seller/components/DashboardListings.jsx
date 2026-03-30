import { colors } from '../../shared/theme';
import { exportToCSV } from '../lib/utils';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { ListingCard } from './ListingCard';

export const DashboardListings = ({
  listings,
  loading,
  onCreateListing,
  onEditListing,
  onToggleAvailability,
  onDelete,
  t,
}) => {
  return (
    <div style={{ marginBottom: 32 }}>

      {/* Export Listings Button */}
      {listings.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Button
            onClick={() => {
              const columns = [
                { label: 'Title', accessor: (l) => l.title },
                { label: 'Category', accessor: (l) => l.category },
                { label: 'Price', accessor: (l) => `฿${parseFloat(l.price).toFixed(2)}` },
                { label: 'Price Unit', accessor: (l) => l.price_unit },
                { label: 'Quantity', accessor: (l) => l.quantity },
                { label: 'Status', accessor: (l) => l.is_available ? 'Active' : 'Hidden' },
                { label: 'Created Date', accessor: (l) => new Date(l.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) }
              ];

              const timestamp = new Date().toLocaleDateString('th-TH');
              exportToCSV(listings, columns, `listings_${timestamp}.csv`);
            }}
            style={{ padding: '12px 20px', fontSize: 14 }}
          >
            {t('export_listings')}
          </Button>
        </div>
      )}

      {loading ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <Spinner size={32} />
          <p style={{ color: colors.gray, marginTop: 12 }}>Loading listings...</p>
        </Card>
      ) : listings.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 48 }}>
          <div className="animate-float" style={{ fontSize: 64, marginBottom: 16 }}>🌱</div>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: colors.dark, marginBottom: 8 }}>
            {t('no_listings')}
          </h3>
          <p style={{ color: colors.gray, marginBottom: 24 }}>
            {t('no_listings_sub')}
          </p>
          <Button onClick={onCreateListing}>
            {t('create_first')}
          </Button>
        </Card>
      ) : (
        listings.map(listing => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onEdit={onEditListing}
            onToggleAvailability={onToggleAvailability}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
};
