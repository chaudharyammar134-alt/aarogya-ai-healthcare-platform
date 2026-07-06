import { useState } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Eye, 
  EyeOff, 
  User,
  CheckCircle,
  Shield,
  Check
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import type { UserData } from '../App';
import { apiClient } from '../utils/api-client';

interface SignupScreenProps {
  onSignup: (userData: UserData) => void;
  onNavigateToLogin: () => void;
}

interface NotificationPopup {
  type: 'success';
  title: string;
  message: string;
  details: string[];
}

// Mock admin credentials for demo
const ADMIN_EMAIL = 'chaudharyammar134@gmail.com';
const ADMIN_PHONE = '+91 8286524022';

export function SignupScreen({ onSignup, onNavigateToLogin }: SignupScreenProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationPopup | null>(null);

  // Helper function to get current time
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Helper function to get device type
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

  // Simulate admin notification for new signup
  const sendSignupNotification = (userData: UserData) => {
    const signupData = {
      id: Date.now().toString(),
      success: true,
      email: userData.phone,
      time: getCurrentTime(),
      device: getDeviceType(),
      location: getCurrentLocation(),
      user: userData.name,
      type: 'signup'
    };

    // Store in localStorage for admin panel
    const existingAttempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
    existingAttempts.unshift(signupData);
    localStorage.setItem('loginAttempts', JSON.stringify(existingAttempts.slice(0, 50)));

    console.log('Signup notification sent:', signupData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { name, email, phone, password, confirmPassword } = formData;
    
    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      return 'All fields are required';
    }
    
    if (!email.includes('@')) {
      return 'Please enter a valid email address';
    }
    
    if (phone.length < 10) {
      return 'Please enter a valid phone number';
    }
    
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    
    if (!acceptedTerms) {
      return 'Please accept the terms and conditions';
    }
    
    return null;
  };

  const handleSignup = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Call the actual API
      const response = await apiClient.signup(
        formData.name,
        formData.email,
        formData.phone,
        formData.password
      );

      if (response.success && response.data) {
        const createdUser = response.data.user;

        // Create user data
        const userData: UserData = {
          id: createdUser.id,
          name: createdUser.name || formData.name,
          email: createdUser.email || formData.email,
          phone: createdUser.phone || formData.phone,
          role: createdUser.role,
          status: createdUser.status,
          age: 25, // Default values
          gender: 'female',
          language: 'english',
          weight: 60,
          height: 160,
          occupation: 'office-worker',
          wakeUpTime: '07:00',
          sleepTime: '23:00',
          activityLevel: 'moderately-active',
          goals: ['general-wellness'],
          medicalConditions: []
        };

        sendSignupNotification(userData);

        // Show success notification
        setNotification({
          type: 'success',
          title: 'Registration Successful',
          message: `Welcome to Arogya+ AI. Your account is ready in ${response.source === 'local' ? 'local fallback' : 'live backend'} mode.`,
          details: [
            `Welcome email sent to: ${createdUser.email || formData.email}`,
            `SMS confirmation sent to: ${createdUser.phone || formData.phone}`,
            `Admin notification sent to: ${ADMIN_EMAIL}`,
            `Admin SMS sent to: ${ADMIN_PHONE}`
          ]
        });

        setTimeout(() => {
          setNotification(null);
          onSignup(userData);
        }, 3000);
      } else {
        // Show error notification
        alert(response.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Unable to connect to server. Please try again.');
    }

    setIsLoading(false);
  };

  const { name, email, phone, password, confirmPassword } = formData;
  const isFormValid = name && email && phone && password && confirmPassword && acceptedTerms;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 relative">
      {/* Notification Popup */}
      {notification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-sm w-full border-green-500">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{notification.title}</h3>
              <p className="text-gray-600 mb-4">{notification.message}</p>
              <div className="text-sm p-3 rounded-lg bg-green-50">
                {notification.details.map((detail, index) => (
                  <div key={index} className="mb-1">{detail}</div>
                ))}
              </div>
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
            onClick={onNavigateToLogin}
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Arogya+ AI</h1>
            <p className="text-gray-600">Start your personalized wellness journey</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 mb-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                  className="pl-10 h-12"
                  maxLength={10}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Create Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pr-10 h-12"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-3 mb-6">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-gray-600 leading-5">
              I agree to the{' '}
              <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                Terms & Conditions
              </a>{' '}
              and{' '}
              <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Benefits Alert */}
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Join 10,000+ users</strong> on their wellness journey with personalized AI recommendations.
            </AlertDescription>
          </Alert>

          {/* Register Button */}
          <Button
            onClick={handleSignup}
            disabled={!isFormValid || isLoading}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 mb-4"
          >
            {isLoading ? 'Creating Account...' : 'Register Now'}
          </Button>

          {/* Login Link */}
          <div className="text-center">
            <span className="text-gray-600">Already have an account? </span>
            <Button
              variant="link"
              onClick={onNavigateToLogin}
              className="text-green-600 hover:text-green-700 font-medium p-0"
            >
              Sign In
            </Button>
          </div>

          {/* Security Features */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs text-gray-600">256-bit SSL</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs text-gray-600">HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
