import { useState, useEffect } from 'react';
import { supabase } from '../shared/supabase';
import { colors } from '../shared/theme';
import { Spinner } from './components/ui/Spinner';
import { AuthScreen } from './components/AuthScreen';
import { ProfileSetupScreen } from './components/ProfileSetup';
import { CreateListingScreen } from './components/CreateListing';
import { DashboardScreen } from './components/Dashboard';

// =============================================
// MAIN APP
// =============================================

export const App = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('loading'); // loading, auth, setup, dashboard, create-listing
  const [isNewUser, setIsNewUser] = useState(false);
  const [editingListing, setEditingListing] = useState(null);

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      } else {
        setScreen('auth');
        window.history.replaceState({ screen: 'auth' }, '', '#auth');
      }
      setLoading(false);
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setScreen('auth');
        window.history.replaceState({ screen: 'auth' }, '', '#auth');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  // Navigation wrapper for History API support
  const navigateTo = (newScreen) => {
    setScreen(newScreen);
    window.history.pushState({ screen: newScreen }, '', `#${newScreen}`);
  };

  // Listen for browser back button
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.screen) {
        setScreen(event.state.screen);
      } else {
        // If no state, go back to main site
        window.location.href = '/';
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // Real database error (not just "no rows found")
      setScreen('auth');
      window.history.replaceState({ screen: 'auth' }, '', '#auth');
      return;
    }

    if (data) {
      setProfile(data);
      setScreen('dashboard');
      window.history.replaceState({ screen: 'dashboard' }, '', '#dashboard');
    } else {
      // No profile exists, need to create one
      setScreen('setup');
      window.history.replaceState({ screen: 'setup' }, '', '#setup');
    }
  };

  const handleAuthSuccess = async (authenticatedUser, isNew) => {
    setUser(authenticatedUser);
    setIsNewUser(isNew);

    if (isNew) {
      navigateTo('setup');
    } else {
      await loadProfile(authenticatedUser.id);
    }
  };

  const handleProfileComplete = async () => {
    await loadProfile(user.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Loading screen
  if (loading || screen === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.gradient1,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-float" style={{ fontSize: 64, marginBottom: 20 }}>🌿</div>
          <Spinner size={32} />
        </div>
      </div>
    );
  }

  // Auth screen
  if (screen === 'auth') {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Profile setup screen
  if (screen === 'setup') {
    return (
      <ProfileSetupScreen
        user={user}
        existingProfile={profile}
        onComplete={handleProfileComplete}
      />
    );
  }

  // Create listing screen
  if (screen === 'create-listing') {
    return (
      <CreateListingScreen
        profile={profile}
        onBack={() => {
          setEditingListing(null);
          navigateTo('dashboard');
        }}
        onSuccess={() => {
          setEditingListing(null);
          navigateTo('dashboard');
        }}
        editingListing={editingListing}
      />
    );
  }

  // Dashboard
  return (
    <DashboardScreen
      user={user}
      profile={profile}
      onLogout={handleLogout}
      onEditProfile={() => navigateTo('setup')}
      onCreateListing={() => {
        setEditingListing(null);
        navigateTo('create-listing');
      }}
      onEditListing={(listing) => {
        setEditingListing(listing);
        navigateTo('create-listing');
      }}
    />
  );
};
