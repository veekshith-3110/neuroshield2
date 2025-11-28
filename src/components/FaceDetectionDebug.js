/**
 * Debug component to test Face API loading
 * Add this temporarily to see what's happening
 */

import { useEffect, useState } from 'react';
import { loadFaceApiScript } from '../utils/loadFaceApiScript';
import { loadFaceApiModels } from '../utils/faceApiLoader';

const FaceDetectionDebug = () => {
  const [status, setStatus] = useState('Initializing...');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    const test = async () => {
      try {
        addLog('Starting Face API test...');
        addLog(`window.faceapi exists: ${!!window.faceapi}`);
        
        addLog('Loading script...');
        await loadFaceApiScript();
        addLog(`After script load - window.faceapi exists: ${!!window.faceapi}`);
        addLog(`window.faceapi.nets exists: ${!!(window.faceapi && window.faceapi.nets)}`);

        if (window.faceapi && window.faceapi.nets) {
          addLog('Loading models...');
          const result = await loadFaceApiModels();
          if (result.success) {
            addLog('✅ SUCCESS: Models loaded!');
            setStatus('✅ All systems ready!');
          } else {
            addLog(`❌ Model loading failed: ${result.error}`);
            setStatus(`❌ Error: ${result.error}`);
          }
        } else {
          addLog('❌ Face API not available');
          setStatus('❌ Face API not available');
        }
      } catch (error) {
        addLog(`❌ Error: ${error.message}`);
        setStatus(`❌ Error: ${error.message}`);
      }
    };

    test();
  }, []);

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h5>Face API Debug Info</h5>
      </div>
      <div className="card-body">
        <p><strong>Status:</strong> {status}</p>
        <div style={{ maxHeight: '300px', overflowY: 'auto', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          {logs.map((log, i) => (
            <div key={i} style={{ fontSize: '12px', fontFamily: 'monospace' }}>{log}</div>
          ))}
        </div>
        <div className="mt-3">
          <strong>Test Values:</strong>
          <ul>
            <li>window.faceapi: {window.faceapi ? '✅' : '❌'}</li>
            <li>window.faceapi.nets: {window.faceapi?.nets ? '✅' : '❌'}</li>
            <li>Script tag exists: {document.querySelector('script[src*="face-api"]') ? '✅' : '❌'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FaceDetectionDebug;

