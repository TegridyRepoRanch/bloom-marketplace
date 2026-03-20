import { useState, useEffect, useRef } from 'react';
import { colors } from '../../shared/theme';
import { useIsMobile } from '../../shared/hooks/useIsMobile';

// =============================================
// HERO SECTION
// =============================================
export const HeroSection = ({ onNavigate, t = (key) => key }) => {
  const isMobile = useIsMobile();
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isVisible, setIsVisible] = useState(true);
  const heroRef = useRef(null);

  // Disable mouse tracking on mobile and when hero is off-screen
  useEffect(() => {
    if (isMobile) return; // Skip mouse tracking on mobile for performance

    // Create IntersectionObserver to track if hero is visible
    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0].isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
      observer.disconnect();
    };
  }, [isMobile]);

  // Mouse tracking only runs when hero is visible and not on mobile
  useEffect(() => {
    if (isMobile || !isVisible) return; // Skip if on mobile or hero is off-screen
    let rafId;
    const handleMouse = (e) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setMousePos({
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100,
        });
      });
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => { window.removeEventListener('mousemove', handleMouse); cancelAnimationFrame(rafId); };
  }, [isMobile, isVisible]);

  return (
    <section ref={heroRef} style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      padding: isMobile ? '80px 16px 40px' : '120px 24px 80px',
      background: colors.dark,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated gradient blobs */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.6,
      }}>
        <div style={{
          position: 'absolute',
          width: isMobile ? 300 : 600, height: isMobile ? 300 : 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45,125,70,0.4) 0%, transparent 70%)',
          left: `${mousePos.x * 0.3}%`, top: `${mousePos.y * 0.3 - 20}%`,
          transition: 'left 2s ease-out, top 2s ease-out',
          filter: isMobile ? 'blur(20px)' : 'blur(40px)',
          willChange: 'transform',
        }} />
        <div style={{
          position: 'absolute',
          width: isMobile ? 250 : 500, height: isMobile ? 250 : 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(242,169,0,0.25) 0%, transparent 70%)',
          right: `${(100 - mousePos.x) * 0.2}%`, bottom: `${(100 - mousePos.y) * 0.2}%`,
          transition: 'right 3s ease-out, bottom 3s ease-out',
          filter: isMobile ? 'blur(30px)' : 'blur(60px)',
          willChange: 'transform',
        }} />
        <div style={{
          position: 'absolute',
          width: isMobile ? 200 : 400, height: isMobile ? 200 : 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,79,158,0.2) 0%, transparent 70%)',
          left: '60%', top: '20%',
          animation: 'float 8s ease-in-out infinite',
          filter: isMobile ? 'blur(25px)' : 'blur(50px)',
          willChange: 'transform',
        }} />
      </div>

      {/* Subtle grid pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
          {/* Tagline chip */}
          <div className="animate-fade-in-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 20px', borderRadius: 30,
            background: 'rgba(45,125,70,0.15)',
            border: '1px solid rgba(45,125,70,0.3)',
            marginBottom: 32,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#4CAF50', fontSize: 14, fontWeight: 600, letterSpacing: '0.5px' }}>{t('live_marketplace')}</span>
          </div>

          <h1 className="animate-fade-in-up" style={{
            fontSize: 'clamp(44px, 8vw, 80px)',
            fontWeight: 800,
            lineHeight: 1.05,
            marginBottom: 28,
            color: colors.white,
            letterSpacing: '-2px',
          }}>
            {t('hero_title')}
          </h1>

          <p className="animate-fade-in-up" style={{
            fontSize: 20,
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.7,
            marginBottom: 48,
            maxWidth: 600,
            margin: '0 auto 48px',
            animationDelay: '0.2s',
          }}>
            {t('hero_subtitle')}
          </p>

          {/* Dual CTAs */}
          <div className="animate-fade-in-up" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.3s' }}>
            <button onClick={() => onNavigate('products')} style={{
              padding: isMobile ? '14px 24px' : '18px 40px',
              borderRadius: 30,
              border: 'none',
              background: colors.gradient1,
              color: colors.white,
              fontWeight: 700,
              fontSize: isMobile ? 15 : 18,
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(45, 125, 70, 0.5)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 40px rgba(45,125,70,0.6)'; }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 30px rgba(45,125,70,0.5)'; }}
            >
              {t('hero_browse')}
            </button>
            <button onClick={() => onNavigate('how-it-works')} style={{
              padding: isMobile ? '14px 24px' : '18px 40px',
              borderRadius: 30,
              border: '2px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.08)',
              color: colors.white,
              fontWeight: 600,
              fontSize: isMobile ? 15 : 18,
              cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.15)'; e.target.style.borderColor = 'rgba(255,255,255,0.5)'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            >
              {t('hero_how')}
            </button>
          </div>

          {/* Trust Bar */}
          <div className="animate-fade-in-up" style={{
            display: 'flex', gap: isMobile ? 8 : 12, justifyContent: 'center', flexWrap: 'wrap',
            marginTop: isMobile ? 32 : 48, animationDelay: '0.5s',
          }}>
            {[
              { icon: '✓', label: t('trust_verified') },
              { icon: '📱', label: t('trust_promptpay') },
              { icon: '⚡', label: t('trust_dispatch') },
              { icon: '💬', label: t('trust_line') },
            ].map((chip, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: isMobile ? '6px 12px' : '8px 16px',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.8)',
                fontSize: isMobile ? 12 : 13,
                fontWeight: 500,
                backdropFilter: 'blur(10px)',
              }}>
                <span aria-hidden="true">{chip.icon}</span> {chip.label}
              </span>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
