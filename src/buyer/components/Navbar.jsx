import { useState, useEffect } from 'react';
import { colors } from '../../shared/theme';
import { useIsMobile } from '../../shared/hooks/useIsMobile';

// =============================================
// NAVIGATION
// =============================================
export const Navigation = ({ currentPage, onNavigate, cartCount, t = (key) => key, toggleLang = () => {}, lang = 'th' }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const navItems = [
    { id: 'home', label: t('nav_home') },
    { id: 'products', label: t('nav_products') },
    { id: 'growers', label: t('nav_vendors') },
    { id: 'how-it-works', label: t('nav_how') },
    { id: 'about', label: t('nav_about') },
    { id: 'contact', label: t('nav_contact') },
  ];

  return (
    <nav aria-label="Main navigation" role="navigation" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      padding: isMobile ? '12px 16px' : '16px 24px',
      background: (scrolled || currentPage !== 'home') ? 'rgba(26, 46, 26, 0.95)' : (menuOpen ? 'rgba(26,46,26,0.98)' : 'transparent'),
      backdropFilter: (scrolled || currentPage !== 'home') ? 'blur(10px)' : 'none',
      transition: 'all 0.3s ease',
      boxShadow: (scrolled || currentPage !== 'home') ? '0 2px 20px rgba(0, 0, 0, 0.3)' : 'none',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div onClick={() => onNavigate('home')} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <img src="favicon.svg" width="40" height="40" alt="SiamClones" style={{ borderRadius: 8 }}/>
          <span style={{
            fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #4CAF50 0%, #F2A900 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>SiamClones</span>
        </div>

        <div className={`mobile-nav-items${menuOpen ? ' open' : ''}`} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setMenuOpen(false); }}
              style={{
                padding: '10px 18px',
                borderRadius: 20,
                border: 'none',
                background: currentPage === item.id ? colors.gradient1 : 'transparent',
                color: currentPage === item.id ? colors.white : (scrolled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.85)'),
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16 }}>
          {/* Hamburger */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            style={{
              display: 'none', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: 10,
              border: 'none', background: 'transparent',
              color: colors.white,
              fontSize: 24, cursor: 'pointer',
            }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
          {/* Cart Button */}
          <button
            onClick={() => onNavigate('cart')}
            aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ', empty'}`}
            style={{
              position: 'relative',
              padding: '10px 16px',
              borderRadius: 20,
              border: 'none',
              background: currentPage === 'cart' ? colors.gradient1 : 'rgba(255,255,255,0.15)',
              color: currentPage === 'cart' ? colors.white : colors.white,
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            🛒
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -5,
                right: -5,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: colors.primary,
                color: colors.white,
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(26,46,26,0.95)',
              }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            aria-label="Toggle language"
            style={{
              padding: '10px 14px',
              borderRadius: 20,
              border: 'none',
              background: 'rgba(255,255,255,0.15)',
              color: colors.white,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            {t('lang_toggle')}
          </button>

          <a href="seller.html" className="sell-link-desktop" style={{
            padding: '12px 24px',
            borderRadius: 25,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: colors.white,
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            {t('nav_signin')}
          </a>
        </div>
      </div>
    </nav>
  );
};
