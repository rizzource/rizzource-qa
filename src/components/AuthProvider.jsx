// AuthProvider.jsx (drop-in)
// JS (not TS)

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { findUserGroup } from "@/data/groups";

const DEBUG = true; // set false to silence logs

const log = (...args) => {
  if (DEBUG) console.log("[Auth]", ...args);
};

const AuthContext = createContext({
  user: null,
  userProfile: null,
  userGroup: null,
  loading: true,
  signIn: async () => ({ data: null, error: null }),
  signUp: async () => ({ data: null, error: null }),
  signOut: async () => ({ error: null }),
  isAdmin: () => false,
  reloadProfile: async () => {},
});

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userGroup, setUserGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  // Avoid race conditions when auth state flips quickly
  const currentUserIdRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      setLoading(true);
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (error) log("getSession error:", error);
      const session = sessionData?.session || null;

      log("Initial session:", session);
      await handleSession(session);
      if (mountedRef.current) setLoading(false);
    };

    init();

    // Subscribe to auth state changes (sign in/out, refresh, user updated)
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      log("Auth state change:", event, session);
      // Ensure we reflect changes (e.g., token refresh, profile update)
      setLoading(true);
      await handleSession(session);
      if (mountedRef.current) setLoading(false);
    });

    return () => {
      mountedRef.current = false;
      try {
        data?.subscription?.unsubscribe?.();
      } catch (e) {
        // no-op
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSession = async (session) => {
    const sUser = session?.user ?? null;

    // Keep an in-memory pointer to the active userId to drop stale fetches
    currentUserIdRef.current = sUser?.id ?? null;

    setUser(sUser);
    if (!sUser) {
      // Signed out or no session
      setUserProfile(null);
      setUserGroup(null);
      return;
    }

    // Fetch profile & group in parallel (and await for loading correctness)
    const [profile] = await Promise.all([
      fetchUserProfileSafe(sUser),
      fetchUserGroupSafe(sUser.email),
    ]);

    // After fetching, ensure the user didn't change mid-flight
    if (currentUserIdRef.current !== sUser.id) {
      log("Stale fetch ignored (user changed mid-flight)");
      return;
    }

    // Finally set computed group (already set in fetchUserGroupSafe)
    setUserProfile(profile);
  };

  const fetchUserProfileSafe = async (sUser) => {
    if (!sUser?.id) {
      setUserProfile(null);
      return null;
    }

    try {
      // Primary: look up by auth.uid() = profiles.id
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sUser.id)
        .maybeSingle();

      if (error) log("profiles by id error:", error);
      if (!data && sUser.email) {
        // Fallback: some schemas store by email
        const byEmail = await supabase
          .from("profiles")
          .select("*")
          .eq("email", sUser.email)
          .maybeSingle();
        if (!byEmail.error && byEmail.data) {
          data = byEmail.data;
        }
      }

      // Optional: If profile row is missing, try to upsert a minimal one
      if (!data) {
        log("No profile row found; attempting to upsert minimal profile…");
        const upsertPayload = {
          id: sUser.id,
          email: sUser.email ?? null,
          full_name: sUser.user_metadata?.name ?? null,
          role: sUser.user_metadata?.role ?? "mentee",
          updated_at: new Date().toISOString(),
        };
        const { data: upserted, error: upsertError } = await supabase
          .from("profiles")
          .upsert(upsertPayload)
          .select()
          .maybeSingle();

        if (upsertError) {
          log("Profile upsert failed (check RLS):", upsertError);
        } else {
          data = upserted;
        }
      }

      setUserProfile(data ?? null);
      log("UserProfile:", data);
      return data ?? null;
    } catch (err) {
      log("fetchUserProfileSafe exception:", err);
      setUserProfile(null);
      return null;
    }
  };

  const fetchUserGroupSafe = async (email) => {
    try {
      if (!email) {
        setUserGroup(null);
        return null;
      }
      const normalized = String(email).trim().toLowerCase();
      const groupData = findUserGroup(normalized);
      setUserGroup(groupData ?? null);
      log("UserGroup:", groupData);
      return groupData ?? null;
    } catch (err) {
      log("fetchUserGroupSafe exception:", err);
      setUserGroup(null);
      return null;
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    log("signIn result:", { data, error });
    if (error) {
      setLoading(false);
      return { data, error };
    }
    // onAuthStateChange listener will run handleSession; no need to duplicate work
    setLoading(false);
    return { data, error };
  };

  const signUp = async (email, password, userData = {}) => {
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`; // Adjust if you need a specific redirect
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData, // stored as user_metadata on auth.user
      },
    });
    log("signUp result:", { data, error });

    // If email confirmation is disabled and user is returned immediately, listener will handle it.
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    log("signOut result:", { error });
    // Listener will clear local state, but we also hard-reset as a safeguard.
    setUser(null);
    setUserProfile(null);
    setUserGroup(null);
    setLoading(false);
    return { error };
  };

  const isAdmin = () => userProfile?.role === "admin";

  const reloadProfile = async () => {
    if (!user) return;
    setLoading(true);
    await Promise.all([fetchUserProfileSafe(user), fetchUserGroupSafe(user.email)]);
    setLoading(false);
  };

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
      reloadProfile,
    }),
    [user, userProfile, userGroup, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
