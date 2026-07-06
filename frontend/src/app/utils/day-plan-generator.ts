import type { UserData } from "../types/user";
import type { DailyHealthLog } from "./api-client";

export type DayPlanTaskType =
  | "wake_up"
  | "hydration"
  | "meal"
  | "activity"
  | "exercise"
  | "focus"
  | "wellness"
  | "sleep";

export interface GeneratedDayPlanTask {
  id: string;
  time: string;
  type: DayPlanTaskType;
  title: string;
  description: string;
  duration: string;
  rationale: string;
  energy: "low" | "steady" | "high";
  completed: boolean;
}

export interface GeneratedDayPlan {
  id: string;
  generatedAt: string;
  summary: {
    wakeUpTime: string;
    sleepTime: string;
    awakeHours: number;
    calorieTarget: number;
    waterTargetLiters: number;
    waterTargetGlasses: number;
    stepsTarget: number;
    focusAreas: string[];
    insight: string;
  };
  tasks: GeneratedDayPlanTask[];
}

const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  "lightly-active": 1.375,
  "moderately-active": 1.55,
  "very-active": 1.725,
};

const stepsTargets: Record<string, number> = {
  sedentary: 6500,
  "lightly-active": 8500,
  "moderately-active": 10000,
  "very-active": 12000,
};

const normalizeGoal = (goal: string) =>
  goal.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

const parseTime = (value: string | undefined, fallback: string) => {
  const safe = value && /^\d{2}:\d{2}$/.test(value) ? value : fallback;
  const [hour, minute] = safe.split(":").map(Number);
  return hour * 60 + minute;
};

const formatTime = (absoluteMinutes: number) => {
  const normalized = ((absoluteMinutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
};

const formatDuration = (minutes: number) =>
  minutes >= 60
    ? `${Math.floor(minutes / 60)} hr${minutes >= 120 ? "s" : ""}${
        minutes % 60 ? ` ${minutes % 60} min` : ""
      }`
    : `${minutes} min`;

const createTask = (
  id: string,
  absoluteMinutes: number,
  type: DayPlanTaskType,
  title: string,
  description: string,
  durationMinutes: number,
  rationale: string,
  energy: GeneratedDayPlanTask["energy"],
): GeneratedDayPlanTask => ({
  id,
  time: formatTime(absoluteMinutes),
  type,
  title,
  description,
  duration: formatDuration(durationMinutes),
  rationale,
  energy,
  completed: false,
});

const getLatestLog = (logs: DailyHealthLog[]) =>
  [...logs].sort((a, b) => b.logDate.localeCompare(a.logDate))[0];

const hasCondition = (user: UserData, terms: string[]) =>
  (user.medicalConditions ?? []).some((condition) =>
    terms.some((term) =>
      condition.name.toLowerCase().includes(term.toLowerCase()),
    ),
  );

const calculateTargets = (user: UserData, awakeHours: number) => {
  const weight = user.weight || 65;
  const height = user.height || 165;
  const age = user.age || 30;
  const activityLevel = user.activityLevel || "lightly-active";
  const normalizedGoals = (user.goals ?? []).map(normalizeGoal);
  const gender = user.gender || "other";

  const baseBmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  let calorieTarget = Math.round(
    baseBmr * (activityMultipliers[activityLevel] || 1.375),
  );

  if (normalizedGoals.includes("weight-loss")) {
    calorieTarget -= 350;
  }
  if (
    normalizedGoals.includes("muscle-building") ||
    normalizedGoals.includes("muscle-gain") ||
    normalizedGoals.includes("weight-gain")
  ) {
    calorieTarget += 250;
  }

  let waterTargetLiters = (weight * 30) / 1000;

  if (awakeHours >= 16) {
    waterTargetLiters += 0.5;
  } else if (awakeHours >= 14) {
    waterTargetLiters += 0.3;
  } else if (awakeHours <= 11) {
    waterTargetLiters -= 0.2;
  }

  if (activityLevel === "moderately-active") {
    waterTargetLiters += 0.2;
  } else if (activityLevel === "very-active") {
    waterTargetLiters += 0.4;
  }

  if (
    normalizedGoals.includes("weight-loss") ||
    normalizedGoals.includes("general-fitness") ||
    normalizedGoals.includes("muscle-building")
  ) {
    waterTargetLiters += 0.1;
  }

  if (hasCondition(user, ["diabetes", "blood pressure", "heart"])) {
    waterTargetLiters += 0.1;
  }

  waterTargetLiters = Number(Math.max(2, waterTargetLiters).toFixed(1));
  const waterTargetGlasses = Math.max(8, Math.round(waterTargetLiters * 4));
  const stepsTarget = stepsTargets[activityLevel] || 8500;

  return {
    calorieTarget,
    waterTargetLiters,
    waterTargetGlasses,
    stepsTarget,
  };
};

const getExerciseBlock = (
  user: UserData,
  latestLog?: DailyHealthLog,
) => {
  const normalizedGoals = (user.goals ?? []).map(normalizeGoal);
  const sleptPoorly = (latestLog?.sleepHours ?? 7) < 6.5;
  const hasJointConcern = hasCondition(user, [
    "arthritis",
    "knee",
    "back",
    "joint",
  ]);
  const hasHeartConcern = hasCondition(user, ["heart", "blood pressure"]);

  if (sleptPoorly) {
    return {
      title: "Recovery movement",
      description: "Light walk, mobility, and breathing instead of intense training",
      duration: 20,
      rationale:
        "Your last sleep log suggests recovery should come before intensity today.",
      energy: "low" as const,
    };
  }

  if (
    normalizedGoals.includes("muscle-building") ||
    normalizedGoals.includes("muscle-gain")
  ) {
    return {
      title: "Strength session",
      description: "Compound bodyweight or resistance work with protein-focused recovery",
      duration: 35,
      rationale:
        "Your goal points toward muscle-building, so the plan prioritizes structured strength work.",
      energy: "high" as const,
    };
  }

  if (hasJointConcern || hasHeartConcern) {
    return {
      title: "Low-impact cardio",
      description: "Brisk walk or gentle cycling with controlled effort",
      duration: 25,
      rationale:
        "Your health profile favors steady low-impact movement over sharp spikes in intensity.",
      energy: "steady" as const,
    };
  }

  if (user.activityLevel === "sedentary" || user.occupation === "office-worker") {
    return {
      title: "Mobility plus walk",
      description: "Short mobility reset followed by a brisk walk",
      duration: 25,
      rationale:
        "This helps counter long sitting hours and raises daily movement without being overwhelming.",
      energy: "steady" as const,
    };
  }

  return {
    title: "Focused exercise block",
    description: "Moderate cardio or mixed movement session",
    duration: 30,
    rationale:
      "Your activity profile supports a balanced movement session to build consistency.",
    energy: "high" as const,
  };
};

const getMealDescriptions = (user: UserData) => {
  const normalizedGoals = (user.goals ?? []).map(normalizeGoal);
  const diabetic = hasCondition(user, ["diabetes"]);
  const bp = hasCondition(user, ["blood pressure", "heart"]);
  const pcos = hasCondition(user, ["pcos", "pcod"]);

  let breakfast =
    "Protein-first breakfast with fiber, such as eggs or paneer with fruit and oats";
  let lunch =
    "Balanced lunch with dal or protein, vegetables, curd, and controlled carbs";
  let dinner =
    "Light dinner with vegetables and protein, kept comfortably before sleep";

  if (diabetic) {
    breakfast =
      "Low-glycemic breakfast like vegetable oats, eggs, or paneer with no sugary drink";
    lunch =
      "Controlled-carb lunch with dal, sabzi, salad, and steady protein";
  }

  if (bp) {
    lunch =
      "Low-salt lunch with fresh vegetables, dal, curd, and minimal processed food";
    dinner =
      "Light, low-salt dinner to reduce overnight heaviness and support recovery";
  }

  if (
    normalizedGoals.includes("weight-loss") ||
    normalizedGoals.includes("general-fitness")
  ) {
    dinner =
      "Early light dinner with strong protein and vegetables to support fat loss and sleep";
  }

  if (
    normalizedGoals.includes("muscle-building") ||
    normalizedGoals.includes("weight-gain")
  ) {
    breakfast =
      "Higher-protein breakfast with eggs, paneer, milk, nuts, and a slow carb";
    lunch =
      "Energy-supporting lunch with protein, rice or roti, vegetables, and curd";
  }

  if (pcos) {
    breakfast =
      "Protein-rich breakfast with fiber and stable carbs to reduce energy crashes";
  }

  return { breakfast, lunch, dinner };
};

const buildFocusAreas = (user: UserData, latestLog?: DailyHealthLog) => {
  const goals = (user.goals ?? []).map(normalizeGoal);
  const focusAreas = new Set<string>();

  if (goals.includes("better-sleep") || goals.includes("stress-management")) {
    focusAreas.add("recovery");
  }
  if (
    goals.includes("weight-loss") ||
    goals.includes("muscle-building") ||
    goals.includes("general-fitness")
  ) {
    focusAreas.add("movement");
  }
  if (
    goals.includes("nutrition-improvement") ||
    goals.includes("diabetes-management")
  ) {
    focusAreas.add("meal timing");
  }
  if ((latestLog?.waterGlasses ?? 0) < 6) {
    focusAreas.add("hydration");
  }
  if ((latestLog?.sleepHours ?? 7) < 6.5) {
    focusAreas.add("sleep recovery");
  }
  if (!focusAreas.size) {
    focusAreas.add("consistency");
    focusAreas.add("energy balance");
  }

  return Array.from(focusAreas);
};

export const generatePersonalizedDayPlan = (
  user: UserData,
  recentLogs: DailyHealthLog[] = [],
): GeneratedDayPlan => {
  const wakeMinutes = parseTime(user.wakeUpTime, "07:00");
  let sleepMinutes = parseTime(user.sleepTime, "23:00");
  if (sleepMinutes <= wakeMinutes) {
    sleepMinutes += 1440;
  }

  const awakeHours = Number(((sleepMinutes - wakeMinutes) / 60).toFixed(1));
  const latestLog = getLatestLog(recentLogs);
  const targets = calculateTargets(user, awakeHours);
  const meals = getMealDescriptions(user);
  const exercise = getExerciseBlock(user, latestLog);
  const focusAreas = buildFocusAreas(user, latestLog);

  const firstHydration = wakeMinutes;
  const firstMovement = wakeMinutes + 20;
  const breakfastTime = wakeMinutes + 60;
  const midMorningHydration = wakeMinutes + 180;
  const focusResetTime = wakeMinutes + 270;
  const lunchTime = wakeMinutes + Math.round((sleepMinutes - wakeMinutes) * 0.42);
  const postLunchWalk = lunchTime + 30;
  const afternoonHydration = lunchTime + 150;
  const exerciseTime = Math.min(
    sleepMinutes - 240,
    Math.max(lunchTime + 210, wakeMinutes + 480),
  );
  const dinnerTime = Math.max(wakeMinutes + 720, sleepMinutes - 210);
  const windDownTime = sleepMinutes - 60;

  const sleptPoorly = (latestLog?.sleepHours ?? 7) < 6.5;
  const lowHydration = (latestLog?.waterGlasses ?? targets.waterTargetGlasses) < 6;
  const nightShift = user.occupation === "night-shift";
  const diabetic = hasCondition(user, ["diabetes"]);
  const bp = hasCondition(user, ["blood pressure", "heart"]);

  const tasks: GeneratedDayPlanTask[] = [
    createTask(
      "wake",
      firstHydration,
      "wake_up",
      nightShift ? "Wake and reset your body clock" : "Wake and hydrate",
      lowHydration
        ? "Start with 2 glasses of water to recover from yesterday's low hydration"
        : "Start with 1-2 glasses of water before caffeine",
      10,
      nightShift
        ? "Your plan supports a shifted routine, so the first block focuses on alertness and hydration right after waking."
        : "Hydration early in the day improves alertness, digestion, and recovery.",
      "steady",
    ),
    createTask(
      "morning-mobility",
      firstMovement,
      "activity",
      sleptPoorly ? "Gentle mobility and breathing" : "Morning mobility block",
      sleptPoorly
        ? "5 minutes of breathing and light stretching before harder activity"
        : "Sunlight, breathing, and mobility to activate your day",
      15,
      sleptPoorly
        ? "Poor recent sleep shifts the plan toward lower strain and nervous system recovery."
        : "A short movement block improves energy without making the routine hard to follow.",
      sleptPoorly ? "low" : "steady",
    ),
    createTask(
      "breakfast",
      breakfastTime,
      "meal",
      "Breakfast for your first energy block",
      meals.breakfast,
      25,
      "Breakfast timing is anchored close to wake time so your energy curve stays more stable through the morning.",
      "steady",
    ),
    createTask(
      "mid-hydration",
      midMorningHydration,
      "hydration",
      diabetic ? "Water plus steady snack check" : "Mid-morning hydration",
      diabetic
        ? "Hydrate and use a fiber- or protein-based snack if hunger is rising"
        : "Drink water and avoid drifting into a long dehydrated work stretch",
      10,
      diabetic
        ? "Your plan favors steadier energy and fewer long fasting gaps."
        : "A hydration block here keeps the day from becoming front-loaded only.",
      "steady",
    ),
    createTask(
      "focus-reset",
      focusResetTime,
      user.occupation === "office-worker" ? "focus" : "activity",
      user.occupation === "office-worker"
        ? "Desk posture and eye break"
        : "Body reset break",
      user.occupation === "office-worker"
        ? "Stand up, stretch your hips and shoulders, and rest your eyes for a few minutes"
        : "Take a short movement break to reduce stiffness and keep energy up",
      8,
      user.occupation === "office-worker"
        ? "Your occupation suggests long sitting blocks, so posture relief is built directly into the schedule."
        : "Small resets help the full-day plan feel realistic instead of overly ideal.",
      "low",
    ),
    createTask(
      "lunch",
      lunchTime,
      "meal",
      "Balanced lunch",
      meals.lunch,
      30,
      "Lunch is placed near the middle of your awake window so the plan works even when your sleep schedule shifts.",
      "steady",
    ),
    createTask(
      "post-lunch",
      postLunchWalk,
      "activity",
      diabetic ? "Post-meal walk" : "Post-lunch reset",
      diabetic
        ? "10-15 minutes of light walking after lunch"
        : "Short walk or standing reset after your meal",
      15,
      diabetic
        ? "This supports steadier post-meal blood sugar and digestion."
        : "A short reset reduces the afternoon slump and keeps the plan realistic.",
      "low",
    ),
    createTask(
      "afternoon-hydration",
      afternoonHydration,
      "hydration",
      bp ? "Hydration and low-salt snack check" : "Afternoon hydration",
      bp
        ? "Hydrate and keep packaged salty snacks out of the afternoon routine"
        : "Water, coconut water, or a simple hydration break",
      10,
      bp
        ? "Your profile points toward heart-friendly choices across the full day, not just one meal."
        : "This keeps hydration distributed instead of trying to catch up at night.",
      "steady",
    ),
    createTask(
      "exercise",
      exerciseTime,
      "exercise",
      exercise.title,
      exercise.description,
      exercise.duration,
      exercise.rationale,
      exercise.energy,
    ),
    createTask(
      "dinner",
      dinnerTime,
      "meal",
      "Early evening dinner",
      meals.dinner,
      30,
      "Dinner is kept away from sleep time so digestion does not compete with overnight recovery.",
      "steady",
    ),
    createTask(
      "wind-down",
      windDownTime,
      "sleep",
      "Wind-down routine",
      sleptPoorly
        ? "Low light, no heavy screen use, and calm breathing before bed"
        : "Quiet screen-off routine, light reflection, and sleep preparation",
      30,
      sleptPoorly
        ? "Your recent data suggests sleep quality needs active protection tonight."
        : "A repeatable wind-down routine is what turns a plan into a habit.",
      "low",
    ),
  ];

  const insight = sleptPoorly
    ? "Recent sleep looks low, so today leans toward steadier energy, more recovery, and less intensity."
    : lowHydration
      ? "Hydration is the clearest gap from your recent log, so the plan spreads water prompts across the day."
      : user.occupation === "office-worker"
        ? "Your plan is built to break long sitting periods while still fitting a realistic workday."
        : nightShift
          ? "Your routine is shifted to respect a non-standard wake and sleep cycle rather than forcing a daytime template."
          : "Your plan balances energy, meals, movement, and recovery across the full time you are awake.";

  return {
    id: `day_plan_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    summary: {
      wakeUpTime: formatTime(wakeMinutes),
      sleepTime: formatTime(sleepMinutes),
      awakeHours,
      calorieTarget: targets.calorieTarget,
      waterTargetLiters: targets.waterTargetLiters,
      waterTargetGlasses: targets.waterTargetGlasses,
      stepsTarget: targets.stepsTarget,
      focusAreas,
      insight,
    },
    tasks,
  };
};
