import { useState } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Star, 
  Users, 
  Zap, 
  Shield, 
  Heart,
  Brain,
  Activity,
  Phone,
  Clock,
  Crown,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import type { UserData, SubscriptionPlan } from '../App';

interface MembershipScreenProps {
  user: UserData | null;
  onBack: () => void;
  onPlanSelect: (plan: SubscriptionPlan) => void;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 49,
    duration: 'monthly',
    features: [
      'Basic AI health recommendations',
      'Daily wellness tracking',
      'Water & meal reminders',
      'Basic exercise suggestions',
      'Limited chat support'
    ]
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 149,
    duration: 'monthly',
    popular: true,
    features: [
      'Advanced AI health insights',
      'Personalized meal planning',
      'Custom workout routines',
      'Medical history analysis',
      'Priority chat support',
      'Sleep quality tracking',
      'Stress management tools'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 499,
    duration: 'monthly',
    features: [
      'Expert AI health coaching',
      'Detailed nutrition analysis',
      'Advanced fitness programs',
      'Lab report integration',
      '24/7 health support',
      'Telehealth consultations',
      'Family health sharing',
      'Premium content access'
    ]
  },
  {
    id: 'family',
    name: 'Family',
    price: 999,
    duration: 'monthly',
    familySize: 6,
    features: [
      'Everything in Premium',
      'Up to 6 family members',
      'Family health dashboard',
      'Kids health tracking',
      'Senior care features',
      'Family challenges',
      'Shared meal planning',
      'Emergency health alerts'
    ]
  }
];

export function MembershipScreen({ user, onBack, onPlanSelect }: MembershipScreenProps) {
  const [isYearly, setIsYearly] = useState(false);

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic':
        return <Heart className="w-6 h-6" />;
      case 'standard':
        return <Brain className="w-6 h-6" />;
      case 'premium':
        return <Crown className="w-6 h-6" />;
      case 'family':
        return <Users className="w-6 h-6" />;
      default:
        return <Activity className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'basic':
        return 'from-blue-500 to-blue-600';
      case 'standard':
        return 'from-green-500 to-green-600';
      case 'premium':
        return 'from-purple-500 to-purple-600';
      case 'family':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getYearlyPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.8); // 20% discount for yearly
  };

  const getCurrentPlan = () => {
    return user?.subscription?.planId || null;
  };

  const isCurrentPlan = (planId: string) => {
    return getCurrentPlan() === planId;
  };

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
            <h1 className="font-semibold text-gray-900">Choose Your Plan</h1>
          </div>
          <div className="w-16" />
        </div>

        <div className="p-6">
          {/* Current Subscription Status */}
          {user?.subscription && (
            <Card className="p-4 mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-800">Current Plan</span>
                  </div>
                  <p className="text-green-700 capitalize">{user.subscription.planName}</p>
                  <p className="text-sm text-green-600">
                    Renewal: {new Date(user.subscription.renewalDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
            </Card>
          )}

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <span className={`font-medium ${!isYearly ? 'text-green-600' : 'text-gray-600'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-green-600"
            />
            <span className={`font-medium ${isYearly ? 'text-green-600' : 'text-gray-600'}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge className="bg-green-100 text-green-700 text-xs">20% OFF</Badge>
            )}
          </div>

          {/* Subscription Plans */}
          <div className="space-y-4">
            {subscriptionPlans.map((plan) => {
              const displayPrice = isYearly ? getYearlyPrice(plan.price) : plan.price;
              const isCurrentUserPlan = isCurrentPlan(plan.id);
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative overflow-hidden ${
                    plan.popular ? 'border-2 border-green-500 shadow-lg' : 'border border-gray-200'
                  } ${isCurrentUserPlan ? 'bg-green-50 border-green-400' : ''}`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                      <Star className="w-3 h-3 inline mr-1" />
                      Most Popular
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {isCurrentUserPlan && (
                    <div className="absolute top-0 left-0 bg-green-600 text-white text-xs px-3 py-1 rounded-br-lg font-medium">
                      Current Plan
                    </div>
                  )}

                  <div className="p-6">
                    {/* Plan Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getPlanColor(plan.id)} flex items-center justify-center text-white`}>
                          {getPlanIcon(plan.id)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center">
                            {plan.name}
                            {plan.familySize && (
                              <span className="ml-2 text-sm text-gray-600">
                                (Up to {plan.familySize} members)
                              </span>
                            )}
                          </h3>
                          <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-bold text-gray-900">
                              ₹{displayPrice}
                            </span>
                            <span className="text-gray-600 text-sm">
                              /{isYearly ? 'year' : 'month'}
                            </span>
                            {isYearly && (
                              <span className="text-xs text-green-600 line-through">
                                ₹{plan.price * 12}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => onPlanSelect({
                        ...plan,
                        price: displayPrice,
                        duration: isYearly ? 'yearly' : 'monthly'
                      })}
                      disabled={isCurrentUserPlan}
                      className={`w-full h-12 font-medium ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
                          : 'bg-gray-900 hover:bg-gray-800'
                      } ${isCurrentUserPlan ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                    >
                      {isCurrentUserPlan ? (
                        'Current Plan'
                      ) : getCurrentPlan() ? (
                        'Upgrade to ' + plan.name
                      ) : (
                        'Choose ' + plan.name
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Benefits Section */}
          <Card className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Why Choose Arogya+ AI?</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-green-500" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Cancel Anytime</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Money Back Guarantee */}
          <div className="text-center mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="flex items-center justify-center space-x-2 text-yellow-800">
              <Shield className="w-5 h-5" />
              <span className="font-medium">30-Day Money Back Guarantee</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Not satisfied? Get a full refund within 30 days.
            </p>
          </div>

          {/* Customer Support */}
          <div className="text-center mt-4 text-sm text-gray-600">
            <p>Need help choosing? Contact our support team</p>
            <p className="font-mono text-green-600">+91 8286524022</p>
          </div>
        </div>
      </div>
    </div>
  );
}