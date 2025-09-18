import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertCircle, Info, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCrossModuleEvents, emitCrossModuleEvent } from '@/lib/cross-module-sync';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  relatedModule?: 'portfolio' | 'client' | 'task' | 'scenario' | 'pipeline';
}

const notificationIcons = {
  success: Check,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info
};

const notificationColors = {
  success: 'text-green-600 bg-green-100',
  error: 'text-red-600 bg-red-100',
  warning: 'text-yellow-600 bg-yellow-100',
  info: 'text-blue-600 bg-blue-100'
};

export default function RealTimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Listen for cross-module events to generate notifications
  const events = useCrossModuleEvents(undefined, useCallback((event: any) => {
    const notification = createNotificationFromEvent(event);
    if (notification) {
      addNotification(notification);
    }
  }, []));

  // Create notification from cross-module events
  const createNotificationFromEvent = useCallback((event: any): Notification | null => {
    const id = `${event.type}-${Date.now()}`;
    const timestamp = new Date();

    switch (event.type) {
      case 'client_created':
        return {
          id,
          type: 'success',
          title: 'New Client Added',
          message: `Client has been successfully added to your portfolio`,
          timestamp,
          read: false,
          relatedModule: 'client'
        };

      case 'portfolio_updated':
        return {
          id,
          type: 'info',
          title: 'Portfolio Updated',
          message: 'Portfolio allocation has been modified',
          timestamp,
          read: false,
          relatedModule: 'portfolio'
        };

      case 'task_completed':
        return {
          id,
          type: 'success',
          title: 'Task Completed',
          message: 'Compliance task has been marked as completed',
          timestamp,
          read: false,
          relatedModule: 'task'
        };

      case 'scenario_calculated':
        return {
          id,
          type: 'info',
          title: 'Scenario Analysis Complete',
          message: 'Financial projection scenarios have been calculated',
          timestamp,
          read: false,
          relatedModule: 'scenario'
        };

      case 'pipeline_moved':
        return {
          id,
          type: 'info',
          title: 'Pipeline Update',
          message: 'Client has been moved to a new pipeline stage',
          timestamp,
          read: false,
          relatedModule: 'pipeline'
        };

      default:
        return null;
    }
  }, []);

  // Add notification
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
    setUnreadCount(prev => prev + 1);
    
    // Show toast for important notifications
    if (notification.type === 'error' || notification.type === 'success') {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default'
      });
    }
  }, [toast]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    // Don't decrease unread count as this might remove unread notifications
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Update unread count when notifications change
  useEffect(() => {
    const unread = notifications.filter(notif => !notif.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Demo: Add sample notifications for testing
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification({
        id: 'welcome',
        type: 'info',
        title: 'Welcome!',
        message: 'Real-time notifications are now active',
        timestamp: new Date(),
        read: false
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [addNotification]);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={notificationRef}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        data-testid="button-notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </Button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-96 max-h-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
            data-testid="notifications-dropdown"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      data-testid="button-mark-all-read"
                    >
                      Mark all read
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      data-testid="button-clear-all"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification, index) => {
                    const Icon = notificationIcons[notification.type];
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 rounded-lg mb-2 border transition-all duration-200 ${
                          notification.read 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-white border-blue-200 shadow-sm'
                        }`}
                        data-testid={`notification-${notification.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-1 rounded-full ${notificationColors[notification.type]}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-medium text-sm ${
                                notification.read ? 'text-gray-700' : 'text-gray-900'
                              }`}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              )}
                            </div>
                            
                            <p className={`text-sm ${
                              notification.read ? 'text-gray-500' : 'text-gray-700'
                            }`}>
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              
                              <div className="flex items-center gap-1">
                                {notification.relatedModule && (
                                  <Badge variant="secondary" className="text-xs">
                                    {notification.relatedModule}
                                  </Badge>
                                )}
                                
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-6 px-2 text-xs"
                                    data-testid={`button-mark-read-${notification.id}`}
                                  >
                                    Mark read
                                  </Button>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeNotification(notification.id)}
                                  className="h-6 w-6 p-0"
                                  data-testid={`button-remove-${notification.id}`}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {notification.action && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={notification.action.onClick}
                                className="mt-2 h-7 text-xs"
                                data-testid={`notification-action-${notification.id}`}
                              >
                                {notification.action.label}
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}