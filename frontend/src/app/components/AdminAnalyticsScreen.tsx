import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Calendar,
  Download,
  Database,
  BarChart3,
} from "lucide-react";

interface AdminAnalyticsScreenProps {
  onBack: () => void;
}

export function AdminAnalyticsScreen({ onBack }: AdminAnalyticsScreenProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  // Demo analytics data until Firebase aggregation is connected
  const analytics = {
    revenue: {
      current: 1847299,
      previous: 1604173,
      growth: 15.2,
      data: [
        { month: "Jul", amount: 1203451 },
        { month: "Aug", amount: 1456789 },
        { month: "Sep", amount: 1534210 },
        { month: "Oct", amount: 1604173 },
        { month: "Nov", amount: 1723456 },
        { month: "Dec", amount: 1847299 },
      ],
    },
    users: {
      total: 12847,
      active: 10178,
      inactive: 2669,
      newThisMonth: 1247,
      churnRate: 3.2,
      data: [
        { month: "Jul", users: 8234 },
        { month: "Aug", users: 9156 },
        { month: "Sep", users: 10012 },
        { month: "Oct", users: 10876 },
        { month: "Nov", users: 11543 },
        { month: "Dec", users: 12847 },
      ],
    },
    subscriptions: {
      active: 8624,
      cancelled: 1554,
      expired: 445,
      planDistribution: [
        { plan: "Basic", count: 2843, percentage: 33.0, color: "bg-gray-500" },
        { plan: "Standard", count: 4567, percentage: 53.0, color: "bg-blue-500" },
        { plan: "Premium", count: 1876, percentage: 21.8, color: "bg-purple-500" },
        { plan: "Family", count: 892, percentage: 10.3, color: "bg-green-500" },
      ],
    },
    retention: {
      rate: 96.8,
      trend: "up",
      data: [
        { month: "Jul", rate: 94.2 },
        { month: "Aug", rate: 95.1 },
        { month: "Sep", rate: 95.8 },
        { month: "Oct", rate: 96.2 },
        { month: "Nov", rate: 96.5 },
        { month: "Dec", rate: 96.8 },
      ],
    },
    userAcquisition: [
      { source: "Organic Search", users: 4523, percentage: 35.2, color: "bg-blue-500" },
      { source: "Social Media", users: 3214, percentage: 25.0, color: "bg-purple-500" },
      { source: "Referral", users: 2845, percentage: 22.1, color: "bg-green-500" },
      { source: "Direct", users: 1456, percentage: 11.3, color: "bg-yellow-500" },
      { source: "Paid Ads", users: 809, percentage: 6.3, color: "bg-red-500" },
    ],
  };

  const exportData = () => {
    alert("Exporting analytics data...\nThis will generate a report from Firebase analytics data and download it as CSV/PDF.");
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
              <h1 className="text-wellness-text-dark">Analytics Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <Database className="w-3 h-3 text-blue-600" />
                <p className="text-wellness-text-light text-sm">
                  Analytics prepared from Firebase data
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Firebase Analytics Indicator */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-wellness-text-dark mb-1">Firebase Analytics Aggregation</h4>
                <code className="text-xs bg-white px-3 py-2 rounded border border-blue-200 block overflow-x-auto mb-2">
                  Aggregate payment records for the selected {timeRange} period
                </code>
                <code className="text-xs bg-white px-3 py-2 rounded border border-blue-200 block overflow-x-auto">
                  Aggregate user activity for the selected {timeRange} period
                </code>
                <p className="text-wellness-text-light text-sm mt-2">
                  Firebase Functions will aggregate Firestore records into dashboard-ready metrics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div className={`flex items-center gap-1 text-sm ${
                  analytics.revenue.growth > 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {analytics.revenue.growth > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(analytics.revenue.growth)}%
                </div>
              </div>
              <h3 className="text-wellness-text-dark">₹{analytics.revenue.current.toLocaleString()}</h3>
              <p className="text-wellness-text-light mt-1">Total Revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-blue-600" />
                <Badge className="bg-blue-100 text-blue-800">
                  +{analytics.users.newThisMonth}
                </Badge>
              </div>
              <h3 className="text-wellness-text-dark">{analytics.users.total.toLocaleString()}</h3>
              <p className="text-wellness-text-light mt-1">Total Users</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 text-purple-600" />
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  {analytics.retention.rate}%
                </div>
              </div>
              <h3 className="text-wellness-text-dark">{analytics.users.active.toLocaleString()}</h3>
              <p className="text-wellness-text-light mt-1">Active Users</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-8 h-8 text-wellness-green" />
                <div className="flex items-center gap-1 text-sm text-orange-600">
                  <TrendingDown className="w-4 h-4" />
                  {analytics.users.churnRate}%
                </div>
              </div>
              <h3 className="text-wellness-text-dark">{analytics.subscriptions.active.toLocaleString()}</h3>
              <p className="text-wellness-text-light mt-1">Active Subscriptions</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue & Users Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Revenue Trend (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.revenue.data.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-wellness-text-dark">{item.month}</span>
                      <span className="text-wellness-green">₹{item.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-wellness-green transition-all duration-500"
                        style={{ width: `${(item.amount / analytics.revenue.current) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Growth (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.users.data.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-wellness-text-dark">{item.month}</span>
                      <span className="text-blue-600">{item.users.toLocaleString()} users</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${(item.users / analytics.users.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Distribution & User Acquisition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  {analytics.subscriptions.planDistribution.map((plan, index) => (
                    <div key={index} className="flex-1">
                      <div className={`h-32 ${plan.color} rounded-t-lg relative`}>
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <span>{plan.percentage}%</span>
                        </div>
                      </div>
                      <div className="text-center mt-2">
                        <p className="text-wellness-text-dark">{plan.plan}</p>
                        <p className="text-wellness-text-light text-sm">{plan.count.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {analytics.subscriptions.planDistribution.map((plan, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${plan.color}`} />
                        <span className="text-wellness-text-dark">{plan.plan}</span>
                      </div>
                      <span className="text-wellness-text-light">{plan.count.toLocaleString()} ({plan.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Acquisition Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.userAcquisition.map((source, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${source.color}`} />
                        <span className="text-wellness-text-dark">{source.source}</span>
                      </div>
                      <span className="text-wellness-text-light">{source.users.toLocaleString()} ({source.percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${source.color} transition-all duration-500`}
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Retention & Churn Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Retention Rate Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.retention.data.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-wellness-text-dark">{item.month}</span>
                      <span className="text-wellness-green">{item.rate}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-wellness-green transition-all duration-500"
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Churn Analysis & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-wellness-text-dark mb-2">Current Churn Rate</h4>
                  <p className="text-wellness-text-dark text-2xl">{analytics.users.churnRate}%</p>
                  <p className="text-wellness-text-light text-sm mt-1">
                    {analytics.subscriptions.cancelled} users cancelled in the last 30 days
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-wellness-text-dark">Recommendations</h4>
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-wellness-text-dark text-sm">
                      • Improve onboarding experience for Basic plan users
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded">
                    <p className="text-wellness-text-dark text-sm">
                      • Send retention campaigns to users inactive for 7+ days
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                    <p className="text-wellness-text-dark text-sm">
                      • Offer upgrade incentives before renewal dates
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}