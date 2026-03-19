import { useState } from 'react';
import { supabase } from '../../shared/supabase';
import { colors, shadows } from '../../shared/theme';
import { Spinner } from './ui/Spinner';

export const ImageUpload = ({ images, onImagesChange, maxImages = 5, sellerId }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [imgErrors, setImgErrors] = useState(new Set());

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadError('');
    setUploading(true);
    const newImages = [...images];

    for (const file of files) {
      if (newImages.length >= maxImages) break;

      // Validate it's an image
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file.');
        setUploading(false);
        return;
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File too large (max 5MB)');
        setUploading(false);
        return;
      }

      // Upload to Supabase Storage
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${sellerId || 'unknown'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
        const filePath = `listings/${fileName}`;

        const { data, error: storageError } = await supabase.storage
          .from('images')
          .upload(filePath, file);

        if (storageError) {
          setUploadError(`Upload error: ${storageError.message}`);
          setUploading(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        // Add cache-busting param to ensure fresh image loads
        newImages.push(publicUrl + '?t=' + Date.now());
      } catch (err) {
        setUploadError(`Upload failed: ${err.message}`);
        setUploading(false);
        return;
      }
    }

    onImagesChange(newImages);
    setUploading(false);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleImageError = (index) => {
    const newErrors = new Set(imgErrors);
    newErrors.add(index);
    setImgErrors(newErrors);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: 'block',
        marginBottom: 12,
        fontSize: 14,
        fontWeight: 600,
        color: colors.dark,
      }}>
        Product Images <span style={{ color: colors.gray, fontWeight: 400 }}>({images.length}/{maxImages})</span>
      </label>

      {uploadError && (
        <div style={{
          padding: '12px 16px',
          background: colors.errorBg,
          borderRadius: 10,
          color: colors.error,
          fontSize: 13,
          marginBottom: 12,
        }}>
          {uploadError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12, marginBottom: 16 }}>
        {images.map((url, index) => (
          <div
            key={index}
            style={{
              position: 'relative',
              width: '100%',
              paddingBottom: '100%',
              borderRadius: 12,
              overflow: 'hidden',
              background: colors.blush,
              boxShadow: shadows.sm,
            }}
          >
            {!imgErrors.has(index) ? (
              <img
                src={url}
                alt={`Product ${index + 1}`}
                loading="lazy"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={() => handleImageError(index)}
              />
            ) : (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 40,
              }}>
                🌿
              </div>
            )}
            <button
              onClick={() => removeImage(index)}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: colors.error,
                color: colors.white,
                border: 'none',
                cursor: 'pointer',
                fontSize: 18,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#c0392b';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = colors.error;
                e.target.style.transform = 'scale(1)';
              }}
            >×</button>
          </div>
        ))}

        {images.length < maxImages && (
          <label style={{
            width: '100%',
            paddingBottom: '100%',
            borderRadius: 12,
            border: `2px dashed ${colors.blush}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            transition: 'all 0.3s ease',
            background: colors.cream,
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseOver={(e) => {
            if (!uploading) {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.background = colors.blush;
            }
          }}
          onMouseOut={(e) => {
            if (!uploading) {
              e.currentTarget.style.borderColor = colors.blush;
              e.currentTarget.style.background = colors.cream;
            }
          }}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            {uploading ? (
              <Spinner size={24} />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 28, color: colors.primary, display: 'block', marginBottom: 4 }}>+</span>
                <span style={{ fontSize: 12, color: colors.gray }}>Add Photo</span>
              </div>
            )}
          </label>
        )}
      </div>
    </div>
  );
};
