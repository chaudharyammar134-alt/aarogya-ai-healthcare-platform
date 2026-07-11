import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import type {
  DailyHealthLog,
  DailyPlanRecord,
  SleepLog,
  SymptomLog,
} from "../api-client";
import { ensureFirebaseSession, firebaseDb, isFirebaseCoreEnabled } from "./client";

const usersCollection = "users";
const todayIso = () => new Date().toISOString();

const userCollectionRef = (userId: string, child: string) =>
  collection(firebaseDb!, usersCollection, userId, child);

const userDocRef = (userId: string, child: string, docId: string) =>
  doc(firebaseDb!, usersCollection, userId, child, docId);

const normalizeDailyHealthLog = (
  userId: string,
  logDate: string,
  data?: Partial<DailyHealthLog> | null,
): DailyHealthLog | null => {
  if (!data) return null;

  return {
    id: data.id ?? logDate,
    userId,
    logDate,
    waterGlasses: Number(data.waterGlasses ?? 0),
    steps: Number(data.steps ?? 0),
    sleepHours:
      data.sleepHours === undefined || data.sleepHours === null
        ? null
        : Number(data.sleepHours),
    caloriesConsumed: Number(data.caloriesConsumed ?? 0),
    caloriesBurned: Number(data.caloriesBurned ?? 0),
    proteinGrams: Number(data.proteinGrams ?? 0),
    mood: (data.mood ?? "good") as DailyHealthLog["mood"],
    notes: data.notes ?? "",
    createdAt: data.createdAt ?? todayIso(),
    updatedAt: data.updatedAt ?? todayIso(),
  };
};

const normalizeSleepLog = (
  userId: string,
  logDate: string,
  data?: Partial<SleepLog> | null,
): SleepLog | null => {
  if (!data) return null;

  return {
    id: data.id ?? logDate,
    userId,
    logDate,
    sleepTime: data.sleepTime ?? "23:00",
    wakeUpTime: data.wakeUpTime ?? "07:00",
    sleepDurationMinutes: Number(data.sleepDurationMinutes ?? 0),
    source: (data.source ?? "manual") as SleepLog["source"],
    notes: data.notes ?? "",
    createdAt: data.createdAt ?? todayIso(),
    updatedAt: data.updatedAt ?? todayIso(),
  };
};

const normalizeDailyPlan = (
  userId: string,
  planDate: string,
  data?: Partial<DailyPlanRecord> | null,
): DailyPlanRecord | null => {
  if (!data || !data.generatedPlan || !data.inputSnapshot) return null;

  return {
    id: data.id ?? planDate,
    userId,
    sleepLogId: data.sleepLogId ?? null,
    planDate,
    inputSnapshot: data.inputSnapshot,
    generatedPlan: data.generatedPlan,
    summary: data.summary ?? data.generatedPlan.summary.insight,
    healthScore: Number(data.healthScore ?? 0),
    createdAt: data.createdAt ?? todayIso(),
    updatedAt: data.updatedAt ?? todayIso(),
    updatedFrom: data.updatedFrom ?? "system",
    updateReason: data.updateReason ?? "Plan generated for today's live data.",
  };
};

const normalizeSymptomLog = (userId: string, id: string, data?: Partial<SymptomLog> | null) => {
  if (!data) return null;

  return {
    id: data.id ?? id,
    userId,
    symptom: data.symptom ?? "",
    severity: (data.severity ?? "mild") as SymptomLog["severity"],
    duration: data.duration ?? null,
    notes: data.notes ?? "",
    loggedAt: data.loggedAt ?? todayIso(),
    createdAt: data.createdAt ?? todayIso(),
  };
};

export const isFirebaseHealthBackendEnabled = () =>
  Boolean(isFirebaseCoreEnabled && firebaseDb);

export const saveFirebaseDailyHealthLog = async (
  userId: string,
  logDate: string,
  payload: Partial<DailyHealthLog>,
) => {
  await ensureFirebaseSession();
  const ref = userDocRef(userId, "dailyHealthLogs", logDate);
  const existing = await getDoc(ref);
  const current = normalizeDailyHealthLog(
    userId,
    logDate,
    existing.exists() ? (existing.data() as Partial<DailyHealthLog>) : null,
  );
  const timestamp = todayIso();

  const log: DailyHealthLog = {
    ...(current ?? {
      id: logDate,
      userId,
      logDate,
      waterGlasses: 0,
      steps: 0,
      sleepHours: null,
      caloriesConsumed: 0,
      caloriesBurned: 0,
      proteinGrams: 0,
      mood: "good",
      notes: "",
      createdAt: timestamp,
      updatedAt: timestamp,
    }),
    ...payload,
    id: current?.id ?? logDate,
    userId,
    logDate,
    updatedAt: timestamp,
    createdAt: current?.createdAt ?? timestamp,
  };

  await setDoc(ref, log, { merge: true });
  return log;
};

export const getFirebaseDailyHealthLogs = async (userId: string, days: number) => {
  await ensureFirebaseSession();
  const logsQuery = query(
    userCollectionRef(userId, "dailyHealthLogs"),
    orderBy("logDate", "desc"),
    limit(days),
  );
  const snapshot = await getDocs(logsQuery);
  return snapshot.docs
    .map((entry) =>
      normalizeDailyHealthLog(
        userId,
        entry.id,
        entry.data() as Partial<DailyHealthLog>,
      ),
    )
    .filter((entry): entry is DailyHealthLog => Boolean(entry));
};

export const createFirebaseSymptomLog = async (
  userId: string,
  payload: Omit<SymptomLog, "id" | "userId" | "createdAt">,
) => {
  await ensureFirebaseSession();
  const timestamp = todayIso();
  const docPayload = {
    ...payload,
    userId,
    createdAt: timestamp,
  };
  const ref = await addDoc(userCollectionRef(userId, "symptomLogs"), docPayload);

  return normalizeSymptomLog(userId, ref.id, {
    id: ref.id,
    ...docPayload,
  })!;
};

export const getFirebaseSymptomLogs = async (userId: string, maxItems: number) => {
  await ensureFirebaseSession();
  const symptomQuery = query(
    userCollectionRef(userId, "symptomLogs"),
    orderBy("loggedAt", "desc"),
    limit(maxItems),
  );
  const snapshot = await getDocs(symptomQuery);

  return snapshot.docs
    .map((entry) =>
      normalizeSymptomLog(
        userId,
        entry.id,
        entry.data() as Partial<SymptomLog>,
      ),
    )
    .filter((entry): entry is SymptomLog => Boolean(entry));
};

export const saveFirebaseSleepLog = async (
  userId: string,
  logDate: string,
  payload: Partial<SleepLog>,
) => {
  await ensureFirebaseSession();
  const ref = userDocRef(userId, "sleepLogs", logDate);
  const existing = await getDoc(ref);
  const current = normalizeSleepLog(
    userId,
    logDate,
    existing.exists() ? (existing.data() as Partial<SleepLog>) : null,
  );
  const timestamp = todayIso();

  const log: SleepLog = {
    ...(current ?? {
      id: logDate,
      userId,
      logDate,
      sleepTime: "23:00",
      wakeUpTime: "07:00",
      sleepDurationMinutes: 0,
      source: "manual",
      notes: "",
      createdAt: timestamp,
      updatedAt: timestamp,
    }),
    ...payload,
    id: current?.id ?? logDate,
    userId,
    logDate,
    updatedAt: timestamp,
    createdAt: current?.createdAt ?? timestamp,
  };

  await setDoc(ref, log, { merge: true });
  return log;
};

export const getFirebaseSleepLogs = async (
  userId: string,
  options?: { days?: number; date?: string },
) => {
  await ensureFirebaseSession();

  if (options?.date) {
    const ref = userDocRef(userId, "sleepLogs", options.date);
    const snapshot = await getDoc(ref);
    return {
      log: snapshot.exists()
        ? normalizeSleepLog(
            userId,
            options.date,
            snapshot.data() as Partial<SleepLog>,
          )
        : null,
    };
  }

  const logsQuery = query(
    userCollectionRef(userId, "sleepLogs"),
    orderBy("logDate", "desc"),
    limit(Math.max(1, options?.days ?? 7)),
  );
  const snapshot = await getDocs(logsQuery);
  return {
    logs: snapshot.docs
      .map((entry) =>
        normalizeSleepLog(
          userId,
          entry.id,
          entry.data() as Partial<SleepLog>,
        ),
      )
      .filter((entry): entry is SleepLog => Boolean(entry)),
  };
};

export const saveFirebaseDailyPlan = async (
  userId: string,
  planDate: string,
  plan: DailyPlanRecord,
) => {
  await ensureFirebaseSession();
  const ref = userDocRef(userId, "dailyPlans", planDate);
  await setDoc(ref, plan, { merge: true });
  return plan;
};

export const getFirebaseDailyPlan = async (userId: string, planDate: string) => {
  await ensureFirebaseSession();
  const ref = userDocRef(userId, "dailyPlans", planDate);
  const snapshot = await getDoc(ref);
  return snapshot.exists()
    ? normalizeDailyPlan(
        userId,
        planDate,
        snapshot.data() as Partial<DailyPlanRecord>,
      )
    : null;
};

export const subscribeToFirebaseUserHealthData = (
  userId: string,
  onChange: () => void,
) => {
  if (!isFirebaseHealthBackendEnabled()) {
    return () => undefined;
  }

  const unsubscribes: Unsubscribe[] = [
    onSnapshot(userCollectionRef(userId, "dailyHealthLogs"), () => onChange()),
    onSnapshot(userCollectionRef(userId, "sleepLogs"), () => onChange()),
    onSnapshot(userCollectionRef(userId, "dailyPlans"), () => onChange()),
    onSnapshot(userCollectionRef(userId, "symptomLogs"), () => onChange()),
  ];

  return () => {
    unsubscribes.forEach((unsubscribe) => unsubscribe());
  };
};
