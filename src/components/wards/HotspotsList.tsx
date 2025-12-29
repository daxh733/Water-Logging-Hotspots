import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Navigation,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Hotspot {
  id: number;
  lat: number;
  lng: number;
  title: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  wardNo: string;
  createdAt: string;
}

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case 'high':
      return {
        bg: 'bg-destructive/10',
        border: 'border-destructive/20',
        text: 'text-destructive',
        badge: 'bg-destructive text-destructive-foreground',
      };
    case 'medium':
      return {
        bg: 'bg-warning/10',
        border: 'border-warning/20',
        text: 'text-warning',
        badge: 'bg-warning text-warning-foreground',
      };
    default:
      return {
        bg: 'bg-success/10',
        border: 'border-success/20',
        text: 'text-success',
        badge: 'bg-success text-success-foreground',
      };
  }
};

interface HotspotsListProps {
  wardNo?: string; // Optional: filter by ward number
}

export function HotspotsList({ wardNo }: HotspotsListProps) {
  const navigate = useNavigate();
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Load hotspots from localStorage
  useEffect(() => {
    const loadHotspots = () => {
      const saved = localStorage.getItem('markedHotspots');
      if (saved) {
        let allHotspots = JSON.parse(saved);
        
        // Filter by ward if wardNo provided
        if (wardNo) {
          allHotspots = allHotspots.filter((h: Hotspot) => h.wardNo === wardNo);
        }
        
        // Sort by date (newest first)
        allHotspots.sort((a: Hotspot, b: Hotspot) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setHotspots(allHotspots);
      }
    };

    loadHotspots();

    // Listen for storage changes (when new hotspot added)
    window.addEventListener('storage', loadHotspots);
    
    // Custom event for same-tab updates
    window.addEventListener('hotspotsUpdated', loadHotspots);

    return () => {
      window.removeEventListener('storage', loadHotspots);
      window.removeEventListener('hotspotsUpdated', loadHotspots);
    };
  }, [wardNo]);

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this hotspot?')) {
      const updated = hotspots.filter(h => h.id !== id);
      setHotspots(updated);
      localStorage.setItem('markedHotspots', JSON.stringify(updated));
      
      // Trigger update event
      window.dispatchEvent(new Event('hotspotsUpdated'));
    }
  };

  const handleViewOnMap = (hotspot: Hotspot) => {
    navigate(`/map?lat=${hotspot.lat}&lng=${hotspot.lng}&hotspot=${hotspot.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (hotspots.length === 0) {
    return (
      <Card className="glass-card rounded-xl">
        <CardContent className="p-8 text-center">
          <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">No Hotspots Marked</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {wardNo 
              ? `No hotspots have been marked in Ward ${wardNo} yet.`
              : 'No hotspots have been marked yet.'
            }
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/map')}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Mark Hotspot on Map
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">
          Marked Hotspots {wardNo && `- Ward ${wardNo}`}
        </h3>
        <Badge variant="outline">
          {hotspots.length} {hotspots.length === 1 ? 'hotspot' : 'hotspots'}
        </Badge>
      </div>

      <AnimatePresence>
        {hotspots.map((hotspot, index) => {
          const styles = getSeverityStyles(hotspot.severity);
          const isExpanded = expandedId === hotspot.id;

          return (
            <motion.div
              key={hotspot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className={`glass-card border-l-4 ${styles.border} overflow-hidden`}>
                <CardHeader className="p-4 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${styles.bg} flex-shrink-0`}>
                        <AlertTriangle className={`h-4 w-4 ${styles.text}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-sm font-semibold truncate">
                            {hotspot.title}
                          </CardTitle>
                          <Badge className={`${styles.badge} text-xs px-2 py-0 flex-shrink-0`}>
                            {hotspot.severity.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Ward {hotspot.wardNo}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(hotspot.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : hotspot.id)}
                      className="h-8 w-8 p-0 flex-shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="p-4 pt-0 border-t border-border/50">
                        <p className="text-sm text-muted-foreground mb-4">
                          {hotspot.description}
                        </p>

                        <div className="mb-4 p-3 rounded-lg bg-secondary/30 border border-border/50">
                          <div className="text-xs text-muted-foreground mb-1">
                            Location Coordinates
                          </div>
                          <div className="text-xs font-mono">
                            {hotspot.lat.toFixed(6)}, {hotspot.lng.toFixed(6)}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleViewOnMap(hotspot)}
                          >
                            <Navigation className="h-3 w-3 mr-1.5" />
                            View on Map
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(hotspot.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
