/**
 * Nearby Doctors Component
 * 
 * Features:
 * - List of nearby doctors/hospitals
 * - Get directions using Google Maps
 * - Emergency button (calls 108 and shares location via WhatsApp)
 */

import React, { useState, useEffect } from 'react';

// Sample doctors data (in production, this would come from an API)
const sampleDoctors = [
    {
      id: 1,
      name: 'City General Hospital',
      specialty: 'General Medicine',
      address: '123 Main Street, City Center',
      phone: '+91-1234567890',
      distance: '2.5 km',
      rating: 4.5,
      lat: 12.9716,
      lng: 77.5946
    },
    {
      id: 2,
      name: 'Dr. Priya Sharma - Cardiologist',
      specialty: 'Cardiology',
      address: '456 Health Avenue, Medical District',
      phone: '+91-9876543210',
      distance: '3.8 km',
      rating: 4.8,
      lat: 12.9750,
      lng: 77.6000
    },
    {
      id: 3,
      name: 'Apollo Hospital',
      specialty: 'Multi-specialty',
      address: '789 Hospital Road, Healthcare Zone',
      phone: '+91-1122334455',
      distance: '5.2 km',
      rating: 4.7,
      lat: 12.9800,
      lng: 77.6100
    },
    {
      id: 4,
      name: 'Dr. Rajesh Kumar - Neurologist',
      specialty: 'Neurology',
      address: '321 Brain Care Center, Neuro Street',
      phone: '+91-9988776655',
      distance: '4.1 km',
      rating: 4.6,
      lat: 12.9650,
      lng: 77.5900
    },
    {
      id: 5,
      name: 'Emergency Care Clinic',
      specialty: 'Emergency Medicine',
      address: '555 Emergency Lane, Quick Care Area',
      phone: '+91-108',
      distance: '1.8 km',
      rating: 4.4,
      lat: 12.9700,
      lng: 77.5950
    }
];

const NearbyDoctors = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading] = useState(false);
  const [error, setError] = useState('');

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          // In production, you would fetch nearby doctors based on location
          setDoctors(sampleDoctors);
        },
        (err) => {
          console.error('Error getting location:', err);
          setError('Unable to get your location. Please enable location services.');
          // Still show doctors list even without location
          setDoctors(sampleDoctors);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setDoctors(sampleDoctors);
    }
  }, []);

  // Get directions using Google Maps
  const getDirections = (doctor) => {
    const destination = `${doctor.lat},${doctor.lng}`;
    let url = '';
    
    if (userLocation) {
      const origin = `${userLocation.lat},${userLocation.lng}`;
      url = `https://www.google.com/maps/dir/${origin}/${destination}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${doctor.lat},${doctor.lng}`;
    }
    
    window.open(url, '_blank');
  };

  // Emergency button handler
  const handleEmergency = async () => {
    try {
      let currentLocation = userLocation;
      
      // Get current location if not available
      if (!currentLocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(currentLocation);
      }

      // Prepare location message for WhatsApp
      const whatsappNumber = '9391042596';
      const googleMapsLink = `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
      const locationText = `🚨 EMERGENCY ALERT 🚨\n\nI need immediate medical assistance!\n\n📍 My Location:\n${googleMapsLink}\n\nCoordinates: ${currentLocation.lat}, ${currentLocation.lng}\n\nPlease send help immediately!`;
      
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(locationText)}`;
      
      // Show confirmation dialog
      const confirmed = window.confirm(
        '🚨 EMERGENCY ALERT 🚨\n\n' +
        'This will:\n' +
        '1. Call 108 (Emergency Services)\n' +
        '2. Share your location via WhatsApp\n\n' +
        'Click OK to proceed.'
      );

      if (confirmed) {
        // Open WhatsApp first (so user can send the message)
        window.open(whatsappUrl, '_blank');
        
        // Then initiate call to 108
        // Small delay to allow WhatsApp to open
        setTimeout(() => {
          window.location.href = 'tel:108';
        }, 500);
      }
    } catch (error) {
      console.error('Error in emergency handler:', error);
      // Fallback: Just open WhatsApp with manual location sharing
      const whatsappNumber = '9391042596';
      const fallbackText = '🚨 EMERGENCY! I need help. Please share your location manually.';
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(fallbackText)}`;
      window.open(whatsappUrl, '_blank');
      window.location.href = 'tel:108';
      
      alert('Emergency call initiated. Please share your location manually via WhatsApp if needed.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Emergency Button - Always Visible */}
      <div className="card shadow-lg border-0">
        <div className="card-body text-center p-4">
          <button
            onClick={handleEmergency}
            className="btn btn-danger btn-lg w-100"
            style={{
              fontSize: '1.5rem',
              padding: '20px',
              borderRadius: '15px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(220, 53, 69, 0.4)',
              animation: 'pulse 2s infinite'
            }}
          >
            🚨 EMERGENCY 🚨
            <br />
            <small style={{ fontSize: '0.9rem', display: 'block', marginTop: '5px' }}>
              Call 108 & Share Location
            </small>
          </button>
          <p className="text-muted mt-3 mb-0">
            <small>Clicking this will call 108 and share your location via WhatsApp</small>
          </p>
        </div>
      </div>

      {/* Location Status */}
      {error && (
        <div className="alert alert-warning">
          <small>{error}</small>
        </div>
      )}

      {userLocation && (
        <div className="alert alert-success">
          <small>✅ Location detected: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</small>
        </div>
      )}

      {/* Doctors List */}
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <h5 className="card-title mb-0">🏥 Nearby Doctors & Hospitals</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="list-group">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{doctor.name}</h6>
                      <p className="mb-1 text-muted">
                        <small>{doctor.specialty}</small>
                      </p>
                      <p className="mb-1">
                        <small>📍 {doctor.address}</small>
                      </p>
                      <div className="d-flex gap-3 mt-2">
                        <small className="text-muted">📞 {doctor.phone}</small>
                        <small className="text-muted">📏 {doctor.distance}</small>
                        <small className="text-warning">⭐ {doctor.rating}</small>
                      </div>
                    </div>
                    <div className="ms-3">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => getDirections(doctor)}
                      >
                        🗺️ Directions
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {doctors.length === 0 && !loading && (
            <div className="text-center py-4 text-muted">
              <p>No doctors found nearby.</p>
              <p className="small">Please enable location services to find nearby healthcare providers.</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="alert alert-info">
        <h6 className="alert-heading">ℹ️ How it works:</h6>
        <ul className="mb-0 small">
          <li><strong>Emergency Button:</strong> Calls 108 (Emergency Services) and automatically shares your location via WhatsApp to the emergency contact.</li>
          <li><strong>Directions:</strong> Click "Directions" to open Google Maps with navigation to the selected doctor/hospital.</li>
          <li><strong>Location:</strong> Your location is used to calculate distances and provide accurate directions.</li>
        </ul>
      </div>

      {/* Add CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 6px 20px rgba(220, 53, 69, 0.6);
          }
        }
      `}</style>
    </div>
  );
};

export default NearbyDoctors;

