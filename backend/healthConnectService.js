/**
 * Health Connect Service
 * 
 * This service provides an interface for integrating with Android Health Connect API.
 * Since this is a web application, the Android Health Connect integration would need
 * to be done through a native Android app or a backend service that communicates
 * with an Android device.
 * 
 * For web integration, you would typically:
 * 1. Create a native Android app that uses Health Connect
 * 2. Have the Android app send data to this backend service
 * 3. This backend service stores and serves the data to the web app
 */

import express from 'express';
import { getHealthDataStore, setHealthDataStore, storeHealthDataPayload } from './healthDataStorage.js';

const router = express.Router();

// Use shared storage
let healthDataStore = getHealthDataStore();

/**
 * Store health data from Android device (individual record)
 * POST /api/health-connect/data
 */
router.post('/data', async (req, res) => {
  try {
    const { userId, dataType, value, timestamp, unit } = req.body;

    if (!userId || !dataType || value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, dataType, value'
      });
    }

    // Initialize user's health data if not exists
    if (!healthDataStore[userId]) {
      healthDataStore[userId] = [];
    }

    // Add new health data point
    const healthRecord = {
      id: Date.now().toString(),
      userId,
      dataType, // e.g., 'steps', 'heart_rate', 'sleep', 'weight', 'height', 'bmi'
      value: parseFloat(value),
      unit: unit || getDefaultUnit(dataType),
      timestamp: timestamp || new Date().toISOString(),
      source: 'android_health_connect',
      createdAt: new Date().toISOString()
    };

    healthDataStore[userId].push(healthRecord);

    // Keep only last 1000 records per user
    if (healthDataStore[userId].length > 1000) {
      healthDataStore[userId] = healthDataStore[userId].slice(-1000);
    }

    res.json({
      success: true,
      message: 'Health data stored successfully',
      record: healthRecord
    });
  } catch (error) {
    console.error('Error storing health data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store health data'
    });
  }
});

/**
 * Store combined health data payload (batch)
 * POST /api/health-connect/batch
 * 
 * Accepts HealthDataPayload format:
 * {
 *   userId: string,
 *   steps: number,
 *   heartRate: number | null,
 *   timestamp: number (milliseconds)
 * }
 */
router.post('/batch', async (req, res) => {
  try {
    const { userId, steps, heartRate, timestamp } = req.body;

    if (!userId || steps === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, steps'
      });
    }

    // Use shared storage function
    const result = storeHealthDataPayload({ userId, steps, heartRate, timestamp });
    
    // Refresh local reference
    healthDataStore = getHealthDataStore();

    res.json({
      success: true,
      message: 'Health data batch stored successfully',
      records: result.records,
      count: result.count
    });
  } catch (error) {
    console.error('Error storing health data batch:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to store health data batch'
    });
  }
});

/**
 * Get health data for a user
 * GET /api/health-connect/data/:userId
 */
router.get('/data/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { dataType, startDate, endDate, limit } = req.query;

    // Refresh local reference to shared store
    healthDataStore = getHealthDataStore();

    if (!healthDataStore[userId]) {
      return res.json({
        success: true,
        data: []
      });
    }

    let data = healthDataStore[userId];

    // Filter by data type if provided
    if (dataType) {
      data = data.filter(record => record.dataType === dataType);
    }

    // Filter by date range if provided
    if (startDate) {
      data = data.filter(record => new Date(record.timestamp) >= new Date(startDate));
    }
    if (endDate) {
      data = data.filter(record => new Date(record.timestamp) <= new Date(endDate));
    }

    // Sort by timestamp (newest first)
    data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    if (limit) {
      data = data.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      data,
      count: data.length
    });
  } catch (error) {
    console.error('Error retrieving health data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve health data'
    });
  }
});

/**
 * Get latest health data for a user
 * GET /api/health-connect/latest/:userId
 */
router.get('/latest/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { dataType } = req.query;

    if (!healthDataStore[userId]) {
      return res.json({
        success: true,
        data: null
      });
    }

    let data = healthDataStore[userId];

    if (dataType) {
      data = data.filter(record => record.dataType === dataType);
    }

    // Get the most recent record
    const latest = data.length > 0 
      ? data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
      : null;

    res.json({
      success: true,
      data: latest
    });
  } catch (error) {
    console.error('Error retrieving latest health data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve latest health data'
    });
  }
});

/**
 * Get aggregated health statistics
 * GET /api/health-connect/stats/:userId
 */
router.get('/stats/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { dataType, period = 'day' } = req.query; // period: 'day', 'week', 'month'

    if (!healthDataStore[userId]) {
      return res.json({
        success: true,
        stats: {}
      });
    }

    let data = healthDataStore[userId];

    if (dataType) {
      data = data.filter(record => record.dataType === dataType);
    }

    // Calculate period boundaries
    const now = new Date();
    let startDate;
    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    // Filter data within period
    const periodData = data.filter(record => 
      new Date(record.timestamp) >= startDate
    );

    // Group by data type and calculate stats
    const stats = {};
    const grouped = {};

    periodData.forEach(record => {
      if (!grouped[record.dataType]) {
        grouped[record.dataType] = [];
      }
      grouped[record.dataType].push(record.value);
    });

    Object.keys(grouped).forEach(type => {
      const values = grouped[type];
      stats[type] = {
        count: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        unit: periodData.find(r => r.dataType === type)?.unit || 'unknown'
      };
    });

    res.json({
      success: true,
      period,
      stats
    });
  } catch (error) {
    console.error('Error calculating health stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate health statistics'
    });
  }
});

/**
 * Delete health data
 * DELETE /api/health-connect/data/:userId/:recordId
 */
router.delete('/data/:userId/:recordId', (req, res) => {
  try {
    const { userId, recordId } = req.params;

    if (!healthDataStore[userId]) {
      return res.status(404).json({
        success: false,
        error: 'User data not found'
      });
    }

    const initialLength = healthDataStore[userId].length;
    healthDataStore[userId] = healthDataStore[userId].filter(
      record => record.id !== recordId
    );

    if (healthDataStore[userId].length === initialLength) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    res.json({
      success: true,
      message: 'Health data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting health data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete health data'
    });
  }
});

/**
 * Helper function to get default unit for data type
 */
function getDefaultUnit(dataType) {
  const units = {
    'steps': 'count',
    'heart_rate': 'bpm',
    'sleep': 'hours',
    'weight': 'kg',
    'height': 'cm',
    'bmi': 'kg/m²',
    'calories': 'kcal',
    'distance': 'meters',
    'active_minutes': 'minutes',
    'blood_pressure_systolic': 'mmHg',
    'blood_pressure_diastolic': 'mmHg',
    'blood_glucose': 'mg/dL',
    'oxygen_saturation': 'percentage'
  };
  return units[dataType] || 'unknown';
}

/**
 * Helper function to parse long values safely
 */
function parseLong(value) {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export default router;

