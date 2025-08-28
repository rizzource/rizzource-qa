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
      <Header />
        <main className="flex-1 flex items-center justify-center p-10">
          <div className="flex w-full max-w-5xl bg-white/0 rounded-lg shadow-none overflow-hidden">
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
                  {/* Tabs, Forms, Alerts, and Footer Text - unchanged */}
                  {/* Paste all your existing <Tabs> ... </Tabs> block here */}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      <Footer /> 
    </div> 
  );
};

export default Auth;