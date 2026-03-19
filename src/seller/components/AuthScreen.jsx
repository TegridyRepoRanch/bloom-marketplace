import { useState } from 'react';
import { supabase } from '../../shared/supabase';
import { colors, shadows } from '../../shared/theme';
import { useLanguage } from '../hooks/useLanguage';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

// Password strength calculator
const getPasswordStrength = (pwd) => {
  if (!pwd) return { strength: 0, label: 'Too short', color: colors.error };
  if (pwd.length < 6) return { strength: 1, label: 'Weak', color: colors.error };
  if (pwd.length < 10) return { strength: 2, label: 'Fair', color: colors.accent };
  if (pwd.length < 14) return { strength: 3, label: 'Good', color: colors.mint };
  return { strength: 4, label: 'Strong', color: colors.primary };
};

export const AuthScreen = ({ onAuthSuccess }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission
    setError('');
    setLoading(true);

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          onAuthSuccess(data.user, true); // true = new user
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          onAuthSuccess(data.user, false); // false = existing user
        }
      }
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.message.includes('NetworkError') || err.message.includes('fetch')) {
        setError('Unable to connect to the server. The database may be paused — please contact the site admin to restore it, or try again in a few minutes.');
      } else {
        setError(err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="page-transition" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      background: `linear-gradient(180deg, ${colors.cream} 0%, ${colors.peach} 100%)`,
    }}>
      <a
        href="/"
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'rgba(255,255,255,0.9)',
          border: 'none',
          padding: '8px 16px',
          borderRadius: 20,
          color: colors.primary,
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: 14,
          textDecoration: 'none',
          transition: 'all 0.3s ease',
        }}
        onMouseOver={(e) => e.target.style.background = colors.white}
        onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.9)'}
      >
        ← Back to Shop
      </a>
      <Card style={{ maxWidth: 440, width: '100%', padding: 40 }} className="animate-bounce-in">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="animate-float" style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
            <img src="data:image/png;base64,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" width="56" height="56" alt="SiamClones" style={{ borderRadius: 8 }}/>
          </div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            background: colors.gradient1,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 8,
          }}>
            SiamClones
          </h1>
          <p style={{ color: colors.primary, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
            Vendor Portal - Manage your listings
          </p>
          <p style={{ color: colors.gray, fontSize: 14 }}>
            {mode === 'signin' ? 'Welcome back, grower!' : 'Start selling supplies'}
          </p>
        </div>

        {/* Toggle */}
        <div style={{
          display: 'flex',
          background: colors.cream,
          borderRadius: 12,
          padding: 4,
          marginBottom: 28,
        }}>
          {['signin', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: mode === m ? colors.white : 'transparent',
                color: mode === m ? colors.primary : colors.gray,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: mode === m ? shadows.sm : 'none',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            className="animate-shake"
            style={{
              padding: '12px 16px',
              background: colors.errorBg,
              borderRadius: 10,
              color: colors.error,
              fontSize: 14,
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Input
            label={t('email')}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="your@email.com"
            required
            icon="📧"
          />
          <div style={{ marginBottom: 20 }}>
            <Input
              label={t('password')}
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
              icon="🔒"
            />
            {mode === 'signup' && password && (
              <div style={{ marginTop: 8 }}>
                <div style={{
                  display: 'flex',
                  gap: 4,
                  marginBottom: 6,
                }}>
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        background: i <= getPasswordStrength(password).strength ? getPasswordStrength(password).color : colors.blush,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  ))}
                </div>
                <p style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: getPasswordStrength(password).color,
                }}>
                  Strength: {getPasswordStrength(password).label}
                </p>
              </div>
            )}
          </div>
          {mode === 'signup' && (
            <Input
              label={t('confirm_password')}
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
              required
              icon="🔒"
            />
          )}

          <Button
            type="submit"
            fullWidth
            loading={loading}
            style={{ marginTop: 12 }}
          >
            {mode === 'signin' ? t('sign_in') : t('create_account')}
          </Button>
        </form>
      </Card>
    </div>
  );
};

