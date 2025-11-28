/**
 * AI Mentor Avatar Component
 * 
 * Gen Z style wellness mentor that provides:
 * - Gentle reminders
 * - Sincere compliments
 * - Break suggestions
 * - Stress-aware responses
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

const AIMentorAvatar = () => {
  const { data, getTodayLog } = useApp();
  const [avatarType, setAvatarType] = useState('panda'); // panda, fox, robot, fairy
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stressLevel, setStressLevel] = useState(0);
  const messagesEndRef = useRef(null);

  const todayLog = getTodayLog();

  // Calculate stress level from today's log
  useEffect(() => {
    if (todayLog) {
      // Convert risk score (0-10) to stress level (0-100)
      setStressLevel((todayLog.riskScore / 10) * 100);
    }
  }, [todayLog]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessages = {
        panda: "Hey! 🐼 I'm your Chill Panda mentor. Ready to help you stay balanced?",
        fox: "What's up! 🦊 Focus Fox here. Let's keep you sharp and energized!",
        robot: "Hello! 🤖 Zen Robot at your service. Let's find your calm.",
        fairy: "Hi beautiful! ✨ Your Soft-girl fairy is here to support you."
      };
      setMessages([{
        role: 'mentor',
        text: welcomeMessages[avatarType],
        timestamp: new Date()
      }]);
    }
  }, [avatarType, messages.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || loading) return;

    const userMessage = userInput.trim();
    setUserInput('');
    
    // Add user message to chat
    const newUserMessage = {
      role: 'user',
      text: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      // Call backend API for AI mentor response
      // Uses proxy from package.json in development, or REACT_APP_API_URL in production
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${apiUrl}/api/mentor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage,
          avatarType,
          stressLevel
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get mentor response');
      }

      const data = await response.json();
      
      // Add mentor response to chat
      setMessages(prev => [...prev, {
        role: 'mentor',
        text: data.reply,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error getting mentor response:', error);
      // Fallback response
      setMessages(prev => [...prev, {
        role: 'mentor',
        text: "Sorry, I'm having a moment 😅 Can you try again?",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarEmoji = () => {
    const emojis = {
      panda: '🐼',
      fox: '🦊',
      robot: '🤖',
      fairy: '✨'
    };
    return emojis[avatarType] || '🐼';
  };

  const getAvatarName = () => {
    const names = {
      panda: 'Chill Panda',
      fox: 'Focus Fox',
      robot: 'Zen Robot',
      fairy: 'Soft-girl Fairy'
    };
    return names[avatarType] || 'Mentor';
  };

  return (
    <div className="card shadow-lg mb-4">
      <div className="card-header bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            {getAvatarEmoji()} {getAvatarName()} - Your AI Wellness Mentor
          </h5>
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn ${avatarType === 'panda' ? 'btn-light' : 'btn-outline-light'}`}
              onClick={() => setAvatarType('panda')}
              title="Chill Panda"
            >
              🐼
            </button>
            <button
              type="button"
              className={`btn ${avatarType === 'fox' ? 'btn-light' : 'btn-outline-light'}`}
              onClick={() => setAvatarType('fox')}
              title="Focus Fox"
            >
              🦊
            </button>
            <button
              type="button"
              className={`btn ${avatarType === 'robot' ? 'btn-light' : 'btn-outline-light'}`}
              onClick={() => setAvatarType('robot')}
              title="Zen Robot"
            >
              🤖
            </button>
            <button
              type="button"
              className={`btn ${avatarType === 'fairy' ? 'btn-light' : 'btn-outline-light'}`}
              onClick={() => setAvatarType('fairy')}
              title="Soft-girl Fairy"
            >
              ✨
            </button>
          </div>
        </div>
      </div>
      <div className="card-body">
        {/* Stress Level Indicator */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted">Current Stress Level</small>
            <span className={`badge ${stressLevel < 40 ? 'bg-success' : stressLevel < 70 ? 'bg-warning' : 'bg-danger'}`}>
              {Math.round(stressLevel)}%
            </span>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div
              className={`progress-bar ${stressLevel < 40 ? 'bg-success' : stressLevel < 70 ? 'bg-warning' : 'bg-danger'}`}
              role="progressbar"
              style={{ width: `${stressLevel}%` }}
            ></div>
          </div>
        </div>

        {/* Chat Messages */}
        <div
          className="border rounded p-3 mb-3"
          style={{
            height: '400px',
            overflowY: 'auto',
            backgroundColor: '#f8f9fa'
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div
                className={`p-3 rounded ${
                  msg.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-white border'
                }`}
                style={{ maxWidth: '75%' }}
              >
                {msg.role === 'mentor' && (
                  <div className="mb-1">
                    <strong>{getAvatarEmoji()} {getAvatarName()}</strong>
                  </div>
                )}
                <div>{msg.text}</div>
                <small
                  className={`d-block mt-1 ${
                    msg.role === 'user' ? 'text-white-50' : 'text-muted'
                  }`}
                  style={{ fontSize: '0.7rem' }}
                >
                  {msg.timestamp.toLocaleTimeString()}
                </small>
              </div>
            </div>
          ))}
          {loading && (
            <div className="d-flex justify-content-start mb-3">
              <div className="bg-white border p-3 rounded">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span className="text-muted">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage}>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Ask your mentor anything..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading || !userInput.trim()}
            >
              Send
            </button>
          </div>
        </form>

        {/* Quick Actions */}
        <div className="mt-3 d-flex flex-wrap gap-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setUserInput("I'm feeling stressed. What should I do?")}
            disabled={loading}
          >
            💆 Need a break?
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setUserInput("Give me some motivation")}
            disabled={loading}
          >
            💪 Need motivation
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setUserInput("How am I doing today?")}
            disabled={loading}
          >
            📊 Check my progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIMentorAvatar;

