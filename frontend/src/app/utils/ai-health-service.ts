/**
 * AI Health Service
 * Context-aware health guidance driven by the user's saved Aarogya data.
 */

import type { UserData } from '../types/user';
import type {
  DailyHealthLog,
  DailyPlanRecord,
  SymptomLog,
} from './api-client';
import { generatePersonalizedDayPlan } from './day-plan-generator';
import type { GeneratedDayPlan } from './day-plan-generator';

export interface DailyHealthPlan {
  id: string;
  date: string;
  userId: string;
  morning: {
    wakeUp: string;
    activity: string;
    breakfast: string;
    hydration: string;
  };
  midMorning: {
    snack?: string;
    activity: string;
  };
  afternoon: {
    lunch: string;
    rest: string;
    hydration: string;
  };
  evening: {
    snack?: string;
    exercise: string;
    hydration: string;
  };
  night: {
    dinner: string;
    relaxation: string;
    sleepTime: string;
  };
  motivationalMessage: string;
  healthTips: string[];
  calorieTarget: number;
  waterTarget: number;
  stepsTarget: number;
}

export interface DietRecommendation {
  meal: string;
  foods: {
    name: string;
    portion: string;
    calories: number;
    benefits: string;
  }[];
  totalCalories: number;
  nutritionBalance: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  indianAlternatives: string[];
}

export interface AIConversationContext {
  userId: string;
  conversationHistory: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }[];
  userPreferences: {
    previousRoutines: string[];
    sleepPattern: { averageHours: number; consistency: number };
    mealPreferences: string[];
    exerciseCompliance: number; // 0-100%
  };
}

export interface LiveHealthChatContext {
  user: UserData;
  todayPlan: DailyPlanRecord | null;
  generatedPlan: GeneratedDayPlan | null;
  recentLogs: DailyHealthLog[];
  symptoms: SymptomLog[];
}

export interface LiveHealthChatReply {
  content: string;
  suggestions: string[];
  requiresDoctor: boolean;
}

class AIHealthService {
  private conversationContexts: Map<string, AIConversationContext> = new Map();

  // ============ OPENAI GPT-4 API (Simulated) ============
  
  /**
   * Generate personalized daily health plan using AI
   * In production: Use OpenAI GPT-4 API with prompt engineering
   */
  async generateDailyHealthPlan(user: UserData): Promise<DailyHealthPlan> {
    const generatedPlan = generatePersonalizedDayPlan(user);
    const breakfastTask =
      generatedPlan.tasks.find((task) => task.id === 'breakfast') ||
      generatedPlan.tasks.find((task) => task.type === 'meal');
    const hydrationTask =
      generatedPlan.tasks.find((task) => task.id === 'mid-hydration') ||
      generatedPlan.tasks.find((task) => task.type === 'hydration');
    const lunchTask =
      generatedPlan.tasks.find((task) => task.id === 'lunch') ||
      generatedPlan.tasks.find((task) => task.type === 'meal');
    const postLunchTask =
      generatedPlan.tasks.find((task) => task.id === 'post-lunch') ||
      generatedPlan.tasks.find((task) => task.type === 'activity');
    const exerciseTask =
      generatedPlan.tasks.find((task) => task.id === 'exercise') ||
      generatedPlan.tasks.find((task) => task.type === 'exercise');
    const dinnerTask =
      generatedPlan.tasks.find((task) => task.id === 'dinner') ||
      generatedPlan.tasks.filter((task) => task.type === 'meal').at(-1);
    const windDownTask =
      generatedPlan.tasks.find((task) => task.id === 'wind-down') ||
      generatedPlan.tasks.filter((task) => task.type === 'sleep').at(-1);

    return {
      id: generatedPlan.id,
      date: generatedPlan.generatedAt,
      userId: user.id || user.name,
      morning: {
        wakeUp: generatedPlan.summary.wakeUpTime,
        activity:
          generatedPlan.tasks.find((task) => task.id === 'morning-mobility')?.description ||
          'Gentle activation routine',
        breakfast: breakfastTask?.description || 'Balanced breakfast',
        hydration: generatedPlan.tasks.find((task) => task.id === 'wake')?.description ||
          'Start with water before caffeine',
      },
      midMorning: {
        snack: hydrationTask?.description,
        activity:
          generatedPlan.tasks.find((task) => task.id === 'focus-reset')?.description ||
          'Movement reset',
      },
      afternoon: {
        lunch: lunchTask?.description || 'Balanced lunch',
        rest: postLunchTask?.description || 'Short recovery break',
        hydration: hydrationTask?.description || 'Hydration break',
      },
      evening: {
        snack:
          generatedPlan.tasks.find((task) => task.id === 'afternoon-hydration')?.description,
        exercise: exerciseTask?.description || 'Movement block',
        hydration:
          generatedPlan.tasks.find((task) => task.id === 'afternoon-hydration')?.description ||
          'Hydration reminder',
      },
      night: {
        dinner: dinnerTask?.description || 'Light dinner',
        relaxation: windDownTask?.description || 'Wind-down routine',
        sleepTime: generatedPlan.summary.sleepTime,
      },
      motivationalMessage: this.generateMotivation(user, generatedPlan.summary.insight),
      healthTips: generatedPlan.tasks.slice(0, 4).map((task) => task.rationale),
      calorieTarget: generatedPlan.summary.calorieTarget,
      waterTarget: generatedPlan.summary.waterTargetLiters,
      stepsTarget: generatedPlan.summary.stepsTarget,
    };
  }

  /**
   * Generate diet recommendations with AI
   */
  async generateDietPlan(user: UserData, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): Promise<DietRecommendation> {
    console.log('🥗 [AI Diet Generator - SIMULATION] Creating', mealType, 'plan');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const { calorieTarget } = this.calculateTargets(user);
    const mealCalories = this.getMealCalories(mealType, calorieTarget);
    
    const indianFoods = this.getIndianFoodOptions(mealType, user);
    
    return {
      meal: mealType.charAt(0).toUpperCase() + mealType.slice(1),
      foods: indianFoods,
      totalCalories: mealCalories,
      nutritionBalance: {
        protein: 25,
        carbs: 50,
        fat: 20,
        fiber: 5,
      },
      indianAlternatives: this.getAlternatives(mealType),
    };
  }

  /**
   * Get AI-powered motivational messages
   */
  async getMotivationalMessage(user: UserData, context?: string): Promise<string> {
    console.log('💪 [AI Motivation - SIMULATION] Generating motivation');
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return this.generateMotivation(user, context);
  }

  // ============ LANGCHAIN.JS INTEGRATION (Simulated) ============
  
  /**
   * AI Chat with conversation memory using LangChain
   * In production: Use LangChain with OpenAI and conversation buffer
   */
  async chatWithAI(userId: string, message: string, user: UserData): Promise<string> {
    console.log('💬 [LangChain AI Chat - SIMULATION] Processing message:', message);
    
    // Get or create conversation context
    let context = this.conversationContexts.get(userId);
    if (!context) {
      context = {
        userId,
        conversationHistory: [],
        userPreferences: {
          previousRoutines: [],
          sleepPattern: { averageHours: 7, consistency: 80 },
          mealPreferences: [],
          exerciseCompliance: 70,
        },
      };
      this.conversationContexts.set(userId, context);
    }
    
    // Add user message to history
    context.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate contextual response
    const response = this.generateContextualResponse(message, user, context);
    
    // Add AI response to history
    context.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    });
    
    // Keep only last 20 messages for memory
    if (context.conversationHistory.length > 20) {
      context.conversationHistory = context.conversationHistory.slice(-20);
    }
    
    return response;
  }

  generateWelcomeReply(context: LiveHealthChatContext): LiveHealthChatReply {
    const firstName = context.user.name?.split(' ')[0] || 'there';
    const latestLog = context.recentLogs[0];
    const latestSymptom = context.symptoms[0];
    const plan = context.todayPlan?.generatedPlan ?? context.generatedPlan;
    const planSummary = plan?.summary;

    const content = [
      `Namaste ${firstName}. I'm your Aarogya AI coach.`,
      planSummary
        ? `Your current plan is built around waking at ${planSummary.wakeUpTime} and sleeping at ${planSummary.sleepTime}, with focus on ${planSummary.focusAreas.slice(0, 2).join(' and ') || 'consistency'}.`
        : `I can help you shape today's plan once your sleep and routine details are saved.`,
      latestLog
        ? `Your latest saved check-in shows ${latestLog.waterGlasses} glasses of water, ${latestLog.steps.toLocaleString('en-IN')} steps, and mood marked as ${latestLog.mood}.`
        : `You have not saved a health check-in yet, so I will lean more on your profile and plan.`,
      latestSymptom
        ? `I can also see your recent symptom note: ${latestSymptom.symptom} (${latestSymptom.severity}).`
        : `You can ask me about symptoms, sleep, food, exercise, or why today's plan changed.`,
    ].join('\n\n');

    return {
      content,
      suggestions: [
        'Why did my plan update today?',
        'How do I improve today’s score?',
        'What should I eat next?',
        'Check my symptoms',
      ],
      requiresDoctor: latestSymptom?.severity === 'severe',
    };
  }

  async chatWithLiveContext(
    message: string,
    context: LiveHealthChatContext,
  ): Promise<LiveHealthChatReply> {
    await new Promise((resolve) => setTimeout(resolve, 450));

    const lowerMessage = message.toLowerCase();
    const plan = context.todayPlan?.generatedPlan ?? context.generatedPlan;
    const latestLog = context.recentLogs[0] ?? null;
    const latestSymptom = context.symptoms[0] ?? null;
    const firstName = context.user.name?.split(' ')[0] || 'there';
    const waterTarget = plan?.summary.waterTargetGlasses ?? 8;
    const stepsTarget = plan?.summary.stepsTarget ?? 10000;
    const calorieTarget = plan?.summary.calorieTarget ?? 2000;
    const wakeTime = plan?.summary.wakeUpTime ?? context.user.wakeUpTime;
    const sleepTime = plan?.summary.sleepTime ?? context.user.sleepTime;
    const completedWater = latestLog?.waterGlasses ?? 0;
    const completedSteps = latestLog?.steps ?? 0;
    const completedProtein = latestLog?.proteinGrams ?? 0;
    const sleepHours = latestLog?.sleepHours ?? null;
    const latestTasks = plan?.tasks.slice(0, 3) ?? [];
    const recentSymptomText = latestSymptom
      ? `${latestSymptom.symptom} (${latestSymptom.severity})`
      : null;

    if (
      lowerMessage.includes('why') &&
      lowerMessage.includes('plan')
    ) {
      return {
        content: `Today's plan is anchored to your saved routine of waking at ${wakeTime} and sleeping at ${sleepTime}. ${context.todayPlan?.updateReason ?? plan?.summary.insight ?? 'It also uses your recent health activity to keep the day realistic.'}`,
        suggestions: [
          'What should I do next?',
          'How do I improve the plan?',
          'Check my hydration progress',
        ],
        requiresDoctor: false,
      };
    }

    if (
      lowerMessage.includes('sleep') ||
      lowerMessage.includes('tired') ||
      lowerMessage.includes('energy')
    ) {
      const content = sleepHours !== null
        ? `You logged ${sleepHours} hours of sleep recently. ${sleepHours < 7 ? 'That is likely why the plan is leaning more toward recovery, hydration, and steadier movement today.' : 'That gives you a solid base, so the plan can support stronger focus and movement blocks today.'} Try protecting your sleep window from ${wakeTime} to ${sleepTime} and keep your wind-down block consistent.`
        : `Your plan is currently using the saved schedule of ${wakeTime} to ${sleepTime}. If you log actual sleep hours, I can give much sharper advice on recovery and energy.`;

      return {
        content,
        suggestions: [
          'Update my sleep schedule',
          'How can I sleep better?',
          'Show my recovery focus',
        ],
        requiresDoctor: false,
      };
    }

    if (
      lowerMessage.includes('water') ||
      lowerMessage.includes('hydration')
    ) {
      const remaining = Math.max(0, waterTarget - completedWater);
      return {
        content: `Your target today is ${waterTarget} glasses, and your latest check-in shows ${completedWater}. ${remaining > 0 ? `You are ${remaining} glasses away, so hydration is still one of the easiest ways to improve today's score.` : 'You have already met the water target, which is great for energy and recovery.'}`,
        suggestions: [
          'What else should I improve?',
          'Show today’s targets',
          'How do I improve my score?',
        ],
        requiresDoctor: false,
      };
    }

    if (
      lowerMessage.includes('step') ||
      lowerMessage.includes('walk') ||
      lowerMessage.includes('exercise') ||
      lowerMessage.includes('workout')
    ) {
      const remaining = Math.max(0, stepsTarget - completedSteps);
      const movementTask =
        plan?.tasks.find((task) => task.type === 'exercise' || task.type === 'activity') ??
        latestTasks[0];

      return {
        content: `Your step target today is ${stepsTarget.toLocaleString('en-IN')}, and you have logged ${completedSteps.toLocaleString('en-IN')}. ${remaining > 0 ? `A realistic next move is ${remaining > 2500 ? 'one focused walk block' : 'a short movement reset'} to close the gap.` : 'You have already crossed the target, so the goal now is recovery and consistency.'}${movementTask ? ` The plan's next movement idea is: ${movementTask.title} at ${movementTask.time}.` : ''}`,
        suggestions: [
          'What should I do next?',
          'Give me a home workout',
          'How does this affect my plan?',
        ],
        requiresDoctor: false,
      };
    }

    if (
      lowerMessage.includes('diet') ||
      lowerMessage.includes('food') ||
      lowerMessage.includes('eat') ||
      lowerMessage.includes('meal') ||
      lowerMessage.includes('protein')
    ) {
      const mealTask =
        plan?.tasks.find((task) => task.type === 'meal') ?? null;
      return {
        content: `Your plan is aiming for about ${calorieTarget} kcal today, and your latest check-in shows ${completedProtein}g of protein so far. ${mealTask ? `Your next meal block is ${mealTask.title} at ${mealTask.time}: ${mealTask.description}.` : 'I would suggest keeping the next meal balanced with protein, vegetables, and steady carbs.'} Because your profile includes goals like ${(context.user.goals ?? ['general wellness']).slice(0, 2).join(', ')}, I would keep the next meal simple and plan-friendly rather than chasing perfect macros.`,
        suggestions: [
          'Suggest my next meal',
          'How much protein do I need?',
          'What should I avoid tonight?',
        ],
        requiresDoctor: false,
      };
    }

    if (
      lowerMessage.includes('symptom') ||
      lowerMessage.includes('headache') ||
      lowerMessage.includes('pain') ||
      lowerMessage.includes('fever') ||
      lowerMessage.includes('anxiety') ||
      lowerMessage.includes('stress')
    ) {
      const severeWords = ['chest pain', 'breathing', 'faint', 'severe', 'vomit', 'worst'];
      const flagged = severeWords.some((term) => lowerMessage.includes(term)) ||
        latestSymptom?.severity === 'severe';

      return {
        content: recentSymptomText
          ? `Your latest saved symptom is ${recentSymptomText}. ${flagged ? 'Because the symptom sounds significant, please seek medical advice instead of relying only on app guidance.' : 'I would keep the plan lighter today, stay hydrated, and monitor whether the symptom improves or worsens after rest, food, and water.'}`
          : `${flagged ? 'Your message sounds like it may need medical attention.' : 'I can help you think through symptoms, but serious or worsening issues should always go to a doctor.'} If you save the symptom in Progress, the plan can adapt more clearly around it.`,
        suggestions: flagged
          ? ['Consult a doctor', 'Save symptom in Progress', 'Show recovery plan']
          : ['Save symptom in Progress', 'How should today’s plan change?', 'What should I monitor?'],
        requiresDoctor: flagged,
      };
    }

    if (
      lowerMessage.includes('score') ||
      lowerMessage.includes('improve') ||
      lowerMessage.includes('progress')
    ) {
      const gaps: string[] = [];
      if (completedWater < waterTarget) gaps.push(`hydration (${completedWater}/${waterTarget})`);
      if (completedSteps < stepsTarget) gaps.push(`movement (${completedSteps.toLocaleString('en-IN')}/${stepsTarget.toLocaleString('en-IN')})`);
      if (sleepHours !== null && sleepHours < 7) gaps.push(`sleep recovery (${sleepHours} hrs)`);
      if (completedProtein < 50) gaps.push(`protein (${completedProtein}g)`);

      return {
        content: gaps.length
          ? `The clearest way to improve today's score is to work on ${gaps.slice(0, 2).join(' and ')}. I would focus on the biggest two gaps first instead of trying to fix everything at once.`
          : `Your latest numbers already look balanced. The best move now is consistency: follow the remaining plan blocks and protect tonight's sleep window.`,
        suggestions: [
          'Tell me the biggest gap',
          'What should I do next?',
          'Show today’s plan summary',
        ],
        requiresDoctor: false,
      };
    }

    return {
      content: `I’m looking at your saved Aarogya data, ${firstName}. Right now your plan is centered on ${wakeTime} to ${sleepTime}, with targets of ${waterTarget} glasses, ${stepsTarget.toLocaleString('en-IN')} steps, and about ${calorieTarget} kcal. ${context.todayPlan?.updateReason ?? plan?.summary.insight ?? 'Ask me about sleep, food, symptoms, exercise, or how to improve today’s score and I’ll use your live profile and plan.'}`,
      suggestions: [
        'Why did my plan update?',
        'How do I improve today’s score?',
        'Suggest my next meal',
        'Check my symptoms',
      ],
      requiresDoctor: false,
    };
  }

  /**
   * Get conversation history for a user
   */
  getConversationHistory(userId: string): AIConversationContext | undefined {
    return this.conversationContexts.get(userId);
  }

  /**
   * Clear conversation history
   */
  clearConversationHistory(userId: string): void {
    this.conversationContexts.delete(userId);
  }

  // ============ PRIVATE HELPER METHODS ============
  
  private calculateTargets(user: UserData) {
    const { weight, height, activityLevel, goals } = user;
    
    // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor
    const age = user.age || 30;
    const baseBMR = user.gender === 'male' 
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
    
    // Activity multiplier
    const activityMultipliers: { [key: string]: number } = {
      'sedentary': 1.2,
      'lightly-active': 1.375,
      'moderately-active': 1.55,
      'very-active': 1.725,
    };
    
    let calorieTarget = Math.round(baseBMR * (activityMultipliers[activityLevel] || 1.2));
    
    // Adjust based on goals
    if (goals.includes('weight-loss')) calorieTarget -= 500;
    if (goals.includes('muscle-gain') || goals.includes('weight-gain')) calorieTarget += 300;
    
    // Water target (30ml per kg of body weight)
    const waterTarget = parseFloat(((weight * 30) / 1000).toFixed(1)); // in liters
    
    // Steps target based on activity level
    const stepsTargets: { [key: string]: number } = {
      'sedentary': 6000,
      'lightly-active': 8000,
      'moderately-active': 10000,
      'very-active': 12000,
    };
    const stepsTarget = stepsTargets[activityLevel] || 8000;
    
    return { calorieTarget, waterTarget, stepsTarget };
  }

  private generateIndianMealPlan(user: UserData, calorieTarget: number) {
    const isVeg = !user.goals?.includes('high-protein-non-veg');
    
    const breakfasts = [
      'Idli (3 pieces) with sambar and coconut chutney',
      'Poha with peanuts and curry leaves',
      'Upma with vegetables',
      'Paratha (2) with curd and pickle',
      'Dosa with sambar and chutney',
    ];
    
    const lunches = isVeg ? [
      'Dal, roti (3), rice, vegetable curry, salad, curd',
      'Rajma with rice, salad, and raita',
      'Mixed vegetable curry, dal, roti (3), curd',
      'Paneer curry, roti (3), rice, cucumber raita',
    ] : [
      'Chicken curry, roti (3), salad, curd',
      'Fish curry, rice, dal, vegetables',
      'Egg curry, roti (3), salad',
      'Chicken biryani (small portion) with raita',
    ];
    
    const dinners = isVeg ? [
      'Dal khichdi with vegetables and curd',
      'Vegetable soup, roti (2), paneer curry',
      'Mixed dal, roti (2), sautéed vegetables',
      'Vegetable pulao with raita',
    ] : [
      'Grilled chicken, roti (2), vegetable soup',
      'Fish tikka, roti (2), salad',
      'Egg bhurji, roti (2), curd',
      'Chicken soup, roti (2), salad',
    ];
    
    const snacks = [
      'Fruit chaat (apple, banana, orange)',
      'Roasted chana (chickpeas)',
      'Sprouts salad',
      'Buttermilk with jeera',
      'Mixed nuts (almonds, walnuts)',
    ];
    
    return {
      breakfast: breakfasts[Math.floor(Math.random() * breakfasts.length)],
      midMorningSnack: snacks[Math.floor(Math.random() * snacks.length)],
      lunch: lunches[Math.floor(Math.random() * lunches.length)],
      eveningSnack: 'Green tea with 2 Marie biscuits',
      dinner: dinners[Math.floor(Math.random() * dinners.length)],
    };
  }

  private generateExercise(user: UserData): string {
    const exercises = {
      'sedentary': '20-minute walk + 10 basic stretches',
      'lightly-active': '30-minute brisk walk + 15 bodyweight exercises',
      'moderately-active': '40-minute workout (cardio + strength)',
      'very-active': '45-minute intense workout session',
    };
    
    return exercises[user.activityLevel] || '30-minute moderate activity';
  }

  private generateMotivation(user: UserData, context?: string): string {
    const motivations = [
      `🌟 Great job ${user.name}! Every small step counts towards a healthier you!`,
      `💪 You're doing amazing! Your dedication to health will transform your life!`,
      `🎯 Remember ${user.name}, consistency beats perfection. Keep going!`,
      `🌈 Your health journey is unique and beautiful. Celebrate every milestone!`,
      `⭐ ${user.name}, you're stronger than you think. Today is another chance to shine!`,
      `🏆 Progress, not perfection. You're building lifelong healthy habits!`,
      `🌸 Your body is your temple. Treat it with love and care today!`,
      `✨ Small changes today = Big results tomorrow. You've got this!`,
    ];
    
    return motivations[Math.floor(Math.random() * motivations.length)];
  }

  private generateHealthTips(user: UserData): string[] {
    const tips = [
      'Drink water 30 minutes before meals for better digestion',
      'Take short walking breaks every hour if you sit for work',
      'Include seasonal fruits and vegetables in your diet',
      'Practice deep breathing for 5 minutes daily to reduce stress',
      'Avoid screen time 1 hour before sleep for better rest',
    ];
    
    // Add condition-specific tips
    if (user.medicalConditions?.some(c => c.name.toLowerCase().includes('diabetes'))) {
      tips.push('Monitor blood sugar levels regularly and avoid refined sugars');
    }
    
    if (user.medicalConditions?.some(c => c.name.toLowerCase().includes('pressure'))) {
      tips.push('Limit salt intake and practice stress management techniques');
    }
    
    return tips.slice(0, 5);
  }

  private getMealCalories(mealType: string, dailyTarget: number): number {
    const distribution: { [key: string]: number } = {
      'breakfast': 0.3,
      'lunch': 0.35,
      'dinner': 0.25,
      'snack': 0.05,
    };
    
    return Math.round(dailyTarget * (distribution[mealType] || 0.25));
  }

  private getIndianFoodOptions(mealType: string, user: UserData) {
    // Simplified food database
    const foods = [
      { name: 'Roti', portion: '2 pieces', calories: 240, benefits: 'Whole wheat provides fiber and energy' },
      { name: 'Dal', portion: '1 bowl', calories: 180, benefits: 'Rich in protein and essential amino acids' },
      { name: 'Rice', portion: '1 cup', calories: 200, benefits: 'Quick energy source, easy to digest' },
      { name: 'Vegetables', portion: '1 bowl', calories: 80, benefits: 'Vitamins, minerals, and antioxidants' },
    ];
    
    return foods.slice(0, 3);
  }

  private getAlternatives(mealType: string): string[] {
    const alternatives: { [key: string]: string[] } = {
      'breakfast': ['Oats porridge', 'Besan chilla', 'Moong dal chilla', 'Vegetable daliya'],
      'lunch': ['Brown rice bowl', 'Millet roti', 'Quinoa pulao', 'Whole wheat pasta'],
      'dinner': ['Khichdi', 'Vegetable soup', 'Grilled vegetables', 'Salad bowl'],
      'snack': ['Fruit bowl', 'Dry fruits', 'Makhana', 'Boiled eggs'],
    };
    
    return alternatives[mealType] || ['Healthy homemade options'];
  }

  private generateContextualResponse(message: string, user: UserData, context: AIConversationContext): string {
    const lowerMessage = message.toLowerCase();
    
    // Health queries
    if (lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('meal')) {
      return `Based on your profile, ${user.name}, I recommend a balanced diet with traditional Indian foods. Your daily calorie target is around ${this.calculateTargets(user).calorieTarget} calories. Would you like specific meal suggestions?`;
    }
    
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
      return `Great question! Given your ${user.activityLevel} activity level, I suggest ${this.generateExercise(user)}. Remember to start slow and gradually increase intensity. Your goal is ${this.calculateTargets(user).stepsTarget} steps daily!`;
    }
    
    if (lowerMessage.includes('water') || lowerMessage.includes('hydration')) {
      const waterTarget = this.calculateTargets(user).waterTarget;
      return `You should aim for ${waterTarget} liters of water daily. I'll remind you throughout the day. Start your morning with 2 glasses of warm water!`;
    }
    
    if (lowerMessage.includes('sleep') || lowerMessage.includes('rest')) {
      return `Quality sleep is crucial! Based on your schedule (wake up: ${user.wakeUpTime}, sleep: ${user.sleepTime}), you're on track. Aim for 7-8 hours. Avoid screens 1 hour before bed!`;
    }
    
    if (lowerMessage.includes('weight') || lowerMessage.includes('bmi')) {
      const bmi = user.bmi || (user.weight / Math.pow(user.height / 100, 2)).toFixed(1);
      return `Your current BMI is approximately ${bmi}. ${user.goals.includes('weight-loss') ? "Let's work on healthy weight loss through balanced nutrition and regular activity!" : "Let's maintain your healthy lifestyle!"}`;
    }
    
    // Motivational queries
    if (lowerMessage.includes('motivate') || lowerMessage.includes('encourage')) {
      return this.generateMotivation(user);
    }
    
    // Default helpful response
    return `I'm here to help you with your health journey, ${user.name}! I can assist with diet plans, exercise routines, health tips, and motivation. I remember our previous conversations and will personalize advice based on your progress. What would you like to know more about?`;
  }
}

export const aiHealthService = new AIHealthService();
