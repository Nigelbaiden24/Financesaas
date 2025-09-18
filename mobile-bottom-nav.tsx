import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  FileText, 
  LayoutDashboard, 
  CreditCard, 
  User 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function MobileBottomNav() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Show navigation for all users, but with different access levels
  if (!isAuthenticated) {
    // Show limited navigation for non-authenticated users
    const guestItems = [
      { href: "/", label: "Home", icon: Home },
      { href: "/#pricing", label: "Pricing", icon: CreditCard }
    ];
    
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {guestItems.map((item) => {
            const Icon = item.icon;
            
            if (item.label === "Pricing") {
              return (
                <div key={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      if (window.location.pathname === '/') {
                        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        window.location.href = '/#pricing';
                      }
                    }}
                    className="flex flex-col items-center gap-1 h-16 w-16 p-1 transition-all duration-200 text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                    data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium leading-tight">{item.label}</span>
                  </Button>
                </div>
              );
            }
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col items-center gap-1 h-16 w-16 p-1 transition-all duration-200 text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                  data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium leading-tight">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/client-dashboard", label: "My Reports", icon: FileText },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/about", label: "About", icon: User },
    { href: "/#pricing", label: "Pricing", icon: CreditCard }
  ];

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'freemium':
        return "bg-gray-500";
      case 'starter':
        return "bg-blue-500";
      case 'pro':
        return "bg-purple-500";
      case 'agency':
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          // Handle special cases for My Reports and Pricing
          if (item.label === "My Reports") {
            // Check if user has reports or access
            const hasReports = user && user.currentPlan && user.currentPlan !== 'freemium';
            
            return (
              <div key={item.href}>
                {hasReports ? (
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex flex-col items-center gap-1 h-16 w-16 p-1 transition-all duration-200 ${
                        isActive 
                          ? "text-amber-600 bg-amber-50 shadow-sm" 
                          : "text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                      }`}
                      data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium leading-tight">{item.label}</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="flex flex-col items-center gap-1 h-16 w-16 p-1 text-gray-400 cursor-not-allowed"
                    data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium leading-tight">{item.label}</span>
                  </Button>
                )}
              </div>
            );
          }
          
          // Handle Pricing navigation
          if (item.label === "Pricing") {
            return (
              <div key={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    if (window.location.pathname === '/') {
                      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.location.href = '/#pricing';
                    }
                  }}
                  className="flex flex-col items-center gap-1 h-16 w-16 p-1 transition-all duration-200 text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                  data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium leading-tight">{item.label}</span>
                </Button>
              </div>
            );
          }
          
          // Regular navigation items
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 h-16 w-16 p-1 transition-all duration-200 ${
                  isActive 
                    ? "text-amber-600 bg-amber-50 shadow-sm" 
                    : "text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                }`}
                data-testid={`mobile-nav-${item.label.toLowerCase()}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium leading-tight">{item.label}</span>
                {(item.label === "About" || item.label === "Profile") && user?.currentPlan && (
                  <div className={`w-2 h-2 rounded-full ${getPlanColor(user.currentPlan)} absolute top-1 right-1`} />
                )}
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}