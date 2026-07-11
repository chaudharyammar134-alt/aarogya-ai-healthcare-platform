import {
  getFirebaseUserProfile,
  loginWithFirebase,
  logoutFirebaseUser,
  signupWithFirebase,
  upsertFirebaseUserProfile,
} from "./firebase/auth-store";
import {
  createFirebaseSymptomLog,
  getFirebaseDailyHealthLogs,
  getFirebaseDailyPlan,
  getFirebaseSleepLogs,
  getFirebaseSymptomLogs,
  isFirebaseHealthBackendEnabled,
  saveFirebaseDailyHealthLog,
  saveFirebaseDailyPlan,
  saveFirebaseSleepLog,
  subscribeToFirebaseUserHealthData,
} from "./firebase/health-store";
import { runtimeConfig } from "./runtime-config";
import { generatePersonalizedDayPlan } from "./day-plan-generator";
import type { GeneratedDayPlan } from "./day-plan-generator";
import type { UserData } from "../types/user";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
  source?: "remote" | "local";
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  plan: string;
  status: string;
  healthScore: number;
  joinDate: string;
  lastActive: string;
  createdAt: string;
  updatedAt?: string;
}

interface LocalUserRecord extends AuthUser {
  passwordHash: string;
}

interface LocalSubscription {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  plan: string;
  amount: number;
  status: "active" | "cancelled";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  cancelledAt?: string;
}

interface LocalInvoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  subscriptionId: string;
  plan: string;
  amount: number;
  status: "paid";
  issueDate: string;
  dueDate: string;
  paidDate: string;
  createdAt: string;
}

interface AnalyticsStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  newSignupsToday: number;
  paymentSuccess: number;
  popularPlan: string;
  churnRate: number;
}

interface SecurityAlert {
  id: string;
  type: string;
  user: string;
  email: string;
  phone?: string;
  time: string;
  success: boolean;
  severity?: string;
}

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  recipients: string;
  priority: string;
  status: string;
  createdAt: string;
}

export interface DailyHealthLog {
  id: string;
  userId: string;
  logDate: string;
  waterGlasses: number;
  steps: number;
  sleepHours: number | null;
  caloriesConsumed: number;
  caloriesBurned: number;
  proteinGrams: number;
  mood: "low" | "okay" | "good" | "great";
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SymptomLog {
  id: string;
  userId: string;
  symptom: string;
  severity: "mild" | "moderate" | "severe";
  duration?: string | null;
  notes?: string | null;
  loggedAt: string;
  createdAt: string;
}

export interface SleepLog {
  id: string;
  userId: string;
  logDate: string;
  sleepTime: string;
  wakeUpTime: string;
  sleepDurationMinutes: number;
  source: "manual" | "healthkit" | "health-connect" | "fitbit" | "imported";
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionAnalysis {
  mealName: string;
  confidence: "low" | "medium" | "high";
  servingSize: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  sugarGrams: number;
  sodiumMg: number;
  micronutrients: string[];
  healthNotes: string[];
  cautions: string[];
  source: "food-database" | "image-assisted-estimate" | "text-estimate";
}

export interface DailyPlanRecord {
  id: string;
  userId: string;
  sleepLogId?: string | null;
  planDate: string;
  inputSnapshot: UserData;
  generatedPlan: GeneratedDayPlan;
  summary?: string | null;
  healthScore: number;
  createdAt: string;
  updatedAt: string;
  updatedFrom?: "profile" | "sleep" | "progress" | "symptom" | "manual" | "system";
  updateReason?: string | null;
}

interface AuthPayload {
  user: AuthUser;
  accessToken?: string;
}

const ACCESS_TOKEN_KEY = "aarogya:accessToken";
const USERS_KEY = "aarogya:users";
const SUBSCRIPTIONS_KEY = "aarogya:subscriptions";
const INVOICES_KEY = "aarogya:invoices";
const ADMIN_NOTIFICATIONS_KEY = "aarogya:adminNotifications";
const DAILY_HEALTH_LOGS_KEY = "aarogya:dailyHealthLogs";
const SYMPTOM_LOGS_KEY = "aarogya:symptomLogs";
const SLEEP_LOGS_KEY = "aarogya:sleepLogs";
const DAILY_PLANS_KEY = "aarogya:dailyPlans";
const REQUEST_TIMEOUT_MS = 12000;
const DATA_CHANGED_EVENT = "aarogya:data-changed";
const FALLBACK_ACCESS_TOKEN = "local_public";

type UserHealthDataChange = {
  userId: string;
  source:
    | "daily_health_logs"
    | "symptom_logs"
    | "sleep_logs"
    | "daily_plans";
  mode: "remote" | "local";
  timestamp: string;
};

class ApiClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }

  getAccessToken(): string {
    if (this.accessToken) return this.accessToken;
    const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (stored) {
      this.accessToken = stored;
      return stored;
    }
    return FALLBACK_ACCESS_TOKEN;
  }

  private emitUserHealthDataChanged(change: UserHealthDataChange) {
    window.dispatchEvent(
      new CustomEvent<UserHealthDataChange>(DATA_CHANGED_EVENT, {
        detail: change,
      }),
    );
  }

  subscribeToUserHealthData(userId: string, onChange: () => void) {
    const unsubscribeCallbacks: Array<() => void> = [];
    const localHandler = (event: Event) => {
      const detail = (event as CustomEvent<UserHealthDataChange>).detail;
      if (detail?.userId === userId) {
        onChange();
      }
    };

    window.addEventListener(DATA_CHANGED_EVENT, localHandler as EventListener);
    unsubscribeCallbacks.push(() => {
      window.removeEventListener(DATA_CHANGED_EVENT, localHandler as EventListener);
    });

    if (isFirebaseHealthBackendEnabled()) {
      unsubscribeCallbacks.push(
        subscribeToFirebaseUserHealthData(userId, onChange),
      );
    }

    return () => {
      unsubscribeCallbacks.forEach((unsubscribe) => unsubscribe());
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    if (!runtimeConfig.apiEnabled || !runtimeConfig.apiBaseUrl) {
      return { success: false, error: "Remote API disabled" };
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getAccessToken()}`,
        ...options.headers,
      };

      const response = await fetch(`${runtimeConfig.apiBaseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      const contentType = response.headers.get("content-type") ?? "";
      const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message =
          typeof payload === "object" && payload && "error" in payload
            ? String(payload.error)
            : "Request failed";
        return { success: false, error: message, source: "remote" };
      }

      return { success: true, data: payload as T, source: "remote" };
    } catch (error) {
      const message =
        error instanceof Error && error.name === "AbortError"
          ? "Request timed out"
          : "Network error or server unavailable";
      return { success: false, error: message };
    } finally {
      window.clearTimeout(timeout);
    }
  }

  private async requestFirebaseFunction<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    if (!runtimeConfig.firebaseFunctionsBaseUrl) {
      return {
        success: false,
        error: "Firebase Functions backend is not configured",
      };
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );

    try {
      const response = await fetch(
        `${runtimeConfig.firebaseFunctionsBaseUrl}${endpoint}`,
        {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAccessToken()}`,
            ...options.headers,
          },
          signal: controller.signal,
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            typeof payload === "object" && payload && "error" in payload
              ? String(payload.error)
              : "Firebase Functions request failed",
          source: "remote",
        };
      }

      return {
        success: true,
        data: payload as T,
        source: "remote",
      };
    } catch (error) {
      const message =
        error instanceof Error && error.name === "AbortError"
          ? "Firebase Functions request timed out"
          : "Firebase Functions backend is unavailable";
      return {
        success: false,
        error: message,
        source: "remote",
      };
    } finally {
      window.clearTimeout(timeout);
    }
  }

  private readCollection<T>(key: string): T[] {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  private writeCollection<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private getUsersStore() {
    return this.readCollection<LocalUserRecord>(USERS_KEY);
  }

  private saveUsersStore(users: LocalUserRecord[]) {
    this.writeCollection(USERS_KEY, users);
  }

  private getSubscriptionsStore() {
    return this.readCollection<LocalSubscription>(SUBSCRIPTIONS_KEY);
  }

  private saveSubscriptionsStore(subscriptions: LocalSubscription[]) {
    this.writeCollection(SUBSCRIPTIONS_KEY, subscriptions);
  }

  private getInvoicesStore() {
    return this.readCollection<LocalInvoice>(INVOICES_KEY);
  }

  private saveInvoicesStore(invoices: LocalInvoice[]) {
    this.writeCollection(INVOICES_KEY, invoices);
  }

  private getAdminNotificationsStore() {
    return this.readCollection<AdminNotification>(ADMIN_NOTIFICATIONS_KEY);
  }

  private saveAdminNotificationsStore(notifications: AdminNotification[]) {
    this.writeCollection(ADMIN_NOTIFICATIONS_KEY, notifications);
  }

  private getDailyHealthLogsStore() {
    return this.readCollection<DailyHealthLog>(DAILY_HEALTH_LOGS_KEY);
  }

  private saveDailyHealthLogsStore(logs: DailyHealthLog[]) {
    this.writeCollection(DAILY_HEALTH_LOGS_KEY, logs);
  }

  private getSymptomLogsStore() {
    return this.readCollection<SymptomLog>(SYMPTOM_LOGS_KEY);
  }

  private saveSymptomLogsStore(logs: SymptomLog[]) {
    this.writeCollection(SYMPTOM_LOGS_KEY, logs);
  }

  private getSleepLogsStore() {
    return this.readCollection<SleepLog>(SLEEP_LOGS_KEY);
  }

  private saveSleepLogsStore(logs: SleepLog[]) {
    this.writeCollection(SLEEP_LOGS_KEY, logs);
  }

  private getDailyPlansStore() {
    return this.readCollection<DailyPlanRecord>(DAILY_PLANS_KEY);
  }

  private saveDailyPlansStore(plans: DailyPlanRecord[]) {
    this.writeCollection(DAILY_PLANS_KEY, plans);
  }

  private generateId(prefix: string) {
    const suffix =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return `${prefix}_${suffix}`;
  }

  private createToken(prefix: string) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  }

  private normalizeTime(value: string | undefined, fallback: string) {
    return /^\d{2}:\d{2}$/.test(value ?? "") ? (value as string) : fallback;
  }

  private toIsoDate(value?: string) {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    return new Date().toISOString().slice(0, 10);
  }

  private calculateSleepDurationMinutes(sleepTime: string, wakeUpTime: string) {
    const [sleepHour, sleepMinute] = sleepTime.split(":").map(Number);
    const [wakeHour, wakeMinute] = wakeUpTime.split(":").map(Number);
    const sleepMinutes = sleepHour * 60 + sleepMinute;
    const wakeMinutes = wakeHour * 60 + wakeMinute;
    const normalizedWake = wakeMinutes <= sleepMinutes ? wakeMinutes + 1440 : wakeMinutes;
    return normalizedWake - sleepMinutes;
  }

  private calculatePlanHealthScore(plan: GeneratedDayPlan, latestLog?: DailyHealthLog) {
    let score = 55;
    if (plan.summary.awakeHours >= 14 && plan.summary.awakeHours <= 17) score += 10;
    if ((latestLog?.waterGlasses ?? 0) >= 6) score += 10;
    if ((latestLog?.steps ?? 0) >= Math.min(7000, plan.summary.stepsTarget)) score += 10;
    if (latestLog?.mood === "good" || latestLog?.mood === "great") score += 5;
    score += Math.min(10, plan.summary.focusAreas.length * 2);
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private async hashSecret(value: string) {
    if (typeof crypto === "undefined" || !crypto.subtle) {
      return `plain_${value}`;
    }
    const encoded = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  private getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
  }

  private toAuthUser(user: LocalUserRecord): AuthUser {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }

  private getSecurityAlertsFallback(): SecurityAlert[] {
    try {
      const raw = localStorage.getItem("loginAttempts");
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.map((entry: any) => ({
        id: entry.id ?? this.generateId("alert"),
        type: entry.type === "signup" ? "signup" : "login",
        user: entry.user ?? "Unknown",
        email: entry.email ?? "",
        phone: entry.phone ?? "",
        time: entry.time ?? new Date().toISOString(),
        success: Boolean(entry.success),
        severity: entry.success ? "low" : "high",
      }));
    } catch {
      return [];
    }
  }

  private async signupLocally(
    name: string,
    email: string,
    phone: string,
    password: string,
  ): Promise<ApiResponse<AuthPayload>> {
    const users = this.getUsersStore();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    const duplicate = users.find(
      (user) =>
        user.email.toLowerCase() === normalizedEmail || user.phone === normalizedPhone,
    );

    if (duplicate) {
      return {
        success: false,
        error: "User already exists",
        source: "local",
      };
    }

    const now = new Date().toISOString();
    const newUser: LocalUserRecord = {
      id: this.generateId("user"),
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      role: "user",
      plan: "none",
      status: "active",
      healthScore: 0,
      joinDate: now,
      lastActive: now,
      createdAt: now,
      passwordHash: await this.hashSecret(password),
    };

    users.unshift(newUser);
    this.saveUsersStore(users);

    const accessToken = this.createToken("local");
    this.setAccessToken(accessToken);

    return {
      success: true,
      data: {
        user: this.toAuthUser(newUser),
        accessToken,
      },
      source: "local",
    };
  }

  private async loginLocally(
    identifier: string,
    password: string,
  ): Promise<ApiResponse<AuthPayload>> {
    const users = this.getUsersStore();
    const normalizedIdentifier = identifier.trim().toLowerCase();
    const user = users.find(
      (entry) =>
        entry.email.toLowerCase() === normalizedIdentifier ||
        entry.phone === identifier.trim(),
    );

    if (!user) {
      return {
        success: false,
        error: "Invalid credentials",
        source: "local",
      };
    }

    const hashedPassword = await this.hashSecret(password);
    if (user.passwordHash !== hashedPassword) {
      return {
        success: false,
        error: "Invalid credentials",
        source: "local",
      };
    }

    const updatedUser: LocalUserRecord = {
      ...user,
      lastActive: new Date().toISOString(),
    };

    this.saveUsersStore(
      users.map((entry) => (entry.id === updatedUser.id ? updatedUser : entry)),
    );

    const accessToken = this.createToken("local");
    this.setAccessToken(accessToken);

    return {
      success: true,
      data: {
        user: this.toAuthUser(updatedUser),
        accessToken,
      },
      source: "local",
    };
  }

  async signup(name: string, email: string, phone: string, password: string) {
    if (runtimeConfig.firebaseEnabled) {
      try {
        const data = await signupWithFirebase({ name, email, phone, password });
        this.setAccessToken(data.accessToken);
        return {
          success: true,
          data,
          source: "remote" as const,
        };
      } catch (error) {
        return {
          success: false,
          error: this.getErrorMessage(error, "Firebase signup failed"),
          source: "remote" as const,
        };
      }
    }

    const remote = await this.request<AuthPayload>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, phone, password }),
    });

    if (remote.success) {
      if (remote.data?.accessToken) {
        this.setAccessToken(remote.data.accessToken);
      }
      return remote;
    }

    if (!runtimeConfig.useMockFallback) {
      return remote;
    }

    return this.signupLocally(name, email, phone, password);
  }

  async login(identifier: string, password: string) {
    if (runtimeConfig.firebaseEnabled) {
      try {
        const data = await loginWithFirebase(identifier, password);
        this.setAccessToken(data.accessToken);
        return {
          success: true,
          data,
          source: "remote" as const,
        };
      } catch (error) {
        return {
          success: false,
          error: this.getErrorMessage(error, "Firebase login failed"),
          source: "remote" as const,
        };
      }
    }

    const remote = await this.request<AuthPayload>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });

    if (remote.success) {
      if (remote.data?.accessToken) {
        this.setAccessToken(remote.data.accessToken);
      }
      return remote;
    }

    if (!runtimeConfig.useMockFallback) {
      return remote;
    }

    return this.loginLocally(identifier, password);
  }

  logout() {
    void logoutFirebaseUser();
    this.setAccessToken(null);
  }

  async saveUserProfile(userData: UserData) {
    if (runtimeConfig.firebaseEnabled) {
      try {
        const profile = await upsertFirebaseUserProfile(userData);
        return {
          success: true,
          data: { profile },
          source: "remote" as const,
        };
      } catch (error) {
        return {
          success: false,
          error: this.getErrorMessage(error, "Unable to save profile to Firebase"),
          source: "remote" as const,
        };
      }
    }

    return {
      success: true,
      data: { profile: userData },
      source: "local" as const,
    };
  }

  async getUserProfile(userId: string) {
    if (runtimeConfig.firebaseEnabled) {
      try {
        const profile = await getFirebaseUserProfile(userId);
        return {
          success: true,
          data: { profile },
          source: "remote" as const,
        };
      } catch (error) {
        return {
          success: false,
          error: this.getErrorMessage(error, "Unable to load profile from Firebase"),
          source: "remote" as const,
        };
      }
    }

    return {
      success: true,
      data: { profile: null },
      source: "local" as const,
    };
  }

  async getUsers() {
    const remote = await this.request<{ users: AuthUser[] }>("/admin/users", {
      method: "GET",
    });
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    return {
      success: true,
      data: {
        users: this.getUsersStore().map((user) => this.toAuthUser(user)),
      },
      source: "local" as const,
    };
  }

  async getUser(userId: string) {
    const remote = await this.request<{ user: AuthUser }>(`/admin/users/${userId}`, {
      method: "GET",
    });
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    const user = this.getUsersStore().find((entry) => entry.id === userId);
    if (!user) {
      return { success: false, error: "User not found", source: "local" as const };
    }

    return {
      success: true,
      data: { user: this.toAuthUser(user) },
      source: "local" as const,
    };
  }

  async updateUser(userId: string, updates: Partial<AuthUser>) {
    const remote = await this.request<{ success: boolean; user: AuthUser }>(
      `/admin/users/${userId}`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      },
    );
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    const users = this.getUsersStore();
    const index = users.findIndex((entry) => entry.id === userId);
    if (index === -1) {
      return { success: false, error: "User not found", source: "local" as const };
    }

    const updatedUser: LocalUserRecord = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      passwordHash: users[index].passwordHash,
    };
    users[index] = updatedUser;
    this.saveUsersStore(users);

    return {
      success: true,
      data: { success: true, user: this.toAuthUser(updatedUser) },
      source: "local" as const,
    };
  }

  async createSubscription(
    userId: string,
    plan: string,
    amount: number,
    duration = 1,
  ) {
    const remote = await this.request<{
      success: boolean;
      subscription: LocalSubscription;
      invoice: LocalInvoice;
    }>("/subscriptions", {
      method: "POST",
      body: JSON.stringify({ userId, plan, amount, duration }),
    });
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    const users = this.getUsersStore();
    const userIndex = users.findIndex((entry) => entry.id === userId);
    const firebaseProfile =
      userIndex === -1 && runtimeConfig.firebaseEnabled
        ? await getFirebaseUserProfile(userId).catch(() => null)
        : null;

    if (userIndex === -1 && !firebaseProfile) {
      return { success: false, error: "User not found", source: "local" as const };
    }

    const user = userIndex >= 0
      ? users[userIndex]
      : {
          id: userId,
          name: firebaseProfile?.name ?? "Aarogya User",
          email: firebaseProfile?.email ?? "",
          phone: firebaseProfile?.phone ?? "",
          role: firebaseProfile?.role ?? "user",
          plan: firebaseProfile?.subscription?.planName ?? "none",
          status: firebaseProfile?.status ?? "active",
          healthScore: 0,
          joinDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          passwordHash: "",
        };
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + duration);

    const subscription: LocalSubscription = {
      id: this.generateId("subscription"),
      userId,
      userEmail: user.email,
      userName: user.name,
      plan,
      amount,
      status: "active",
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      autoRenew: true,
      createdAt: now.toISOString(),
    };

    const invoice: LocalInvoice = {
      id: this.generateId("invoice"),
      invoiceNumber: `INV-${Date.now()}`,
      userId,
      userName: user.name,
      userEmail: user.email,
      subscriptionId: subscription.id,
      plan,
      amount,
      status: "paid",
      issueDate: now.toISOString(),
      dueDate: now.toISOString(),
      paidDate: now.toISOString(),
      createdAt: now.toISOString(),
    };

    if (userIndex >= 0) {
      users[userIndex] = {
        ...user,
        plan,
        updatedAt: now.toISOString(),
        passwordHash: user.passwordHash,
      };
      this.saveUsersStore(users);
    }
    this.saveSubscriptionsStore([subscription, ...this.getSubscriptionsStore()]);
    this.saveInvoicesStore([invoice, ...this.getInvoicesStore()]);

    if (firebaseProfile) {
      await upsertFirebaseUserProfile({
        ...firebaseProfile,
        subscription: {
          planId: subscription.id,
          planName: subscription.plan,
          price: subscription.amount,
          startDate: subscription.startDate,
          renewalDate: subscription.endDate,
          status: subscription.status,
          paymentMethod: "Aarogya checkout",
          transactionId: invoice.id,
          autoRenewal: subscription.autoRenew,
        },
      });
    }

    return {
      success: true,
      data: { success: true, subscription, invoice },
      source: "local" as const,
    };
  }

  async getSubscriptions() {
    const remote = await this.request<{ subscriptions: LocalSubscription[] }>(
      "/admin/subscriptions",
      { method: "GET" },
    );
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    return {
      success: true,
      data: { subscriptions: this.getSubscriptionsStore() },
      source: "local" as const,
    };
  }

  async cancelSubscription(subscriptionId: string) {
    const remote = await this.request<{ success: boolean; subscription: LocalSubscription }>(
      `/subscriptions/${subscriptionId}/cancel`,
      { method: "POST" },
    );
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    const subscriptions = this.getSubscriptionsStore();
    const index = subscriptions.findIndex((entry) => entry.id === subscriptionId);
    if (index === -1) {
      return {
        success: false,
        error: "Subscription not found",
        source: "local" as const,
      };
    }

    subscriptions[index] = {
      ...subscriptions[index],
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
    };
    this.saveSubscriptionsStore(subscriptions);

    return {
      success: true,
      data: { success: true, subscription: subscriptions[index] },
      source: "local" as const,
    };
  }

  async getInvoices() {
    const remote = await this.request<{ invoices: LocalInvoice[] }>("/admin/invoices", {
      method: "GET",
    });
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    return {
      success: true,
      data: { invoices: this.getInvoicesStore() },
      source: "local" as const,
    };
  }

  async getAnalyticsStats() {
    const remote = await this.request<{ stats: AnalyticsStats }>(
      "/admin/analytics",
      { method: "GET" },
    );
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    const users = this.getUsersStore();
    const subscriptions = this.getSubscriptionsStore();
    const invoices = this.getInvoicesStore();
    const today = new Date().toDateString();

    const planCounts = subscriptions.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.plan] = (acc[entry.plan] ?? 0) + 1;
      return acc;
    }, {});

    const popularPlan =
      Object.entries(planCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No subscriptions";

    const cancelledCount = subscriptions.filter(
      (entry) => entry.status === "cancelled",
    ).length;

    const stats: AnalyticsStats = {
      totalUsers: users.length,
      activeSubscriptions: subscriptions.filter((entry) => entry.status === "active").length,
      monthlyRevenue: invoices
        .filter((entry) => {
          const date = new Date(entry.createdAt);
          const now = new Date();
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        })
        .reduce((sum, entry) => sum + entry.amount, 0),
      pendingInvoices: invoices.filter((entry) => entry.status !== "paid").length,
      newSignupsToday: users.filter(
        (entry) => new Date(entry.createdAt).toDateString() === today,
      ).length,
      paymentSuccess: invoices.length
        ? Math.round(
            (invoices.filter((entry) => entry.status === "paid").length /
              invoices.length) *
              1000,
          ) / 10
        : 100,
      popularPlan,
      churnRate: subscriptions.length
        ? Math.round((cancelledCount / subscriptions.length) * 1000) / 10
        : 0,
    };

    return {
      success: true,
      data: { stats },
      source: "local" as const,
    };
  }

  async getSecurityAlerts() {
    const remote = await this.request<{ alerts: SecurityAlert[] }>("/admin/security-alerts", {
      method: "GET",
    });
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    return {
      success: true,
      data: { alerts: this.getSecurityAlertsFallback() },
      source: "local" as const,
    };
  }

  async getAdminNotifications() {
    const remote = await this.request<{ notifications: AdminNotification[] }>(
      "/admin/notifications",
      { method: "GET" },
    );
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    return {
      success: true,
      data: { notifications: this.getAdminNotificationsStore() },
      source: "local" as const,
    };
  }

  async sendAdminNotification(payload: {
    title: string;
    message: string;
    recipients?: string;
    priority?: string;
    channels?: string[];
  }) {
    const remote = await this.request<{ notification: AdminNotification }>(
      "/admin/notifications",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    const notification: AdminNotification = {
      id: this.generateId("notification"),
      title: payload.title,
      message: payload.message,
      recipients: payload.recipients ?? "all",
      priority: payload.priority ?? "medium",
      status: "sent",
      createdAt: new Date().toISOString(),
    };

    this.saveAdminNotificationsStore([
      notification,
      ...this.getAdminNotificationsStore(),
    ]);

    return {
      success: true,
      data: { notification },
      source: "local" as const,
    };
  }

  async getInvoice(invoiceId: string) {
    const remote = await this.request<{ invoice: LocalInvoice }>(
      `/invoices/${invoiceId}`,
      { method: "GET" },
    );
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    const invoice = this.getInvoicesStore().find((entry) => entry.id === invoiceId);
    if (!invoice) {
      return { success: false, error: "Invoice not found", source: "local" as const };
    }

    return {
      success: true,
      data: { invoice },
      source: "local" as const,
    };
  }

  async updateInvoice(invoiceId: string, updates: Record<string, unknown>) {
    const remote = await this.request<{ success: boolean; invoice: LocalInvoice }>(
      `/invoices/${invoiceId}`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      },
    );
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    const invoices = this.getInvoicesStore();
    const index = invoices.findIndex((entry) => entry.id === invoiceId);
    if (index === -1) {
      return { success: false, error: "Invoice not found", source: "local" as const };
    }

    invoices[index] = { ...invoices[index], ...updates } as LocalInvoice;
    this.saveInvoicesStore(invoices);

    return {
      success: true,
      data: { success: true, invoice: invoices[index] },
      source: "local" as const,
    };
  }

  async healthCheck() {
    const remote = await this.request<{ status: string; timestamp: string }>("/health", {
      method: "GET",
    });
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    return {
      success: true,
      data: {
        status: "local-ok",
        timestamp: new Date().toISOString(),
      },
      source: "local" as const,
    };
  }

  async saveDailyHealthLog(
    userId: string,
    payload: {
      logDate?: string;
      waterGlasses?: number;
      steps?: number;
      sleepHours?: number | null;
      caloriesConsumed?: number;
      caloriesBurned?: number;
      proteinGrams?: number;
      mood?: DailyHealthLog["mood"];
      notes?: string;
    },
  ) {
    if (isFirebaseHealthBackendEnabled()) {
      try {
        const logDate = payload.logDate ?? new Date().toISOString().slice(0, 10);
        const log = await saveFirebaseDailyHealthLog(userId, logDate, {
          ...payload,
          id: logDate,
          userId,
          logDate,
        });
        this.emitUserHealthDataChanged({
          userId,
          source: "daily_health_logs",
          mode: "remote",
          timestamp: new Date().toISOString(),
        });
        return {
          success: true,
          data: { log },
          source: "remote" as const,
        };
      } catch (error) {
        if (!runtimeConfig.useMockFallback) {
          return {
            success: false,
            error: this.getErrorMessage(error, "Unable to save health log in Firebase"),
            source: "remote" as const,
          };
        }
      }
    }

    const remote = await this.request<{ log: DailyHealthLog }>("/health/daily-log", {
      method: "POST",
      body: JSON.stringify({ userId, ...payload }),
    });
    if (remote.success) {
      this.emitUserHealthDataChanged({
        userId,
        source: "daily_health_logs",
        mode: "remote",
        timestamp: new Date().toISOString(),
      });
      return remote;
    }
    if (!runtimeConfig.useMockFallback) return remote;

    const logDate = payload.logDate ?? new Date().toISOString().slice(0, 10);
    const logs = this.getDailyHealthLogsStore();
    const existingIndex = logs.findIndex(
      (entry) => entry.userId === userId && entry.logDate === logDate,
    );

    const baseLog: DailyHealthLog = existingIndex >= 0
      ? logs[existingIndex]
      : {
          id: this.generateId("health_log"),
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    const log: DailyHealthLog = {
      ...baseLog,
      ...payload,
      logDate,
      notes: payload.notes ?? baseLog.notes ?? "",
      sleepHours:
        payload.sleepHours === undefined ? baseLog.sleepHours : payload.sleepHours,
      mood: payload.mood ?? baseLog.mood,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      logs[existingIndex] = log;
    } else {
      logs.push(log);
    }

    this.saveDailyHealthLogsStore(logs);
    this.emitUserHealthDataChanged({
      userId,
      source: "daily_health_logs",
      mode: "local",
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      data: { log },
      source: "local" as const,
    };
  }

  async getDailyHealthLogs(userId: string, days = 7) {
    if (isFirebaseHealthBackendEnabled()) {
      try {
        const logs = await getFirebaseDailyHealthLogs(userId, days);
        return {
          success: true,
          data: { logs },
          source: "remote" as const,
        };
      } catch (error) {
        if (!runtimeConfig.useMockFallback) {
          return {
            success: false,
            error: this.getErrorMessage(error, "Unable to load health logs from Firebase"),
            source: "remote" as const,
          };
        }
      }
    }

    const remote = await this.request<{ logs: DailyHealthLog[] }>(
      `/health/daily-log/${userId}?days=${days}`,
      { method: "GET" },
    );
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    const logs = this.getDailyHealthLogsStore()
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => b.logDate.localeCompare(a.logDate))
      .slice(0, days);

    return {
      success: true,
      data: { logs },
      source: "local" as const,
    };
  }

  async createSymptomLog(
    userId: string,
    payload: {
      symptom: string;
      severity?: SymptomLog["severity"];
      duration?: string;
      notes?: string;
      loggedAt?: string;
    },
  ) {
    if (isFirebaseHealthBackendEnabled()) {
      try {
        const symptom = await createFirebaseSymptomLog(userId, {
          symptom: payload.symptom,
          severity: payload.severity ?? "mild",
          duration: payload.duration ?? null,
          notes: payload.notes ?? "",
          loggedAt: payload.loggedAt ?? new Date().toISOString(),
        });
        this.emitUserHealthDataChanged({
          userId,
          source: "symptom_logs",
          mode: "remote",
          timestamp: new Date().toISOString(),
        });
        return {
          success: true,
          data: { symptom },
          source: "remote" as const,
        };
      } catch (error) {
        if (!runtimeConfig.useMockFallback) {
          return {
            success: false,
            error: this.getErrorMessage(error, "Unable to save symptom in Firebase"),
            source: "remote" as const,
          };
        }
      }
    }

    const remote = await this.request<{ symptom: SymptomLog }>("/health/symptoms", {
      method: "POST",
      body: JSON.stringify({ userId, ...payload }),
    });
    if (remote.success) {
      this.emitUserHealthDataChanged({
        userId,
        source: "symptom_logs",
        mode: "remote",
        timestamp: new Date().toISOString(),
      });
      return remote;
    }
    if (!runtimeConfig.useMockFallback) return remote;

    const symptom: SymptomLog = {
      id: this.generateId("symptom"),
      userId,
      symptom: payload.symptom,
      severity: payload.severity ?? "mild",
      duration: payload.duration ?? null,
      notes: payload.notes ?? "",
      loggedAt: payload.loggedAt ?? new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.saveSymptomLogsStore([symptom, ...this.getSymptomLogsStore()]);
    this.emitUserHealthDataChanged({
      userId,
      source: "symptom_logs",
      mode: "local",
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      data: { symptom },
      source: "local" as const,
    };
  }

  async getSymptomLogs(userId: string, limit = 10) {
    if (isFirebaseHealthBackendEnabled()) {
      try {
        const symptoms = await getFirebaseSymptomLogs(userId, limit);
        return {
          success: true,
          data: { symptoms },
          source: "remote" as const,
        };
      } catch (error) {
        if (!runtimeConfig.useMockFallback) {
          return {
            success: false,
            error: this.getErrorMessage(error, "Unable to load symptoms from Firebase"),
            source: "remote" as const,
          };
        }
      }
    }

    const remote = await this.request<{ symptoms: SymptomLog[] }>(
      `/health/symptoms/${userId}?limit=${limit}`,
      { method: "GET" },
    );
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    const symptoms = this.getSymptomLogsStore()
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => b.loggedAt.localeCompare(a.loggedAt))
      .slice(0, limit);

    return {
      success: true,
      data: { symptoms },
      source: "local" as const,
    };
  }

  async saveSleepLog(
    userId: string,
    payload: {
      logDate?: string;
      sleepTime: string;
      wakeUpTime: string;
      source?: SleepLog["source"];
      notes?: string;
    },
  ) {
    if (isFirebaseHealthBackendEnabled()) {
      try {
        const logDate = this.toIsoDate(payload.logDate);
        const sleepTime = this.normalizeTime(payload.sleepTime, "23:00");
        const wakeUpTime = this.normalizeTime(payload.wakeUpTime, "07:00");
        const log = await saveFirebaseSleepLog(userId, logDate, {
          id: logDate,
          userId,
          logDate,
          sleepTime,
          wakeUpTime,
          sleepDurationMinutes: this.calculateSleepDurationMinutes(
            sleepTime,
            wakeUpTime,
          ),
          source: payload.source ?? "manual",
          notes: payload.notes ?? "",
        });
        this.emitUserHealthDataChanged({
          userId,
          source: "sleep_logs",
          mode: "remote",
          timestamp: new Date().toISOString(),
        });
        return {
          success: true,
          data: { log },
          source: "remote" as const,
        };
      } catch (error) {
        if (!runtimeConfig.useMockFallback) {
          return {
            success: false,
            error: this.getErrorMessage(error, "Unable to save sleep log in Firebase"),
            source: "remote" as const,
          };
        }
      }
    }

    const remote = await this.request<{ log: SleepLog }>("/health/sleep-log", {
      method: "POST",
      body: JSON.stringify({ userId, ...payload }),
    });
    if (remote.success) {
      this.emitUserHealthDataChanged({
        userId,
        source: "sleep_logs",
        mode: "remote",
        timestamp: new Date().toISOString(),
      });
      return remote;
    }
    if (!runtimeConfig.useMockFallback) return remote;

    const logDate = this.toIsoDate(payload.logDate);
    const sleepTime = this.normalizeTime(payload.sleepTime, "23:00");
    const wakeUpTime = this.normalizeTime(payload.wakeUpTime, "07:00");
    const logs = this.getSleepLogsStore();
    const existingIndex = logs.findIndex(
      (entry) => entry.userId === userId && entry.logDate === logDate,
    );

    const baseLog: SleepLog = existingIndex >= 0
      ? logs[existingIndex]
      : {
          id: this.generateId("sleep_log"),
          userId,
          logDate,
          sleepTime,
          wakeUpTime,
          sleepDurationMinutes: 0,
          source: payload.source ?? "manual",
          notes: payload.notes ?? "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    const log: SleepLog = {
      ...baseLog,
      logDate,
      sleepTime,
      wakeUpTime,
      sleepDurationMinutes: this.calculateSleepDurationMinutes(sleepTime, wakeUpTime),
      source: payload.source ?? baseLog.source,
      notes: payload.notes ?? baseLog.notes ?? "",
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      logs[existingIndex] = log;
    } else {
      logs.unshift(log);
    }

    this.saveSleepLogsStore(logs);
    this.emitUserHealthDataChanged({
      userId,
      source: "sleep_logs",
      mode: "local",
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      data: { log },
      source: "local" as const,
    };
  }

  async getSleepLogs(userId: string, options?: { days?: number; date?: string }) {
    if (isFirebaseHealthBackendEnabled()) {
      try {
        const result = await getFirebaseSleepLogs(userId, options);
        return {
          success: true,
          data: result,
          source: "remote" as const,
        };
      } catch (error) {
        if (!runtimeConfig.useMockFallback) {
          return {
            success: false,
            error: this.getErrorMessage(error, "Unable to load sleep logs from Firebase"),
            source: "remote" as const,
          };
        }
      }
    }

    const query = options?.date
      ? `date=${this.toIsoDate(options.date)}`
      : `days=${Math.max(1, Math.min(30, Number(options?.days ?? 7)))}`;
    const remote = await this.request<{ log?: SleepLog | null; logs?: SleepLog[] }>(
      `/health/sleep-log/${userId}?${query}`,
      { method: "GET" },
    );
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    const logs = this.getSleepLogsStore()
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => b.logDate.localeCompare(a.logDate));

    if (options?.date) {
      return {
        success: true,
        data: {
          log: logs.find((entry) => entry.logDate === this.toIsoDate(options.date)) ?? null,
        },
        source: "local" as const,
      };
    }

    return {
      success: true,
      data: { logs: logs.slice(0, Math.max(1, Number(options?.days ?? 7))) },
      source: "local" as const,
    };
  }

  async generateDailyPlan(
    userId: string,
    userData: UserData,
    options?: {
      planDate?: string;
      updatedFrom?: DailyPlanRecord["updatedFrom"];
      updateReason?: string;
    },
  ) {
    if (isFirebaseHealthBackendEnabled()) {
      try {
        const planDate = this.toIsoDate(options?.planDate);
        const sleepResult = await getFirebaseSleepLogs(userId, { date: planDate });
        const recentLogs = await getFirebaseDailyHealthLogs(userId, 7);
        const sleepLog = sleepResult.log ?? null;
        const plannerUser: UserData = {
          ...userData,
          wakeUpTime: sleepLog?.wakeUpTime ?? userData.wakeUpTime,
          sleepTime: sleepLog?.sleepTime ?? userData.sleepTime,
        };
        const generatedPlan = generatePersonalizedDayPlan(plannerUser, recentLogs);
        const latestLog = recentLogs[0];
        const timestamp = new Date().toISOString();
        const plan: DailyPlanRecord = {
          id: planDate,
          userId,
          sleepLogId: sleepLog?.id ?? null,
          planDate,
          inputSnapshot: plannerUser,
          generatedPlan,
          summary: generatedPlan.summary.insight,
          healthScore: this.calculatePlanHealthScore(generatedPlan, latestLog),
          createdAt: timestamp,
          updatedAt: timestamp,
          updatedFrom: options?.updatedFrom ?? "system",
          updateReason: options?.updateReason ?? "Plan generated for today's live data.",
        };

        await saveFirebaseDailyPlan(userId, planDate, plan);
        this.emitUserHealthDataChanged({
          userId,
          source: "daily_plans",
          mode: "remote",
          timestamp,
        });
        return {
          success: true,
          data: { plan },
          source: "remote" as const,
        };
      } catch (error) {
        if (!runtimeConfig.useMockFallback) {
          return {
            success: false,
            error: this.getErrorMessage(error, "Unable to generate daily plan in Firebase"),
            source: "remote" as const,
          };
        }
      }
    }

    const remote = await this.request<{ plan: DailyPlanRecord }>("/daily-plan/generate", {
      method: "POST",
        body: JSON.stringify({
          userId,
          userData,
          planDate: this.toIsoDate(options?.planDate),
          updatedFrom: options?.updatedFrom,
          updateReason: options?.updateReason,
        }),
      });
    if (remote.success) {
      this.emitUserHealthDataChanged({
        userId,
        source: "daily_plans",
        mode: "remote",
        timestamp: new Date().toISOString(),
      });
      return remote;
    }
    if (!runtimeConfig.useMockFallback) return remote;

    const planDate = this.toIsoDate(options?.planDate);
    const sleepLog = this.getSleepLogsStore().find(
      (entry) => entry.userId === userId && entry.logDate === planDate,
    );
    const plannerUser: UserData = {
      ...userData,
      wakeUpTime: sleepLog?.wakeUpTime ?? userData.wakeUpTime,
      sleepTime: sleepLog?.sleepTime ?? userData.sleepTime,
    };
    const recentLogs = this.getDailyHealthLogsStore()
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => b.logDate.localeCompare(a.logDate))
      .slice(0, 7);
    const generatedPlan = generatePersonalizedDayPlan(plannerUser, recentLogs);
    const latestLog = recentLogs[0];

    const plans = this.getDailyPlansStore();
    const existingIndex = plans.findIndex(
      (entry) => entry.userId === userId && entry.planDate === planDate,
    );

    const basePlan: DailyPlanRecord = existingIndex >= 0
      ? plans[existingIndex]
      : {
          id: this.generateId("daily_plan"),
          userId,
          sleepLogId: sleepLog?.id ?? null,
          planDate,
          inputSnapshot: plannerUser,
          generatedPlan,
          summary: generatedPlan.summary.insight,
          healthScore: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    const plan: DailyPlanRecord = {
      ...basePlan,
      sleepLogId: sleepLog?.id ?? null,
      inputSnapshot: plannerUser,
      generatedPlan,
      summary: generatedPlan.summary.insight,
      healthScore: this.calculatePlanHealthScore(generatedPlan, latestLog),
      updatedAt: new Date().toISOString(),
      updatedFrom: options?.updatedFrom ?? "system",
      updateReason: options?.updateReason ?? "Plan generated for today's live data.",
    };

    if (existingIndex >= 0) {
      plans[existingIndex] = plan;
    } else {
      plans.unshift(plan);
    }

    this.saveDailyPlansStore(plans);
    this.emitUserHealthDataChanged({
      userId,
      source: "daily_plans",
      mode: "local",
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      data: { plan },
      source: "local" as const,
    };
  }

  async getDailyPlan(userId: string, planDate?: string) {
    const normalizedDate = this.toIsoDate(planDate);
    if (isFirebaseHealthBackendEnabled()) {
      try {
        const plan = await getFirebaseDailyPlan(userId, normalizedDate);
        return {
          success: true,
          data: { plan },
          source: "remote" as const,
        };
      } catch (error) {
        if (!runtimeConfig.useMockFallback) {
          return {
            success: false,
            error: this.getErrorMessage(error, "Unable to load daily plan from Firebase"),
            source: "remote" as const,
          };
        }
      }
    }

    const remote = await this.request<{ plan: DailyPlanRecord | null }>(
      `/daily-plan/${userId}?date=${normalizedDate}`,
      { method: "GET" },
    );
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    const plan =
      this.getDailyPlansStore().find(
        (entry) => entry.userId === userId && entry.planDate === normalizedDate,
      ) ?? null;

    return {
      success: true,
      data: { plan },
      source: "local" as const,
    };
  }

  async generateHealthPlan(userId: string, userData: unknown) {
    return this.request("/ai/generate-health-plan", {
      method: "POST",
      body: JSON.stringify({ userId, userData }),
    });
  }

  async sendAIChat(userId: string, message: string) {
    if (runtimeConfig.firebaseFunctionsBaseUrl) {
      return this.requestFirebaseFunction<{
        success: boolean;
        reply: {
          content: string;
          suggestions: string[];
          requiresDoctor: boolean;
        };
        source: string;
        timestamp: string;
      }>("/chat", {
        method: "POST",
        body: JSON.stringify({ userId, message }),
      });
    }

    return this.request("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ userId, message }),
    });
  }

  async analyzeNutrition(foodName: string, imageData?: string | null) {
    const cleanFoodName = foodName.trim();
    if (!cleanFoodName) {
      return {
        success: false,
        error: "Food name is required",
        source: "local" as const,
      };
    }

    if (runtimeConfig.firebaseFunctionsBaseUrl) {
      const response = await this.requestFirebaseFunction<{
        success: boolean;
        analysis: NutritionAnalysis;
      }>("/nutrition/analyze", {
        method: "POST",
        body: JSON.stringify({ foodName: cleanFoodName, imageData }),
      });

      if (response.success && response.data?.analysis) {
        return {
          success: true,
          data: { analysis: response.data.analysis },
          source: "remote" as const,
        };
      }
    }

    const remote = await this.request<{ analysis: NutritionAnalysis }>("/nutrition/analyze", {
      method: "POST",
      body: JSON.stringify({ foodName: cleanFoodName, imageData }),
    });
    if (remote.success || !runtimeConfig.useMockFallback) return remote;

    const lower = cleanFoodName.toLowerCase();
    const presets: Array<{
      terms: string[];
      analysis: NutritionAnalysis;
    }> = [
      {
        terms: ["dal", "chawal", "rice"],
        analysis: {
          mealName: "Dal chawal",
          confidence: "high",
          servingSize: "1 medium plate",
          calories: 430,
          proteinGrams: 16,
          carbsGrams: 72,
          fatGrams: 7,
          fiberGrams: 9,
          sugarGrams: 4,
          sodiumMg: 520,
          micronutrients: ["iron", "folate", "magnesium", "potassium"],
          healthNotes: ["Good vegetarian protein pairing", "Fiber from dal supports fullness"],
          cautions: ["Use controlled rice portion for weight loss or diabetes goals"],
          source: "food-database",
        },
      },
      {
        terms: ["roti", "chapati", "sabzi"],
        analysis: {
          mealName: "Roti with sabzi",
          confidence: "high",
          servingSize: "2 rotis + 1 bowl sabzi",
          calories: 360,
          proteinGrams: 11,
          carbsGrams: 62,
          fatGrams: 8,
          fiberGrams: 8,
          sugarGrams: 6,
          sodiumMg: 480,
          micronutrients: ["vitamin A", "vitamin C", "iron", "zinc"],
          healthNotes: ["Balanced everyday Indian meal", "Vegetables improve fiber and micronutrients"],
          cautions: ["Oil and salt can change the estimate significantly"],
          source: "food-database",
        },
      },
      {
        terms: ["paneer"],
        analysis: {
          mealName: "Paneer curry",
          confidence: "high",
          servingSize: "1 bowl",
          calories: 410,
          proteinGrams: 22,
          carbsGrams: 13,
          fatGrams: 30,
          fiberGrams: 3,
          sugarGrams: 5,
          sodiumMg: 620,
          micronutrients: ["calcium", "phosphorus", "vitamin B12"],
          healthNotes: ["Strong protein and calcium source", "Useful for muscle gain goals"],
          cautions: ["High fat if cooked with cream, butter, or extra oil"],
          source: "food-database",
        },
      },
      {
        terms: ["idli", "sambar"],
        analysis: {
          mealName: "Idli sambar",
          confidence: "high",
          servingSize: "3 idli + 1 bowl sambar",
          calories: 300,
          proteinGrams: 11,
          carbsGrams: 55,
          fatGrams: 4,
          fiberGrams: 7,
          sugarGrams: 3,
          sodiumMg: 540,
          micronutrients: ["B vitamins", "iron", "potassium"],
          healthNotes: ["Light breakfast with fermented batter", "Sambar adds protein and vegetables"],
          cautions: ["Chutney quantity can add extra calories"],
          source: "food-database",
        },
      },
      {
        terms: ["chicken"],
        analysis: {
          mealName: "Chicken meal",
          confidence: "medium",
          servingSize: "1 plate",
          calories: 480,
          proteinGrams: 38,
          carbsGrams: 35,
          fatGrams: 18,
          fiberGrams: 4,
          sugarGrams: 3,
          sodiumMg: 720,
          micronutrients: ["vitamin B12", "niacin", "selenium", "zinc"],
          healthNotes: ["High protein option", "Good fit for strength and satiety goals"],
          cautions: ["Fried or creamy preparation can double calories"],
          source: "text-estimate",
        },
      },
    ];

    const matched = presets.find((preset) =>
      preset.terms.some((term) => lower.includes(term)),
    );

    const analysis = matched?.analysis ?? {
      mealName: cleanFoodName,
      confidence: "low",
      servingSize: "1 typical serving",
      calories: 350,
      proteinGrams: 12,
      carbsGrams: 45,
      fatGrams: 12,
      fiberGrams: 5,
      sugarGrams: 6,
      sodiumMg: 500,
      micronutrients: ["varies by ingredients"],
      healthNotes: ["This is an approximate estimate until image AI or a verified nutrition API is connected"],
      cautions: ["Portion size, oil, sugar, and sauces can change calories a lot"],
      source: "text-estimate",
    };

    return {
      success: true,
      data: { analysis },
      source: "local" as const,
    };
  }

  async saveHealthMetrics(userId: string, metrics: unknown) {
    return this.request("/health/metrics", {
      method: "POST",
      body: JSON.stringify({ userId, metrics }),
    });
  }

  async getHealthMetrics(userId: string) {
    return this.request(`/health/metrics/${userId}`, { method: "GET" });
  }

  async uploadMedicalDocument(
    userId: string,
    documentType: string,
    documentData: string,
  ) {
    return this.request("/medical/upload", {
      method: "POST",
      body: JSON.stringify({ userId, documentType, documentData }),
    });
  }

  async getMedicalDocuments(userId: string) {
    return this.request(`/medical/documents/${userId}`, { method: "GET" });
  }

  async scheduleNotification(
    userId: string,
    type: string,
    time: string,
    message: string,
  ) {
    return this.request("/notifications/schedule", {
      method: "POST",
      body: JSON.stringify({ userId, type, time, message }),
    });
  }

  async getUserNotifications(userId: string) {
    return this.request(`/notifications/user/${userId}`, { method: "GET" });
  }

  async detectLocation() {
    return this.request("/location/detect", { method: "GET" });
  }

  async getWeather(city: string) {
    return this.request(`/weather/${city}`, { method: "GET" });
  }
}

export const apiClient = new ApiClient();
