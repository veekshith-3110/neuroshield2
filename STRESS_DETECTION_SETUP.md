# Face-Based Stress Detection Setup

## Overview

The application now includes face-based stress level detection using Face API.js. This feature analyzes facial expressions in real-time to estimate stress levels.

## Setup Instructions

### 1. Download Face API Models

The Face API models are required for stress detection to work.

**Download from**: https://github.com/justadudewhohacks/face-api.js-models

**Required Models**:
1. `tiny_face_detector_model-weights_manifest.json` and `tiny_face_detector_model-shard1`
2. `face_landmark_68_model-weights_manifest.json` and `face_landmark_68_model-shard1`
3. `face_expression_model-weights_manifest.json` and `face_expression_model-shard1`

### 2. Place Models in Directory

Place all model files in: `public/models/`

**Directory Structure**:
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

### 3. Quick Download Script

You can download models using this command (if you have wget or curl):

```bash
# Create models directory
mkdir -p public/models

# Download models (example - adjust URLs as needed)
# Visit https://github.com/justadudewhohacks/face-api.js-models
# and download the models folder, then copy files to public/models/
```

## How It Works

### Stress Calculation

The stress level is calculated based on facial expressions:

```javascript
stressScore = 
  angry * 3 +
  fearful * 2.5 +
  sad * 2 +
  disgusted * 1.5 +
  neutral * 1
```

### Stress Levels

- **High Stress** (score > 2.5): ⚠️ Highly Stressed (Red)
- **Moderate Stress** (score > 1.5): 😟 Moderate Stress (Orange)
- **Low Stress** (score ≤ 1.5): 😊 Relaxed (Green)

## Usage

1. **Navigate to Dashboard**
2. **Find "Face-Based Stress Level Detection"** card
3. **Click "Start Stress Detection"**
4. **Allow camera permissions** when prompted
5. **Position face in front of camera**
6. **View real-time stress level** updates

## Features

- ✅ Real-time face detection
- ✅ Facial expression analysis
- ✅ Stress level calculation
- ✅ Visual overlay (face box, landmarks, expressions)
- ✅ Bootstrap-styled UI
- ✅ Start/Stop controls

## Browser Requirements

- **Camera access**: Required for video feed
- **HTTPS or localhost**: Required for camera API
- **Modern browser**: Chrome, Firefox, Edge, Safari

## Troubleshooting

### "Models not found" Error

- ✅ Check models are in `public/models/` directory
- ✅ Verify all 6 model files are present
- ✅ Check file names match exactly
- ✅ Refresh page after adding models

### "Camera access denied" Error

- ✅ Grant camera permissions in browser
- ✅ Check browser settings
- ✅ Use HTTPS or localhost (required for camera)

### Face API Not Loading

- ✅ Check internet connection (CDN script)
- ✅ Check browser console for errors
- ✅ Verify Face API script is in `public/index.html`

### No Face Detected

- ✅ Ensure good lighting
- ✅ Face camera directly
- ✅ Remove obstructions (glasses, masks)
- ✅ Check camera is working

## Integration

The stress detection component is integrated into the Dashboard:
- Located below Screen Time Monitor
- Uses Bootstrap styling
- Works alongside other wellness features

## Privacy & Security

- ✅ All processing happens in browser (no server)
- ✅ Video stream never leaves your device
- ✅ No data is stored or transmitted
- ✅ Camera can be stopped anytime

## Backend Removal

The Express backend (`server.js`) has been removed as requested. The application now uses:
- ✅ EmailJS for email alerts (frontend only)
- ✅ LocalStorage for data storage
- ✅ Default screen time functionality retained

---

**Face-based stress detection is ready to use!** Just download the models and place them in `public/models/` directory. 😊

