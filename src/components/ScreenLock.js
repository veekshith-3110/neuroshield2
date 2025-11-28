import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ScreenLock = ({ onUnlock }) => {
  const { user } = useAuth();
  const [unlockCode, setUnlockCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Request fullscreen to lock screen
    const requestFullscreen = async () => {
      try {
        const element = document.documentElement;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          await element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
        }
      } catch (error) {
        console.error('Error requesting fullscreen:', error);
      }
    };

    requestFullscreen();

    // Prevent escape key from exiting fullscreen
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleUnlock = () => {
    // Simple unlock - user can customize this
    // For demo, any code works, but in production use a secure method
    if (unlockCode.length >= 4) {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }

      onUnlock();
    } else {
      setError('Please enter unlock code (minimum 4 characters)');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      color: '#ffffff',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        backdropFilter: 'blur(10px)',
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#ef4444' }}>
          ⚠️ Screen Locked
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
          Your burnout risk is too high. Please take a break.
        </p>
        
        {user && (
          <p style={{ fontSize: '1rem', marginBottom: '2rem', opacity: 0.7 }}>
            Hello, {user.name || user.email}
          </p>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            value={unlockCode}
            onChange={(e) => {
              setUnlockCode(e.target.value);
              setError('');
            }}
            placeholder="Enter unlock code"
            style={{
              padding: '1rem',
              fontSize: '1.2rem',
              borderRadius: '0.5rem',
              border: '2px solid #ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              width: '300px',
              textAlign: 'center',
            }}
            autoFocus
          />
          {error && (
            <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>{error}</p>
          )}
        </div>

        <button
          onClick={handleUnlock}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Unlock Screen
        </button>

        <p style={{ 
          fontSize: '0.9rem', 
          marginTop: '2rem', 
          opacity: 0.6,
          maxWidth: '400px',
        }}>
          This screen is locked due to high burnout risk. Please take a break, 
          hydrate, and disconnect from screens for a while.
        </p>
      </div>
    </div>
  );
};

export default ScreenLock;

