import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Apple,
  ChevronRight,
  Droplets,
  Edit3,
  Footprints,
  Heart,
  Moon,
  Save,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { BottomNavigation } from "./BottomNavigation";
import type { Screen, UserData } from "../App";
import {
  apiClient,
  type DailyHealthLog,
  type SymptomLog,
} from "../utils/api-client";
import type { GeneratedDayPlan } from "../utils/day-plan-generator";
import {
  getProteinTargetForUser,
  loadTodayPlanBundle,
} from "../utils/daily-plan-state";

interface ProgressScreenProps {
  user: UserData | null;
  onNavigate: (screen: Screen) => void;
}

type Mood = DailyHealthLog["mood"];

const todayDate = () => new Date().toISOString().slice(0, 10);

const moodScoreMap: Record<Mood, number> = {
  low: 40,
  okay: 60,
  good: 80,
  great: 95,
};

const formatDateLabel = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

const average = (values: number[]) =>
  values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;

const roundMetric = (value: number, digits = 0) =>
  Number(value.toFixed(digits));

const calculateHealthScore = (
  log: Partial<DailyHealthLog>,
  plan: GeneratedDayPlan | null,
  proteinTarget: number,
) => {
  const waterTarget = Math.max(plan?.summary.waterTargetGlasses ?? 8, 1);
  const stepsTarget = Math.max(plan?.summary.stepsTarget ?? 10000, 1);
  const proteinGoal = Math.max(proteinTarget, 1);
  const waterScore = Math.min(25, ((log.waterGlasses ?? 0) / waterTarget) * 25);
  const stepsScore = Math.min(25, ((log.steps ?? 0) / stepsTarget) * 25);
  const sleepValue = log.sleepHours ?? 0;
  const sleepScore =
    sleepValue >= 7 && sleepValue <= 9
      ? 20
      : Math.min(20, (sleepValue / 8) * 20);
  const proteinScore = Math.min(15, ((log.proteinGrams ?? 0) / proteinGoal) * 15);
  const moodScore = (moodScoreMap[(log.mood ?? "good") as Mood] / 100) * 15;

  return Math.round(
    waterScore + stepsScore + sleepScore + proteinScore + moodScore,
  );
};

const metricConfig = [
  {
    metric: "Water Intake",
    key: "waterGlasses" as const,
    target: 8,
    unit: "glasses/day",
    icon: Droplets,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    digits: 1,
  },
  {
    metric: "Daily Steps",
    key: "steps" as const,
    target: 10000,
    unit: "steps/day",
    icon: Footprints,
    color: "text-green-500",
    bgColor: "bg-green-50",
    digits: 0,
  },
  {
    metric: "Calories Consumed",
    key: "caloriesConsumed" as const,
    target: 2000,
    unit: "kcal/day",
    icon: Zap,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    digits: 0,
  },
  {
    metric: "Protein Intake",
    key: "proteinGrams" as const,
    target: 60,
    unit: "grams/day",
    icon: Apple,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    digits: 0,
  },
];

const emptyCheckIn = {
  waterGlasses: "0",
  steps: "0",
  sleepHours: "",
  caloriesConsumed: "0",
  caloriesBurned: "0",
  proteinGrams: "0",
  mood: "good" as Mood,
  notes: "",
  symptom: "",
  symptomSeverity: "mild" as SymptomLog["severity"],
  symptomDuration: "",
};

export function ProgressScreen({ user, onNavigate }: ProgressScreenProps) {
  const [logs, setLogs] = useState<DailyHealthLog[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomLog[]>([]);
  const [activePlan, setActivePlan] = useState<GeneratedDayPlan | null>(null);
  const [activePlanReason, setActivePlanReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showAdvancedEntry, setShowAdvancedEntry] = useState(false);
  const [checkIn, setCheckIn] = useState(emptyCheckIn);

  const loadHealthData = useCallback(async () => {
    setIsLoading(true);
    const [bundle, symptomsResponse] = await Promise.all([
      loadTodayPlanBundle(user, {
        healthDays: 7,
        sleepDays: 14,
        ensurePlan: true,
      }),
      user?.id ? apiClient.getSymptomLogs(user.id, 5) : Promise.resolve({
        success: true,
        data: { symptoms: [] },
        source: "local" as const,
      }),
    ]);

    const logList = bundle.recentLogs;
    const symptomList = symptomsResponse.data?.symptoms ?? [];
    setLogs(logList);
    setSymptoms(symptomList);
    setActivePlan(bundle.generatedPlan);
    setActivePlanReason(bundle.planRecord?.updateReason ?? bundle.error ?? null);

    const todayLog = logList.find((entry) => entry.logDate === todayDate());
    if (todayLog) {
      setCheckIn({
        waterGlasses: String(todayLog.waterGlasses),
        steps: String(todayLog.steps),
        sleepHours:
          todayLog.sleepHours === null ? "" : String(todayLog.sleepHours),
        caloriesConsumed: String(todayLog.caloriesConsumed ?? 0),
        caloriesBurned: String(todayLog.caloriesBurned),
        proteinGrams: String(todayLog.proteinGrams),
        mood: todayLog.mood,
        notes: todayLog.notes ?? "",
        symptom: "",
        symptomSeverity: "mild",
        symptomDuration: "",
      });
    }

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    void loadHealthData();
  }, [loadHealthData]);

  useEffect(() => {
    if (!user?.id) return;
    return apiClient.subscribeToUserHealthData(user.id, () => {
      void loadHealthData();
    });
  }, [loadHealthData, user?.id]);

  const proteinTarget = useMemo(() => getProteinTargetForUser(user), [user]);

  const weeklyOverview = useMemo(() => {
    const water = logs.map((entry) => entry.waterGlasses);
    const steps = logs.map((entry) => entry.steps);
    const calories = logs.map((entry) => entry.caloriesConsumed ?? 0);
    const protein = logs.map((entry) => entry.proteinGrams);
    const sleep = logs
      .map((entry) => entry.sleepHours)
      .filter((value): value is number => value !== null);
    const latest = logs[0];

    return {
      averages: {
        waterGlasses: roundMetric(average(water), 1),
        steps: roundMetric(average(steps)),
        caloriesConsumed: roundMetric(average(calories)),
        proteinGrams: roundMetric(average(protein)),
        sleepHours: roundMetric(average(sleep), 1),
      },
      latest,
      healthScore: calculateHealthScore(latest ?? {}, activePlan, proteinTarget),
    };
  }, [activePlan, logs, proteinTarget]);

  const weeklyGoals = useMemo(() => {
    const waterTarget = activePlan?.summary.waterTargetGlasses ?? 8;
    const stepsTarget = activePlan?.summary.stepsTarget ?? 10000;
    const completedWater = logs.filter((entry) => entry.waterGlasses >= waterTarget).length;
    const completedSteps = logs.filter((entry) => entry.steps >= stepsTarget).length;
    const completedSleep = logs.filter(
      (entry) => (entry.sleepHours ?? 0) >= 7,
    ).length;
    const completedProtein = logs.filter(
      (entry) => entry.proteinGrams >= proteinTarget,
    ).length;

    return [
      {
        goal: `Drink ${waterTarget} glasses of water daily`,
        completed: completedWater,
      },
      {
        goal: `Walk ${stepsTarget.toLocaleString("en-IN")} steps daily`,
        completed: completedSteps,
      },
      {
        goal: "Sleep at least 7 hours",
        completed: completedSleep,
      },
      {
        goal: `Hit ${proteinTarget}g protein intake`,
        completed: completedProtein,
      },
    ].map((item) => ({
      ...item,
      total: 7,
      progress: Math.round((item.completed / 7) * 100),
    }));
  }, [activePlan, logs, proteinTarget]);

  const insight = useMemo(() => {
    const latest = weeklyOverview.latest;
    if (!latest) {
      return "Start your first health check-in to unlock personalized progress insights.";
    }

    const waterTarget = activePlan?.summary.waterTargetGlasses ?? 8;
    const stepsTarget = activePlan?.summary.stepsTarget ?? 10000;
    if (latest.waterGlasses < Math.max(6, waterTarget - 2)) {
      return `Hydration is the biggest gap today. Moving closer to ${waterTarget} glasses would lift your plan score quickly.`;
    }
    if (latest.steps < Math.round(stepsTarget * 0.7)) {
      return `A short evening walk would make the biggest difference right now. You are still within reach of today's ${stepsTarget.toLocaleString("en-IN")} step target.`;
    }
    if ((latest.sleepHours ?? 0) < 7) {
      return "Your body may need more recovery. Try protecting your bedtime tonight to improve tomorrow's score.";
    }
    if (latest.proteinGrams < Math.round(proteinTarget * 0.85)) {
      return `Nutrition is the next lever. A protein-rich snack this evening could help you close in on the ${proteinTarget}g target.`;
    }

    return "Your consistency is improving. Keep the same rhythm for a few more days and your weekly health trend should stay strong.";
  }, [activePlan, proteinTarget, weeklyOverview.latest]);

  const userName = user?.name?.split(" ")[0] || "Friend";
  const metricTargets = useMemo(
    () => ({
      waterGlasses: activePlan?.summary.waterTargetGlasses ?? 8,
      steps: activePlan?.summary.stepsTarget ?? 10000,
      caloriesConsumed: activePlan?.summary.calorieTarget ?? 2000,
      proteinGrams: proteinTarget,
    }),
    [activePlan, proteinTarget],
  );

  const handleFieldChange = <K extends keyof typeof checkIn>(
    field: K,
    value: (typeof checkIn)[K],
  ) => {
    setCheckIn((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const incrementCheckInValue = (
    field:
      | "waterGlasses"
      | "steps"
      | "caloriesConsumed"
      | "caloriesBurned"
      | "proteinGrams",
    amount: number,
  ) => {
    setCheckIn((current) => {
      const nextValue = Number(current[field] || 0) + amount;
      return {
        ...current,
        [field]: String(Math.max(0, nextValue)),
      };
    });
  };

  const handleSave = async () => {
    if (!user?.id) {
      setSaveMessage("Please log in first to save your health data.");
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    const logResponse = await apiClient.saveDailyHealthLog(user.id, {
      logDate: todayDate(),
      waterGlasses: Number(checkIn.waterGlasses || 0),
      steps: Number(checkIn.steps || 0),
      sleepHours: checkIn.sleepHours ? Number(checkIn.sleepHours) : null,
      caloriesConsumed: Number(checkIn.caloriesConsumed || 0),
      caloriesBurned: Number(checkIn.caloriesBurned || 0),
      proteinGrams: Number(checkIn.proteinGrams || 0),
      mood: checkIn.mood,
      notes: checkIn.notes,
    });

    if (!logResponse.success || !logResponse.data?.log) {
      setSaveMessage(logResponse.error ?? "Could not save your check-in.");
      setIsSaving(false);
      return;
    }

    let nextSymptoms = symptoms;
    if (checkIn.symptom.trim()) {
      const symptomResponse = await apiClient.createSymptomLog(user.id, {
        symptom: checkIn.symptom.trim(),
        severity: checkIn.symptomSeverity,
        duration: checkIn.symptomDuration || undefined,
        notes: checkIn.notes || undefined,
      });

      if (symptomResponse.success && symptomResponse.data?.symptom) {
        nextSymptoms = [symptomResponse.data.symptom, ...symptoms].slice(0, 5);
      }
    }

    const planRefreshReason = checkIn.symptom.trim()
      ? "Today's plan updated automatically because you logged a symptom."
      : "Today's plan updated automatically because your health check-in changed.";
    const planRefreshSource: "progress" | "symptom" = checkIn.symptom.trim()
      ? "symptom"
      : "progress";

    const planResponse = await apiClient.generateDailyPlan(user.id, user, {
      planDate: todayDate(),
      updatedFrom: planRefreshSource,
      updateReason: planRefreshReason,
    });

    if (planResponse.success && planResponse.data?.plan) {
      setActivePlan(planResponse.data.plan.generatedPlan);
      setActivePlanReason(planResponse.data.plan.updateReason ?? planRefreshReason);
    }

    const nextLogs = [
      logResponse.data.log,
      ...logs.filter((entry) => entry.logDate !== logResponse.data?.log.logDate),
    ].sort((a, b) => b.logDate.localeCompare(a.logDate));

    setLogs(nextLogs);
    setSymptoms(nextSymptoms);
    setCheckIn((current) => ({
      ...current,
      symptom: "",
      symptomDuration: "",
    }));
    setSaveMessage(
      planResponse.success
        ? "Today's health check-in was saved, and your plan refreshed automatically."
        : "Today's health check-in was saved.",
    );
    setIsSaving(false);
  };

  const latestSymptoms = symptoms.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="wellness-green px-6 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white font-semibold text-xl">Your Progress</h1>
            <p className="text-white/80 text-sm">
              Real check-ins, real trends, {userName}.
            </p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30">
            Last 7 days
          </Badge>
        </div>

        <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-semibold">Health Score</h2>
              <p className="text-white/80 text-sm">Based on your latest saved check-in</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {weeklyOverview.healthScore}
              </div>
              <div className="text-white/80 text-sm">
                {weeklyOverview.latest
                  ? `Updated ${formatDateLabel(weeklyOverview.latest.logDate)}`
                  : "No data yet"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-white/10 px-3 py-3">
              <div className="text-white/70">Avg Water</div>
              <div className="text-white font-medium">
                {weeklyOverview.averages.waterGlasses} / 8 glasses
              </div>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-3">
              <div className="text-white/70">Avg Steps</div>
              <div className="text-white font-medium">
                {weeklyOverview.averages.steps.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-3">
              <div className="text-white/70">Avg Sleep</div>
              <div className="text-white font-medium">
                {weeklyOverview.averages.sleepHours || 0} hrs
              </div>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-3">
              <div className="text-white/70">Mood</div>
              <div className="text-white font-medium capitalize">
                {weeklyOverview.latest?.mood ?? "Not logged"}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        <Card className="shadow-wellness">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-wellness-dark">Today Check-in</h3>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-700">
                  Saved to profile
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedEntry((current) => !current)}
                  className="h-8 text-xs"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  {showAdvancedEntry ? "Hide details" : "Edit details"}
                </Button>
              </div>
            </div>

            <div className="space-y-4 mb-4">
              <div className="rounded-2xl bg-blue-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-wellness-dark">Water</div>
                    <div className="text-xs text-wellness-light">
                      Quick-add hydration instead of typing every glass
                    </div>
                  </div>
                  <Badge className="bg-white text-blue-700 border border-blue-200">
                    {checkIn.waterGlasses} glasses
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button type="button" variant="outline" onClick={() => incrementCheckInValue("waterGlasses", 1)}>
                    +1 glass
                  </Button>
                  <Button type="button" variant="outline" onClick={() => incrementCheckInValue("waterGlasses", 2)}>
                    +2 glasses
                  </Button>
                  <Button type="button" variant="outline" onClick={() => handleFieldChange("waterGlasses", "0")}>
                    Reset
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl bg-green-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-wellness-dark">Movement</div>
                    <div className="text-xs text-wellness-light">
                      Tap what you roughly did instead of entering every step manually
                    </div>
                  </div>
                  <Badge className="bg-white text-green-700 border border-green-200">
                    {Number(checkIn.steps || 0).toLocaleString("en-IN")} steps
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button type="button" variant="outline" onClick={() => incrementCheckInValue("steps", 500)}>
                    +500
                  </Button>
                  <Button type="button" variant="outline" onClick={() => incrementCheckInValue("steps", 1000)}>
                    +1000
                  </Button>
                  <Button type="button" variant="outline" onClick={() => incrementCheckInValue("steps", 2500)}>
                    +2500
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl bg-orange-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-wellness-dark">Calories Consumed</div>
                    <div className="text-xs text-wellness-light">
                      Keep it approximate. The plan cares more about direction than perfect precision.
                    </div>
                  </div>
                  <Badge className="bg-white text-orange-700 border border-orange-200">
                    {checkIn.caloriesConsumed} kcal
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button type="button" variant="outline" onClick={() => incrementCheckInValue("caloriesConsumed", 100)}>
                    +100
                  </Button>
                  <Button type="button" variant="outline" onClick={() => incrementCheckInValue("caloriesConsumed", 200)}>
                    +200
                  </Button>
                  <Button type="button" variant="outline" onClick={() => incrementCheckInValue("caloriesConsumed", 350)}>
                    +350
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl bg-purple-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-wellness-dark">Protein</div>
                    <div className="text-xs text-wellness-light">
                      Use quick meal estimates instead of exact nutrition math
                    </div>
                  </div>
                  <Badge className="bg-white text-purple-700 border border-purple-200">
                    {checkIn.proteinGrams} grams
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button type="button" variant="outline" onClick={() => incrementCheckInValue("proteinGrams", 10)}>
                    +10g
                  </Button>
                  <Button type="button" variant="outline" onClick={() => incrementCheckInValue("proteinGrams", 20)}>
                    +20g
                  </Button>
                  <Button type="button" variant="outline" onClick={() => incrementCheckInValue("proteinGrams", 30)}>
                    +30g
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs text-wellness-light mb-1 block">Mood</label>
                <select
                  value={checkIn.mood}
                  onChange={(event) => handleFieldChange("mood", event.target.value as Mood)}
                  className="w-full h-9 rounded-md border border-input bg-input-background px-3 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="okay">Okay</option>
                  <option value="good">Good</option>
                  <option value="great">Great</option>
                  </select>
              </div>
            </div>

            {showAdvancedEntry ? (
              <div className="grid grid-cols-2 gap-3 mb-4 rounded-2xl border border-dashed border-gray-300 p-4">
                <div>
                  <label className="text-xs text-wellness-light mb-1 block">Water glasses</label>
                  <Input
                    type="number"
                    min="0"
                    value={checkIn.waterGlasses}
                    onChange={(event) => handleFieldChange("waterGlasses", event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-wellness-light mb-1 block">Steps</label>
                  <Input
                    type="number"
                    min="0"
                    value={checkIn.steps}
                    onChange={(event) => handleFieldChange("steps", event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-wellness-light mb-1 block">Sleep hours</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={checkIn.sleepHours}
                    onChange={(event) => handleFieldChange("sleepHours", event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-wellness-light mb-1 block">Calories consumed</label>
                  <Input
                    type="number"
                    min="0"
                    value={checkIn.caloriesConsumed}
                    onChange={(event) => handleFieldChange("caloriesConsumed", event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-wellness-light mb-1 block">Protein grams</label>
                  <Input
                    type="number"
                    min="0"
                    value={checkIn.proteinGrams}
                    onChange={(event) => handleFieldChange("proteinGrams", event.target.value)}
                  />
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-3 mb-4">
              <div>
                <label className="text-xs text-wellness-light mb-1 block">Symptom today</label>
                <Input
                  placeholder="Headache, fatigue, stomach pain..."
                  value={checkIn.symptom}
                  onChange={(event) => handleFieldChange("symptom", event.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-wellness-light mb-1 block">Severity</label>
                  <select
                    value={checkIn.symptomSeverity}
                    onChange={(event) =>
                      handleFieldChange(
                        "symptomSeverity",
                        event.target.value as SymptomLog["severity"],
                      )
                    }
                    className="w-full h-9 rounded-md border border-input bg-input-background px-3 text-sm"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-wellness-light mb-1 block">Duration</label>
                  <Input
                    placeholder="2 hours, since morning"
                    value={checkIn.symptomDuration}
                    onChange={(event) =>
                      handleFieldChange("symptomDuration", event.target.value)
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-wellness-light mb-1 block">Notes</label>
                <Textarea
                  placeholder="Anything important about today..."
                  value={checkIn.notes}
                  onChange={(event) => handleFieldChange("notes", event.target.value)}
                />
              </div>
            </div>

            {saveMessage ? (
              <div className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                {saveMessage}
              </div>
            ) : null}

            <Button
              onClick={() => void handleSave()}
              disabled={isSaving || isLoading}
              className="w-full wellness-green text-white hover:opacity-90"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving check-in..." : "Save Today's Check-in"}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-wellness">
          <CardContent className="p-4">
            <h3 className="font-semibold text-wellness-dark mb-4">Weekly Overview</h3>
            <div className="space-y-4">
              {metricConfig.map((stat) => {
                const current = weeklyOverview.averages[stat.key] ?? 0;
                const target = metricTargets[stat.key] ?? stat.target;
                const percentage = Math.min(100, (current / target) * 100);
                const StatIcon = stat.icon;

                return (
                  <div key={stat.metric} className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-2xl ${stat.bgColor} flex items-center justify-center`}
                    >
                      <StatIcon className={`w-6 h-6 ${stat.color}`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-wellness-dark text-sm">
                          {stat.metric}
                        </h4>
                        <span className="text-xs font-medium text-wellness-light">
                          {Math.round(percentage)}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-wellness-light mb-2">
                        <span>
                          {stat.digits === 1 ? current.toFixed(1) : Math.round(current)} /{" "}
                          {Math.round(target)} {stat.unit}
                        </span>
                        <span>
                          {logs.length ? `${logs.length} days logged` : "No logs yet"}
                        </span>
                      </div>

                      <Progress value={percentage} className="h-2 bg-gray-200" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-wellness-dark">Weekly Goals</h3>
            <Button variant="ghost" size="sm" className="text-wellness-green">
              View Trend
            </Button>
          </div>

          <div className="space-y-3">
            {weeklyGoals.map((goal) => (
              <Card key={goal.goal}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-wellness-dark text-sm mb-1">
                        {goal.goal}
                      </h4>
                      <p className="text-xs text-wellness-light">
                        {goal.completed} of {goal.total} days completed
                      </p>
                    </div>
                    <div className="text-right text-lg font-semibold text-wellness-green">
                      {goal.progress}%
                    </div>
                  </div>
                  <Progress value={goal.progress} className="h-2 bg-gray-200" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {activePlan ? (
            <Card className="border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-wellness-dark text-sm">Today's Saved Plan Targets</h3>
                    <p className="text-wellness-light text-xs">
                      Progress is now measured against the same plan used on your Home and Daily Plan screens.
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">Plan linked</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-white px-3 py-3">
                    <div className="text-wellness-light">Water target</div>
                    <div className="font-medium text-wellness-dark">
                      {activePlan.summary.waterTargetGlasses} glasses
                    </div>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-3">
                    <div className="text-wellness-light">Steps target</div>
                    <div className="font-medium text-wellness-dark">
                      {activePlan.summary.stepsTarget.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-3">
                    <div className="text-wellness-light">Calories target</div>
                    <div className="font-medium text-wellness-dark">
                      {activePlan.summary.calorieTarget} kcal
                    </div>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-3">
                    <div className="text-wellness-light">Focus areas</div>
                    <div className="font-medium text-wellness-dark">
                      {activePlan.summary.focusAreas.slice(0, 2).join(", ") || "consistency"}
                    </div>
                  </div>
                </div>
                {activePlanReason ? (
                  <p className="text-xs text-wellness-light mt-3">
                    Last update: {activePlanReason}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-wellness-dark text-sm">AI Health Insight</h3>
                  <p className="text-wellness-light text-xs">
                    Personalized from your saved check-ins
                  </p>
                </div>
              </div>
              <p className="text-wellness-dark text-sm leading-relaxed">{insight}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-wellness-dark">Recent Symptoms</h3>
                <Button variant="ghost" size="sm" className="text-wellness-green">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {latestSymptoms.length ? (
                <div className="space-y-3">
                  {latestSymptoms.map((symptom) => (
                    <div
                      key={symptom.id}
                      className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-rose-500" />
                          <span className="font-medium text-wellness-dark text-sm">
                            {symptom.symptom}
                          </span>
                        </div>
                        <Badge
                          className={
                            symptom.severity === "severe"
                              ? "bg-red-100 text-red-700"
                              : symptom.severity === "moderate"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                          }
                        >
                          {symptom.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-wellness-light">
                        {formatDateLabel(symptom.loggedAt)}
                        {symptom.duration ? ` | ${symptom.duration}` : ""}
                      </p>
                      {symptom.notes ? (
                        <p className="text-sm text-wellness-dark mt-2">{symptom.notes}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-wellness-light">
                  No symptoms logged yet. Add one in today's check-in if needed.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-wellness-dark text-sm">Consistency Badge</h3>
                  <p className="text-wellness-light text-xs">
                    {logs.length
                      ? `${logs.length} health log${logs.length > 1 ? "s" : ""} saved this week`
                      : "Save your first check-in to begin your streak"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
                <div className="rounded-lg bg-blue-50 px-3 py-3 text-center">
                  <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <div className="font-medium text-wellness-dark">
                    {weeklyOverview.averages.waterGlasses.toFixed(1)}
                  </div>
                  <div className="text-xs text-wellness-light">Avg water</div>
                </div>
                <div className="rounded-lg bg-green-50 px-3 py-3 text-center">
                  <Footprints className="w-4 h-4 text-green-500 mx-auto mb-1" />
                  <div className="font-medium text-wellness-dark">
                    {weeklyOverview.averages.steps.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-wellness-light">Avg steps</div>
                </div>
                <div className="rounded-lg bg-indigo-50 px-3 py-3 text-center">
                  <Moon className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                  <div className="font-medium text-wellness-dark">
                    {weeklyOverview.averages.sleepHours || 0}
                  </div>
                  <div className="text-xs text-wellness-light">Avg sleep</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation currentScreen="progress" onNavigate={onNavigate} />
    </div>
  );
}
