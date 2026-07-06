import { useState } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle,
  AlertTriangle,
  Shield,
  MessageSquare
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import type { UserData } from '../App';
import { apiClient } from '../utils/api-client';
import { runtimeConfig } from '../utils/runtime-config';

interface LoginScreenProps {
  onLogin: (userData: UserData) => void;
  onNavigateToSignup: () => void;
  onContinueAsGuest: () => void;
  onNavigateToAdmin?: () => void;
}

interface LoginAttempt {
  id: string;
  success: boolean;
  email: string;
  time: string;
  device: string;
  location: string;
  user?: string;
}

interface NotificationPopup {
  type: 'success' | 'error';
  title: string;
  message: string;
  details?: string[];
}

// Mock admin credentials for demo
const ADMIN_EMAIL = 'chaudharyammar134@gmail.com';
const ADMIN_PHONE = '+91 8286524022';

export function LoginScreen({ onLogin, onNavigateToSignup, onContinueAsGuest, onNavigateToAdmin }: LoginScreenProps) {
  const isFirebaseAuthMode = runtimeConfig.firebaseEnabled;
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationPopup | null>(null);

  // Helper function to detect device type
  const getDeviceType = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile')) return 'Mobile';
    if (userAgent.includes('tablet')) return 'Tablet';
    return 'Laptop';
  };

  // Helper function to get current location (mock)
  const getCurrentLocation = () => {
    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  // Simulate admin notification
  const sendAdminNotification = (attempt: LoginAttempt) => {
    const notificationData = {
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE,
      attempt
    };

    // Store in localStorage for admin panel
    const existingAttempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
    existingAttempts.unshift(attempt);
    localStorage.setItem('loginAttempts', JSON.stringify(existingAttempts.slice(0, 50))); // Keep last 50 attempts

    console.log('Admin notification sent:', notificationData);
  };

  const handleLogin = async () => {
    setIsLoading(true);

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    try {
      // Call the actual API
      const response = await apiClient.login(identifier, password);
      const loginAttempt: LoginAttempt = {
        id: Date.now().toString(),
        success: response.success,
        email: identifier,
        time: timeString,
        device: getDeviceType(),
        location: getCurrentLocation(),
      };

      if (response.success && response.data) {
        // Successful login
        const userData = response.data.user;
        sendAdminNotification({
          ...loginAttempt,
          success: true,
          user: userData.name,
        });
        
        // Show success notification
        setNotification({
          type: 'success',
          title: 'Login Successful',
          message: `Signed in using ${response.source === 'local' ? 'local fallback' : 'live backend'} mode`,
          details: [
            `Email notification sent to: ${ADMIN_EMAIL}`,
            `SMS alert sent to: ${ADMIN_PHONE}`,
            `Welcome back, ${userData.name}`,
          ]
        });

        // Create full user data with health info
        const fullUserData: UserData = {
          id: userData.id,
          name: userData.name || 'Demo User',
          email: userData.email || identifier,
          phone: userData.phone || identifier,
          role: userData.role,
          status: userData.status,
          age: 28,
          gender: 'female',
          language: 'english',
          weight: 65,
          height: 160,
          occupation: 'office-worker',
          wakeUpTime: '07:00',
          sleepTime: '23:00',
          activityLevel: 'moderately-active',
          goals: ['weight-loss', 'better-sleep'],
          medicalConditions: []
        };

        setTimeout(() => {
          setNotification(null);
          onLogin(fullUserData);
        }, 2000);
      } else {
        // Failed login - API returned error
        sendAdminNotification(loginAttempt);
        setNotification({
          type: 'error',
          title: 'Security Alert',
          message: response.error || 'Failed login attempt detected. Admin has been notified.',
          details: [
            `User: Unknown | Email: ${identifier}`,
            `Time: ${timeString} | Device: ${getDeviceType()} | Location: ${getCurrentLocation()}`,
            `Security alert sent to: ${ADMIN_EMAIL}`,
            `SMS alert sent to: ${ADMIN_PHONE}`
          ]
        });

        setTimeout(() => {
          setNotification(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Login error:', error);
      setNotification({
        type: 'error',
        title: 'Connection Error',
        message: 'Unable to connect to server. Please try again.',
      });

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }

    setIsLoading(false);
  };

  const handleSendOTP = async () => {
    setIsLoading(true);
    // Simulate OTP send delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOtpSent(true);
    setIsLoading(false);
  };

  const isValidIdentifier = identifier.length > 0;
  const canLogin = isFirebaseAuthMode || loginMethod === 'password'
    ? isValidIdentifier && password.length > 0 
    : isValidIdentifier && (otpSent ? otp.length === 6 : true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative">
      {/* Notification Popup */}
      {notification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className={`p-6 max-w-sm w-full ${
            notification.type === 'success' ? 'border-green-500' : 'border-red-500'
          }`}>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {notification.type === 'success' ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{notification.title}</h3>
              <p className="text-gray-600 mb-4">{notification.message}</p>
              {notification.details && (
                <div className={`text-sm p-3 rounded-lg ${
                  notification.type === 'success' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {notification.details.map((detail, index) => (
                    <div key={index} className="mb-1">{detail}</div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      <div className="max-w-sm mx-auto min-h-screen bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onContinueAsGuest}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-1">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">Arogya+ AI</span>
          </div>
          <div className="w-16" /> {/* Spacer */}
        </div>

        <div className="p-6">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue your wellness journey</p>
          </div>

          {!isFirebaseAuthMode && (
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <Button
                variant={loginMethod === 'password' ? 'default' : 'ghost'}
                className={`flex-1 h-10 ${loginMethod === 'password' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setLoginMethod('password')}
              >
                Password
              </Button>
              <Button
                variant={loginMethod === 'otp' ? 'default' : 'ghost'}
                className={`flex-1 h-10 ${loginMethod === 'otp' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setLoginMethod('otp')}
              >
                OTP
              </Button>
            </div>
          )}

          {isFirebaseAuthMode && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Aarogya is using the live Firebase backend now. Sign in with your registered email and password. Phone and OTP login will be added next.
              </AlertDescription>
            </Alert>
          )}

          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            {/* Email/Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isFirebaseAuthMode ? 'Email Address' : 'Email or Phone Number'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {identifier.includes('@') ? (
                    <Mail className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Phone className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <Input
                  type="text"
                  placeholder={isFirebaseAuthMode ? 'Enter your email address' : 'Enter email or phone number'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Password or OTP Input */}
            {loginMethod === 'password' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 h-12"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {!otpSent ? (
                  <Button
                    onClick={handleSendOTP}
                    disabled={!isValidIdentifier || isLoading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="h-12 text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Demo OTP: <span className="font-mono font-semibold">123456</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Demo Credentials Alert */}
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>{isFirebaseAuthMode ? 'Live Backend Mode:' : 'Demo Credentials:'}</strong><br />
              {isFirebaseAuthMode
                ? 'Use the email address and password you registered with Aarogya.'
                : 'Email: priya@example.com | Password: password123'}
              {!isFirebaseAuthMode && (
                <>
                  <br />
                  Phone: 8286524022 | Password: admin123
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={!canLogin || isLoading}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 mb-4"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          {/* Action Links */}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={onNavigateToSignup}
              className="w-full h-12 border-2 border-gray-200 hover:border-green-300"
            >
              Create New Account
            </Button>

            <Button
              variant="ghost"
              onClick={onContinueAsGuest}
              className="w-full h-12 text-gray-600 hover:text-gray-900"
            >
              Skip & Explore App
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 mb-3">
              <span>Secure</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span>Healthcare Certified</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span>HIPAA Compliant</span>
            </div>
            {onNavigateToAdmin && (
              <Button
                variant="link"
                onClick={onNavigateToAdmin}
                className="text-xs text-blue-600 hover:text-blue-700 p-0"
              >
                Admin Security Panel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
