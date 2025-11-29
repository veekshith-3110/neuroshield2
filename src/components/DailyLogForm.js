import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { calculateRisk } from '../utils/riskCalculator';
import { sendAlertEmail } from '../utils/emailService';
import screenTimeTracker from '../utils/screenTimeTracker';
import { getHealthSummary } from '../utils/healthDataService';

const DailyLogForm = () => {
  const { addDailyLog, getTodayLog } = useApp();
  const { user } = useAuth();
  const todayLog = getTodayLog();
  
  // Health data from Android
  const [healthData, setHealthData] = useState({
    steps: null,
    heartRate: null,
    loading: true,
    error: null,
    lastUpdated: null
  });
  
  const [formData, setFormData] = useState({
    sleep: todayLog?.sleep || '',
    screenTime: todayLog?.screenTime || '',
    mood: todayLog?.mood || ''
  });

  // Fetch health data from Android
  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setHealthData(prev => ({ ...prev, loading: true, error: null }));
        // Use "log" as userId (or get from user context if available)
        const userId = user?.email || user?.phone || 'log';
        const summary = await getHealthSummary(userId);
        
        setHealthData({
          steps: summary.todaySteps || summary.latestSteps || 0,
          heartRate: summary.todayLatestHeartRate || summary.latestHeartRate,
          loading: false,
          error: null,
          lastUpdated: new Date(summary.latestTimestamp || Date.now())
        });
      } catch (error) {
        console.warn('Could not fetch health data:', error);
        setHealthData(prev => ({
          ...prev,
          loading: false,
          error: 'Health data not available. Make sure your Android app is syncing.'
        }));
      }
    };

    fetchHealthData();
    
    // Refresh health data every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Update screen time from tracker when component mounts
  useEffect(() => {
    const updateScreenTime = () => {
      const trackedTime = screenTimeTracker.getTodayTime();
      if (trackedTime > 0 && !todayLog?.screenTime) {
        setFormData(prev => ({
          ...prev,
          screenTime: parseFloat(trackedTime.toFixed(2))
        }));
      }
    };

    // Load today's time from tracker
    screenTimeTracker.loadTodayTime();
    updateScreenTime();
    
    // Update every minute
    const interval = setInterval(updateScreenTime, 60000);

    return () => clearInterval(interval);
  }, [todayLog]);

  const [preferences, setPreferences] = useState({
    dailyReminder: localStorage.getItem('dailyReminder') === 'true' || false,
    shareAnonymousData: localStorage.getItem('shareAnonymousData') === 'true' || false,
    enableNotifications: localStorage.getItem('enableNotifications') === 'true' || false
  });

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (todayLog) {
      setSubmitted(true);
    }
  }, [todayLog]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sleep' || name === 'screenTime' ? parseFloat(value) || '' : value
    }));
  };

  const handlePreferenceChange = (key) => {
    setPreferences(prev => {
      const newValue = !prev[key];
      localStorage.setItem(key, newValue.toString());
      return {
        ...prev,
        [key]: newValue
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.sleep || !formData.screenTime || !formData.mood) {
      alert('Please fill in all fields');
      return;
    }

    const { sleep, screenTime, mood } = formData;
    const riskScore = calculateRisk({ screenTime, sleep, mood }).riskScore;

    // Save to localStorage (include health data from Android)
    const today = new Date().toISOString().split('T')[0];
    const log = {
      date: today,
      sleep,
      screenTime,
      mood,
      riskScore,
      status: riskScore >= 7 ? 'High' : riskScore >= 4 ? 'Moderate' : 'Low',
      tasksCompleted: todayLog?.tasksCompleted || [],
      // Include health data from Android
      steps: healthData.steps,
      heartRate: healthData.heartRate,
      healthDataTimestamp: healthData.lastUpdated
    };
    addDailyLog(log);
    setSubmitted(true);

    // If risk is high, trigger email
    if (riskScore > 7 && user?.email) {
      try {
        await sendAlertEmail({
          email: user.email,
          screenTime,
          sleep,
          mood,
          riskScore,
        });
        console.log('Burnout alert email sent successfully');
      } catch (error) {
        console.warn('Failed to send burnout alert email:', error);
      }
    }
    
    // Show success message
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  const moodOptions = [
    'Great',
    'Good',
    'Okay',
    'Tired',
    'Stressed',
    'Moderate-High Stress',
    'Highly Stressed',
    'Severe Stress',
    'Critical Distress / Crying',
    'Anxious',
    'Overwhelmed'
  ];

  // Format steps with commas
  const formatSteps = (steps) => {
    if (!steps && steps !== 0) return '--';
    return steps.toLocaleString();
  };

  // Format heart rate
  const formatHeartRate = (hr) => {
    if (!hr) return '--';
    return `${hr} bpm`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        📝 Daily Check-In
      </h2>
      
      {/* Health Data from Android - Phone-like Display */}
      <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          📱 Health Data from Your Phone
          {healthData.loading && (
            <span className="text-sm text-gray-500">(Loading...)</span>
          )}
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Steps Card - Phone-like */}
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Steps</span>
              <span className="text-xs text-gray-400">
                {healthData.lastUpdated ? new Date(healthData.lastUpdated).toLocaleTimeString() : '--'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600">
                {formatSteps(healthData.steps)}
              </span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((healthData.steps || 0) / 10000) * 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Goal: 10,000 steps
              </p>
            </div>
          </div>

          {/* Heart Rate Card - Phone-like */}
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Heart Rate</span>
              <span className="text-xs text-gray-400">
                {healthData.lastUpdated ? new Date(healthData.lastUpdated).toLocaleTimeString() : '--'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-red-600">
                {formatHeartRate(healthData.heartRate)}
              </span>
            </div>
            {healthData.heartRate && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  {healthData.heartRate < 60 ? 'Resting' : 
                   healthData.heartRate < 100 ? 'Normal' : 
                   healthData.heartRate < 140 ? 'Active' : 'High'}
                </p>
              </div>
            )}
          </div>
        </div>

        {healthData.error && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">{healthData.error}</p>
          </div>
        )}

        {!healthData.loading && !healthData.error && (!healthData.steps && healthData.steps !== 0) && !healthData.heartRate && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 No health data yet. Make sure your Android app is syncing data.
            </p>
          </div>
        )}
      </div>
      
      {submitted && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          ✓ Check-in saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="sleep" className="block text-sm font-medium text-gray-700 mb-2">
            💤 Sleep Hours (last night)
          </label>
          <input
            type="number"
            id="sleep"
            name="sleep"
            min="0"
            max="24"
            step="0.5"
            value={formData.sleep}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 7.5"
            required
          />
        </div>

        <div>
          <label htmlFor="screenTime" className="block text-sm font-medium text-gray-700 mb-2">
            📱 Screen Time (hours today)
          </label>
          <input
            type="number"
            id="screenTime"
            name="screenTime"
            min="0"
            max="24"
            step="0.5"
            value={formData.screenTime}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 6"
            required
          />
        </div>

        <div>
          <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-2">
            😊 How are you feeling?
          </label>
          <select
            id="mood"
            name="mood"
            value={formData.mood}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select your mood</option>
            {moodOptions.map(mood => (
              <option key={mood} value={mood}>{mood}</option>
            ))}
          </select>
        </div>

        <div className="pt-2 pb-2 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">Preferences</p>
          <div className="space-y-2">
            <label className="notebook-checkbox small cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.dailyReminder}
                onChange={() => handlePreferenceChange('dailyReminder')}
              />
              <span className="checkmark"></span>
              <span className="text">
                <span className="text-content">Enable daily check-in reminders</span>
                <svg preserveAspectRatio="none" viewBox="0 0 400 20" className="cut-line">
                  <path d="M0,10 H400"></path>
                </svg>
              </span>
            </label>
            
            <label className="notebook-checkbox small cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.enableNotifications}
                onChange={() => handlePreferenceChange('enableNotifications')}
              />
              <span className="checkmark"></span>
              <span className="text">
                <span className="text-content">Enable wellness notifications</span>
                <svg preserveAspectRatio="none" viewBox="0 0 400 20" className="cut-line">
                  <path d="M0,10 H400"></path>
                </svg>
              </span>
            </label>
            
            <label className="notebook-checkbox small cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.shareAnonymousData}
                onChange={() => handlePreferenceChange('shareAnonymousData')}
              />
              <span className="checkmark"></span>
              <span className="text">
                <span className="text-content">Share anonymous data for research</span>
                <svg preserveAspectRatio="none" viewBox="0 0 400 20" className="cut-line">
                  <path d="M0,10 H400"></path>
                </svg>
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {todayLog ? 'Update Check-In' : 'Save Check-In'}
        </button>
      </form>
    </div>
  );
};

export default DailyLogForm;

