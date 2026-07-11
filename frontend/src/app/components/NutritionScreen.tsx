import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Apple,
  Camera,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Save,
  Search,
  Sparkles,
  TrendingUp,
  Upload,
  Utensils,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import type { UserData } from "../App";
import {
  apiClient,
  type DailyHealthLog,
  type NutritionAnalysis,
} from "../utils/api-client";
import { todayPlanDate } from "../utils/daily-plan-state";

interface NutritionScreenProps {
  user: UserData | null;
  onBack: () => void;
}

interface FoodItem {
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: string;
  healthBenefits: string[];
  restrictions?: string[];
}

const indianFoods: FoodItem[] = [
  {
    name: "Dal Chawal",
    category: "Main Course",
    calories: 430,
    protein: 16,
    carbs: 72,
    fat: 7,
    fiber: 9,
    servingSize: "1 medium plate",
    healthBenefits: ["Vegetarian protein pairing", "High fiber", "Comfortable everyday meal"],
  },
  {
    name: "Roti with Sabzi",
    category: "Main Course",
    calories: 360,
    protein: 11,
    carbs: 62,
    fat: 8,
    fiber: 8,
    servingSize: "2 rotis + 1 bowl sabzi",
    healthBenefits: ["Balanced carbs", "Vegetable micronutrients", "Good satiety"],
    restrictions: ["Gluten"],
  },
  {
    name: "Idli Sambar",
    category: "Breakfast",
    calories: 300,
    protein: 11,
    carbs: 55,
    fat: 4,
    fiber: 7,
    servingSize: "3 idli + 1 bowl sambar",
    healthBenefits: ["Light breakfast", "Fermented batter", "Dal-based protein"],
  },
  {
    name: "Paneer Curry",
    category: "Protein",
    calories: 410,
    protein: 22,
    carbs: 13,
    fat: 30,
    fiber: 3,
    servingSize: "1 bowl",
    healthBenefits: ["High protein", "Calcium rich", "Useful for muscle goals"],
    restrictions: ["Dairy"],
  },
  {
    name: "Chicken Rice Bowl",
    category: "Protein",
    calories: 480,
    protein: 38,
    carbs: 35,
    fat: 18,
    fiber: 4,
    servingSize: "1 plate",
    healthBenefits: ["High protein", "Good for strength goals", "Filling meal"],
  },
];

const confidenceClass: Record<NutritionAnalysis["confidence"], string> = {
  high: "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-gray-100 text-gray-700 border-gray-200",
};

const todayDate = () => new Date().toISOString().slice(0, 10);

const emptyAnalysis: NutritionAnalysis | null = null;

export function NutritionScreen({ user, onBack }: NutritionScreenProps) {
  const [selectedTab, setSelectedTab] = useState<"analyze" | "plan" | "database">("analyze");
  const [searchQuery, setSearchQuery] = useState("");
  const [mealName, setMealName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(emptyAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredFoods = useMemo(
    () =>
      indianFoods.filter(
        (food) =>
          food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          food.category.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [searchQuery],
  );

  const dailyNutrition = useMemo(() => {
    const calorieTarget = user?.goals?.some((goal) =>
      goal.toLowerCase().includes("weight-loss"),
    )
      ? 1800
      : user?.goals?.some((goal) =>
            goal.toLowerCase().includes("muscle") ||
            goal.toLowerCase().includes("weight-gain"),
          )
        ? 2400
        : 2100;

    const proteinTarget = Math.max(55, Math.round((user?.weight ?? 65) * 1.2));
    return { calorieTarget, proteinTarget };
  }, [user?.goals, user?.weight]);

  const handleImageSelect = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(String(reader.result));
      setMessage("Photo added. Add the meal name or main ingredients, then analyze.");
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (nameOverride?: string) => {
    const nextMealName = (nameOverride ?? mealName).trim();
    if (!nextMealName) {
      setMessage("Please enter the meal name or main ingredients first.");
      return;
    }

    setMealName(nextMealName);
    setIsAnalyzing(true);
    setMessage(null);

    const response = await apiClient.analyzeNutrition(nextMealName);
    const nextAnalysis = response.data?.analysis ?? null;

    if (response.success && nextAnalysis) {
      setAnalysis({
        ...nextAnalysis,
        source: imagePreview ? "image-assisted-estimate" : nextAnalysis.source,
      });
      setMessage(
        imagePreview
          ? "Meal analyzed with photo context and ingredient text. Full visual AI can be plugged in next."
          : "Meal analyzed from the nutrition database.",
      );
    } else {
      setMessage(response.error ?? "Could not analyze this meal yet.");
    }

    setIsAnalyzing(false);
  };

  const handleSaveMeal = async () => {
    if (!user?.id || !analysis) {
      setMessage("Please log in and analyze a meal before saving.");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const today = todayDate();
    const logsResponse = await apiClient.getDailyHealthLogs(user.id, 7);
    const existingLog = logsResponse.data?.logs.find(
      (entry) => entry.logDate === today,
    );

    const baseLog: Partial<DailyHealthLog> = existingLog ?? {};
    const mealNote = `${analysis.mealName}: ${analysis.calories} kcal, ${analysis.proteinGrams}g protein`;
    const response = await apiClient.saveDailyHealthLog(user.id, {
      logDate: today,
      waterGlasses: baseLog.waterGlasses ?? 0,
      steps: baseLog.steps ?? 0,
      sleepHours: baseLog.sleepHours ?? null,
      caloriesConsumed: (baseLog.caloriesConsumed ?? 0) + analysis.calories,
      caloriesBurned: baseLog.caloriesBurned ?? 0,
      proteinGrams: (baseLog.proteinGrams ?? 0) + analysis.proteinGrams,
      mood: baseLog.mood ?? "good",
      notes: [baseLog.notes, mealNote].filter(Boolean).join(" | "),
    });

    if (response.success) {
      await apiClient.generateDailyPlan(user.id, user, {
        planDate: todayPlanDate(),
        updatedFrom: "progress",
        updateReason: "Today's plan updated automatically because a meal was saved.",
      });
      setMessage("Meal saved. Progress, Daily Plan, and AI Chat can now use this nutrition data.");
    } else {
      setMessage(response.error ?? "Meal could not be saved.");
    }

    setIsSaving(false);
  };

  const renderAnalyzeTab = () => (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-orange-50 p-5 border border-emerald-100">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Camera className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="font-semibold text-wellness-dark">Meal Photo Nutrition</h3>
            <p className="text-sm text-wellness-light">
              Add a photo and type the meal name or ingredients. Aarogya estimates calories,
              protein, macros, nutrients, and cautions.
            </p>
          </div>
        </div>

        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Selected meal"
            className="w-full h-44 object-cover rounded-2xl mb-4 border border-white shadow-sm"
          />
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-36 rounded-2xl border border-dashed border-emerald-300 bg-white/70 flex flex-col items-center justify-center text-emerald-700 mb-4"
          >
            <Upload className="w-7 h-7 mb-2" />
            <span className="text-sm font-medium">Upload meal photo</span>
            <span className="text-xs text-wellness-light">JPG or PNG from your device</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleImageSelect(event.target.files?.[0])}
        />

        <div className="space-y-3">
          <Input
            placeholder="Example: dal chawal, paneer curry, chicken rice bowl"
            value={mealName}
            onChange={(event) => setMealName(event.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4 mr-2" />
              {imagePreview ? "Change Photo" : "Add Photo"}
            </Button>
            <Button
              type="button"
              className="wellness-green text-white"
              disabled={isAnalyzing}
              onClick={() => void handleAnalyze()}
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Analyze
            </Button>
          </div>
        </div>
      </div>

      {analysis ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-wellness-dark">{analysis.mealName}</h3>
              <p className="text-sm text-wellness-light">{analysis.servingSize}</p>
            </div>
            <Badge className={confidenceClass[analysis.confidence]}>
              {analysis.confidence} confidence
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-orange-50 p-4">
              <div className="text-2xl font-semibold text-orange-700">
                {analysis.calories}
              </div>
              <div className="text-xs text-wellness-light">Calories</div>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <div className="text-2xl font-semibold text-emerald-700">
                {analysis.proteinGrams}g
              </div>
              <div className="text-xs text-wellness-light">Protein</div>
            </div>
            <div className="rounded-2xl bg-blue-50 p-4">
              <div className="text-lg font-semibold text-blue-700">
                {analysis.carbsGrams}g carbs
              </div>
              <div className="text-xs text-wellness-light">
                {analysis.fiberGrams}g fiber, {analysis.sugarGrams}g sugar
              </div>
            </div>
            <div className="rounded-2xl bg-purple-50 p-4">
              <div className="text-lg font-semibold text-purple-700">
                {analysis.fatGrams}g fat
              </div>
              <div className="text-xs text-wellness-light">
                {analysis.sodiumMg}mg sodium
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-wellness-dark mb-2">
              Nutrients detected
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.micronutrients.map((item) => (
                <Badge key={item} variant="outline" className="border-emerald-200 text-emerald-700">
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {analysis.healthNotes.map((note) => (
              <div key={note} className="flex items-start gap-2 text-sm text-wellness-dark">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>{note}</span>
              </div>
            ))}
            {analysis.cautions.map((caution) => (
              <div key={caution} className="flex items-start gap-2 text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <span>{caution}</span>
              </div>
            ))}
          </div>

          <Button
            type="button"
            className="w-full wellness-green text-white"
            disabled={isSaving}
            onClick={() => void handleSaveMeal()}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save to Today's Nutrition
          </Button>
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {message}
        </div>
      ) : null}
    </div>
  );

  const renderPlanTab = () => (
    <div className="space-y-5">
      <div className="rounded-3xl bg-wellness-gray p-5">
        <h3 className="font-semibold text-wellness-dark mb-3">Today's Nutrition Targets</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4">
            <div className="text-2xl font-semibold text-wellness-green">
              {dailyNutrition.calorieTarget}
            </div>
            <div className="text-xs text-wellness-light">calories target</div>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <div className="text-2xl font-semibold text-wellness-green">
              {dailyNutrition.proteinTarget}g
            </div>
            <div className="text-xs text-wellness-light">protein target</div>
          </div>
        </div>
      </div>

      {[
        ["Breakfast", "Protein-first breakfast with fiber and steady carbs."],
        ["Lunch", "Balanced plate: protein, vegetables, curd, and controlled carbs."],
        ["Snack", "Fruit, nuts, sprouts, curd, or tea without heavy sugar."],
        ["Dinner", "Light protein and vegetables, ideally not too close to sleep."],
      ].map(([meal, description]) => (
        <div key={meal} className="rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Utensils className="w-4 h-4 text-wellness-green" />
            <h4 className="font-medium text-wellness-dark">{meal}</h4>
          </div>
          <p className="text-sm text-wellness-light">{description}</p>
        </div>
      ))}
    </div>
  );

  const renderDatabaseTab = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-wellness-light" />
        <Input
          placeholder="Search Indian foods..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="pl-10"
        />
      </div>

      {filteredFoods.map((food) => (
        <button
          key={food.name}
          type="button"
          onClick={() => void handleAnalyze(food.name)}
          className="w-full text-left p-4 border border-gray-200 rounded-2xl hover:shadow-wellness transition-shadow bg-white"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-wellness-dark font-medium">{food.name}</h4>
              <p className="text-xs text-wellness-light">{food.category} | {food.servingSize}</p>
            </div>
            <Badge variant="secondary">{food.calories} kcal</Badge>
          </div>
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-wellness-light">
            <span>Protein {food.protein}g</span>
            <span>Carbs {food.carbs}g</span>
            <span>Fat {food.fat}g</span>
            <span>Fiber {food.fiber}g</span>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="text-center">
          <h2 className="text-wellness-dark font-medium">Nutrition Hub</h2>
          <p className="text-xs text-wellness-light">Meal analysis and food tracking</p>
        </div>
        <Apple className="w-5 h-5 text-wellness-green" />
      </div>

      <div className="flex border-b border-gray-100">
        {[
          { key: "analyze", label: "Analyze", icon: Camera },
          { key: "plan", label: "Plan", icon: TrendingUp },
          { key: "database", label: "Food DB", icon: Search },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedTab(key as typeof selectedTab)}
            className={`flex-1 flex items-center justify-center space-x-1 py-3 ${
              selectedTab === key
                ? "text-wellness-green border-b-2 border-wellness-green"
                : "text-wellness-light"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>

      <div className="p-6">
        {selectedTab === "analyze" ? renderAnalyzeTab() : null}
        {selectedTab === "plan" ? renderPlanTab() : null}
        {selectedTab === "database" ? renderDatabaseTab() : null}
      </div>
    </div>
  );
}
