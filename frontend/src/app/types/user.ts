export interface MedicalCondition {
  name: string;
  severity: "mild" | "moderate" | "severe";
  medications?: string[];
  restrictions?: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: "monthly" | "yearly";
  features: string[];
  popular?: boolean;
  familySize?: number;
}

export interface UserSubscription {
  planId: string;
  planName: string;
  price: number;
  startDate: string;
  renewalDate: string;
  status: "active" | "expired" | "cancelled" | "pending";
  paymentMethod: string;
  transactionId: string;
  autoRenewal: boolean;
}

export interface UserData {
  id?: string;
  email?: string;
  role?: "user" | "admin";
  status?: string;
  name: string;
  phone: string;
  age: number;
  gender: "male" | "female" | "other";
  language: "english" | "hindi" | "regional";
  weight: number;
  height: number;
  bmi?: number;
  occupation:
    | "student"
    | "office-worker"
    | "manual-worker"
    | "night-shift"
    | "healthcare"
    | "homemaker"
    | "retired"
    | "other";
  wakeUpTime: string;
  sleepTime: string;
  workingHours?: string;
  activityLevel:
    | "sedentary"
    | "lightly-active"
    | "moderately-active"
    | "very-active";
  goals: string[];
  targetWeight?: number;
  medicalConditions: MedicalCondition[];
  allergies?: string[];
  currentMedications?: string[];
  aiPreferences?: {
    preferredMealTypes: string[];
    dislikedFoods: string[];
    exercisePreferences: string[];
    followedRecommendations: number;
    totalRecommendations: number;
  };
  notificationPreferences?: {
    waterReminders: boolean;
    mealReminders: boolean;
    exerciseReminders: boolean;
    medicationReminders: boolean;
  };
  subscription?: UserSubscription;
}
