/**
 * Dynamically load Face API.js script if not already loaded
 */

let scriptLoadingPromise = null;
let scriptLoaded = false;

export const loadFaceApiScript = () => {
  // If already loaded, return immediately
  if (scriptLoaded && window.faceapi) {
    return Promise.resolve(true);
  }

  // If currently loading, return the existing promise
  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  // Check if script tag already exists
  const existingScript = document.querySelector('script[src*="face-api"]');
  if (existingScript) {
    // Script tag exists, wait for it to load
    scriptLoadingPromise = new Promise((resolve, reject) => {
      let retries = 0;
      const checkInterval = setInterval(() => {
        retries++;
        if (window.faceapi) {
          clearInterval(checkInterval);
          scriptLoaded = true;
          scriptLoadingPromise = null;
          resolve(true);
        } else if (retries > 100) {
          clearInterval(checkInterval);
          scriptLoadingPromise = null;
          reject(new Error('Face API script failed to load'));
        }
      }, 100);
    });
    return scriptLoadingPromise;
  }

  // Load script dynamically
  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
    script.async = true;
    script.defer = false;

    script.onload = () => {
      // Wait a bit for faceapi to be available
      let retries = 0;
      const checkInterval = setInterval(() => {
        retries++;
        if (window.faceapi) {
          clearInterval(checkInterval);
          scriptLoaded = true;
          scriptLoadingPromise = null;
          console.log('✅ Face API.js loaded successfully');
          resolve(true);
        } else if (retries > 50) {
          clearInterval(checkInterval);
          scriptLoadingPromise = null;
          reject(new Error('Face API loaded but window.faceapi not available'));
        }
      }, 100);
    };

    script.onerror = () => {
      scriptLoadingPromise = null;
      console.error('❌ Failed to load Face API.js script');
      reject(new Error('Failed to load Face API.js from CDN'));
    };

    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
};

export const isFaceApiScriptLoaded = () => {
  return scriptLoaded && window.faceapi;
};

