import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AnimatedLogoutButton from './AnimatedLogoutButton';
import ProfileIcon from './ProfileIcon';

const PageHeader = ({ title, subtitle, onLogout }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <header className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
          {title}
        </h1>
        {subtitle && (
          <div className="flex items-center gap-3">
            {user?.picture && (
              <img 
                src={user.picture} 
                alt={user.name} 
                className="w-10 h-10 rounded-full border-2 border-purple-500"
              />
            )}
            <p className="text-gray-600 text-lg">
              {subtitle}
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ProfileIcon />
        <AnimatedLogoutButton onLogout={handleLogout} />
      </div>
    </header>
  );
};

export default PageHeader;

