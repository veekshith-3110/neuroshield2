import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import AntiDozePage from './pages/AntiDozePage';
import StressDetectionPage from './pages/StressDetectionPage';
import ScreenTimePage from './pages/ScreenTimePage';
import DailyLogPage from './pages/DailyLogPage';
import HealthDashboardPage from './pages/HealthDashboardPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AIMentorPage from './pages/AIMentorPage';
import NearbyDoctorsPage from './pages/NearbyDoctorsPage';
import RecordsPage from './pages/RecordsPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { registerServiceWorker } from './utils/PWAConfig';

function App() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/anti-doze"
              element={
                <ProtectedRoute>
                  <AntiDozePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/stress"
              element={
                <ProtectedRoute>
                  <StressDetectionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/screen-time"
              element={
                <ProtectedRoute>
                  <ScreenTimePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/daily-log"
              element={
                <ProtectedRoute>
                  <DailyLogPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/dashboard"
              element={
                <ProtectedRoute>
                  <HealthDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/recommendations"
              element={
                <ProtectedRoute>
                  <RecommendationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/ai-mentor"
              element={
                <ProtectedRoute>
                  <AIMentorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/nearby-doctors"
              element={
                <ProtectedRoute>
                  <NearbyDoctorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/records"
              element={
                <ProtectedRoute>
                  <RecordsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
