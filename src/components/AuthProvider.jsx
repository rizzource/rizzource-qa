import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { findUserGroup } from '@/data/groups';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userGroup, setUserGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prevent state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const safeSetState = (setter) => {
    if (mountedRef.current) setter();
  };

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      safeSetState(() => setUserProfile(data));
    } catch (err) {
      console.error('Error fetching profile:', err);
      safeSetState(() => setUserProfile(null));
    }
  };

  const fetchUserGroup = async (email) => {
    try {
      if (!email) {
        safeSetState(() => setUserGroup(null));
        return;
      }
      // Normalize email to avoid case/whitespace mismatches
      const normalized = normalizeEmail(email);
      const group = findUserGroup(normalized) || null;
      safeSetState(() => setUserGroup(group));
    } catch (err) {
      console.error('Error finding user group:', err);
      safeSetState(() => setUserGroup(null));
    }
  };

  const hydrateFromSession = async (session) => {
    const authUser = session?.user ?? null;
    safeSetState(() => setUser(authUser));

    if (authUser) {
      // Keep UI in "loading" until both profile+group are ready
      await Promise.all([
        fetchUserProfile(authUser.id),
        fetchUserGroup(authUser.email)
      ]);
    } else {
      safeSetState(() => {
        setUserProfile(null);
        setUserGroup(null);
      });
    }
  };

  useEffect(() => {
    let subscription;

    const init = async () => {
      try {
        // Initial session (persisted)
        const { data: { session } } = await supabase.auth.getSession();
        await hydrateFromSession(session);
      } catch (err) {
        console.error('getSession error:', err);
      } finally {
        safeSetState(() => setLoading(false));
      }

      // Listen for auth changes (including token refresh)
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        // Helpful when debugging:
        // console.log('[auth event]', event, session);
        if (event === 'SIGNED_OUT') {
          safeSetState(() => {
            setUser(null);
            setUserProfile(null);
            setUserGroup(null);
          });
          return;
        }
        safeSetState(() => setLoading(true));
        await hydrateFromSession(session);
        safeSetState(() => setLoading(false));
      });

      subscription = data?.subscription;
    };

    init();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });
    return { data, error };
  };

  const signUp = async (email, password, userData = {}) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email: normalizeEmail(email),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData,
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    // Give immediate UI feedback, even if the event lags
    safeSetState(() => setLoading(true));
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      safeSetState(() => setLoading(false));
      return { error };
    }
    safeSetState(() => {
      setUser(null);
      setUserProfile(null);
      setUserGroup(null);
      setLoading(false);
    });
    return { error: null };
  };

  const isAdmin = () => userProfile?.role === 'admin';

  const value = useMemo(
    () => ({
      user,
      userProfile,
      userGroup,
      loading,
      signIn,
      signUp,
      signOut,
      isAdmin,
      // expose these in case you want to manually refresh somewhere
      fetchUserProfile,
      fetchUserGroup,
    }),
    [user, userProfile, userGroup, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
