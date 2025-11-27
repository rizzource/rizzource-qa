import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "@/redux/slices/userApiSlice";
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

const Auth = () => {
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading, error } = useSelector((state) => state.userApi);

  // Redirect after login
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  // ----------------------
  // LOGIN HANDLER
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
      return;
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-background flex flex-col lg:flex-row items-stretch justify-center mt-16 lg:mt-20">

        {/* LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 flex items-center justify-center">
          <div className="text-center">
            <img src={logoLight} alt="RIZZource" className="h-20 mx-auto" />
            <h1 className="mt-4 text-5xl font-bold">
              <span className="text-accent">RIZZ</span><span className="text-primary">ource</span>
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
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
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
