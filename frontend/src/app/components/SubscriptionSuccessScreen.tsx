import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Sparkles, 
  Calendar, 
  CreditCard, 
  Mail, 
  MessageSquare,
  Download,
  Home,
  Gift,
  Star
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import type { UserSubscription } from '../App';

interface SubscriptionSuccessScreenProps {
  subscription: UserSubscription | undefined;
  onContinue: () => void;
}

export function SubscriptionSuccessScreen({ subscription, onContinue }: SubscriptionSuccessScreenProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!subscription) {
    return <div>Subscription not found</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getWelcomeMessage = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic':
        return 'Welcome to your wellness journey!';
      case 'standard':
        return 'Unlock advanced health insights!';
      case 'premium':
        return 'Experience premium health coaching!';
      case 'family':
        return 'Your family\'s health journey begins!';
      default:
        return 'Welcome to Arogya+ AI!';
    }
  };

  const getPlanBenefits = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic':
        return [
          'Daily health recommendations',
          'Basic wellness tracking',
          'Meal and water reminders'
        ];
      case 'standard':
        return [
          'Advanced AI health insights',
          'Personalized meal planning',
          'Custom workout routines',
          'Priority support'
        ];
      case 'premium':
        return [
          'Expert AI health coaching',
          'Detailed nutrition analysis',
          'Telehealth consultations',
          '24/7 health support'
        ];
      case 'family':
        return [
          'Family health dashboard',
          'Up to 6 family members',
          'Kids & senior care features',
          'Family challenges & goals'
        ];
      default:
        return ['Personalized health recommendations'];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles className="w-4 h-4 text-green-500" />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-sm mx-auto min-h-screen bg-white shadow-xl">
        <div className="p-6 text-center">
          {/* Success Icon */}
          <div className="relative mb-8 mt-12">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Success Message */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful! 🎉
            </h1>
            <p className="text-lg text-gray-700 mb-1">
              {getWelcomeMessage(subscription.planName)}
            </p>
            <p className="text-gray-600">
              Your {subscription.planName} plan is now active
            </p>
          </div>

          {/* Subscription Details Card */}
          <Card className="p-6 mb-6 text-left bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-green-100 text-green-700 font-medium">
                {subscription.planName} Plan
              </Badge>
              <Badge variant="outline" className="border-green-500 text-green-600">
                Active
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">Amount Paid</span>
                </div>
                <span className="font-semibold">₹{subscription.price}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">Valid Until</span>
                </div>
                <span className="font-semibold">
                  {formatDate(subscription.renewalDate)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Gift className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">Transaction ID</span>
                </div>
                <span className="font-mono text-sm">
                  {subscription.transactionId}
                </span>
              </div>
            </div>
          </Card>

          {/* Plan Benefits */}
          <Card className="p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              What you get with {subscription.planName}:
            </h3>
            <div className="space-y-2">
              {getPlanBenefits(subscription.planName).map((benefit, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Notifications Sent */}
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">Confirmation Sent</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-blue-700">
                <Mail className="w-4 h-4" />
                <span>Receipt emailed to your registered email</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-700">
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp confirmation sent</span>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              onClick={onContinue}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 font-medium"
            >
              <Home className="w-4 h-4 mr-2" />
              Continue to Dashboard
            </Button>
            
            <Button
              variant="outline"
              className="w-full h-12 border-2 border-gray-200 hover:border-green-300"
              onClick={() => {
                // In a real app, this would generate and download an invoice
                alert('Invoice download feature will be implemented with backend integration');
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          </div>

          {/* Support Information */}
          <div className="text-center pt-6 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
            <p className="text-sm text-gray-600 mb-2">
              Our support team is here to help you get started
            </p>
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-600">
                📞 +91 8286524022
              </p>
              <p className="text-sm font-medium text-green-600">
                📧 support@arogyaai.com
              </p>
            </div>
          </div>

          {/* Welcome Bonus */}
          <Card className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <div className="flex items-center justify-center space-x-2 text-orange-700">
              <Gift className="w-5 h-5" />
              <span className="font-medium">Welcome Bonus Unlocked!</span>
            </div>
            <p className="text-sm text-orange-600 mt-1">
              Get 7 days of premium features as a welcome gift
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}