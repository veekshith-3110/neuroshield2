import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DailyLogForm from '../components/DailyLogForm';
import DashboardComponent from '../components/Dashboard';
import Recommendations from '../components/Recommendations';
import ScreenTimeMonitor from '../components/ScreenTimeMonitor';
import StressDetection from '../components/StressDetection';
import AntiDoze from '../components/AntiDoze';
import DashboardNavigation from '../components/DashboardNavigation';
import FaceDetectionDebug from '../components/FaceDetectionDebug';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('screen-time');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with Logout */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              🛡️ Neuroshield
            </h1>
            <div className="flex items-center gap-3">
              {user?.picture && (
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  className="w-10 h-10 rounded-full border-2 border-purple-500"
                />
              )}
              <p className="text-gray-600 text-lg">
                Welcome back, {user?.name || 'User'}! 👋
                {user?.phone && <span className="text-sm text-gray-500 ml-2">({user.phone})</span>}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Logout
          </button>
        </header>

        {/* Navigation Menu */}
        <DashboardNavigation 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />

        {/* Main Content - Show only active section with animation */}
        <div className="space-y-6" style={{ minHeight: '400px' }}>
          <div
            key={activeSection}
            style={{
              animation: 'fadeIn 0.3s ease-in'
            }}
          >
            {activeSection === 'screen-time' && <ScreenTimeMonitor />}
            {activeSection === 'stress' && (
              <>
                <FaceDetectionDebug />
                <StressDetection />
              </>
            )}
            {activeSection === 'anti-doze' && (
              <>
                <FaceDetectionDebug />
                <AntiDoze />
              </>
            )}
            {activeSection === 'daily-log' && <DailyLogForm />}
            {activeSection === 'dashboard' && <DashboardComponent />}
            {activeSection === 'recommendations' && <Recommendations />}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Built with ❤️ for Gen Z Digital Wellness</p>
          <p className="mt-2">Your data is stored locally and never leaves your device</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;

