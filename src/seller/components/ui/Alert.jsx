import { colors, shadows } from '../../../shared/theme';

// Alert/Toast Component
export const Alert = ({ message, type = 'info', onClose }) => {
  const bgColors = {
    success: colors.mint,
    error: colors.primary,
    info: colors.lavender,
  };

  return (
    <div
      className="animate-slide-up"
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        left: 20,
        maxWidth: 400,
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: '16px 20px',
        borderRadius: 12,
        background: bgColors[type],
        color: colors.white,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: shadows.lg,
        zIndex: 1000,
      }}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: colors.white,
          fontSize: 20,
          cursor: 'pointer',
          marginLeft: 12,
        }}
      >&times;</button>
    </div>
  );
};
