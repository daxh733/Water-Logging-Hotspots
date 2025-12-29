import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, CloudRain } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 3000);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {/* <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[60] bg-primary/90 backdrop-blur-sm text-primary-foreground"
      >
        <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">
              Demo Mode: This is a simulation using sample data. Drag the user marker on the map to test geofencing.
            </span>
            <span className="sm:hidden">Demo Mode Active</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSimulate}
              disabled={isSimulating}
              className="text-xs"
            >
              <CloudRain className="h-3 w-3 mr-1" />
              {isSimulating ? 'Simulating...' : 'Simulate Rain'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {isSimulating && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 3 }}
            className="h-1 bg-accent origin-left"
          />
        )}
      </motion.div> */}
    </AnimatePresence>
  );
}
