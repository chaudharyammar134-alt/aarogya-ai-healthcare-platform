/**
 * Health API Service
 * Integrates Google Fit, CalorieMama, OpenWeatherMap, and BMI calculations
 * Currently in SIMULATION MODE for demonstration
 */

export interface HealthMetrics {
  steps: number;
  calories: number;
  distance: number; // in km
  activeMinutes: number;
  heartRate?: number;
  sleepHours?: number;
  timestamp: string;
}

export interface FoodAnalysis {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  servingSize: string;
  confidence: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  location: string;
  hydrationMultiplier: number; // 1.0 = normal, 1.5 = hot weather
}

export interface BMIData {
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  healthyWeightRange: { min: number; max: number };
  recommendations: string[];
}

class HealthApiService {
  // ============ GOOGLE FIT API (Simulated) ============
  
  /**
   * Fetch health metrics from Google Fit
   * In production: Use Google Fit REST API or OAuth
   */
  async getHealthMetrics(userId: string): Promise<HealthMetrics> {
    // SIMULATION MODE
    console.log('🏃 [Google Fit API - SIMULATION] Fetching health metrics for user:', userId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate realistic simulated data
    const now = new Date();
    const hour = now.getHours();
    
    // More steps during day, less at night
    const baseSteps = hour < 6 ? 100 : hour < 12 ? 3000 : hour < 18 ? 6000 : 4000;
    const steps = baseSteps + Math.floor(Math.random() * 2000);
    
    return {
      steps,
      calories: Math.floor(steps * 0.04 + 1500), // ~0.04 cal per step + BMR
      distance: parseFloat((steps * 0.0008).toFixed(2)), // ~0.8m per step
      activeMinutes: Math.floor(steps / 100),
      heartRate: 65 + Math.floor(Math.random() * 20),
      sleepHours: hour < 6 ? 7.5 : undefined,
      timestamp: now.toISOString(),
    };
  }

  /**
   * Sync health data to Google Fit
   */
  async syncHealthData(userId: string, metrics: Partial<HealthMetrics>): Promise<boolean> {
    console.log('📤 [Google Fit API - SIMULATION] Syncing health data:', metrics);
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  }

  // ============ CALORIEMAMA API (Simulated) ============
  
  /**
   * Analyze food from image using CalorieMama API
   * In production: Use CalorieMama REST API with image upload
   */
  async analyzeFoodImage(imageData: string): Promise<FoodAnalysis[]> {
    console.log('📸 [CalorieMama API - SIMULATION] Analyzing food image...');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulated food recognition results
    const indianFoods = [
      { name: 'Dal Tadka', calories: 180, protein: 9, carbs: 25, fat: 5, fiber: 8, servingSize: '1 bowl (200g)' },
      { name: 'Roti', calories: 120, protein: 4, carbs: 22, fat: 2, fiber: 3, servingSize: '1 piece (40g)' },
      { name: 'Vegetable Curry', calories: 150, protein: 5, carbs: 18, fat: 7, fiber: 5, servingSize: '1 bowl (150g)' },
      { name: 'Rice', calories: 200, protein: 4, carbs: 45, fat: 0.5, fiber: 1, servingSize: '1 bowl (150g)' },
      { name: 'Paneer Tikka', calories: 250, protein: 18, carbs: 8, fat: 16, fiber: 2, servingSize: '6 pieces (150g)' },
    ];
    
    // Return 1-3 random items
    const numItems = 1 + Math.floor(Math.random() * 2);
    const selectedFoods = [];
    
    for (let i = 0; i < numItems; i++) {
      const food = indianFoods[Math.floor(Math.random() * indianFoods.length)];
      selectedFoods.push({
        ...food,
        confidence: 0.75 + Math.random() * 0.2, // 75-95% confidence
      });
    }
    
    return selectedFoods;
  }

  // ============ NUTRITIONIX API (Simulated) ============
  
  /**
   * Get detailed nutrition information for food items
   * In production: Use Nutritionix API v2
   */
  async getNutritionInfo(foodName: string): Promise<FoodAnalysis | null> {
    console.log('🥗 [Nutritionix API - SIMULATION] Fetching nutrition for:', foodName);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Indian food nutrition database (simulated)
    const nutritionDB: { [key: string]: FoodAnalysis } = {
      'dal': { name: 'Dal (Lentils)', calories: 180, protein: 9, carbs: 25, fat: 5, fiber: 8, servingSize: '1 bowl', confidence: 0.95 },
      'roti': { name: 'Roti/Chapati', calories: 120, protein: 4, carbs: 22, fat: 2, fiber: 3, servingSize: '1 piece', confidence: 0.95 },
      'rice': { name: 'White Rice', calories: 200, protein: 4, carbs: 45, fat: 0.5, fiber: 1, servingSize: '1 bowl', confidence: 0.95 },
      'chicken': { name: 'Chicken Curry', calories: 280, protein: 25, carbs: 10, fat: 15, fiber: 2, servingSize: '1 bowl', confidence: 0.90 },
      'paneer': { name: 'Paneer', calories: 265, protein: 18, carbs: 3, fat: 20, fiber: 0, servingSize: '100g', confidence: 0.95 },
      'paratha': { name: 'Paratha', calories: 230, protein: 5, carbs: 28, fat: 11, fiber: 2, servingSize: '1 piece', confidence: 0.92 },
      'idli': { name: 'Idli', calories: 58, protein: 2, carbs: 12, fat: 0.5, fiber: 1, servingSize: '1 piece', confidence: 0.95 },
      'dosa': { name: 'Dosa', calories: 168, protein: 4, carbs: 28, fat: 4, fiber: 2, servingSize: '1 piece', confidence: 0.93 },
      'sambar': { name: 'Sambar', calories: 120, protein: 5, carbs: 18, fat: 3, fiber: 5, servingSize: '1 bowl', confidence: 0.90 },
      'curd': { name: 'Curd/Yogurt', calories: 98, protein: 6, carbs: 11, fat: 3, fiber: 0, servingSize: '1 bowl', confidence: 0.95 },
    };
    
    const searchTerm = foodName.toLowerCase();
    const match = Object.keys(nutritionDB).find(key => searchTerm.includes(key));
    
    return match ? nutritionDB[match] : null;
  }

  // ============ OPENWEATHERMAP API (Simulated) ============
  
  /**
   * Get weather data to adjust hydration recommendations
   * In production: Use OpenWeatherMap API with location
   */
  async getWeatherData(location?: string): Promise<WeatherData> {
    console.log('🌤️ [OpenWeatherMap API - SIMULATION] Fetching weather for:', location || 'current location');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulated weather for Indian cities
    const temperatures = [18, 22, 28, 32, 35, 38]; // Range of temps
    const conditions = ['Clear', 'Partly Cloudy', 'Cloudy', 'Hot', 'Very Hot'];
    
    const temp = temperatures[Math.floor(Math.random() * temperatures.length)];
    let hydrationMultiplier = 1.0;
    
    if (temp > 35) hydrationMultiplier = 1.5;
    else if (temp > 30) hydrationMultiplier = 1.3;
    else if (temp > 25) hydrationMultiplier = 1.1;
    
    return {
      temperature: temp,
      humidity: 40 + Math.floor(Math.random() * 40),
      condition: temp > 32 ? 'Hot' : temp > 25 ? 'Warm' : 'Pleasant',
      location: location || 'Delhi, India',
      hydrationMultiplier,
    };
  }

  // ============ BMI CALCULATOR (WHO Standards) ============
  
  /**
   * Calculate BMI and provide health recommendations
   * Using WHO BMI standards
   */
  calculateBMI(weight: number, height: number): BMIData {
    console.log('📊 [BMI Calculator - WHO Standards] Calculating BMI...');
    
    // Height in cm to meters
    const heightInMeters = height / 100;
    const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
    
    let category: BMIData['category'];
    let recommendations: string[];
    
    if (bmi < 18.5) {
      category = 'Underweight';
      recommendations = [
        'Increase calorie intake with nutritious foods',
        'Include protein-rich foods like dal, paneer, eggs',
        'Consider strength training exercises',
        'Consult a dietitian for personalized meal plan'
      ];
    } else if (bmi < 25) {
      category = 'Normal';
      recommendations = [
        'Maintain current healthy eating habits',
        'Continue regular physical activity',
        'Stay hydrated throughout the day',
        'Get adequate sleep (7-8 hours)'
      ];
    } else if (bmi < 30) {
      category = 'Overweight';
      recommendations = [
        'Focus on portion control and balanced meals',
        'Increase physical activity to 150 mins/week',
        'Choose whole grains over refined flour',
        'Limit sugar and processed foods'
      ];
    } else {
      category = 'Obese';
      recommendations = [
        'Consult healthcare provider for personalized plan',
        'Start with moderate exercise, gradually increase',
        'Focus on sustainable dietary changes',
        'Consider professional nutritional counseling'
      ];
    }
    
    // Calculate healthy weight range for this height
    const minHealthyWeight = parseFloat((18.5 * heightInMeters * heightInMeters).toFixed(1));
    const maxHealthyWeight = parseFloat((24.9 * heightInMeters * heightInMeters).toFixed(1));
    
    return {
      bmi,
      category,
      healthyWeightRange: {
        min: minHealthyWeight,
        max: maxHealthyWeight,
      },
      recommendations,
    };
  }

  // ============ HEALTH SCORE CALCULATION ============
  
  /**
   * Calculate overall health score based on multiple factors
   */
  calculateHealthScore(metrics: {
    steps?: number;
    sleepHours?: number;
    waterIntake?: number; // in liters
    calorieBalance?: number; // consumed - burned
    bmi?: number;
    activityStreak?: number; // days
  }): number {
    let score = 0;
    
    // Steps (max 25 points)
    if (metrics.steps) {
      score += Math.min(25, (metrics.steps / 10000) * 25);
    }
    
    // Sleep (max 20 points)
    if (metrics.sleepHours) {
      const sleepScore = metrics.sleepHours >= 7 && metrics.sleepHours <= 9 ? 20 : 10;
      score += sleepScore;
    }
    
    // Hydration (max 15 points)
    if (metrics.waterIntake) {
      score += Math.min(15, (metrics.waterIntake / 3) * 15);
    }
    
    // BMI (max 20 points)
    if (metrics.bmi) {
      const bmiScore = metrics.bmi >= 18.5 && metrics.bmi <= 24.9 ? 20 : 10;
      score += bmiScore;
    }
    
    // Activity streak (max 20 points)
    if (metrics.activityStreak) {
      score += Math.min(20, metrics.activityStreak * 2);
    }
    
    return Math.round(score);
  }
}

export const healthApiService = new HealthApiService();
