// AuthProvider.js
/* eslint-disable no-console */
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { findUserGroup } from '@/data/groups';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Derive a human-readable name from profile or auth metadata
const deriveName = (authUser, profile) => {
  return (
    profile?.name ??
    profile?.full_name ??
    profile?.display_name ??
    authUser?.user_metadata?.name ??
    (authUser?.user_metadata?.first_name || authUser?.user_metadata?.last_name
      ? [authUser?.user_metadata?.first_name, authUser?.user_metadata?.last_name].filter(Boolean).join(' ')
      : null) ??
    (authUser?.email ? authUser.email.split('@')[0] : null)
  );
};

// Centralized log: prints the entire auth user object + name + email + role
const logUserSnapshot = (authUser, profile) => {
  if (!authUser) return;
  const name = deriveName(authUser, profile);
  const email = authUser.email ?? null;
  const role = profile?.role ?? null;

  console.groupCollapsed('%cAUTH USER SNAPSHOT', 'color:#16a34a;font-weight:bold');
  console.log('authUser (full object):', authUser);
  console.log('email:', email);
  console.log('name:', name);
  console.log('role:', role);
  console.log('profile row:', profile);
  console.groupEnd();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userGroup, setUserGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        fetchUserGroup(session.user.email);
        // LOG RIGHT AFTER WE HAVE BOTH auth user and profile
        logUserSnapshot(session.user, profile);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          fetchUserGroup(session.user.email);
          // LOG ON LOGIN (and any time we have a fresh session user)
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            logUserSnapshot(session.user, profile);
          }
        } else {
          setUserProfile(null);
          setUserGroup(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setUserProfile(data);
      return data; // <— return profile so the logger can use it immediately
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUserProfile(null);
      return null;
    }
  };

  const fetchUserGroup = (email) => {
    if (!email) {
      setUserGroup(null);
      return;
    }
    try {
      setUserGroup(findUserGroup(email));
    } catch (err) {
      console.error('Error finding user group:', err);
      setUserGroup(null);
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    // Optional: immediate log on direct signIn success (in addition to onAuthStateChange)
    if (data?.user) {
      const profile = await fetchUserProfile(data.user.id);
      fetchUserGroup(data.user.email);
      logUserSnapshot(data.user, profile);
    }
    return { data, error };
  };

  const signUp = async (email, password, userData = {}) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setUserProfile(null);
      setUserGroup(null);
    }
    return { error };
  };

  const isAdmin = () => {
    return userProfile?.role === 'admin';
  };

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
