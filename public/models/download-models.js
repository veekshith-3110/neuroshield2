// Run this in browser console to download models
// Or use this PowerShell script to download models

const downloadModels = async () => {
  const models = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_expression_model-weights_manifest.json',
    'face_expression_model-shard1'
  ];

  const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/weights/';
  
  for (const model of models) {
    try {
      const response = await fetch(baseUrl + model);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = model;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      console.log(`Downloaded: ${model}`);
    } catch (error) {
      console.error(`Failed to download ${model}:`, error);
    }
  }
};

console.log('Run downloadModels() to download all models');

