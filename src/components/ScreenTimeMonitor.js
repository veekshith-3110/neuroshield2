import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import screenTimeTracker from '../utils/screenTimeTracker';
import autoRiskCalculator from '../utils/autoRiskCalculator';
import ScreenLock from './ScreenLock';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ScreenTimeMonitor = () => {
  const { user } = useAuth();
  const [screenTime, setScreenTime] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [defaultScreenTime, setDefaultScreenTime] = useState(0);
  const [showDefaultModal, setShowDefaultModal] = useState(false);
  const [newDefaultTime, setNewDefaultTime] = useState('');

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Load today's time
    screenTimeTracker.loadTodayTime();
    screenTimeTracker.startTracking();

    // Start monitoring if user is logged in
    if (user?.email) {
      autoRiskCalculator.startMonitoring(user.email);
    }

    // Listen to screen time updates
    const handleTimeUpdate = (event, data) => {
      if (event === 'timeUpdated') {
        setScreenTime(data.totalTime || screenTimeTracker.getTotalTime());
      }
    };

    // Listen to risk updates
    const handleRiskUpdate = (e) => {
      const { riskScore, screenTime } = e.detail;
      setRiskScore(riskScore);
      setScreenTime(screenTime);
    };

    // Listen to screen lock events
    const handleScreenLock = (e) => {
      setIsLocked(e.detail.locked);
    };

    // Listen to switch off reminders
    const handleSwitchOffReminder = () => {
      // Show alert
      alert('🔴 Time to Switch Off!\n\nYou have been using your device for too long. Please take a break and switch off for a while.');
    };

    screenTimeTracker.addListener(handleTimeUpdate);
    window.addEventListener('riskUpdate', handleRiskUpdate);
    window.addEventListener('screenLock', handleScreenLock);
    window.addEventListener('switchOffReminder', handleSwitchOffReminder);

    // Update screen time every minute
    const updateInterval = setInterval(() => {
      const currentTime = screenTimeTracker.getTotalTime();
      setScreenTime(currentTime);
      setAlertCount(autoRiskCalculator.getAlertCount());
    }, 60000);

    // Load history
    const screenTimeHistory = screenTimeTracker.getHistory(7);
    setHistory(screenTimeHistory);

    // Load default screen time
    const defaultTime = screenTimeTracker.getDefaultScreenTime();
    setDefaultScreenTime(defaultTime);

    return () => {
      screenTimeTracker.removeListener(handleTimeUpdate);
      window.removeEventListener('riskUpdate', handleRiskUpdate);
      window.removeEventListener('screenLock', handleScreenLock);
      window.removeEventListener('switchOffReminder', handleSwitchOffReminder);
      clearInterval(updateInterval);
      autoRiskCalculator.stopMonitoring();
    };
  }, [user]);

  const handleUnlock = () => {
    autoRiskCalculator.unlockScreen();
    setIsLocked(false);
  };

  const handleSetDefaultTime = () => {
    const time = parseFloat(newDefaultTime);
    if (!isNaN(time) && time >= 0) {
      screenTimeTracker.setDefaultScreenTime(time);
      setDefaultScreenTime(time);
      setNewDefaultTime('');
      setShowDefaultModal(false);
    }
  };

  // Prepare chart data
  const chartData = history.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    hours: parseFloat(item.hours.toFixed(2))
  }));

  if (isLocked) {
    return <ScreenLock onUnlock={handleUnlock} />;
  }

  return (
    <div className="card shadow-lg mb-4">
      <div className="card-header bg-primary text-white">
        <h2 className="card-title mb-0">
          📊 Screen Time Monitor
        </h2>
      </div>
      <div className="card-body">
        {/* Current Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card bg-info text-white">
              <div className="card-body">
                <h6 className="card-subtitle mb-2">Today's Screen Time</h6>
                <h2 className="card-title mb-0">
                  {screenTime.toFixed(2)} hrs
                </h2>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className={`card text-white ${
              riskScore >= 8 ? 'bg-danger' : 
              riskScore >= 4 ? 'bg-warning' : 
              'bg-success'
            }`}>
              <div className="card-body">
                <h6 className="card-subtitle mb-2">Current Risk Score</h6>
                <h2 className="card-title mb-0">
                  {riskScore}
                </h2>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card bg-secondary text-white">
              <div className="card-body">
                <h6 className="card-subtitle mb-2">Alerts Sent</h6>
                <h2 className="card-title mb-0">
                  {alertCount}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Default Screen Time Info */}
        <div className="alert alert-info d-flex justify-content-between align-items-center">
          <div>
            <strong>Default Screen Time:</strong> {defaultScreenTime} hours
            <small className="d-block text-muted mt-1">
              This is the baseline screen time used when no tracking data exists for a day.
            </small>
          </div>
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={() => setShowDefaultModal(true)}
          >
            Change Default
          </button>
        </div>

        {/* Warning Messages */}
        {riskScore > 8 && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <span className="me-3" style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <strong>High Risk Detected!</strong> Screen is locked. Please take a break.
              {alertCount >= 6 && (
                <div className="mt-1">
                  You will receive alerts every 10 minutes until you take a break.
                </div>
              )}
            </div>
          </div>
        )}

        {riskScore > 7 && riskScore <= 8 && (
          <div className="alert alert-warning d-flex align-items-center" role="alert">
            <span className="me-3" style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <strong>High risk detected.</strong> Email alert has been sent. Please consider taking a break.
            </div>
          </div>
        )}

        {/* Screen Time Chart */}
        <div className="mt-4">
          <h5 className="mb-3">7-Day Screen Time History</h5>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke="#0d6efd" 
                strokeWidth={2}
                name="Screen Time (hours)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Info */}
        <div className="alert alert-secondary mt-4" role="alert">
          <strong>Note:</strong> Screen time is tracked automatically when you're on this page. 
          Risk is calculated every 5 minutes. If risk exceeds 8, your screen will be locked.
        </div>
      </div>

      {/* Default Screen Time Modal */}
      {showDefaultModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Set Default Screen Time</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowDefaultModal(false);
                    setNewDefaultTime('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p>Current default screen time: <strong>{defaultScreenTime} hours</strong></p>
                <p className="text-muted small">
                  This default value is used when no tracking data exists for a day.
                </p>
                <div className="mb-3">
                  <label htmlFor="defaultTime" className="form-label">New Default Screen Time (hours)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="defaultTime"
                    value={newDefaultTime}
                    onChange={(e) => setNewDefaultTime(e.target.value)}
                    placeholder="Enter hours (e.g., 6.5)"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowDefaultModal(false);
                    setNewDefaultTime('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSetDefaultTime}
                >
                  Save Default
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenTimeMonitor;

