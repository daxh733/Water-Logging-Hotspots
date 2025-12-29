import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  gradient: 'primary' | 'success' | 'warning' | 'destructive';
  delay?: number;
  isBlinking?: boolean;
  percentage?: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  isPriority?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient, 
  delay = 0,
  isBlinking = false,
  percentage,
  trend,
  trendValue,
  isPriority = false
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseInt(value.toString()) || 0;

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const stepValue = numericValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [numericValue]);

  const gradientClasses = {
    primary: 'gradient-primary',
    success: 'gradient-success',
    warning: 'gradient-warning',
    destructive: 'gradient-destructive',
  };

  const iconBgClasses = {
    primary: 'bg-primary/10',
    success: 'bg-success/10',
    warning: 'bg-warning/10',
    destructive: 'bg-destructive/10',
  };

  const iconColorClasses = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };

  const valueColorClasses = {
    primary: 'text-foreground',
    success: 'text-foreground',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };

  const glowClasses = {
    primary: '',
    success: '',
    warning: 'glow-warning',
    destructive: 'glow-destructive',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-destructive' : trend === 'down' ? 'text-success' : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`premium-card relative overflow-hidden p-6 group ${
        isPriority ? glowClasses[gradient] : ''
      }`}
    >
      {/* Subtle background gradient */}
      <div className={`absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300 ${gradientClasses[gradient]}`} />
      
      {/* Priority indicator bar */}
      {isPriority && (
        <div className={`absolute top-0 left-0 right-0 h-1 ${gradientClasses[gradient]}`} />
      )}
      
      <div className="relative z-10">
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${iconBgClasses[gradient]} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className={`h-5 w-5 ${iconColorClasses[gradient]}`} />
          </div>
          
          {/* Trend indicator */}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trendColor} bg-secondary/50 px-2 py-1 rounded-full`}>
              <TrendIcon className="h-3 w-3" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        {/* Value - made more dominant */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <motion.span 
              className={`metric-value ${valueColorClasses[gradient]}`}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: delay + 0.2 }}
            >
              {typeof value === 'string' ? value : displayValue}
            </motion.span>
            {percentage !== undefined && (
              <span className="text-sm font-medium text-muted-foreground">
                ({percentage}%)
              </span>
            )}
          </div>
          
          {/* Title - lighter weight */}
          <p className="metric-label">{title}</p>
          
          {/* Subtitle with status indicator */}
          {subtitle && (
            <div className="flex items-center gap-1.5 mt-2">
              {isBlinking && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                </span>
              )}
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}