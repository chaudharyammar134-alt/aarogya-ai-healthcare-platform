import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  type DocumentData,
} from "firebase/firestore";
import { firebaseAuth, firebaseDb, ensureFirebaseSession } from "./client";
import type { UserData } from "../../types/user";

export interface FirebaseAuthUser {
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

export interface FirebaseAuthPayload {
  user: FirebaseAuthUser;
  accessToken: string;
}

interface FirebaseUserProfile extends DocumentData {
  name?: string;
  email?: string;
  phone?: string;
  role?: "user" | "admin";
  plan?: string;
  status?: string;
  healthScore?: number;
  joinDate?: string;
  lastActive?: string;
  createdAt?: string;
  updatedAt?: string;
  age?: number;
  gender?: UserData["gender"];
  language?: UserData["language"];
  weight?: number;
  height?: number;
  bmi?: number;
  occupation?: UserData["occupation"];
  wakeUpTime?: string;
  sleepTime?: string;
  workingHours?: string;
  activityLevel?: UserData["activityLevel"];
  goals?: string[];
  targetWeight?: number;
  medicalConditions?: UserData["medicalConditions"];
  allergies?: string[];
  currentMedications?: string[];
  aiPreferences?: UserData["aiPreferences"];
  notificationPreferences?: UserData["notificationPreferences"];
  subscription?: UserData["subscription"];
}

const usersCollection = "users";

const normalizeEmail = (value: string) => value.trim().toLowerCase();
const normalizePhone = (value: string) => value.replace(/\D/g, "");
const defaultAiPreferences: NonNullable<UserData["aiPreferences"]> = {
  preferredMealTypes: [],
  dislikedFoods: [],
  exercisePreferences: [],
  followedRecommendations: 0,
  totalRecommendations: 0,
};

const defaultNotificationPreferences: NonNullable<
  UserData["notificationPreferences"]
> = {
  waterReminders: true,
  mealReminders: true,
  exerciseReminders: true,
  medicationReminders: true,
};

const requireFirebase = async () => {
  await ensureFirebaseSession();

  if (!firebaseAuth || !firebaseDb) {
    throw new Error("Firebase Auth is not configured for this app.");
  }

  return { auth: firebaseAuth, db: firebaseDb };
};

const userDocRef = (userId: string) => doc(firebaseDb!, usersCollection, userId);

const toAuthUser = (
  user: FirebaseUser,
  profile?: FirebaseUserProfile | null,
): FirebaseAuthUser => {
  const timestamp = new Date().toISOString();

  return {
    id: user.uid,
    name:
      profile?.name ??
      user.displayName ??
      user.email?.split("@")[0] ??
      "Aarogya User",
    email: profile?.email ?? user.email ?? "",
    phone: profile?.phone ?? "",
    role: profile?.role ?? "user",
    plan: profile?.plan ?? "none",
    status: profile?.status ?? "active",
    healthScore: Number(profile?.healthScore ?? 0),
    joinDate: profile?.joinDate ?? profile?.createdAt ?? timestamp,
    lastActive: profile?.lastActive ?? timestamp,
    createdAt: profile?.createdAt ?? timestamp,
    updatedAt: profile?.updatedAt ?? timestamp,
  };
};

const toUserData = (
  authUser: FirebaseAuthUser,
  profile?: FirebaseUserProfile | null,
): UserData => ({
  id: authUser.id,
  email: authUser.email,
  role: authUser.role,
  status: authUser.status,
  name: profile?.name ?? authUser.name,
  phone: profile?.phone ?? authUser.phone,
  age: Number(profile?.age ?? 25),
  gender: (profile?.gender ?? "female") as UserData["gender"],
  language: (profile?.language ?? "english") as UserData["language"],
  weight: Number(profile?.weight ?? 60),
  height: Number(profile?.height ?? 160),
  bmi:
    profile?.bmi === undefined || profile?.bmi === null
      ? undefined
      : Number(profile.bmi),
  occupation: (profile?.occupation ?? "office-worker") as UserData["occupation"],
  wakeUpTime: profile?.wakeUpTime ?? "07:00",
  sleepTime: profile?.sleepTime ?? "23:00",
  workingHours: profile?.workingHours,
  activityLevel: (profile?.activityLevel ??
    "moderately-active") as UserData["activityLevel"],
  goals: Array.isArray(profile?.goals) ? profile!.goals : ["general-wellness"],
  targetWeight:
    profile?.targetWeight === undefined || profile?.targetWeight === null
      ? undefined
      : Number(profile.targetWeight),
  medicalConditions: Array.isArray(profile?.medicalConditions)
    ? profile!.medicalConditions
    : [],
  allergies: Array.isArray(profile?.allergies) ? profile!.allergies : [],
  currentMedications: Array.isArray(profile?.currentMedications)
    ? profile!.currentMedications
    : [],
  aiPreferences: {
    ...defaultAiPreferences,
    ...(profile?.aiPreferences ?? {}),
  },
  notificationPreferences: {
    ...defaultNotificationPreferences,
    ...(profile?.notificationPreferences ?? {}),
  },
  subscription: profile?.subscription,
});

const buildProfilePayload = (
  userData: UserData,
  existing?: FirebaseUserProfile | null,
): FirebaseUserProfile => ({
  ...existing,
  name: userData.name.trim(),
  email: userData.email ? normalizeEmail(userData.email) : existing?.email ?? "",
  phone: normalizePhone(userData.phone),
  role: userData.role ?? existing?.role ?? "user",
  plan: userData.subscription?.planName ?? existing?.plan ?? "none",
  status: userData.status ?? existing?.status ?? "active",
  healthScore: Number(existing?.healthScore ?? 0),
  age: Number(userData.age),
  gender: userData.gender,
  language: userData.language,
  weight: Number(userData.weight),
  height: Number(userData.height),
  bmi: userData.bmi,
  occupation: userData.occupation,
  wakeUpTime: userData.wakeUpTime,
  sleepTime: userData.sleepTime,
  workingHours: userData.workingHours,
  activityLevel: userData.activityLevel,
  goals: userData.goals,
  targetWeight: userData.targetWeight,
  medicalConditions: userData.medicalConditions,
  allergies: userData.allergies ?? [],
  currentMedications: userData.currentMedications ?? [],
  aiPreferences: {
    ...defaultAiPreferences,
    ...(userData.aiPreferences ?? {}),
  },
  notificationPreferences: {
    ...defaultNotificationPreferences,
    ...(userData.notificationPreferences ?? {}),
  },
  subscription: userData.subscription,
});

const saveUserProfile = async (
  user: FirebaseUser,
  updates: FirebaseUserProfile,
) => {
  const ref = userDocRef(user.uid);
  const snapshot = await getDoc(ref);
  const existing = snapshot.exists()
    ? (snapshot.data() as FirebaseUserProfile)
    : null;
  const timestamp = new Date().toISOString();

  const profile: FirebaseUserProfile = {
    name: updates.name ?? existing?.name ?? user.displayName ?? "Aarogya User",
    email: updates.email ?? existing?.email ?? user.email ?? "",
    phone: updates.phone ?? existing?.phone ?? "",
    role: updates.role ?? existing?.role ?? "user",
    plan: updates.plan ?? existing?.plan ?? "none",
    status: updates.status ?? existing?.status ?? "active",
    healthScore: Number(updates.healthScore ?? existing?.healthScore ?? 0),
    joinDate: updates.joinDate ?? existing?.joinDate ?? existing?.createdAt ?? timestamp,
    lastActive: updates.lastActive ?? timestamp,
    createdAt: existing?.createdAt ?? updates.createdAt ?? timestamp,
    updatedAt: timestamp,
  };

  await setDoc(ref, profile, { merge: true });
  return profile;
};

export const getFirebaseUserProfile = async (
  userId: string,
): Promise<UserData | null> => {
  await requireFirebase();
  const snapshot = await getDoc(userDocRef(userId));

  if (!snapshot.exists()) {
    return null;
  }

  const profile = snapshot.data() as FirebaseUserProfile;
  const authUser = toAuthUser(
    {
      uid: userId,
      email: profile.email ?? "",
      displayName: profile.name ?? "Aarogya User",
    } as FirebaseUser,
    profile,
  );

  return toUserData(authUser, profile);
};

export const upsertFirebaseUserProfile = async (
  userData: UserData,
): Promise<UserData> => {
  const { auth } = await requireFirebase();
  const currentUser = auth.currentUser;
  const userId = userData.id ?? currentUser?.uid;

  if (!currentUser || !userId || currentUser.uid !== userId) {
    throw new Error("Sign in again before updating your profile.");
  }

  if (userData.name.trim() && currentUser.displayName !== userData.name.trim()) {
    await updateProfile(currentUser, {
      displayName: userData.name.trim(),
    });
  }

  const snapshot = await getDoc(userDocRef(userId));
  const existing = snapshot.exists()
    ? (snapshot.data() as FirebaseUserProfile)
    : null;

  const profile = await saveUserProfile(
    currentUser,
    buildProfilePayload(
      {
        ...userData,
        id: userId,
        email: userData.email ?? currentUser.email ?? "",
      },
      existing,
    ),
  );

  return toUserData(toAuthUser(currentUser, profile), profile);
};

export const signupWithFirebase = async (payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<FirebaseAuthPayload> => {
  const { auth } = await requireFirebase();
  const email = normalizeEmail(payload.email);
  const phone = normalizePhone(payload.phone);

  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    payload.password,
  );

  await updateProfile(credential.user, {
    displayName: payload.name.trim(),
  });

  const profile = await saveUserProfile(credential.user, {
    name: payload.name.trim(),
    email,
    phone,
    role: "user",
    plan: "none",
    status: "active",
    healthScore: 0,
  });

  const accessToken = await credential.user.getIdToken();

  return {
    user: toAuthUser(credential.user, profile),
    accessToken,
  };
};

export const loginWithFirebase = async (
  identifier: string,
  password: string,
): Promise<FirebaseAuthPayload> => {
  const { auth } = await requireFirebase();
  const normalizedIdentifier = identifier.trim();

  if (!normalizedIdentifier.includes("@")) {
    throw new Error(
      "Use your registered email address to sign in. Phone and OTP login will be added in the next Firebase auth phase.",
    );
  }

  const credential = await signInWithEmailAndPassword(
    auth,
    normalizeEmail(normalizedIdentifier),
    password,
  );

  const profile = await saveUserProfile(credential.user, {
    email: credential.user.email ?? normalizeEmail(normalizedIdentifier),
  });

  const accessToken = await credential.user.getIdToken();

  return {
    user: toAuthUser(credential.user, profile),
    accessToken,
  };
};

export const logoutFirebaseUser = async () => {
  if (!firebaseAuth) {
    return;
  }

  await signOut(firebaseAuth);
};
