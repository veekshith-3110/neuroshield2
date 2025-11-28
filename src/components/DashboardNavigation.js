import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './DashboardNavigation.css';

const DashboardNavigation = ({ activeSection, setActiveSection }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [clickedCard, setClickedCard] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Determine active section from URL if not provided
  const getActiveSectionFromPath = () => {
    if (activeSection) return activeSection;
    const path = location.pathname;
    if (path === '/dashboard/anti-doze' || path.includes('/anti-doze')) return 'anti-doze';
    if (path === '/dashboard/stress' || path.includes('/stress')) return 'stress';
    if (path === '/dashboard/screen-time' || path.includes('/screen-time')) return 'screen-time';
    if (path === '/dashboard/daily-log' || path.includes('/daily-log')) return 'daily-log';
    if (path === '/dashboard/dashboard') return 'dashboard';
    if (path === '/dashboard/recommendations' || path.includes('/recommendations')) return 'recommendations';
    if (path === '/dashboard/ai-mentor' || path.includes('/ai-mentor')) return 'ai-mentor';
    if (path === '/dashboard/nearby-doctors' || path.includes('/nearby-doctors')) return 'nearby-doctors';
    if (path === '/dashboard/records' || path.includes('/records')) return 'records';
    return '';
  };
  
  const currentActiveSection = getActiveSectionFromPath();
  
  const handleCardClick = (sectionId, itemId) => {
    // Prevent multiple clicks during animation
    if (isAnimating) return;
    
    setIsAnimating(true);
    setClickedCard(itemId);
    
    // Wait for animation to complete before navigating
    setTimeout(() => {
      if (sectionId === 'dashboard') {
        navigate('/dashboard/dashboard', { replace: false });
      } else {
        navigate(`/dashboard/${sectionId}`, { replace: false });
      }
      
      // Reset animation state after navigation
      setTimeout(() => {
        setClickedCard(null);
        setIsAnimating(false);
      }, 300);
    }, 400); // Match animation duration
  };
  const menuItems = [
    {
      id: 'daily-log',
      icon: '📝',
      label: 'Daily Log',
      description: 'Record your daily wellness and track your progress',
      class: 'daily-log'
    },
    {
      id: 'dashboard',
      icon: '📈',
      label: 'Health Dashboard',
      description: 'View comprehensive health metrics and analytics',
      class: 'dashboard'
    },
    {
      id: 'recommendations',
      icon: '💡',
      label: 'Recommendations',
      description: 'Get personalized wellness tips and suggestions',
      class: 'recommendations'
    },
    {
      id: 'ai-mentor',
      icon: '🤖',
      label: 'AI Mentor',
      description: 'Chat with your Gen Z wellness mentor for support',
      class: 'ai-mentor'
    },
    {
      id: 'nearby-doctors',
      icon: '🏥',
      label: 'Nearby Doctors',
      description: 'Find nearby healthcare providers and get directions',
      class: 'nearby-doctors'
    },
    {
      id: 'records',
      icon: '📋',
      label: 'My Records',
      description: 'Add and manage your personal records stored in your Google account',
      class: 'records'
    },
    {
      id: 'screen-time',
      icon: '📊',
      label: 'Screen Time',
      description: 'Track your daily screen time and monitor usage patterns',
      class: 'screen-time'
    },
    {
      id: 'stress',
      icon: '😟',
      label: 'Stress Detection',
      description: 'Real-time stress level monitoring using facial analysis',
      class: 'stress'
    },
    {
      id: 'anti-doze',
      icon: '😴',
      label: 'Anti-Doze',
      description: 'Stay alert with drowsiness detection and wake-up alerts',
      class: 'anti-doze'
    }
  ];

  return (
    <div className="dashboard-nav-container">
      {menuItems.map((item) => {
        const isActive = currentActiveSection === item.id;
        const isClicked = clickedCard === item.id;
        return (
          <div
            key={item.id}
            className={`nav-card-parent ${isActive ? 'active' : ''} ${isClicked ? 'clicked' : ''}`}
            onClick={() => handleCardClick(item.id, item.id)}
          >
            <div className={`nav-card ${item.class} ${isActive ? 'active' : ''} ${isClicked ? 'clicked' : ''}`}>
              <div className="nav-card-logo">
                <span className="nav-circle nav-circle1"></span>
                <span className="nav-circle nav-circle2"></span>
                <span className="nav-circle nav-circle3"></span>
                <span className="nav-circle nav-circle4"></span>
                <span className="nav-circle nav-circle5"></span>
              </div>

              <div className="nav-card-content">
                <span className="nav-title">{item.label}</span>
                <span className="nav-text">{item.description}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardNavigation;

