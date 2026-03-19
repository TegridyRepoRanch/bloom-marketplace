import { colors } from '../../../shared/theme';

// Multi-select chips for things like certifications, growing methods
export const ChipSelect = ({ label, options, selected, onChange, required }) => (
  <div style={{ marginBottom: 20 }}>
    {label && (
      <label style={{
        display: 'block',
        marginBottom: 12,
        fontSize: 14,
        fontWeight: 600,
        color: colors.dark,
      }}>
        {label} {required && <span style={{ color: colors.primary }}>*</span>}
      </label>
    )}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              if (isSelected) {
                onChange(selected.filter(s => s !== opt.value));
              } else {
                onChange([...selected, opt.value]);
              }
            }}
            style={{
              padding: '10px 18px',
              borderRadius: 20,
              border: `2px solid ${isSelected ? colors.primary : colors.blush}`,
              background: isSelected ? colors.gradient1 : colors.white,
              color: isSelected ? colors.white : colors.dark,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            {opt.icon && <span style={{ marginRight: 6 }}>{opt.icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);
