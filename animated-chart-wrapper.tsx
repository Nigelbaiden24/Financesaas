import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedChartWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  data?: any;
  className?: string;
  animationDuration?: number;
  dataTestId?: string;
}

export const AnimatedChartWrapper = ({
  children,
  isLoading = false,
  error = null,
  data,
  className = '',
  animationDuration = 0.3,
  dataTestId
}: AnimatedChartWrapperProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastDataHash, setLastDataHash] = useState<string>('');
  const chartRef = useRef<HTMLDivElement>(null);

  // Create data hash for detecting changes
  const createDataHash = (data: any): string => {
    if (!data) return '';
    return JSON.stringify(data).slice(0, 100);
  };

  // Detect data changes for animations
  useEffect(() => {
    const newHash = createDataHash(data);
    if (newHash !== lastDataHash && newHash !== '') {
      setLastDataHash(newHash);
      // Trigger re-animation on data change
      setIsVisible(false);
      setTimeout(() => setIsVisible(true), 50);
    }
  }, [data, lastDataHash]);

  // Initial visibility
  useEffect(() => {
    if (!isLoading && !error && data) {
      setIsVisible(true);
    }
  }, [isLoading, error, data]);

  // Intersection observer for entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const containerVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: animationDuration,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: animationDuration }
    }
  };

  if (error) {
    return (
      <motion.div
        ref={chartRef}
        className={`flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg ${className}`}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        data-testid={dataTestId ? `${dataTestId}-error` : undefined}
      >
        <div className="text-center">
          <div className="text-red-600 text-sm font-medium">Error loading chart</div>
          <div className="text-red-500 text-xs mt-1">{error}</div>
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div
        ref={chartRef}
        className={`flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg ${className}`}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        data-testid={dataTestId ? `${dataTestId}-loading` : undefined}
      >
        <div className="text-center">
          <motion.div
            className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"
            variants={childVariants}
          />
          <motion.div 
            className="text-gray-600 text-sm mt-2"
            variants={childVariants}
          >
            Loading chart data...
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={chartRef}
        key={lastDataHash}
        className={className}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        exit="exit"
        variants={containerVariants}
        data-testid={dataTestId}
      >
        <motion.div variants={childVariants}>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook for managing chart animations
export const useChartAnimation = (data: any, animationConfig?: {
  duration?: number;
  stagger?: number;
  ease?: string;
}) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const config = {
    duration: 0.5,
    stagger: 0.1,
    ease: "easeInOut",
    ...animationConfig
  };

  // Trigger animation when data changes
  useEffect(() => {
    setIsAnimating(true);
    setAnimationKey(prev => prev + 1);
    
    const timeout = setTimeout(() => {
      setIsAnimating(false);
    }, config.duration * 1000);

    return () => clearTimeout(timeout);
  }, [data, config.duration]);

  return {
    animationKey,
    isAnimating,
    config
  };
};

// Variants for different chart types
export const chartVariants = {
  line: {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: {
        pathLength: { duration: 1, ease: "easeInOut" },
        opacity: { duration: 0.3 }
      }
    }
  },
  bar: {
    hidden: { scaleY: 0, opacity: 0 },
    visible: { 
      scaleY: 1, 
      opacity: 1,
      transition: {
        scaleY: { duration: 0.6, ease: "easeOut" },
        opacity: { duration: 0.3 }
      }
    }
  },
  pie: {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        scale: { duration: 0.5, ease: "easeOut" },
        opacity: { duration: 0.3 }
      }
    }
  },
  area: {
    hidden: { opacity: 0, scaleY: 0 },
    visible: { 
      opacity: 1, 
      scaleY: 1,
      transition: {
        scaleY: { duration: 0.8, ease: "easeOut" },
        opacity: { duration: 0.4 }
      }
    }
  }
};

export default AnimatedChartWrapper;