import cors from "cors";
import express from "express";
import admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";

const app = express();

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();
const corsMiddleware = cors({ origin: true });
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

app.use((req, res, next) => corsMiddleware(req, res, next));
app.use(express.json());

const usersCollection = "users";

const todayPlanDate = () => new Date().toISOString().slice(0, 10);

const buildFallbackUser = () => ({
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

const authenticateFirebaseUser = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) {
    res.status(401).json({ success: false, error: "Missing Firebase auth token." });
    return;
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : "Invalid auth token.",
    });
  }
};

const parseTime = (value, fallback) => {
  const safe = typeof value === "string" && /^\d{2}:\d{2}$/.test(value)
    ? value
    : fallback;
  const [hour, minute] = safe.split(":").map(Number);
  return hour * 60 + minute;
};

const formatTime = (absoluteMinutes) => {
  const normalized = ((absoluteMinutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
};

const normalizeGoal = (goal) =>
  String(goal || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-");

const activityMultipliers = {
  sedentary: 1.2,
  "lightly-active": 1.375,
  "moderately-active": 1.55,
  "very-active": 1.725,
};

const stepsTargets = {
  sedentary: 6500,
  "lightly-active": 8500,
  "moderately-active": 10000,
  "very-active": 12000,
};

const calculateTargets = (user, awakeHours) => {
  const weight = Number(user.weight || 65);
  const height = Number(user.height || 165);
  const age = Number(user.age || 30);
  const activityLevel = user.activityLevel || "lightly-active";
  const normalizedGoals = (user.goals || []).map(normalizeGoal);
  const gender = user.gender || "other";

  const baseBmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  let calorieTarget = Math.round(
    baseBmr * (activityMultipliers[activityLevel] || 1.375),
  );

  if (normalizedGoals.includes("weight-loss")) calorieTarget -= 350;
  if (
    normalizedGoals.includes("muscle-building") ||
    normalizedGoals.includes("muscle-gain") ||
    normalizedGoals.includes("weight-gain")
  ) {
    calorieTarget += 250;
  }

  let waterTargetLiters = (weight * 30) / 1000;
  if (awakeHours >= 16) waterTargetLiters += 0.5;
  else if (awakeHours >= 14) waterTargetLiters += 0.3;
  else if (awakeHours <= 11) waterTargetLiters -= 0.2;

  if (activityLevel === "moderately-active") waterTargetLiters += 0.2;
  if (activityLevel === "very-active") waterTargetLiters += 0.4;

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

const summarizePlan = (user, recentLogs = []) => {
  const wakeMinutes = parseTime(user.wakeUpTime, "07:00");
  let sleepMinutes = parseTime(user.sleepTime, "23:00");
  if (sleepMinutes <= wakeMinutes) sleepMinutes += 1440;
  const awakeHours = Number(((sleepMinutes - wakeMinutes) / 60).toFixed(1));
  const targets = calculateTargets(user, awakeHours);
  const latestLog = recentLogs[0] || null;
  const focusAreas = [];
  const goals = (user.goals || []).map(normalizeGoal);

  if (goals.includes("better-sleep") || goals.includes("stress-management")) {
    focusAreas.push("recovery");
  }
  if (
    goals.includes("weight-loss") ||
    goals.includes("muscle-building") ||
    goals.includes("general-fitness")
  ) {
    focusAreas.push("movement");
  }
  if ((latestLog?.waterGlasses || 0) < 6) focusAreas.push("hydration");
  if ((latestLog?.sleepHours || 7) < 6.5) focusAreas.push("sleep recovery");
  if (!focusAreas.length) focusAreas.push("consistency");

  const insight =
    (latestLog?.sleepHours || 7) < 6.5
      ? "Recent sleep looks low, so today should lean toward recovery and steadier energy."
      : (latestLog?.waterGlasses || targets.waterTargetGlasses) < 6
        ? "Hydration is the clearest gap from your recent data, so that is the easiest lever today."
        : user.occupation === "office-worker"
          ? "Your plan should keep breaking long sitting periods while still fitting your workday."
          : "Your plan balances meals, movement, hydration, and recovery through the day.";

  return {
    wakeUpTime: formatTime(wakeMinutes),
    sleepTime: formatTime(sleepMinutes),
    awakeHours,
    calorieTarget: targets.calorieTarget,
    waterTargetLiters: targets.waterTargetLiters,
    waterTargetGlasses: targets.waterTargetGlasses,
    stepsTarget: targets.stepsTarget,
    focusAreas,
    insight,
  };
};

const getUserProfile = async (userId) => {
  const snapshot = await db.collection(usersCollection).doc(userId).get();
  return snapshot.exists ? snapshot.data() : null;
};

const getRecentLogs = async (userId, days = 7) => {
  const snapshot = await db
    .collection(usersCollection)
    .doc(userId)
    .collection("dailyHealthLogs")
    .orderBy("logDate", "desc")
    .limit(days)
    .get();

  return snapshot.docs.map((entry) => entry.data());
};

const getRecentSymptoms = async (userId, maxItems = 5) => {
  const snapshot = await db
    .collection(usersCollection)
    .doc(userId)
    .collection("symptomLogs")
    .orderBy("loggedAt", "desc")
    .limit(maxItems)
    .get();

  return snapshot.docs.map((entry) => entry.data());
};

const getTodayPlan = async (userId) => {
  const snapshot = await db
    .collection(usersCollection)
    .doc(userId)
    .collection("dailyPlans")
    .doc(todayPlanDate())
    .get();

  return snapshot.exists ? snapshot.data() : null;
};

const requireOwner = (req, res, targetUserId) => {
  if (req.firebaseUser?.uid !== targetUserId) {
    res.status(403).json({ success: false, error: "Forbidden for this user." });
    return false;
  }
  return true;
};

const callGemini = async ({ prompt, imageData, expectJson = false }) => {
  if (!geminiApiKey) {
    return null;
  }

  const parts = [{ text: prompt }];
  if (imageData) {
    const match = String(imageData).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2],
        },
      });
    }
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: expectJson ? 0.2 : 0.45,
          responseMimeType: expectJson ? "application/json" : "text/plain",
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}`);
  }

  const payload = await response.json();
  return payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim() || null;
};

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    const match = String(value || "").match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
};

const normalizeGeminiChatReply = (parsed, fallback) => ({
  content:
    typeof parsed?.content === "string" && parsed.content.trim()
      ? parsed.content.trim()
      : fallback.content,
  suggestions: Array.isArray(parsed?.suggestions)
    ? parsed.suggestions.slice(0, 4).map(String)
    : fallback.suggestions,
  requiresDoctor: Boolean(parsed?.requiresDoctor ?? fallback.requiresDoctor),
});

const buildGeminiChatReply = async ({ message, user, plan, recentLogs, symptoms }) => {
  const fallback = buildChatReply({ message, user, plan, recentLogs, symptoms });
  if (!geminiApiKey) {
    return fallback;
  }

  const context = {
    user: {
      age: user.age,
      gender: user.gender,
      occupation: user.occupation,
      activityLevel: user.activityLevel,
      wakeUpTime: user.wakeUpTime,
      sleepTime: user.sleepTime,
      goals: user.goals || [],
      medicalConditions: user.medicalConditions || [],
    },
    todayPlanSummary: plan?.generatedPlan?.summary || summarizePlan(user, recentLogs),
    recentLogs: recentLogs.slice(0, 5),
    symptoms: symptoms.slice(0, 5),
  };

  const prompt = `
You are Aarogya AI, a cautious wellness assistant for a healthcare planning app.
Use the user's saved context to answer. Do not diagnose disease or prescribe medicine.
If symptoms sound urgent, set requiresDoctor true and tell the user to consult a doctor/emergency care.
Keep the answer practical, warm, and under 120 words.

Return only JSON with:
{
  "content": "answer",
  "suggestions": ["short follow-up 1", "short follow-up 2", "short follow-up 3"],
  "requiresDoctor": false
}

User question: ${message}
Saved context:
${JSON.stringify(context, null, 2)}
`;

  try {
    const text = await callGemini({ prompt, expectJson: true });
    const parsed = safeJsonParse(text);
    return normalizeGeminiChatReply(parsed, fallback);
  } catch (error) {
    console.warn("Gemini chat fallback used:", error instanceof Error ? error.message : error);
    return fallback;
  }
};

const nutritionFoodDatabase = [
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
      healthNotes: [
        "Good vegetarian protein pairing.",
        "Dal adds fiber and helps the meal feel more filling.",
      ],
      cautions: ["Keep rice portion controlled for weight loss or diabetes goals."],
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
      healthNotes: [
        "Balanced everyday Indian meal.",
        "Vegetables improve fiber and micronutrient density.",
      ],
      cautions: ["Oil and salt can change the estimate significantly."],
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
      healthNotes: [
        "Strong protein and calcium source.",
        "Useful for muscle gain or higher-protein goals.",
      ],
      cautions: ["Cream, butter, or extra oil can make this much heavier."],
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
      healthNotes: [
        "Light breakfast with fermented batter.",
        "Sambar adds protein and vegetables.",
      ],
      cautions: ["Chutney quantity can add extra calories."],
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
      healthNotes: [
        "High protein option.",
        "Good fit for strength and satiety goals.",
      ],
      cautions: ["Fried or creamy preparation can double calories."],
      source: "text-estimate",
    },
  },
];

const analyzeNutritionFromText = (foodName) => {
  const cleanFoodName = String(foodName || "").trim();
  const lowerFoodName = cleanFoodName.toLowerCase();
  const matched = nutritionFoodDatabase.find((entry) =>
    entry.terms.some((term) => lowerFoodName.includes(term)),
  );

  if (matched) {
    return matched.analysis;
  }

  return {
    mealName: cleanFoodName || "Custom meal",
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
    healthNotes: [
      "This is an approximate estimate until image AI or a verified nutrition API is connected.",
    ],
    cautions: ["Portion size, oil, sugar, and sauces can change calories a lot."],
    source: "text-estimate",
  };
};

const normalizeNutritionAnalysis = (parsed, fallback, imageData) => ({
  mealName:
    typeof parsed?.mealName === "string" && parsed.mealName.trim()
      ? parsed.mealName.trim()
      : fallback.mealName,
  confidence: ["low", "medium", "high"].includes(parsed?.confidence)
    ? parsed.confidence
    : imageData
      ? "medium"
      : fallback.confidence,
  servingSize:
    typeof parsed?.servingSize === "string" && parsed.servingSize.trim()
      ? parsed.servingSize.trim()
      : fallback.servingSize,
  calories: Number(parsed?.calories ?? fallback.calories),
  proteinGrams: Number(parsed?.proteinGrams ?? fallback.proteinGrams),
  carbsGrams: Number(parsed?.carbsGrams ?? fallback.carbsGrams),
  fatGrams: Number(parsed?.fatGrams ?? fallback.fatGrams),
  fiberGrams: Number(parsed?.fiberGrams ?? fallback.fiberGrams),
  sugarGrams: Number(parsed?.sugarGrams ?? fallback.sugarGrams),
  sodiumMg: Number(parsed?.sodiumMg ?? fallback.sodiumMg),
  micronutrients: Array.isArray(parsed?.micronutrients)
    ? parsed.micronutrients.slice(0, 8).map(String)
    : fallback.micronutrients,
  healthNotes: Array.isArray(parsed?.healthNotes)
    ? parsed.healthNotes.slice(0, 4).map(String)
    : fallback.healthNotes,
  cautions: Array.isArray(parsed?.cautions)
    ? parsed.cautions.slice(0, 4).map(String)
    : fallback.cautions,
  source: imageData ? "image-assisted-estimate" : "text-estimate",
});

const analyzeNutritionWithGemini = async ({ foodName, imageData }) => {
  const fallback = analyzeNutritionFromText(foodName);
  if (!geminiApiKey) {
    return fallback;
  }

  const prompt = `
Analyze this meal for a wellness app. Estimate nutrition conservatively.
If an image is provided, use it as visual context, but do not pretend certainty.
Return only JSON with this exact shape:
{
  "mealName": "meal name",
  "confidence": "low|medium|high",
  "servingSize": "estimated serving",
  "calories": 0,
  "proteinGrams": 0,
  "carbsGrams": 0,
  "fatGrams": 0,
  "fiberGrams": 0,
  "sugarGrams": 0,
  "sodiumMg": 0,
  "micronutrients": ["nutrient"],
  "healthNotes": ["short practical note"],
  "cautions": ["portion/oil/sugar/salt caution"]
}

Meal text or ingredients: ${foodName}
`;

  try {
    const text = await callGemini({ prompt, imageData, expectJson: true });
    const parsed = safeJsonParse(text);
    return normalizeNutritionAnalysis(parsed, fallback, imageData);
  } catch (error) {
    console.warn(
      "Gemini nutrition fallback used:",
      error instanceof Error ? error.message : error,
    );
    return fallback;
  }
};

const buildChatReply = ({ message, user, plan, recentLogs, symptoms }) => {
  const lowerMessage = String(message || "").toLowerCase();
  const latestLog = recentLogs[0] || null;
  const latestSymptom = symptoms[0] || null;
  const summary = plan?.generatedPlan?.summary || summarizePlan(user, recentLogs);
  const waterTarget = summary.waterTargetGlasses || 8;
  const stepsTarget = summary.stepsTarget || 10000;
  const caloriesTarget = summary.calorieTarget || 2000;
  const latestWater = latestLog?.waterGlasses || 0;
  const latestSteps = latestLog?.steps || 0;
  const latestProtein = latestLog?.proteinGrams || 0;
  const latestSleep = latestLog?.sleepHours ?? null;

  if (lowerMessage.includes("why") && lowerMessage.includes("plan")) {
    return {
      content: `Today's plan is based on your saved routine of waking at ${summary.wakeUpTime} and sleeping at ${summary.sleepTime}. ${plan?.updateReason || summary.insight}`,
      suggestions: ["What should I do next?", "How do I improve today’s score?", "Suggest my next meal"],
      requiresDoctor: false,
    };
  }

  if (lowerMessage.includes("sleep") || lowerMessage.includes("tired")) {
    return {
      content: latestSleep !== null
        ? `You logged ${latestSleep} hours of sleep recently. ${latestSleep < 7 ? "That is likely why today's plan is leaning toward recovery, hydration, and steadier energy." : "That gives you a stronger base for movement and focus today."}`
        : `Your saved sleep schedule is ${summary.wakeUpTime} to ${summary.sleepTime}. If you log actual sleep hours, I can adapt the advice more precisely.`,
      suggestions: ["How can I sleep better?", "Why did my plan change?", "Show recovery focus"],
      requiresDoctor: false,
    };
  }

  if (lowerMessage.includes("water") || lowerMessage.includes("hydration")) {
    return {
      content: `Your target today is ${waterTarget} glasses, and your latest check-in shows ${latestWater}. ${latestWater < waterTarget ? `Hydration is still one of the fastest ways to improve today's score.` : "You have already met the hydration target, which is great."}`,
      suggestions: ["How do I improve my score?", "What should I do next?", "Show today’s targets"],
      requiresDoctor: false,
    };
  }

  if (lowerMessage.includes("step") || lowerMessage.includes("walk") || lowerMessage.includes("exercise")) {
    return {
      content: `Your step target today is ${stepsTarget.toLocaleString("en-IN")}, and you have logged ${latestSteps.toLocaleString("en-IN")}. ${latestSteps < stepsTarget ? "A focused walk or short movement block is still the highest-impact next move." : "You are already near or above the movement target, so consistency and recovery matter more now."}`,
      suggestions: ["What should I do next?", "Give me a workout idea", "How does this affect my plan?"],
      requiresDoctor: false,
    };
  }

  if (lowerMessage.includes("food") || lowerMessage.includes("meal") || lowerMessage.includes("diet") || lowerMessage.includes("protein")) {
    return {
      content: `Your plan is aiming for about ${caloriesTarget} kcal today, and your latest check-in shows ${latestProtein}g of protein so far. A balanced next meal with protein, vegetables, and steady carbs would fit the plan best right now.`,
      suggestions: ["Suggest my next meal", "How much protein do I need?", "What should I avoid tonight?"],
      requiresDoctor: false,
    };
  }

  if (lowerMessage.includes("symptom") || lowerMessage.includes("pain") || lowerMessage.includes("headache") || lowerMessage.includes("stress")) {
    const severeTerms = ["chest pain", "breathing", "faint", "severe", "worst", "vomit"];
    const flagged = severeTerms.some((term) => lowerMessage.includes(term)) || latestSymptom?.severity === "severe";
    return {
      content: latestSymptom
        ? `Your latest saved symptom is ${latestSymptom.symptom} (${latestSymptom.severity}). ${flagged ? "Because it sounds significant, please seek medical advice rather than relying only on app guidance." : "I would keep today's plan lighter, stay hydrated, and monitor whether it improves after rest and food."}`
        : `${flagged ? "Your message sounds like it may need medical attention." : "I can help you think through symptoms, but serious or worsening issues should go to a doctor."} Save the symptom in Progress if you want the plan to adapt more clearly.`,
      suggestions: flagged
        ? ["Consult a doctor", "Save symptom in Progress", "Show recovery plan"]
        : ["Save symptom in Progress", "How should today’s plan change?", "What should I monitor?"],
      requiresDoctor: flagged,
    };
  }

  return {
    content: `I’m answering from your saved Aarogya data. Right now your plan is centered on ${summary.wakeUpTime} to ${summary.sleepTime}, with targets of ${waterTarget} glasses, ${stepsTarget.toLocaleString("en-IN")} steps, and about ${caloriesTarget} kcal. ${plan?.updateReason || summary.insight}`,
    suggestions: ["Why did my plan update today?", "How do I improve today’s score?", "Suggest my next meal", "Check my symptoms"],
    requiresDoctor: false,
  };
};

app.get("/health", async (_req, res) => {
  res.json({
    success: true,
    service: "aarogya-ai-functions",
    timestamp: new Date().toISOString(),
  });
});

app.get("/users/:userId/context", authenticateFirebaseUser, async (req, res) => {
  const { userId } = req.params;
  if (!requireOwner(req, res, userId)) return;

  try {
    const [profile, recentLogs, symptoms, todayPlan] = await Promise.all([
      getUserProfile(userId),
      getRecentLogs(userId, 7),
      getRecentSymptoms(userId, 5),
      getTodayPlan(userId),
    ]);

    const safeUser = {
      ...buildFallbackUser(),
      ...(profile || {}),
      id: userId,
    };

    res.json({
      success: true,
      context: {
        user: safeUser,
        recentLogs,
        symptoms,
        todayPlan,
        generatedSummary: summarizePlan(safeUser, recentLogs),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown server error.",
    });
  }
});

app.post("/chat", authenticateFirebaseUser, async (req, res) => {
  const { userId, message } = req.body || {};
  if (!userId || !message) {
    res.status(400).json({ success: false, error: "userId and message are required." });
    return;
  }
  if (!requireOwner(req, res, String(userId))) return;

  try {
    const [profile, recentLogs, symptoms, todayPlan] = await Promise.all([
      getUserProfile(String(userId)),
      getRecentLogs(String(userId), 7),
      getRecentSymptoms(String(userId), 5),
      getTodayPlan(String(userId)),
    ]);

    const safeUser = {
      ...buildFallbackUser(),
      ...(profile || {}),
      id: String(userId),
    };

    const reply = await buildGeminiChatReply({
      message,
      user: safeUser,
      plan: todayPlan,
      recentLogs,
      symptoms,
    });

    res.json({
      success: true,
      reply,
      source: "firebase-functions",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown server error.",
    });
  }
});

app.post("/nutrition/analyze", async (req, res) => {
  const { foodName, imageData } = req.body || {};
  if (!foodName || !String(foodName).trim()) {
    res.status(400).json({ success: false, error: "foodName is required." });
    return;
  }

  const analysis = await analyzeNutritionWithGemini({ foodName, imageData });
  res.json({
    success: true,
    analysis,
    source: geminiApiKey ? "gemini" : "firebase-functions-fallback",
    timestamp: new Date().toISOString(),
  });
});

export const api = onRequest(
  {
    region: "asia-south1",
    cors: true,
    memory: "256MiB",
  },
  app,
);
