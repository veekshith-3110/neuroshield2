/**
 * Shared Face API Model Loader
 * Loads models once and reuses them across components
 */

import { loadFaceApiScript } from './loadFaceApiScript';

let modelsLoadingPromise = null;
let modelsLoaded = false;
let modelsError = null;

export const loadFaceApiModels = async () => {
  // If already loaded, return immediately
  if (modelsLoaded) {
    return { success: true };
  }

  // If currently loading, wait for that promise
  if (modelsLoadingPromise) {
    return modelsLoadingPromise;
  }

  // Start loading
  modelsLoadingPromise = (async () => {
    try {
      // First, ensure the script is loaded
      console.log('🔄 Loading Face API script...');
      await loadFaceApiScript();

      // Wait a bit more for face-api.js to be fully available
      let retries = 0;
      while (!window.faceapi && retries < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      if (!window.faceapi) {
        throw new Error('Face API library not available after script load. Please refresh the page.');
      }

      if (!window.faceapi.nets) {
        throw new Error('Face API nets not available. The library may not have loaded correctly.');
      }

      const faceapi = window.faceapi;

      // Model URLs - try multiple sources
      const LOCAL_URL = '/models';
      const CDN_URLS = [
        'https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/weights',
        'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js-models@master/weights',
        'https://unpkg.com/@vladmandic/face-api@latest/model'
      ];

      // Try local models first
      let loaded = false;
      try {
        console.log('🔄 Attempting to load models from local directory...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(LOCAL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(LOCAL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(LOCAL_URL),
        ]);
        console.log('✅ Models loaded from local directory');
        loaded = true;
      } catch (localError) {
        console.log('⚠️ Local models not found, trying CDN...', localError.message);
        
        // Try each CDN URL
        for (let i = 0; i < CDN_URLS.length && !loaded; i++) {
          try {
            console.log(`🔄 Trying CDN ${i + 1}/${CDN_URLS.length}: ${CDN_URLS[i]}`);
            await Promise.all([
              faceapi.nets.tinyFaceDetector.loadFromUri(CDN_URLS[i]),
              faceapi.nets.faceLandmark68Net.loadFromUri(CDN_URLS[i]),
              faceapi.nets.faceExpressionNet.loadFromUri(CDN_URLS[i]),
            ]);
            console.log(`✅ Models loaded from CDN: ${CDN_URLS[i]}`);
            loaded = true;
          } catch (cdnError) {
            console.log(`❌ CDN ${i + 1} failed:`, cdnError.message);
            if (i === CDN_URLS.length - 1) {
              throw new Error('Models could not be loaded from any source. Please download models to /public/models');
            }
          }
        }
      }

      if (!loaded) {
        throw new Error('Failed to load models from all sources');
      }

      modelsLoaded = true;
      modelsLoadingPromise = null;
      return { success: true };
    } catch (error) {
      modelsError = error;
      modelsLoadingPromise = null;
      console.error('❌ Error loading Face API models:', error);
      return { success: false, error: error.message };
    }
  })();

  return modelsLoadingPromise;
};

export const isFaceApiReady = () => {
  return window.faceapi && window.faceapi.nets && modelsLoaded;
};

export const getModelsError = () => modelsError;

