import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ArrowLeft,
  Bell,
  Users,
  Mail,
  MessageSquare,
  Send,
  Plus,
  Settings,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
} from "lucide-react";

interface AdminNotificationsListScreenProps {
  onBack: () => void;
}

export function AdminNotificationsListScreen({ onBack }: AdminNotificationsListScreenProps) {
  const [activeTab, setActiveTab] = useState("recent");
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "info",
    targetAudience: "all",
    sendEmail: true,
    sendSMS: false,
    sendPush: true,
  });

  // Mock notification data
  const notifications = [
    {
      id: "NOT001",
      type: "signup",
      title: "New User Registration",
      message: "Priya Sharma has signed up for Premium plan",
      timestamp: "2 minutes ago",
      status: "delivered",
      targetAudience: "admin",
      channels: ["email", "sms"],
      userCount: 1,
    },
    {
      id: "NOT002",
      type: "payment",
      title: "Payment Received",
      message: "Rajesh Kumar paid ₹199 for Standard plan",
      timestamp: "5 minutes ago",
      status: "delivered",
      targetAudience: "admin",
      channels: ["email", "push"],
      userCount: 1,
    },
    {
      id: "NOT003",
      type: "system",
      title: "New Feature Release",
      message: "AI Health Coach v2.0 is now available",
      timestamp: "1 hour ago",
      status: "sent",
      targetAudience: "all",
      channels: ["email", "push"],
      userCount: 12847,
    },
    {
      id: "NOT004",
      type: "payment",
      title: "Payment Failed",
      message: "Anjali Patel's auto-renewal failed",
      timestamp: "3 hours ago",
      status: "delivered",
      targetAudience: "admin",
      channels: ["email", "sms"],
      userCount: 1,
    },
    {
      id: "NOT005",
      type: "reminder",
      title: "Subscription Renewal Reminder",
      message: "Your Premium subscription expires in 3 days",
      timestamp: "1 day ago",
      status: "delivered",
      targetAudience: "premium",
      channels: ["email", "push"],
      userCount: 1876,
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "signup": return <Users className="w-4 h-4 text-green-600" />;
      case "payment": return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case "system": return <Settings className="w-4 h-4 text-purple-600" />;
      case "reminder": return <Clock className="w-4 h-4 text-orange-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const sendNotification = () => {
    // Simulate sending notification
    alert(`Notification sent to ${newNotification.targetAudience} users\nChannels: ${[
      newNotification.sendEmail && "Email",
      newNotification.sendSMS && "SMS", 
      newNotification.sendPush && "Push"
    ].filter(Boolean).join(", ")}`);
    
    // Reset form
    setNewNotification({
      title: "",
      message: "",
      type: "info",
      targetAudience: "all",
      sendEmail: true,
      sendSMS: false,
      sendPush: true,
    });
  };

  const stats = {
    totalSent: notifications.length,
    delivered: notifications.filter(n => n.status === "delivered").length,
    pending: notifications.filter(n => n.status === "pending").length,
    failed: notifications.filter(n => n.status === "failed").length,
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
              <h1 className="text-wellness-text-dark">Notification Center</h1>
              <p className="text-wellness-text-light mt-1">Manage all admin notifications and alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-red-100 text-red-800">
              <Bell className="w-3 h-3 mr-1" />
              {notifications.filter(n => n.targetAudience === "admin").length} New
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-wellness-text-light">Total Sent</p>
                  <h3 className="text-wellness-text-dark mt-1">{stats.totalSent}</h3>
                </div>
                <Send className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-wellness-text-light">Delivered</p>
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
                  <p className="text-wellness-text-light">Pending</p>
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
                  <p className="text-wellness-text-light">Failed</p>
                  <h3 className="text-wellness-text-dark mt-1">{stats.failed}</h3>
                </div>
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="send">Send New</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-full">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-wellness-text-dark">{notification.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(notification.status)}>
                              {notification.status}
                            </Badge>
                            <span className="text-wellness-text-light text-sm">{notification.timestamp}</span>
                          </div>
                        </div>
                        <p className="text-wellness-text-light mb-3">{notification.message}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Target className="w-3 h-3 text-wellness-text-light" />
                            <span className="text-wellness-text-light">
                              {notification.targetAudience} ({notification.userCount.toLocaleString()} users)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-3 h-3 text-wellness-text-light" />
                            <span className="text-wellness-text-light">
                              {notification.channels.join(", ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="send" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Send New Notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-wellness-text-dark">Notification Title</label>
                    <Input
                      placeholder="Enter notification title"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-wellness-text-dark">Type</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newNotification.type}
                      onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                    >
                      <option value="info">Information</option>
                      <option value="warning">Warning</option>
                      <option value="success">Success</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-wellness-text-dark">Message</label>
                  <Textarea
                    placeholder="Enter your notification message..."
                    rows={4}
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-wellness-text-dark">Target Audience</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={newNotification.targetAudience}
                    onChange={(e) => setNewNotification({...newNotification, targetAudience: e.target.value})}
                  >
                    <option value="all">All Users (12,847)</option>
                    <option value="basic">Basic Users (2,843)</option>
                    <option value="standard">Standard Users (4,567)</option>
                    <option value="premium">Premium Users (1,876)</option>
                    <option value="family">Family Users (892)</option>
                    <option value="inactive">Inactive Users (2,669)</option>
                  </select>
                </div>

                <div>
                  <label className="text-wellness-text-dark mb-3 block">Delivery Channels</label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span className="text-wellness-text-dark">Email Notification</span>
                      </div>
                      <Switch
                        checked={newNotification.sendEmail}
                        onCheckedChange={(checked) => setNewNotification({...newNotification, sendEmail: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4 text-green-600" />
                        <span className="text-wellness-text-dark">SMS Notification</span>
                      </div>
                      <Switch
                        checked={newNotification.sendSMS}
                        onCheckedChange={(checked) => setNewNotification({...newNotification, sendSMS: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-purple-600" />
                        <span className="text-wellness-text-dark">Push Notification</span>
                      </div>
                      <Switch
                        checked={newNotification.sendPush}
                        onCheckedChange={(checked) => setNewNotification({...newNotification, sendPush: checked})}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={sendNotification}
                    className="bg-wellness-green hover:bg-wellness-green/90"
                    disabled={!newNotification.title || !newNotification.message}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </Button>
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Later
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {(newNotification.title || newNotification.message) && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-wellness-green">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="w-4 h-4 text-wellness-green" />
                      <h4 className="text-wellness-text-dark">{newNotification.title || "Notification Title"}</h4>
                    </div>
                    <p className="text-wellness-text-light">{newNotification.message || "Your notification message will appear here..."}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-6 h-6 text-blue-600" />
                    <h3 className="text-wellness-text-dark">Welcome New Users</h3>
                  </div>
                  <p className="text-wellness-text-light mb-4">Welcome message for newly registered users</p>
                  <Button variant="outline" size="sm">Use Template</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="text-wellness-text-dark">Payment Confirmation</h3>
                  </div>
                  <p className="text-wellness-text-light mb-4">Confirmation message for successful payments</p>
                  <Button variant="outline" size="sm">Use Template</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-6 h-6 text-orange-600" />
                    <h3 className="text-wellness-text-dark">Renewal Reminder</h3>
                  </div>
                  <p className="text-wellness-text-light mb-4">Reminder for upcoming subscription renewals</p>
                  <Button variant="outline" size="sm">Use Template</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Settings className="w-6 h-6 text-purple-600" />
                    <h3 className="text-wellness-text-dark">Feature Update</h3>
                  </div>
                  <p className="text-wellness-text-light mb-4">Announcement for new features and updates</p>
                  <Button variant="outline" size="sm">Use Template</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}