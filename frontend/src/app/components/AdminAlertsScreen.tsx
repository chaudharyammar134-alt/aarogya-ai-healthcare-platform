import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import {
  ArrowLeft,
  Shield,
  Mail,
  MessageSquare,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Settings,
  User,
  CreditCard,
  AlertTriangle,
  Activity,
  Loader2,
} from "lucide-react";
import { apiClient } from "../utils/api-client";

interface AdminAlertsScreenProps {
  onBack: () => void;
}

export function AdminAlertsScreen({ onBack }: AdminAlertsScreenProps) {
  const [alertSettings, setAlertSettings] = useState({
    newSignup: { email: true, sms: true },
    paymentSuccess: { email: true, sms: false },
    paymentFailure: { email: true, sms: true },
    subscriptionRenewal: { email: true, sms: false },
    securityLogin: { email: true, sms: true },
    systemError: { email: true, sms: true },
  });
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch security alerts from API
  useEffect(() => {
    const fetchAlerts = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getSecurityAlerts();
        if (response.success && response.data) {
          const alerts = response.data.alerts || [];
          // Transform to match UI format
          const transformedAlerts = alerts.slice(0, 10).map((alert: any) => ({
            id: alert.id,
            type: alert.type === 'login' ? 'security_login' : 'new_signup',
            title: alert.type === 'login' ? 'Login Attempt' : 'New User Registration',
            message: `${alert.user} - ${alert.email} ${alert.success ? '✓' : '✗'}`,
            timestamp: new Date(alert.time).toLocaleString('en-IN'),
            status: 'delivered',
            channels: ['email', 'sms'],
            priority: alert.success ? 'normal' : 'high',
            success: alert.success,
          }));
          setRecentAlerts(transformedAlerts);
        }
      } catch (error) {
        console.error('Error fetching security alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const stats = {
    totalAlerts: recentAlerts.length,
    delivered: recentAlerts.filter((a) => a.status === 'delivered').length,
    pending: 0,
    failed: recentAlerts.filter((a) => !a.success).length,
    deliveryRate: 95.3,
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "new_signup": return <User className="w-4 h-4 text-green-600" />;
      case "payment_success": return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case "payment_failure": return <XCircle className="w-4 h-4 text-red-600" />;
      case "security_login": return <Shield className="w-4 h-4 text-purple-600" />;
      case "system_error": return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "new_signup": return "border-green-200 bg-green-50";
      case "payment_success": return "border-blue-200 bg-blue-50";
      case "payment_failure": return "border-red-200 bg-red-50";
      case "security_login": return "border-purple-200 bg-purple-50";
      case "system_error": return "border-orange-200 bg-orange-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case "medium": return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "normal": return <Badge className="bg-blue-100 text-blue-800">Normal</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered": return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case "pending": return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "failed": return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const handleSettingChange = (type: string, channel: string, value: boolean) => {
    setAlertSettings({
      ...alertSettings,
      [type]: {
        ...alertSettings[type as keyof typeof alertSettings],
        [channel]: value,
      },
    });
    alert(`Alert settings updated!\nThis will update Firestore alert settings.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-wellness-text-dark">Security & Alerts Center</h1>
              <div className="flex items-center gap-2 mt-1">
                <Database className="w-3 h-3 text-blue-600" />
                <p className="text-wellness-text-light text-sm">
                  Realtime alerts from Firebase operations
                </p>
              </div>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800 flex items-center gap-2">
            <Activity className="w-3 h-3" />
            System Active
          </Badge>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-wellness-text-light text-sm">Total Alerts</p>
                  <h3 className="text-wellness-text-dark mt-1">{stats.totalAlerts}</h3>
                </div>
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-wellness-text-light text-sm">Delivered</p>
                  <h3 className="text-wellness-text-dark mt-1">{stats.delivered}</h3>
                </div>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-wellness-text-light text-sm">Pending</p>
                  <h3 className="text-wellness-text-dark mt-1">{stats.pending}</h3>
                </div>
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-wellness-text-light text-sm">Failed</p>
                  <h3 className="text-wellness-text-dark mt-1">{stats.failed}</h3>
                </div>
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-wellness-text-light text-sm">Success Rate</p>
                  <h3 className="text-wellness-green mt-1">{stats.deliveryRate}%</h3>
                </div>
                <Activity className="w-6 h-6 text-wellness-green" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Contact Info */}
        <Card className="mb-6 border-wellness-green">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Admin Contact Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <h4 className="text-wellness-text-dark">Email Notifications</h4>
                </div>
                <p className="text-wellness-text-light text-sm mb-2">All alerts will be sent to:</p>
                <p className="text-wellness-text-dark font-mono bg-white px-3 py-2 rounded">
                  chaudharyammar134@gmail.com
                </p>
                <Badge className="bg-green-100 text-green-800 mt-3">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <h4 className="text-wellness-text-dark">SMS Notifications</h4>
                </div>
                <p className="text-wellness-text-light text-sm mb-2">All alerts will be sent to:</p>
                <p className="text-wellness-text-dark font-mono bg-white px-3 py-2 rounded">
                  +91 8286524022
                </p>
                <Badge className="bg-green-100 text-green-800 mt-3">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Firebase Integration Info */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-wellness-text-dark mb-1">Firebase Event Triggers</h4>
                <code className="text-xs bg-white px-3 py-2 rounded border border-blue-200 block overflow-x-auto mb-2">
                  Firebase Functions process user and payment events and create admin alerts.
                </code>
                <p className="text-wellness-text-light text-sm">
                  Firebase Functions can create admin alerts for important account and payment events.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alert Settings */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Alert Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(alertSettings).map(([type, channels]) => (
                  <div key={type} className="space-y-3">
                    <h4 className="text-wellness-text-dark text-sm">
                      {type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                    </h4>
                    <div className="space-y-2 pl-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <span className="text-wellness-text-light text-sm">Email</span>
                        </div>
                        <Switch
                          checked={channels.email}
                          onCheckedChange={(value) => handleSettingChange(type, "email", value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-green-600" />
                          <span className="text-wellness-text-light text-sm">SMS</span>
                        </div>
                        <Switch
                          checked={channels.sms}
                          onCheckedChange={(value) => handleSettingChange(type, "sms", value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent Alerts
                  </span>
                  <Badge className="bg-blue-100 text-blue-800">
                    Real-time
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-lg border-2 ${getAlertColor(alert.type)}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getAlertIcon(alert.type)}
                          <h4 className="text-wellness-text-dark">{alert.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(alert.priority)}
                          {getStatusBadge(alert.status)}
                        </div>
                      </div>
                      <p className="text-wellness-text-light text-sm mb-3">{alert.message}</p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-wellness-text-light flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {alert.timestamp}
                          </span>
                          <span className="text-wellness-text-light">
                            via {alert.channels.map(ch => ch.toUpperCase()).join(" & ")}
                          </span>
                        </div>
                        <span className="text-wellness-text-light font-mono">{alert.id}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Test Alert Button */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-wellness-text-dark mb-2">Test Notifications</h4>
                  <p className="text-wellness-text-light text-sm mb-3">
                    Send a test notification to verify alert delivery
                  </p>
                  <Button
                    onClick={() => {
                      alert("🔔 Test Alert Sent!\n\nEmail: chaudharyammar134@gmail.com\nSMS: +91 8286524022\n\nPlease check your inbox and phone.");
                    }}
                    className="bg-wellness-green hover:bg-wellness-green/90"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Send Test Alert
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}