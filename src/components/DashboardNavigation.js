import React from 'react';

const DashboardNavigation = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    {
      id: 'screen-time',
      icon: '📊',
      label: 'Screen Time',
      color: 'primary',
      bgColor: '#0d6efd'
    },
    {
      id: 'stress',
      icon: '😟',
      label: 'Stress Detection',
      color: 'danger',
      bgColor: '#dc3545'
    },
    {
      id: 'anti-doze',
      icon: '😴',
      label: 'Anti-Doze',
      color: 'warning',
      bgColor: '#ffc107'
    },
    {
      id: 'daily-log',
      icon: '📝',
      label: 'Daily Log',
      color: 'info',
      bgColor: '#0dcaf0'
    },
    {
      id: 'dashboard',
      icon: '📈',
      label: 'Health Dashboard',
      color: 'success',
      bgColor: '#198754'
    },
    {
      id: 'recommendations',
      icon: '💡',
      label: 'Recommendations',
      color: 'secondary',
      bgColor: '#6c757d'
    }
  ];

  return (
    <div className="card shadow-lg mb-4 border-0">
      <div className="card-body p-3">
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-3">
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                className={`btn ${isActive ? `btn-${item.color}` : 'btn-outline-secondary'} position-relative`}
                onClick={() => setActiveSection(item.id)}
                style={{
                  minWidth: '140px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '15px 20px',
                  borderRadius: '12px',
                  border: isActive ? `2px solid ${item.bgColor}` : '2px solid #dee2e6',
                  transition: 'all 0.3s ease',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isActive ? `0 4px 12px rgba(0,0,0,0.15)` : 'none',
                  backgroundColor: isActive ? item.bgColor : 'white',
                  color: isActive ? 'white' : '#6c757d'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.borderColor = item.bgColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#dee2e6';
                  }
                }}
                title={item.label}
              >
                <span style={{ fontSize: '2rem', lineHeight: '1' }}>{item.icon}</span>
                <span 
                  style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: isActive ? '600' : '500',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span 
                    className="position-absolute top-0 start-50 translate-middle badge rounded-pill"
                    style={{
                      backgroundColor: item.bgColor,
                      fontSize: '0.6rem',
                      padding: '2px 6px'
                    }}
                  >
                    ●
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardNavigation;

