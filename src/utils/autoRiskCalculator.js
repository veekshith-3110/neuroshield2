/**
 * Automatic Risk Calculator
 * Calculates risk based on screen time and sends alerts
 */

import { calculateRisk } from './riskCalculator';
import { sendAlertEmail } from './emailService';
import screenTimeTracker from './screenTimeTracker';

class AutoRiskCalculator {
  constructor() {
    this.checkInterval = null;
    this.alertCount = 0;
    this.maxAlerts = 6;
    this.alertInterval = null; // 10 minutes interval after 6 alerts
    this.lastAlertTime = null;
    this.userEmail = null;
    this.isLocked = false;
  }

  /**
   * Start automatic risk monitoring
   */
  startMonitoring(userEmail) {
    this.userEmail = userEmail;
    this.alertCount = 0;
    
    // Check risk every 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkAndCalculateRisk();
    }, 300000); // 5 minutes

    // Initial check
    this.checkAndCalculateRisk();
  }

  /**
   * Stop automatic risk monitoring
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (this.alertInterval) {
      clearInterval(this.alertInterval);
      this.alertInterval = null;
    }
  }

  /**
   * Check and calculate risk
   */
  async checkAndCalculateRisk() {
    const screenTime = screenTimeTracker.getTotalTime();
    const today = new Date().toISOString().split('T')[0];
    
    // Get sleep from today's log if available
    const storedLogs = JSON.parse(localStorage.getItem('burnoutAppData') || '{}');
    const todayLog = storedLogs.dailyLogs?.find(log => log.date === today);
    const sleep = todayLog?.sleep || 7; // Default to 7 hours if not logged
    const mood = todayLog?.mood || 'Good'; // Default mood

    // Calculate risk
    const riskData = calculateRisk({ 
      sleep, 
      screenTime, 
      mood 
    });

    const riskScore = riskData.riskScore;

    // If risk > 8, lock screen and send alert
    if (riskScore > 8) {
      await this.handleHighRisk(riskScore, screenTime, sleep, mood);
    } else if (riskScore > 7) {
      // Send email alert for risk > 7
      await this.sendEmailAlert(riskScore, screenTime, sleep, mood);
    }

    // Notify listeners
    this.notifyRiskUpdate(riskScore, screenTime);
  }

  /**
   * Handle high risk (risk > 8)
   */
  async handleHighRisk(riskScore, screenTime, sleep, mood) {
    if (!this.isLocked) {
      this.isLocked = true;
      this.triggerScreenLock();
    }

    // Send alert notification
    this.sendAlertNotification(riskScore);

    // Send email alert
    await this.sendEmailAlert(riskScore, screenTime, sleep, mood);

    // Increment alert count
    this.alertCount++;

    // After 6 alerts, start sending alerts every 10 minutes
    if (this.alertCount >= this.maxAlerts && !this.alertInterval) {
      this.startPeriodicAlerts();
    }
  }

  /**
   * Send email alert
   */
  async sendEmailAlert(riskScore, screenTime, sleep, mood) {
    if (!this.userEmail) return;

    try {
      await sendAlertEmail({
        email: this.userEmail,
        screenTime: screenTime.toFixed(2),
        sleep,
        mood,
        riskScore,
      });
      console.log('Risk alert email sent');
    } catch (error) {
      console.error('Failed to send risk alert email:', error);
    }
  }

  /**
   * Send alert notification
   */
  sendAlertNotification(riskScore) {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⚠️ High Risk Alert', {
        body: `Your burnout risk score is ${riskScore}. Please take a break!`,
        icon: '/favicon.ico',
        tag: 'risk-alert',
      });
    }

    // Request notification permission if not granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  /**
   * Trigger screen lock
   */
  triggerScreenLock() {
    // Dispatch custom event for screen lock
    window.dispatchEvent(new CustomEvent('screenLock', { 
      detail: { locked: true, reason: 'high_risk' } 
    }));
  }

  /**
   * Start periodic alerts (every 10 minutes after 6 alerts)
   */
  startPeriodicAlerts() {
    this.alertInterval = setInterval(() => {
      const screenTime = screenTimeTracker.getTotalTime();
      const today = new Date().toISOString().split('T')[0];
      const storedLogs = JSON.parse(localStorage.getItem('burnoutAppData') || '{}');
      const todayLog = storedLogs.dailyLogs?.find(log => log.date === today);
      const sleep = todayLog?.sleep || 7;
      const mood = todayLog?.mood || 'Good';

      const riskData = calculateRisk({ sleep, screenTime, mood });
      
      if (riskData.riskScore > 8) {
        this.sendAlertNotification(riskData.riskScore);
        this.sendEmailAlert(riskData.riskScore, screenTime, sleep, mood);
        
        // Show switch off reminder
        this.showSwitchOffReminder();
      }
    }, 600000); // 10 minutes
  }

  /**
   * Show switch off reminder
   */
  showSwitchOffReminder() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🔴 Time to Switch Off', {
        body: 'You have been using your device for too long. Please take a break and switch off for a while.',
        icon: '/favicon.ico',
        tag: 'switch-off-reminder',
      });
    }

    // Dispatch event for UI reminder
    window.dispatchEvent(new CustomEvent('switchOffReminder'));
  }

  /**
   * Unlock screen
   */
  unlockScreen() {
    this.isLocked = false;
    window.dispatchEvent(new CustomEvent('screenLock', { 
      detail: { locked: false } 
    }));
  }

  /**
   * Notify risk update
   */
  notifyRiskUpdate(riskScore, screenTime) {
    window.dispatchEvent(new CustomEvent('riskUpdate', {
      detail: { riskScore, screenTime }
    }));
  }

  /**
   * Get current alert count
   */
  getAlertCount() {
    return this.alertCount;
  }

  /**
   * Reset alert count
   */
  resetAlertCount() {
    this.alertCount = 0;
    if (this.alertInterval) {
      clearInterval(this.alertInterval);
      this.alertInterval = null;
    }
  }
}

// Create singleton instance
const autoRiskCalculator = new AutoRiskCalculator();

export default autoRiskCalculator;

