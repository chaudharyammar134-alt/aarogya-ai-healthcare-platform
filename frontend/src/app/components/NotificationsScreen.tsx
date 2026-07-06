import { useState } from 'react';
import { 
  ArrowLeft, 
  Bell, 
  Droplets, 
  Coffee, 
  Footprints, 
  Apple, 
  Moon, 
  Sun,
  Target,
  Heart,
  Brain,
  Clock,
  Settings,
  Check,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';

interface NotificationsScreenProps {
  onBack: () => void;
}

const notifications = [
  {
    id: 1,
    type: 'hydration',
    title: 'Time to hydrate! 💧',
    message: 'You haven\'t had water in 2 hours. Drink a glass now to stay energized!',
    time: '2 mins ago',
    icon: Droplets,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    priority: 'high',
    actionRequired: true
  },
  {
    id: 2,
    type: 'posture',
    title: 'Posture check! 🧘‍♂️',
    message: 'You\'ve been sitting for 45 mins. Stand up and do some neck rolls.',
    time: '15 mins ago',
    icon: Target,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    priority: 'medium',
    actionRequired: true
  },
  {
    id: 3,
    type: 'achievement',
    title: 'Great job! 🎉',
    message: 'You completed your morning yoga routine. You\'re building a healthy habit!',
    time: '2 hours ago',
    icon: Heart,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    priority: 'low',
    actionRequired: false
  },
  {
    id: 4,
    type: 'nutrition',
    title: 'Protein boost needed 🥛',
    message: 'Add some paneer or dal to your lunch for better muscle health.',
    time: '3 hours ago',
    icon: Apple,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    priority: 'medium',
    actionRequired: false
  },
  {
    id: 5,
    type: 'walking',
    title: 'Walking reminder 🚶‍♀️',
    message: 'Perfect weather for a walk! 15 minutes outside will boost your mood.',
    time: '4 hours ago',
    icon: Footprints,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    priority: 'medium',
    actionRequired: true
  },
  {
    id: 6,
    type: 'sleep',
    title: 'Wind down time 🌙',
    message: 'Start your bedtime routine in 30 minutes for better sleep quality.',
    time: 'Yesterday',
    icon: Moon,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    priority: 'low',
    actionRequired: false
  },
  {
    id: 7,
    type: 'ai_insight',
    title: 'Weekly insight 🤖',
    message: 'Your sleep pattern improved by 20% this week. Keep up the good work!',
    time: 'Yesterday',
    icon: Brain,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    priority: 'low',
    actionRequired: false
  }
];

const notificationSettings = [
  {
    category: 'Hydration Reminders',
    description: 'Get notified to drink water regularly',
    enabled: true,
    icon: Droplets,
    color: 'text-blue-500'
  },
  {
    category: 'Posture Checks',
    description: 'Reminders to maintain good posture',
    enabled: true,
    icon: Target,
    color: 'text-purple-500'
  },
  {
    category: 'Walking Breaks',
    description: 'Nudges to take walking breaks',
    enabled: true,
    icon: Footprints,
    color: 'text-green-500'
  },
  {
    category: 'Meal Reminders',
    description: 'Notifications for healthy eating',
    enabled: false,
    icon: Apple,
    color: 'text-orange-500'
  },
  {
    category: 'Sleep Schedule',
    description: 'Bedtime and wake up reminders',
    enabled: true,
    icon: Moon,
    color: 'text-indigo-500'
  },
  {
    category: 'AI Insights',
    description: 'Personalized health insights and tips',
    enabled: true,
    icon: Brain,
    color: 'text-pink-500'
  }
];

export function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const [settings, setSettings] = useState(notificationSettings);

  const handleMarkAsRead = (notificationId: number) => {
    console.log('Mark as read:', notificationId);
  };

  const handleDismiss = (notificationId: number) => {
    console.log('Dismiss:', notificationId);
  };

  const handleAction = (notificationId: number, action: string) => {
    console.log('Action:', action, 'for notification:', notificationId);
  };

  const toggleSetting = (index: number) => {
    const updatedSettings = [...settings];
    updatedSettings[index].enabled = !updatedSettings[index].enabled;
    setSettings(updatedSettings);
  };

  const unreadCount = notifications.filter(n => n.actionRequired).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-wellness-dark text-xl">Notifications</h1>
            {activeTab === 'notifications' && unreadCount > 0 && (
              <p className="text-sm text-wellness-light">{unreadCount} requiring action</p>
            )}
          </div>
          <div className="relative">
            <Bell className="w-6 h-6 text-wellness-light" />
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">{unreadCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 rounded-lg ${
              activeTab === 'notifications' ? 'bg-white shadow-sm wellness-green text-white' : ''
            }`}
          >
            Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs">{unreadCount}</Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 rounded-lg ${
              activeTab === 'settings' ? 'bg-white shadow-sm wellness-green text-white' : ''
            }`}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {activeTab === 'notifications' && (
        <div className="px-6 py-6">
          {notifications.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-wellness-dark mb-2">All caught up!</h3>
              <p className="text-wellness-light text-sm">No new notifications at the moment.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`p-4 ${
                    notification.actionRequired ? 'ring-2 ring-wellness-green ring-opacity-20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full ${notification.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <notification.icon className={`w-5 h-5 ${notification.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-wellness-dark text-sm">{notification.title}</h3>
                        <div className="flex items-center space-x-1">
                          {notification.priority === 'high' && (
                            <Badge className="bg-red-100 text-red-800 text-xs">Urgent</Badge>
                          )}
                          <span className="text-xs text-wellness-light whitespace-nowrap">{notification.time}</span>
                        </div>
                      </div>
                      
                      <p className="text-wellness-light text-sm leading-relaxed mb-3">
                        {notification.message}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        {notification.actionRequired && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAction(notification.id, 'complete')}
                              className="wellness-green text-white text-xs px-3 py-1"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Done
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(notification.id, 'snooze')}
                              className="text-xs px-3 py-1 border-wellness-green text-wellness-green"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Remind me later
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDismiss(notification.id)}
                          className="text-xs text-wellness-light hover:text-wellness-dark"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="px-6 py-6">
          <div className="space-y-6">
            <Card className="p-4">
              <h3 className="font-semibold text-wellness-dark mb-4">Notification Categories</h3>
              <div className="space-y-4">
                {settings.map((setting, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <setting.icon className={`w-4 h-4 ${setting.color}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-wellness-dark text-sm">{setting.category}</h4>
                        <p className="text-wellness-light text-xs">{setting.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={() => toggleSetting(index)}
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-wellness-dark mb-4">Quiet Hours</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-wellness-dark text-sm">Enable Quiet Hours</h4>
                    <p className="text-wellness-light text-xs">Pause non-urgent notifications during set hours</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-wellness-dark mb-2">Start Time</label>
                    <input 
                      type="time" 
                      defaultValue="22:00"
                      className="w-full p-2 border border-gray-200 rounded-lg focus:border-wellness-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wellness-dark mb-2">End Time</label>
                    <input 
                      type="time" 
                      defaultValue="07:00"
                      className="w-full p-2 border border-gray-200 rounded-lg focus:border-wellness-green"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-wellness-dark mb-4">AI Personalization</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-wellness-dark text-sm">Smart Timing</h4>
                    <p className="text-wellness-light text-xs">AI learns your routine to send better-timed reminders</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-wellness-dark text-sm">Personalized Messages</h4>
                    <p className="text-wellness-light text-xs">Customize notification tone based on your preferences</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}