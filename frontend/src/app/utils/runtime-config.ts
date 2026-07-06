const env = import.meta.env;

const clean = (value: string | undefined) => value?.trim() ?? "";

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return value.toLowerCase() !== "false";
};

export const runtimeConfig = {
  apiBaseUrl: clean(env.VITE_API_BASE_URL),
  apiEnabled: parseBoolean(env.VITE_API_ENABLED, false),
  useMockFallback: parseBoolean(env.VITE_USE_MOCK_FALLBACK, true),
  firebaseFunctionsBaseUrl: clean(env.VITE_FIREBASE_FUNCTIONS_BASE_URL),
  firebaseEnabled: parseBoolean(
    env.VITE_FIREBASE_ENABLED,
    Boolean(
      clean(env.VITE_FIREBASE_API_KEY) &&
        clean(env.VITE_FIREBASE_AUTH_DOMAIN) &&
        clean(env.VITE_FIREBASE_PROJECT_ID),
    ),
  ),
  firebaseConfig: {
    apiKey: clean(env.VITE_FIREBASE_API_KEY),
    authDomain: clean(env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: clean(env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: clean(env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: clean(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: clean(env.VITE_FIREBASE_APP_ID),
    measurementId: clean(env.VITE_FIREBASE_MEASUREMENT_ID),
  },
  paymentApiBaseUrl: clean(env.VITE_PAYMENT_API_BASE_URL),
  razorpayKeyId: clean(env.VITE_RAZORPAY_KEY_ID),
  paymentMode: clean(env.VITE_PAYMENT_API_BASE_URL) ? "live" : "simulation",
};

export type PaymentMode = typeof runtimeConfig.paymentMode;
