/**
 * API Integration Dashboard
 * Demonstrates all integrated APIs in Arogya+ AI
 * Test/Demo Mode - Shows API simulation status
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Activity, 
  Brain, 
  Heart, 
  Pill, 
  CreditCard, 
  Bell, 
  TrendingUp, 
  MapPin,
  Cloud,
  Database,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { UserData } from '../App';

// Import all API services
import { aiHealthService } from '../utils/ai-health-service';
import { healthApiService } from '../utils/health-api-service';
import { paymentApiService } from '../utils/payment-api-service';
import { notificationApiService } from '../utils/notification-api-service';
import { analyticsApiService } from '../utils/analytics-api-service';
import { medicalApiService } from '../utils/medical-api-service';
import { utilityApiService } from '../utils/utility-api-service';

interface APIStatus {
  name: string;
  status: 'active' | 'testing' | 'inactive';
  icon: any;
  description: string;
  category: string;
  lastCalled?: string;
}

interface Props {
  user: UserData | null;
  onBack: () => void;
}

export function APIIntegrationDashboard({ user, onBack }: Props) {
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const apiServices: APIStatus[] = [
    {
      name: 'OpenAI GPT-4',
      status: 'testing',
      icon: Brain,
      description: 'AI-powered health plan generation',
      category: 'AI & Chat'
    },
    {
      name: 'LangChain.js',
      status: 'testing',
      icon: Brain,
      description: 'Conversational AI with memory',
      category: 'AI & Chat'
    },
    {
      name: 'Nutritionix',
      status: 'testing',
      icon: Activity,
      description: 'Food nutrition database',
      category: 'AI & Chat'
    },
    {
      name: 'Google Fit',
      status: 'testing',
      icon: Heart,
      description: 'Steps, sleep, and activity tracking',
      category: 'Health & Fitness'
    },
    {
      name: 'CalorieMama',
      status: 'testing',
      icon: Activity,
      description: 'Food image recognition',
      category: 'Health & Fitness'
    },
    {
      name: 'OpenWeatherMap',
      status: 'testing',
      icon: Cloud,
      description: 'Weather-based hydration adjustments',
      category: 'Health & Fitness'
    },
    {
      name: 'Razorpay',
      status: 'testing',
      icon: CreditCard,
      description: 'UPI and card payments',
      category: 'Payments'
    },
    {
      name: 'Stripe',
      status: 'testing',
      icon: CreditCard,
      description: 'International payments',
      category: 'Payments'
    },
    {
      name: 'Firebase FCM',
      status: 'testing',
      icon: Bell,
      description: 'Push notifications',
      category: 'Notifications'
    },
    {
      name: 'OneSignal',
      status: 'testing',
      icon: Bell,
      description: 'Cross-platform notifications',
      category: 'Notifications'
    },
    {
      name: 'EmailJS',
      status: 'testing',
      icon: Bell,
      description: 'Email notifications',
      category: 'Notifications'
    },
    {
      name: 'Twilio',
      status: 'testing',
      icon: Bell,
      description: 'SMS and WhatsApp',
      category: 'Notifications'
    },
    {
      name: 'Firebase Analytics',
      status: 'testing',
      icon: TrendingUp,
      description: 'User behavior tracking',
      category: 'Analytics'
    },
    {
      name: 'Google Analytics GA4',
      status: 'testing',
      icon: TrendingUp,
      description: 'Web traffic analytics',
      category: 'Analytics'
    },
    {
      name: 'Metabase',
      status: 'testing',
      icon: Database,
      description: 'Business intelligence',
      category: 'Analytics'
    },
    {
      name: 'ABDM (Ayushman)',
      status: 'testing',
      icon: Pill,
      description: 'Digital health records',
      category: 'Medical'
    },
    {
      name: 'PharmEasy / 1mg',
      status: 'testing',
      icon: Pill,
      description: 'Medicine ordering',
      category: 'Medical'
    },
    {
      name: 'OCR.Space',
      status: 'testing',
      icon: Pill,
      description: 'Prescription text extraction',
      category: 'Medical'
    },
    {
      name: 'IP Geolocation',
      status: 'testing',
      icon: MapPin,
      description: 'Location detection',
      category: 'Utility'
    },
    {
      name: 'TimeZoneDB',
      status: 'testing',
      icon: MapPin,
      description: 'Timezone adjustments',
      category: 'Utility'
    },
  ];

  // Test API functions
  const testAI = async () => {
    if (!user) return;
    setLoading({ ...loading, ai: true });
    
    try {
      const plan = await aiHealthService.generateDailyHealthPlan(user);
      const chat = await aiHealthService.chatWithAI('test_user', 'Hello, how can you help me?', user);
      const nutrition = await healthApiService.getNutritionInfo('dal');
      
      setTestResults({
        ...testResults,
        ai: {
          healthPlan: plan,
          chatResponse: chat,
          nutritionData: nutrition,
          status: 'success'
        }
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        ai: { status: 'error', message: String(error) }
      });
    } finally {
      setLoading({ ...loading, ai: false });
    }
  };

  const testHealth = async () => {
    setLoading({ ...loading, health: true });
    
    try {
      const metrics = await healthApiService.getHealthMetrics('test_user');
      const weather = await healthApiService.getWeatherData('Delhi');
      const bmi = healthApiService.calculateBMI(70, 170);
      
      setTestResults({
        ...testResults,
        health: {
          metrics,
          weather,
          bmi,
          status: 'success'
        }
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        health: { status: 'error', message: String(error) }
      });
    } finally {
      setLoading({ ...loading, health: false });
    }
  };

  const testPayments = async () => {
    setLoading({ ...loading, payments: true });
    
    try {
      const order = await paymentApiService.createRazorpayOrder(499, 'INR');
      const upiOptions = paymentApiService.getUPIOptions();
      
      setTestResults({
        ...testResults,
        payments: {
          order,
          upiOptions,
          status: 'success'
        }
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        payments: { status: 'error', message: String(error) }
      });
    } finally {
      setLoading({ ...loading, payments: false });
    }
  };

  const testNotifications = async () => {
    setLoading({ ...loading, notifications: true });
    
    try {
      await notificationApiService.initializeFCM();
      await notificationApiService.sendPushNotification({
        title: 'Test Notification',
        body: 'API integration test successful! 🎉',
      });
      
      setTestResults({
        ...testResults,
        notifications: { status: 'success', message: 'Notification sent!' }
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        notifications: { status: 'error', message: String(error) }
      });
    } finally {
      setLoading({ ...loading, notifications: false });
    }
  };

  const testAnalytics = async () => {
    setLoading({ ...loading, analytics: true });
    
    try {
      await analyticsApiService.initializeFirebaseAnalytics();
      await analyticsApiService.logEvent('api_test', { test: 'analytics' });
      const metrics = await analyticsApiService.getMetabaseDashboardData();
      
      setTestResults({
        ...testResults,
        analytics: { metrics, status: 'success' }
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        analytics: { status: 'error', message: String(error) }
      });
    } finally {
      setLoading({ ...loading, analytics: false });
    }
  };

  const testMedical = async () => {
    setLoading({ ...loading, medical: true });
    
    try {
      const medicines = await medicalApiService.searchMedicine('paracetamol');
      const ocrResult = await medicalApiService.extractTextFromDocument('sample_image');
      
      setTestResults({
        ...testResults,
        medical: { medicines, ocrResult, status: 'success' }
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        medical: { status: 'error', message: String(error) }
      });
    } finally {
      setLoading({ ...loading, medical: false });
    }
  };

  const testUtility = async () => {
    setLoading({ ...loading, utility: true });
    
    try {
      const location = await utilityApiService.getLocationFromIP();
      const timezone = await utilityApiService.getTimezoneInfo();
      const weather = await utilityApiService.getCurrentWeather();
      
      setTestResults({
        ...testResults,
        utility: { location, timezone, weather, status: 'success' }
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        utility: { status: 'error', message: String(error) }
      });
    } finally {
      setLoading({ ...loading, utility: false });
    }
  };

  const groupedAPIs = apiServices.reduce((acc, api) => {
    if (!acc[api.category]) acc[api.category] = [];
    acc[api.category].push(api);
    return acc;
  }, {} as { [key: string]: APIStatus[] });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-lg">
            ←
          </button>
          <div className="flex-1">
            <h1 className="font-semibold">API Integration Dashboard</h1>
            <p className="text-sm text-white/90">All APIs in Test/Demo Mode</p>
          </div>
          <Badge className="bg-yellow-400 text-yellow-900">
            SIMULATION
          </Badge>
        </div>
      </div>

      <div className="p-4 pb-20">
        {/* Status Overview */}
        <Card className="p-4 mb-4 bg-white">
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="font-medium">Integration Status</h3>
              <p className="text-sm text-gray-600">20 APIs integrated and ready for testing</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-semibold text-green-600">20</div>
              <div className="text-xs text-gray-600">Total APIs</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-semibold text-blue-600">20</div>
              <div className="text-xs text-gray-600">Simulated</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-semibold text-yellow-600">100%</div>
              <div className="text-xs text-gray-600">Ready</div>
            </div>
          </div>
        </Card>

        {/* Test Actions */}
        <Card className="p-4 mb-4">
          <h3 className="font-medium mb-3">Quick API Tests</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={testAI}
              disabled={loading.ai}
              className="bg-purple-500"
              size="sm"
            >
              {loading.ai ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              <span className="ml-2">Test AI</span>
            </Button>
            <Button 
              onClick={testHealth}
              disabled={loading.health}
              className="bg-red-500"
              size="sm"
            >
              {loading.health ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
              <span className="ml-2">Test Health</span>
            </Button>
            <Button 
              onClick={testPayments}
              disabled={loading.payments}
              className="bg-green-500"
              size="sm"
            >
              {loading.payments ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              <span className="ml-2">Test Payments</span>
            </Button>
            <Button 
              onClick={testNotifications}
              disabled={loading.notifications}
              className="bg-blue-500"
              size="sm"
            >
              {loading.notifications ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
              <span className="ml-2">Test Notifications</span>
            </Button>
            <Button 
              onClick={testAnalytics}
              disabled={loading.analytics}
              className="bg-indigo-500"
              size="sm"
            >
              {loading.analytics ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
              <span className="ml-2">Test Analytics</span>
            </Button>
            <Button 
              onClick={testMedical}
              disabled={loading.medical}
              className="bg-teal-500"
              size="sm"
            >
              {loading.medical ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pill className="w-4 h-4" />}
              <span className="ml-2">Test Medical</span>
            </Button>
          </div>
        </Card>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <Card className="p-4 mb-4 bg-green-50">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Test Results
            </h3>
            <div className="space-y-2">
              {Object.entries(testResults).map(([key, result]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <span className="capitalize">{key}</span>
                  <Badge className={result.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {result.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* API Categories */}
        <div className="space-y-4">
          {Object.entries(groupedAPIs).map(([category, apis]) => (
            <Card key={category} className="p-4">
              <h3 className="font-medium mb-3">{category}</h3>
              <div className="space-y-2">
                {apis.map((api) => {
                  const Icon = api.icon;
                  return (
                    <div key={api.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium text-sm">{api.name}</div>
                          <div className="text-xs text-gray-600">{api.description}</div>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                        Testing
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        {/* Integration Notice */}
        <Card className="p-4 mt-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Simulation Mode Active</h4>
              <p className="text-sm text-blue-700">
                All APIs are running in test/demo mode for demonstration purposes. 
                Real API integrations are configured and ready to be activated with proper API keys.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}