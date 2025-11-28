/**
 * Shared Health Data Storage
 * 
 * This module provides a shared storage mechanism for health data
 * that can be used by both the health-connect service and the main server.
 */

// In-memory storage (in production, use a database)
let healthDataStore = {};

/**
 * Store health data from HealthDataPayload
 * @param {Object} payload - { userId, steps, heartRate?, timestamp }
 * @returns {Object} - { success, records, count }
 */
export function storeHealthDataPayload(payload) {
  const { userId, steps, heartRate, timestamp } = payload;

  if (!userId || steps === undefined) {
    throw new Error('Missing required fields: userId, steps');
  }

  // Initialize user's health data if not exists
  if (!healthDataStore[userId]) {
    healthDataStore[userId] = [];
  }

  const records = [];
  const recordTimestamp = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();

  // Store steps
  const stepsRecord = {
    id: `${Date.now()}_steps`,
    userId,
    dataType: 'steps',
    value: typeof steps === 'number' ? steps : parseInt(steps, 10),
    unit: 'count',
    timestamp: recordTimestamp,
    source: 'android_health_connect',
    createdAt: new Date().toISOString()
  };
  healthDataStore[userId].push(stepsRecord);
  records.push(stepsRecord);

  // Store heart rate if provided
  if (heartRate !== null && heartRate !== undefined) {
    const hrRecord = {
      id: `${Date.now()}_heart_rate`,
      userId,
      dataType: 'heart_rate',
      value: typeof heartRate === 'number' ? heartRate : parseInt(heartRate, 10),
      unit: 'bpm',
      timestamp: recordTimestamp,
      source: 'android_health_connect',
      createdAt: new Date().toISOString()
    };
    healthDataStore[userId].push(hrRecord);
    records.push(hrRecord);
  }

  // Keep only last 1000 records per user
  if (healthDataStore[userId].length > 1000) {
    healthDataStore[userId] = healthDataStore[userId].slice(-1000);
  }

  return {
    success: true,
    records,
    count: records.length
  };
}

/**
 * Get health data store (for use by healthConnectService)
 * @returns {Object} - The health data store
 */
export function getHealthDataStore() {
  return healthDataStore;
}

/**
 * Set health data store (for initialization)
 * @param {Object} store - The health data store to use
 */
export function setHealthDataStore(store) {
  healthDataStore = store;
}

