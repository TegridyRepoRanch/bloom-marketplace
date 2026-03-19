import { colors, shadows } from '../../../shared/theme';
import { Spinner } from './Spinner';

// Button Component
export const Button = ({ children, onClick, variant = 'primary', disabled, loading, fullWidth, style = {} }) => {
  const baseStyle = {
    padding: '14px 28px',
    borderRadius: 12,
    border: 'none',
    fontSize: 16,
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.6 : 1,
    fontFamily: 'Plus Jakarta Sans, sans-serif',
  };

  const variants = {
    primary: {
      background: colors.gradient1,
      color: colors.white,
      boxShadow: shadows.md,
    },
    secondary: {
      background: colors.white,
      color: colors.primary,
      border: `2px solid ${colors.primary}`,
    },
    ghost: {
      background: 'transparent',
      color: colors.gray,
    },
    success: {
      background: colors.gradient3,
      color: colors.dark,
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...baseStyle, ...variants[variant], ...style }}
      className={!disabled && !loading ? 'animate-glow' : ''}
    >
      {loading ? <Spinner size={20} /> : children}
    </button>
  );
};
