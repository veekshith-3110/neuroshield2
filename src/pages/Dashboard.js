import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardNavigation from '../components/DashboardNavigation';
import AnimatedLogoutButton from '../components/AnimatedLogoutButton';
import ProfileIcon from '../components/ProfileIcon';

const Dashboard = () => {
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
          <div className="flex items-center gap-2">
            <ProfileIcon />
            <AnimatedLogoutButton onLogout={handleLogout} />
          </div>
        </header>

        {/* Navigation Menu */}
        <DashboardNavigation />

        {/* Welcome Message */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome to Neuroshield! 🎉
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Select a feature from the cards above to get started. Each feature has its own dedicated page for the best experience.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">📊 Screen Time</h3>
                <p className="text-sm text-gray-600">Track your daily screen usage</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">😟 Stress Detection</h3>
                <p className="text-sm text-gray-600">Monitor stress levels in real-time</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">😴 Anti-Doze</h3>
                <p className="text-sm text-gray-600">Stay alert with drowsiness detection</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">📝 Daily Log</h3>
                <p className="text-sm text-gray-600">Record your wellness daily</p>
              </div>
            </div>
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

