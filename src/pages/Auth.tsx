
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { User, Lock, Mail } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp, loading, user } = useAuth();
  const navigate = useNavigate();
  
  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                Welcome to HandleHunter
              </h1>
              <p className="text-gray-600 mt-2">
                Sign in or create an account to start monitoring your social media handles.
              </p>
            </div>
            
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <Card>
                  <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your dashboard.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSignIn}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <div className="relative">
                          <div className="absolute left-3 top-3 text-gray-400">
                            <Mail className="h-4 w-4" />
                          </div>
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password">Password</Label>
                        <div className="relative">
                          <div className="absolute left-3 top-3 text-gray-400">
                            <Lock className="h-4 w-4" />
                          </div>
                          <Input
                            id="signin-password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full bg-brand-blue hover:bg-brand-purple"
                        disabled={loading}
                      >
                        {loading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="signup">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>
                      Sign up to start tracking your social media handles.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSignUp}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <div className="absolute left-3 top-3 text-gray-400">
                            <Mail className="h-4 w-4" />
                          </div>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <div className="absolute left-3 top-3 text-gray-400">
                            <Lock className="h-4 w-4" />
                          </div>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        By creating an account, you agree to our Terms of Service and Privacy Policy.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full bg-brand-blue hover:bg-brand-purple"
                        disabled={loading}
                      >
                        {loading ? 'Creating account...' : 'Create Account'}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
