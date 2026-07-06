import { Home, Calendar, TrendingUp, User } from 'lucide-react';
import { Button } from './ui/button';
import type { Screen } from '../App';

interface BottomNavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function BottomNavigation({ currentScreen, onNavigate }: BottomNavigationProps) {
  const navItems = [
    {
      screen: 'home' as Screen,
      icon: Home,
      label: 'Home'
    },
    {
      screen: 'plan' as Screen,
      icon: Calendar,
      label: 'Plan'
    },
    {
      screen: 'progress' as Screen,
      icon: TrendingUp,
      label: 'Progress'
    },
    {
      screen: 'profile' as Screen,
      icon: User,
      label: 'Profile'
    }
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-sm w-full bg-white border-t border-gray-200 rounded-t-3xl shadow-lg z-50">
      <div className="grid grid-cols-4 gap-1 p-4">
        {navItems.map((item) => {
          const isActive = currentScreen === item.screen;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.screen}
              variant="ghost"
              className={`flex-col h-12 p-1 transition-colors ${
                isActive
                  ? 'text-wellness-green bg-green-50'
                  : 'text-wellness-light hover:text-wellness-green hover:bg-green-50'
              }`}
              onClick={() => onNavigate(item.screen)}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}