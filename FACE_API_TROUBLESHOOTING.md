# Face API Troubleshooting Guide

## Current Status

The application now includes:
1. **Dynamic Script Loader** - Loads Face API.js script automatically
2. **Shared Model Loader** - Loads models once, reuses across components
3. **Debug Component** - Shows detailed loading status
4. **Multiple CDN Fallbacks** - Tries 3 different CDN sources

## How to Test

1. **Open the app** and navigate to Dashboard
2. **Click "Stress Detection" or "Anti-Doze"**
3. **Check the Debug Info card** at the top - it shows:
   - Script loading status
   - Model loading status
   - Detailed logs
   - Test values

## Common Issues & Solutions

### Issue 1: "Face API library not loaded"

**Solution:**
- Check browser console (F12) for errors
- The script should load automatically from CDN
- If it fails, check your internet connection
- Try refreshing the page

### Issue 2: "Models could not be loaded"

**Solution:**
- Models will try to load from CDN automatically
- If CDN fails, you can download models locally:
  - Run: `.\download-models.ps1` (if it works)
  - Or manually download from: https://github.com/justadudewhohacks/face-api.js-models
  - Place files in `public/models/` directory

### Issue 3: Camera not working

**Solution:**
- Allow camera permissions in browser
- Use HTTPS or localhost (required for camera API)
- Check browser settings

### Issue 4: Detection not working

**Solution:**
- Ensure good lighting
- Face camera directly
- Remove glasses if possible
- Check that face is clearly visible

## Debug Information

The debug component shows:
- ✅ Script loading status
- ✅ Model loading status  
- ✅ Detailed console logs
- ✅ Test values for troubleshooting

## Next Steps

1. **Check Debug Info** - Look at the debug card when opening Stress Detection or Anti-Doze
2. **Check Console** - Open browser DevTools (F12) and check Console tab
3. **Check Network** - In DevTools Network tab, look for failed requests
4. **Report Issues** - Note what the debug component shows

---

**The debug component will help identify exactly where the issue is!**

