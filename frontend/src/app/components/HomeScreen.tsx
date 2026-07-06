import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Apple,
  Bell,
  Bot,
  ChevronRight,
  Droplets,
  Footprints,
  MessageCircle,
  Moon,
  Sparkles,
  Sun,
  Target,
  Utensils,
  Zap,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { BottomNavigation } from "./BottomNavigation";
import type { Screen } from "../App";
import type { UserData } from "../types/user";
import {
  apiClient,
  type DailyHealthLog,
  type DailyPlanRecord,
  type SleepLog,
} from "../utils/api-client";
import {
  type DayPlanTaskType,
  type GeneratedDayPlan,
  type GeneratedDayPlanTask,
} from "../utils/day-plan-generator";
import {
  getProteinTargetForUser,
  loadTodayPlanBundle,
} from "../utils/daily-plan-state";

interface HomeScreenProps {
  user: UserData | null;
  isExploreMode?: boolean;
  isNewUser?: boolean;
  onNavigate: (screen: Screen) => void;
  onLogin?: () => void;
}

type DashboardPeriod = "today" | "week" | "month";

type InsightCard = {
  title: string;
  description: string;
  icon: typeof Sparkles;
  color: string;
};

const todayDate = () => new Date().toISOString().slice(0, 10);

const formatMetricValue = (value: number, digits = 0) =>
  digits > 0 ? value.toFixed(digits) : Math.round(value).toLocaleString("en-IN");

const average = (values: number[]) =>
  values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;

const formatLogDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

const parseClockTime = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatClockRange = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
};

const calculateSleepHours = (log: SleepLog | null) => {
  if (!log) return null;
  return Number((log.sleepDurationMinutes / 60).toFixed(1));
};

const getPeriodLogs = (logs: DailyHealthLog[], period: DashboardPeriod) => {
  if (period === "today") {
    return logs.filter((entry) => entry.logDate === todayDate());
  }

  const days = period === "week" ? 7 : 30;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const cutoffDate = cutoff.toISOString().slice(0, 10);

  return logs.filter((entry) => entry.logDate >= cutoffDate);
};

const getLatestLog = (logs: DailyHealthLog[]) =>
  [...logs].sort((a, b) => b.logDate.localeCompare(a.logDate))[0] ?? null;

const getTaskVisuals = (type: DayPlanTaskType) => {
  switch (type) {
    case "hydration":
      return {
        icon: Droplets,
        bgColor: "bg-blue-50",
        iconColor: "text-blue-600",
      };
    case "meal":
      return {
        icon: Apple,
        bgColor: "bg-orange-50",
        iconColor: "text-orange-600",
      };
    case "exercise":
    case "activity":
      return {
        icon: Activity,
        bgColor: "bg-emerald-50",
        iconColor: "text-emerald-600",
      };
    case "sleep":
      return {
        icon: Moon,
        bgColor: "bg-indigo-50",
        iconColor: "text-indigo-600",
      };
    case "wake_up":
      return {
        icon: Sun,
        bgColor: "bg-yellow-50",
        iconColor: "text-yellow-600",
      };
    default:
      return {
        icon: Target,
        bgColor: "bg-violet-50",
        iconColor: "text-violet-600",
      };
  }
};

const buildInsights = (
  user: UserData | null,
  latestLog: DailyHealthLog | null,
  latestSleepLog: SleepLog | null,
  activePlan: GeneratedDayPlan | null,
) => {
  const insights: InsightCard[] = [];

  if (activePlan) {
    insights.push({
      title: "Your plan is personalized for today",
      description: activePlan.summary.insight,
      icon: Sparkles,
      color: "bg-emerald-50 border-emerald-200",
    });
  }

  const sleepHours = calculateSleepHours(latestSleepLog);
  if (sleepHours !== null) {
    insights.push({
      title:
        sleepHours < 7 ? "Recovery deserves extra attention" : "Sleep rhythm looks solid",
      description:
        sleepHours < 7
          ? `You logged ${sleepHours} hours of sleep, so today's plan leans toward steadier energy and smarter recovery.`
          : `You logged ${sleepHours} hours of sleep, which gives you a strong base for movement and focus today.`,
      icon: Moon,
      color: "bg-indigo-50 border-indigo-200",
    });
  }

  if (latestLog && activePlan) {
    if (latestLog.waterGlasses < activePlan.summary.waterTargetGlasses * 0.75) {
      insights.push({
        title: "Hydration is the quickest win today",
        description: `You are at ${latestLog.waterGlasses} glasses. Reaching ${activePlan.summary.waterTargetGlasses} will noticeably improve today's routine.`,
        icon: Droplets,
        color: "bg-blue-50 border-blue-200",
      });
    }

    if (latestLog.steps < activePlan.summary.stepsTarget * 0.7) {
      insights.push({
        title: "Movement target is still within reach",
        description: `You have logged ${latestLog.steps.toLocaleString("en-IN")} steps so far. A focused walk later can close the gap toward ${activePlan.summary.stepsTarget.toLocaleString("en-IN")}.`,
        icon: Footprints,
        color: "bg-green-50 border-green-200",
      });
    }
  }

  if (user?.occupation === "office-worker") {
    insights.push({
      title: "Workday posture breaks matter",
      description:
        "Because you spend long hours sitting, short movement resets are built into the plan to protect energy and circulation.",
      icon: Activity,
      color: "bg-violet-50 border-violet-200",
    });
  }

  if ((user?.medicalConditions ?? []).some((condition) => condition.name.includes("Diabetes"))) {
    insights.push({
      title: "Meal timing supports glucose stability",
      description:
        "Your day plan keeps meals and movement distributed so energy stays more stable instead of spiking early.",
      icon: Apple,
      color: "bg-cyan-50 border-cyan-200",
    });
  }

  if (!insights.length) {
    insights.push({
      title: "Your dashboard is ready for real data",
      description:
        "Save a sleep log and one health check-in to unlock a more personal plan, better targets, and smarter insights.",
      icon: Bot,
      color: "bg-slate-50 border-slate-200",
    });
  }

  return insights.slice(0, 3);
};

export function HomeScreen({
  user,
  isExploreMode = false,
  isNewUser = false,
  onNavigate,
  onLogin,
}: HomeScreenProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>("today");
  const [healthLogs, setHealthLogs] = useState<DailyHealthLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [todayPlan, setTodayPlan] = useState<DailyPlanRecord | null>(null);
  const [previewPlan, setPreviewPlan] = useState<GeneratedDayPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    const bundle = await loadTodayPlanBundle(user, {
      healthDays: 30,
      sleepDays: 14,
      ensurePlan: true,
    });
    setHealthLogs(bundle.recentLogs);
    setSleepLogs(bundle.sleepLogs);
    setTodayPlan(bundle.planRecord);
    setPreviewPlan(bundle.generatedPlan);
    setIsLoading(false);
  }, [
    user,
  ]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (!user?.id) return;
    return apiClient.subscribeToUserHealthData(user.id, () => {
      void loadDashboardData();
    });
  }, [loadDashboardData, user?.id]);

  const userName = user?.name?.split(" ")[0] || "Friend";
  const currentHour = new Date().getHours();

  const greeting = useMemo(() => {
    if (currentHour < 12) return "Good Morning";
    if (currentHour < 17) return "Good Afternoon";
    if (currentHour < 21) return "Good Evening";
    return "Good Night";
  }, [currentHour]);

  const latestLog = useMemo(() => getLatestLog(healthLogs), [healthLogs]);

  const latestSleepLog = useMemo(() => {
    return (
      sleepLogs.find((entry) => entry.logDate === todayDate()) ??
      [...sleepLogs].sort((a, b) => b.logDate.localeCompare(a.logDate))[0] ??
      null
    );
  }, [sleepLogs]);

  const activePlan = todayPlan?.generatedPlan ?? previewPlan;

  const periodLogs = useMemo(
    () => getPeriodLogs(healthLogs, selectedPeriod),
    [healthLogs, selectedPeriod],
  );

  const progressMetrics = useMemo(() => {
    const sourceLog =
      selectedPeriod === "today"
        ? periodLogs[0] ?? latestLog
        : null;
    const waterTarget = activePlan?.summary.waterTargetGlasses ?? 8;
    const stepsTarget = activePlan?.summary.stepsTarget ?? 10000;
    const caloriesTarget = activePlan?.summary.calorieTarget ?? 2000;
    const proteinTarget = getProteinTargetForUser(user);

    const currentValues =
      selectedPeriod === "today"
        ? {
            water: sourceLog?.waterGlasses ?? 0,
            steps: sourceLog?.steps ?? 0,
            calories: sourceLog?.caloriesBurned ?? 0,
            protein: sourceLog?.proteinGrams ?? 0,
          }
        : {
            water: average(periodLogs.map((entry) => entry.waterGlasses)),
            steps: average(periodLogs.map((entry) => entry.steps)),
            calories: average(periodLogs.map((entry) => entry.caloriesBurned)),
            protein: average(periodLogs.map((entry) => entry.proteinGrams)),
          };

    return [
      {
        icon: Droplets,
        label: "Water",
        value: currentValues.water,
        target: waterTarget,
        unit: "glasses",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        digits: selectedPeriod === "today" ? 0 : 1,
      },
      {
        icon: Footprints,
        label: "Steps",
        value: currentValues.steps,
        target: stepsTarget,
        unit: "steps",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        digits: 0,
      },
      {
        icon: Zap,
        label: "Calories",
        value: currentValues.calories,
        target: caloriesTarget,
        unit: "kcal",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        digits: 0,
      },
      {
        icon: Apple,
        label: "Protein",
        value: currentValues.protein,
        target: proteinTarget,
        unit: "grams",
        color: "text-violet-600",
        bgColor: "bg-violet-50",
        digits: 0,
      },
    ].map((metric) => ({
      ...metric,
      progress: Math.min(100, Math.round((metric.value / Math.max(metric.target, 1)) * 100)),
    }));
  }, [activePlan, latestLog, periodLogs, selectedPeriod, user]);

  const insights = useMemo(
    () => buildInsights(user, latestLog, latestSleepLog, activePlan),
    [activePlan, latestLog, latestSleepLog, user],
  );

  const planPreviewTasks = useMemo(() => {
    return (activePlan?.tasks ?? []).slice(0, 3);
  }, [activePlan]);

  const planSummary = useMemo(() => {
    if (!activePlan) return null;

    return {
      awakeHours: activePlan.summary.awakeHours,
      waterTarget: activePlan.summary.waterTargetGlasses,
      stepsTarget: activePlan.summary.stepsTarget,
      wakeTime: activePlan.summary.wakeUpTime,
      sleepTime: activePlan.summary.sleepTime,
      focusAreas: activePlan.summary.focusAreas.slice(0, 2),
    };
  }, [activePlan]);

  const periodLabel =
    selectedPeriod === "today"
      ? "Today's saved progress"
      : selectedPeriod === "week"
        ? "7-day average"
        : "30-day average";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {isExploreMode ? (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-white">Explore Mode Active</span>
              <span className="text-xs text-white/80">Some personal data features are limited</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={onLogin}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 text-xs h-8"
            >
              Sign Up Free
            </Button>
          </div>
        </div>
      ) : null}

      <div className="wellness-green px-6 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {userName.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-white/80 text-sm">{greeting}</p>
              <h1 className="text-white font-semibold text-lg">{userName}!</h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("notifications")}
            className="text-white hover:bg-white/20 relative"
          >
            <Bell className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full" />
          </Button>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white/85 text-sm mb-2">Today at a glance</p>
              <p className="text-white font-medium">
                {activePlan?.summary.insight ??
                  "Your dashboard becomes smarter as soon as your saved plan is available for today."}
              </p>
            </div>
            {planSummary ? (
              <Badge className="bg-white/15 text-white border-white/20 whitespace-nowrap">
                {planSummary.awakeHours} hrs awake
              </Badge>
            ) : null}
          </div>

          {planSummary ? (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-xl bg-white/10 px-3 py-3">
                <div className="text-white/70 text-xs">Sleep Window</div>
                <div className="text-white font-medium text-sm">
                  {planSummary.wakeTime} to {planSummary.sleepTime}
                </div>
              </div>
              <div className="rounded-xl bg-white/10 px-3 py-3">
                <div className="text-white/70 text-xs">Targets</div>
                <div className="text-white font-medium text-sm">
                  {planSummary.waterTarget} glasses and {planSummary.stepsTarget.toLocaleString("en-IN")} steps
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {isNewUser && user ? (
        <div className="px-6 -mt-2 mb-4">
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Welcome to Arogya+ AI</h3>
                <p className="text-sm text-gray-600 mb-3">
                  We already know your profile. Now let the assistant turn that into a day plan that feels personal and useful.
                </p>
                <Button
                  onClick={() => onNavigate("ai-chat")}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 h-auto"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start your health chat
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      <div className="px-6 -mt-4">
        <Card className="p-4 shadow-wellness">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-wellness-dark">Progress Dashboard</h2>
            <div className="flex rounded-lg bg-gray-100 p-1">
              {(["today", "week", "month"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                    selectedPeriod === period
                      ? "bg-white text-wellness-green shadow-sm"
                      : "text-wellness-light hover:text-wellness-dark"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-wellness-light mb-4">
            {isLoading
              ? "Loading your saved dashboard data..."
              : `${periodLabel}${latestLog ? ` • Last update ${formatLogDate(latestLog.logDate)}` : ""}`}
          </p>

          <div className="grid grid-cols-2 gap-4">
            {progressMetrics.map((stat) => (
              <div key={stat.label} className="space-y-3 rounded-2xl border border-gray-100 p-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <span className="text-sm font-medium text-wellness-dark">{stat.label}</span>
                </div>
                <div>
                  <div className="flex items-baseline space-x-1 mb-1">
                    <span className="text-xl font-semibold text-wellness-dark">
                      {formatMetricValue(stat.value, stat.digits)}
                    </span>
                    <span className="text-xs text-wellness-light">
                      / {formatMetricValue(stat.target)} {stat.unit}
                    </span>
                  </div>
                  <Progress value={stat.progress} className="h-2 bg-gray-200" />
                </div>
              </div>
            ))}
          </div>

          {!latestLog && !isLoading ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 px-4 py-4 text-sm text-wellness-light">
              You have not saved a progress check-in yet. Add one in the Progress tab and your dashboard will update here automatically.
            </div>
          ) : null}
        </Card>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-wellness-dark">AI Health Insights</h2>
          <Button variant="ghost" size="sm" className="text-wellness-green" onClick={() => onNavigate("ai-chat")}>
            Open Chat
          </Button>
        </div>

        <div className="space-y-3">
          {insights.map((insight) => (
            <Card key={insight.title} className={`p-4 border ${insight.color}`}>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-white/70 flex items-center justify-center">
                  <insight.icon className="w-5 h-5 text-wellness-dark" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-wellness-dark text-sm">{insight.title}</h3>
                  <p className="text-wellness-light text-xs mt-1">{insight.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button
            variant="outline"
            className="flex items-center space-x-2 p-3 h-auto"
            onClick={() => onNavigate("ai-chat")}
          >
            <Bot className="w-4 h-4 text-wellness-green" />
            <span className="text-sm">Ask AI Coach</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center space-x-2 p-3 h-auto"
            onClick={() => onNavigate("nutrition")}
          >
            <Utensils className="w-4 h-4 text-wellness-green" />
            <span className="text-sm">Food Guide</span>
          </Button>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-wellness-dark">Today's Plan</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-wellness-green"
            onClick={() => onNavigate("plan")}
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {planSummary ? (
          <Card className="p-4 mb-4 border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-700 font-medium mb-2">
                  Personalized day plan
                </p>
                <h3 className="font-semibold text-wellness-dark">
                  Built around your {formatClockRange(user?.wakeUpTime ?? "07:00")} to {formatClockRange(user?.sleepTime ?? "23:00")} routine
                </h3>
              <p className="text-sm text-wellness-light mt-1">
                  Focus areas: {planSummary.focusAreas.length ? planSummary.focusAreas.join(" and ") : "consistency"}
                </p>
                {todayPlan?.updateReason ? (
                  <p className="text-xs text-wellness-light mt-2">
                    Last updated: {todayPlan.updateReason}
                  </p>
                ) : null}
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                {todayPlan ? "Saved plan" : "Generating"}
              </Badge>
            </div>
          </Card>
        ) : null}

        {planPreviewTasks.length ? (
          <div className="space-y-3">
            {planPreviewTasks.map((item: GeneratedDayPlanTask) => {
              const visuals = getTaskVisuals(item.type);
              const TaskIcon = visuals.icon;

              return (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full ${visuals.bgColor} flex items-center justify-center`}>
                      <TaskIcon className={`w-5 h-5 ${visuals.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-wellness-dark text-sm">{item.title}</h3>
                        {item.completed ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">Done</Badge>
                        ) : null}
                      </div>
                      <p className="text-wellness-light text-xs">
                        {item.description} • {item.time}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-5 border-dashed border-gray-300">
            <div className="text-center">
              <Target className="w-8 h-8 text-wellness-green mx-auto mb-3" />
              <h3 className="font-semibold text-wellness-dark mb-1">Generate your first day plan</h3>
              <p className="text-sm text-wellness-light mb-4">
                Add your sleep and wake-up time on the Plan screen, and Aarogya will build a full routine around it.
              </p>
              <Button onClick={() => onNavigate("plan")} className="wellness-green text-white hover:opacity-90">
                Create My Plan
              </Button>
            </div>
          </Card>
        )}
      </div>

      <BottomNavigation currentScreen="home" onNavigate={onNavigate} />
    </div>
  );
}
