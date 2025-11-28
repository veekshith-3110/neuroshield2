// src/utils/healthDataService.js

const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

async function fetchJson(pathWithQuery) {
  const res = await fetch(`${BACKEND_BASE_URL}${pathWithQuery}`);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
}

// Get all data points for a user
export async function getUserHealthData(userId) {
  return fetchJson(`/api/health?userId=${encodeURIComponent(userId)}`);
}

// Get latest health data point for a user
export async function getLatestHealthData(userId) {
  return fetchJson(`/api/health/latest?userId=${encodeURIComponent(userId)}`);
}

// Get aggregated statistics for a user
export async function getHealthStatistics(userId) {
  return fetchJson(`/api/health/stats?userId=${encodeURIComponent(userId)}`);
}

// Get today's steps for a user
export async function getTodaySteps(userId) {
  const today = await fetchJson(`/api/health/today?userId=${encodeURIComponent(userId)}`);
  return today.todaySteps;
}

// Get latest heart rate for a user
export async function getLatestHeartRate(userId) {
  const latest = await fetchJson(`/api/health/latest?userId=${encodeURIComponent(userId)}`);
  return latest.heartRate ?? null;
}

// Get a complete summary of useful info
export async function getHealthSummary(userId) {
  const [latest, stats, today] = await Promise.all([
    getLatestHealthData(userId),
    getHealthStatistics(userId),
    fetchJson(`/api/health/today?userId=${encodeURIComponent(userId)}`),
  ]);

  return {
    userId,
    latestSteps: latest.steps,
    latestHeartRate: latest.heartRate ?? null,
    latestTimestamp: latest.timestamp,
    todaySteps: today.todaySteps,
    todayLatestHeartRate: today.latestHeartRate ?? null,
    stats, // includes avgHeartRate, totalSteps, etc.
  };
}
