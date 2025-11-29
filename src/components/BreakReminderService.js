import { useEffect } from 'react';
import { 
  getBreakReminders, 
  shouldShowBreakReminder, 
  setNextBreakReminder,
  saveBreakReminders,
  showBreakNotification
} from '../utils/breakReminderService';

/**
 * Background service component that runs break reminders
 * This should be included in a component that's always mounted (like ProtectedRoute)
 */
const BreakReminderService = () => {
  useEffect(() => {
    const checkReminders = () => {
      const settings = getBreakReminders();
      
      if (settings.enabled && shouldShowBreakReminder(settings)) {
        showBreakNotification('Time for a break! Take a few minutes to rest and recharge.');
        
        // Set next reminder
        const updated = setNextBreakReminder(settings);
        saveBreakReminders(updated);
      }
    };

    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    
    // Check immediately on mount
    checkReminders();

    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything
};

export default BreakReminderService;

