import { useState } from 'react';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Building, 
  Shield, 
  Check,
  Clock,
  Zap,
  AlertCircle,
  QrCode,
  Wallet
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import type { UserData, SubscriptionPlan } from '../App';
import { paymentApiService, type PaymentResult } from '../utils/payment-api-service';

interface PaymentScreenProps {
  plan: SubscriptionPlan | null;
  user: UserData | null;
  onBack: () => void;
  onPaymentSuccess: (paymentResult: PaymentResult) => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'upi' | 'card' | 'netbanking' | 'wallet';
  icon: any;
  description: string;
  processingFee?: number;
  popular?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'upi',
    name: 'UPI',
    type: 'upi',
    icon: QrCode,
    description: 'Pay using any UPI app',
    popular: true
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    type: 'upi',
    icon: Smartphone,
    description: 'Direct PhonePe payment'
  },
  {
    id: 'gpay',
    name: 'Google Pay',
    type: 'upi',
    icon: Smartphone,
    description: 'Pay with Google Pay'
  },
  {
    id: 'paytm',
    name: 'Paytm',
    type: 'wallet',
    icon: Wallet,
    description: 'Paytm Wallet & UPI'
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    type: 'card',
    icon: CreditCard,
    description: 'Visa, MasterCard, RuPay',
    processingFee: 2
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    type: 'netbanking',
    icon: Building,
    description: 'All major banks supported'
  }
];

const popularBanks = [
  'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 
  'Bank of Baroda', 'Punjab National Bank', 'Canara Bank'
];

export function PaymentScreen({ plan, user, onBack, onPaymentSuccess }: PaymentScreenProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!plan) {
    return <div>Plan not selected</div>;
  }

  const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedMethod);
  const totalAmount = plan.price + (selectedPaymentMethod?.processingFee || 0);
  const paymentMode = paymentApiService.getMode();

  const completePayment = async (upiHandle?: string) => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      let paymentResult;

      if (
        selectedMethod === 'upi' ||
        selectedMethod === 'phonepe' ||
        selectedMethod === 'gpay' ||
        selectedMethod === 'paytm'
      ) {
        paymentResult = await paymentApiService.processUPIPayment(
          upiHandle || upiId || selectedMethod,
          totalAmount,
          plan.name,
          {
            userId: user?.id,
            planName: plan.name,
            durationMonths: plan.duration === 'yearly' ? 12 : 1,
          },
        );
      } else {
        const order = await paymentApiService.createRazorpayOrder(
          totalAmount,
          'INR',
          {
            userId: user?.id,
            planName: plan.name,
            durationMonths: plan.duration === 'yearly' ? 12 : 1,
          },
        );
        paymentResult = await paymentApiService.initiateRazorpayPayment(
          order,
          {
            name: user?.name || 'Arogya User',
            email: user?.email || 'user@example.com',
            contact: user?.phone || '',
          },
          plan.name,
          {
            userId: user?.id,
            planName: plan.name,
            durationMonths: plan.duration === 'yearly' ? 12 : 1,
          },
        );
      }

      onPaymentSuccess(paymentResult);
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Payment could not be completed. Please try again.');
      setShowQR(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUPIPayment = () => {
    setShowQR(true);
    setPaymentError(null);
    window.setTimeout(() => {
      void completePayment('upi-qr');
    }, 1500);
  };

  const isFormValid = () => {
    switch (selectedMethod) {
      case 'upi':
      case 'phonepe':
      case 'gpay':
      case 'paytm':
        return upiId.length > 0 || selectedMethod !== 'upi';
      case 'card':
        return cardNumber.length >= 16 && expiryDate.length >= 5 && cvv.length >= 3 && cardName.length > 0;
      case 'netbanking':
        return selectedBank.length > 0;
      default:
        return true;
    }
  };

  if (showQR) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-sm mx-auto min-h-screen bg-white shadow-xl flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-24 h-24 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Scan QR Code</h3>
            <p className="text-gray-600 mb-4">
              Open your UPI app and scan this QR code to complete the payment
            </p>
            <div className="flex items-center justify-center space-x-2 text-green-600 mb-4">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Processing payment...</span>
            </div>
            <Badge className="bg-green-100 text-green-700">
              Amount: {paymentApiService.formatAmount(plan.price)}
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-sm mx-auto min-h-screen bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="font-semibold text-gray-900">Complete Payment</h1>
          </div>
          <div className="w-16" />
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <Card className="p-4 mb-6 border-green-200 bg-green-50">
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">{plan.name} Plan</span>
                <span className="font-medium">{paymentApiService.formatAmount(plan.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Duration</span>
                <span className="font-medium capitalize">{plan.duration}</span>
              </div>
              {selectedPaymentMethod?.processingFee && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing Fee</span>
                  <span>{paymentApiService.formatAmount(selectedPaymentMethod.processingFee)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total Amount</span>
                <span className="text-green-600">{paymentApiService.formatAmount(totalAmount)}</span>
              </div>
            </div>
          </Card>

          <div className="mb-4 flex items-center justify-between rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600">
            <span>Checkout mode</span>
            <Badge className={paymentMode === 'live' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
              {paymentMode === 'live' ? 'Live gateway' : 'Simulation fallback'}
            </Badge>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-3">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label 
                      htmlFor={method.id} 
                      className="flex-1 flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <method.icon className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{method.name}</span>
                            {method.popular && (
                              <Badge className="bg-green-100 text-green-700 text-xs">Popular</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                      {method.processingFee && (
                        <span className="text-xs text-gray-500">
                          +{paymentApiService.formatAmount(method.processingFee)}
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Payment Form */}
          <div className="space-y-4 mb-6">
            {(selectedMethod === 'upi') && (
              <div>
                <Label htmlFor="upi-id" className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID (Optional)
                </Label>
                <Input
                  id="upi-id"
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="h-12"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to pay via QR code
                </p>
              </div>
            )}

            {selectedMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </Label>
                  <Input
                    id="card-number"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    className="h-12"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </Label>
                    <Input
                      id="expiry"
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.substring(0, 2) + '/' + value.substring(2, 4);
                        }
                        setExpiryDate(value);
                      }}
                      className="h-12"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      className="h-12"
                      maxLength={3}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="card-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </Label>
                  <Input
                    id="card-name"
                    type="text"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            )}

            {selectedMethod === 'netbanking' && (
              <div>
                <Label htmlFor="bank" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Your Bank
                </Label>
                <select
                  id="bank"
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Choose your bank</option>
                  {popularBanks.map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Secure Payment:</strong> Your payment is routed through the shared checkout service. Add gateway credentials in environment variables to switch from simulation fallback to live processing.
            </AlertDescription>
          </Alert>

          {paymentError && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {paymentError}
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Button */}
          <Button
            onClick={selectedMethod === 'upi' && !upiId ? handleUPIPayment : () => void completePayment()}
            disabled={!isFormValid() || isProcessing}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 font-medium"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Pay {paymentApiService.formatAmount(totalAmount)}</span>
              </div>
            )}
          </Button>

          {/* Terms */}
          <p className="text-xs text-gray-600 text-center mt-4">
            By proceeding, you agree to our{' '}
            <a href="#" className="text-green-600 hover:text-green-700">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-green-600 hover:text-green-700">Privacy Policy</a>
          </p>

          {/* Support */}
          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">Need help with payment?</p>
            <p className="text-sm font-medium text-green-600">+91 8286524022</p>
          </div>
        </div>
      </div>
    </div>
  );
}
