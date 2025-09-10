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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userGroup, setUserGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.groupCollapsed('%cAUTH DEBUG — INIT SESSION', 'color:#0ea5e9;font-weight:bold');
      if (error) console.error('getSession error:', error);
      console.log('session user:', session?.user ? { id: session.user.id, email: session.user.email } : null);
      console.groupEnd();

      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
        fetchUserGroup(session.user.email);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.groupCollapsed('%cAUTH DEBUG — onAuthStateChange', 'color:#8b5cf6;font-weight:bold');
        console.log('event:', event);
        console.log('user:', session?.user ? { id: session.user.id, email: session.user.email } : null);
        console.groupEnd();

        setUser(session?.user ?? null);
        if (session?.user) {
          if (event === 'SIGNED_IN') {
            // Extra detailed log at the moment of login
            try {
              const [{ data: userRes }, { data: sessionRes }] = await Promise.all([
                supabase.auth.getUser(),
                supabase.auth.getSession(),
              ]);
              console.groupCollapsed('%cAUTH DEBUG — SIGNED_IN snapshot', 'color:#16a34a;font-weight:bold');
              console.log('getUser.user:', userRes?.user ? { id: userRes.user.id, email: userRes.user.email } : null);
              console.log('getSession.user:', sessionRes?.session?.user ? { id: sessionRes.session.user.id, email: sessionRes.session.user.email } : null);
              console.groupEnd();
            } catch (e) {
              console.error('SIGNED_IN snapshot error:', e);
            }
          }

          await fetchUserProfile(session.user.id);
          fetchUserGroup(session.user.email);
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
    console.groupCollapsed('%cAUTH DEBUG — fetchUserProfile', 'color:#22c55e;font-weight:bold');
    console.log('userId:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('profiles query error:', error);
        throw error;
      }
      console.log('profile result:', data);
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      console.groupEnd();
    }
  };

  const fetchUserGroup = (email) => {
    console.groupCollapsed('%cAUTH DEBUG — fetchUserGroup', 'color:#eab308;font-weight:bold');
    if (!email) {
      console.warn('No email provided for group lookup');
      setUserGroup(null);
      console.groupEnd();
      return;
    }

    const rawEmail = String(email);
    const normalizedEmail = rawEmail.trim().toLowerCase();

    try {
      const groupFromRaw = findUserGroup(rawEmail);
      const groupFromNormalized = findUserGroup(normalizedEmail);

      console.log('raw email:', rawEmail);
      console.log('normalized email:', normalizedEmail);
      console.log('group (raw):', groupFromRaw);
      console.log('group (normalized):', groupFromNormalized);

      // Keep original behavior: use the raw email lookup for state
      setUserGroup(findUserGroup(rawEmail));
    } catch (err) {
      console.error('Error finding user group:', err);
      setUserGroup(null);
    } finally {
      console.groupEnd();
    }
  };

  const signIn = async (email, password) => {
    console.groupCollapsed('%cAUTH DEBUG — signIn()', 'color:#0284c7;font-weight:bold');
    console.log('attempt email:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('signIn error:', error);
    } else {
      console.log('signIn success (user):', data?.user ? { id: data.user.id, email: data.user.email } : null);
      console.log('session present:', !!data?.session);
    }
    console.groupEnd();
    return { data, error };
  };

  const signUp = async (email, password, userData = {}) => {
    console.groupCollapsed('%cAUTH DEBUG — signUp()', 'color:#10b981;font-weight:bold');
    console.log('attempt email:', email, 'userData:', userData);
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });
    if (error) {
      console.error('signUp error:', error);
    } else {
      console.log('signUp result:', data);
    }
    console.groupEnd();
    return { data, error };
  };

  const signOut = async () => {
    console.groupCollapsed('%cAUTH DEBUG — signOut()', 'color:#ef4444;font-weight:bold');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('signOut error:', error);
    } else {
      console.log('signOut success');
    }
    console.groupEnd();
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
