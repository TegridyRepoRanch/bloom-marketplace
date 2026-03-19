import { useState } from 'react';
import { colors } from '../../shared/theme';
import { supabase } from '../../shared/supabase';

// =============================================
// CONTACT PAGE
// =============================================
export const ContactPage = ({ t = (key) => key }) => {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError('');
    try {
      const sanitize = (str) => str ? str.replace(/[<>"'`\\]/g, '').trim() : '';
      const { error: insertError } = await supabase
        .from('leads')
        .insert([{
          contact: sanitize(contactEmail),
          name: sanitize(contactName),
          message: sanitize(contactMessage),
        }]);
      if (insertError) throw insertError;
      setSent(true);
    } catch (err) {
      setError(t('contact_error') !== 'contact_error' ? t('contact_error') : 'Failed to send message. Please try again.');
    }
    setSending(false);
  };

  return (
    <section style={{ minHeight: '100vh', padding: '120px 24px 80px', background: colors.cream }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 48, fontWeight: 800, color: colors.dark, marginBottom: 16 }}>Get in Touch 💌</h2>
        </div>
        <div style={{ background: colors.white, borderRadius: 32, padding: 48, boxShadow: '0 10px 40px rgba(45, 125, 70, 0.15)' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <span style={{ fontSize: 64 }}>✅</span>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: colors.dark, marginTop: 20 }}>Message Sent!</h3>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <p style={{ color: colors.error, marginBottom: 16, fontSize: 14 }}>{error}</p>}
              <input type="text" placeholder="Name" required value={contactName} onChange={(e) => setContactName(e.target.value)} style={{ width: '100%', padding: 16, borderRadius: 12, border: `2px solid ${colors.blush}`, marginBottom: 16, fontSize: 16, fontFamily: 'Plus Jakarta Sans' }} />
              <input type="email" placeholder="Email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} style={{ width: '100%', padding: 16, borderRadius: 12, border: `2px solid ${colors.blush}`, marginBottom: 16, fontSize: 16, fontFamily: 'Plus Jakarta Sans' }} />
              <textarea placeholder="Message" rows={4} required value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} style={{ width: '100%', padding: 16, borderRadius: 12, border: `2px solid ${colors.blush}`, marginBottom: 24, fontSize: 16, fontFamily: 'Plus Jakarta Sans', resize: 'vertical' }} />
              <button type="submit" disabled={sending} style={{ width: '100%', padding: 18, borderRadius: 30, border: 'none', background: sending ? colors.lightGray : colors.gradient1, color: colors.white, fontWeight: 700, fontSize: 18, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans', boxShadow: '0 8px 30px rgba(45, 125, 70, 0.4)' }}>
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
