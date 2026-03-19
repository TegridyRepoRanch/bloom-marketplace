import { useState } from 'react';
import { colors } from '../../shared/theme';
import { supabase } from '../../shared/supabase';
import { trackEvent } from '../lib/analytics';

// =============================================
// LEAD CAPTURE COMPONENT
// =============================================
export const RestockAlert = ({ t = (key) => key }) => {
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contact.trim()) return;
    // Store lead locally (can be sent to Supabase or email service later)
    try {
      const leads = JSON.parse(localStorage.getItem('sc_leads') || '[]');
      leads.push({ contact: contact.trim(), timestamp: new Date().toISOString() });
      localStorage.setItem('sc_leads', JSON.stringify(leads));
      // Also try to store in Supabase if available
      if (typeof supabase !== 'undefined') {
        supabase.from('leads').insert([{ contact: contact.trim() }]).then(() => {});
      }
    } catch (e) {}
    trackEvent('lead_capture', { contact_type: contact.includes('@') ? 'email' : 'line_id' });
    setSubmitted(true);
  };
  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: 24, background: '#E8F5E9', borderRadius: 16 }}>
        <span style={{ fontSize: 32 }}>🎉</span>
        <p style={{ color: '#2E7D32', fontWeight: 600, marginTop: 8 }}>{t('alert_thanks')}</p>
      </div>
    );
  }
  return (
    <div style={{ background: 'linear-gradient(135deg, #E8F5E9, #FFF8E1)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
      <h4 style={{ fontSize: 18, fontWeight: 700, color: colors.dark, marginBottom: 8 }}>{t('alert_title')}</h4>
      <p style={{ fontSize: 14, color: colors.gray, marginBottom: 16 }}>{t('alert_desc')}</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
        <input type="text" value={contact} onChange={e => setContact(e.target.value)}
          placeholder={t('alert_placeholder')}
          style={{ flex: 1, minWidth: 200, padding: '12px 16px', borderRadius: 12, border: `2px solid ${colors.blush}`, fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', outline: 'none' }}
          onFocus={e => e.target.style.borderColor = colors.primary}
          onBlur={e => e.target.style.borderColor = colors.blush}
        />
        <button type="submit" style={{
          padding: '12px 24px', borderRadius: 12, border: 'none',
          background: colors.gradient1, color: colors.white, fontWeight: 700,
          fontSize: 14, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>{t('alert_submit')}</button>
      </form>
    </div>
  );
};
