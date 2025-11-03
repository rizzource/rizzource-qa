import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider'; // <- ensure this path matches where you saved the updated provider
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Scale } from 'lucide-react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import logoLight from "@/assets/rizzource-logo-light.png";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Single source of navigation truth: only here
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const formData = new FormData(e.target);
      const email = formData.get('email');
      const password = formData.get('password');

      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      // Do NOT navigate('/') here; useEffect handles it when user becomes non-null
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData(e.target);
      const email = formData.get('email');
      const password = formData.get('password');
      const confirmPassword = formData.get('confirmPassword');

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      const { error } = await signUp(email, password);
      if (error) {
        if (error.message?.toLowerCase().includes('already')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(error.message);
        }
      } else {
        setSuccess('Account created! Please check your email to verify your account.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Main Content */}
      <main className="flex-1 bg-background flex flex-col lg:flex-row items-stretch justify-center mt-16 lg:mt-20">
        {/* Left Side - Logo Section */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 flex items-center justify-center min-h-[40vh] lg:min-h-screen">
          <div className="relative z-10 container mx-auto px-4 mobile-optimized py-10 lg:py-20 flex items-center justify-center h-full">
            <div className="w-full space-y-6 lg:space-y-12">
              <div className="text-center space-y-4 lg:space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10 md:mb-12">
                  <img 
                    src={logoLight} 
                    alt="RIZZource" 
                    className="h-20 sm:h-20 w-auto"
                  />
                  <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight break-words font-bold">
                    <span className="text-accent">RIZZ</span>
                    <span className="text-primary">ource</span>
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="w-full lg:w-1/2 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 min-h-[60vh] lg:min-h-screen">
          <Card className="w-full max-w-md shadow-card bg-card hover:bg-muted/50 backdrop-blur-sm transition-all duration-300 group">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl text-foreground">Welcome Back</CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to your account or create a new one to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {/* Sign In */}
                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4" noValidate>
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-foreground font-medium">
                        Email Address
                      </Label>
                      <Input id="signin-email" name="email" type="email" autoComplete="email"
                        placeholder="Enter your email" required className="input-focus-green" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-foreground font-medium">
                        Password
                      </Label>
                      <Input id="signin-password" name="password" type="password" autoComplete="current-password"
                        placeholder="Enter your password" required className="input-focus-green" />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={isLoading} aria-busy={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                {/* Sign Up */}
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4" noValidate>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-foreground font-medium">
                        Email Address
                      </Label>
                      <Input id="signup-email" name="email" type="email" autoComplete="email"
                        placeholder="Enter your email" required className="input-focus-green" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-foreground font-medium">
                        Password
                      </Label>
                      <Input id="signup-password" name="password" type="password" autoComplete="new-password"
                        placeholder="Create a password (min. 6 characters)" required className="input-focus-green" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-foreground font-medium">
                        Confirm Password
                      </Label>
                      <Input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password"
                        placeholder="Confirm your password" required className="input-focus-green" />
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={isLoading} aria-busy={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {error && (
                <Alert className="mt-4 border-destructive bg-destructive/10">
                  <AlertDescription className="text-destructive text-sm">{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="mt-4 border-primary bg-primary/10">
                  <AlertDescription className="text-primary text-sm">{success}</AlertDescription>
                </Alert>
              )}

              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  By creating an account, you agree to our terms of service and privacy policy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
