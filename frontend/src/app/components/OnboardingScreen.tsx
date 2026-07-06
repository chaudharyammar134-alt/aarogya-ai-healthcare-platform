import { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Heart, Target, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import type { UserData } from '../types/user';

interface OnboardingScreenProps {
  initialData?: UserData | null;
  onComplete: (userData: UserData) => void;
}

export function OnboardingScreen({ initialData, onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<Partial<UserData>>(initialData || {
    language: 'english',
    goals: [],
    medicalConditions: [],
    aiPreferences: {
      preferredMealTypes: [],
      dislikedFoods: [],
      exercisePreferences: [],
      followedRecommendations: 0,
      totalRecommendations: 0
    },
    notificationPreferences: {
      waterReminders: true,
      mealReminders: true,
      exerciseReminders: true,
      medicationReminders: true
    }
  });

  const totalSteps = 5;

  const updateUserData = (field: keyof UserData, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (goal: string) => {
    const currentGoals = userData.goals || [];
    if (currentGoals.includes(goal)) {
      updateUserData('goals', currentGoals.filter(g => g !== goal));
    } else {
      updateUserData('goals', [...currentGoals, goal]);
    }
  };

  const calculateBMI = () => {
    if (userData.weight && userData.height) {
      const heightInM = userData.height / 100;
      const bmi = userData.weight / (heightInM * heightInM);
      updateUserData('bmi', Math.round(bmi * 10) / 10);
    }
  };

  const handleNext = () => {
    if (step === 3) calculateBMI();
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(userData as UserData);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return userData.name && userData.phone && userData.language;
      case 2:
        return userData.age && userData.gender;
      case 3:
        return userData.weight && userData.height;
      case 4:
        return userData.occupation && userData.wakeUpTime && userData.sleepTime && userData.activityLevel;
      case 5:
        return userData.goals && userData.goals.length > 0;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <User className="w-16 h-16 text-wellness-green mx-auto" />
              <h2 className="text-wellness-dark">Welcome to Arogya+ AI</h2>
              <p className="text-wellness-light">Let's get to know you better</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={userData.name || ''}
                  onChange={(e) => updateUserData('name', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Enter your phone number"
                  value={userData.phone || ''}
                  onChange={(e) => updateUserData('phone', e.target.value)}
                />
              </div>

              <div>
                <Label>Preferred Language</Label>
                <Select value={userData.language} onValueChange={(value) => updateUserData('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
                    <SelectItem value="regional">Regional Language</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <User className="w-16 h-16 text-wellness-green mx-auto" />
              <h2 className="text-wellness-dark">Basic Information</h2>
              <p className="text-wellness-light">This helps us personalize your health plan</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={userData.age || ''}
                  onChange={(e) => updateUserData('age', parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label>Gender</Label>
                <Select value={userData.gender} onValueChange={(value) => updateUserData('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Heart className="w-16 h-16 text-wellness-green mx-auto" />
              <h2 className="text-wellness-dark">Physical Information</h2>
              <p className="text-wellness-light">For accurate health recommendations</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Enter your weight in kg"
                  value={userData.weight || ''}
                  onChange={(e) => updateUserData('weight', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Enter your height in cm"
                  value={userData.height || ''}
                  onChange={(e) => updateUserData('height', parseFloat(e.target.value))}
                />
              </div>

              {userData.weight && userData.height && (
                <div className="p-4 bg-wellness-gray rounded-wellness">
                  <p className="text-sm text-wellness-light">
                    Your BMI will be: {((userData.weight / Math.pow(userData.height / 100, 2))).toFixed(1)}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Clock className="w-16 h-16 text-wellness-green mx-auto" />
              <h2 className="text-wellness-dark">Lifestyle Information</h2>
              <p className="text-wellness-light">Let's understand your daily routine</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Occupation</Label>
                <Select value={userData.occupation} onValueChange={(value) => updateUserData('occupation', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="office-worker">Office Worker</SelectItem>
                    <SelectItem value="manual-worker">Manual Worker</SelectItem>
                    <SelectItem value="night-shift">Night Shift Worker</SelectItem>
                    <SelectItem value="healthcare">Healthcare Professional</SelectItem>
                    <SelectItem value="homemaker">Homemaker</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wakeup">Wake Up Time</Label>
                  <Input
                    id="wakeup"
                    type="time"
                    value={userData.wakeUpTime || ''}
                    onChange={(e) => updateUserData('wakeUpTime', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="sleep">Sleep Time</Label>
                  <Input
                    id="sleep"
                    type="time"
                    value={userData.sleepTime || ''}
                    onChange={(e) => updateUserData('sleepTime', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Activity Level</Label>
                <Select value={userData.activityLevel} onValueChange={(value) => updateUserData('activityLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (Little to no exercise)</SelectItem>
                    <SelectItem value="lightly-active">Lightly Active (Light exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderately-active">Moderately Active (Moderate exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="very-active">Very Active (Hard exercise 6-7 days/week)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Target className="w-16 h-16 text-wellness-green mx-auto" />
              <h2 className="text-wellness-dark">Health Goals</h2>
              <p className="text-wellness-light">What would you like to achieve?</p>
            </div>

            <div className="space-y-3">
              {[
                'Weight Loss',
                'Weight Gain',
                'Muscle Building',
                'Better Sleep',
                'Stress Management',
                'Diabetes Management',
                'Heart Health',
                'General Fitness',
                'Mental Wellness',
                'Nutrition Improvement'
              ].map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={userData.goals?.includes(goal)}
                    onCheckedChange={() => toggleGoal(goal)}
                  />
                  <Label htmlFor={goal} className="text-sm">{goal}</Label>
                </div>
              ))}
            </div>

            {userData.goals?.includes('Weight Loss') || userData.goals?.includes('Weight Gain') ? (
              <div>
                <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  placeholder="Enter your target weight"
                  value={userData.targetWeight || ''}
                  onChange={(e) => updateUserData('targetWeight', parseFloat(e.target.value))}
                />
              </div>
            ) : null}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-wellness-light">Step {step} of {totalSteps}</span>
          <span className="text-sm text-wellness-light">{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-wellness-gray rounded-full">
          <div 
            className="h-2 wellness-green rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="flex items-center space-x-2 wellness-green text-white"
        >
          <span>{step === totalSteps ? 'Complete' : 'Next'}</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
