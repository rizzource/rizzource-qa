import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Scale, Shield, BookOpen, Users } from 'lucide-react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(email, password);
    if (error) {
      if (error.message.includes('already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(error.message);
      }
    } else {
      setSuccess('Account created successfully! Please check your email to verify your account.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Main Content */}
      <main className="flex-1 bg-background flex flex-col lg:flex-row items-stretch justify-center mt-16 lg:mt-20">
          {/* Left Side - Logo Section */}
          <div className="w-full lg:w-1/2 p-4 sm:p-6 bg-primary flex items-center justify-center min-h-[40vh] lg:min-h-screen">
            <div className="relative z-10 container mx-auto px-4 mobile-optimized py-10 lg:py-20 flex items-center justify-center h-full">
              <div className="w-full space-y-6 lg:space-y-12">
                <div className="text-center space-y-4 lg:space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 lg:mb-12">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                      <Scale className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-gold-light" />
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl leading-tight break-words">
                      <span className="text-gold-light font-bold">RIZZ</span>
                      <span className="text-white font-semibold">ource</span>
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="w-full lg:w-1/2 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 min-h-[60vh] lg:min-h-screen">
            <Card className="w-full max-w-md shadow-card bg-card hover:bg-muted/50 backdrop-blur-sm">
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
                  <TabsContent value="signin" className="space-y-4">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email" className="text-foreground font-medium">
                          Email Address
                        </Label>
                        <Input id="signin-email" name="email" type="email" placeholder="Enter your email" required className="input-focus-green" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password" className="text-foreground font-medium">
                          Password
                        </Label>
                        <Input id="signin-password" name="password" type="password" placeholder="Enter your password" required className="input-focus-green" />
                      </div>
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                      </Button>
                    </form>
                  </TabsContent>
                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-foreground font-medium">
                          Email Address
                        </Label>
                        <Input id="signup-email" name="email" type="email" placeholder="Enter your email" required className="input-focus-green" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-foreground font-medium">
                          Password
                        </Label>
                        <Input id="signup-password" name="password" type="password" placeholder="Create a password (min. 6 characters)" required className="input-focus-green" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-foreground font-medium">
                          Confirm Password
                        </Label>
                        <Input id="confirm-password" name="confirmPassword" type="password" placeholder="Confirm your password" required className="input-focus-green" />
                      </div>
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
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
