import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { runtimeConfig } from "../runtime-config";

const hasFirebaseConfig = Boolean(
  runtimeConfig.firebaseEnabled &&
    runtimeConfig.firebaseConfig.apiKey &&
    runtimeConfig.firebaseConfig.authDomain &&
    runtimeConfig.firebaseConfig.projectId,
);

const firebaseAppInstance: FirebaseApp | null = hasFirebaseConfig
  ? getApps().length
    ? getApp()
    : initializeApp(runtimeConfig.firebaseConfig)
  : null;

const firebaseAuthInstance: Auth | null = firebaseAppInstance
  ? getAuth(firebaseAppInstance)
  : null;

const firestoreInstance: Firestore | null = firebaseAppInstance
  ? getFirestore(firebaseAppInstance)
  : null;

let persistenceSetup: Promise<void> | null = null;

export const firebaseApp = firebaseAppInstance;
export const firebaseAuth = firebaseAuthInstance;
export const firebaseDb = firestoreInstance;
export const isFirebaseCoreEnabled = Boolean(firebaseApp && firebaseDb);

export const ensureFirebaseSession = async () => {
  if (!firebaseAuth) {
    return undefined;
  }

  if (!persistenceSetup) {
    persistenceSetup = setPersistence(firebaseAuth, browserLocalPersistence).catch(
      (error) => {
        console.warn("Firebase auth persistence could not be enabled:", error);
      },
    );
  }

  await persistenceSetup;
  return firebaseAuth.currentUser ?? undefined;
};
