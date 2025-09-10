// AuthProvider.js
/* eslint-disable no-console */
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { findUserGroup } from '@/data/groups';

const DEBUG_AUTH = true;
const log = (...args) => { if (DEBUG_AUTH) console.log('[AUTH]', ...args); };

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

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

const safeUser = (u) => (u ? { id: u.id, email: u.email } : null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userGroup, setUserGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    log('mounted AuthProvider');

    const getSession = async () => {
      try {
        log('init: calling supabase.auth.getSession()');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) log('init: getSession error:', error);
        log('init: session user:', safeUser(session?.user));
        setUser(session?.user ?? null);

        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          fetchUserGroup(session.user.email);

          // SNAPSHOT LOG (full auth user object + name/email/role)
          log('SNAPSHOT (init): authUser:', session.user);
          log('SNAPSHOT (init): email:', session.user.email);
          log('SNAPSHOT (init): name:', deriveName(session.user, profile));
          log('SNAPSHOT (init): role:', profile?.role ?? null);
        }
      } catch (e) {
        console.error('[AUTH] init error:', e);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        log('onAuthStateChange event:', event, 'user:', safeUser(session?.user));
        setUser(session?.user ?? null);

        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          fetchUserGroup(session.user.email);

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            // SNAPSHOT LOG (full auth user object + name/email/role)
            log('SNAPSHOT (auth event): authUser:', session.user);
            log('SNAPSHOT (auth event): email:', session.user.email);
            log('SNAPSHOT (auth event): name:', deriveName(session.user, profile));
            log('SNAPSHOT (auth event): role:', profile?.role ?? null);
          }
        } else {
          setUserProfile(null);
          setUserGroup(null);
        }
        setLoading(false);
      }
    );

    return () => {
      log('unmounting AuthProvider: unsubscribing auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId) => {
    log('fetchUserProfile for userId:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AUTH] profiles query error:', error);
        setUserProfile(null);
        return null;
      }
      log('fetchUserProfile result:', data);
      setUserProfile(data);
      return data;
    } catch (error) {
      console.error('[AUTH] Error fetching profile:', error);
      setUserProfile(null);
      return null;
    }
  };

  const fetchUserGroup = (email) => {
    if (!email) {
      log('fetchUserGroup: no email provided');
      setUserGroup(null);
      return;
    }
    const raw = String(email);
    const normalized = raw.trim().toLowerCase();
    try {
      const group = findUserGroup(normalized) || findUserGroup(raw) || null;
      log('fetchUserGroup:', { raw, normalized, found: !!group, groupID: group?.groupID });
      setUserGroup(group);
    } catch (err) {
      console.error('[AUTH] Error finding user group:', err);
      setUserGroup(null);
    }
  };

  const signIn = async (email, password) => {
    log('signIn() attempt for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[AUTH] signIn error:', error);
      return { data: null, error };
    }
    log('signIn() success user:', safeUser(data?.user), 'session present:', !!data?.session);

    // Snapshot immediately (in addition to onAuthStateChange)
    if (data?.user) {
      const profile = await fetchUserProfile(data.user.id);
      fetchUserGroup(data.user.email);
      log('SNAPSHOT (signIn return): authUser:', data.user);
      log('SNAPSHOT (signIn return): email:', data.user.email);
      log('SNAPSHOT (signIn return): name:', deriveName(data.user, profile));
      log('SNAPSHOT (signIn return): role:', profile?.role ?? null);
    }
    return { data, error: null };
    };

  const signUp = async (email, password, userData = {}) => {
    log('signUp() attempt for:', email, 'with userData:', userData);
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl, data: userData }
    });
    if (error) console.error('[AUTH] signUp error:', error);
    else log('signUp() result:', data);
    return { data, error };
  };

  const signOut = async () => {
    log('signOut() start');
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[AUTH] signOut error:', error);
    } else {
      log('signOut() success — clearing local state now');
      // Clear local state immediately so the UI always reacts
      setUser(null);
      setUserProfile(null);
      setUserGroup(null);
    }
    // Sanity check current session after sign out
    const { data: after } = await supabase.auth.getSession();
    log('post-signOut getSession user:', safeUser(after?.session?.user));
    setLoading(false);
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
