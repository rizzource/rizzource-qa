import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Scale, Shield } from 'lucide-react';
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
      <main className="flex-1 flex items-center justify-center p-4">
          {/* Left Side - Add your own content here */}
          <div className="w-1/2 p-6">
            {/* LEFT SIDE CONTENT GOES HERE */}
          </div>

          {/* Right Side - Form Section */}
          <div className="w-1/2 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6">
            <Card className="w-full max-w-md shadow-card bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
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
