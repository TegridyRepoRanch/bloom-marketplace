import { colors, shadows } from '../../../shared/theme';

// Confirmation Modal Component for destructive actions
export const ConfirmModal = ({ show, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false }) => {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 20,
    }}>
      <div style={{
        background: colors.white,
        borderRadius: 16,
        padding: 32,
        maxWidth: 400,
        width: '100%',
        boxShadow: shadows.lg,
        animation: 'pageIn 0.3s ease-out',
      }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: colors.dark, marginBottom: 12 }}>{title}</h3>
        <p style={{ color: colors.gray, marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: 10,
              border: `2px solid ${colors.blush}`,
              background: colors.white,
              color: colors.dark,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.background = colors.blush;
            }}
            onMouseOut={(e) => {
              e.target.style.background = colors.white;
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: 10,
              border: 'none',
              background: isDangerous ? colors.error : colors.primary,
              color: colors.white,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.opacity = '0.9';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.opacity = '1';
              e.target.style.transform = 'scale(1)';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
