import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { findUserGroup } from '@/data/groups';

// AuthContext for the app. Drop this file in to replace your current AuthProvider.
// Key improvements:
// - Proper session initialization on mount
// - Robust onAuthStateChange listener + safe unsubscribe
// - fetchUserProfile/fetchUserGroup memoized with useCallback
// - Defensive checks and consistent loading state

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userGroup, setUserGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from `profiles` table by user id
  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) {
      setUserProfile(null);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // don't throw here — handle gracefully and log for debugging
        console.error('Supabase fetch profile error:', error);
        setUserProfile(null);
        return null;
      }

      setUserProfile(data ?? null);
      console.log('UserDataFromFetchUserProfile', data);
      return data;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      setUserProfile(null);
      return null;
    }
  }, []);

  // Find the user's group (local function imported from your data)
  const fetchUserGroup = useCallback((email) => {
    if (!email) {
      setUserGroup(null);
      return null;
    }

    try {
      const groupData = findUserGroup(email);
      setUserGroup(groupData ?? null);
      return groupData;
    } catch (err) {
      console.error('Error finding user group:', err);
      setUserGroup(null);
      return null;
    }
  }, []);

  // Initialize session and subscribe to auth changes
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      setLoading(true);
      try {
        // getSession returns { data: { session } } in supabase-js v2
        const { data } = await supabase.auth.getSession();
        const session = data?.session ?? null;
        const currentUser = session?.user ?? null;

        if (!mounted) return;

        setUser(currentUser);

        if (currentUser) {
          await fetchUserProfile(currentUser.id);
          fetchUserGroup(currentUser.email);
        } else {
          setUserProfile(null);
          setUserGroup(null);
        }
      } catch (err) {
        console.error('Error during auth initialization:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    // Subscribe to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchUserProfile(currentUser.id);
        fetchUserGroup(currentUser.email);
      } else {
        setUserProfile(null);
        setUserGroup(null);
      }

      // ensure loading is false after any change
      setLoading(false);
    });

    return () => {
      mounted = false;
      // listener shape can differ across SDK versions. handle both cases.
      try {
        if (listener?.subscription?.unsubscribe) {
          listener.subscription.unsubscribe();
        } else if (listener?.unsubscribe) {
          listener.unsubscribe();
        }
      } catch (err) {
        console.warn('Failed to unsubscribe auth listener:', err);
      }
    };
  }, [fetchUserGroup, fetchUserProfile]);

  // Auth helpers
  const signIn = useCallback(async (email, password) => {
    try {
      const resp = await supabase.auth.signInWithPassword({ email, password });
      return resp; // { data, error }
    } catch (error) {
      console.error('signIn error:', error);
      return { data: null, error };
    }
  }, []);

  const signUp = useCallback(async (email, password, userData = {}) => {
    try {
      // fixed template string (was broken in original)
      const redirectUrl = `${window.location.origin}/`;
      const resp = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl, data: userData },
      });
      return resp;
    } catch (error) {
      console.error('signUp error:', error);
      return { data: null, error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      // clear local state immediately
      setUser(null);
      setUserProfile(null);
      setUserGroup(null);
      return { error };
    } catch (err) {
      console.error('signOut error:', err);
      return { error: err };
    }
  }, []);

  const isAdmin = useCallback(() => userProfile?.role === 'admin', [userProfile]);

  const value = {
    user,
    userProfile,
    userGroup,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    fetchUserProfile,
    fetchUserGroup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
