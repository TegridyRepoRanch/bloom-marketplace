import { useState } from 'react';
import { colors } from '../../shared/theme';

// =============================================
// FAQ ACCORDION COMPONENT
// =============================================
export const Accordion = ({ items, t }) => {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          background: colors.white, borderRadius: 12, overflow: 'hidden',
          border: `1px solid ${openIndex === i ? colors.primary : colors.blush}`,
          transition: 'border-color 0.3s',
        }}>
          <button onClick={() => setOpenIndex(openIndex === i ? null : i)} style={{
            width: '100%', padding: '16px 20px', border: 'none',
            background: 'none', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', cursor: 'pointer', textAlign: 'left',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: colors.dark }}>{item.q}</span>
            <span style={{ fontSize: 20, color: colors.gray, transition: 'transform 0.3s', transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
          </button>
          {openIndex === i && (
            <div style={{ padding: '0 20px 16px', color: colors.gray, fontSize: 14, lineHeight: 1.7 }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
