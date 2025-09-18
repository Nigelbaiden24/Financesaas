import { ReactNode } from "react";
import MobileHeader from "./mobile-header";

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showSearch?: boolean;
  rightAction?: ReactNode;
  className?: string;
}

export default function MobileLayout({ 
  children, 
  title, 
  showSearch, 
  rightAction, 
  className = "" 
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader 
        title={title} 
        showSearch={showSearch} 
        rightAction={rightAction} 
      />
      
      <main className={`md:pt-0 pt-20 pb-6 px-4 ${className}`}>
        {children}
      </main>
    </div>
  );
}