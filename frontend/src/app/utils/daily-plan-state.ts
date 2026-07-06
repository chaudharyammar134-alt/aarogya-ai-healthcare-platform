import type { UserData } from "../types/user";
import {
  apiClient,
  type DailyHealthLog,
  type DailyPlanRecord,
  type SleepLog,
} from "./api-client";
import {
  generatePersonalizedDayPlan,
  type GeneratedDayPlan,
} from "./day-plan-generator";

export type PlanBundleSource = "saved" | "generated" | "preview";

export interface TodayPlanBundle {
  recentLogs: DailyHealthLog[];
  sleepLogs: SleepLog[];
  todaySleepLog: SleepLog | null;
  planRecord: DailyPlanRecord | null;
  generatedPlan: GeneratedDayPlan | null;
  effectiveUser: UserData;
  source: PlanBundleSource;
  error?: string | null;
}

export const todayPlanDate = () => new Date().toISOString().slice(0, 10);

export const buildFallbackUser = (): UserData => ({
  name: "Arogya User",
  phone: "",
  age: 28,
  gender: "female",
  language: "english",
  weight: 62,
  height: 165,
  occupation: "office-worker",
  wakeUpTime: "07:00",
  sleepTime: "23:00",
  activityLevel: "lightly-active",
  goals: ["general-wellness"],
  medicalConditions: [],
});

export const getProteinTargetForUser = (user: UserData | null) => {
  const weight = user?.weight ?? 65;
  const goals = (user?.goals ?? []).map((goal) => goal.toLowerCase());

  if (goals.some((goal) => goal.includes("muscle"))) {
    return Math.round(weight * 1.6);
  }
  if (goals.some((goal) => goal.includes("weight loss"))) {
    return Math.round(weight * 1.2);
  }
  return Math.round(weight);
};

type LoadTodayPlanOptions = {
  healthDays?: number;
  sleepDays?: number;
  ensurePlan?: boolean;
};

export const loadTodayPlanBundle = async (
  user: UserData | null,
  options: LoadTodayPlanOptions = {},
): Promise<TodayPlanBundle> => {
  const baseUser = user ?? buildFallbackUser();

  if (!user?.id) {
    return {
      recentLogs: [],
      sleepLogs: [],
      todaySleepLog: null,
      planRecord: null,
      generatedPlan: generatePersonalizedDayPlan(baseUser, []),
      effectiveUser: baseUser,
      source: "preview",
      error: null,
    };
  }

  const [logsResponse, sleepResponse, planResponse] = await Promise.all([
    apiClient.getDailyHealthLogs(user.id, options.healthDays ?? 7),
    apiClient.getSleepLogs(user.id, {
      days: options.sleepDays ?? 14,
      date: undefined,
    }),
    apiClient.getDailyPlan(user.id, todayPlanDate()),
  ]);

  const recentLogs = logsResponse.data?.logs ?? [];
  const sleepLogs = sleepResponse.data?.logs ?? [];
  const todaySleepLog =
    sleepLogs.find((entry) => entry.logDate === todayPlanDate()) ?? null;
  const effectiveUser: UserData = {
    ...baseUser,
    wakeUpTime: todaySleepLog?.wakeUpTime ?? baseUser.wakeUpTime,
    sleepTime: todaySleepLog?.sleepTime ?? baseUser.sleepTime,
  };

  if (planResponse.data?.plan) {
    const savedPlan = planResponse.data.plan;
    return {
      recentLogs,
      sleepLogs,
      todaySleepLog,
      planRecord: savedPlan,
      generatedPlan: savedPlan.generatedPlan,
      effectiveUser: {
        ...effectiveUser,
        ...savedPlan.inputSnapshot,
      },
      source: "saved",
      error: null,
    };
  }

  if (options.ensurePlan !== false) {
    const generatedResponse = await apiClient.generateDailyPlan(
      user.id,
      effectiveUser,
      {
        planDate: todayPlanDate(),
      },
    );

    if (generatedResponse.success && generatedResponse.data?.plan) {
      return {
        recentLogs,
        sleepLogs,
        todaySleepLog,
        planRecord: generatedResponse.data.plan,
        generatedPlan: generatedResponse.data.plan.generatedPlan,
        effectiveUser: {
          ...effectiveUser,
          ...generatedResponse.data.plan.inputSnapshot,
        },
        source: "generated",
        error: null,
      };
    }

    return {
      recentLogs,
      sleepLogs,
      todaySleepLog,
      planRecord: null,
      generatedPlan: generatePersonalizedDayPlan(effectiveUser, recentLogs),
      effectiveUser,
      source: "preview",
      error: generatedResponse.error ?? "Unable to sync today's plan.",
    };
  }

  return {
    recentLogs,
    sleepLogs,
    todaySleepLog,
    planRecord: null,
    generatedPlan: null,
    effectiveUser,
    source: "preview",
    error: null,
  };
};
