import { useState, useEffect, useCallback } from 'react';

// Breakpoint definitions following Tailwind CSS conventions
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Hook for getting current screen size
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<{
    width: number;
    height: number;
    breakpoint: Breakpoint;
  }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    breakpoint: 'lg'
  });

  const getBreakpoint = useCallback((width: number): Breakpoint => {
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  }, []);

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenSize({
        width,
        height,
        breakpoint: getBreakpoint(width)
      });
    };

    updateScreenSize(); // Initial call
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [getBreakpoint]);

  return screenSize;
};

// Hook for responsive values
export const useResponsiveValue = <T>(values: Partial<Record<Breakpoint, T>>) => {
  const { breakpoint } = useScreenSize();
  
  // Find the most appropriate value for current breakpoint
  const responsive = useCallback((vals: Partial<Record<Breakpoint, T>>): T | undefined => {
    const orderedBreakpoints: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
    const currentIndex = orderedBreakpoints.indexOf(breakpoint);
    
    // Look for value at current breakpoint or smaller
    for (let i = currentIndex; i < orderedBreakpoints.length; i++) {
      const bp = orderedBreakpoints[i];
      if (vals[bp] !== undefined) {
        return vals[bp];
      }
    }
    
    return undefined;
  }, [breakpoint]);

  return responsive(values);
};

// Hook for detecting mobile devices
export const useIsMobile = () => {
  const { breakpoint } = useScreenSize();
  return breakpoint === 'xs' || breakpoint === 'sm';
};

// Hook for detecting tablet devices
export const useIsTablet = () => {
  const { breakpoint } = useScreenSize();
  return breakpoint === 'md';
};

// Hook for detecting touch devices
export const useIsTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      return 'ontouchstart' in window || 
             navigator.maxTouchPoints > 0 || 
             (navigator as any).msMaxTouchPoints > 0;
    };

    setIsTouchDevice(checkTouchDevice());
  }, []);

  return isTouchDevice;
};

// Touch gesture hook for swipe, pinch, etc.
export const useTouchGestures = (element: React.RefObject<HTMLElement>) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = element.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setTouchEnd(null);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchEnd({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const deltaX = touchEnd.x - touchStart.x;
      const deltaY = touchEnd.y - touchStart.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Minimum swipe distance
      const minSwipeDistance = 50;

      if (absDeltaX > minSwipeDistance || absDeltaY > minSwipeDistance) {
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          const direction = deltaX > 0 ? 'right' : 'left';
          el.dispatchEvent(new CustomEvent('swipe', { detail: { direction, deltaX, deltaY } }));
        } else {
          // Vertical swipe
          const direction = deltaY > 0 ? 'down' : 'up';
          el.dispatchEvent(new CustomEvent('swipe', { detail: { direction, deltaX, deltaY } }));
        }
      }
    };

    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchmove', handleTouchMove);
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [element, touchStart, touchEnd]);

  return { touchStart, touchEnd };
};

// Responsive grid helper
export const getResponsiveGridCols = (
  breakpoint: Breakpoint,
  config: Partial<Record<Breakpoint, number>> = {}
): number => {
  const defaults: Record<Breakpoint, number> = {
    xs: 1,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    '2xl': 4
  };

  return config[breakpoint] ?? defaults[breakpoint];
};

// Responsive chart dimensions
export const getResponsiveChartSize = (breakpoint: Breakpoint) => {
  const sizes = {
    xs: { width: '100%', height: 200 },
    sm: { width: '100%', height: 250 },
    md: { width: '100%', height: 300 },
    lg: { width: '100%', height: 350 },
    xl: { width: '100%', height: 400 },
    '2xl': { width: '100%', height: 450 }
  };

  return sizes[breakpoint];
};

// Mobile-optimized spacing
export const getResponsiveSpacing = (breakpoint: Breakpoint) => {
  const spacing = {
    xs: { padding: 'p-3', gap: 'gap-3', margin: 'm-2' },
    sm: { padding: 'p-4', gap: 'gap-4', margin: 'm-3' },
    md: { padding: 'p-5', gap: 'gap-5', margin: 'm-4' },
    lg: { padding: 'p-6', gap: 'gap-6', margin: 'm-5' },
    xl: { padding: 'p-6', gap: 'gap-6', margin: 'm-6' },
    '2xl': { padding: 'p-8', gap: 'gap-8', margin: 'm-8' }
  };

  return spacing[breakpoint];
};

// Touch-optimized button sizes
export const getTouchOptimizedSize = (isTouchDevice: boolean, size: 'sm' | 'md' | 'lg' = 'md') => {
  const touchSizes = {
    sm: 'min-h-[44px] min-w-[44px] text-sm px-4',
    md: 'min-h-[48px] min-w-[48px] text-base px-6',
    lg: 'min-h-[56px] min-w-[56px] text-lg px-8'
  };

  const regularSizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg'
  };

  return isTouchDevice ? touchSizes[size] : regularSizes[size];
};

// Responsive font sizes
export const getResponsiveFontSize = (breakpoint: Breakpoint, element: 'heading' | 'body' | 'caption') => {
  const fontSizes = {
    heading: {
      xs: 'text-lg',
      sm: 'text-xl',
      md: 'text-2xl',
      lg: 'text-3xl',
      xl: 'text-4xl',
      '2xl': 'text-5xl'
    },
    body: {
      xs: 'text-sm',
      sm: 'text-base',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-lg',
      '2xl': 'text-xl'
    },
    caption: {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-sm',
      xl: 'text-base',
      '2xl': 'text-base'
    }
  };

  return fontSizes[element][breakpoint];
};

// Export commonly used responsive utilities
export const responsiveUtils = {
  useScreenSize,
  useResponsiveValue,
  useIsMobile,
  useIsTablet,
  useIsTouchDevice,
  useTouchGestures,
  getResponsiveGridCols,
  getResponsiveChartSize,
  getResponsiveSpacing,
  getTouchOptimizedSize,
  getResponsiveFontSize
};