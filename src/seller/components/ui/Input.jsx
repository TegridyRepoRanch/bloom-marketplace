import { colors } from '../../../shared/theme';

// Input Component
export const Input = ({ label, type = 'text', value, onChange, placeholder, required, error, multiline, rows = 4, icon }) => (
  <div style={{ marginBottom: 20 }}>
    {label && (
      <label style={{
        display: 'block',
        marginBottom: 8,
        fontSize: 14,
        fontWeight: 600,
        color: colors.dark,
      }}>
        {label} {required && <span style={{ color: colors.primary }}>*</span>}
      </label>
    )}
    <div style={{ position: 'relative' }}>
      {icon && (
        <span style={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 20,
        }}>{icon}</span>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{
            width: '100%',
            padding: icon ? '14px 16px 14px 48px' : '14px 16px',
            borderRadius: 12,
            border: `2px solid ${error ? colors.error : colors.blush}`,
            fontSize: 16,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            background: colors.white,
            resize: 'vertical',
            transition: 'all 0.3s ease',
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: icon ? '14px 16px 14px 48px' : '14px 16px',
            borderRadius: 12,
            border: `2px solid ${error ? colors.error : colors.blush}`,
            fontSize: 16,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            background: colors.white,
            transition: 'all 0.3s ease',
          }}
        />
      )}
    </div>
    {error && (
      <p style={{ color: colors.error, fontSize: 13, marginTop: 6 }}>{error}</p>
    )}
  </div>
);
