import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getHealthMessage } from '../utils/riskCalculator';
import { getHealthSummary } from '../utils/healthDataService';
import { calculateEnergyLevel, getEnergyRecommendations } from '../utils/energyLevelCalculator';

const Dashboard = () => {
  const { data, getTodayLog, getRecentLogs } = useApp();
  const { user } = useAuth();
  const todayLog = getTodayLog();
  const recentLogs = getRecentLogs(7);
  
  // Health data from Android
  const [healthData, setHealthData] = useState({
    steps: null,
    heartRate: null,
    loading: true,
    lastUpdated: null
  });

  // Energy level
  const [energyLevel, setEnergyLevel] = useState(null);

  // Fetch health data from Android and calculate energy level
  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const userId = user?.email || user?.phone || 'log';
        const summary = await getHealthSummary(userId);
        
        const healthDataUpdate = {
          steps: summary.todaySteps || summary.latestSteps || 0,
          heartRate: summary.todayLatestHeartRate || summary.latestHeartRate,
          loading: false,
          lastUpdated: new Date(summary.latestTimestamp || Date.now())
        };
        
        setHealthData(healthDataUpdate);
        
        // Calculate energy level
        const energy = calculateEnergyLevel(
          healthDataUpdate,
          todayLog?.sleep,
          todayLog
        );
        setEnergyLevel(energy);
      } catch (error) {
        console.warn('Could not fetch health data:', error);
        setHealthData(prev => ({ ...prev, loading: false }));
        // Calculate energy level with available data
        const energy = calculateEnergyLevel(
          { steps: null, heartRate: null },
          todayLog?.sleep,
          todayLog
        );
        setEnergyLevel(energy);
      }
    };

    fetchHealthData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, [user, todayLog]);

  // Prepare data for line chart
  const chartData = recentLogs.map(log => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    riskScore: log.riskScore
  }));

  // Prepare mood distribution data
  const moodCounts = {};
  recentLogs.forEach(log => {
    moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
  });

  const moodData = Object.entries(moodCounts).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

  // Calculate health bar percentage (inverse of risk, max 10)
  const healthPercentage = todayLog 
    ? Math.max(0, Math.min(100, ((10 - todayLog.riskScore) / 10) * 100))
    : 100;

  const getHealthColor = () => {
    if (!todayLog) return 'bg-gray-300';
    if (todayLog.riskScore >= 7) return 'bg-red-500';
    if (todayLog.riskScore >= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Health Status Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🎯 Today's Health Status
        </h2>
        
        {todayLog ? (
          <>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Burnout Risk Score</span>
                <span className={`text-2xl font-bold ${
                  todayLog.riskScore >= 7 ? 'text-red-600' :
                  todayLog.riskScore >= 4 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {todayLog.riskScore}/10
                </span>
              </div>
              
              {/* Health Bar */}
              <div className="w-full bg-gray-200 rounded-full h-6 mb-2">
                <div
                  className={`h-6 rounded-full transition-all duration-500 ${getHealthColor()}`}
                  style={{ width: `${healthPercentage}%` }}
                ></div>
              </div>
              
              <p className={`text-lg font-semibold ${
                todayLog.riskScore >= 7 ? 'text-red-600' :
                todayLog.riskScore >= 4 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {todayLog.status} Risk
              </p>
              
              <p className="text-gray-600 mt-2">
                {getHealthMessage(todayLog.riskScore)}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{todayLog.sleep}h</p>
                <p className="text-xs text-gray-600">Sleep</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{todayLog.screenTime}h</p>
                <p className="text-xs text-gray-600">Screen Time</p>
              </div>
              <div className="text-center p-3 bg-pink-50 rounded-lg">
                <p className="text-2xl font-bold text-pink-600">{todayLog.mood}</p>
                <p className="text-xs text-gray-600">Mood</p>
              </div>
            </div>

            {/* Energy Level */}
            {energyLevel && (
              <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  ⚡ Energy Level
                </h3>
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Current Energy</span>
                    <span 
                      className="text-3xl font-bold"
                      style={{ color: energyLevel.color }}
                    >
                      {energyLevel.level}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="h-4 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${energyLevel.level}%`,
                        backgroundColor: energyLevel.color
                      }}
                    ></div>
                  </div>
                  <p className="text-sm font-semibold mt-2" style={{ color: energyLevel.color }}>
                    {energyLevel.category} Energy
                  </p>
                </div>
                
                {/* Energy Recommendations */}
                <div className="mt-3 pt-3 border-t border-yellow-300">
                  <p className="text-xs font-medium text-gray-700 mb-2">Recommendations:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {getEnergyRecommendations(energyLevel).map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Health Data from Android */}
            {(healthData.steps || healthData.heartRate) && (
              <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  📱 Live Health Data from Your Phone
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-600 mb-1">Steps Today</p>
                    <p className="text-2xl font-bold text-green-600">
                      {healthData.steps?.toLocaleString() || '--'}
                    </p>
                    {healthData.steps && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, ((healthData.steps || 0) / 10000) * 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-600 mb-1">Heart Rate</p>
                    <p className="text-2xl font-bold text-red-600">
                      {healthData.heartRate ? `${healthData.heartRate} bpm` : '--'}
                    </p>
                    {healthData.heartRate && (
                      <p className="text-xs text-gray-500 mt-1">
                        {healthData.heartRate < 60 ? 'Resting' : 
                         healthData.heartRate < 100 ? 'Normal' : 
                         healthData.heartRate < 140 ? 'Active' : 'High'}
                      </p>
                    )}
                  </div>
                </div>
                {healthData.lastUpdated && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Last updated: {new Date(healthData.lastUpdated).toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500">Complete your daily check-in to see your health status!</p>
        )}
      </div>

      {/* Streaks and Badges */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🏆 Achievements
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg text-white">
            <p className="text-4xl font-bold">{data.streaks}</p>
            <p className="text-sm">Day Streak</p>
            <p className="text-xs mt-1 opacity-90">Low-risk days</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg text-white">
            <p className="text-sm font-semibold mb-2">Badges Earned</p>
            <div className="space-y-1">
              {data.badges && data.badges.length > 0 ? (
                data.badges.map((badge, idx) => (
                  <div key={idx} className="text-xs bg-white bg-opacity-20 rounded px-2 py-1">
                    🎖️ {badge}
                  </div>
                ))
              ) : (
                <p className="text-xs opacity-75">Complete check-ins to earn badges!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Trend Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            📈 Risk Trend (Past Week)
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="riskScore" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Risk Score"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data yet. Complete check-ins to see trends!</p>
          )}
        </div>

        {/* Mood Distribution Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            😊 Mood Distribution
          </h3>
          {moodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={moodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {moodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No mood data yet!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

