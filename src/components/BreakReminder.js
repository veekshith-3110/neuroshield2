import React, { useState, useEffect } from 'react';
import { 
  getBreakReminders, 
  saveBreakReminders, 
  shouldShowBreakReminder, 
  setNextBreakReminder,
  getTimeUntilNextBreak,
  showBreakNotification
} from '../utils/breakReminderService';

const BreakReminder = () => {
  const [settings, setSettings] = useState(getBreakReminders());
  const [timeUntilBreak, setTimeUntilBreak] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Update time until next break
    const updateTimer = () => {
      const time = getTimeUntilNextBreak(settings);
      setTimeUntilBreak(time);
      
      // Check if it's time for a break
      if (shouldShowBreakReminder(settings)) {
        showBreakNotification('Time for a break! Take a few minutes to rest and recharge.');
        // Set next reminder
        const updated = setNextBreakReminder(settings);
        setSettings(updated);
        saveBreakReminders(updated);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000); // Update every second

    return () => clearInterval(interval);
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseInt(value)
    }));
    setSaved(false);
  };

  const handleSave = () => {
    if (saveBreakReminders(settings)) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleTestReminder = () => {
    showBreakNotification('This is a test break reminder!');
  };

  const formatTime = (minutes, seconds) => {
    if (minutes === 0 && seconds === 0) return 'Now!';
    if (minutes === 0) return `${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        ⏰ Break Reminders
      </h2>

      {saved && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          ✓ Break reminder settings saved!
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="enabled"
            name="enabled"
            checked={settings.enabled}
            onChange={handleChange}
            className="w-5 h-5"
          />
          <label htmlFor="enabled" className="text-lg font-medium text-gray-700">
            Enable Break Reminders
          </label>
        </div>

        <div>
          <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-2">
            Remind me every (minutes):
          </label>
          <select
            id="interval"
            name="interval"
            value={settings.interval}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">1 hour</option>
            <option value="90">90 minutes</option>
            <option value="120">2 hours</option>
          </select>
        </div>

        {settings.enabled && timeUntilBreak && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-1">
              Next Break Reminder:
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {formatTime(timeUntilBreak.minutes, timeUntilBreak.seconds)}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Save Settings
          </button>
          <button
            onClick={handleTestReminder}
            className="px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Test Reminder
          </button>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 Break Reminder Tips:</h4>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>Take a 5-10 minute break every hour</li>
            <li>Stand up and stretch during breaks</li>
            <li>Look away from your screen (20-20-20 rule)</li>
            <li>Drink water and stay hydrated</li>
            <li>Take deep breaths to reduce stress</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BreakReminder;

