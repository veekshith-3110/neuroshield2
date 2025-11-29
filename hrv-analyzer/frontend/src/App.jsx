/**
 * HRV Analyzer - Main App Component
 * 
 * This is the main application component that manages the view state
 * between the upload page and the dashboard.
 * 
 * Features:
 * - File upload interface
 * - HRV analytics dashboard
 * - History management (localStorage)
 */

import React, { useState, useEffect } from 'react';
import Upload from './components/Upload';
import HrvDashboard from './components/HrvDashboard';
import FeatureCards from './components/FeatureCards';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('upload'); // 'upload' or 'dashboard'
  const [currentData, setCurrentData] = useState(null);
  const [history, setHistory] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('hrvHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('hrvHistory', JSON.stringify(history));
    }
  }, [history]);

  /**
   * Handle successful file upload and processing
   * 
   * @param {Object} data - Processed HRV data from backend
   */
  const handleUploadSuccess = (data) => {
    // Add timestamp if not present
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
    }

    // Add to history
    const newHistory = [data, ...history].slice(0, 50); // Keep last 50 entries
    setHistory(newHistory);

    // Set current data and switch to dashboard
    setCurrentData(data);
    setCurrentView('dashboard');
  };

  /**
   * Navigate back to upload page
   */
  const handleBackToUpload = () => {
    setCurrentView('upload');
  };

  /**
   * Load a historical entry
   * 
   * @param {Object} entry - Historical HRV data entry
   */
  const handleLoadHistory = (entry) => {
    setCurrentData(entry);
    setCurrentView('dashboard');
  };

  /**
   * Clear all history
   */
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      setHistory([]);
      localStorage.removeItem('hrvHistory');
    }
  };

  return (
    <div className="App min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              📊 HRV Analyzer
            </h1>
            <nav className="flex gap-4">
              <button
                onClick={() => setCurrentView('upload')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'upload'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Upload
              </button>
              <button
                onClick={() => setCurrentView('features')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'features'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Features
              </button>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Clear History
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {currentView === 'features' ? (
        <FeatureCards onNavigate={setCurrentView} />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'upload' ? (
            <Upload
              onUploadSuccess={handleUploadSuccess}
              history={history}
              onLoadHistory={handleLoadHistory}
            />
          ) : (
            <HrvDashboard
              data={currentData}
              onBack={handleBackToUpload}
            />
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-gray-600 text-sm">
        <p>HRV Analyzer - Heart Rate Variability Analysis Tool</p>
        <p className="mt-1">Upload .csv, .fit, or .gpx files to analyze your HRV data</p>
      </footer>
    </div>
  );
}

export default App;

