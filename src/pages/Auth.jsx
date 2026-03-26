"use client"

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser, googleLogin, getUserById } from "@/redux/slices/userApiSlice";
import { useNavigate } from "react-router-dom";
import { usePostHog } from 'posthog-js/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, Zap, Shield, Trophy, TrendingUp, Users } from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

const GOOGLE_CLIENT_ID = "267038711162-c6681crs3mm7gq8cheglst9gej50m527.apps.googleusercontent.com";

const Auth = () => {
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState("signin");
  const [isValidating, setIsValidating] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordVal, setPasswordVal] = useState("");
  const [knownEmails, setKnownEmails] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const value = localStorage.getItem("rizzource_known_emails");
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const posthog = usePostHog();

  const { user, loading, error } = useSelector((state) => state.userApi);

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Track pageview
  useEffect(() => {
    posthog?.capture('$pageview');
  }, [posthog]);

  // Persist known sign-up emails to avoid duplicates on this client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('rizzource_known_emails', JSON.stringify(knownEmails));
    } catch {
      // ignore localStorage errors
    }
  }, [knownEmails]);

  useEffect(() => {
    if (activeTab !== 'signup') {
      setPasswordVal('');
      setPasswordStrength('');
    }
  }, [activeTab]);

  const evaluatePasswordStrength = (password) => {
    const commonWeak = new Set([
      '123456', 'password', '123456789', '12345678', '12345', 'qwerty', '111111', '123123', 'abc123', 'password1'
    ]);

    if (!password) return '';
    if (commonWeak.has(password.toLowerCase())) return 'weak';
    if (password.length < 6) return 'weak';

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return 'weak';
    if (score === 2) return 'medium';
    return 'strong';
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPasswordVal(value);
    setPasswordStrength(evaluatePasswordStrength(value));
  };

  // Redirect after login
  useEffect(() => {
    if (user) {
      // Identify user with PostHog
      const userId = user.Id || user.user_id || user.userId || user.email;
      const userName = user.name || user.full_name || `${user.firstName} ${user.lastName}` || "User";

      posthog?.identify(
        userId,
        {
          email: user.email,
          name: userName,
        }
      );

      // Fetch full user data if we have user_id
      if (user.user_id || user.Id) {
        dispatch(getUserById({ user_id: user.user_id || user.Id }));
      }

      const returnTo = window.history.state?.usr?.returnTo;
      navigate(returnTo || "/");
    }
  }, [user, navigate, posthog, dispatch]);

  // EMAIL/PASSWORD LOGIN
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccess("");
    setIsValidating(true);

    try {
      const form = new FormData(e.target);
      const email = form.get("email");
      const password = form.get("password");

      // Validate inputs
      if (!email || !password) {
        setLocalError("Email and password are required");
        posthog?.capture('login_failed', {
          method: 'email',
          error_type: 'missing_fields'
        });
        setIsValidating(false);
        return;
      }

      // Call loginUser with email and password
      const result = await dispatch(loginUser({
        email,
        password,
        full_name: "User"
      }));

      if (result.error) {
        setLocalError(result.payload || "Invalid email or password");
        posthog?.capture('login_failed', {
          method: 'email',
          error_type: 'invalid_credentials'
        });
      } else {
        posthog?.capture('login_succeeded', { method: 'email' });
        setSuccess("Login successful! Redirecting...");
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setLocalError("An unexpected error occurred. Please try again.");
      posthog?.capture('login_failed', {
        method: 'email',
        error_type: 'unexpected_error'
      });
    } finally {
      setIsValidating(false);
    }
  };

  // LOAD GOOGLE OAUTH2 SDK
  useEffect(() => {
    if (window.google?.accounts?.oauth2) {
      setGoogleReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google?.accounts?.oauth2) setGoogleReady(true);
    };

    script.onerror = () => setGoogleReady(false);
    document.body.appendChild(script);
  }, []);

  // GOOGLE LOGIN HANDLER
  const handleGoogleAuth = () => {
    setLocalError("");
    setSuccess("");

    if (!window.google?.accounts?.oauth2) {
      setLocalError("Google OAuth not loaded. Please refresh the page.");
      posthog?.capture('login_failed', {
        method: 'google',
        error_type: 'oauth_not_loaded'
      });
      return;
    }

    posthog?.capture('google_auth_initiated');

    try {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        ux_mode: "popup",
        redirect_uri: "postmessage",
        callback: async (response) => {
          try {
            setIsValidating(true);
            const code = response.code;

            if (!code) {
              setLocalError("Google authentication failed. No code received.");
              posthog?.capture('login_failed', {
                method: 'google',
                error_type: 'no_auth_code'
              });
              setIsValidating(false);
              return;
            }

            // Call googleLogin with code
            const result = await dispatch(googleLogin({ code }));

            if (result.error) {
              console.error("Google login failed:", result.error);
              setLocalError(result.payload || "Google login failed. Please try again.");
              posthog?.capture('login_failed', {
                method: 'google',
                error_type: 'google_auth_error'
              });
            } else {
              posthog?.capture('login_succeeded', { method: 'google' });
              setSuccess("Google login successful! Redirecting...");
            }
            setIsValidating(false);
          } catch (err) {
            console.error("Google callback error:", err);
            setLocalError("Google login failed. Please try again.");
            posthog?.capture('login_failed', {
              method: 'google',
              error_type: 'callback_error'
            });
            setIsValidating(false);
          }
        },
      });

      client.requestCode();
    } catch (err) {
      console.error("Google OAuth init error:", err);
      setLocalError("Google sign-in initialization failed. Please try again.");
      posthog?.capture('login_failed', {
        method: 'google',
        error_type: 'init_error'
      });
    }
  };

  // REGISTER HANDLER
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccess("");
    setIsValidating(true);

    try {
      const form = new FormData(e.target);
      const email = form.get("email");
      const password = form.get("password");
      const confirmPassword = form.get("confirmPassword");
      const normalizedEmail = email?.toString().trim().toLowerCase();

      posthog?.capture('signup_started', { method: 'email' });

      if (normalizedEmail && knownEmails.includes(normalizedEmail)) {
        setLocalError("Email already registered. Please login.");
        posthog?.capture('signup_failed', {
          method: 'email',
          error_type: 'email_already_exists'
        });
        setIsValidating(false);
        return;
      }

      // Validation
      if (!email || !password || !confirmPassword) {
        setLocalError("All fields are required");
        posthog?.capture('signup_failed', {
          method: 'email',
          error_type: 'missing_fields'
        });
        setIsValidating(false);
        return;
      }

      if (password !== confirmPassword) {
        setLocalError("Passwords do not match");
        posthog?.capture('signup_failed', {
          method: 'email',
          error_type: 'password_mismatch'
        });
        setIsValidating(false);
        return;
      }

      if (password.length < 8) {
        setLocalError("Password must be at least 8 characters long");
        posthog?.capture('signup_failed', {
          method: 'email',
          error_type: 'password_too_short'
        });
        setIsValidating(false);
        return;
      }

      const strength = evaluatePasswordStrength(password);
      if (strength === 'weak') {
        setLocalError("Weak password detected. Use at least 8 characters with mixed case, numbers, and symbols.");
        posthog?.capture('signup_failed', {
          method: 'email',
          error_type: 'weak_password'
        });
        setPasswordStrength('weak');
        setIsValidating(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setLocalError("Please enter a valid email address");
        posthog?.capture('signup_failed', {
          method: 'email',
          error_type: 'invalid_email'
        });
        setIsValidating(false);
        return;
      }

      // Prepare payload with new API structure
      const payload = {
        full_name: "User Account", // Default name, can be updated later
        email,
        password,
      };

      const result = await dispatch(registerUser(payload));

      if (result.error) {
        const payloadMessage = result.payload || "Registration failed.";
        const isDuplicate = /already exists|already registered/i.test(payloadMessage);

        setLocalError(isDuplicate
          ? "Email already registered. Please login."
          : payloadMessage
        );

        posthog?.capture('signup_failed', {
          method: 'email',
          error_type: isDuplicate ? 'email_already_exists' : 'registration_failed'
        });
        setIsValidating(false);
        return;
      }

      posthog?.capture('signup_completed', { method: 'email' });
      setKnownEmails((prev) => {
        const merged = [...prev, normalizedEmail];
        return Array.from(new Set(merged));
      });
      setSuccess("Account created successfully! You can now sign in.");
      setPasswordVal('');
      setPasswordStrength('');

      // Clear form and switch to signin tab after a short delay
      setTimeout(() => {
        e.target.reset();
        setActiveTab("signin");
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Sign up error:", err);
      setLocalError("An unexpected error occurred. Please try again.");
      posthog?.capture('signup_failed', {
        method: 'email',
        error_type: 'unexpected_error'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const GoogleIcon = () => (
    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-white border mr-2">
      <span className="text-[#4285F4] font-bold text-sm">G</span>
    </span>
  );

  // Stats for the hero section
  const stats = [
    { icon: Users, value: "847+", label: "1Ls Placed" },
    { icon: Trophy, value: "V10", label: "Firm Access" },
    { icon: TrendingUp, value: "94%", label: "Success Rate" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-warm-cream overflow-hidden">
      <Header />

      {/* Animated Background Blobs */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40 transition-transform duration-700 ease-out hidden md:block"
        style={{
          transform: `translate(${(mousePos.x - (typeof window !== "undefined" ? window.innerWidth : 1920) / 2) * 0.015}px, ${(mousePos.y - (typeof window !== "undefined" ? window.innerHeight : 1080) / 2) * 0.015}px)`,
        }}
      >
        <div className="absolute top-[15%] left-[5%] w-96 h-96 bg-electric-teal/30 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[15%] right-[10%] w-[500px] h-[500px] bg-ai-violet/30 rounded-full blur-[150px] animate-float-delayed" />
        <div className="absolute top-[50%] left-[40%] w-64 h-64 bg-butter-yellow/20 rounded-full blur-[100px] animate-pulse" />
      </div>

      <main className="flex-1 flex items-center justify-center pt-20 sm:pt-24 pb-10 sm:pb-16 px-4 sm:px-6 relative z-10">
        <div className="container mx-auto max-w-7xl w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">

            {/* LEFT SIDE - HERO */}
            <div className="space-y-8 sm:space-y-10 text-center lg:text-left animate-in fade-in slide-in-from-bottom-8 duration-1000">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full bg-soft-teal border border-electric-teal/20 text-deep-teal font-black uppercase tracking-[0.2em] text-[10px]">
                <Sparkles className="h-3 w-3 animate-pulse" />
                Join the 1% Club
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] sm:leading-[0.85] tracking-tighter text-charcoal mb-5 sm:mb-6 uppercase">
                  Your <br />
                  <span className="relative inline-block">
                    BigLaw
                    <svg
                      className="absolute -bottom-2 left-0 w-full h-4 text-electric-teal/40"
                      viewBox="0 0 100 10"
                      preserveAspectRatio="none"
                    >
                      <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                    </svg>
                  </span>
                  <br />
                  <span className="text-electric-teal">Journey</span> <br />
                  Starts Here
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-warm-gray font-bold uppercase tracking-wider max-w-lg mx-auto lg:mx-0">
                  AI-Powered Tools. Expert Resources. BigLaw Results.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto lg:mx-0">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="relative group"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="relative bg-white rounded-2xl p-3 sm:p-4 border-2 border-charcoal/10 group-hover:border-electric-teal/50 transition-all duration-300 group-hover:shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-electric-teal/5 to-ai-violet/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative">
                        <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-electric-teal mb-2 mx-auto lg:mx-0" />
                        <div className="text-xl sm:text-2xl font-black text-charcoal">{stat.value}</div>
                        <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-warm-gray">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-3 sm:gap-4 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-warm-cream bg-soft-teal flex items-center justify-center text-electric-teal font-black"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-charcoal">
                    Join 847+ Law Students
                  </div>
                  <div className="text-[11px] sm:text-xs font-medium text-warm-gray">
                    Who landed V100 positions
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - AUTH FORM */}
            <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 w-full">
              <Card className="border-none bg-white/95 backdrop-blur-xl shadow-2xl rounded-[2rem] sm:rounded-[3rem] overflow-hidden w-full max-w-xl mx-auto">
                <CardHeader className="text-center p-7 sm:p-10 bg-gradient-to-br from-electric-teal/5 via-transparent to-ai-violet/5 relative">
                  <div className="absolute top-0 right-0 w-28 h-28 sm:w-32 sm:h-32 bg-electric-teal/10 rounded-full blur-[60px]" />
                  <div className="relative">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-5 sm:mb-6 rounded-2xl bg-gradient-to-br from-electric-teal to-deep-teal flex items-center justify-center shadow-xl shadow-electric-teal/30">
                      <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2">
                      {activeTab === "signin" ? "Welcome Back" : "Join RIZZource"}
                    </CardTitle>
                    <CardDescription className="text-warm-gray font-medium text-sm sm:text-base">
                      {activeTab === "signin"
                        ? "Continue your BigLaw journey"
                        : "Start your path to V100 firms"}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="p-6 sm:p-10">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>

                    {/* Tab Selector */}
                    <TabsList className="grid grid-cols-2 mb-7 sm:mb-8 p-2 bg-warm-cream rounded-2xl h-12 sm:h-14">
                      <TabsTrigger
                        value="signin"
                        className="data-[state=active]:bg-charcoal data-[state=active]:text-white rounded-xl font-bold uppercase tracking-wider text-[11px] sm:text-xs transition-all duration-300 data-[state=active]:shadow-lg"
                      >
                        Sign In
                      </TabsTrigger>

                      <TabsTrigger
                        value="signup"
                        className="data-[state=active]:bg-charcoal data-[state=active]:text-white rounded-xl font-bold uppercase tracking-wider text-[11px] sm:text-xs transition-all duration-300 data-[state=active]:shadow-lg"
                      >
                        Sign Up
                      </TabsTrigger>
                    </TabsList>

                    {/* SIGN IN TAB */}
                    <TabsContent value="signin" className="space-y-6">
                      <form onSubmit={handleSignIn} className="space-y-5">
                        <div>
                          <Label className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-charcoal mb-2 block">
                            Email
                          </Label>
                          <Input
                            name="email"
                            type="email"
                            required
                            disabled={loading || isValidating}
                            className="h-11 sm:h-12 rounded-xl border-2 border-charcoal/10 bg-white font-medium
                                     focus-visible:ring-electric-teal focus-visible:border-electric-teal
                                     transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="your@email.com"
                          />
                        </div>

                        <div>
                          <Label className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-charcoal mb-2 block">
                            Password
                          </Label>
                          <Input
                            name="password"
                            type="password"
                            required
                            disabled={loading || isValidating}
                            className="h-11 sm:h-12 rounded-xl border-2 border-charcoal/10 bg-white font-medium
                                     focus-visible:ring-electric-teal focus-visible:border-electric-teal
                                     transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="••••••••"
                          />
                        </div>

                        <Button
                          disabled={loading || isValidating}
                          className="w-full h-12 sm:h-14 rounded-xl bg-charcoal hover:bg-deep-teal text-white
                                   font-black uppercase tracking-widest text-xs sm:text-sm
                                   shadow-lg shadow-charcoal/20
                                   transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                                   group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          {loading || isValidating ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Signing In...
                            </>
                          ) : (
                            <>
                              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                              <Zap className="mr-2 h-5 w-5" />
                              Sign In
                            </>
                          )}
                        </Button>

                        {/* Divider */}
                        <div className="relative py-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-charcoal/10" />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="px-4 bg-white text-xs font-black uppercase tracking-widest text-warm-gray">
                              Or
                            </span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGoogleAuth}
                          disabled={!googleReady || loading || isValidating}
                          className="w-full h-12 sm:h-14 rounded-xl border-2 border-charcoal/20 bg-white
                                   hover:bg-soft-teal hover:border-electric-teal
                                   font-bold uppercase tracking-wider text-xs sm:text-sm
                                   transition-all duration-300 hover:scale-[1.02]
                                   flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          {loading && isValidating ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          ) : (
                            <GoogleIcon />
                          )}
                          <span className="text-center">Continue with Google</span>
                        </Button>
                      </form>
                    </TabsContent>

                    {/* SIGN UP TAB */}
                    <TabsContent value="signup" className="space-y-6">
                      <form onSubmit={handleSignUp} className="space-y-5">
                        <div>
                          <Label className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-charcoal mb-2 block">
                            Email
                          </Label>
                          <Input
                            name="email"
                            type="email"
                            required
                            disabled={loading || isValidating}
                            className="h-11 sm:h-12 rounded-xl border-2 border-charcoal/10 bg-white font-medium
                                     focus-visible:ring-electric-teal focus-visible:border-electric-teal
                                     transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="your@email.com"
                          />
                        </div>

                        <div>
                          <Label className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-charcoal mb-2 block">
                            Password
                          </Label>
                          <Input
                            name="password"
                            type="password"
                            required
                            disabled={loading || isValidating}
                            onChange={handlePasswordChange}
                            value={passwordVal}
                            className="h-11 sm:h-12 rounded-xl border-2 border-charcoal/10 bg-white font-medium
                                     focus-visible:ring-electric-teal focus-visible:border-electric-teal
                                     transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="Min. 6 characters"
                          />
                          {passwordStrength && (
                            <p className={`mt-2 text-xs font-bold uppercase tracking-wider ${passwordStrength === 'weak' ? 'text-rose-600' : passwordStrength === 'medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
                              Password strength: {passwordStrength}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-charcoal mb-2 block">
                            Confirm Password
                          </Label>
                          <Input
                            name="confirmPassword"
                            type="password"
                            required
                            disabled={loading || isValidating}
                            className="h-11 sm:h-12 rounded-xl border-2 border-charcoal/10 bg-white font-medium
                                     focus-visible:ring-electric-teal focus-visible:border-electric-teal
                                     transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="Re-enter password"
                          />
                        </div>

                        <Button
                          disabled={loading || isValidating}
                          className="w-full h-12 sm:h-14 rounded-xl
                                   bg-gradient-to-r from-electric-teal to-deep-teal text-white
                                   font-black uppercase tracking-widest text-xs sm:text-sm
                                   shadow-lg shadow-electric-teal/30
                                   transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                                   group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          {loading || isValidating ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Creating Account...
                            </>
                          ) : (
                            <>
                              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                              <Sparkles className="mr-2 h-5 w-5" />
                              Create Account
                            </>
                          )}
                        </Button>

                        {/* Divider */}
                        <div className="relative py-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-charcoal/10" />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="px-4 bg-white text-xs font-black uppercase tracking-widest text-warm-gray">
                              Or
                            </span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGoogleAuth}
                          disabled={!googleReady || loading || isValidating}
                          className="w-full h-12 sm:h-14 rounded-xl border-2 border-charcoal/20 bg-white
                                   hover:bg-soft-teal hover:border-electric-teal
                                   font-bold uppercase tracking-wider text-xs sm:text-sm
                                   transition-all duration-300 hover:scale-[1.02]
                                   flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          {loading && isValidating ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          ) : (
                            <GoogleIcon />
                          )}
                          <span className="text-center">Sign up with Google</span>
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>

                  {/* ERRORS */}
                  {(localError || error) && (
                    <Alert className="mt-6 border-2 border-coral/50 bg-coral/10 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300">
                      <AlertDescription className="text-coral font-bold text-sm">
                        {localError || error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* SUCCESS */}
                  {success && (
                    <Alert className="mt-6 border-2 border-electric-teal/50 bg-soft-teal rounded-xl animate-in fade-in slide-in-from-top-4 duration-300">
                      <AlertDescription className="text-deep-teal font-bold text-sm flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        {success}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Trust Badge */}
                  <div className="mt-8 pt-6 border-t-2 border-charcoal/10">
                    <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-warm-gray text-center">
                      <Shield className="h-4 w-4 text-electric-teal shrink-0" />
                      <span>Secure & Trusted by 847+ Law Students</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;