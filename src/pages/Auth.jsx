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

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
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
  <div className="min-h-screen bg-hero-gradient flex flex-col">
    {/* Floating Background Elements (reuse from homepage for consistency) */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-4 md:left-10 animate-float opacity-20">
        <Scale className="w-12 h-12 md:w-16 md:h-16 text-gold-light" />
      </div>
      <div className="absolute top-40 right-4 md:right-20 animate-float-delayed opacity-20">
        <Shield className="w-10 h-10 md:w-12 md:h-12 text-gold-light" />
      </div>
    </div>

    <div className="relative z-10 flex flex-1">
      {/* Left Section - Logo & App Name */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 text-center text-white p-10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <Scale className="w-10 h-10 text-gold-light" />
          </div>
          <h1 className="text-5xl font-bold">
            <span className="text-gold-light">RIZZ</span>
            <span className="text-white">ource</span>
          </h1>
          <p className="text-lg text-white/80 mt-4 max-w-md">
            Law School and Beyond
          </p>
        </div>
      </div>

      {/* Right Section - Auth Card */}
      <div className="flex flex-1 justify-center items-center p-6 md:w-1/2 bg-white/90 backdrop-blur-sm">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Existing Tabs (Sign In / Sign Up) go here */}
            {/* ... KEEP YOUR TABS CODE AS IT IS ... */}

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
          </CardContent>
        </Card>
      </div>
    </div>

    <Footer />
  </div>
);
};

export default Auth;