import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Bell, 
  Check, 
  ChevronDown,
  ChevronUp,
  Clock, 
  MapPin, 
  Volume2, 
  VolumeX,
  X,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { alerts as initialAlerts } from '@/data/mockData';
import { Alert as AlertType } from '@/types';

const severityConfig = {
  Critical: {
    bg: 'bg-destructive/10',
    border: 'border-l-destructive',
    badge: 'bg-destructive text-destructive-foreground',
    dot: 'bg-destructive',
    glow: 'shadow-[inset_0_0_15px_-8px_hsl(0_84%_60%/0.4)]'
  },
  High: {
    bg: 'bg-warning/10',
    border: 'border-l-warning',
    badge: 'bg-warning text-warning-foreground',
    dot: 'bg-warning',
    glow: ''
  },
  Medium: {
    bg: 'bg-primary/10',
    border: 'border-l-primary',
    badge: 'bg-primary text-primary-foreground',
    dot: 'bg-primary',
    glow: ''
  },
  Low: {
    bg: 'bg-secondary',
    border: 'border-l-muted-foreground/30',
    badge: 'bg-secondary text-secondary-foreground',
    dot: 'bg-muted-foreground',
    glow: ''
  },
};

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<AlertType[]>(initialAlerts);
  const [filter, setFilter] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.severity.toLowerCase() === filter);

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatFullTime = (date: Date) => {
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card-elevated rounded-2xl overflow-hidden h-full flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="p-2 rounded-xl bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold">Alerts</h3>
              <p className="text-[10px] text-muted-foreground">{alerts.length} total notifications</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="h-8 w-8 p-0 rounded-full"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={markAllAsRead} 
              className="text-xs rounded-full h-8 px-3"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {['all', 'critical', 'high', 'medium', 'low'].map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className={`text-xs capitalize rounded-full h-7 px-3 flex-shrink-0 ${
                filter === f ? '' : 'bg-transparent border-border/50 hover:bg-secondary'
              }`}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.map((alert, index) => {
            const config = severityConfig[alert.severity];
            const isExpanded = expandedId === alert.id;
            
            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={`rounded-xl border-l-4 ${config.border} ${config.bg} ${config.glow} ${
                  alert.isRead ? 'opacity-70' : ''
                } transition-all duration-200 overflow-hidden`}
              >
                {/* Main content */}
                <div 
                  className="p-3 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Header row */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge className={`${config.badge} text-[10px] font-semibold px-1.5 py-0`}>
                          {alert.severity}
                        </Badge>
                        {!alert.isRead && (
                          <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {formatTime(alert.timestamp)}
                        </span>
                      </div>
                      
                      {/* Location */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-sm truncate">{alert.location}</span>
                      </div>
                      
                      {/* Message preview */}
                      <p className={`text-xs text-muted-foreground ${isExpanded ? '' : 'line-clamp-1'}`}>
                        {alert.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissAlert(alert.id);
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border/30"
                    >
                      <div className="p-3 pt-2 space-y-3">
                        {/* Full timestamp */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Reported: {formatFullTime(alert.timestamp)}</span>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 h-8 text-xs rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(alert.id);
                            }}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark Read
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 h-8 text-xs rounded-lg"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View on Map
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="p-4 rounded-full bg-secondary/50 w-fit mx-auto mb-3">
              <AlertTriangle className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-sm font-medium">No alerts found</p>
            <p className="text-xs mt-1">All clear for the selected filter</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}