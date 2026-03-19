import { colors } from '../../shared/theme';

// =============================================
// TOAST NOTIFICATION
// =============================================
export const Toast = ({ message, visible }) => (
  <div style={{
    position: 'fixed',
    top: 80,
    right: 20,
    background: colors.primary,
    color: colors.white,
    padding: '16px 24px',
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(45, 125, 70, 0.4)',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0)' : 'translateX(400px)',
    transition: 'all 0.3s ease',
    pointerEvents: visible ? 'auto' : 'none',
    zIndex: 2000,
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontWeight: 600,
    fontSize: 16,
  }}>
    {message}
  </div>
);
