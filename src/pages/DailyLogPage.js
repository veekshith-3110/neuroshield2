import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DailyLogForm from '../components/DailyLogForm';
import AnimatedLogoutButton from '../components/AnimatedLogoutButton';
import ProfileIcon from '../components/ProfileIcon';
import DashboardNavigation from '../components/DashboardNavigation';
import SleepSchedule from '../components/SleepSchedule';
import BreakReminder from '../components/BreakReminder';

const DailyLogPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
              🛡️ Neuroshield - Daily Log
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
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ProfileIcon />
            <AnimatedLogoutButton onLogout={handleLogout} />
          </div>
        </header>

        {/* Navigation Menu */}
        <DashboardNavigation />

        {/* Main Content */}
        <div className="space-y-6 mt-8">
          <DailyLogForm />
          <SleepSchedule />
          <BreakReminder />
        </div>

        {/* Back to Dashboard Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyLogPage;

