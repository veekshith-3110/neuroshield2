# Anti-Doze Drowsiness Detection Setup

## Overview

The Anti-Doze feature monitors your eye aspect ratio (EAR) in real-time to detect drowsiness. When your eyes are closed for too long, an alarm will trigger to wake you up.

## Features

- ✅ Real-time eye detection using Face API.js
- ✅ Eye Aspect Ratio (EAR) calculation
- ✅ Visual and audio alarms when drowsiness detected
- ✅ Real-time statistics display
- ✅ Perfect for studying, driving, or any activity requiring alertness

## How It Works

### Eye Aspect Ratio (EAR)

The system calculates EAR using the formula:
```
EAR = (A + B) / (2.0 * C)
```

Where:
- A = vertical distance between eye points 1 and 5
- B = vertical distance between eye points 2 and 4
- C = horizontal distance between eye points 0 and 3

### Detection Logic

1. **Threshold**: EAR < 0.25 indicates eyes are closed
2. **Consecutive Frames**: Alarm triggers after 20 consecutive frames (~1 second at 20fps)
3. **Alarm**: Audio alarm plays and visual warning appears

## Setup

### 1. Face API Models

The Anti-Doze feature uses the same Face API models as Stress Detection:
- `tiny_face_detector_model` (for face detection)
- `face_landmark_68_model` (for eye landmark detection)

If you've already set up Stress Detection, models are already loaded!

If not, download models:
```powershell
.\download-models.ps1
```

### 2. Alarm Sound (Optional)

For audio alarms, add an alarm sound file:

1. Download or create an alarm sound (WAV or MP3)
2. Name it `alarm.wav` or `alarm.mp3`
3. Place in `/public` directory

**Free alarm sounds:**
- https://freesound.org
- https://www.zapsplat.com

**Note**: If no alarm file is found, the system will use browser notifications instead.

## Usage

1. Navigate to Dashboard
2. Click the **"Anti-Doze"** icon (😴)
3. Click **"Start Anti-Doze Detection"**
4. Allow camera permissions
5. Position your face in front of the camera
6. The system will monitor your eyes in real-time

## Statistics Display

While detecting, you'll see:

- **Eye Aspect Ratio (EAR)**: Current EAR value
  - Green: Eyes open (EAR > 0.25)
  - Red: Eyes closed (EAR < 0.25)

- **Drowsy Frames**: Count of consecutive frames with closed eyes
  - Yellow: Building up to alarm threshold
  - Red: Alarm triggered (≥ 20 frames)

## Customization

You can adjust thresholds in `src/components/AntiDoze.js`:

```javascript
const EYE_AR_THRESH = 0.25;        // Lower = more sensitive
const EYE_AR_CONSEC_FRAMES = 20;   // Higher = longer before alarm
```

## Browser Requirements

- **Camera access**: Required
- **HTTPS or localhost**: Required for camera API
- **Modern browser**: Chrome, Firefox, Edge, Safari
- **Notification permission**: Recommended for fallback alarms

## Troubleshooting

### "Models not loaded" Error

- Ensure Face API models are downloaded (same as Stress Detection)
- Check browser console for errors
- Refresh the page

### "Camera access denied" Error

- Grant camera permissions in browser settings
- Use HTTPS or localhost
- Check browser settings

### Alarm Not Playing

- Add `alarm.wav` or `alarm.mp3` to `/public` directory
- Check browser console for audio errors
- System will use browser notifications as fallback

### Detection Not Working

- Ensure good lighting
- Face camera directly
- Remove glasses if possible (may affect detection)
- Check that face is clearly visible

## Integration

The Anti-Doze component is integrated into the Dashboard:
- Located in navigation menu (😴 icon)
- Uses Bootstrap styling
- Works alongside other wellness features

## Privacy & Security

- ✅ All processing happens in browser (no server)
- ✅ Video stream never leaves your device
- ✅ No data is stored or transmitted
- ✅ Camera can be stopped anytime

---

**Anti-Doze detection is ready to use!** Perfect for staying alert during long study sessions or work. 😴➡️😊

