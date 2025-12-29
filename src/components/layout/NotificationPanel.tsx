import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  AlertTriangle, 
  CloudRain, 
  MapPin,
  Clock,
  X,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: number;
  type: 'warning' | 'alert' | 'info' | 'success';
  title: string;
  message: string;
  location?: string;
  time: string;
  read: boolean;
  link?: string;
}

// Only 4 recent notifications
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'alert',
    title: 'High Water Level Alert',
    message: 'Severe waterlogging detected in Minto Bridge area. Avoid travel.',
    location: 'Minto Bridge',
    time: '5 mins ago',
    read: false,
    link: '/alerts',
  },
  {
    id: 2,
    type: 'warning',
    title: 'Heavy Rainfall Expected',
    message: 'IMD predicts heavy rainfall in next 2 hours. Stay alert.',
    location: 'Delhi NCR',
    time: '15 mins ago',
    read: false,
  },
  {
    id: 3,
    type: 'info',
    title: 'Ward 23 Update',
    message: 'Drainage work completed. Water levels normalizing.',
    location: 'Vasant Vihar',
    time: '1 hour ago',
    read: true,
  },
  {
    id: 4,
    type: 'success',
    title: 'Issue Resolved',
    message: 'Your reported waterlogging issue has been resolved.',
    location: 'ITO Junction',
    time: '2 hours ago',
    read: true,
    link: '/user-dashboard',
  },
];

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <CloudRain className="h-5 w-5 text-warning" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-destructive/10 border-destructive/20';
      case 'warning':
        return 'bg-warning/10 border-warning/20';
      case 'success':
        return 'bg-success/10 border-success/20';
      default:
        return 'bg-primary/10 border-primary/20';
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Notification Bell Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-[380px] max-w-[calc(100vw-2rem)] glass-card rounded-xl shadow-xl border border-border/50 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/50 bg-secondary/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-7 text-xs text-primary hover:text-primary"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>

            {/* Notifications List - No scroll, fixed 4 items */}
            <div>
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 hover:bg-secondary/30 transition-colors relative ${
                        !notification.read ? 'bg-secondary/20' : ''
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      {/* Unread Indicator */}
                      {!notification.read && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                      )}

                      <div className="flex gap-3 ml-2">
                        {/* Icon */}
                        <div className={`p-2 rounded-lg ${getBackgroundColor(notification.type)} flex-shrink-0 h-fit`}>
                          {getIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{notification.title}</h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                clearNotification(notification.id);
                              }}
                              className="p-1 rounded hover:bg-secondary/80 transition-colors flex-shrink-0"
                            >
                              <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </div>

                          <p className="text-xs text-muted-foreground mb-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {notification.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {notification.location}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {notification.time}
                              </span>
                            </div>

                            {notification.link && (
                              <Link
                                to={notification.link}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                View
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border/50 bg-secondary/30">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs text-primary hover:text-primary hover:bg-primary/10"
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link to="/alerts" className="flex items-center justify-center gap-1">
                    View All Alerts
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
