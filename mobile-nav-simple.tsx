import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Home, 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  LogOut,
  Crown,
  Shield,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function MobileNavSimple() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  const isAdmin = user?.email === "nigelbaiden24@yahoo.com";

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Generate Documents", icon: FileText },
    { href: "/client-dashboard", label: "My Designs", icon: LayoutDashboard },
    { href: "/subscribe", label: "Upgrade Plan", icon: CreditCard }
  ];

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'freemium':
        return <Badge variant="secondary" className="ml-2 text-xs">Free</Badge>;
      case 'starter':
        return <Badge variant="default" className="ml-2 text-xs">Starter</Badge>;
      case 'pro':
        return <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-800">Pro</Badge>;
      case 'agency':
        return <Badge variant="secondary" className="ml-2 text-xs bg-purple-100 text-purple-800">Agency</Badge>;
      default:
        return null;
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="md:hidden fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm border shadow-sm"
        onClick={() => setIsOpen(true)}
        data-testid="mobile-menu-trigger"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)}>
          <div 
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Jenrate.AI</h2>
                  {user && (
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-600 truncate max-w-48">
                        {user.email}
                      </span>
                      {getPlanBadge(user.currentPlan)}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col h-full">
              <nav className="flex-1 p-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start gap-3 h-12 text-left ${
                          isActive 
                            ? "bg-amber-100 text-amber-900 hover:bg-amber-200" 
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => setIsOpen(false)}
                        data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}

                {isAdmin && (
                  <Link href="/admin">
                    <Button
                      variant={location === "/admin" ? "default" : "ghost"}
                      className={`w-full justify-start gap-3 h-12 text-left ${
                        location === "/admin" 
                          ? "bg-amber-100 text-amber-900 hover:bg-amber-200" 
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setIsOpen(false)}
                      data-testid="nav-admin"
                    >
                      <Shield className="h-5 w-5" />
                      <span className="font-medium">Admin Dashboard</span>
                      <Crown className="h-4 w-4 ml-auto text-amber-600" />
                    </Button>
                  </Link>
                )}
              </nav>

              {/* Logout */}
              <div className="p-4 border-t">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
                  data-testid="nav-logout"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}