import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  BellRing, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Calendar, 
  Clock,
  X,
  MoreHorizontal,
  Star,
  ExternalLink,
  CheckCheck
} from "lucide-react";
import { useEnhancedNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/lib/financial-auth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'review_reminder' | 'task_due' | 'pipeline_update' | 'system_update';
  category: 'urgent' | 'important' | 'info' | 'success';
  priority: 'high' | 'medium' | 'low';
  relatedResourceType?: string;
  relatedResourceId?: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  isPinned: boolean;
  metadata?: any;
  createdAt: Date;
  readAt?: Date;
}

interface NotificationCenterProps {
  compact?: boolean;
  showUnreadOnly?: boolean;
}

const NotificationCenter = ({ compact = false, showUnreadOnly = false }: NotificationCenterProps) => {
  const { toast } = useToast();
  const [viewUnreadOnly, setViewUnreadOnly] = useState(showUnreadOnly);
  
  const { data: notifications = [], isLoading, refetch } = useEnhancedNotifications(viewUnreadOnly);
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markReadMutation.mutateAsync(notificationId);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string, category: string) => {
    switch (category) {
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'important':
        return <BellRing className="h-5 w-5 text-orange-500" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'important': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return new Date(date).toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (compact) {
    // Compact version for header
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative"
            data-testid="button-notifications-toggle"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                data-testid="badge-notification-count"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleMarkAllAsRead}
                  disabled={markAllReadMutation.isPending}
                  data-testid="button-mark-all-read"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all read
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    compact={true}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  // Full notification center
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" data-testid="badge-unread-count">
                  {unreadCount} unread
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Stay updated with important alerts and reminders
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewUnreadOnly(!viewUnreadOnly)}
              data-testid="button-toggle-unread"
            >
              {viewUnreadOnly ? 'Show All' : 'Unread Only'}
            </Button>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                disabled={markAllReadMutation.isPending}
                data-testid="button-mark-all-read-full"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No notifications</h3>
            <p>You're all caught up! New notifications will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <NotificationItem 
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
                {index < notifications.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  compact?: boolean;
}

const NotificationItem = ({ notification, onMarkAsRead, compact = false }: NotificationItemProps) => {
  const getNotificationIcon = (type: string, category: string) => {
    switch (category) {
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'important':
        return <BellRing className="h-5 w-5 text-orange-500" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'important': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return new Date(date).toLocaleDateString();
  };

  return (
    <div 
      className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
        !notification.isRead ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'
      } ${compact ? 'p-2' : ''}`}
      data-testid={`notification-item-${notification.id}`}
    >
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(notification.type, notification.category)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`text-sm font-medium text-gray-900 ${compact ? 'text-xs' : ''}`}>
                {notification.title}
              </h4>
              {notification.isPinned && (
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
              )}
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>
            
            <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
              {notification.message}
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${getCategoryColor(notification.category)}`}
              >
                {notification.category}
              </Badge>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(notification.createdAt)}
              </span>
              {notification.metadata?.client && (
                <span className="text-xs text-gray-500">
                  • {notification.metadata.client}
                </span>
              )}
            </div>
            
            {notification.actionUrl && notification.actionLabel && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => window.location.href = notification.actionUrl!}
                data-testid={`button-action-${notification.id}`}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                {notification.actionLabel}
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
                className="h-8 w-8 p-0"
                data-testid={`button-mark-read-${notification.id}`}
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;