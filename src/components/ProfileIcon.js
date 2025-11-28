import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProfileIcon.css';

const ProfileIcon = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleProfileClick = () => {
    navigate('/dashboard/profile');
  };

  return (
    <button
      onClick={handleProfileClick}
      className="profile-icon-button"
      title="Edit Profile"
      aria-label="Go to profile page"
    >
      {user?.picture ? (
        <img 
          src={user.picture} 
          alt={user.name || 'Profile'} 
          className="profile-icon-image"
        />
      ) : (
        <div className="profile-icon-placeholder">
          <span className="profile-icon-emoji">👤</span>
        </div>
      )}
    </button>
  );
};

export default ProfileIcon;

