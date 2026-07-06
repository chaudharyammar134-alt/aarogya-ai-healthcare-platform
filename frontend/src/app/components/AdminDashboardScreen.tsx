import { useEffect, useState } from "react";
import { Screen } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Users,
  CreditCard,
  FileText,
  Bell,
  BarChart3,
  Activity,
  ArrowUpRight,
  Settings,
  Shield,
  Database,
  Loader2,
} from "lucide-react";
import { apiClient } from "../utils/api-client";

interface AdminDashboardScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface ActivityItem {
  type: "signup" | "subscription" | "invoice";
  user: string;
  time: string;
  detail: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatRelativeTime = (value?: string) => {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diffMinutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

export function AdminDashboardScreen({ onNavigate }: AdminDashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "quick-actions">("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"remote" | "local">("local");
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0,
    newSignupsToday: 0,
    paymentSuccess: 100,
    popularPlan: "No subscriptions yet",
    churnRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const [analyticsResponse, usersResponse, subscriptionsResponse, invoicesResponse] =
          await Promise.all([
            apiClient.getAnalyticsStats(),
            apiClient.getUsers(),
            apiClient.getSubscriptions(),
            apiClient.getInvoices(),
          ]);

        if (analyticsResponse.success && analyticsResponse.data) {
          setDashboardStats(analyticsResponse.data.stats);
          setDataSource(analyticsResponse.source === "remote" ? "remote" : "local");
        }

        const activity: ActivityItem[] = [
          ...((usersResponse.success && usersResponse.data?.users) || [])
            .slice(0, 2)
            .map((user: any) => ({
              type: "signup" as const,
              user: user.name,
              time: formatRelativeTime(user.createdAt),
              detail: user.plan || "No plan",
            })),
          ...((subscriptionsResponse.success && subscriptionsResponse.data?.subscriptions) || [])
            .slice(0, 2)
            .map((subscription: any) => ({
              type: "subscription" as const,
              user: subscription.userName,
              time: formatRelativeTime(subscription.createdAt),
              detail: `${subscription.plan} • ${formatCurrency(subscription.amount)}`,
            })),
          ...((invoicesResponse.success && invoicesResponse.data?.invoices) || [])
            .slice(0, 2)
            .map((invoice: any) => ({
              type: "invoice" as const,
              user: invoice.userName,
              time: formatRelativeTime(invoice.createdAt),
              detail: invoice.invoiceNumber || invoice.status,
            })),
        ].slice(0, 5);

        setRecentActivity(
          activity.length
            ? activity
            : [
                {
                  type: "signup",
                  user: "No admin activity yet",
                  time: "Just now",
                  detail: "Create users and subscriptions to populate this feed",
                },
              ],
        );
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStats();
  }, []);

  const quickActions = [
    {
      title: "User Management",
      description: "Review real user accounts and profiles",
      action: () => onNavigate("admin-users"),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Subscriptions",
      description: "Inspect active and cancelled plans",
      action: () => onNavigate("admin-subscriptions"),
      icon: CreditCard,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Invoices",
      description: "Review generated billing records",
      action: () => onNavigate("admin-invoices"),
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "API Monitor",
      description: "Inspect AI and service integrations",
      action: () => onNavigate("api-dashboard"),
      icon: Database,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Security Center",
      description: "Review notifications and admin alerts",
      action: () => onNavigate("admin-alerts"),
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-wellness-text-dark">Arogya+AI Admin Dashboard</h1>
            <p className="text-wellness-text-light mt-1">
              Admin data source: {dataSource === "remote" ? "live backend" : "local fallback"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="w-3 h-3 mr-1" />
              {dataSource === "remote" ? "Live backend" : "Local fallback"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("admin-alerts")}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Security Center
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "overview"
                ? "bg-white text-wellness-text-dark shadow-sm"
                : "text-wellness-text-light hover:text-wellness-text-dark"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("quick-actions")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "quick-actions"
                ? "bg-white text-wellness-text-dark shadow-sm"
                : "text-wellness-text-light hover:text-wellness-text-dark"
            }`}
          >
            Quick Actions
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-wellness-green" />
            <span className="ml-3 text-wellness-text-light">Loading admin metrics...</span>
          </div>
        ) : activeTab === "overview" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate("admin-users")}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-wellness-text-light">Total Users</p>
                      <h3 className="text-wellness-text-dark mt-2">{dashboardStats.totalUsers.toLocaleString()}</h3>
                      <div className="flex items-center mt-2 text-green-600">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        <span className="text-sm">{dashboardStats.newSignupsToday} new today</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-full">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate("admin-subscriptions")}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-wellness-text-light">Active Subscriptions</p>
                      <h3 className="text-wellness-text-dark mt-2">{dashboardStats.activeSubscriptions.toLocaleString()}</h3>
                      <div className="flex items-center mt-2 text-green-600">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        <span className="text-sm">{dashboardStats.popularPlan}</span>
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-full">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate("admin-analytics")}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-wellness-text-light">Monthly Revenue</p>
                      <h3 className="text-wellness-text-dark mt-2">{formatCurrency(dashboardStats.monthlyRevenue)}</h3>
                      <div className="flex items-center mt-2 text-green-600">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        <span className="text-sm">{dashboardStats.paymentSuccess}% payment success</span>
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-full">
                      <BarChart3 className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate("admin-invoices")}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-wellness-text-light">Pending Invoices</p>
                      <h3 className="text-wellness-text-dark mt-2">{dashboardStats.pendingInvoices}</h3>
                      <div className="flex items-center mt-2 text-orange-600">
                        <span className="text-sm">{dashboardStats.churnRate}% churn rate</span>
                      </div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-full">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Activity</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => onNavigate("admin-users")}>
                    View Users
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={`${activity.user}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              activity.type === "signup"
                                ? "bg-green-500"
                                : activity.type === "subscription"
                                  ? "bg-blue-500"
                                  : "bg-purple-500"
                            }`}
                          />
                          <div>
                            <p className="text-wellness-text-dark">{activity.user}</p>
                            <p className="text-wellness-text-light">{activity.time}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-sm">
                          {activity.detail}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-wellness-text-light">New Signups Today</span>
                      <span className="text-wellness-text-dark">{dashboardStats.newSignupsToday}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-wellness-text-light">Payment Success Rate</span>
                      <span className="text-green-600">{dashboardStats.paymentSuccess}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-wellness-text-light">Most Popular Plan</span>
                      <Badge className="bg-wellness-green text-white">{dashboardStats.popularPlan}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-wellness-text-light">Churn Rate</span>
                      <span className="text-orange-600">{dashboardStats.churnRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action) => (
              <Card key={action.title} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={action.action}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${action.bgColor}`}>
                      <action.icon className={`w-6 h-6 ${action.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-wellness-text-dark mb-1">{action.title}</h3>
                      <p className="text-wellness-text-light mb-4">{action.description}</p>
                      <Button size="sm" className="bg-wellness-green hover:bg-wellness-green/90">
                        Open
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 hover:shadow-md"
            onClick={() => onNavigate("admin-users")}
          >
            <Users className="w-6 h-6 text-wellness-green" />
            <span>User Management</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 hover:shadow-md"
            onClick={() => onNavigate("admin-subscriptions")}
          >
            <CreditCard className="w-6 h-6 text-wellness-green" />
            <span>Subscriptions</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 hover:shadow-md"
            onClick={() => onNavigate("admin-analytics")}
          >
            <BarChart3 className="w-6 h-6 text-wellness-green" />
            <span>Analytics</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 hover:shadow-md"
            onClick={() => onNavigate("admin-invoices")}
          >
            <FileText className="w-6 h-6 text-wellness-green" />
            <span>Invoices</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
