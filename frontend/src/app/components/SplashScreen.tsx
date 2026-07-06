import { useEffect } from 'react';
import { Heart } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">
      <div className="flex flex-col items-center space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl wellness-green">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-wellness-dark">Arogya+</h1>
            <p className="text-sm text-wellness-green font-medium">AI Health Companion</p>
          </div>
        </div>

        {/* Tagline */}
        <div className="text-center space-y-2">
          <p className="text-lg text-wellness-dark font-medium">
            Your Wellness Journey Starts Here
          </p>
          <p className="text-sm text-wellness-light">
            आपका स्वास्थ्य, हमारी प्राथमिकता
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex space-x-1 mt-8">
          <div className="w-2 h-2 rounded-full wellness-green animate-pulse"></div>
          <div 
            className="w-2 h-2 rounded-full wellness-green animate-pulse" 
            style={{ animationDelay: '0.2s' } as React.CSSProperties}
          ></div>
          <div 
            className="w-2 h-2 rounded-full wellness-green animate-pulse" 
            style={{ animationDelay: '0.4s' } as React.CSSProperties}
          ></div>
        </div>
      </div>
    </div>
  );
}