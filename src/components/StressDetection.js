import React, { useRef, useEffect, useState } from 'react';
import { loadFaceApiModels, isFaceApiReady } from '../utils/faceApiLoader';
import { loadFaceApiScript } from '../utils/loadFaceApiScript';

const StressDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stressLevel, setStressLevel] = useState({ level: 'Initializing...', status: 'Loading Face API...', color: '#333' });
  const [isDetecting, setIsDetecting] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeModels = async () => {
      try {
        setStressLevel({ level: 'Loading...', status: 'Loading Face API script...', color: '#333' });
        
        // Load the script first
        await loadFaceApiScript();

        if (!mounted) return;

        // Load models using shared loader
        setStressLevel({ level: 'Loading...', status: 'Loading models from CDN...', color: '#333' });
        const result = await loadFaceApiModels();

        if (mounted) {
          if (result.success) {
            setModelsLoaded(true);
            setStressLevel({ level: 'Ready', status: 'Click Start to begin detection', color: '#333' });
          } else {
            setStressLevel({
              level: 'Error',
              status: result.error || 'Failed to load models. Please download from: https://github.com/justadudewhohacks/face-api.js-models',
              color: 'red'
            });
          }
        }
      } catch (error) {
        console.error('Error initializing Stress Detection:', error);
        if (mounted) {
          setStressLevel({
            level: 'Error',
            status: error.message || 'Failed to initialize. Please refresh the page.',
            color: 'red'
          });
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
      setStressLevel({
        level: 'Error',
        status: 'Models not loaded yet. Please wait...',
        color: 'red'
      });
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
        setStressLevel({
          level: 'Error',
          status: 'Camera access denied. Please allow camera permissions.',
          color: 'red'
        });
      });
  };

  useEffect(() => {
    if (!modelsLoaded || !isDetecting || !videoRef.current || !window.faceapi) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const faceapi = window.faceapi;

    if (!canvas || !video) return;

    // Set canvas size to match video
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

    const detectStress = async () => {
      try {
        if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (detections.length > 0) {
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

            const expr = detections[0].expressions;
            const stress = calculateStressLevel(expr);
            setStressLevel(stress);
          } else {
            setStressLevel({
              level: 'No Face',
              status: 'Please stay visible in front of camera',
              color: '#666'
            });
          }
        }
      } catch (error) {
        console.error('Error during face detection:', error);
        // Don't show error to user, just log it
      }
    };

    const interval = setInterval(detectStress, 500);

    return () => clearInterval(interval);
  }, [modelsLoaded, isDetecting]);

  const calculateStressLevel = (expressions) => {
    let stressScore =
      expressions.angry * 3 +
      expressions.fearful * 2.5 +
      expressions.sad * 2 +
      expressions.disgusted * 1.5 +
      expressions.neutral * 1;

    if (stressScore > 2.5) {
      return { level: 'High', status: '⚠️ Highly Stressed', color: 'red', score: stressScore };
    } else if (stressScore > 1.5) {
      return { level: 'Moderate', status: '😟 Moderate Stress', color: 'orange', score: stressScore };
    } else {
      return { level: 'Low', status: '😊 Relaxed', color: 'green', score: stressScore };
    }
  };

  const stopDetection = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsDetecting(false);
    setStressLevel({ level: 'Stopped', status: 'Detection stopped', color: '#333' });
  };

  return (
    <div className="card shadow-lg mb-4">
      <div className="card-header bg-danger text-white">
        <h5 className="card-title mb-0">😟 Face-Based Stress Level Detection</h5>
      </div>
      <div className="card-body">
        <div className="text-center mb-3">
          <div
            className="alert"
            style={{
              backgroundColor: stressLevel.color === 'red' ? '#f8d7da' :
                              stressLevel.color === 'orange' ? '#fff3cd' :
                              stressLevel.color === 'green' ? '#d1e7dd' : '#e2e3e5',
              color: stressLevel.color === 'red' ? '#721c24' :
                     stressLevel.color === 'orange' ? '#856404' :
                     stressLevel.color === 'green' ? '#0f5132' : '#383d41',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}
          >
            Stress Level: {stressLevel.level} - {stressLevel.status}
          </div>
        </div>

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
              transform: 'scaleX(-1)' // Mirror the video for better UX
            }}
            onLoadedMetadata={(e) => {
              // Ensure canvas matches video dimensions
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
              transform: 'scaleX(-1)' // Mirror the canvas to match video
            }}
          />
        </div>

        {!isDetecting && modelsLoaded && (
          <div className="text-center mt-3">
            <button className="btn btn-primary btn-lg" onClick={startVideo}>
              Start Stress Detection
            </button>
          </div>
        )}

        {!modelsLoaded && stressLevel.level !== 'Error' && (
          <div className="text-center mt-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading models...</span>
            </div>
            <p className="mt-2">Loading Face API models...</p>
            <p className="text-muted small mt-1">This may take a minute on first load</p>
          </div>
        )}

        {isDetecting && (
          <div className="text-center mt-3">
            <button className="btn btn-danger btn-lg" onClick={stopDetection}>
              Stop Detection
            </button>
          </div>
        )}

        <div className="alert alert-info mt-3">
          <small>
            <strong>Note:</strong> This feature uses your camera to detect facial expressions and estimate stress levels. 
            Make sure you have good lighting and your face is clearly visible.
          </small>
        </div>

        {stressLevel.level === 'Error' && stressLevel.status.includes('Models') && (
          <div className="alert alert-warning mt-3">
            <strong>⚠️ Setup Required:</strong>
            <p className="mb-2 mt-2">To use stress detection, download Face API models:</p>
            <ol className="mb-2 ps-3">
              <li className="mb-1">Run <code className="bg-light p-1 rounded">.\download-models.ps1</code> in PowerShell from project root</li>
              <li className="mb-1">Or download from{' '}
                <a href="https://github.com/justadudewhohacks/face-api.js-models" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>{' '}
                and place in <code>/public/models</code>
              </li>
              <li>Refresh this page after downloading</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default StressDetection;
