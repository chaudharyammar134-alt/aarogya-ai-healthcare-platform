import { useState, useEffect } from "react";
import { Homepage } from "./components/Homepage";
import { SplashScreen } from "./components/SplashScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { LoginScreen } from "./components/LoginScreen";
import { SignupScreen } from "./components/SignupScreen";
import { AdminNotificationScreen } from "./components/AdminNotificationScreen";
import { AdminDashboardScreen } from "./components/AdminDashboardScreen";
import { UserManagementScreen } from "./components/UserManagementScreen";
import { UserProfileDetailScreen } from "./components/UserProfileDetailScreen";
import { SubscriptionManagementScreen } from "./components/SubscriptionManagementScreen";
import { InvoiceManagementScreen } from "./components/InvoiceManagementScreen";
import { AdminNotificationsListScreen } from "./components/AdminNotificationsListScreen";
import { AdminAnalyticsScreen } from "./components/AdminAnalyticsScreen";
import { PaymentMockScreen } from "./components/PaymentMockScreen";
import { AdminAlertsScreen } from "./components/AdminAlertsScreen";
import { HomeScreen } from "./components/HomeScreen";
import { DailyPlanScreen } from "./components/DailyPlanScreen";
import { ProgressScreen } from "./components/ProgressScreen";
import { NotificationsScreen } from "./components/NotificationsScreen";
import { MembershipScreen } from "./components/MembershipScreen";
import { PaymentScreen } from "./components/PaymentScreen";
import { SubscriptionSuccessScreen } from "./components/SubscriptionSuccessScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { MedicalHistoryScreen } from "./components/MedicalHistoryScreen";
import { NutritionScreen } from "./components/NutritionScreen";
import { AIChatScreen } from "./components/AIChatScreen";
import { PerformanceOptimizer } from "./components/PerformanceOptimizer";
import { smartNotifications } from "./utils/notifications";
import { offlineStorage } from "./utils/offline";
import { APIIntegrationDashboard } from "./components/APIIntegrationDashboard";
import { apiClient } from "./utils/api-client";
import type { PaymentResult } from "./utils/payment-api-service";
import type {
  SubscriptionPlan,
  UserData,
  UserSubscription,
} from "./types/user";

export type {
  MedicalCondition,
  SubscriptionPlan,
  UserData,
  UserSubscription,
} from "./types/user";

export type Screen =
  | "website"
  | "splash"
  | "onboarding"
  | "medical-history"
  | "login"
  | "signup"
  | "admin-notifications"
  | "admin-dashboard"
  | "admin-users"
  | "admin-user-profile"
  | "admin-subscriptions"
  | "admin-invoices"
  | "admin-notifications-list"
  | "admin-analytics"
  | "admin-payment-mock"
  | "admin-alerts"
  | "home"
  | "plan"
  | "progress"
  | "notifications"
  | "membership"
  | "payment"
  | "subscription-success"
  | "profile"
  | "nutrition"
  | "ai-chat"
  | "api-dashboard";

export default function App() {
  const [currentScreen, setCurrentScreen] =
    useState<Screen>("website");
  const [user, setUser] = useState<UserData | null>(null);
  const [selectedPlan, setSelectedPlan] =
    useState<SubscriptionPlan | null>(null);
  const [isExploreMode, setIsExploreMode] = useState(false);
  const [isNewSignup, setIsNewSignup] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize smart notifications when user is available
    if (user && !isExploreMode) {
      smartNotifications.scheduleSmartReminders(user);
    }

    // Listen for notification clicks
    const handleNotificationMessage = (event: MessageEvent) => {
      if (event.data?.type === "NOTIFICATION_CLICK") {
        switch (event.data.action) {
          case "water-tracking":
            setCurrentScreen("progress");
            break;
          case "meal-logging":
            setCurrentScreen("nutrition");
            break;
          case "exercise":
            setCurrentScreen("plan");
            break;
          case "medication":
            setCurrentScreen("profile");
            break;
          default:
            setCurrentScreen("home");
        }
      }
    };

    window.addEventListener(
      "message",
      handleNotificationMessage,
    );

    // Load user data from offline storage if available
    loadUserFromStorage();

    return () => {
      window.removeEventListener(
        "message",
        handleNotificationMessage,
      );
    };
  }, [user, isExploreMode]);

  const loadUserFromStorage = async () => {
    try {
      const storedUserData =
        await offlineStorage.getByType("user_data");
      if (storedUserData.length > 0 && !user) {
        const latestUserData = storedUserData.sort(
          (a, b) => b.timestamp - a.timestamp,
        )[0];
        const cachedUser = latestUserData.data as UserData;
        if (cachedUser?.id) {
          const response = await apiClient.getUserProfile(cachedUser.id);
          if (response.success && response.data?.profile) {
            const mergedProfile = {
              ...cachedUser,
              ...response.data.profile,
            };
            setUser(mergedProfile);
            await saveUserToStorage(mergedProfile);
            return;
          }
        }

        setUser(cachedUser);
      }
    } catch (error) {
      console.error("Failed to load user from storage:", error);
    }
  };

  const saveUserToStorage = async (userData: UserData) => {
    try {
      await offlineStorage.store("user_data", userData);
    } catch (error) {
      console.error("Failed to save user to storage:", error);
    }
  };

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const persistUserProfile = async (userData: UserData) => {
    const response = await apiClient.saveUserProfile(userData);
    const savedProfile = response.success
      ? response.data?.profile ?? userData
      : userData;
    await saveUserToStorage(savedProfile);
    return savedProfile;
  };

  const hydrateUserProfile = async (userData: UserData) => {
    if (!userData.id) {
      return userData;
    }

    const response = await apiClient.getUserProfile(userData.id);
    if (response.success && response.data?.profile) {
      const mergedProfile = {
        ...userData,
        ...response.data.profile,
      };
      await saveUserToStorage(mergedProfile);
      return mergedProfile;
    }

    return userData;
  };

  const handleLogin = async (userData: UserData) => {
    const hydratedUser = await hydrateUserProfile(userData);
    setUser(hydratedUser);
    setIsExploreMode(false);
    setCurrentScreen("home");
    setIsNewSignup(false);

    // Save user data for offline access
    await saveUserToStorage(hydratedUser);

    // Setup smart notifications
    await smartNotifications.scheduleSmartReminders(hydratedUser);
  };

  const handleSignup = async (userData: UserData) => {
    setUser(userData);
    setIsExploreMode(false);
    setIsNewSignup(true);
    setCurrentScreen("onboarding");

    // Save user data for offline access
    await saveUserToStorage(userData);
  };

  const handleExploreMode = () => {
    setIsExploreMode(true);
    setCurrentScreen("home");
  };

  const handleGetStarted = () => {
    setCurrentScreen("login");
  };

  const handlePlanSelection = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCurrentScreen("payment");
  };

  const handlePaymentSuccess = async (paymentResult: PaymentResult) => {
    if (selectedPlan && user) {
      const durationInMonths =
        selectedPlan.duration === "yearly" ? 12 : 1;
      const subscriptionResponse = paymentResult.subscription
        ? null
        : user.id
        ? await apiClient.createSubscription(
            user.id,
            selectedPlan.name,
            selectedPlan.price,
            durationInMonths,
          )
        : null;

      const subscription: UserSubscription = {
        planId: selectedPlan.id,
        planName: paymentResult.subscription?.plan ?? selectedPlan.name,
        price: paymentResult.subscription?.amount ?? selectedPlan.price,
        startDate:
          paymentResult.subscription?.startDate ??
          new Date().toISOString(),
        renewalDate:
          paymentResult.subscription?.endDate ??
          new Date(
            Date.now() +
              durationInMonths * 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        status:
          (paymentResult.subscription?.status as UserSubscription["status"]) ??
          "active",
        paymentMethod:
          paymentResult.subscription?.paymentMethod ??
          paymentResult.method,
        transactionId:
          paymentResult.subscription?.transactionId ??
          paymentResult.transactionId,
        autoRenewal: true,
      };

      const updatedUser = { ...user, subscription };
      const persistedUser = await persistUserProfile(updatedUser);
      setUser(persistedUser);
      await saveUserToStorage(persistedUser);
      setCurrentScreen("subscription-success");

      if (subscriptionResponse && !subscriptionResponse.success) {
        console.warn(
          "Subscription was saved locally in app state only:",
          subscriptionResponse?.error,
        );
      }
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "website":
        return (
          <Homepage
            onGetStarted={handleGetStarted}
            onAdminAccess={() =>
              setCurrentScreen("admin-dashboard")
            }
          />
        );
      case "splash":
        return (
          <SplashScreen
            onComplete={() => setCurrentScreen("onboarding")}
          />
        );
      case "onboarding":
        return (
          <OnboardingScreen
            initialData={user}
            onComplete={async (userData) => {
              const savedUser = await persistUserProfile(userData);
              setUser(savedUser);
              setCurrentScreen("medical-history");
            }}
          />
        );
      case "medical-history":
        return (
          <MedicalHistoryScreen
            user={user}
            onComplete={async (updatedUser) => {
              const savedUser = await persistUserProfile(updatedUser);
              setUser(savedUser);
              setIsNewSignup(false);
              setCurrentScreen("home");

              // Save updated user data and setup notifications
              await saveUserToStorage(savedUser);
              await smartNotifications.scheduleSmartReminders(
                savedUser,
              );
            }}
            onSkip={async () => {
              setIsNewSignup(false);
              setCurrentScreen("home");

              // Save user data and setup notifications
              if (user) {
                const savedUser = await persistUserProfile(user);
                setUser(savedUser);
                await saveUserToStorage(savedUser);
                await smartNotifications.scheduleSmartReminders(
                  savedUser,
                );
              }
            }}
          />
        );
      case "login":
        return (
          <LoginScreen
            onLogin={handleLogin}
            onNavigateToSignup={() =>
              setCurrentScreen("signup")
            }
            onContinueAsGuest={handleExploreMode}
            onNavigateToAdmin={() =>
              setCurrentScreen("admin-dashboard")
            }
          />
        );
      case "signup":
        return (
          <SignupScreen
            onSignup={handleSignup}
            onNavigateToLogin={() => setCurrentScreen("login")}
          />
        );
      case "admin-notifications":
        return (
          <AdminNotificationScreen
            onBack={() => setCurrentScreen("home")}
          />
        );
      case "admin-dashboard":
        return (
          <AdminDashboardScreen
            onNavigate={navigateToScreen}
          />
        );
      case "admin-users":
        return (
          <UserManagementScreen
            onNavigate={navigateToScreen}
            onUserSelect={(userId) => {
              setSelectedUserId(userId);
              setCurrentScreen("admin-user-profile");
            }}
          />
        );
      case "admin-user-profile":
        return (
          <UserProfileDetailScreen
            userId={selectedUserId}
            onBack={() => setCurrentScreen("admin-users")}
            onNavigate={navigateToScreen}
          />
        );
      case "admin-subscriptions":
        return (
          <SubscriptionManagementScreen
            onBack={() => setCurrentScreen("admin-dashboard")}
            onNavigate={navigateToScreen}
          />
        );
      case "admin-invoices":
        return (
          <InvoiceManagementScreen
            onBack={() => setCurrentScreen("admin-dashboard")}
            onNavigate={navigateToScreen}
          />
        );
      case "admin-notifications-list":
        return (
          <AdminNotificationsListScreen
            onBack={() => setCurrentScreen("admin-dashboard")}
          />
        );
      case "admin-analytics":
        return (
          <AdminAnalyticsScreen
            onBack={() => setCurrentScreen("admin-dashboard")}
          />
        );
      case "admin-payment-mock":
        return (
          <PaymentMockScreen
            onBack={() => setCurrentScreen("admin-dashboard")}
            onComplete={() => setCurrentScreen("admin-alerts")}
          />
        );
      case "admin-alerts":
        return (
          <AdminAlertsScreen
            onBack={() => setCurrentScreen("admin-dashboard")}
          />
        );
      case "home":
        return (
          <HomeScreen
            user={user}
            isExploreMode={isExploreMode}
            isNewUser={isNewSignup}
            onNavigate={navigateToScreen}
            onLogin={() => setCurrentScreen("login")}
          />
        );
      case "plan":
        return (
          <DailyPlanScreen
            user={user}
            onNavigate={navigateToScreen}
          />
        );
      case "progress":
        return (
          <ProgressScreen
            user={user}
            onNavigate={navigateToScreen}
          />
        );
      case "notifications":
        return (
          <NotificationsScreen
            onBack={() => setCurrentScreen("home")}
          />
        );
      case "membership":
        return (
          <MembershipScreen
            user={user}
            onBack={() => setCurrentScreen("profile")}
            onPlanSelect={handlePlanSelection}
          />
        );
      case "payment":
        return (
          <PaymentScreen
            plan={selectedPlan}
            user={user}
            onBack={() => setCurrentScreen("membership")}
            onPaymentSuccess={handlePaymentSuccess}
          />
        );
      case "subscription-success":
        return (
          <SubscriptionSuccessScreen
            subscription={user?.subscription}
            onContinue={() => setCurrentScreen("home")}
          />
        );
      case "profile":
        return (
          <ProfileScreen
            user={user}
            onNavigate={navigateToScreen}
          />
        );
      case "nutrition":
        return (
          <NutritionScreen
            user={user}
            onBack={() => setCurrentScreen("home")}
          />
        );
      case "ai-chat":
        return (
          <AIChatScreen
            user={user}
            onBack={() => setCurrentScreen("home")}
          />
        );
      case "api-dashboard":
        return (
          <APIIntegrationDashboard
            user={user}
            onBack={() => setCurrentScreen("admin-dashboard")}
          />
        );
      default:
        return <Homepage onGetStarted={handleGetStarted} onAdminAccess={() => setCurrentScreen("admin-dashboard")} />;
    }
  };

  const isWebsite = currentScreen === "website";

  return (
    <PerformanceOptimizer>
      <div className="min-h-screen bg-white">
        {isWebsite ? (
          <div className="w-full">{renderScreen()}</div>
        ) : (
          <div className="max-w-sm mx-auto min-h-screen bg-white overflow-hidden relative">
            {renderScreen()}
          </div>
        )}
      </div>
    </PerformanceOptimizer>
  );
}
