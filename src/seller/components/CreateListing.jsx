import { useState } from 'react';
import { supabase } from '../../shared/supabase';
import { colors, shadows } from '../../shared/theme';
import { useIsMobile } from '../../shared/hooks/useIsMobile';
import { useLanguage } from '../hooks/useLanguage';
import { sanitize } from '../lib/utils';
import { CATEGORIES, GROWING_METHODS, getPriceUnitsForCategory } from '../lib/priceUnits';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { ImageUpload } from './ImageUpload';

export const CreateListingScreen = ({ profile, onBack, onSuccess, editingListing }) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const [category, setCategory] = useState(editingListing?.category || '');
  const [title, setTitle] = useState(editingListing?.title || '');
  const [description, setDescription] = useState(editingListing?.description || '');
  const [price, setPrice] = useState(editingListing?.price?.toString() || '');
  const [priceUnit, setPriceUnit] = useState(editingListing?.price_unit || '');
  const [quantity, setQuantity] = useState(editingListing?.quantity?.toString() || '');
  const [images, setImages] = useState(editingListing?.images || []);
  const [growingMethod, setGrowingMethod] = useState(editingListing?.growing_method || '');

  const handleSubmit = async () => {
    setError('');

    if (!category.trim()) {
      setError('Please select a product category');
      return;
    }
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }
    if (title.trim().length > 200) {
      setError('Title must be 200 characters or less');
      return;
    }
    if (description.trim().length > 2000) {
      setError('Description must be 2000 characters or less');
      return;
    }
    if (!price || parseFloat(price) < 0.01) {
      setError('Please enter a valid price greater than 0');
      return;
    }
    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }
    if (parseInt(quantity) > 10000) {
      setError('Quantity cannot exceed 10,000');
      return;
    }
    if (!priceUnit) {
      setError('Please select a price unit');
      return;
    }
    if (images.length === 0) {
      setError('Please add at least 1 product image');
      return;
    }

    if (loading) {
      return; // Prevent double submission
    }

    setLoading(true);

    try {
      const listingData = {
        title: sanitize(title),
        description: sanitize(description) || null,
        category: sanitize(category),
        price: parseFloat(price),
        price_unit: priceUnit,
        quantity_available: quantity ? parseInt(quantity) : null,
        images: images.length > 0 ? images : null,
        growing_method: growingMethod ? sanitize(growingMethod) : null,
      };

      let error;
      if (editingListing) {
        // Update existing listing
        const result = await supabase
          .from('listings')
          .update(listingData)
          .eq('id', editingListing.id);
        error = result.error;
      } else {
        // Create new listing
        const result = await supabase
          .from('listings')
          .insert([{
            ...listingData,
            seller_id: profile.id,
            is_available: true,
          }]);
        error = result.error;
      }

      if (error) throw error;
      setShowSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="page-transition" style={{
      minHeight: '100vh',
      padding: 20,
      background: colors.cream,
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <button
            onClick={onBack}
            style={{
              background: colors.white,
              border: 'none',
              width: 44,
              height: 44,
              borderRadius: 12,
              fontSize: 20,
              cursor: 'pointer',
              boxShadow: shadows.sm,
              marginRight: 16,
            }}
          >←</button>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.dark }}>
            {editingListing ? t('edit_listing') : t('create_listing')}
          </h1>
        </div>

        <Card style={{ padding: 32 }} className="animate-slide-up">
          {error && (
            <div
              className="animate-shake"
              style={{
                padding: '12px 16px',
                background: colors.errorBg,
                borderRadius: 10,
                color: colors.error,
                fontSize: 14,
                marginBottom: 20,
              }}
            >
              {error}
            </div>
          )}

          {showSuccess && (
            <div
              className="animate-slide-up"
              style={{
                padding: '16px 20px',
                background: colors.mint,
                borderRadius: 10,
                color: colors.white,
                fontSize: 14,
                marginBottom: 20,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 18 }}>✓</span>
              {t('listing_created')}
            </div>
          )}

          {/* Category Selector - First Field */}
          <div style={{ marginBottom: 28 }}>
            <label style={{
              display: 'block',
              marginBottom: 12,
              fontSize: 14,
              fontWeight: 600,
              color: colors.dark,
            }}>
              Product Category <span style={{ color: colors.primary }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setCategory(cat.value);
                      // Reset price unit if not valid for new category
                      const validUnits = getPriceUnitsForCategory(cat.value).map(u => u.value);
                      if (priceUnit && !validUnits.includes(priceUnit)) setPriceUnit('');
                    }}
                    style={{
                      padding: '16px 12px',
                      borderRadius: 12,
                      border: `2px solid ${isSelected ? colors.primary : colors.blush}`,
                      background: isSelected ? colors.gradient1 : colors.white,
                      color: isSelected ? colors.white : colors.dark,
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 6 }}>
                      {cat.label.split(' ')[0]}
                    </div>
                    <div style={{ fontSize: 13 }}>
                      {cat.label.split(' ').slice(1).join(' ')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={5}
            sellerId={profile?.user_id}
          />

          <Input
            label={t('listing_title')}
            value={title}
            onChange={setTitle}
            placeholder="Describe your product"
            required
          />

          <Input
            label={t('listing_price')}
            type="number"
            value={price}
            onChange={setPrice}
            placeholder="50"
            required
            icon="฿"
            min="0.01"
            step="0.01"
          />

          <Select
            label={t('listing_price_unit')}
            value={priceUnit}
            onChange={setPriceUnit}
            options={getPriceUnitsForCategory(category)}
            placeholder="Select price unit"
            required
          />

          <Input
            label={t('listing_quantity')}
            type="number"
            value={quantity}
            onChange={setQuantity}
            placeholder="100"
          />

          <Select
            label={t('listing_strain')}
            value={growingMethod}
            onChange={setGrowingMethod}
            options={GROWING_METHODS}
            placeholder="Select growing method (optional)"
          />

          <Input
            label={t('listing_desc')}
            multiline
            rows={4}
            value={description}
            onChange={setDescription}
            placeholder="Describe your product - specifications, features, quality standards, usage instructions..."
          />

          <Button
            onClick={handleSubmit}
            loading={loading}
            fullWidth
            style={{ marginTop: 12 }}
          >
            {loading ? t('saving') : t('save_listing')}
          </Button>
        </Card>
      </div>
    </div>
  );
};

