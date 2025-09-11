import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { findUserGroup, findUserGroupByEmail } from '@/data/groups';
import { authService } from '@/utils/authService';

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
  const [groupId, setGroupId] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1) Immediately restore user from localStorage to avoid flicker
    const storedMeta = authService.getUserMeta();
    if (storedMeta) {
      // Create a mock user object from stored metadata for immediate UI
      setUser({ 
        user_metadata: storedMeta,
        email: storedMeta.email
      });
      setLoading(false);
    }

    // 2) Listen for auth changes 
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        // Save metadata to localStorage for future restores
        authService.saveUserMeta(session.user.user_metadata);
        
        // Defer profile/group fetching
        setTimeout(() => {
          if (!mounted || !session?.user) return;
          fetchUserProfile(session.user.id);
          fetchUserGroup(session.user?.user_metadata?.email || session.user.email);
        }, 0);
      } else {
        // Clear everything on sign out
        setUser(null);
        setUserProfile(null);
        setUserGroup(null);
        setGroupId(null);
        setGroupMembers([]);
        authService.clearUserMeta();
      }

      setLoading(false);
    });

    // 3) Check for existing Supabase session to reconcile
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      if (session?.user) {
        // Override localStorage data with fresh session data
        setUser(session.user);
        authService.saveUserMeta(session.user.user_metadata);
        fetchUserProfile(session.user.id);
        fetchUserGroup(session.user?.user_metadata?.email || session.user.email);
      } else if (!storedMeta) {
        // Only clear if we didn't restore from localStorage
        setUser(null);
        setUserProfile(null);
        setUserGroup(null);
        setGroupId(null);
        setGroupMembers([]);
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
      setGroupId(null);
      setGroupMembers([]);
      return;
    }
    
    const groupData = findUserGroup(email);
    const { groupId: gId, members } = findUserGroupByEmail(email);
    
    setUserGroup(groupData);
    setGroupId(gId);
    setGroupMembers(members);
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
    const success = await authService.signOutAndClear(() => supabase.auth.signOut());
    console.log("Sign out complete");
    return { error: null };
  };

  const isAdmin = () => {
    return user?.user_metadata?.role === 'admin';
  };

  const value = {
    user,
    userProfile,
    userGroup,
    groupId,
    groupMembers,
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