import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { findUserGroup as rawFindUserGroup } from '@/data/groups';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const normalizeEmail = (e) => (e || '').trim().toLowerCase();
const findUserGroup = (email) => rawFindUserGroup(normalizeEmail(email)); // assume util accepts lowercased input

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userGroup, setUserGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfileAndGroup = async (u) => {
    if (!u) {
      setUserProfile(null);
      setUserGroup(null);
      return;
    }
    // profiles row may not exist yet; don't hard-fail
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', u.id)
      .maybeSingle(); // <- avoids throw if no row yet

    setUserProfile(profile ?? null);
    setUserGroup(findUserGroup(u.email));
  };

  // Initialize from persisted session
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user ?? null;
      setUser(u);
      await loadProfileAndGroup(u);
      setLoading(false);
    };
    init();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        setLoading(true);
        await loadProfileAndGroup(u);
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });
    if (error) {
      setLoading(false);
      return { data: null, error };
    }
    // Update state immediately (don’t wait for the subscription)
    const sessionUser = data?.user ?? data?.session?.user ?? null;
    setUser(sessionUser);
    await loadProfileAndGroup(sessionUser);
    setLoading(false);
    return { data, error: null };
  };

  const signUp = async (email, password, userData = {}) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email: normalizeEmail(email),
      password,
      options: { emailRedirectTo: redirectUrl, data: userData },
    });
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    // Clear local state regardless; subscription will also fire
    setUser(null);
    setUserProfile(null);
    setUserGroup(null);
    setLoading(false);
    return { error };
  };

  const isAdmin = () => userProfile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        userGroup,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
