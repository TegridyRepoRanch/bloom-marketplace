import { colors, shadows } from '../../../shared/theme';

// Card Component
export const Card = ({ children, style = {}, onClick, hover = false }) => (
  <div
    onClick={onClick}
    style={{
      background: colors.white,
      borderRadius: 20,
      padding: 24,
      boxShadow: shadows.sm,
      transition: 'all 0.3s ease',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
    onMouseEnter={(e) => {
      if (hover) {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = shadows.lg;
      }
    }}
    onMouseLeave={(e) => {
      if (hover) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = shadows.sm;
      }
    }}
  >
    {children}
  </div>
);
