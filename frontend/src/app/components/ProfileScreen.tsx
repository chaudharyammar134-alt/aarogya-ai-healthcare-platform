import { 
  ArrowLeft, 
  User, 
  Phone, 
  Calendar, 
  CreditCard, 
  Bell, 
  Globe, 
  HelpCircle, 
  LogOut, 
  Crown, 
  Heart,
  Edit,
  Download,
  Share,
  Settings,
  Shield,
  FileText,
  Activity,
  Clock,
  MapPin,
  Camera
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { BottomNavigation } from './BottomNavigation';
import type { Screen, UserData } from '../App';

interface ProfileScreenProps {
  user: UserData | null;
  onNavigate: (screen: Screen) => void;
}

const healthStats = [
  { label: 'Consultations', value: '15', icon: Activity, color: 'text-blue-600' },
  { label: 'Health Score', value: '87', icon: Heart, color: 'text-green-600' },
  { label: 'Days Active', value: '45', icon: Clock, color: 'text-purple-600' }
];

const menuSections = [
  {
    title: 'Health & Wellness',
    items: [
      { id: 'health_profile', icon: User, title: 'Health Profile', subtitle: 'Medical history & reports' },
      { id: 'prescriptions', icon: FileText, title: 'Prescriptions', subtitle: 'Digital prescriptions & medicines' },
      { id: 'reports', icon: Download, title: 'Lab Reports', subtitle: 'Test results & health reports' },
      { id: 'family', icon: Heart, title: 'Family Members', subtitle: 'Manage family health profiles' }
    ]
  },
  {
    title: 'Account & Settings',
    items: [
      { id: 'subscription', icon: Crown, title: 'Subscription', subtitle: 'Manage your Arogya+ plan' },
      { id: 'notifications', icon: Bell, title: 'Notifications', subtitle: 'Health reminders & alerts' },
      { id: 'privacy', icon: Shield, title: 'Privacy & Security', subtitle: 'Data protection settings' },
      { id: 'language', icon: Globe, title: 'Language', subtitle: 'Hindi • हिंदी' }
    ]
  },
  {
    title: 'Support & Legal',
    items: [
      { id: 'help', icon: HelpCircle, title: 'Help Center', subtitle: '24/7 customer support' },
      { id: 'share', icon: Share, title: 'Refer & Earn', subtitle: 'Invite friends and family' },
      { id: 'terms', icon: FileText, title: 'Terms & Privacy', subtitle: 'Legal documents' }
    ]
  }
];

const recentActivity = [
  { type: 'consultation', title: 'Video call with Dr. Sharma', time: '2 hours ago' },
  { type: 'prescription', title: 'Prescription downloaded', time: '1 day ago' },
  { type: 'report', title: 'Blood test report uploaded', time: '3 days ago' }
];

export function ProfileScreen({ user, onNavigate }: ProfileScreenProps) {
  const handleMenuClick = (itemId: string) => {
    switch (itemId) {
      case 'subscription':
        onNavigate('membership');
        break;
      case 'health_profile':
        alert('Opening health profile...');
        break;
      case 'prescriptions':
        alert('Opening prescriptions...');
        break;
      case 'reports':
        alert('Opening lab reports...');
        break;
      case 'notifications':
        alert('Opening notification settings...');
        break;
      case 'privacy':
        alert('Opening privacy settings...');
        break;
      case 'language':
        alert('Opening language selection...');
        break;
      case 'help':
        alert('Opening help center...');
        break;
      case 'share':
        alert('Opening referral program...');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      alert('Logged out successfully');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('home')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold text-gray-900">Profile</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* User Profile Card */}
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xl">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'G'}
                </span>
              </div>
              <Button size="sm" className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full p-0 bg-white border-2 border-gray-200">
                <Camera className="w-3 h-3 text-gray-600" />
              </Button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user?.name || 'Guest User'}
                  </h2>
                  {user?.phone && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">+91 {user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Mumbai, Maharashtra</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
              
              {user && user.subscription && (
                <div className="mt-4">
                  <Badge className="bg-green-100 text-green-800">
                    <Crown className="w-3 h-3 mr-1" />
                    Arogya+ {user.subscription.planName}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Health Stats */}
          {user && (
            <>
              <Separator className="my-4" />
              <div className="grid grid-cols-3 gap-4">
                {healthStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Subscription Card */}
        {user && user.subscription ? (
          <Card className="p-4 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {user.subscription.planName} Active
                  </h3>
                  <p className="text-sm text-gray-600">
                    Renews on {new Date(user.subscription.renewalDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">₹{user.subscription.price}</p>
                <p className="text-xs text-gray-600 capitalize">per {user.subscription.planName === 'Family' ? 'month (6 members)' : 'month'}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-semibold text-gray-900">
                    {user.subscription.planName === 'Basic' ? '5' : 
                     user.subscription.planName === 'Standard' ? '15' : 'Unlimited'}
                  </p>
                  <p className="text-xs text-gray-600">AI Consultations</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    ₹{Math.round(user.subscription.price * 0.3)}
                  </p>
                  <p className="text-xs text-gray-600">Saved This Month</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {user.subscription.planName === 'Basic' ? '5%' : 
                     user.subscription.planName === 'Standard' ? '15%' : 
                     user.subscription.planName === 'Premium' ? '25%' : '30%'}
                  </p>
                  <p className="text-xs text-gray-600">Health Discount</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onNavigate('membership')}
                className="w-full border-green-200 text-green-700 hover:bg-green-50"
              >
                Manage Subscription
              </Button>
            </div>
          </Card>
        ) : user ? (
          <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Unlock Premium Features</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get personalized AI health recommendations, unlimited consultations, and family health management.
              </p>
              <Button 
                onClick={() => onNavigate('membership')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                Upgrade Now
              </Button>
            </div>
          </Card>
        ) : null}

        {/* Recent Activity */}
        {user && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 py-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="font-medium text-gray-900 mb-3 px-1">{section.title}</h3>
            <Card className="divide-y divide-gray-100">
              {section.items.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className="w-full p-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{item.subtitle}</p>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-600 text-sm">›</span>
                  </div>
                </button>
              ))}
            </Card>
          </div>
        ))}

        {/* Emergency Support */}
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="text-center">
            <h4 className="font-semibold text-red-800 mb-2">24/7 Emergency Support</h4>
            <p className="text-sm text-red-700 mb-4">
              Get immediate medical help in emergency situations
            </p>
            <Button className="bg-red-600 hover:bg-red-700 text-white w-full">
              <Phone className="w-4 h-4 mr-2" />
              Call Emergency Helpline
            </Button>
          </div>
        </Card>

        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">Arogya+ v2.1.0</p>
          <p className="text-xs text-gray-400 mt-1">AI-Powered Healthcare for Everyone</p>
        </div>

        {/* Logout */}
        {user && (
          <div className="pb-4">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}