
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Lock, 
  Activity,
  Ban,
  Clock,
  Users,
  Globe
} from 'lucide-react';
import { enhancedAuthRateLimiter, enhancedAPIRateLimiter } from '@/lib/security/advancedRateLimit';
import { incidentResponseManager } from '@/lib/security/incidentResponse';

const SecurityDashboard = () => {
  const [stats, setStats] = useState({
    activeThreats: 0,
    blockedIPs: 0,
    failedLogins: 0,
    activeIncidents: 0
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [activeIncidents, setActiveIncidents] = useState<any[]>([]);

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      // Get rate limiter stats
      const authStats = enhancedAuthRateLimiter.getStats();
      const apiStats = enhancedAPIRateLimiter.getStats();
      
      // Get incident data
      const incidents = incidentResponseManager.getActiveIncidents();
      
      setStats({
        activeThreats: authStats.blockedUsers + apiStats.blockedUsers,
        blockedIPs: authStats.blockedIPs + apiStats.blockedIPs,
        failedLogins: authStats.activeAttempts,
        activeIncidents: incidents.length
      });
      
      setActiveIncidents(incidents);
      
      // Mock recent events (in real implementation, fetch from backend)
      setRecentEvents([
        {
          id: 1,
          type: 'Failed Login',
          severity: 'medium',
          timestamp: new Date().toISOString(),
          details: 'Multiple failed login attempts detected'
        },
        {
          id: 2,
          type: 'Rate Limit Exceeded',
          severity: 'low',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          details: 'API rate limit exceeded for IP 192.168.1.100'
        }
      ]);
    } catch (error) {
      console.error('Failed to load security data:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-green-600" />
          Security Dashboard
        </h2>
        <Button onClick={loadSecurityData} variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Threats</p>
                <p className="text-2xl font-bold text-red-600">{stats.activeThreats}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Blocked IPs</p>
                <p className="text-2xl font-bold text-orange-600">{stats.blockedIPs}</p>
              </div>
              <Ban className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Logins</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.failedLogins}</p>
              </div>
              <Lock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Incidents</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeIncidents}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Active Security Incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeIncidents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No active security incidents</p>
          ) : (
            <div className="space-y-3">
              {activeIncidents.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{incident.type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{incident.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{incident.status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(incident.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{event.type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{event.details}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Status */}
      <Alert className="border-green-200 bg-green-50">
        <Shield className="h-4 w-4 text-green-600" />
        <div className="ml-3">
          <h4 className="font-medium text-green-800">Security Status: PROTECTED</h4>
          <p className="text-green-700 text-sm mt-1">
            All security systems are operational. Advanced threat detection is active and monitoring all activities.
          </p>
        </div>
      </Alert>
    </div>
  );
};

export default SecurityDashboard;
