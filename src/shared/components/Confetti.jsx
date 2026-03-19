import { colors } from '../theme';

export const Confetti = ({ active }) => {
  if (!active) return null;
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: [colors.primary, colors.secondary, colors.accent, colors.mint, colors.lavender][Math.floor(Math.random() * 5)],
  }));
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`,
          bottom: 0,
          width: 10,
          height: 10,
          background: p.color,
          borderRadius: '50%',
          animation: `confetti 1.5s ease-out ${p.delay}s forwards`,
        }} />
      ))}
    </div>
  );
};
