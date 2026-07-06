import { useEffect, useMemo, useState } from "react";
import { Screen } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ArrowLeft,
  User,
  Activity,
  CreditCard,
  FileText,
  Calendar,
  Mail,
  Phone,
  Database,
  Download,
  Edit,
  Loader2,
} from "lucide-react";
import { apiClient } from "../utils/api-client";

interface UserProfileDetailScreenProps {
  userId: string | null;
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
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

export function UserProfileDetailScreen({ userId, onBack, onNavigate }: UserProfileDetailScreenProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"remote" | "local">("local");
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [userInvoices, setUserInvoices] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [userResponse, subscriptionsResponse, invoicesResponse] = await Promise.all([
          apiClient.getUser(userId),
          apiClient.getSubscriptions(),
          apiClient.getInvoices(),
        ]);

        if (userResponse.success && userResponse.data) {
          setUserProfile(userResponse.data.user);
          setDataSource(userResponse.source === "remote" ? "remote" : "local");
        }

        const allSubscriptions = subscriptionsResponse.success
          ? subscriptionsResponse.data?.subscriptions || []
          : [];
        const allInvoices = invoicesResponse.success
          ? invoicesResponse.data?.invoices || []
          : [];

        setUserSubscriptions(allSubscriptions.filter((item: any) => item.userId === userId));
        setUserInvoices(allInvoices.filter((item: any) => item.userId === userId));
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProfile();
  }, [userId]);

  const profileStats = useMemo(() => {
    const activeSubscription = userSubscriptions.find((item) => item.status === "active");
    const totalRevenue = userInvoices
      .filter((item) => item.status === "paid")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      activeSubscription,
      totalRevenue,
      latestInvoice: userInvoices[0] || null,
    };
  }, [userInvoices, userSubscriptions]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-wellness-green" />
        <span className="ml-3 text-wellness-text-light">Loading user profile...</span>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-8 text-center text-wellness-text-light">
            User not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = (userProfile.name || "User")
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-wellness-text-dark">User Profile</h1>
              <div className="flex items-center gap-2 mt-1">
                <Database className="w-3 h-3 text-blue-600" />
                <p className="text-wellness-text-light text-sm">
                  ID: <span className="font-mono">{userProfile.id}</span> • {dataSource === "remote" ? "live backend" : "local fallback"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate("admin-invoices")}>
              <FileText className="w-4 h-4 mr-2" />
              Invoices
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-wellness-text-dark mb-2">Linked Admin Data</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Badge variant="outline" className="bg-white">user record</Badge>
                  <Badge variant="outline" className="bg-white">subscriptions</Badge>
                  <Badge variant="outline" className="bg-white">invoices</Badge>
                  <Badge variant="outline" className="bg-white">payment history</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-24 h-24 rounded-full bg-wellness-green text-white flex items-center justify-center text-2xl font-semibold">
                {initials}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-wellness-text-dark">{userProfile.name}</h2>
                    <p className="text-wellness-text-light mt-1">
                      Role: {userProfile.role || "user"} • Status: {userProfile.status || "active"}
                    </p>
                  </div>
                  <Badge className={(profileStats.activeSubscription ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800")}>
                    {profileStats.activeSubscription ? "Active subscription" : "No active subscription"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-wellness-text-light">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{userProfile.email || "No email"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-wellness-text-light">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{userProfile.phone || "No phone"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-wellness-text-light">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Joined {formatDate(userProfile.createdAt || userProfile.joinDate)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-wellness-text-light text-sm">Health Score</p>
                    <p className="text-wellness-text-dark">{userProfile.healthScore ?? 0}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-wellness-text-light text-sm">Last Active</p>
                    <p className="text-wellness-text-dark">{formatDate(userProfile.lastActive)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-wellness-text-light text-sm">Subscriptions</p>
                    <p className="text-wellness-text-dark">{userSubscriptions.length}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-wellness-text-light text-sm">Revenue</p>
                    <p className="text-wellness-green">{formatCurrency(profileStats.totalRevenue)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-wellness-text-light">User ID</span>
                  <span className="text-wellness-text-dark font-mono">{userProfile.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wellness-text-light">Plan</span>
                  <span className="text-wellness-text-dark">{profileStats.activeSubscription?.plan || userProfile.plan || "None"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wellness-text-light">Created</span>
                  <span className="text-wellness-text-dark">{formatDate(userProfile.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wellness-text-light">Latest Invoice</span>
                  <span className="text-wellness-text-dark">{profileStats.latestInvoice?.invoiceNumber || "No invoices yet"}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Subscription History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userSubscriptions.length === 0 ? (
                  <div className="text-wellness-text-light py-8 text-center">No subscriptions found.</div>
                ) : (
                  <div className="space-y-4">
                    {userSubscriptions.map((subscription) => (
                      <div key={subscription.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-wellness-text-dark">{subscription.plan}</p>
                            <p className="text-sm text-wellness-text-light">
                              {formatCurrency(subscription.amount)} • {formatDate(subscription.startDate)} to {formatDate(subscription.endDate)}
                            </p>
                          </div>
                          <Badge className={subscription.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {subscription.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Invoice and Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userInvoices.length === 0 ? (
                  <div className="text-wellness-text-light py-8 text-center">No invoices found.</div>
                ) : (
                  <div className="space-y-4">
                    {userInvoices.map((invoice) => (
                      <div key={invoice.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-wellness-text-dark">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-wellness-text-light">
                              {invoice.plan} • {formatDate(invoice.issueDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-wellness-green">{formatCurrency(invoice.amount)}</p>
                            <Badge className={invoice.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Admin Activity Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-wellness-text-light">Last Active</span>
                  <span className="text-wellness-text-dark">{formatDate(userProfile.lastActive)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wellness-text-light">Invoices Generated</span>
                  <span className="text-wellness-text-dark">{userInvoices.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wellness-text-light">Successful Payments</span>
                  <span className="text-wellness-text-dark">{userInvoices.filter((invoice) => invoice.status === "paid").length}</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <Button variant="outline" className="w-full" onClick={() => onNavigate("admin-invoices")}>
                    <Download className="w-4 h-4 mr-2" />
                    Open Full Invoice Console
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
