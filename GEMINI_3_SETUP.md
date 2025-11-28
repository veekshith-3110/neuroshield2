# How to Activate Gemini 3.0 Pro for AI Mentor

## Current Status

The AI Mentor is configured to **automatically try Gemini 3.0 Pro first**, then fallback to free tier models if needed.

## Model Priority

1. **gemini-3-pro-preview** (Gemini 3.0 Pro) - Requires paid plan
2. **gemini-2.5-pro** (Gemini 2.5 Pro) - Free tier, high quality
3. **gemini-2.5-flash** (Gemini 2.5 Flash) - Free tier, fastest

## How It Works

The server automatically:
- Tries Gemini 3.0 Pro first
- If quota/billing error → Falls back to Gemini 2.5 Pro
- If that fails → Falls back to Gemini 2.5 Flash
- If all fail → Uses intelligent fallback responses

## To Use Gemini 3.0 Pro (Paid Plan Required)

### Option 1: Enable Billing in Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Enable billing for the project
4. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
5. Your API key will automatically have access to paid models

### Option 2: Check Your Current Plan

1. Visit [Google AI Studio Usage](https://ai.dev/usage?tab=rate-limit)
2. Check your current quota and limits
3. If you see "Free Tier", you'll need to upgrade for Gemini 3.0

## Current Configuration

The server code in `backend/server.js` is already set up to:
- ✅ Try Gemini 3.0 Pro first
- ✅ Automatically fallback to free tier models
- ✅ Provide intelligent responses regardless

## Testing

To test which model is being used:

```bash
curl -X POST http://localhost:5000/api/mentor \
  -H "Content-Type: application/json" \
  -d '{"userMessage":"test","avatarType":"panda","stressLevel":50}'
```

The response will include a `model` field showing which model was used.

## Free Tier Models (Always Available)

- **gemini-2.5-flash**: Fastest, great for quick responses
- **gemini-2.5-pro**: More advanced, better for complex queries

Both provide excellent quality for wellness mentoring!

## Notes

- Gemini 3.0 Pro requires a paid Google Cloud account
- Free tier models (2.5 Flash/Pro) work excellently for this use case
- The system automatically uses the best available model
- No code changes needed - it's already configured!

