
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Wifi, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserSessions } from '@/hooks/useUserSessions';

const OnlineUsers: React.FC = () => {
  const { activeSessions, loading, error, loadActiveSessions } = useUserSessions();

  React.useEffect(() => {
    loadActiveSessions();
  }, [loadActiveSessions]);

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-green-500" />
            Online Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-red-500" />
            Online Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadActiveSessions} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-green-500" />
            Online Users ({activeSessions.length})
          </div>
          <Button 
            onClick={loadActiveSessions} 
            variant="outline" 
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeSessions.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No users currently online</p>
            <p className="text-sm text-gray-400 mt-2">
              Users who were active in the last hour will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {session.profiles?.full_name?.charAt(0)?.toUpperCase() || 
                         session.profiles?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">
                        {session.profiles?.full_name || session.profiles?.email || 'Unknown User'}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={
                          session.profiles?.role === 'superadmin' 
                            ? 'border-red-200 text-red-700 bg-red-50 text-xs'
                            : session.profiles?.role === 'admin'
                            ? 'border-blue-200 text-blue-700 bg-blue-50 text-xs'
                            : 'border-gray-200 text-gray-700 text-xs'
                        }
                      >
                        {session.profiles?.role || 'user'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {session.profiles?.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50 text-xs">
                    <Wifi className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatLastActivity(session.last_activity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnlineUsers;
