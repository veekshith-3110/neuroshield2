/**
 * Break Reminder Service
 * Manages break reminders and notifications
 */

const STORAGE_KEY = 'breakReminders';

export const getBreakReminders = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading break reminders:', error);
  }
  
  // Default: Remind every 90 minutes
  return {
    enabled: true,
    interval: 90, // minutes
    lastReminder: null,
    nextReminder: null
  };
};

export const saveBreakReminders = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving break reminders:', error);
    return false;
  }
};

/**
 * Check if it's time for a break reminder
 */
export const shouldShowBreakReminder = (settings) => {
  if (!settings.enabled) return false;
  
  const now = Date.now();
  
  // If no last reminder, set one
  if (!settings.lastReminder) {
    return false; // Don't show immediately
  }
  
  // Check if interval has passed
  const timeSinceLastReminder = (now - settings.lastReminder) / (1000 * 60); // minutes
  
  return timeSinceLastReminder >= settings.interval;
};

/**
 * Set next break reminder
 */
export const setNextBreakReminder = (settings) => {
  const now = Date.now();
  const intervalMs = settings.interval * 60 * 1000; // Convert minutes to milliseconds
  
  return {
    ...settings,
    lastReminder: now,
    nextReminder: now + intervalMs
  };
};

/**
 * Get time until next break
 */
export const getTimeUntilNextBreak = (settings) => {
  if (!settings.enabled || !settings.nextReminder) {
    return null;
  }
  
  const now = Date.now();
  const diffMs = settings.nextReminder - now;
  
  if (diffMs <= 0) {
    return { minutes: 0, seconds: 0 };
  }
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  return { minutes, seconds };
};

/**
 * Show break reminder notification
 */
export const showBreakNotification = (message = 'Time for a break!') => {
  // Request notification permission
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Break Reminder', {
      body: message,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'break-reminder',
      requireInteraction: false
    });
  } else if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification('Break Reminder', {
          body: message,
          icon: '/logo192.png'
        });
      }
    });
  }
  
  // Also show browser alert as fallback
  console.log('🔔 Break Reminder:', message);
};

