const STORAGE_KEY = 'burnoutAppData';

export const StorageManager = {
  // Get all data from localStorage
  getData: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {
        dailyLogs: [],
        streaks: 0,
        badges: [],
        lastCheckIn: null
      };
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return {
        dailyLogs: [],
        streaks: 0,
        badges: [],
        lastCheckIn: null
      };
    }
  },

  // Save data to localStorage
  saveData: (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  // Add a new daily log
  addDailyLog: (log) => {
    const data = StorageManager.getData();
    const today = new Date().toISOString().split('T')[0];
    
    // Check if log for today already exists
    const existingIndex = data.dailyLogs.findIndex(
      entry => entry.date === today
    );
    
    if (existingIndex >= 0) {
      data.dailyLogs[existingIndex] = log;
    } else {
      data.dailyLogs.push(log);
    }
    
    // Update streaks
    StorageManager.updateStreaks(data);
    
    // Update badges
    StorageManager.updateBadges(data);
    
    data.lastCheckIn = today;
    StorageManager.saveData(data);
    return data;
  },

  // Update streaks based on consecutive low-risk days
  updateStreaks: (data) => {
    const sortedLogs = [...data.dailyLogs].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const log = sortedLogs[i];
      const logDate = new Date(log.date);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (logDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        if (log.riskScore <= 3) {
          streak++;
        } else {
          break;
        }
      } else {
        break;
      }
    }
    
    data.streaks = streak;
  },

  // Update badges based on achievements
  updateBadges: (data) => {
    const badges = new Set(data.badges || []);
    
    // Digital Detox Champ - 3 consecutive low-risk days
    if (data.streaks >= 3 && !badges.has('Digital Detox Champ')) {
      badges.add('Digital Detox Champ');
    }
    
    // Wellness Warrior - 7 consecutive low-risk days
    if (data.streaks >= 7 && !badges.has('Wellness Warrior')) {
      badges.add('Wellness Warrior');
    }
    
    // Check for completed tasks badge
    const today = new Date().toISOString().split('T')[0];
    const todayLog = data.dailyLogs.find(log => log.date === today);
    if (todayLog && todayLog.tasksCompleted && todayLog.tasksCompleted.length >= 3) {
      if (!badges.has('Task Master')) {
        badges.add('Task Master');
      }
    }
    
    data.badges = Array.from(badges);
  },

  // Get logs for the past N days
  getRecentLogs: (days = 7) => {
    const data = StorageManager.getData();
    const sortedLogs = [...data.dailyLogs].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return sortedLogs.filter(log => new Date(log.date) >= cutoffDate);
  },

  // Backup data (export as JSON string)
  backup: () => {
    return JSON.stringify(StorageManager.getData());
  },

  // Restore data from backup
  restore: (backupString) => {
    try {
      const data = JSON.parse(backupString);
      StorageManager.saveData(data);
      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }
};

