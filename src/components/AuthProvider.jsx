// AuthProvider.js
/* eslint-disable no-console */
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { findUserGroup } from '@/data/groups';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);             // Supabase auth user (id, email, metadata)
  const [userProfile, setUserProfile] = useState(null); // Row from public.profiles (role, name, etc.)
  const [userGroup, setUserGroup] = useState(null);     // Group object from your groups array
  const [memberRole, setMemberRole] = useState(null);   // Role from groups.members for this email
  const [loading, setLoading] = useState(true);

  const logSnapshot = (label, authUser, profile, group, memberRoleVal) => {
    console.log(`[AUTH] SNAPSHOT — ${label}`);
    console.log('[AUTH] auth user (full):', authUser);
    console.log('[AUTH] email:', authUser?.email ?? null);
    console.log('[AUTH] profile row:', profile);     // where "role" should come from
    console.log('[AUTH] group:', group?.groupID ?? null, group);
    console.log('[AUTH] memberRole (from groups):', memberRoleVal ?? null);
  };

  useEffect(() => {
    const getSession = async () => {
      console.log('[AUTH] init: getSession()');
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error('[AUTH] getSession error:', error);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        fetchUserGroup(session.user.email);
        // memberRole will be set inside fetchUserGroup; log after a tick
        setTimeout(() => logSnapshot('INIT', session.user, profile, userGroup, memberRole), 0);
      }
      setLoading(false);
    };

    getSession();

    // Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AUTH] onAuthStateChange:', event, 'user:', session?.user ? { id: session.user.id, email: session.user.email } : null);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          fetchUserGroup(session.user.email);
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            setTimeout(() => logSnapshot(event, session.user, profile, userGroup, memberRole), 0);
          }
        } else {
          setUserProfile(null);
          setUserGroup(null);
          setMemberRole(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserProfile = async (userId) => {
    console.log('[AUTH] fetchUserProfile for userId:', userId);
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('id, role, name, full_name, display_name')
        .eq('id', userId)
        .maybeSingle(); // avoids throwing if no row

      console.log('[AUTH] profiles query status:', status, 'error:', error || null);
      console.log('[AUTH] profiles row:', data || null);

      if (error) {
        setUserProfile(null);
        return null;
      }
      setUserProfile(data ?? null);
      return data ?? null;
    } catch (err) {
      console.error('[AUTH] fetchUserProfile error:', err);
      setUserProfile(null);
      return null;
    }
  };

  const fetchUserGroup = (email) => {
    if (!email) {
      setUserGroup(null);
      setMemberRole(null);
      return;
    }
    const raw = String(email);
    const normalized = raw.trim().toLowerCase();

    try {
      const group = findUserGroup(normalized) || findUserGroup(raw) || null;
      const roleInGroup =
        group?.members?.find(m => (m.email || '').trim().toLowerCase() === normalized)?.role ?? null;

      console.log('[AUTH] fetchUserGroup:', { raw, normalized, found: !!group, roleInGroup });

      setUserGroup(group);
      setMemberRole(roleInGroup);
    } catch (err) {
      console.error('[AUTH] fetchUserGroup error:', err);
      setUserGroup(null);
      setMemberRole(null);
    }
  };

  const signIn = async (email, password) => {
    console.log('[AUTH] signIn attempt for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[AUTH] signIn error:', error);
      return { data: null, error };
    }
    console.log('[AUTH] signIn success. user:', data?.user ? { id: data.user.id, email: data.user.email } : null, 'session:', !!data?.session);

    // Snapshot immediately (don’t wait only for the subscription)
    if (data?.user) {
      const profile = await fetchUserProfile(data.user.id);
      fetchUserGroup(data.user.email);
      setTimeout(() => logSnapshot('SIGNIN RETURN', data.user, profile, userGroup, memberRole), 0);
    }
    return { data, error: null };
  };

  const signUp = async (email, password, userData = {}) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl, data: userData },
    });
    if (error) console.error('[AUTH] signUp error:', error);
    return { data, error };
  };

  const signOut = async () => {
    console.log('[AUTH] signOut start');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[AUTH] signOut error:', error);
    }
    // Clear local state regardless so UI updates immediately
    setUser(null);
    setUserProfile(null);
    setUserGroup(null);
    setMemberRole(null);

    // Sanity check
    const { data: after } = await supabase.auth.getSession();
    console.log('[AUTH] post-signOut getSession user:', after?.session?.user ?? null);
    return { error };
  };

  const isAdmin = () => userProfile?.role === 'admin';

  const value = {
    user,
    userProfile,
    userGroup,
    memberRole,   // <= NEW: role detected from your groups array
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
