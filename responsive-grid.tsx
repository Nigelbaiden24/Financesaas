import { Children, cloneElement, isValidElement } from 'react';
import { motion } from 'framer-motion';
import { useScreenSize, getResponsiveGridCols, getResponsiveSpacing } from '@/lib/responsive-utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', number>>;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  animateItems?: boolean;
  staggerDelay?: number;
}

export default function ResponsiveGrid({
  children,
  cols = {},
  gap = 'md',
  className = '',
  animateItems = true,
  staggerDelay = 0.1
}: ResponsiveGridProps) {
  const { breakpoint } = useScreenSize();
  const gridCols = getResponsiveGridCols(breakpoint, cols);
  const spacing = getResponsiveSpacing(breakpoint);
  
  const gapClasses = {
    sm: 'gap-2 md:gap-3',
    md: 'gap-3 md:gap-4 lg:gap-6',
    lg: 'gap-4 md:gap-6 lg:gap-8'
  };

  const gridClass = `grid grid-cols-${gridCols} ${gapClasses[gap]} ${className}`;

  const childArray = Children.toArray(children);

  return (
    <div className={gridClass}>
      {childArray.map((child, index) => {
        if (!isValidElement(child)) return child;

        if (animateItems) {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * staggerDelay,
                duration: 0.5,
                ease: "easeOut"
              }}
            >
              {child}
            </motion.div>
          );
        }

        return child;
      })}
    </div>
  );
}

// Responsive Card component
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

export function ResponsiveCard({ 
  children, 
  className = '', 
  padding = 'md',
  fullHeight = false 
}: ResponsiveCardProps) {
  const { breakpoint } = useScreenSize();
  const spacing = getResponsiveSpacing(breakpoint);
  
  const paddingClasses = {
    sm: 'p-3 md:p-4',
    md: 'p-4 md:p-5 lg:p-6',
    lg: 'p-5 md:p-6 lg:p-8'
  };

  return (
    <motion.div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${
        paddingClasses[padding]
      } ${fullHeight ? 'h-full' : ''} ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ shadow: "0 4px 12px -2px rgba(0, 0, 0, 0.1)" }}
    >
      {children}
    </motion.div>
  );
}

// Responsive Stack component for vertical layouts
interface ResponsiveStackProps {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
}

export function ResponsiveStack({ 
  children, 
  spacing = 'md',
  className = '',
  alignItems = 'stretch'
}: ResponsiveStackProps) {
  const { breakpoint } = useScreenSize();
  
  const spacingClasses = {
    sm: 'space-y-2 md:space-y-3',
    md: 'space-y-3 md:space-y-4 lg:space-y-6',
    lg: 'space-y-4 md:space-y-6 lg:space-y-8'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  return (
    <div className={`flex flex-col ${spacingClasses[spacing]} ${alignClasses[alignItems]} ${className}`}>
      {children}
    </div>
  );
}

// Responsive Flex component for horizontal layouts
interface ResponsiveFlexProps {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
  wrap?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  direction?: 'row' | 'col' | 'responsive'; // responsive switches to column on mobile
}

export function ResponsiveFlex({ 
  children, 
  spacing = 'md',
  className = '',
  wrap = false,
  justify = 'start',
  alignItems = 'center',
  direction = 'row'
}: ResponsiveFlexProps) {
  const { breakpoint } = useScreenSize();
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  
  const spacingClasses = {
    sm: 'gap-2 md:gap-3',
    md: 'gap-3 md:gap-4 lg:gap-6',
    lg: 'gap-4 md:gap-6 lg:gap-8'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const getDirectionClass = () => {
    if (direction === 'responsive') {
      return isMobile ? 'flex-col' : 'flex-row';
    }
    return direction === 'col' ? 'flex-col' : 'flex-row';
  };

  return (
    <div className={`flex ${
      getDirectionClass()
    } ${spacingClasses[spacing]} ${
      justifyClasses[justify]
    } ${alignClasses[alignItems]} ${
      wrap ? 'flex-wrap' : ''
    } ${className}`}>
      {children}
    </div>
  );
}