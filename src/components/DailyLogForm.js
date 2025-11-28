import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { calculateRisk } from '../utils/riskCalculator';
import { sendAlertEmail } from '../utils/emailService';
import screenTimeTracker from '../utils/screenTimeTracker';

const DailyLogForm = () => {
  const { addDailyLog, getTodayLog } = useApp();
  const { user } = useAuth();
  const todayLog = getTodayLog();
  
  const [formData, setFormData] = useState({
    sleep: todayLog?.sleep || '',
    screenTime: todayLog?.screenTime || '',
    mood: todayLog?.mood || ''
  });

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

    // Save to localStorage
    const today = new Date().toISOString().split('T')[0];
    const log = {
      date: today,
      sleep,
      screenTime,
      mood,
      riskScore,
      status: riskScore >= 7 ? 'High' : riskScore >= 4 ? 'Moderate' : 'Low',
      tasksCompleted: todayLog?.tasksCompleted || []
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
    'Anxious',
    'Overwhelmed'
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        📝 Daily Check-In
      </h2>
      
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

