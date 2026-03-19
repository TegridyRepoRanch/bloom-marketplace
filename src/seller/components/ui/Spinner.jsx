import { colors } from '../../../shared/theme';

// Loading Spinner
export const Spinner = ({ size = 24 }) => (
  <div style={{
    width: size,
    height: size,
    border: `3px solid ${colors.blush}`,
    borderTopColor: colors.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }} />
);
