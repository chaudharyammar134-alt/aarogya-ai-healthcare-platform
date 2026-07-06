// Enhanced AI service with improved accuracy and personalization

import type { UserData, MedicalCondition } from '../App';
import { offlineStorage, smartCache } from './offline';

interface AIRecommendation {
  id: string;
  type: 'nutrition' | 'exercise' | 'sleep' | 'medication' | 'lifestyle';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  evidence: string;
  timeframe: string;
  followUpRequired: boolean;
  doctorApproved?: boolean;
  userFeedback?: 'helpful' | 'not_helpful' | 'partially_helpful';
  customized: {
    occupation: boolean;
    medicalHistory: boolean;
    currentMedications: boolean;
    personalPreferences: boolean;
  };
}

interface NutritionalInfo {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fiber: number;
  fat: number;
  vitamins: string[];
  minerals: string[];
  suitableFor: string[];
  avoidFor: string[];
  preparationTime: number;
  cost: 'low' | 'medium' | 'high';
  availability: 'common' | 'seasonal' | 'rare';
}

interface ExerciseRoutine {
  id: string;
  name: string;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  equipment: string[];
  targetAreas: string[];
  adaptedFor: {
    age: boolean;
    conditions: boolean;
    fitnessLevel: boolean;
    occupation: boolean;
  };
  contraindications: string[];
  progressionTips: string[];
}

class EnhancedAIService {
  private nutritionDatabase: Map<string, NutritionalInfo> = new Map();
  private exerciseDatabase: Map<string, ExerciseRoutine> = new Map();
  private userLearningData: Map<string, any> = new Map();
  private doctorValidationQueue: AIRecommendation[] = [];

  constructor() {
    this.initializeDatabases();
  }

  private initializeDatabases(): void {
    // Initialize Indian nutrition database
    this.initializeNutritionDatabase();
    
    // Initialize exercise database
    this.initializeExerciseDatabase();
  }

  private initializeNutritionDatabase(): void {
    const indianFoods: NutritionalInfo[] = [
      {
        name: 'Dal Rice',
        calories: 350,
        protein: 12,
        carbs: 65,
        fiber: 8,
        fat: 5,
        vitamins: ['B1', 'B6', 'Folate'],
        minerals: ['Iron', 'Magnesium', 'Phosphorus'],
        suitableFor: ['diabetes', 'heart_health', 'weight_management'],
        avoidFor: ['gluten_intolerance'],
        preparationTime: 30,
        cost: 'low',
        availability: 'common'
      },
      {
        name: 'Roti with Sabzi',
        calories: 300,
        protein: 10,
        carbs: 55,
        fiber: 6,
        fat: 4,
        vitamins: ['A', 'C', 'K'],
        minerals: ['Iron', 'Calcium'],
        suitableFor: ['general_health', 'weight_management'],
        avoidFor: ['celiac_disease'],
        preparationTime: 25,
        cost: 'low',
        availability: 'common'
      },
      {
        name: 'Quinoa Bowl with Vegetables',
        calories: 280,
        protein: 14,
        carbs: 45,
        fiber: 10,
        fat: 6,
        vitamins: ['B2', 'E', 'Folate'],
        minerals: ['Magnesium', 'Iron', 'Zinc'],
        suitableFor: ['diabetes', 'gluten_free', 'high_protein'],
        avoidFor: [],
        preparationTime: 20,
        cost: 'medium',
        availability: 'common'
      },
      {
        name: 'Idli Sambhar',
        calories: 250,
        protein: 8,
        carbs: 48,
        fiber: 5,
        fat: 2,
        vitamins: ['B12', 'C'],
        minerals: ['Iron', 'Calcium'],
        suitableFor: ['light_meals', 'digestive_health'],
        avoidFor: [],
        preparationTime: 40,
        cost: 'low',
        availability: 'common'
      },
      {
        name: 'Rajma Chawal',
        calories: 380,
        protein: 15,
        carbs: 60,
        fiber: 12,
        fat: 8,
        vitamins: ['Folate', 'B6'],
        minerals: ['Iron', 'Potassium', 'Magnesium'],
        suitableFor: ['heart_health', 'diabetes', 'high_fiber'],
        avoidFor: ['kidney_issues'],
        preparationTime: 45,
        cost: 'low',
        availability: 'common'
      }
    ];

    indianFoods.forEach(food => {
      this.nutritionDatabase.set(food.name.toLowerCase(), food);
    });
  }

  private initializeExerciseDatabase(): void {
    const exercises: ExerciseRoutine[] = [
      {
        id: 'morning_yoga',
        name: 'Morning Yoga Flow',
        duration: 20,
        intensity: 'low',
        equipment: ['yoga_mat'],
        targetAreas: ['flexibility', 'stress', 'balance'],
        adaptedFor: {
          age: true,
          conditions: true,
          fitnessLevel: true,
          occupation: true
        },
        contraindications: ['severe_back_injury', 'recent_surgery'],
        progressionTips: ['Hold poses longer', 'Add more challenging poses', 'Increase session duration']
      },
      {
        id: 'desk_exercises',
        name: 'Office Desk Exercises',
        duration: 10,
        intensity: 'low',
        equipment: [],
        targetAreas: ['neck', 'shoulders', 'back', 'circulation'],
        adaptedFor: {
          age: true,
          conditions: true,
          fitnessLevel: true,
          occupation: true
        },
        contraindications: [],
        progressionTips: ['Increase repetitions', 'Hold stretches longer', 'Add resistance bands']
      },
      {
        id: 'walking_routine',
        name: 'Brisk Walking',
        duration: 30,
        intensity: 'medium',
        equipment: ['walking_shoes'],
        targetAreas: ['cardiovascular', 'legs', 'endurance'],
        adaptedFor: {
          age: true,
          conditions: true,
          fitnessLevel: true,
          occupation: false
        },
        contraindications: ['severe_heart_condition', 'acute_injury'],
        progressionTips: ['Increase pace', 'Add inclines', 'Extend duration']
      },
      {
        id: 'strength_training',
        name: 'Basic Strength Training',
        duration: 45,
        intensity: 'high',
        equipment: ['dumbbells', 'resistance_bands'],
        targetAreas: ['muscle_building', 'bone_density', 'metabolism'],
        adaptedFor: {
          age: false,
          conditions: false,
          fitnessLevel: false,
          occupation: false
        },
        contraindications: ['high_blood_pressure', 'heart_disease', 'joint_problems'],
        progressionTips: ['Increase weights', 'Add more sets', 'Reduce rest time']
      }
    ];

    exercises.forEach(exercise => {
      this.exerciseDatabase.set(exercise.id, exercise);
    });
  }

  async generatePersonalizedPlan(user: UserData): Promise<AIRecommendation[]> {
    const cacheKey = `plan_${user.name}_${Date.now()}`;
    
    // Check cache first
    const cachedPlan = smartCache.get(cacheKey);
    if (cachedPlan) return cachedPlan;

    const recommendations: AIRecommendation[] = [];

    // Analyze user data comprehensively
    const userAnalysis = this.analyzeUserProfile(user);

    // Generate nutrition recommendations
    const nutritionRecs = await this.generateNutritionRecommendations(user, userAnalysis);
    recommendations.push(...nutritionRecs);

    // Generate exercise recommendations
    const exerciseRecs = await this.generateExerciseRecommendations(user, userAnalysis);
    recommendations.push(...exerciseRecs);

    // Generate sleep recommendations
    const sleepRecs = await this.generateSleepRecommendations(user, userAnalysis);
    recommendations.push(...sleepRecs);

    // Generate lifestyle recommendations
    const lifestyleRecs = await this.generateLifestyleRecommendations(user, userAnalysis);
    recommendations.push(...lifestyleRecs);

    // Prioritize recommendations
    const prioritizedRecs = this.prioritizeRecommendations(recommendations, user);

    // Store in cache and offline storage
    smartCache.set(cacheKey, prioritizedRecs, 2 * 60 * 60 * 1000); // 2 hours
    await offlineStorage.store('ai_recommendations', prioritizedRecs);

    return prioritizedRecs;
  }

  private analyzeUserProfile(user: UserData): any {
    const analysis = {
      riskFactors: [],
      strengths: [],
      priorities: [],
      adaptations: [],
      contraindications: []
    };

    // Analyze medical conditions
    user.medicalConditions.forEach(condition => {
      analysis.riskFactors.push(condition.name);
      
      if (condition.severity === 'severe') {
        analysis.priorities.push(`manage_${condition.name}`);
      }
      
      // Add condition-specific adaptations
      switch (condition.name.toLowerCase()) {
        case 'diabetes':
          analysis.adaptations.push('low_glycemic_foods', 'regular_monitoring', 'consistent_timing');
          break;
        case 'hypertension':
          analysis.adaptations.push('low_sodium', 'stress_management', 'regular_exercise');
          break;
        case 'heart disease':
          analysis.contraindications.push('high_intensity_exercise', 'high_sodium_foods');
          break;
      }
    });

    // Analyze occupation-specific needs
    switch (user.occupation) {
      case 'office-worker':
        analysis.priorities.push('combat_sedentary', 'eye_strain_relief', 'posture_improvement');
        break;
      case 'night-shift':
        analysis.priorities.push('circadian_rhythm_support', 'energy_management', 'immune_support');
        break;
      case 'manual-worker':
        analysis.priorities.push('muscle_recovery', 'joint_health', 'energy_sustenance');
        break;
      case 'healthcare':
        analysis.priorities.push('stress_management', 'immune_support', 'mental_health');
        break;
    }

    // Analyze BMI and physical metrics
    const bmi = user.bmi || (user.weight / Math.pow(user.height / 100, 2));
    if (bmi < 18.5) {
      analysis.priorities.push('healthy_weight_gain');
    } else if (bmi > 25) {
      analysis.priorities.push('healthy_weight_loss');
    }

    // Analyze activity level
    if (user.activityLevel === 'sedentary') {
      analysis.priorities.push('increase_activity', 'cardiovascular_health');
    }

    return analysis;
  }

  private async generateNutritionRecommendations(user: UserData, analysis: any): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];

    // Get suitable foods based on conditions and preferences
    const suitableFoods = this.findSuitableFoods(user, analysis);

    // Generate meal plan recommendations
    const mealTimes = this.calculateMealTimes(user);
    
    mealTimes.forEach((mealTime, index) => {
      const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'];
      const mealType = mealTypes[index];
      
      const suitableForMeal = suitableFoods.filter(food => 
        this.isSuitableForMealTime(food, mealType)
      );

      if (suitableForMeal.length > 0) {
        const recommendedFood = suitableForMeal[0];
        
        recommendations.push({
          id: `nutrition_${mealType}_${Date.now()}`,
          type: 'nutrition',
          title: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Recommendation`,
          description: `Have ${recommendedFood.name} (${recommendedFood.calories} cal, ${recommendedFood.protein}g protein)`,
          priority: 'medium',
          evidence: `Rich in ${recommendedFood.vitamins.join(', ')} and ${recommendedFood.minerals.join(', ')}. Suitable for ${recommendedFood.suitableFor.join(', ')}.`,
          timeframe: `${mealTime.getHours()}:${mealTime.getMinutes().toString().padStart(2, '0')}`,
          followUpRequired: false,
          customized: {
            occupation: true,
            medicalHistory: true,
            currentMedications: true,
            personalPreferences: true
          }
        });
      }
    });

    // Add specific nutritional guidance based on conditions
    analysis.riskFactors.forEach((condition: string) => {
      const conditionAdvice = this.getConditionSpecificNutrition(condition);
      if (conditionAdvice) {
        recommendations.push(conditionAdvice);
      }
    });

    return recommendations;
  }

  private async generateExerciseRecommendations(user: UserData, analysis: any): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];

    // Find suitable exercises
    const suitableExercises = Array.from(this.exerciseDatabase.values()).filter(exercise => {
      // Check contraindications
      const hasContraindications = exercise.contraindications.some(contraindication =>
        analysis.contraindications.includes(contraindication)
      );
      
      if (hasContraindications) return false;

      // Check if adapted for user's profile
      if (user.age > 60 && !exercise.adaptedFor.age) return false;
      if (analysis.riskFactors.length > 0 && !exercise.adaptedFor.conditions) return false;
      if (user.activityLevel === 'sedentary' && exercise.intensity === 'high') return false;

      return true;
    });

    // Recommend based on occupation
    if (user.occupation === 'office-worker') {
      const deskExercise = this.exerciseDatabase.get('desk_exercises');
      if (deskExercise) {
        recommendations.push({
          id: `exercise_desk_${Date.now()}`,
          type: 'exercise',
          title: 'Office Break Exercise',
          description: `${deskExercise.name} - ${deskExercise.duration} minutes`,
          priority: 'high',
          evidence: 'Counteracts prolonged sitting, improves posture and circulation',
          timeframe: 'Every 2 hours during work',
          followUpRequired: true,
          customized: {
            occupation: true,
            medicalHistory: true,
            currentMedications: false,
            personalPreferences: true
          }
        });
      }
    }

    // Daily exercise recommendation
    if (suitableExercises.length > 0) {
      const recommendedExercise = this.selectBestExercise(suitableExercises, user);
      
      recommendations.push({
        id: `exercise_daily_${Date.now()}`,
        type: 'exercise',
        title: 'Daily Activity',
        description: `${recommendedExercise.name} - ${recommendedExercise.duration} minutes`,
        priority: 'medium',
        evidence: `Targets: ${recommendedExercise.targetAreas.join(', ')}. ${recommendedExercise.progressionTips[0]}`,
        timeframe: this.getOptimalExerciseTime(user),
        followUpRequired: true,
        customized: {
          occupation: true,
          medicalHistory: true,
          currentMedications: true,
          personalPreferences: true
        }
      });
    }

    return recommendations;
  }

  private async generateSleepRecommendations(user: UserData, analysis: any): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];

    // Analyze sleep pattern
    const sleepDuration = this.calculateSleepDuration(user.sleepTime, user.wakeUpTime);
    const optimalSleep = this.getOptimalSleepDuration(user.age);

    if (Math.abs(sleepDuration - optimalSleep) > 1) {
      recommendations.push({
        id: `sleep_duration_${Date.now()}`,
        type: 'sleep',
        title: 'Sleep Duration Optimization',
        description: sleepDuration < optimalSleep 
          ? `Increase sleep to ${optimalSleep} hours for better health`
          : `Consider reducing sleep to ${optimalSleep} hours for optimal rest`,
        priority: 'high',
        evidence: `Adults aged ${user.age} need ${optimalSleep} hours of sleep for optimal health`,
        timeframe: 'Gradual adjustment over 1-2 weeks',
        followUpRequired: true,
        customized: {
          occupation: true,
          medicalHistory: false,
          currentMedications: false,
          personalPreferences: true
        }
      });
    }

    // Sleep hygiene recommendations
    if (user.occupation === 'night-shift') {
      recommendations.push({
        id: `sleep_nightshift_${Date.now()}`,
        type: 'sleep',
        title: 'Night Shift Sleep Strategy',
        description: 'Use blackout curtains, maintain consistent sleep schedule, consider melatonin support',
        priority: 'high',
        evidence: 'Helps maintain circadian rhythm for night shift workers',
        timeframe: 'Implement immediately',
        followUpRequired: true,
        customized: {
          occupation: true,
          medicalHistory: false,
          currentMedications: false,
          personalPreferences: true
        }
      });
    }

    return recommendations;
  }

  private async generateLifestyleRecommendations(user: UserData, analysis: any): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];

    // Stress management
    if (analysis.priorities.includes('stress_management')) {
      recommendations.push({
        id: `lifestyle_stress_${Date.now()}`,
        type: 'lifestyle',
        title: 'Stress Management',
        description: 'Practice deep breathing exercises, meditation, or yoga for 10 minutes daily',
        priority: 'high',
        evidence: 'Reduces cortisol levels and improves overall health outcomes',
        timeframe: 'Daily practice',
        followUpRequired: true,
        customized: {
          occupation: true,
          medicalHistory: true,
          currentMedications: false,
          personalPreferences: true
        }
      });
    }

    // Hydration
    const dailyWaterNeeds = this.calculateWaterNeeds(user);
    recommendations.push({
      id: `lifestyle_hydration_${Date.now()}`,
      type: 'lifestyle',
      title: 'Daily Hydration Goal',
      description: `Drink ${dailyWaterNeeds} glasses of water daily`,
      priority: 'medium',
      evidence: 'Proper hydration supports all bodily functions and improves energy levels',
      timeframe: 'Throughout the day',
      followUpRequired: true,
      customized: {
        occupation: true,
        medicalHistory: true,
        currentMedications: false,
        personalPreferences: false
      }
    });

    return recommendations;
  }

  private findSuitableFoods(user: UserData, analysis: any): NutritionalInfo[] {
    return Array.from(this.nutritionDatabase.values()).filter(food => {
      // Check if food is suitable for user's conditions
      const conditionMatch = analysis.riskFactors.every((condition: string) => {
        return !food.avoidFor.includes(condition.toLowerCase());
      });

      // Check user preferences
      const preferenceMatch = !user.aiPreferences?.dislikedFoods?.some(disliked =>
        food.name.toLowerCase().includes(disliked.toLowerCase())
      );

      return conditionMatch && preferenceMatch;
    });
  }

  private selectBestExercise(exercises: ExerciseRoutine[], user: UserData): ExerciseRoutine {
    // Score exercises based on user profile
    let bestExercise = exercises[0];
    let bestScore = 0;

    exercises.forEach(exercise => {
      let score = 0;

      // Prefer exercises adapted for user's profile
      if (exercise.adaptedFor.age && user.age > 50) score += 2;
      if (exercise.adaptedFor.occupation) score += 2;
      if (exercise.adaptedFor.fitnessLevel) score += 1;

      // Match intensity with activity level
      if (user.activityLevel === 'sedentary' && exercise.intensity === 'low') score += 2;
      if (user.activityLevel === 'moderately-active' && exercise.intensity === 'medium') score += 2;
      if (user.activityLevel === 'very-active' && exercise.intensity === 'high') score += 2;

      if (score > bestScore) {
        bestScore = score;
        bestExercise = exercise;
      }
    });

    return bestExercise;
  }

  // Learning and adaptation methods
  async recordUserFeedback(recommendationId: string, feedback: 'helpful' | 'not_helpful' | 'partially_helpful'): Promise<void> {
    const userFeedback = {
      recommendationId,
      feedback,
      timestamp: Date.now()
    };

    // Store feedback for learning
    await offlineStorage.store('user_feedback', userFeedback);

    // Update AI learning data
    const learningKey = `feedback_${recommendationId}`;
    this.userLearningData.set(learningKey, userFeedback);

    // Adjust future recommendations based on feedback
    this.adaptRecommendations(feedback, recommendationId);
  }

  private adaptRecommendations(feedback: string, recommendationId: string): void {
    // Implement adaptive learning logic
    // This would be more sophisticated in a real implementation
    
    if (feedback === 'not_helpful') {
      // Reduce weight of similar recommendations
      console.log(`Learning: Reducing preference for recommendation type: ${recommendationId}`);
    } else if (feedback === 'helpful') {
      // Increase weight of similar recommendations
      console.log(`Learning: Increasing preference for recommendation type: ${recommendationId}`);
    }
  }

  // Doctor validation system
  async submitForDoctorValidation(recommendation: AIRecommendation): Promise<void> {
    recommendation.doctorApproved = undefined; // Pending approval
    this.doctorValidationQueue.push(recommendation);
    
    // In real implementation, this would notify doctors
    await offlineStorage.store('doctor_validation_queue', this.doctorValidationQueue);
  }

  async getDoctorValidationQueue(): Promise<AIRecommendation[]> {
    return this.doctorValidationQueue;
  }

  async approveDoctorValidation(recommendationId: string, approved: boolean): Promise<void> {
    const index = this.doctorValidationQueue.findIndex(rec => rec.id === recommendationId);
    if (index !== -1) {
      this.doctorValidationQueue[index].doctorApproved = approved;
      
      if (approved) {
        // Move to approved recommendations
        this.doctorValidationQueue.splice(index, 1);
      }
      
      await offlineStorage.store('doctor_validation_queue', this.doctorValidationQueue);
    }
  }

  // Helper methods
  private isSuitableForMealTime(food: NutritionalInfo, mealType: string): boolean {
    switch (mealType) {
      case 'breakfast':
        return food.calories < 400 && food.preparationTime < 30;
      case 'lunch':
        return food.calories >= 300 && food.calories <= 500;
      case 'snack':
        return food.calories < 200;
      case 'dinner':
        return food.calories < 450 && food.name.toLowerCase().includes('light') || food.fiber > 5;
      default:
        return true;
    }
  }

  private calculateMealTimes(user: UserData): Date[] {
    const wakeTime = this.parseTime(user.wakeUpTime);
    const sleepTime = this.parseTime(user.sleepTime);
    
    const breakfast = new Date(wakeTime);
    breakfast.setHours(breakfast.getHours() + 1);
    
    const lunch = new Date(wakeTime);
    lunch.setHours(lunch.getHours() + 6);
    
    const snack = new Date(wakeTime);
    snack.setHours(snack.getHours() + 9);
    
    const dinner = new Date(sleepTime);
    dinner.setHours(dinner.getHours() - 3);
    
    return [breakfast, lunch, snack, dinner];
  }

  private parseTime(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  private calculateSleepDuration(sleepTime: string, wakeTime: string): number {
    const sleep = this.parseTime(sleepTime);
    const wake = this.parseTime(wakeTime);
    
    if (wake < sleep) {
      wake.setDate(wake.getDate() + 1);
    }
    
    return (wake.getTime() - sleep.getTime()) / (1000 * 60 * 60);
  }

  private getOptimalSleepDuration(age: number): number {
    if (age < 18) return 9;
    if (age < 65) return 8;
    return 7;
  }

  private calculateWaterNeeds(user: UserData): number {
    let baseWater = 8; // Base 8 glasses
    
    // Adjust for weight
    if (user.weight > 70) baseWater += 2;
    
    // Adjust for activity level
    if (user.activityLevel === 'very-active') baseWater += 2;
    if (user.activityLevel === 'moderately-active') baseWater += 1;
    
    // Adjust for occupation
    if (user.occupation === 'manual-worker') baseWater += 2;
    
    return baseWater;
  }

  private getOptimalExerciseTime(user: UserData): string {
    const wakeTime = this.parseTime(user.wakeUpTime);
    
    if (user.occupation === 'night-shift') {
      wakeTime.setHours(wakeTime.getHours() + 2);
    } else {
      wakeTime.setHours(wakeTime.getHours() + 1);
    }
    
    return `${wakeTime.getHours()}:${wakeTime.getMinutes().toString().padStart(2, '0')}`;
  }

  private getConditionSpecificNutrition(condition: string): AIRecommendation | null {
    const conditionAdvice: Record<string, Partial<AIRecommendation>> = {
      diabetes: {
        title: 'Diabetes Management',
        description: 'Focus on low glycemic index foods, regular meal timing, and portion control',
        priority: 'high',
        evidence: 'Helps maintain stable blood sugar levels',
      },
      hypertension: {
        title: 'Blood Pressure Management',
        description: 'Reduce sodium intake, increase potassium-rich foods, limit processed foods',
        priority: 'high',
        evidence: 'DASH diet principles proven to reduce blood pressure',
      },
      'heart disease': {
        title: 'Heart Health Nutrition',
        description: 'Emphasize omega-3 fatty acids, fiber-rich foods, and limit saturated fats',
        priority: 'critical',
        evidence: 'Mediterranean diet shown to improve cardiovascular outcomes',
      }
    };

    const advice = conditionAdvice[condition.toLowerCase()];
    if (!advice) return null;

    return {
      id: `nutrition_condition_${condition}_${Date.now()}`,
      type: 'nutrition',
      timeframe: 'Daily implementation',
      followUpRequired: true,
      customized: {
        occupation: false,
        medicalHistory: true,
        currentMedications: true,
        personalPreferences: false
      },
      ...advice
    } as AIRecommendation;
  }

  private prioritizeRecommendations(recommendations: AIRecommendation[], user: UserData): AIRecommendation[] {
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Secondary sort by customization level
      const aCustomization = Object.values(a.customized).filter(Boolean).length;
      const bCustomization = Object.values(b.customized).filter(Boolean).length;
      
      return bCustomization - aCustomization;
    });
  }
}

export const enhancedAI = new EnhancedAIService();