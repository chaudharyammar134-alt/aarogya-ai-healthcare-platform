import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Apple,
  Check,
  Clock,
  Droplets,
  Footprints,
  Moon,
  MoreHorizontal,
  Play,
  Sunrise,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
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
  generatePersonalizedDayPlan,
  type DayPlanTaskType,
  type GeneratedDayPlan,
  type GeneratedDayPlanTask,
} from "../utils/day-plan-generator";
import {
  buildFallbackUser,
  loadTodayPlanBundle,
  todayPlanDate,
} from "../utils/daily-plan-state";

interface DailyPlanScreenProps {
  user: UserData | null;
  onNavigate: (screen: Screen) => void;
}

const taskTypeMeta: Record<
  DayPlanTaskType,
  { icon: typeof Sunrise; badge: string; color: string; bg: string }
> = {
  wake_up: {
    icon: Sunrise,
    badge: "Start",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  hydration: {
    icon: Droplets,
    badge: "Hydrate",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  meal: {
    icon: Apple,
    badge: "Meal",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  activity: {
    icon: Activity,
    badge: "Reset",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  exercise: {
    icon: Zap,
    badge: "Move",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  focus: {
    icon: Target,
    badge: "Focus",
    color: "text-sky-600",
    bg: "bg-sky-50",
  },
  wellness: {
    icon: Moon,
    badge: "Wellness",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  sleep: {
    icon: Moon,
    badge: "Sleep",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
};

const parseDisplayTimeToMinutes = (value: string) => {
  const [time, period] = value.split(" ");
  const [rawHour, rawMinute] = time.split(":").map(Number);
  let hour = rawHour % 12;
  if (period === "PM") hour += 12;
  return hour * 60 + rawMinute;
};

const getCurrentTaskId = (tasks: GeneratedDayPlanTask[]) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return tasks.find((task, index) => {
    const taskMinutes = parseDisplayTimeToMinutes(task.time);
    const nextTaskMinutes =
      index < tasks.length - 1
        ? parseDisplayTimeToMinutes(tasks[index + 1].time)
        : taskMinutes + 90;
    return currentMinutes >= taskMinutes && currentMinutes < nextTaskMinutes;
  })?.id;
};

const goalLabel = (goal: string) => goal.replace(/-/g, " ");

const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

export function DailyPlanScreen({ user, onNavigate }: DailyPlanScreenProps) {
  const [recentLogs, setRecentLogs] = useState<DailyHealthLog[]>([]);
  const [savedSleepLog, setSavedSleepLog] = useState<SleepLog | null>(null);
  const [planRecord, setPlanRecord] = useState<DailyPlanRecord | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedDayPlan | null>(null);
  const [wakeUpTime, setWakeUpTime] = useState(user?.wakeUpTime ?? "07:00");
  const [sleepTime, setSleepTime] = useState(user?.sleepTime ?? "23:00");
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastSyncedSchedule, setLastSyncedSchedule] = useState<{
    wakeUpTime: string;
    sleepTime: string;
  } | null>(null);

  const plannerUser = useMemo<UserData>(
    () => ({
      ...(user ?? buildFallbackUser()),
      wakeUpTime,
      sleepTime,
    }),
    [sleepTime, user, wakeUpTime],
  );

  useEffect(() => {
    setWakeUpTime(user?.wakeUpTime ?? "07:00");
    setSleepTime(user?.sleepTime ?? "23:00");
  }, [user?.sleepTime, user?.wakeUpTime]);

  const loadPlanState = useCallback(async () => {
    setIsLoadingPlan(true);
    const bundle = await loadTodayPlanBundle(user, {
      healthDays: 7,
      sleepDays: 14,
      ensurePlan: true,
    });

    setLoadError(bundle.error ?? null);
    setRecentLogs(bundle.recentLogs);
    setSavedSleepLog(bundle.todaySleepLog);
    setPlanRecord(bundle.planRecord);
    setGeneratedPlan(bundle.generatedPlan);
    setWakeUpTime(bundle.effectiveUser.wakeUpTime);
    setSleepTime(bundle.effectiveUser.sleepTime);
    setLastSyncedSchedule({
      wakeUpTime: bundle.effectiveUser.wakeUpTime,
      sleepTime: bundle.effectiveUser.sleepTime,
    });

    setIsLoadingPlan(false);
  }, [user]);

  useEffect(() => {
    void loadPlanState();
  }, [loadPlanState]);

  useEffect(() => {
    if (!user?.id) return;
    return apiClient.subscribeToUserHealthData(user.id, () => {
      void loadPlanState();
    });
  }, [loadPlanState, user?.id]);

  const currentTaskId = useMemo(
    () => (generatedPlan ? getCurrentTaskId(generatedPlan.tasks) : undefined),
    [generatedPlan],
  );

  const tasks = useMemo(
    () =>
      (generatedPlan?.tasks ?? []).map((task) => ({
        ...task,
        completed: completedTaskIds.includes(task.id),
      })),
    [completedTaskIds, generatedPlan?.tasks],
  );

  const completedTasks = tasks.filter((task) => task.completed).length;
  const progressPercentage = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  const userFirstName = plannerUser.name.split(" ")[0] || "Friend";
  const lastLog = recentLogs[0];

  const handleTaskToggle = (taskId: string) => {
    setCompletedTaskIds((current) =>
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId],
    );
  };

  const handleRegeneratePlan = useCallback(async (
    trigger: {
      updatedFrom?: DailyPlanRecord["updatedFrom"];
      updateReason?: string;
    } = {},
  ) => {
    const localPlan = generatePersonalizedDayPlan(plannerUser, recentLogs);

    if (!user?.id) {
      setGeneratedPlan(localPlan);
      setPlanRecord(null);
      return;
    }

    setIsSavingPlan(true);
    setLoadError(null);

    const sleepResponse = await apiClient.saveSleepLog(user.id, {
      logDate: todayPlanDate(),
      sleepTime,
      wakeUpTime,
      source: "manual",
    });

    if (sleepResponse.success && sleepResponse.data?.log) {
      setSavedSleepLog(sleepResponse.data.log);
    }

    const planResponse = await apiClient.generateDailyPlan(user.id, plannerUser, {
      planDate: todayPlanDate(),
      updatedFrom: trigger.updatedFrom ?? "manual",
      updateReason:
        trigger.updateReason ??
        "Today's plan was refreshed from your updated sleep and wake-up schedule.",
    });

    if (planResponse.success && planResponse.data?.plan) {
      setPlanRecord(planResponse.data.plan);
      setGeneratedPlan(planResponse.data.plan.generatedPlan);
      setLastSyncedSchedule({
        wakeUpTime,
        sleepTime,
      });
    } else {
      setGeneratedPlan(localPlan);
      setPlanRecord(null);
      setLoadError(planResponse.error ?? sleepResponse.error ?? null);
    }

    setCompletedTaskIds([]);
    setActiveTaskId(null);
    setIsSavingPlan(false);
  }, [plannerUser, recentLogs, sleepTime, user?.id, wakeUpTime]);

  useEffect(() => {
    if (!user?.id || isLoadingPlan || isSavingPlan || !lastSyncedSchedule) {
      return;
    }

    const changed =
      wakeUpTime !== lastSyncedSchedule.wakeUpTime ||
      sleepTime !== lastSyncedSchedule.sleepTime;

    if (!changed) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void handleRegeneratePlan({
        updatedFrom: "sleep",
        updateReason: "Today's plan updated automatically because your sleep or wake-up time changed.",
      });
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [
    handleRegeneratePlan,
    isLoadingPlan,
    isSavingPlan,
    lastSyncedSchedule,
    sleepTime,
    user?.id,
    wakeUpTime,
  ]);

  const summary = generatedPlan?.summary;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-wellness-dark">Daily Plan</h1>
            <p className="text-sm text-wellness-light">
              Your plan updates from sleep, wake-up, goals, and recent logs
            </p>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <label className="text-sm">
              <span className="block text-wellness-light mb-2">Sleep time</span>
              <input
                type="time"
                value={sleepTime}
                onChange={(event) => setSleepTime(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-wellness-dark outline-none focus:border-wellness-green"
              />
            </label>
            <label className="text-sm">
              <span className="block text-wellness-light mb-2">Wake-up time</span>
              <input
                type="time"
                value={wakeUpTime}
                onChange={(event) => setWakeUpTime(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-wellness-dark outline-none focus:border-wellness-green"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-semibold text-wellness-dark">
                Personalized for {userFirstName}
              </h3>
              <p className="text-sm text-wellness-light mt-1">
                {savedSleepLog
                  ? `Saved sleep window for ${savedSleepLog.logDate}`
                  : "Change the times above and the app will refresh the full day automatically"}
              </p>
            </div>
            <Button
              onClick={() => void handleRegeneratePlan()}
              disabled={isSavingPlan || isLoadingPlan}
              className="wellness-green text-white"
            >
              {isSavingPlan ? "Updating..." : "Regenerate"}
            </Button>
          </div>

          {summary ? (
            <>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm text-wellness-light mt-1">
                    {summary.wakeUpTime} to {summary.sleepTime} | {summary.awakeHours} active hours
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-wellness-green">
                    {progressPercentage}%
                  </div>
                  <Badge className="bg-wellness-green text-white text-xs">
                    {completedTasks} of {tasks.length} done
                  </Badge>
                </div>
              </div>

              <Progress value={progressPercentage} className="h-2 bg-gray-200 mb-3" />

              <div className="grid grid-cols-4 gap-3 text-sm">
                <div className="rounded-xl bg-white/80 px-3 py-3">
                  <div className="text-wellness-light">Water</div>
                  <div className="font-medium text-wellness-dark">
                    {summary.waterTargetGlasses} glasses
                  </div>
                </div>
                <div className="rounded-xl bg-white/80 px-3 py-3">
                  <div className="text-wellness-light">Steps</div>
                  <div className="font-medium text-wellness-dark">
                    {summary.stepsTarget.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="rounded-xl bg-white/80 px-3 py-3">
                  <div className="text-wellness-light">Calories</div>
                  <div className="font-medium text-wellness-dark">
                    {summary.calorieTarget}
                  </div>
                </div>
                <div className="rounded-xl bg-white/80 px-3 py-3">
                  <div className="text-wellness-light">Score</div>
                  <div className="font-medium text-wellness-dark">
                    {planRecord?.healthScore ?? "--"}
                  </div>
                </div>
              </div>

              {planRecord?.updateReason ? (
                <div className="mt-3 rounded-xl bg-white/80 px-3 py-3 text-xs text-wellness-light">
                  <span className="font-medium text-wellness-dark">Last update:</span>{" "}
                  {planRecord.updateReason}
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-xl bg-white/80 px-4 py-5 text-sm text-wellness-light">
              {isLoadingPlan ? "Building your plan..." : "No saved plan yet. Regenerate to create one."}
            </div>
          )}
        </Card>
      </div>

      <div className="px-6 py-6 space-y-6">
        {loadError ? (
          <Card className="border border-amber-200 bg-amber-50">
            <CardContent className="p-4 text-sm text-amber-800">
              Live plan sync is not available right now, so this screen is using local generation.
            </CardContent>
          </Card>
        ) : null}

        {summary ? (
          <Card className="border border-emerald-200 bg-emerald-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-wellness-dark mb-2">Why this plan is different</h3>
              <p className="text-sm text-wellness-dark leading-relaxed">
                {summary.insight}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {summary.focusAreas.map((area) => (
                  <Badge
                    key={area}
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 bg-white"
                  >
                    {area}
                  </Badge>
                ))}
              </div>
              {lastLog ? (
                <p className="text-xs text-wellness-light mt-3">
                  Latest saved check-in ({formatShortDate(lastLog.logDate)}):{" "}
                  {lastLog.waterGlasses} glasses, {lastLog.sleepHours ?? "no"} hrs sleep,{" "}
                  {lastLog.steps} steps. This line is your saved progress, while the targets above
                  now change with your sleep and wake-up inputs.
                </p>
              ) : (
                <p className="text-xs text-wellness-light mt-3">
                  This plan is currently driven by your profile and sleep inputs.
                </p>
              )}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-wellness-green" />
                <span className="text-sm font-medium text-wellness-dark">
                  Input window
                </span>
              </div>
              <p className="text-sm text-wellness-light">
                Wake: {wakeUpTime} | Sleep: {sleepTime}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Footprints className="w-4 h-4 text-wellness-green" />
                <span className="text-sm font-medium text-wellness-dark">
                  Profile rules
                </span>
              </div>
              <p className="text-sm text-wellness-light">
                {plannerUser.occupation} | {plannerUser.activityLevel}
              </p>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {(plannerUser.goals.length ? plannerUser.goals : ["general-wellness"]).map((goal) => (
                  <Badge key={goal} className="bg-blue-100 text-blue-700">
                    {goalLabel(goal)}
                  </Badge>
                ))}
                {(plannerUser.medicalConditions ?? []).slice(0, 3).map((condition) => (
                  <Badge key={condition.name} className="bg-rose-100 text-rose-700">
                    {condition.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {generatedPlan ? (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-6">
              {tasks.map((task) => {
                const meta = taskTypeMeta[task.type];
                const TaskIcon = meta.icon;
                const isCurrent = currentTaskId === task.id;

                return (
                  <div key={task.id} className="relative flex items-start space-x-4">
                    <div
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                        task.completed
                          ? "wellness-green"
                          : isCurrent
                            ? "bg-wellness-yellow"
                            : meta.bg
                      }`}
                    >
                      {task.completed ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <TaskIcon
                          className={`w-5 h-5 ${
                            isCurrent ? "text-white" : meta.color
                          }`}
                        />
                      )}
                    </div>

                    <Card
                      className={`flex-1 ${
                        isCurrent ? "border-2 border-wellness-green shadow-wellness" : ""
                      } ${task.completed ? "bg-gray-50" : "bg-white"}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3
                                className={`font-medium ${
                                  task.completed
                                    ? "text-wellness-light line-through"
                                    : "text-wellness-dark"
                                }`}
                              >
                                {task.title}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {task.duration}
                              </Badge>
                              <Badge className={`${meta.bg} ${meta.color} border-0 text-xs`}>
                                {meta.badge}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  task.energy === "high"
                                    ? "border-green-300 text-green-700"
                                    : task.energy === "steady"
                                      ? "border-blue-300 text-blue-700"
                                      : "border-gray-300 text-gray-700"
                                }`}
                              >
                                {task.energy} energy
                              </Badge>
                            </div>
                            <p className="text-sm text-wellness-light">{task.description}</p>
                            <p className="text-xs text-wellness-green mt-2 font-medium">
                              Why: {task.rationale}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-medium text-wellness-dark">
                              {task.time}
                            </div>
                            {isCurrent ? (
                              <Badge className="bg-wellness-yellow text-white text-xs mt-2">
                                Current block
                              </Badge>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                          <Button
                            size="sm"
                            onClick={() =>
                              setActiveTaskId((current) =>
                                current === task.id ? null : task.id,
                              )
                            }
                            className={`text-xs ${
                              activeTaskId === task.id
                                ? "bg-orange-500 hover:bg-orange-600 text-white"
                                : "wellness-green text-white"
                            }`}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            {activeTaskId === task.id ? "Active" : "Start"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskToggle(task.id)}
                            className="text-xs border-wellness-green text-wellness-green"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            {task.completed ? "Undo" : "Mark done"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-sm text-wellness-light">
              {isLoadingPlan ? "Building your personalized day plan..." : "Regenerate to build today's plan."}
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation currentScreen="plan" onNavigate={onNavigate} />
    </div>
  );
}
