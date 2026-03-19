import { colors } from '../../../shared/theme';

// Select Component
export const Select = ({ label, value, onChange, options, required, placeholder }) => (
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
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '14px 16px',
        borderRadius: 12,
        border: `2px solid ${colors.blush}`,
        fontSize: 16,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        background: colors.white,
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23636E72'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        backgroundSize: '20px',
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);
