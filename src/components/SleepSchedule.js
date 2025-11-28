import React, { useState, useEffect } from 'react';
import { getSleepSchedule, saveSleepSchedule, calculateSleepDuration, calculateSleepBenefits } from '../utils/sleepScheduleService';
import { useApp } from '../context/AppContext';

const SleepSchedule = () => {
  const { getTodayLog } = useApp();
  const todayLog = getTodayLog();
  
  const [schedule, setSchedule] = useState(getSleepSchedule());
  const [benefits, setBenefits] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Calculate benefits when schedule or sleep data changes
    const actualSleep = todayLog?.sleep || null;
    const calculatedBenefits = calculateSleepBenefits(schedule, actualSleep);
    setBenefits(calculatedBenefits);
  }, [schedule, todayLog]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSchedule(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setSaved(false);
  };

  const handleSave = () => {
    const duration = calculateSleepDuration(schedule.bedtime, schedule.wakeTime);
    const updatedSchedule = {
      ...schedule,
      targetHours: duration
    };
    
    if (saveSleepSchedule(updatedSchedule)) {
      setSchedule(updatedSchedule);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const duration = calculateSleepDuration(schedule.bedtime, schedule.wakeTime);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        😴 Sleep Schedule
      </h2>

      {saved && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          ✓ Sleep schedule saved successfully!
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="enabled"
            name="enabled"
            checked={schedule.enabled}
            onChange={handleChange}
            className="w-5 h-5"
          />
          <label htmlFor="enabled" className="text-lg font-medium text-gray-700">
            Enable Sleep Schedule
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="bedtime" className="block text-sm font-medium text-gray-700 mb-2">
              🌙 Bedtime
            </label>
            <input
              type="time"
              id="bedtime"
              name="bedtime"
              value={schedule.bedtime}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="wakeTime" className="block text-sm font-medium text-gray-700 mb-2">
              ☀️ Wake Time
            </label>
            <input
              type="time"
              id="wakeTime"
              name="wakeTime"
              value={schedule.wakeTime}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-1">
            Sleep Duration: <span className="text-lg font-bold">{duration.toFixed(1)} hours</span>
          </p>
          <p className="text-xs text-blue-600">
            {duration >= 7 && duration <= 9 
              ? '✅ Optimal sleep duration' 
              : duration < 7 
                ? '⚠️ Consider increasing to 7-9 hours' 
                : '⚠️ Consider reducing to 7-9 hours'}
          </p>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Save Sleep Schedule
        </button>

        {/* Benefits Section */}
        {benefits && (
          <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              📊 Sleep Schedule Benefits
            </h3>
            
            {todayLog?.sleep ? (
              <>
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">Actual Sleep: {todayLog.sleep} hours</p>
                  <p className="text-sm text-gray-600 mb-1">Target Sleep: {benefits.targetHours} hours</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${benefits.adherence}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Adherence: {benefits.adherence.toFixed(0)}%</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600 mb-3">
                Complete your daily log to see personalized benefits!
              </p>
            )}

            <div className="space-y-1">
              {benefits.benefits.map((benefit, index) => (
                <p key={index} className="text-sm text-gray-700">
                  {benefit}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* General Benefits Info */}
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">Benefits of Following Your Sleep Schedule:</h4>
          <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
            <li>Improved cognitive function and memory</li>
            <li>Better mood and emotional regulation</li>
            <li>Enhanced immune system</li>
            <li>Reduced risk of chronic diseases</li>
            <li>Increased productivity and focus</li>
            <li>Better physical performance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SleepSchedule;

