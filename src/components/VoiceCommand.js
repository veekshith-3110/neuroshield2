import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './VoiceCommand.css';

const VoiceCommand = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  // Voice command mappings - expanded with more variations
  const commandMap = {
    // Daily Log
    'daily log': 'daily-log',
    'daily': 'daily-log',
    'log': 'daily-log',
    'daily log page': 'daily-log',
    'wellness log': 'daily-log',
    
    // Health Dashboard
    'health dashboard': 'dashboard',
    'dashboard': 'dashboard',
    'health': 'dashboard',
    'health metrics': 'dashboard',
    'analytics': 'dashboard',
    
    // Recommendations
    'recommendations': 'recommendations',
    'recommendation': 'recommendations',
    'tips': 'recommendations',
    'wellness tips': 'recommendations',
    'suggestions': 'recommendations',
    
    // AI Mentor
    'ai mentor': 'ai-mentor',
    'mentor': 'ai-mentor',
    'ai': 'ai-mentor',
    'chat': 'ai-mentor',
    'chatbot': 'ai-mentor',
    
    // Profile
    'profile': 'profile',
    'my profile': 'profile',
    'edit profile': 'profile',
    'account': 'profile',
    'settings': 'profile',
    
    // Nearby Doctors
    'nearby doctors': 'nearby-doctors',
    'doctors': 'nearby-doctors',
    'doctor': 'nearby-doctors',
    'find doctors': 'nearby-doctors',
    'healthcare': 'nearby-doctors',
    
    // Records
    'records': 'records',
    'my records': 'records',
    'record': 'records',
    'my record': 'records',
    'personal records': 'records',
    
    // Screen Time
    'screen time': 'screen-time',
    'screen': 'screen-time',
    'screen tracking': 'screen-time',
    'usage': 'screen-time',
    
    // Stress Detection
    'stress detection': 'stress',
    'stress': 'stress',
    'stress level': 'stress',
    'stress monitor': 'stress',
    'stress test': 'stress',
    
    // Anti-Doze
    'anti doze': 'anti-doze',
    'anti-doze': 'anti-doze',
    'drowsiness': 'anti-doze',
    'sleep detection': 'anti-doze',
    'drowsy': 'anti-doze',
    'anti doze detection': 'anti-doze'
  };

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        let command = lastResult[0].transcript.toLowerCase().trim();
        
        // Clean up common speech recognition artifacts
        command = command
          .replace(/^open\s+/i, '')
          .replace(/^go to\s+/i, '')
          .replace(/^show\s+/i, '')
          .replace(/^navigate to\s+/i, '')
          .replace(/^take me to\s+/i, '')
          .replace(/\s+page$/i, '')
          .replace(/\s+feature$/i, '')
          .trim();
        
        setTranscript(command);
        console.log('Recognized command:', command);
        
        // Find matching command - try exact match first, then partial
        let matchedCommand = Object.keys(commandMap).find(
          key => command === key || command.includes(key) || key.includes(command)
        );
        
        // If no match, try with common prefixes/suffixes removed
        if (!matchedCommand) {
          const cleanedCommand = command.replace(/^(open|go to|show|navigate to|take me to)\s+/i, '').trim();
          matchedCommand = Object.keys(commandMap).find(
            key => cleanedCommand === key || cleanedCommand.includes(key) || key.includes(cleanedCommand)
          );
        }
        
        if (matchedCommand) {
          const route = commandMap[matchedCommand];
          console.log('Navigating to:', route);
          handleNavigation(route);
        } else {
          console.log('No match found for:', command);
          setError(`Command "${command}" not recognized. Try: "daily log", "stress detection", "health dashboard", etc.`);
          setTimeout(() => setError(null), 4000);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          setError('No speech detected. Please try again.');
        } else if (event.error === 'audio-capture') {
          setError('No microphone found. Please check your microphone.');
        } else if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow microphone access.');
        } else {
          setError('Speech recognition error. Please try again.');
        }
        
        setTimeout(() => setError(null), 3000);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsSupported(false);
      setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleNavigation = (route) => {
    if (route === 'dashboard') {
      navigate('/dashboard/dashboard', { replace: false });
    } else {
      navigate(`/dashboard/${route}`, { replace: false });
    }
    setIsListening(false);
    setTranscript('');
  };

  const startListening = () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    setError(null);
    setTranscript('');
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setIsListening(false);
      setError('Failed to start voice recognition. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setTranscript('');
  };

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  return (
    <div className="voice-command-container">
      <button
        className={`voice-command-button ${isListening ? 'listening' : ''}`}
        onClick={isListening ? stopListening : startListening}
        title={isListening ? 'Stop listening' : 'Start voice command'}
        aria-label={isListening ? 'Stop voice command' : 'Start voice command'}
      >
        <span className="voice-icon">
          {isListening ? '🛑' : '🎤'}
        </span>
        <span className="voice-text">
          {isListening ? 'Listening...' : 'Voice'}
        </span>
      </button>

      {isListening && (
        <div className="voice-listening-indicator">
          <div className="pulse-ring"></div>
          <div className="pulse-ring"></div>
          <div className="pulse-ring"></div>
        </div>
      )}

      {error && (
        <div className="voice-error-message">
          {error}
        </div>
      )}

      {transcript && !error && (
        <div className="voice-transcript">
          Heard: "{transcript}"
        </div>
      )}

      {!isListening && (
        <div className="voice-help-text">
          <p>Try saying:</p>
          <ul>
            <li>"Open daily log"</li>
            <li>"Go to stress detection"</li>
            <li>"Show health dashboard"</li>
            <li>"Open recommendations"</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default VoiceCommand;

