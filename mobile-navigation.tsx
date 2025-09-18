import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  FileText,
  Settings,
  PieChart,
  Target
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useIsMobile, useIsTouchDevice, getTouchOptimizedSize } from '@/lib/responsive-utils';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview and KPIs'
  },
  {
    id: 'clients',
    label: 'Clients',
    href: '/clients',
    icon: Users,
    description: 'Client management'
  },
  {
    id: 'portfolios',
    label: 'Portfolios',
    href: '/portfolios',
    icon: PieChart,
    description: 'Portfolio tracking'
  },
  {
    id: 'scenarios',
    label: 'Scenarios',
    href: '/scenarios',
    icon: Target,
    description: 'Financial planning'
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    href: '/pipeline',
    icon: TrendingUp,
    description: 'Sales pipeline'
  },
  {
    id: 'compliance',
    label: 'Compliance',
    href: '/compliance',
    icon: FileText,
    description: 'Tasks and deadlines'
  }
];

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const isTouchDevice = useIsTouchDevice();
  
  // Get current active item
  const activeItem = navigationItems.find(item => {
    if (item.href === '/' && location === '/') return true;
    if (item.href !== '/' && location.startsWith(item.href)) return true;
    return false;
  });

  // Close sheet when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  const handleNavigate = (href: string) => {
    setLocation(href);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Navigation Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 lg:hidden"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-gray-900">FinanceApp</span>
          </motion.div>

          <div className="flex items-center gap-2">
            {/* Current page indicator */}
            <motion.div 
              className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {activeItem && (
                <>
                  <activeItem.icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{activeItem.label}</span>
                </>
              )}
            </motion.div>

            {/* Menu trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={getTouchOptimizedSize(isTouchDevice, 'md')}
                  data-testid="button-mobile-menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              
              <SheetContent side="right" className="w-80 p-0">
                <MobileNavigationContent 
                  items={navigationItems}
                  activeItem={activeItem}
                  onNavigate={handleNavigate}
                  onClose={() => setIsOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.div>

      {/* Content spacer */}
      <div className="h-16 lg:hidden" />
    </>
  );
}

interface MobileNavigationContentProps {
  items: NavigationItem[];
  activeItem?: NavigationItem;
  onNavigate: (href: string) => void;
  onClose: () => void;
}

function MobileNavigationContent({ 
  items, 
  activeItem, 
  onNavigate, 
  onClose 
}: MobileNavigationContentProps) {
  const isTouchDevice = useIsTouchDevice();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <span className="font-semibold text-gray-900">Navigation</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          className={getTouchOptimizedSize(isTouchDevice, 'sm')}
          data-testid="button-close-menu"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          <AnimatePresence>
            {items.map((item, index) => {
              const isActive = activeItem?.id === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onNavigate(item.href)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-50 border-blue-200 border text-blue-900' 
                      : 'hover:bg-gray-50 border border-transparent'
                  } ${getTouchOptimizedSize(isTouchDevice, 'md')}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid={`nav-item-${item.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isActive ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <item.icon className={`w-5 h-5 ${
                        isActive ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className={`font-medium ${
                        isActive ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {item.label}
                      </div>
                      <div className={`text-sm ${
                        isActive ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                    
                    {isActive && (
                      <motion.div
                        className="w-2 h-2 bg-blue-600 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="outline" 
          className={`w-full ${getTouchOptimizedSize(isTouchDevice, 'md')}`}
          onClick={() => onNavigate('/settings')}
          data-testid="nav-settings"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
}