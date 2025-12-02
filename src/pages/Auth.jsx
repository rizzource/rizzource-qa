import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser, googleLogin } from "@/redux/slices/userApiSlice";
import { useNavigate } from "react-router-dom";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import logoLight from "@/assets/rizzource-logo-light.png";

const GOOGLE_CLIENT_ID =
  "267038711162-c6681crs3mm7gq8cheglst9gej50m527.apps.googleusercontent.com";

const Auth = () => {
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleReady, setGoogleReady] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading, error } = useSelector((state) => state.userApi);

  // Redirect after login
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  // ----------------------
  // EMAIL/PASSWORD LOGIN
  // ----------------------
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccess("");

    const form = new FormData(e.target);
    const Email = form.get("email");
    const Password = form.get("password");

    const result = await dispatch(loginUser({ Email, Password }));

    if (result.error) {
      setLocalError("Invalid email or password");
    }
  };

  // ------------------------------
  // LOAD GOOGLE OAUTH2 SDK SAFELY
  // ------------------------------
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
      if (window.google?.accounts?.oauth2) {
        setGoogleReady(true);
      }
    };

    script.onerror = () => setGoogleReady(false);

    document.body.appendChild(script);
  }, []);



  // ------------------------------
  // GOOGLE LOGIN HANDLER (FIXED)
  // Uses OAuth2 Token Client — NO FedCM
  // ------------------------------
  // ------------------------------
  // GOOGLE LOGIN HANDLER (OAuth Popup Code Flow)
  // ------------------------------
  const handleGoogleAuth = () => {
    setLocalError("");
    setSuccess("");

    if (!window.google?.accounts?.oauth2) {
      setLocalError("Google OAuth not loaded.");
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        ux_mode: "popup",            // ⭐ REAL POPUP WINDOW
        redirect_uri: "postmessage",  // ⭐ Required for JS-based code flow
        callback: async (response) => {
          try {
            const code = response.code;

            const result = await dispatch(googleLogin({ code }));

            if (result.error) {
              console.error("Google login failed:", result.error);
              setLocalError("Google login failed.");
            }
          } catch (err) {
            console.error("Google callback error:", err);
            setLocalError("Google login failed.");
          }
        },
      });

      client.requestCode(); // ⭐ Opens real popup window
    } catch (err) {
      console.error("Google OAuth init error:", err);
      setLocalError("Google sign-in failed.");
    }
  };






  // ----------------------
  // REGISTER HANDLER
  // ----------------------
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccess("");

    const form = new FormData(e.target);
    const Email = form.get("email");
    const Password = form.get("password");
    const Confirm = form.get("confirmPassword");

    if (Password !== Confirm) {
      setLocalError("Passwords do not match");
      return;
    }

    if (Password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      return;
    }

    const payload = {
      FirstName: "User",
      LastName: "Account",
      UserName: Email.split("@")[0],
      Email,
      Password,
    };

    const result = await dispatch(registerUser(payload));

    if (result.error) {
      setLocalError("This email is already registered.");
      return;
    }

    setSuccess("Account created successfully! You can now sign in.");
  };

  // Small inline Google icon – no extra deps
  const GoogleIcon = () => (
    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-white border mr-2">
      <span className="text-[#4285F4] font-bold text-sm">G</span>
    </span>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-background flex flex-col lg:flex-row items-stretch justify-center mt-16 lg:mt-20">

        {/* LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 flex items-center justify-center">
          <div className="text-center">
            <img src={logoLight} alt="RIZZource" className="h-20 mx-auto" />
            <h1 className="mt-4 text-5xl font-bold">
              <span className="text-accent">RIZZ</span>
              <span className="text-primary">ource</span>
            </h1>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Sign in or create your account</CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="signin">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger
                    value="signin"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all duration-200"
                  >
                    Sign In
                  </TabsTrigger>

                  <TabsTrigger
                    value="signup"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all duration-200"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {/* SIGN IN */}
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <Label>Email</Label>
                      <Input name="email" type="email" required />
                    </div>

                    <div>
                      <Label>Password</Label>
                      <Input name="password" type="password" required />
                    </div>

                    <Button disabled={loading} className="w-full mt-2">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleAuth}
                      disabled={!googleReady || loading}
                      className="w-full mt-3 rounded-md border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center"
                    >
                      {loading && !user ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <GoogleIcon />
                      )}
                      <span>Sign in with Google</span>
                    </Button>
                  </form>
                </TabsContent>

                {/* SIGN UP */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <Label>Email</Label>
                      <Input name="email" type="email" required />
                    </div>

                    <div>
                      <Label>Password</Label>
                      <Input name="password" type="password" required />
                    </div>

                    <div>
                      <Label>Confirm Password</Label>
                      <Input name="confirmPassword" type="password" required />
                    </div>

                    <Button disabled={loading} className="w-full mt-2">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleAuth}
                      disabled={!googleReady || loading}
                      className="w-full mt-3 rounded-md border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center"
                    >
                      {loading && !user ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <GoogleIcon />
                      )}
                      <span>Sign up with Google</span>
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* ERRORS */}
              {(localError || error) && (
                <Alert className="mt-4 border-destructive bg-destructive/10">
                  <AlertDescription className="text-destructive">
                    {localError || error}
                  </AlertDescription>
                </Alert>
              )}

              {/* SUCCESS */}
              {success && (
                <Alert className="mt-4 border-primary bg-primary/10">
                  <AlertDescription className="text-primary">
                    {success}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
