import { useEffect, useMemo, useState } from "react";
import { Screen } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  Search,
  Download,
  Mail,
  FileText,
  Calendar,
  DollarSign,
  User,
  Database,
  Printer,
  Eye,
  Loader2,
} from "lucide-react";
import { apiClient } from "../utils/api-client";

interface InvoiceManagementScreenProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  subscriptionId: string;
  plan: string;
  amount: number;
  status: string;
  issueDate: string;
  dueDate: string;
  paidDate: string;
  createdAt: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
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

export function InvoiceManagementScreen({ onBack }: InvoiceManagementScreenProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"remote" | "local">("local");

  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getInvoices();
        if (response.success && response.data) {
          setInvoices(response.data.invoices || []);
          setDataSource(response.source === "remote" ? "remote" : "local");
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchInvoices();
  }, []);

  const stats = useMemo(() => {
    const paidInvoices = invoices.filter((invoice) => invoice.status === "paid");
    const pendingInvoices = invoices.filter((invoice) => invoice.status !== "paid");

    return {
      totalInvoices: invoices.length,
      paidInvoices: paidInvoices.length,
      pendingAmount: pendingInvoices.reduce((sum, invoice) => sum + invoice.amount, 0),
      totalRevenue: paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0),
    };
  }, [invoices]);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const selectedInv = selectedInvoice
    ? invoices.find((invoice) => invoice.id === selectedInvoice)
    : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
              <h1 className="text-wellness-text-dark">Invoice Management</h1>
              <div className="flex items-center gap-2 mt-1">
                <Database className="w-3 h-3 text-blue-600" />
                <p className="text-wellness-text-light text-sm">
                  Source: <span className="font-medium">{dataSource === "remote" ? "live backend" : "local fallback store"}</span>
                </p>
              </div>
            </div>
          </div>
          <Button className="bg-wellness-green hover:bg-wellness-green/90">
            <FileText className="w-4 h-4 mr-2" />
            Generated from payments
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-wellness-text-light">Total Invoices</p>
                  <h3 className="text-wellness-text-dark mt-1">{stats.totalInvoices}</h3>
                </div>
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-wellness-text-light">Paid Invoices</p>
                  <h3 className="text-wellness-text-dark mt-1">{stats.paidInvoices}</h3>
                </div>
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-wellness-text-light">Pending Amount</p>
                  <h3 className="text-wellness-text-dark mt-1">{formatCurrency(stats.pendingAmount)}</h3>
                </div>
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-wellness-text-light">Total Revenue</p>
                  <h3 className="text-wellness-green mt-1">{formatCurrency(stats.totalRevenue)}</h3>
                </div>
                <DollarSign className="w-6 h-6 text-wellness-green" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-wellness-text-dark mb-1">Invoice Data Feed</h4>
                <code className="text-xs bg-white px-3 py-2 rounded border border-blue-200 block overflow-x-auto">
                  {dataSource === "remote" ? "GET /admin/invoices" : "localStorage -> aarogya:invoices"}
                </code>
                <p className="text-wellness-text-light text-sm mt-2">
                  Invoice records are created automatically after successful subscription checkout.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <CardTitle>Invoices</CardTitle>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-wellness-text-light" />
                      <Input
                        placeholder="Search invoices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="p-2 border border-gray-300 rounded-md"
                    >
                      <option value="all">All Status</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-wellness-green" />
                    <span className="ml-3 text-wellness-text-light">Loading invoices...</span>
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="text-center py-12 text-wellness-text-light">
                    No invoices found yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                          selectedInvoice === invoice.id
                            ? "border-wellness-green bg-green-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                        onClick={() => setSelectedInvoice(invoice.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-wellness-text-dark">{invoice.invoiceNumber}</h4>
                            <p className="text-wellness-text-light text-sm mt-1">{invoice.userName}</p>
                          </div>
                          <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-wellness-text-light text-sm">Amount</p>
                            <p className="text-wellness-green">{formatCurrency(invoice.amount)}</p>
                          </div>
                          <div>
                            <p className="text-wellness-text-light text-sm">Issue Date</p>
                            <p className="text-wellness-text-dark text-sm">{formatDate(invoice.issueDate)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                          <Button variant="outline" size="sm">
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            {selectedInv ? (
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center pb-4 border-b border-gray-200">
                    <h3 className="text-wellness-green">Arogya+AI</h3>
                    <p className="text-wellness-text-light text-sm mt-1">Health and Wellness Platform</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-wellness-text-light text-sm">Invoice Number</p>
                    <p className="text-wellness-text-dark">{selectedInv.invoiceNumber}</p>
                  </div>

                  <div>
                    <h4 className="text-wellness-text-dark mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Customer Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-wellness-text-dark">{selectedInv.userName}</p>
                      <p className="text-wellness-text-light">{selectedInv.userEmail}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-wellness-text-dark mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Dates
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-wellness-text-light">Issue Date</span>
                        <span className="text-wellness-text-dark">{formatDate(selectedInv.issueDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-wellness-text-light">Due Date</span>
                        <span className="text-wellness-text-dark">{formatDate(selectedInv.dueDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-wellness-text-light">Paid Date</span>
                        <span className="text-wellness-text-dark">{formatDate(selectedInv.paidDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-wellness-text-dark mb-3">Billing</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-wellness-text-light">Plan</span>
                        <span className="text-wellness-text-dark">{selectedInv.plan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-wellness-text-light">Amount</span>
                        <span className="text-wellness-text-dark">{formatCurrency(selectedInv.amount)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-wellness-text-dark">Status</span>
                        <Badge className={getStatusColor(selectedInv.status)}>{selectedInv.status}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <Button className="w-full bg-wellness-green hover:bg-wellness-green/90">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="w-4 h-4 mr-2" />
                      Send via Email
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Printer className="w-4 h-4 mr-2" />
                      Print Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-wellness-text-light">Select an invoice to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
