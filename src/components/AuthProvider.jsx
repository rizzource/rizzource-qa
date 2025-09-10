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
    let mounted = true;

    // 1) Listen for auth changes FIRST (no async in callback)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      setUser(session?.user ?? null);

      if (session?.user) {
        // Defer Supabase calls to avoid deadlocks
        setTimeout(() => {
          if (!mounted || !session?.user) return;
          fetchUserProfile(session.user.id);
          fetchUserGroup(session.user.email);
        }, 0);
      } else {
        setUserProfile(null);
        setUserGroup(null);
      }

      setLoading(false);
    });

    // 2) Then check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchUserGroup(session.user.email);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);


  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // if (error) throw error;
      setUserProfile(data);
      console.log("UserDataFromFetchUserProfile", data)
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserGroup = (email) => {
    if (!email) {
      setUserGroup(null);
      return;
    }
    
    const groupData = findUserGroup(email);
    setUserGroup(groupData);
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
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
 console.log("Signing out...");
  const { error } = await supabase.auth.signOut();
  console.log("Sign out complete", error);
  return { error };
  };

  const isAdmin = () => {
    return user?.user_metadata?.role === 'admin';
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