import { useState } from 'react';
import { colors } from '../../shared/theme';
import { shareUrl } from '../lib/share';

// Share buttons component
export const ShareButtons = ({ url, text, t = (key) => key, compact = false }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    shareUrl(url, text, 'copy');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const btnStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: compact ? '6px 12px' : '8px 16px',
    borderRadius: 20, border: `1px solid ${colors.blush}`,
    background: colors.white, fontSize: compact ? 12 : 13,
    fontWeight: 600, cursor: 'pointer',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    transition: 'all 0.2s', color: colors.dark,
  };
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: compact ? 'flex-start' : 'center' }}>
      {navigator.share && (
        <button style={btnStyle} onClick={() => shareUrl(url, text, 'native')}>
          <span aria-hidden="true">📤</span> {t('share_listing')}
        </button>
      )}
      {!navigator.share && (
        <>
          <button style={{ ...btnStyle, borderColor: '#06C755', color: '#06C755' }} onClick={() => shareUrl(url, text, 'line')}>
            <span aria-hidden="true">💬</span> LINE
          </button>
          <button style={{ ...btnStyle, borderColor: '#25D366', color: '#25D366' }} onClick={() => shareUrl(url, text, 'whatsapp')}>
            <span aria-hidden="true">📱</span> WhatsApp
          </button>
        </>
      )}
      <button style={{ ...btnStyle, background: copied ? '#E8F5E9' : colors.white, color: copied ? '#2E7D32' : colors.dark }}
        onClick={handleCopy}>
        <span aria-hidden="true">{copied ? '✓' : '🔗'}</span> {copied ? t('share_copied') : t('share_copy')}
      </button>
    </div>
  );
};
