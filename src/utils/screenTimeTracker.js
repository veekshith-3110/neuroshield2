/**
 * Screen Time Tracker
 * Tracks active screen time using browser APIs
 */

class ScreenTimeTracker {
  constructor() {
    this.startTime = null;
    this.totalActiveTime = 0; // in milliseconds
    this.lastActiveTime = Date.now();
    this.isActive = true;
    this.isTracking = false;
    this.listeners = [];
    
    // Track visibility changes
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.updateActiveTime = this.updateActiveTime.bind(this);
  }

  /**
   * Start tracking screen time
   */
  startTracking() {
    if (this.isTracking) return;

    this.startTime = Date.now();
    this.lastActiveTime = Date.now();
    this.isTracking = true;
    this.isActive = true;

    // Listen to page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('focus', this.handleFocus);
    window.addEventListener('blur', this.handleBlur);

    // Update active time every minute
    this.updateInterval = setInterval(this.updateActiveTime, 60000); // Every minute

    // Save to localStorage every 5 minutes
    this.saveInterval = setInterval(() => this.saveToStorage(), 300000);

    this.notifyListeners('started');
  }

  /**
   * Stop tracking screen time
   */
  stopTracking() {
    if (!this.isTracking) return;

    this.updateActiveTime(); // Final update
    this.isTracking = false;

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('focus', this.handleFocus);
    window.removeEventListener('blur', this.handleBlur);

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }

    this.saveToStorage();
    this.notifyListeners('stopped');
  }

  /**
   * Handle page visibility changes
   */
  handleVisibilityChange() {
    if (document.hidden) {
      this.updateActiveTime();
      this.isActive = false;
    } else {
      this.lastActiveTime = Date.now();
      this.isActive = true;
    }
    this.notifyListeners('visibilityChanged', { isActive: this.isActive });
  }

  /**
   * Handle window focus
   */
  handleFocus() {
    this.lastActiveTime = Date.now();
    this.isActive = true;
    this.notifyListeners('focused');
  }

  /**
   * Handle window blur
   */
  handleBlur() {
    this.updateActiveTime();
    this.isActive = false;
    this.notifyListeners('blurred');
  }

  /**
   * Update active time based on current state
   */
  updateActiveTime() {
    if (this.isActive && this.isTracking) {
      const now = Date.now();
      const timeDiff = now - this.lastActiveTime;
      this.totalActiveTime += timeDiff;
      this.lastActiveTime = now;
      this.notifyListeners('timeUpdated', { totalTime: this.getTotalTime() });
    }
  }

  /**
   * Get total active screen time in hours
   */
  getTotalTime() {
    let currentTime = this.totalActiveTime;
    
    if (this.isActive && this.isTracking) {
      const now = Date.now();
      currentTime += (now - this.lastActiveTime);
    }

    return currentTime / (1000 * 60 * 60); // Convert to hours
  }

  /**
   * Get total active screen time in hours for today
   */
  getTodayTime() {
    const today = new Date().toISOString().split('T')[0];
    const stored = this.getStoredData();
    return stored[today] || this.getDefaultScreenTime();
  }

  /**
   * Get default screen time (can be configured)
   */
  getDefaultScreenTime() {
    // Check if default is set in localStorage
    const defaultTime = localStorage.getItem('defaultScreenTime');
    if (defaultTime) {
      return parseFloat(defaultTime);
    }
    // Default to 0 if not set
    return 0;
  }

  /**
   * Set default screen time
   */
  setDefaultScreenTime(hours) {
    localStorage.setItem('defaultScreenTime', hours.toString());
  }

  /**
   * Reset today's tracking
   */
  resetToday() {
    const today = new Date().toISOString().split('T')[0];
    const stored = this.getStoredData();
    stored[today] = 0;
    localStorage.setItem('screenTimeData', JSON.stringify(stored));
    this.totalActiveTime = 0;
    this.lastActiveTime = Date.now();
  }

  /**
   * Get stored screen time data
   */
  getStoredData() {
    try {
      const data = localStorage.getItem('screenTimeData');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading screen time data:', error);
      return {};
    }
  }

  /**
   * Save current screen time to storage
   */
  saveToStorage() {
    const today = new Date().toISOString().split('T')[0];
    const stored = this.getStoredData();
    
    // Update today's time
    stored[today] = this.getTotalTime();
    
    localStorage.setItem('screenTimeData', JSON.stringify(stored));
  }

  /**
   * Load today's screen time from storage
   */
  loadTodayTime() {
    const today = new Date().toISOString().split('T')[0];
    const stored = this.getStoredData();
    const todayTime = stored[today] || 0;
    
    // Convert hours to milliseconds
    this.totalActiveTime = todayTime * 1000 * 60 * 60;
    this.lastActiveTime = Date.now();
    
    return todayTime;
  }

  /**
   * Add event listener
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove event listener
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event, data = {}) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in screen time listener:', error);
      }
    });
  }

  /**
   * Get screen time history
   */
  getHistory(days = 7) {
    const stored = this.getStoredData();
    const history = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      history.unshift({
        date: dateStr,
        hours: stored[dateStr] || 0
      });
    }

    return history;
  }
}

// Create singleton instance
const screenTimeTracker = new ScreenTimeTracker();

export default screenTimeTracker;

