import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import MobileNav from "./mobile-nav";

interface MobileHeaderProps {
  title?: string;
  showSearch?: boolean;
  rightAction?: React.ReactNode;
}

export default function MobileHeader({ title, showSearch, rightAction }: MobileHeaderProps) {
  const { user, isAuthenticated } = useAuth();

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'freemium':
        return "bg-gray-100 text-gray-800";
      case 'starter':
        return "bg-blue-100 text-blue-800";
      case 'pro':
        return "bg-purple-100 text-purple-800";
      case 'agency':
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isAuthenticated) {
    return (
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/">
            <h1 className="text-xl font-bold text-gray-900">Jenrate.AI</h1>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth/signin">
              <Button size="sm" variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <MobileNav />
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-3 pl-16">
          <div className="flex-1 min-w-0">
            {title ? (
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h1>
            ) : (
              <Link href="/">
                <h1 className="text-lg font-bold text-gray-900">Jenrate.AI</h1>
              </Link>
            )}
            {user && (
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getPlanColor(user.currentPlan)}`}
                >
                  {user.currentPlan === 'freemium' ? 'Free' : user.currentPlan}
                </Badge>
                {user.monthlyUsage !== undefined && user.planLimit !== undefined && (
                  <span className="text-xs text-gray-500">
                    {user.monthlyUsage}/{user.planLimit === -1 ? '∞' : user.planLimit}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showSearch && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Search className="h-4 w-4" />
              </Button>
            )}
            
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bell className="h-4 w-4" />
            </Button>

            {rightAction || (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <User className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}