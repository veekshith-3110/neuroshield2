import React from 'react';
import { useAuth } from '../context/AuthContext';
import BouncyClock from './BouncyClock';
import VoiceCommand from './VoiceCommand';
import BreakReminderService from './BreakReminderService';

const ProtectedRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow access even without authentication (guest mode)
  // Users can still login if they want to save data

  return (
    <>
      {children}
      <BouncyClock />
      <VoiceCommand />
      <BreakReminderService />
    </>
  );
};

export default ProtectedRoute;

