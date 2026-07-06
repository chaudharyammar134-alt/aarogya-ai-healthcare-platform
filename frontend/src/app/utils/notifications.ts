// Smart notification system for health reminders

import type { UserData } from '../App';
import { serviceWorkerManager } from './sw-manager';

interface NotificationConfig {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  timestamp?: number;
  requireInteraction?: boolean;
}

interface ScheduledNotification extends NotificationConfig {
  scheduledTime: number;
  recurring?: {
    type: 'daily' | 'weekly' | 'custom';
    interval?: number; // in milliseconds
    days?: number[]; // 0-6 for Sunday-Saturday
  };
  conditions?: {
    onlineOnly?: boolean;
    location?: 'home' | 'work' | 'any';
    activityLevel?: 'low' | 'medium' | 'high';
  };
}

class SmartNotificationService {
  private permission: NotificationPermission = 'default';
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private timers: Map<string, number> = new Map();
  private worker: ServiceWorker | null = null;

  async init(): Promise<void> {
    // Request notification permission
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
    }

    // Service worker will be handled by the service worker manager
    // This ensures compatibility across different environments
  }

  async scheduleSmartReminders(user: UserData): Promise<void> {
    if (!user) return;

    const now = new Date();
    const preferences = user.notificationPreferences;

    // Water reminders - every 2 hours during awake time
    if (preferences?.waterReminders) {
      this.scheduleWaterReminders(user);
    }

    // Meal reminders - based on user schedule
    if (preferences?.mealReminders) {
      this.scheduleMealReminders(user);
    }

    // Exercise reminders - personalized timing
    if (preferences?.exerciseReminders) {
      this.scheduleExerciseReminders(user);
    }

    // Medication reminders - critical timing
    if (preferences?.medicationReminders && user.currentMedications?.length) {
      this.scheduleMedicationReminders(user);
    }

    // Sleep reminders
    this.scheduleSleepReminders(user);

    // Wellness check-ins
    this.scheduleWellnessCheckIns(user);
  }

  private scheduleWaterReminders(user: UserData): void {
    const wakeTime = this.parseTime(user.wakeUpTime);
    const sleepTime = this.parseTime(user.sleepTime);
    
    // Schedule every 2 hours from wake up to 2 hours before sleep
    let currentTime = new Date(wakeTime);
    const endTime = new Date(sleepTime);
    endTime.setHours(endTime.getHours() - 2); // 2 hours before sleep
    
    while (currentTime < endTime) {
      const notificationId = `water_${currentTime.getHours()}${currentTime.getMinutes()}`;
      
      const notification: ScheduledNotification = {
        id: notificationId,
        title: '💧 Hydration Reminder',
        body: this.getPersonalizedWaterMessage(user),
        icon: '/icons/water.png',
        tag: 'water-reminder',
        scheduledTime: currentTime.getTime(),
        recurring: { type: 'daily' },
        actions: [
          { action: 'mark-drunk', title: 'Just drank water!' },
          { action: 'snooze', title: 'Remind me in 30 min' }
        ]
      };
      
      this.scheduleNotification(notification);
      currentTime.setHours(currentTime.getHours() + 2);
    }
  }

  private scheduleMealReminders(user: UserData): void {
    const mealTimes = this.calculateOptimalMealTimes(user);
    
    mealTimes.forEach((mealTime, index) => {
      const mealNames = ['breakfast', 'lunch', 'snack', 'dinner'];
      const mealEmojis = ['🌅', '☀️', '🍎', '🌙'];
      
      const notification: ScheduledNotification = {
        id: `meal_${mealNames[index]}`,
        title: `${mealEmojis[index]} ${mealNames[index].charAt(0).toUpperCase() + mealNames[index].slice(1)} Time!`,
        body: this.getPersonalizedMealMessage(user, mealNames[index]),
        icon: '/icons/meal.png',
        tag: 'meal-reminder',
        scheduledTime: mealTime.getTime(),
        recurring: { type: 'daily' },
        actions: [
          { action: 'log-meal', title: 'Log what I ate' },
          { action: 'get-suggestions', title: 'Get meal ideas' }
        ]
      };
      
      this.scheduleNotification(notification);
    });
  }

  private scheduleExerciseReminders(user: UserData): void {
    const exerciseTime = this.calculateOptimalExerciseTime(user);
    
    const exercises = this.getPersonalizedExercises(user);
    
    const notification: ScheduledNotification = {
      id: 'exercise_daily',
      title: '💪 Time to Move!',
      body: `Let's do ${exercises.duration} minutes of ${exercises.type}`,
      icon: '/icons/exercise.png',
      tag: 'exercise-reminder',
      scheduledTime: exerciseTime.getTime(),
      recurring: { type: 'daily' },
      conditions: {
        activityLevel: 'low' // Only send if user hasn't been active
      },
      actions: [
        { action: 'start-workout', title: 'Start Workout' },
        { action: 'quick-walk', title: '5-min walk' }
      ]
    };
    
    this.scheduleNotification(notification);
  }

  private scheduleMedicationReminders(user: UserData): void {
    if (!user.currentMedications?.length) return;
    
    user.currentMedications.forEach((medication) => {
      // Parse medication schedule (assume format like "2 times daily")
      const times = this.parseMedicationSchedule(medication);
      
      times.forEach((time, index) => {
        const notification: ScheduledNotification = {
          id: `medication_${medication.replace(/\s+/g, '_')}_${index}`,
          title: '💊 Medicine Reminder',
          body: `Time to take ${medication}`,
          icon: '/icons/medicine.png',
          tag: 'medication-reminder',
          scheduledTime: time.getTime(),
          recurring: { type: 'daily' },
          requireInteraction: true,
          actions: [
            { action: 'taken', title: 'Taken ✓' },
            { action: 'snooze', title: 'Remind in 15 min' },
            { action: 'skip', title: 'Skip today' }
          ]
        };
        
        this.scheduleNotification(notification);
      });
    });
  }

  private scheduleSleepReminders(user: UserData): void {
    const sleepTime = this.parseTime(user.sleepTime);
    const reminderTime = new Date(sleepTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - 30); // 30 min before sleep
    
    const notification: ScheduledNotification = {
      id: 'sleep_reminder',
      title: '🌙 Wind Down Time',
      body: 'Start preparing for a restful sleep',
      icon: '/icons/sleep.png',
      tag: 'sleep-reminder',
      scheduledTime: reminderTime.getTime(),
      recurring: { type: 'daily' },
      actions: [
        { action: 'sleep-mode', title: 'Activate Sleep Mode' },
        { action: 'bedtime-routine', title: 'Start Routine' }
      ]
    };
    
    this.scheduleNotification(notification);
  }

  private scheduleWellnessCheckIns(user: UserData): void {
    // Morning check-in
    const morningTime = this.parseTime(user.wakeUpTime);
    morningTime.setHours(morningTime.getHours() + 1);
    
    const morningNotification: ScheduledNotification = {
      id: 'wellness_checkin_morning',
      title: '🌅 Good Morning!',
      body: 'How are you feeling today?',
      icon: '/icons/wellness.png',
      tag: 'wellness-checkin',
      scheduledTime: morningTime.getTime(),
      recurring: { type: 'daily' },
      actions: [
        { action: 'feeling-great', title: 'Great! 😊' },
        { action: 'feeling-okay', title: 'Okay 😐' },
        { action: 'need-help', title: 'Need help 😟' }
      ]
    };
    
    this.scheduleNotification(morningNotification);

    // Evening reflection
    const eveningTime = this.parseTime(user.sleepTime);
    eveningTime.setHours(eveningTime.getHours() - 1);
    
    const eveningNotification: ScheduledNotification = {
      id: 'wellness_checkin_evening',
      title: '🌆 Daily Reflection',
      body: 'How did your day go?',
      icon: '/icons/reflection.png',
      tag: 'wellness-checkin',
      scheduledTime: eveningTime.getTime(),
      recurring: { type: 'daily' },
      actions: [
        { action: 'great-day', title: 'Great day!' },
        { action: 'okay-day', title: 'Okay day' },
        { action: 'tough-day', title: 'Tough day' }
      ]
    };
    
    this.scheduleNotification(eveningNotification);
  }

  private scheduleNotification(notification: ScheduledNotification): void {
    this.scheduledNotifications.set(notification.id, notification);
    
    const now = Date.now();
    let nextTrigger = notification.scheduledTime;
    
    // If the time has passed today, schedule for tomorrow
    if (nextTrigger <= now) {
      nextTrigger += 24 * 60 * 60 * 1000; // Add 24 hours
    }
    
    const timeout = setTimeout(() => {
      this.showNotification(notification);
      
      // Reschedule if recurring
      if (notification.recurring) {
        this.rescheduleRecurring(notification);
      }
    }, nextTrigger - now);
    
    this.timers.set(notification.id, timeout);
  }

  private async showNotification(notification: ScheduledNotification): Promise<void> {
    if (this.permission !== 'granted') return;
    
    // Check conditions
    if (notification.conditions) {
      if (notification.conditions.onlineOnly && !navigator.onLine) return;
      // Add more condition checks as needed
    }
    
    try {
      // Use service worker manager for better compatibility
      await serviceWorkerManager.showNotification(notification.title, {
        body: notification.body,
        icon: notification.icon,
        badge: notification.badge,
        tag: notification.tag,
        data: notification.data,
        actions: notification.actions,
        requireInteraction: notification.requireInteraction
      });
      
    } catch (error) {
      console.error('Failed to show notification:', error);
      
      // Fallback to basic browser notification
      try {
        const n = new Notification(notification.title, {
          body: notification.body,
          icon: notification.icon,
          tag: notification.tag,
          data: notification.data
        });
        
        // Handle notification clicks
        n.onclick = () => {
          this.handleNotificationClick(notification);
          n.close();
        };
        
        // Auto-close after 10 seconds if not requiring interaction
        if (!notification.requireInteraction) {
          setTimeout(() => n.close(), 10000);
        }
      } catch (fallbackError) {
        console.error('Fallback notification also failed:', fallbackError);
      }
    }
  }

  private handleNotificationClick(notification: ScheduledNotification): void {
    // Focus the app window
    if (window.focus) window.focus();
    
    // Handle specific notification types
    switch (notification.tag) {
      case 'water-reminder':
        // Navigate to water tracking
        window.postMessage({ type: 'NOTIFICATION_CLICK', action: 'water-tracking' }, '*');
        break;
      case 'meal-reminder':
        // Navigate to meal logging
        window.postMessage({ type: 'NOTIFICATION_CLICK', action: 'meal-logging' }, '*');
        break;
      case 'exercise-reminder':
        // Navigate to exercise
        window.postMessage({ type: 'NOTIFICATION_CLICK', action: 'exercise' }, '*');
        break;
      case 'medication-reminder':
        // Navigate to medication tracking
        window.postMessage({ type: 'NOTIFICATION_CLICK', action: 'medication' }, '*');
        break;
      default:
        // Navigate to home
        window.postMessage({ type: 'NOTIFICATION_CLICK', action: 'home' }, '*');
    }
  }

  private rescheduleRecurring(notification: ScheduledNotification): void {
    if (!notification.recurring) return;
    
    let nextTime: number;
    
    switch (notification.recurring.type) {
      case 'daily':
        nextTime = notification.scheduledTime + 24 * 60 * 60 * 1000;
        break;
      case 'weekly':
        nextTime = notification.scheduledTime + 7 * 24 * 60 * 60 * 1000;
        break;
      case 'custom':
        nextTime = notification.scheduledTime + (notification.recurring.interval || 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }
    
    const updatedNotification = { ...notification, scheduledTime: nextTime };
    this.scheduleNotification(updatedNotification);
  }

  // Helper methods
  private parseTime(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  private calculateOptimalMealTimes(user: UserData): Date[] {
    const wakeTime = this.parseTime(user.wakeUpTime);
    const sleepTime = this.parseTime(user.sleepTime);
    
    // Calculate meal times based on wake/sleep schedule
    const breakfast = new Date(wakeTime);
    breakfast.setHours(breakfast.getHours() + 1);
    
    const lunch = new Date(wakeTime);
    lunch.setHours(lunch.getHours() + 6);
    
    const snack = new Date(wakeTime);
    snack.setHours(snack.getHours() + 9);
    
    const dinner = new Date(sleepTime);
    dinner.setHours(dinner.getHours() - 3);
    
    return [breakfast, lunch, snack, dinner];
  }

  private calculateOptimalExerciseTime(user: UserData): Date {
    const wakeTime = this.parseTime(user.wakeUpTime);
    
    // Morning exercise for most people, adjusted based on occupation
    if (user.occupation === 'night-shift') {
      wakeTime.setHours(wakeTime.getHours() + 2);
    } else {
      wakeTime.setHours(wakeTime.getHours() + 1);
    }
    
    return wakeTime;
  }

  private getPersonalizedWaterMessage(user: UserData): string {
    const messages = [
      `Stay hydrated, ${user.name}! Your body needs water to function optimally.`,
      'Time for some H2O! Keep your energy levels up.',
      'Water break! Your skin and organs will thank you.',
      'Hydration check! Drink up for better focus and mood.'
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getPersonalizedMealMessage(user: UserData, mealType: string): string {
    const healthyOptions = {
      breakfast: ['oats with fruits', 'whole wheat paratha', 'upma with vegetables'],
      lunch: ['dal rice with vegetables', 'roti with sabzi', 'quinoa bowl'],
      snack: ['nuts and fruits', 'green tea with biscuit', 'yogurt'],
      dinner: ['light dal rice', 'vegetable soup', 'grilled vegetables']
    };
    
    const options = healthyOptions[mealType as keyof typeof healthyOptions] || ['healthy meal'];
    const randomOption = options[Math.floor(Math.random() * options.length)];
    
    return `Time for ${mealType}! How about ${randomOption}?`;
  }

  private getPersonalizedExercises(user: UserData): { type: string; duration: number } {
    const exercises = {
      sedentary: { type: 'walking or stretching', duration: 15 },
      'lightly-active': { type: 'yoga or light cardio', duration: 20 },
      'moderately-active': { type: 'strength training', duration: 30 },
      'very-active': { type: 'intense workout', duration: 45 }
    };
    
    return exercises[user.activityLevel] || exercises.sedentary;
  }

  private parseMedicationSchedule(medication: string): Date[] {
    // Simple parser for common medication schedules
    // In real app, this would be more sophisticated
    const times: Date[] = [];
    
    if (medication.includes('morning')) {
      const morning = new Date();
      morning.setHours(8, 0, 0, 0);
      times.push(morning);
    }
    
    if (medication.includes('evening') || medication.includes('night')) {
      const evening = new Date();
      evening.setHours(20, 0, 0, 0);
      times.push(evening);
    }
    
    if (medication.includes('twice') || medication.includes('2 times')) {
      const morning = new Date();
      morning.setHours(8, 0, 0, 0);
      const evening = new Date();
      evening.setHours(20, 0, 0, 0);
      times.push(morning, evening);
    }
    
    return times.length > 0 ? times : [new Date()];
  }

  clearAllNotifications(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.scheduledNotifications.clear();
  }

  // WhatsApp integration (requires backend)
  async sendWhatsAppReminder(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // This would integrate with WhatsApp Business API
      // For now, we'll simulate the call
      console.log(`WhatsApp reminder to ${phoneNumber}: ${message}`);
      return true;
    } catch (error) {
      console.error('WhatsApp reminder failed:', error);
      return false;
    }
  }
}

export const smartNotifications = new SmartNotificationService();

// Auto-initialize
smartNotifications.init().catch(console.error);