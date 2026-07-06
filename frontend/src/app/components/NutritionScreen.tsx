import { useState } from 'react';
import { Search, Apple, ChevronLeft, Camera, Utensils, TrendingUp, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { UserData } from '../App';

interface NutritionScreenProps {
  user: UserData | null;
  onBack: () => void;
}

interface FoodItem {
  name: string;
  nameHindi: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  image: string;
  servingSize: string;
  healthBenefits: string[];
  restrictions?: string[];
}

interface MealPlan {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  foods: FoodItem[];
  totalCalories: number;
  description: string;
}

export function NutritionScreen({ user, onBack }: NutritionScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'search' | 'plan' | 'track'>('plan');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // Mock Indian food database
  const indianFoods: FoodItem[] = [
    {
      name: 'Dal Chawal',
      nameHindi: 'दाल चावल',
      category: 'Main Course',
      calories: 320,
      protein: 12,
      carbs: 58,
      fat: 4,
      fiber: 8,
      image: '🍛',
      servingSize: '1 bowl (200g)',
      healthBenefits: ['Complete protein', 'Rich in fiber', 'Good for digestion'],
      restrictions: []
    },
    {
      name: 'Roti with Sabzi',
      nameHindi: 'रोटी सब्जी',
      category: 'Main Course',
      calories: 280,
      protein: 10,
      carbs: 52,
      fat: 3,
      fiber: 6,
      image: '🫓',
      servingSize: '2 roti + 1 bowl sabzi',
      healthBenefits: ['Whole grains', 'Vitamins from vegetables', 'Balanced meal'],
      restrictions: ['Gluten']
    },
    {
      name: 'Idli Sambar',
      nameHindi: 'इडली सांबर',
      category: 'Breakfast',
      calories: 250,
      protein: 8,
      carbs: 45,
      fat: 2,
      fiber: 5,
      image: '🍜',
      servingSize: '3 idli + sambar',
      healthBenefits: ['Probiotic', 'Easy to digest', 'Low fat'],
      restrictions: []
    },
    {
      name: 'Paneer Curry',
      nameHindi: 'पनीर करी',
      category: 'Main Course',
      calories: 380,
      protein: 18,
      carbs: 12,
      fat: 28,
      fiber: 3,
      image: '🧀',
      servingSize: '1 bowl (150g)',
      healthBenefits: ['High protein', 'Calcium rich', 'Good for bones'],
      restrictions: ['Dairy']
    },
    {
      name: 'Upma',
      nameHindi: 'उपमा',
      category: 'Breakfast',
      calories: 200,
      protein: 6,
      carbs: 35,
      fat: 4,
      fiber: 4,
      image: '🌾',
      servingSize: '1 bowl (150g)',
      healthBenefits: ['Quick energy', 'Rich in fiber', 'Easy to digest'],
      restrictions: ['Gluten']
    },
    {
      name: 'Mixed Vegetable Curry',
      nameHindi: 'मिक्स सब्जी',
      category: 'Main Course',
      calories: 180,
      protein: 5,
      carbs: 25,
      fat: 6,
      fiber: 8,
      image: '🥬',
      servingSize: '1 bowl (200g)',
      healthBenefits: ['Rich in vitamins', 'Antioxidants', 'Low calorie'],
      restrictions: []
    }
  ];

  // AI-generated meal plan based on user data
  const generateMealPlan = (): MealPlan[] => {
    const plans: MealPlan[] = [
      {
        mealType: 'breakfast',
        time: '8:00 AM',
        foods: [indianFoods[2]], // Idli Sambar
        totalCalories: 250,
        description: 'Light, easy to digest breakfast to start your day'
      },
      {
        mealType: 'lunch',
        time: '1:00 PM',
        foods: [indianFoods[0], indianFoods[5]], // Dal Chawal + Mixed Veg
        totalCalories: 500,
        description: 'Complete protein and fiber rich lunch'
      },
      {
        mealType: 'snack',
        time: '5:00 PM',
        foods: [],
        totalCalories: 150,
        description: 'Green tea with 2 digestive biscuits'
      },
      {
        mealType: 'dinner',
        time: '8:00 PM',
        foods: [indianFoods[1]], // Roti with Sabzi
        totalCalories: 280,
        description: 'Light dinner for better sleep'
      }
    ];

    // Adjust based on user's medical conditions
    if (user?.medicalConditions.some(c => c.name.includes('Diabetes'))) {
      plans.forEach(plan => {
        plan.description += ' (Low GI foods recommended for diabetes)';
      });
    }

    if (user?.medicalConditions.some(c => c.name.includes('Blood Pressure'))) {
      plans.forEach(plan => {
        plan.description += ' (Low sodium preparation)';
      });
    }

    return plans;
  };

  const mealPlan = generateMealPlan();
  const totalDayCalories = mealPlan.reduce((sum, meal) => sum + meal.totalCalories, 0);

  const filteredFoods = indianFoods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    food.nameHindi.includes(searchQuery) ||
    food.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSearchTab = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-wellness-light" />
        <Input
          placeholder="Search Indian foods..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredFoods.map((food, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 rounded-wellness cursor-pointer hover:shadow-wellness transition-shadow"
            onClick={() => setSelectedFood(food)}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{food.image}</span>
              <div className="flex-1">
                <h4 className="text-wellness-dark font-medium">{food.name}</h4>
                <p className="text-sm text-wellness-light">{food.nameHindi}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-wellness-green">{food.calories} cal</span>
                  <span className="text-xs text-wellness-light">P: {food.protein}g</span>
                  <span className="text-xs text-wellness-light">C: {food.carbs}g</span>
                  <span className="text-xs text-wellness-light">F: {food.fat}g</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlanTab = () => (
    <div className="space-y-6">
      {/* Daily Summary */}
      <div className="p-4 bg-wellness-gray rounded-wellness">
        <h3 className="text-wellness-dark font-medium mb-2">Today's Plan</h3>
        <div className="flex justify-between items-center">
          <span className="text-sm text-wellness-light">Total Calories</span>
          <span className="text-wellness-green font-medium">{totalDayCalories} cal</span>
        </div>
        {user?.medicalConditions.length ? (
          <p className="text-xs text-wellness-light mt-2">
            ⚡ Adjusted for your health conditions
          </p>
        ) : null}
      </div>

      {/* Meal Plans */}
      {mealPlan.map((meal, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-wellness">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Utensils className="w-4 h-4 text-wellness-green" />
              <h4 className="text-wellness-dark font-medium capitalize">{meal.mealType}</h4>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 text-wellness-light" />
              <span className="text-sm text-wellness-light">{meal.time}</span>
            </div>
          </div>

          <p className="text-sm text-wellness-light mb-3">{meal.description}</p>

          {meal.foods.length > 0 ? (
            <div className="space-y-2">
              {meal.foods.map((food, foodIndex) => (
                <div key={foodIndex} className="flex items-center justify-between p-2 bg-wellness-gray rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span>{food.image}</span>
                    <div>
                      <span className="text-sm text-wellness-dark">{food.name}</span>
                      <p className="text-xs text-wellness-light">{food.servingSize}</p>
                    </div>
                  </div>
                  <span className="text-sm text-wellness-green">{food.calories} cal</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-wellness-yellow bg-opacity-20 rounded-lg">
              <p className="text-sm text-wellness-dark">Green tea with 2 digestive biscuits</p>
            </div>
          )}

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm text-wellness-light">Meal Total</span>
            <span className="text-wellness-green font-medium">{meal.totalCalories} cal</span>
          </div>
        </div>
      ))}

      {/* AI Suggestions */}
      <div className="p-4 bg-gradient-wellness text-white rounded-wellness">
        <h4 className="font-medium mb-2">🤖 AI Nutrition Tip</h4>
        <p className="text-sm">
          {user?.medicalConditions.some(c => c.name.includes('Diabetes'))
            ? 'Include more fiber-rich foods and avoid refined sugars. Your meal plan is optimized for blood sugar control.'
            : user?.goals?.includes('Weight Loss')
            ? 'Your calorie intake is set for gradual weight loss. Drink water before meals to feel fuller.'
            : 'Your balanced meal plan provides all essential nutrients. Consider adding seasonal fruits as snacks.'}
        </p>
      </div>
    </div>
  );

  const renderTrackTab = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <Camera className="w-16 h-16 text-wellness-green mx-auto" />
        <h3 className="text-wellness-dark">Food Tracking</h3>
        <p className="text-wellness-light text-sm">
          Take a photo of your meal for instant nutrition analysis
        </p>
        <Button className="wellness-green text-white">
          <Camera className="w-4 h-4 mr-2" />
          Scan Your Meal
        </Button>
      </div>

      <div className="space-y-4">
        <h4 className="text-wellness-dark">Recent Meals</h4>
        <div className="space-y-3">
          {['Breakfast: Idli Sambar', 'Lunch: Dal Chawal', 'Snack: Tea & Biscuits'].map((meal, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-wellness-gray rounded-lg">
              <span className="text-wellness-dark">{meal}</span>
              <Badge variant="secondary">Tracked</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-wellness">
        <h4 className="text-wellness-dark font-medium mb-3">Progress This Week</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-wellness-light">Calories</span>
            <span className="text-sm text-wellness-green">1,850 / 2,000</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="w-4/5 h-2 wellness-green rounded-full" />
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-wellness-light">Protein</span>
            <span className="text-sm text-wellness-green">65g / 60g</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="w-full h-2 wellness-green rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );

  if (selectedFood) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <Button variant="ghost" onClick={() => setSelectedFood(null)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-wellness-dark font-medium">Food Details</h2>
          <div />
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-6xl">{selectedFood.image}</span>
            <h3 className="text-wellness-dark">{selectedFood.name}</h3>
            <p className="text-wellness-light">{selectedFood.nameHindi}</p>
            <Badge variant="secondary">{selectedFood.category}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-wellness-gray rounded-wellness text-center">
              <p className="text-2xl font-medium text-wellness-green">{selectedFood.calories}</p>
              <p className="text-sm text-wellness-light">Calories</p>
            </div>
            <div className="p-4 bg-wellness-gray rounded-wellness text-center">
              <p className="text-2xl font-medium text-wellness-green">{selectedFood.protein}g</p>
              <p className="text-sm text-wellness-light">Protein</p>
            </div>
            <div className="p-4 bg-wellness-gray rounded-wellness text-center">
              <p className="text-2xl font-medium text-wellness-green">{selectedFood.carbs}g</p>
              <p className="text-sm text-wellness-light">Carbs</p>
            </div>
            <div className="p-4 bg-wellness-gray rounded-wellness text-center">
              <p className="text-2xl font-medium text-wellness-green">{selectedFood.fat}g</p>
              <p className="text-sm text-wellness-light">Fat</p>
            </div>
          </div>

          <div>
            <h4 className="text-wellness-dark font-medium mb-2">Health Benefits</h4>
            <div className="flex flex-wrap gap-2">
              {selectedFood.healthBenefits.map((benefit, index) => (
                <Badge key={index} variant="outline" className="border-wellness-green text-wellness-green">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>

          <div className="p-4 bg-wellness-gray rounded-wellness">
            <p className="text-sm text-wellness-light">
              <strong>Serving Size:</strong> {selectedFood.servingSize}
            </p>
          </div>

          <Button className="w-full wellness-green text-white">
            Add to Today's Plan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-wellness-dark font-medium">Nutrition Hub</h2>
        <div />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {[
          { key: 'plan', label: 'AI Plan', icon: TrendingUp },
          { key: 'search', label: 'Food DB', icon: Search },
          { key: 'track', label: 'Track', icon: Camera }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedTab(key as any)}
            className={`flex-1 flex items-center justify-center space-x-1 py-3 ${
              selectedTab === key
                ? 'text-wellness-green border-b-2 border-wellness-green'
                : 'text-wellness-light'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedTab === 'search' && renderSearchTab()}
        {selectedTab === 'plan' && renderPlanTab()}
        {selectedTab === 'track' && renderTrackTab()}
      </div>
    </div>
  );
}