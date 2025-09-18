import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinancialAuth } from "@/lib/financial-auth";
import { useToast } from "@/hooks/use-toast";
import { Shield, TrendingUp, Users, BarChart3 } from "lucide-react";
import Header from "@/components/header";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, register, isLoginPending, isRegisterPending, loginError, registerError } = useFinancialAuth();
  const { toast } = useToast();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "adviser" as const,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginForm);
      toast({
        title: "Login Successful",
        description: "Welcome to the Financial Advisory Platform",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Registration Failed",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      await register({
        email: registerForm.email,
        password: registerForm.password,
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        role: registerForm.role,
      });
      toast({
        title: "Registration Successful",
        description: "Welcome to the Financial Advisory Platform",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    }
  };

  const handleDemoLogin = async () => {
    try {
      await login({ email: "demo@jenrate.ai", password: "demo123" });
      toast({
        title: "Demo Login Successful",
        description: "Exploring the platform in demo mode",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Demo Login Failed",
        description: "Demo account not available. Please register instead.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Platform Overview */}
          <div className="text-white space-y-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Financial Advisory
                <span className="block text-yellow-400">Platform</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Complete practice management and client planning suite inspired by Voyant.
                Multi-tenant architecture with role-based access control.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Client Management</h3>
                  <p className="text-gray-400">Complete client profiles with risk assessment and goal tracking</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Portfolio Analytics</h3>
                  <p className="text-gray-400">Real-time portfolio tracking with performance analytics</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Financial Planning</h3>
                  <p className="text-gray-400">Interactive scenario modeling and retirement planning</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Compliance</h3>
                  <p className="text-gray-400">Automated compliance tracking and regulatory reporting</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="font-semibold text-lg mb-3">Try Demo Account</h3>
              <p className="text-gray-400 mb-4">
                Explore the platform with sample data and full functionality
              </p>
              <Button 
                onClick={handleDemoLogin}
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                data-testid="button-demo-login"
              >
                Launch Demo
              </Button>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md bg-white/95 backdrop-blur">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Access Platform</CardTitle>
                <CardDescription>
                  Sign in to your advisory firm account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email Address</Label>
                        <Input
                          id="login-email"
                          type="email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          required
                          data-testid="input-login-email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          required
                          data-testid="input-login-password"
                        />
                      </div>
                      {loginError && (
                        <p className="text-sm text-red-600">{loginError.message}</p>
                      )}
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoginPending}
                        data-testid="button-login-submit"
                      >
                        {isLoginPending ? "Signing In..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-firstName">First Name</Label>
                          <Input
                            id="register-firstName"
                            value={registerForm.firstName}
                            onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                            required
                            data-testid="input-register-firstname"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-lastName">Last Name</Label>
                          <Input
                            id="register-lastName"
                            value={registerForm.lastName}
                            onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                            required
                            data-testid="input-register-lastname"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email Address</Label>
                        <Input
                          id="register-email"
                          type="email"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          required
                          data-testid="input-register-email"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                          id="register-password"
                          type="password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          required
                          data-testid="input-register-password"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-confirmPassword">Confirm Password</Label>
                        <Input
                          id="register-confirmPassword"
                          type="password"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                          required
                          data-testid="input-register-confirm-password"
                        />
                      </div>

                      {registerError && (
                        <p className="text-sm text-red-600">{registerError.message}</p>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isRegisterPending}
                        data-testid="button-register-submit"
                      >
                        {isRegisterPending ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}