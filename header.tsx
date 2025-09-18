import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, Home, CreditCard, Info, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthModal from "@/components/auth-modal";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoPath from "@assets/IMG_3780_1754156242051.jpeg";

export default function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      queryClient.clear();
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      });
    }
  });

  return (
    <header className="bg-black shadow-lg sticky top-0 z-40 border-b border-yellow-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img 
              src={logoPath} 
              alt="Jenrate.Ai Logo" 
              className="h-8 w-8 rounded-lg object-cover border-2 border-yellow-500"
            />
            <a href="/" className="flex items-center">
              <h1 className="text-lg font-bold text-yellow-400 font-playfair">
                Jenrate.Ai
              </h1>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-yellow-300 hover:text-yellow-400 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-yellow-500/10">
              Home
            </a>
            <a 
              href="#pricing" 
              className="text-yellow-300 hover:text-yellow-400 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-yellow-500/10"
              onClick={(e) => {
                e.preventDefault();
                // Scroll to pricing section if on home page, otherwise navigate to home with hash
                if (window.location.pathname === '/') {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#pricing';
                }
              }}
            >
              Pricing
            </a>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-yellow-300 hover:text-yellow-400 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-yellow-500/10 flex items-center" data-testid="dropdown-solutions">
                Solutions
                <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black border-yellow-500 mt-2">
                <DropdownMenuItem className="text-yellow-300 hover:text-yellow-400 hover:bg-yellow-500/10 focus:text-yellow-400 focus:bg-yellow-500/10" data-testid="dropdown-ai-generation">
                  <a href="/solutions/ai-generation" className="w-full">AI Generation Tool</a>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-yellow-300 hover:text-yellow-400 hover:bg-yellow-500/10 focus:text-yellow-400 focus:bg-yellow-500/10" data-testid="dropdown-workflow">
                  <a href="/solutions/workflow" className="w-full">Workflow Tool</a>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-yellow-300 hover:text-yellow-400 hover:bg-yellow-500/10 focus:text-yellow-400 focus:bg-yellow-500/10" data-testid="dropdown-consultancy">
                  <a href="/solutions/consultancy" className="w-full">Outsourced Paraplanning</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <a href="/about" className="text-yellow-300 hover:text-yellow-400 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-yellow-500/10">
              About
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoading ? (
              <div className="w-8 h-8 animate-pulse bg-yellow-500/20 rounded-full"></div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <span className="text-yellow-300 text-sm font-medium">
                  Welcome, {user.username || user.email?.split('@')[0]}
                </span>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = "/dashboard"}
                  className="border-2 border-yellow-500 text-black hover:bg-yellow-50 transition-colors"
                  data-testid="button-dashboard"
                >
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="border-2 border-yellow-500 text-black hover:bg-yellow-50 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {logoutMutation.isPending ? "..." : "Logout"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <AuthModal
                  trigger={
                    <Button variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-colors">
                      Sign In
                    </Button>
                  }
                />
                <AuthModal
                  trigger={
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 transition-colors">
                      Get Started
                    </Button>
                  }
                />
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="p-2 text-yellow-400 hover:text-yellow-500 hover:bg-yellow-500/10"
                  data-testid="mobile-menu-button"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-slate-900 border-slate-800">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between mb-8 pt-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={logoPath} 
                        alt="Jenrate.Ai Logo" 
                        className="h-8 w-8 rounded-lg object-cover border-2 border-yellow-500"
                      />
                      <span className="text-white font-semibold text-lg">Jenrate.Ai</span>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 space-y-4">
                    <a 
                      href="/" 
                      className="flex items-center gap-3 text-yellow-300 hover:text-yellow-400 transition-colors font-medium px-4 py-3 rounded-lg hover:bg-yellow-500/10"
                      data-testid="mobile-nav-home"
                    >
                      <Home className="h-5 w-5" />
                      Home
                    </a>
                    <a 
                      href="/#pricing" 
                      className="flex items-center gap-3 text-yellow-300 hover:text-yellow-400 transition-colors font-medium px-4 py-3 rounded-lg hover:bg-yellow-500/10"
                      data-testid="mobile-nav-pricing"
                      onClick={(e) => {
                        e.preventDefault();
                        // Close the sheet and navigate to pricing
                        if (window.location.pathname === '/') {
                          document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          window.location.href = '/#pricing';
                        }
                      }}
                    >
                      <CreditCard className="h-5 w-5" />
                      Pricing
                    </a>
                    <a 
                      href="/about" 
                      className="flex items-center gap-3 text-yellow-300 hover:text-yellow-400 transition-colors font-medium px-4 py-3 rounded-lg hover:bg-yellow-500/10"
                      data-testid="mobile-nav-about"
                    >
                      <Info className="h-5 w-5" />
                      About
                    </a>
                    {isAuthenticated && (
                      <a 
                        href="/dashboard" 
                        className="flex items-center gap-3 text-yellow-300 hover:text-yellow-400 transition-colors font-medium px-4 py-3 rounded-lg hover:bg-yellow-500/10"
                        data-testid="mobile-nav-dashboard"
                      >
                        <User className="h-5 w-5" />
                        Dashboard
                      </a>
                    )}
                  </nav>

                  {/* Mobile Actions */}
                  <div className="space-y-3 pb-4">
                    {isLoading ? (
                      <div className="w-full h-12 animate-pulse bg-yellow-500/20 rounded-lg"></div>
                    ) : isAuthenticated && user ? (
                      <div className="space-y-3">
                        <div className="text-yellow-300 text-sm font-medium px-4 py-2 bg-slate-800 rounded-lg">
                          Welcome, {user.username || user.email?.split('@')[0]}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => logoutMutation.mutate()}
                          disabled={logoutMutation.isPending}
                          className="w-full border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          {logoutMutation.isPending ? "..." : "Logout"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <AuthModal
                          trigger={
                            <Button 
                              variant="outline" 
                              className="w-full border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-colors"
                            >
                              Sign In
                            </Button>
                          }
                        />
                        <AuthModal
                          trigger={
                            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold transition-colors">
                              Get Started
                            </Button>
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}