import React, { useRef, useEffect, useState } from 'react';
import { loadFaceApiModels, isFaceApiReady } from '../utils/faceApiLoader';
import { loadFaceApiScript } from '../utils/loadFaceApiScript';

const AntiDoze = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [ear, setEar] = useState(0);
  const [drowsyCount, setDrowsyCount] = useState(0);
  const [isDrowsy, setIsDrowsy] = useState(false);
  const [alarmPlaying, setAlarmPlaying] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const alarmAudioRef = useRef(null);
  const beepIntervalRef = useRef(null);

  // Eye Aspect Ratio thresholds
  const EYE_AR_THRESH = 0.25; // Eyes closed threshold
  const EYE_AR_CONSEC_FRAMES = 20; // Frames before alarm (about 1 second at 20fps)

  // Calculate Eye Aspect Ratio (EAR)
  const calculateEAR = (eyeLandmarks) => {
    if (!eyeLandmarks || eyeLandmarks.length < 6) return 1.0;

    // Get eye points (6 points per eye in face-api.js)
    const eye = eyeLandmarks.map(p => ({ x: p.x, y: p.y }));

    // Calculate distances
    const A = Math.sqrt(Math.pow(eye[1].x - eye[5].x, 2) + Math.pow(eye[1].y - eye[5].y, 2));
    const B = Math.sqrt(Math.pow(eye[2].x - eye[4].x, 2) + Math.pow(eye[2].y - eye[4].y, 2));
    const C = Math.sqrt(Math.pow(eye[0].x - eye[3].x, 2) + Math.pow(eye[0].y - eye[3].y, 2));

    // EAR formula
    const ear = (A + B) / (2.0 * C);
    return ear;
  };

  // Get eye landmarks from face-api.js landmarks
  const getEyeLandmarks = (landmarks) => {
    // Face-api.js landmark indices for eyes (0-67)
    // Left eye: 36-41, Right eye: 42-47
    const leftEyeIndices = [36, 37, 38, 39, 40, 41];
    const rightEyeIndices = [42, 43, 44, 45, 46, 47];

    const leftEye = leftEyeIndices.map(i => landmarks.positions[i]);
    const rightEye = rightEyeIndices.map(i => landmarks.positions[i]);

    return { leftEye, rightEye };
  };

  // Play alarm sound (looping continuously until eyes open)
  const playAlarm = () => {
    // Always try to play sound when wake-up text appears
    console.log('🔊 Attempting to play wake-up sound...');
    
    if (alarmAudioRef.current) {
      // Set volume (0.0 to 1.0) - loud enough to wake user
      alarmAudioRef.current.volume = 0.9;
      // Ensure loop is enabled - will play continuously
      alarmAudioRef.current.loop = true;
      
      // Check if audio is already playing
      if (!alarmAudioRef.current.paused && !alarmAudioRef.current.ended) {
        // Audio is already playing - ensure state is updated
        if (!alarmPlaying) {
          setAlarmPlaying(true);
        }
        console.log('✅ Alarm sound already playing');
        return;
      }
      
      // Play or resume the alarm
      try {
        // Reset to beginning to ensure it plays from start
        alarmAudioRef.current.currentTime = 0;
        const playPromise = alarmAudioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('✅ Wake-up alarm sound playing (looping continuously)');
              setAlarmPlaying(true);
            })
            .catch(err => {
              // Ignore "interrupted by pause" errors - this is normal when stopping
              if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
                console.error('Error playing alarm file:', err);
                console.log('⚠️ Falling back to system beep...');
              }
              // Fallback: Use browser notification
              if (Notification.permission === 'granted') {
                new Notification('⚠️ WAKE UP!', {
                  body: 'You appear to be drowsy. Please open your eyes!',
                  icon: '/logo192.png',
                  requireInteraction: true
                });
              } else if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    new Notification('⚠️ WAKE UP!', {
                      body: 'You appear to be drowsy. Please open your eyes!',
                      icon: '/logo192.png',
                      requireInteraction: true
                    });
                  }
                });
              }
              // Try to play a system beep as last resort
              playSystemBeep();
            });
        }
      } catch (error) {
        // Handle any synchronous errors
        console.error('Error attempting to play alarm:', error);
        console.log('⚠️ Falling back to system beep...');
        playSystemBeep();
      }
    } else {
      // No audio file, use system beep immediately
      console.log('⚠️ No audio file found, using system beep...');
      playSystemBeep();
    }
  };

  // System beep fallback (looping continuously until eyes open)
  const playSystemBeep = () => {
    try {
      // Clear any existing interval first
      if (beepIntervalRef.current) {
        clearInterval(beepIntervalRef.current);
        beepIntervalRef.current = null;
      }

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      const playBeep = () => {
        // Only play if still drowsy
        if (!isDrowsy) {
          return;
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 1000; // Higher pitch for more attention
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.7, audioContext.currentTime); // Louder
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      };
      
      // Play beep immediately
      playBeep();
      
      // Continue beeping every 300ms (faster, more urgent beeping)
      beepIntervalRef.current = setInterval(() => {
        if (isDrowsy) {
          playBeep();
        } else {
          // Stop beeping if eyes are open
          if (beepIntervalRef.current) {
            clearInterval(beepIntervalRef.current);
            beepIntervalRef.current = null;
          }
        }
      }, 300);
      
      setAlarmPlaying(true);
      console.log('✅ System beep alarm started (beeping continuously until eyes open)');
    } catch (beepError) {
      console.error('Could not play system beep:', beepError);
    }
  };

  // Stop alarm (called when eyes open)
  const stopAlarm = () => {
    console.log('🛑 Stopping alarm - eyes are open');
    
    if (alarmAudioRef.current) {
      try {
        // Pause the audio
        alarmAudioRef.current.pause();
        // Reset to beginning
        alarmAudioRef.current.currentTime = 0;
        console.log('✅ Audio alarm stopped');
      } catch (error) {
        // Ignore errors when stopping audio
        console.log('Stopping alarm audio');
      }
    }
    
    // Stop system beep if running
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = null;
      console.log('✅ System beep stopped');
    }
    
    setAlarmPlaying(false);
  };

  useEffect(() => {
    let mounted = true;

    const initializeModels = async () => {
      try {
        setLoadingStatus('Loading Face API script...');
        
        // Load the script first
        await loadFaceApiScript();

        if (!mounted) return;

        // Load models using shared loader
        setLoadingStatus('Loading models from CDN...');
        const result = await loadFaceApiModels();

        if (mounted) {
          if (result.success) {
            setModelsLoaded(true);
            setLoadingStatus('Ready');
          } else {
            setLoadingStatus(`Error: ${result.error || 'Failed to load models'}`);
          }
        }
      } catch (error) {
        console.error('Error initializing Anti-Doze:', error);
        if (mounted) {
          setLoadingStatus(`Error: ${error.message || 'Failed to initialize'}`);
        }
      }
    };

    initializeModels();

    return () => {
      mounted = false;
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startVideo = () => {
    if (!isFaceApiReady() && !modelsLoaded) {
      alert('Models not loaded yet. Please wait...');
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsDetecting(true);
        }
      })
      .catch((err) => {
        console.error('Error accessing camera:', err);
        alert('Camera access denied. Please allow camera permissions.');
      });
  };

  useEffect(() => {
    if (!modelsLoaded || !isDetecting || !videoRef.current || !window.faceapi) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const faceapi = window.faceapi;

    if (!canvas || !video) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const displaySize = {
      width: video.videoWidth || video.width || 640,
      height: video.videoHeight || video.height || 480
    };

    try {
      faceapi.matchDimensions(canvas, displaySize);
    } catch (error) {
      console.error('Error matching dimensions:', error);
      return;
    }

    const detectDrowsiness = async () => {
      try {
        if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();

          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (detections.length > 0) {
            const detection = detections[0];
            const resizedDetections = faceapi.resizeResults([detection], displaySize);
            
            // Draw face detection box
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

            // Get eye landmarks
            const landmarks = detection.landmarks;
            if (!landmarks || !landmarks.positions) {
              return;
            }

            const { leftEye, rightEye } = getEyeLandmarks(landmarks);

            // Calculate EAR for both eyes
            const leftEAR = calculateEAR(leftEye);
            const rightEAR = calculateEAR(rightEye);
            const avgEAR = (leftEAR + rightEAR) / 2.0;

            setEar(avgEAR);

            // Draw eyes on canvas
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            
            // Draw left eye
            ctx.beginPath();
            ctx.moveTo(leftEye[0].x, leftEye[0].y);
            for (let i = 1; i < leftEye.length; i++) {
              ctx.lineTo(leftEye[i].x, leftEye[i].y);
            }
            ctx.closePath();
            ctx.stroke();

            // Draw right eye
            ctx.beginPath();
            ctx.moveTo(rightEye[0].x, rightEye[0].y);
            for (let i = 1; i < rightEye.length; i++) {
              ctx.lineTo(rightEye[i].x, rightEye[i].y);
            }
            ctx.closePath();
            ctx.stroke();

            // Check for drowsiness
            if (avgEAR < EYE_AR_THRESH) {
              setDrowsyCount(prev => {
                const newCount = prev + 1;
                if (newCount >= EYE_AR_CONSEC_FRAMES) {
                  setIsDrowsy(true);
                  // Start/continue alarm loop - will keep playing until eyes open
                  // Play sound immediately when wake-up text appears
                  playAlarm();
                }
                return newCount;
              });
            } else {
              // Eyes are open - reset counter and stop alarm immediately
              setDrowsyCount(0);
              setIsDrowsy(false);
              stopAlarm();
            }
          } else {
            setEar(0);
            setDrowsyCount(0);
            setIsDrowsy(false);
            stopAlarm();
          }
        }
      } catch (error) {
        console.error('Error during drowsiness detection:', error);
      }
    };

    const interval = setInterval(detectDrowsiness, 50); // ~20fps

    return () => clearInterval(interval);
  }, [modelsLoaded, isDetecting]);

  // Ensure alarm plays immediately when wake-up text appears and continues until eyes open
  useEffect(() => {
    if (isDrowsy) {
      // When wake-up text "⚠️ WAKE UP!!! You appear to be drowsy!" appears, immediately play sound
      console.log('⚠️ Drowsiness detected - playing wake-up sound continuously until eyes open...');
      playAlarm();
      
      // Set up interval to ensure sound keeps playing while drowsy
      const keepAliveInterval = setInterval(() => {
        if (isDrowsy) {
          // Ensure audio is still playing
          if (alarmAudioRef.current) {
            if (alarmAudioRef.current.paused || alarmAudioRef.current.ended) {
              console.log('🔊 Restarting alarm sound...');
              alarmAudioRef.current.currentTime = 0;
              alarmAudioRef.current.play().catch(err => {
                console.log('Error restarting alarm, using system beep:', err);
                playSystemBeep();
              });
            }
          } else {
            // No audio file, ensure system beep is playing
            if (!beepIntervalRef.current) {
              playSystemBeep();
            }
          }
        } else {
          // Eyes opened, clear interval
          clearInterval(keepAliveInterval);
        }
      }, 1000); // Check every second to ensure sound is playing

      return () => {
        clearInterval(keepAliveInterval);
      };
    } else {
      // Eyes are open - stop all alarms immediately
      console.log('✅ Eyes opened - stopping alarm...');
      stopAlarm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrowsy]);

  const stopDetection = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsDetecting(false);
    setIsDrowsy(false);
    setDrowsyCount(0);
    stopAlarm();
  };

  return (
    <div className="card shadow-lg mb-4">
      <div className="card-header bg-warning text-dark">
        <h5 className="card-title mb-0">😴 Anti-Doze Drowsiness Detection</h5>
      </div>
      <div className="card-body">
        {/* Status Display */}
        <div className="text-center mb-3">
          <div
            className={`alert ${isDrowsy ? 'alert-danger' : ear > 0 ? 'alert-success' : 'alert-secondary'}`}
            style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
          >
            {isDrowsy ? (
              <>⚠️ WAKE UP!!! You appear to be drowsy!</>
            ) : ear > 0 ? (
              <>✅ Eyes Open - Alert! (EAR: {ear.toFixed(2)})</>
            ) : (
              <>👁️ Ready to detect drowsiness</>
            )}
          </div>
        </div>

        {/* Video and Canvas */}
        <div className="position-relative d-inline-block mx-auto" style={{ display: 'block', maxWidth: '100%' }}>
          <video
            ref={videoRef}
            width="640"
            height="480"
            autoPlay
            muted
            playsInline
            className="img-fluid rounded"
            style={{
              display: isDetecting ? 'block' : 'none',
              maxWidth: '100%',
              height: 'auto',
              transform: 'scaleX(-1)'
            }}
            onLoadedMetadata={(e) => {
              if (canvasRef.current) {
                canvasRef.current.width = e.target.videoWidth || 640;
                canvasRef.current.height = e.target.videoHeight || 480;
              }
            }}
          />
          <canvas
            ref={canvasRef}
            className="position-absolute top-0 start-0"
            style={{
              pointerEvents: 'none',
              maxWidth: '100%',
              height: 'auto',
              transform: 'scaleX(-1)'
            }}
          />
        </div>

        {/* Controls */}
        {!isDetecting && modelsLoaded && (
          <div className="text-center mt-3">
            <button className="btn btn-warning btn-lg" onClick={startVideo}>
              Start Anti-Doze Detection
            </button>
          </div>
        )}

        {!modelsLoaded && (
          <div className="text-center mt-3">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading models...</span>
            </div>
            <p className="mt-2">{loadingStatus}</p>
            {loadingStatus.includes('Error') && (
              <p className="text-danger small mt-2">
                Please download models using: <code>.\download-models.ps1</code>
              </p>
            )}
          </div>
        )}

        {isDetecting && (
          <div className="text-center mt-3">
            <button className="btn btn-danger btn-lg" onClick={stopDetection}>
              Stop Detection
            </button>
          </div>
        )}

        {/* Stats */}
        {isDetecting && (
          <div className="row mt-3">
            <div className="col-md-6">
              <div className="card bg-light">
                <div className="card-body text-center">
                  <h6>Eye Aspect Ratio (EAR)</h6>
                  <h4 className={ear < EYE_AR_THRESH ? 'text-danger' : 'text-success'}>
                    {ear.toFixed(3)}
                  </h4>
                  <small className="text-muted">Threshold: {EYE_AR_THRESH}</small>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card bg-light">
                <div className="card-body text-center">
                  <h6>Drowsy Frames</h6>
                  <h4 className={drowsyCount >= EYE_AR_CONSEC_FRAMES ? 'text-danger' : 'text-warning'}>
                    {drowsyCount} / {EYE_AR_CONSEC_FRAMES}
                  </h4>
                  <small className="text-muted">Alarm triggers at {EYE_AR_CONSEC_FRAMES}</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="alert alert-info mt-3">
          <small>
            <strong>How it works:</strong> This system monitors your Eye Aspect Ratio (EAR) in real-time. 
            When your eyes are closed for too long, an alarm will sound. Perfect for studying, driving, or any activity 
            where staying alert is important.
          </small>
        </div>

        {/* Hidden audio element for alarm - loops continuously when drowsy */}
        <audio
          ref={alarmAudioRef}
          loop
          preload="auto"
          onError={(e) => {
            console.log('Alarm audio file not found. Will use system beep as fallback.');
            console.log('Please ensure an alarm sound file (alarm.mp3, alarm.wav, or wakeup.mp3) is in the public folder.');
          }}
          onEnded={() => {
            // If audio ends (shouldn't happen with loop, but just in case), restart it if still drowsy
            if (isDrowsy && alarmAudioRef.current) {
              alarmAudioRef.current.play().catch(err => {
                console.log('Error restarting alarm:', err);
                playSystemBeep();
              });
            }
          }}
          onPause={() => {
            // If alarm is paused but user is still drowsy, restart it
            if (isDrowsy && alarmAudioRef.current && !alarmAudioRef.current.ended) {
              alarmAudioRef.current.play().catch(err => {
                console.log('Error resuming alarm:', err);
                playSystemBeep();
              });
            }
          }}
        >
          <source src="/alarm.mp3" type="audio/mpeg" />
          <source src="/alarm.wav" type="audio/wav" />
          <source src="/wakeup.mp3" type="audio/mpeg" />
          <source src="/wakeup.wav" type="audio/wav" />
        </audio>
        
        {/* Visual alarm indicator - shows when alarm is playing */}
        {isDrowsy && alarmPlaying && (
          <div className="alert alert-danger mt-3 text-center" style={{ 
            animation: 'pulse 1s infinite',
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}>
            <strong>🔊 ALARM PLAYING - WAKE UP!</strong>
            <p className="mb-0 mt-2">Open your eyes to stop the alarm</p>
            <p className="mb-0 small">Alarm will loop continuously until eyes are opened</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AntiDoze;

