import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Hotel, User, Lock, AlertCircle, Mail, Phone } from "lucide-react";
import { hotelApi } from "@/lib/hotel-api";

interface HotelAuthProps {
  onLogin: (username: string) => void;
}

export default function HotelAuth({ onLogin }: HotelAuthProps) {
  // Sign In State
  const [signInData, setSignInData] = useState({
    username: "",
    password: ""
  });

  // Sign Up State
  const [signUpData, setSignUpData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");

  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignInData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!signInData.username.trim()) {
        setError("Please enter your username");
        return;
      }

      if (!signInData.password.trim()) {
        setError("Please enter your password");
        return;
      }

      const response = await hotelApi.login({
        username: signInData.username,
        password: signInData.password
      });

      if (response.success) {
        onLogin(signInData.username);
      } else {
        setError(response.message || "Invalid credentials");
      }
    } catch (err: any) {
      setError(err.message || "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Validation
      if (!signUpData.username.trim()) {
        setError("Please enter a username");
        return;
      }

      if (!signUpData.email.trim()) {
        setError("Please enter your email");
        return;
      }

      if (!signUpData.phone.trim()) {
        setError("Please enter your phone number");
        return;
      }

      if (!signUpData.password.trim()) {
        setError("Please enter a password");
        return;
      }

      if (signUpData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }

      if (signUpData.password !== signUpData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signUpData.email)) {
        setError("Please enter a valid email address");
        return;
      }

      // Phone validation (basic)
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(signUpData.phone.replace(/\s/g, ''))) {
        setError("Please enter a valid phone number");
        return;
      }

      const response = await hotelApi.register({
        username: signUpData.username,
        email: signUpData.email,
        phone: signUpData.phone,
        password: signUpData.password
      });

      if (response.success) {
        setSuccess("Account created successfully! You can now sign in.");
        setSignUpData({
          username: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: ""
        });
        // Auto switch to sign in tab
        setTimeout(() => {
          setActiveTab("signin");
          setSuccess("");
        }, 2000);
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.03\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"}></div>
      
      <div className="relative w-full max-w-md">
        {/* Theme Toggle */}
        <div className="absolute -top-16 right-0 z-10">
          <ThemeToggle />
        </div>

        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full p-4 w-16 h-16 mx-auto mb-4 shadow-lg">
            <Hotel className="h-8 w-8 text-slate-800 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Hotel Management</h1>
          <p className="text-slate-300">System Portal</p>
        </div>

        {/* Auth Card */}
        <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100">
              Welcome
            </CardTitle>
            <CardDescription className="text-center text-slate-600 dark:text-slate-300">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4 mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="signin-username"
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        value={signInData.username}
                        onChange={handleSignInChange}
                        className="pl-10 h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={signInData.password}
                        onChange={handleSignInChange}
                        className="pl-10 h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-username"
                        name="username"
                        type="text"
                        placeholder="Choose a username"
                        value={signUpData.username}
                        onChange={handleSignUpChange}
                        className="pl-10 h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={signUpData.email}
                        onChange={handleSignUpChange}
                        className="pl-10 h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={signUpData.phone}
                        onChange={handleSignUpChange}
                        className="pl-10 h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        value={signUpData.password}
                        onChange={handleSignUpChange}
                        className="pl-10 h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-confirm-password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={signUpData.confirmPassword}
                        onChange={handleSignUpChange}
                        className="pl-10 h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md mt-4">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-md mt-4">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{success}</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-8">
          © 2024 Hotel Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
