// src/utils/healthDataService.js

const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

async function fetchJson(pathWithQuery) {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}${pathWithQuery}`);
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    return res.json();
  } catch (error) {
    // Gracefully handle network errors (e.g., backend not available in production)
    console.warn('Backend request failed:', error.message);
    // Return empty/default data so app continues to work
    return null;
  }
}

// Get all data points for a user
export async function getUserHealthData(userId) {
  const data = await fetchJson(`/api/health?userId=${encodeURIComponent(userId)}`);
  return data || [];
}

// Get latest health data point for a user
export async function getLatestHealthData(userId) {
  const data = await fetchJson(`/api/health/latest?userId=${encodeURIComponent(userId)}`);
  return data || { steps: 0, heartRate: null, timestamp: new Date().toISOString() };
}

// Get aggregated statistics for a user
export async function getHealthStatistics(userId) {
  const data = await fetchJson(`/api/health/stats?userId=${encodeURIComponent(userId)}`);
  return data || { avgHeartRate: 0, totalSteps: 0, dataPoints: 0 };
}

// Get today's steps for a user
export async function getTodaySteps(userId) {
  const today = await fetchJson(`/api/health/today?userId=${encodeURIComponent(userId)}`);
  return today?.todaySteps || 0;
}

// Get latest heart rate for a user
export async function getLatestHeartRate(userId) {
  const latest = await fetchJson(`/api/health/latest?userId=${encodeURIComponent(userId)}`);
  return latest?.heartRate ?? null;
}

// Get a complete summary of useful info
export async function getHealthSummary(userId) {
  try {
    const [latest, stats, today] = await Promise.all([
      getLatestHealthData(userId),
      getHealthStatistics(userId),
      fetchJson(`/api/health/today?userId=${encodeURIComponent(userId)}`),
    ]);

    return {
      userId,
      latestSteps: latest?.steps || 0,
      latestHeartRate: latest?.heartRate ?? null,
      latestTimestamp: latest?.timestamp || new Date().toISOString(),
      todaySteps: today?.todaySteps || 0,
      todayLatestHeartRate: today?.latestHeartRate ?? null,
      stats: stats || { avgHeartRate: 0, totalSteps: 0, dataPoints: 0 },
    };
  } catch (error) {
    // Return default values if backend is unavailable
    console.warn('Health summary fetch failed, using defaults:', error);
    return {
      userId,
      latestSteps: 0,
      latestHeartRate: null,
      latestTimestamp: new Date().toISOString(),
      todaySteps: 0,
      todayLatestHeartRate: null,
      stats: { avgHeartRate: 0, totalSteps: 0, dataPoints: 0 },
    };
  }
}
