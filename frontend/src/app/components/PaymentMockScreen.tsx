import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Loader2,
} from "lucide-react";

interface PaymentMockScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

export function PaymentMockScreen({ onBack, onComplete }: PaymentMockScreenProps) {
  const [selectedMethod, setSelectedMethod] = useState<"upi" | "card" | "netbanking" | null>(null);
  const [paymentStep, setPaymentStep] = useState<"select" | "details" | "processing" | "success" | "failure">("select");
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [selectedBank, setSelectedBank] = useState("");

  const upiApps = [
    { id: "googlepay", name: "Google Pay", icon: "🟢" },
    { id: "phonepe", name: "PhonePe", icon: "🟣" },
    { id: "paytm", name: "Paytm", icon: "🔵" },
    { id: "amazonpay", name: "Amazon Pay", icon: "🟠" },
  ];

  const banks = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Punjab National Bank",
    "Bank of Baroda",
    "Canara Bank",
    "Union Bank of India",
  ];

  const handlePaymentSubmit = () => {
    setPaymentStep("processing");
    
    // Simulate payment processing
    setTimeout(() => {
      // 80% success rate simulation
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        setPaymentStep("success");
        // Simulate admin notification
        setTimeout(() => {
          alert("✅ Payment Successful!\n\nAdmin Notifications Sent:\n• Email to chaudharyammar134@gmail.com\n• SMS to +91 8286524022\n\nTransaction will be logged in Firestore payment records.");
        }, 500);
      } else {
        setPaymentStep("failure");
        alert("❌ Payment Failed!\n\nAdmin Notifications Sent:\n• Email to chaudharyammar134@gmail.com\n• SMS to +91 8286524022\n\nFailure will be logged in Firestore for retry.");
      }
    }, 3000);
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case "upi":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-wellness-text-dark">Select UPI App</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {upiApps.map((app) => (
                  <Button
                    key={app.id}
                    variant="outline"
                    className="h-16 flex items-center justify-center gap-2"
                    onClick={() => setUpiId(app.id)}
                  >
                    <span className="text-2xl">{app.icon}</span>
                    <span>{app.name}</span>
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-wellness-text-dark">Or Enter UPI ID</label>
              <Input
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </div>
          </div>
        );

      case "card":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-wellness-text-dark">Card Number</label>
              <Input
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                maxLength={19}
              />
            </div>
            <div>
              <label className="text-wellness-text-dark">Cardholder Name</label>
              <Input
                placeholder="Name on card"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-wellness-text-dark">Expiry</label>
                <Input
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                  maxLength={5}
                />
              </div>
              <div>
                <label className="text-wellness-text-dark">CVV</label>
                <Input
                  placeholder="123"
                  type="password"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                  maxLength={3}
                />
              </div>
            </div>
          </div>
        );

      case "netbanking":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-wellness-text-dark">Select Your Bank</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Select Bank --</option>
                {banks.map((bank) => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>
            {selectedBank && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-wellness-text-dark text-sm">
                  You will be redirected to {selectedBank}'s secure login page.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (paymentStep === "processing") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-16 h-16 text-wellness-green mx-auto mb-4 animate-spin" />
            <h3 className="text-wellness-text-dark mb-2">Processing Payment...</h3>
            <p className="text-wellness-text-light text-sm">Please do not close or refresh this page</p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-wellness-text-light">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Connecting to the payment gateway and Firebase...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStep === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-wellness-text-dark mb-2">Payment Successful!</h3>
            <p className="text-wellness-text-light mb-6">Your transaction has been completed successfully</p>
            
            <div className="space-y-3 mb-6">
              <div className="p-3 bg-gray-50 rounded-lg text-left">
                <p className="text-wellness-text-light text-sm">Transaction ID</p>
                <p className="text-wellness-text-dark font-mono">TXN{Date.now()}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-left">
                <p className="text-wellness-text-light text-sm">Amount Paid</p>
                <p className="text-wellness-green text-xl">₹499.00</p>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
              <h4 className="text-wellness-text-dark text-sm mb-2">✅ Admin Notifications Sent</h4>
              <div className="text-xs text-wellness-text-light space-y-1">
                <p>📧 Email: chaudharyammar134@gmail.com</p>
                <p>📱 SMS: +91 8286524022</p>
                <p>💾 Logged in Firestore payment records</p>
              </div>
            </div>

            <Button
              onClick={onComplete}
              className="w-full bg-wellness-green hover:bg-wellness-green/90"
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStep === "failure") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-wellness-text-dark mb-2">Payment Failed</h3>
            <p className="text-wellness-text-light mb-6">We couldn't process your payment. Please try again.</p>
            
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6 text-left">
              <h4 className="text-wellness-text-dark text-sm mb-2">Possible Reasons:</h4>
              <ul className="text-xs text-wellness-text-light space-y-1">
                <li>• Insufficient balance</li>
                <li>• Network connectivity issues</li>
                <li>• Incorrect payment details</li>
                <li>• Bank server timeout</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <h4 className="text-wellness-text-dark text-sm mb-2">✅ Admin Notifications Sent</h4>
              <div className="text-xs text-wellness-text-light space-y-1">
                <p>📧 Email: chaudharyammar134@gmail.com</p>
                <p>📱 SMS: +91 8286524022</p>
                <p>💾 Failure logged for analysis</p>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => {
                  setPaymentStep("details");
                }}
                className="w-full bg-wellness-green hover:bg-wellness-green/90"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={onBack}
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <h1 className="text-wellness-text-dark">Payment Gateway</h1>
              <div className="flex items-center gap-2 mt-1">
                <Database className="w-3 h-3 text-blue-600" />
                <p className="text-wellness-text-light text-sm">
                  Mock payment flow - Ready for Razorpay/Stripe/UPI integration
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        {/* Integration Note */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-wellness-text-dark mb-1">Payment Integration Ready</h4>
                <p className="text-wellness-text-light text-sm">
                  This is a mock payment flow. In production, this will integrate with:
                </p>
                <ul className="text-wellness-text-light text-sm mt-2 space-y-1">
                  <li>• <strong>Razorpay</strong> for UPI, Cards, NetBanking</li>
                  <li>• <strong>Stripe</strong> for international payments</li>
                  <li>• <strong>Firebase</strong> for transaction logging and admin notifications</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {paymentStep === "select" && (
          <Card>
            <CardHeader>
              <CardTitle>Select Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full h-20 flex items-center justify-between px-6"
                onClick={() => {
                  setSelectedMethod("upi");
                  setPaymentStep("details");
                }}
              >
                <div className="flex items-center gap-4">
                  <Smartphone className="w-6 h-6 text-wellness-green" />
                  <div className="text-left">
                    <p className="text-wellness-text-dark">UPI</p>
                    <p className="text-wellness-text-light text-sm">Google Pay, PhonePe, Paytm</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Recommended</Badge>
              </Button>

              <Button
                variant="outline"
                className="w-full h-20 flex items-center justify-between px-6"
                onClick={() => {
                  setSelectedMethod("card");
                  setPaymentStep("details");
                }}
              >
                <div className="flex items-center gap-4">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <p className="text-wellness-text-dark">Debit / Credit Card</p>
                    <p className="text-wellness-text-light text-sm">Visa, Mastercard, Rupay</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full h-20 flex items-center justify-between px-6"
                onClick={() => {
                  setSelectedMethod("netbanking");
                  setPaymentStep("details");
                }}
              >
                <div className="flex items-center gap-4">
                  <Building2 className="w-6 h-6 text-purple-600" />
                  <div className="text-left">
                    <p className="text-wellness-text-dark">Net Banking</p>
                    <p className="text-wellness-text-light text-sm">All major banks supported</p>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        )}

        {paymentStep === "details" && selectedMethod && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Enter Payment Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPaymentStep("select");
                    setSelectedMethod(null);
                  }}
                >
                  Change Method
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-wellness-text-dark mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-wellness-text-light">Plan</span>
                    <span className="text-wellness-text-dark">Premium Monthly</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-wellness-text-light">Amount</span>
                    <span className="text-wellness-text-dark">₹499.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-wellness-text-light">GST (18%)</span>
                    <span className="text-wellness-text-dark">₹89.82</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-wellness-text-dark">Total</span>
                    <span className="text-wellness-green">₹588.82</span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              {renderPaymentForm()}

              {/* Submit Button */}
              <div className="space-y-3">
                <Button
                  onClick={handlePaymentSubmit}
                  className="w-full bg-wellness-green hover:bg-wellness-green/90"
                  disabled={
                    (selectedMethod === "upi" && !upiId) ||
                    (selectedMethod === "card" && (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv)) ||
                    (selectedMethod === "netbanking" && !selectedBank)
                  }
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay ₹588.82
                </Button>
                <p className="text-wellness-text-lighter text-xs text-center">
                  🔒 Your payment is secure and encrypted
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}