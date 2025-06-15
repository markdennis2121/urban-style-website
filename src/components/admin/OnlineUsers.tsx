
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Clock, Wifi, AlertCircle, RefreshCw, Database, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserSessions } from '@/hooks/useUserSessions';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

const OnlineUsers = () => {
  const { activeSessions, loading, error, loadActiveSessions } = useUserSessions();
  const { profile, isAdmin, isSuperAdmin } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Check if user has admin access
  const hasAdminAccess = isAdmin || isSuperAdmin;

  useEffect(() => {
    if (hasAdminAccess) {
      console.log('Admin access confirmed, loading sessions for role:', profile?.role);
      const loadData = async () => {
        try {
          await loadActiveSessions();
          setLastRefresh(new Date());
        } catch (err) {
          console.error('Error loading sessions:', err instanceof Error ? err.message : 'Unknown error');
        }
      };

      loadData();
      
      // Refresh every 15 seconds for more frequent updates
      const interval = setInterval(() => {
        console.log('Auto-refreshing sessions...');
        loadData();
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [loadActiveSessions, hasAdminAccess, profile?.role]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('Manual refresh triggered by:', profile?.role);
      await loadActiveSessions();
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Manual refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!hasAdminAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            Online Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>Access Denied:</strong> Admin or Super Admin role required to view online users.
              <br />
              <span className="text-sm">
                Current role: {profile?.role || 'user'}. Only admin and super_admin roles can access this feature.
              </span>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading && !isRefreshing) {
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
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading online users...</p>
            </div>
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
              <Wifi className="h-5 w-5 text-red-500" />
              Online Users
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="h-8"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Retrying...' : 'Retry'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <Database className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>Database Error:</strong> {error}
              <br />
              <span className="text-sm mt-1">
                This might be due to missing database tables or permissions.
                Try the retry button or check the database setup.
              </span>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Get unique users from sessions
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
            {lastRefresh && (
              <Badge variant="outline" className="text-xs">
                Updated: {lastRefresh.toLocaleTimeString()}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {uniqueUsers.length} online
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="h-8 px-2"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {uniqueUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="font-medium">No users currently online</p>
            <p className="text-sm">Users active in the last 30 minutes will appear here</p>
            <div className="mt-4 text-xs text-gray-500">
              <p>Debug info: {activeSessions.length} total sessions found</p>
              <p>Current user role: {profile?.role}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {uniqueUsers.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {session.profiles?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      {session.profiles?.full_name || 'Anonymous User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.profiles?.email || 'No email'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge 
                    variant="outline" 
                    className={`text-xs mb-1 ${
                      session.profiles?.role === 'admin' || session.profiles?.role === 'super_admin'
                        ? 'border-blue-200 text-blue-700 bg-blue-50'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {session.profiles?.role || 'user'}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="truncate">
                      {formatDistanceToNow(new Date(session.last_activity), { addSuffix: true })}
                    </span>
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
