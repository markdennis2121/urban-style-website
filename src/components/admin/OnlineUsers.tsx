
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Clock, Wifi, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserSessions } from '@/hooks/useUserSessions';
import { validateAnyAdminAccess } from '@/lib/auth/adminValidation';
import { formatDistanceToNow } from 'date-fns';

const OnlineUsers = () => {
  const { activeSessions, loading, error, loadActiveSessions } = useUserSessions();
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const validation = await validateAnyAdminAccess();
        setHasAdminAccess(validation.isValid);
        if (!validation.isValid) {
          setAccessError(validation.error || 'Access denied');
        }
      } catch (err) {
        setHasAdminAccess(false);
        setAccessError('Failed to validate admin access');
      }
    };

    checkAccess();
  }, []);

  useEffect(() => {
    if (hasAdminAccess) {
      const loadData = async () => {
        try {
          await loadActiveSessions();
        } catch (err) {
          console.error('Error loading sessions:', err instanceof Error ? err.message : 'Unknown error');
        }
      };

      loadData();
      
      // Refresh every 30 seconds
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [loadActiveSessions, hasAdminAccess]);

  if (!hasAdminAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Online Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Access Denied</p>
            <p className="text-sm mt-1">{accessError}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
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
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Online Users
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadActiveSessions}
              className="h-8"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Unable to load online users</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const uniqueUsers = activeSessions.reduce((acc, session) => {
    if (!acc.find(u => u.user_id === session.user_id)) {
      acc.push(session);
    }
    return acc;
  }, [] as typeof activeSessions);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-green-500" />
            Online Users
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {uniqueUsers.length} online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {uniqueUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No users currently online</p>
          </div>
        ) : (
          <div className="space-y-3">
            {uniqueUsers.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {session.profiles?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {session.profiles?.full_name || 'Anonymous User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.profiles?.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      session.profiles?.role === 'admin' || session.profiles?.role === 'super_admin'
                        ? 'border-blue-200 text-blue-700'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {session.profiles?.role || 'user'}
                  </Badge>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(session.last_activity), { addSuffix: true })}
                  </div>
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
