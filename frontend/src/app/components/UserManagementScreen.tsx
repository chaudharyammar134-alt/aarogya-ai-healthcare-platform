import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Screen } from "../App";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Activity,
  Users,
  TrendingUp,
  UserCheck,
  Database,
  Loader2,
} from "lucide-react";
import { apiClient } from "../utils/api-client";

interface UserManagementScreenProps {
  onNavigate: (screen: Screen) => void;
  onUserSelect: (userId: string) => void;
}

export function UserManagementScreen({ onNavigate, onUserSelect }: UserManagementScreenProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newThisMonth: 0,
    avgHealthScore: 84,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"remote" | "local">("local");

  const formatDateTime = (value?: string) => {
    if (!value) return "No activity yet";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getUsers();
        if (response.success && response.data) {
          const userList = response.data.users || [];
          setUsers(userList);
          setDataSource(response.source === "remote" ? "remote" : "local");

          // Calculate stats
          const active = userList.filter((u: any) => u.status === 'active');
          const now = new Date();
          const thisMonth = userList.filter((u: any) => {
            if (!u.createdAt) return false;
            const created = new Date(u.createdAt);
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
          });

          setStats({
            totalUsers: userList.length,
            activeUsers: active.length,
            newThisMonth: thisMonth.length,
            avgHealthScore: 84,
          });
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Basic": return "bg-gray-100 text-gray-800";
      case "Standard": return "bg-blue-100 text-blue-800";
      case "Premium": return "bg-purple-100 text-purple-800";
      case "Family": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "expired": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesPlan = filterPlan === "all" || user.plan === filterPlan;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("admin-dashboard")}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-wellness-text-dark">User Management</h1>
              <div className="flex items-center gap-2 mt-1">
                <Database className="w-3 h-3 text-blue-600" />
                <p className="text-wellness-text-light text-sm">
                  Source: <span className="font-medium">{dataSource === "remote" ? "live backend" : "local fallback store"}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
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
                  <p className="text-wellness-text-light">Total Users</p>
                  <h3 className="text-wellness-text-dark mt-1">{stats.totalUsers.toLocaleString()}</h3>
                </div>
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-wellness-text-light">Active Users</p>
                  <h3 className="text-wellness-text-dark mt-1">{stats.activeUsers.toLocaleString()}</h3>
                </div>
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-wellness-text-light">New This Month</p>
                  <h3 className="text-wellness-text-dark mt-1">{stats.newThisMonth.toLocaleString()}</h3>
                </div>
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-wellness-text-light">Avg Health Score</p>
                  <h3 className="text-wellness-text-dark mt-1">{stats.avgHealthScore}</h3>
                </div>
                <Activity className="w-6 h-6 text-wellness-green" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Source Indicator */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-wellness-text-dark mb-1">User Data Feed</h4>
                <code className="text-xs bg-white px-3 py-2 rounded border border-blue-200 block overflow-x-auto">
                  {dataSource === "remote" ? "GET /admin/users" : "localStorage -> aarogya:users"}
                </code>
                <p className="text-wellness-text-light text-sm mt-2">
                  This screen reads from the shared auth store used by signup and login.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-wellness-text-light" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Plans</option>
                  <option value="Basic">Basic (₹49)</option>
                  <option value="Standard">Standard (₹199)</option>
                  <option value="Premium">Premium (₹499)</option>
                  <option value="Family">Family (₹999)</option>
                </select>
              </div>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>User List ({filteredUsers.length})</span>
              <Badge className="bg-blue-100 text-blue-800">
                {isLoading ? 'Loading...' : dataSource === "remote" ? 'Live backend' : 'Local fallback'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-wellness-green" />
                <span className="ml-3 text-wellness-text-light">Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-wellness-text-light">
                No users found. Create an account to see users here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-wellness-text-light">User ID</th>
                    <th className="text-left py-3 px-4 text-wellness-text-light">Name & Contact</th>
                    <th className="text-left py-3 px-4 text-wellness-text-light">Plan</th>
                    <th className="text-left py-3 px-4 text-wellness-text-light">Status</th>
                    <th className="text-left py-3 px-4 text-wellness-text-light">Health Score</th>
                    <th className="text-left py-3 px-4 text-wellness-text-light">Last Active</th>
                    <th className="text-left py-3 px-4 text-wellness-text-light">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => onUserSelect(user.id)}
                    >
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm text-wellness-text-light">{user.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-wellness-text-dark">{user.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-wellness-text-light text-sm">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getPlanColor(user.plan)}>
                          {user.plan}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-wellness-green"
                              style={{ width: `${user.healthScore}%` }}
                            />
                          </div>
                          <span className="text-wellness-text-dark">{user.healthScore}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-wellness-text-light text-sm">
                        {formatDateTime(user.lastActive)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUserSelect(user.id);
                            }}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate("admin-invoices");
                            }}
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
