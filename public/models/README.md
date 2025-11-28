# Face API Models Directory

This directory should contain the Face API model files required for stress detection.

## Required Models

Download the following model files from: https://github.com/justadudewhohacks/face-api.js-models

1. **tiny_face_detector_model-weights_manifest.json** and **tiny_face_detector_model-shard1**
2. **face_landmark_68_model-weights_manifest.json** and **face_landmark_68_model-shard1**
3. **face_expression_model-weights_manifest.json** and **face_expression_model-shard1**

## Quick Setup

### Option 1: Download Models Manually

1. Go to: https://github.com/justadudewhohacks/face-api.js-models
2. Download the models folder
3. Copy the model files to this directory (`public/models/`)

### Option 2: Use CDN (Alternative)

The component can be modified to load models from CDN instead of local files.

## File Structure

```
public/
  models/
    tiny_face_detector_model-weights_manifest.json
    tiny_face_detector_model-shard1
    face_landmark_68_model-weights_manifest.json
    face_landmark_68_model-shard1
    face_expression_model-weights_manifest.json
    face_expression_model-shard1
```

## Note

If models are not found, the stress detection will show an error message. 
Make sure to download and place the models in this directory for the feature to work.

