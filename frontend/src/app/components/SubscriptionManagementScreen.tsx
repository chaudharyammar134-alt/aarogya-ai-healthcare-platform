import { useEffect, useMemo, useState } from "react";
import { Screen } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  DollarSign,
  Database,
  CreditCard,
  Loader2,
} from "lucide-react";
import { apiClient } from "../utils/api-client";

interface SubscriptionManagementScreenProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

interface SubscriptionRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  plan: string;
  amount: number;
  status: "active" | "cancelled";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  cancelledAt?: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export function SubscriptionManagementScreen({ onBack, onNavigate }: SubscriptionManagementScreenProps) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"remote" | "local">("local");

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getSubscriptions();
        if (response.success && response.data) {
          setSubscriptions(response.data.subscriptions || []);
          setDataSource(response.source === "remote" ? "remote" : "local");
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSubscriptions();
  }, []);

  const planSummary = useMemo(() => {
    const grouped = subscriptions.reduce<Record<string, { subscribers: number; revenue: number; active: number }>>(
      (acc, item) => {
        const key = item.plan || "Unknown";
        acc[key] = acc[key] || { subscribers: 0, revenue: 0, active: 0 };
        acc[key].subscribers += 1;
        acc[key].revenue += item.amount;
        if (item.status === "active") acc[key].active += 1;
        return acc;
      },
      {},
    );

    return Object.entries(grouped)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [subscriptions]);

  const stats = {
    totalRevenue: subscriptions.reduce((sum, item) => sum + item.amount, 0),
    totalSubscribers: subscriptions.length,
    activeSubscribers: subscriptions.filter((item) => item.status === "active").length,
    avgRevenuePerUser: subscriptions.length
      ? Math.round(subscriptions.reduce((sum, item) => sum + item.amount, 0) / subscriptions.length)
      : 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-wellness-text-dark">Subscription Management</h1>
              <div className="flex items-center gap-2 mt-1">
                <Database className="w-3 h-3 text-blue-600" />
                <p className="text-wellness-text-light text-sm">
                  Source: <span className="font-medium">{dataSource === "remote" ? "live backend" : "local fallback store"}</span>
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => onNavigate("admin-users")} className="bg-wellness-green hover:bg-wellness-green/90">
            <Users className="w-4 h-4 mr-2" />
            Review Users
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-wellness-text-light">Total Revenue</p>
                  <h3 className="text-wellness-text-dark mt-1">{formatCurrency(stats.totalRevenue)}</h3>
                </div>
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-wellness-text-light">All Subscriptions</p>
                  <h3 className="text-wellness-text-dark mt-1">{stats.totalSubscribers}</h3>
                </div>
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-wellness-text-light">Active Subscribers</p>
                  <h3 className="text-wellness-text-dark mt-1">{stats.activeSubscribers}</h3>
                </div>
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-wellness-text-light">Avg Revenue/User</p>
                  <h3 className="text-wellness-text-dark mt-1">{formatCurrency(stats.avgRevenuePerUser)}</h3>
                </div>
                <TrendingUp className="w-6 h-6 text-wellness-green" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-wellness-text-dark mb-1">Subscription Feed</h4>
                <code className="text-xs bg-white px-3 py-2 rounded border border-blue-200 block overflow-x-auto">
                  {dataSource === "remote" ? "GET /admin/subscriptions" : "localStorage -> aarogya:subscriptions"}
                </code>
                <p className="text-wellness-text-light text-sm mt-2">
                  These records are created by the membership and payment flows.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-wellness-green" />
            <span className="ml-3 text-wellness-text-light">Loading subscriptions...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Subscription Records</CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptions.length === 0 ? (
                  <div className="text-center py-10 text-wellness-text-light">
                    No subscriptions found yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <div key={subscription.id} className="rounded-lg border border-gray-200 p-4 bg-white">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-wellness-text-dark">{subscription.userName}</h3>
                            <p className="text-sm text-wellness-text-light">{subscription.userEmail}</p>
                          </div>
                          <Badge className={subscription.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {subscription.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-wellness-text-light">Plan</p>
                            <p className="text-wellness-text-dark">{subscription.plan}</p>
                          </div>
                          <div>
                            <p className="text-wellness-text-light">Amount</p>
                            <p className="text-wellness-green">{formatCurrency(subscription.amount)}</p>
                          </div>
                          <div>
                            <p className="text-wellness-text-light">Start</p>
                            <p className="text-wellness-text-dark">{formatDate(subscription.startDate)}</p>
                          </div>
                          <div>
                            <p className="text-wellness-text-light">Renewal</p>
                            <p className="text-wellness-text-dark">{formatDate(subscription.endDate)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plans by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                {planSummary.length === 0 ? (
                  <div className="text-center py-10 text-wellness-text-light">
                    No plan metrics available yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {planSummary.map((plan) => (
                      <div key={plan.name} className="rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-wellness-text-dark">{plan.name}</h4>
                          <Badge className="bg-blue-100 text-blue-800">{plan.active} active</Badge>
                        </div>
                        <div className="mt-3 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-wellness-text-light">Subscribers</span>
                            <span className="text-wellness-text-dark">{plan.subscribers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-wellness-text-light">Revenue</span>
                            <span className="text-wellness-green">{formatCurrency(plan.revenue)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
