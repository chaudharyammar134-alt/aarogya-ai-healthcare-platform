import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AdminNotificationScreenProps {
  onBack: () => void;
}

interface LoginAttempt {
  id: string;
  success: boolean;
  email: string;
  time: string;
  device: string;
  location: string;
  user?: string;
  type?: string;
}

export function AdminNotificationScreen({ onBack }: AdminNotificationScreenProps) {
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load attempts from localStorage
  useEffect(() => {
    const loadAttempts = () => {
      const storedAttempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
      
      // Add some sample data if empty
      if (storedAttempts.length === 0) {
        const sampleAttempts: LoginAttempt[] = [
          {
            id: '1',
            success: true,
            email: 'priya@example.com',
            time: '9:10 AM',
            device: 'Mobile',
            location: 'Mumbai',
            user: 'Priya Sharma',
            type: 'login'
          },
          {
            id: '2',
            success: false,
            email: 'fakeuser@gmail.com',
            time: '9:05 AM',
            device: 'Mobile',
            location: 'Mumbai',
            type: 'login'
          },
          {
            id: '3',
            success: true,
            email: '9876543210',
            time: '8:45 AM',
            device: 'Laptop',
            location: 'Delhi',
            user: 'Ramesh Kumar',
            type: 'signup'
          },
          {
            id: '4',
            success: false,
            email: 'hacker@fake.com',
            time: '8:30 AM',
            device: 'Mobile',
            location: 'Unknown',
            type: 'login'
          },
          {
            id: '5',
            success: true,
            email: 'admin@arogya.com',
            time: '8:15 AM',
            device: 'Laptop',
            location: 'Bangalore',
            user: 'Admin User',
            type: 'login'
          }
        ];
        setAttempts(sampleAttempts);
        localStorage.setItem('loginAttempts', JSON.stringify(sampleAttempts));
      } else {
        setAttempts(storedAttempts);
      }
    };

    loadAttempts();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const storedAttempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
    setAttempts(storedAttempts);
    setIsRefreshing(false);
  };

  const filteredAttempts = attempts.filter(attempt => {
    if (filter === 'all') return true;
    if (filter === 'success') return attempt.success;
    if (filter === 'failed') return !attempt.success;
    return true;
  });

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const successCount = attempts.filter(a => a.success).length;
  const failedCount = attempts.filter(a => !a.success).length;
  const signupCount = attempts.filter(a => a.type === 'signup').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-sm mx-auto min-h-screen bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold">Admin Panel</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-white hover:bg-white/20"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="p-6">
          {/* Admin Contact Info */}
          <Card className="p-4 mb-6 border-2 border-blue-200 bg-blue-50">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-3">Security Alerts Sent To:</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2 text-blue-700">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-mono">chaudharyammar134@gmail.com</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-blue-700">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-mono">+91 8286524022</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="p-3 bg-green-50 border-green-200">
              <div className="text-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="text-lg font-bold text-green-600">{successCount}</div>
                <div className="text-xs text-green-700">Successful</div>
              </div>
            </Card>
            
            <Card className="p-3 bg-red-50 border-red-200">
              <div className="text-center">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <XCircle className="w-4 h-4 text-white" />
                </div>
                <div className="text-lg font-bold text-red-600">{failedCount}</div>
                <div className="text-xs text-red-700">Failed</div>
              </div>
            </Card>
            
            <Card className="p-3 bg-blue-50 border-blue-200">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-lg font-bold text-blue-600">{signupCount}</div>
                <div className="text-xs text-blue-700">Signups</div>
              </div>
            </Card>
          </div>

          {/* Filter and Export */}
          <div className="flex items-center justify-between mb-4">
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Activity Log */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Login Activity Log</h3>
            
            {filteredAttempts.length === 0 ? (
              <Card className="p-6 text-center">
                <div className="text-gray-500">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No activities found
                </div>
              </Card>
            ) : (
              filteredAttempts.map((attempt) => (
                <Card 
                  key={attempt.id} 
                  className={`p-4 border-l-4 ${
                    attempt.success 
                      ? 'border-l-green-500 bg-green-50' 
                      : 'border-l-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {attempt.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className={`font-medium ${
                          attempt.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {attempt.success ? 'Successful' : 'Failed'} {attempt.type || 'Login'}
                        </span>
                        {attempt.type === 'signup' && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            New User
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>
                            {attempt.user ? (
                              <span className="font-medium">{attempt.user}</span>
                            ) : (
                              <span className="text-gray-500">Unknown User</span>
                            )}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span className="font-mono text-xs">{attempt.email}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{attempt.time}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              {getDeviceIcon(attempt.device)}
                              <span>{attempt.device}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{attempt.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {!attempt.success && (
                      <div className="ml-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Security Notice */}
          <Card className="mt-6 p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">Security Notice</h4>
                <p className="text-sm text-yellow-700">
                  All login attempts are monitored and logged. Failed attempts trigger immediate 
                  email and SMS alerts to the admin team.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}