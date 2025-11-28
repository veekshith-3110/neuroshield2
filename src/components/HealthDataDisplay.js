// src/components/HealthDataDisplay.js
import React, { useEffect, useState } from "react";
import { getHealthSummary } from "../utils/healthDataService";

const cardStyle = {
  background: "#ffffff",
  borderRadius: "16px",
  padding: "16px 20px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  marginBottom: "16px",
};

function formatTime(ts) {
  if (!ts) return "--";
  return new Date(ts).toLocaleTimeString();
}

const HealthDataDisplay = ({ userId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getHealthSummary(userId);
        if (!cancelled) setSummary(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load health data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    // auto-refresh every 10 seconds
    const interval = setInterval(load, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [userId]);

  if (loading && !summary) return <div>Loading health data...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!summary) return <div>No data yet.</div>;

  const { latestSteps, latestHeartRate, latestTimestamp, todaySteps, stats } = summary;

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Live Health Status</h2>
        <p><strong>User:</strong> {summary.userId}</p>
        <p>
          <strong>Heart Rate:</strong>{" "}
          {latestHeartRate != null ? `${latestHeartRate} bpm` : "No data"}
        </p>
        <p>
          <strong>Latest Steps Entry:</strong> {latestSteps ?? "--"}
        </p>
        <p style={{ fontSize: "0.85rem", color: "#777" }}>
          Last updated: {formatTime(latestTimestamp)}
        </p>
      </div>

      <div style={cardStyle}>
        <h3>Today</h3>
        <p>
          <strong>Steps Today:</strong> {todaySteps ?? 0}
        </p>
        <p>
          <strong>Avg Heart Rate:</strong>{" "}
          {stats?.avgHeartRate ? `${stats.avgHeartRate.toFixed(1)} bpm` : "N/A"}
        </p>
      </div>

      <div style={cardStyle}>
        <h3>All-Time Stats</h3>
        <p>
          <strong>Total Entries:</strong> {stats?.totalEntries ?? 0}
        </p>
        <p>
          <strong>Total Steps (all data):</strong> {stats?.totalSteps ?? 0}
        </p>
        <p>
          <strong>Min HR:</strong>{" "}
          {stats?.minHeartRate != null ? `${stats.minHeartRate} bpm` : "N/A"}
        </p>
        <p>
          <strong>Max HR:</strong>{" "}
          {stats?.maxHeartRate != null ? `${stats.maxHeartRate} bpm` : "N/A"}
        </p>
      </div>
    </div>
  );
};

export default HealthDataDisplay;
