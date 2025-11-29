/**
 * HRV Dashboard Component
 * 
 * Displays HRV analytics and visualizations after file processing.
 * 
 * Features:
 * - HRV value display with status color coding
 * - Heart rate over time chart
 * - HRV trends chart
 * - RR interval graph
 * - Status indicators (Relaxed/Normal/Stress)
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Card,
  CardContent
} from 'recharts';

const HrvDashboard = ({ data, onBack }) => {
  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No data available</p>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Upload
        </button>
      </div>
    );
  }

  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Relaxed':
        return 'bg-green-500';
      case 'Normal':
        return 'bg-yellow-500';
      case 'Stress':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    const chartData = [];
    
    // If we have heart rates, use them for the heart rate chart
    if (data.heartRates && data.heartRates.length > 0) {
      data.heartRates.forEach((hr, index) => {
        chartData.push({
          index: index + 1,
          heartRate: hr,
          rrInterval: data.rrIntervals[index] || null
        });
      });
    } else {
      // Otherwise, use RR intervals and calculate HR
      data.rrIntervals.forEach((rr, index) => {
        chartData.push({
          index: index + 1,
          heartRate: Math.round(60000 / rr),
          rrInterval: rr
        });
      });
    }

    return chartData;
  };

  const chartData = prepareChartData();

  // Calculate statistics
  const avgHeartRate = chartData.length > 0
    ? Math.round(chartData.reduce((sum, d) => sum + d.heartRate, 0) / chartData.length)
    : 0;

  const minRR = data.rrIntervals.length > 0
    ? Math.round(Math.min(...data.rrIntervals))
    : 0;

  const maxRR = data.rrIntervals.length > 0
    ? Math.round(Math.max(...data.rrIntervals))
    : 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        ← Back to Upload
      </button>

      {/* HRV Status Card */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              HRV Analysis Results
            </h2>
            <p className="text-gray-600">{data.fileName}</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-gray-800 mb-2">
              {data.hrv} <span className="text-2xl text-gray-500">ms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${getStatusColor(data.status)}`}></div>
              <span className={`text-xl font-semibold ${
                data.status === 'Relaxed' ? 'text-green-600' :
                data.status === 'Normal' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {data.status}
              </span>
            </div>
          </div>
        </div>

        {/* Status Explanation */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>HRV Interpretation:</strong>
          </p>
          <ul className="text-sm text-gray-600 mt-2 space-y-1">
            <li>🟢 <strong>Relaxed (HRV &gt; 70ms):</strong> Good recovery, low stress</li>
            <li>🟡 <strong>Normal (40-70ms):</strong> Moderate stress, normal state</li>
            <li>🔴 <strong>Stress (HRV &lt; 40ms):</strong> High stress, poor recovery</li>
          </ul>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">Average Heart Rate</p>
          <p className="text-3xl font-bold text-gray-800">{avgHeartRate} <span className="text-lg text-gray-500">bpm</span></p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">Min RR Interval</p>
          <p className="text-3xl font-bold text-gray-800">{minRR} <span className="text-lg text-gray-500">ms</span></p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">Max RR Interval</p>
          <p className="text-3xl font-bold text-gray-800">{maxRR} <span className="text-lg text-gray-500">ms</span></p>
        </div>
      </div>

      {/* Heart Rate Over Time Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Heart Rate Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="index" 
              label={{ value: 'Data Point', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Heart Rate (bpm)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="heartRate" 
              stroke="#4f46e5" 
              strokeWidth={2}
              name="Heart Rate (bpm)"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* RR Interval Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">RR Interval Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="index" 
              label={{ value: 'Data Point', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'RR Interval (ms)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="rrInterval" 
              stroke="#10b981" 
              strokeWidth={2}
              name="RR Interval (ms)"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Data Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total Data Points:</p>
            <p className="font-semibold text-gray-800">{data.dataPoints || data.rrIntervals.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Processed At:</p>
            <p className="font-semibold text-gray-800">
              {new Date(data.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrvDashboard;

