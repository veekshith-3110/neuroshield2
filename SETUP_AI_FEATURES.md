# AI Features Setup Guide

This guide will help you set up the AI Mentor Avatar and Digital Doppelganger features.

## 🎯 Features Overview

1. **AI Mentor Avatar** - Gen Z style wellness mentor powered by OpenAI
2. **Digital Doppelganger** - 3D avatar that reflects your energy/stress levels

---

## 1. AI Mentor Avatar Setup

### Step 1: Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Copy the key (it will look like `AIzaSy...`)
5. The key is free to use with generous limits!

### Step 2: Configure Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Add your Gemini API key to `.env`:
   ```env
   GEMINI_API_KEY=AIzaSy-your-actual-key-here
   PORT=5000
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

### Step 3: Update Frontend API URL

The frontend is configured to call `/api/mentor`. Make sure your frontend proxy is set up correctly, or update the API URL in `src/components/AIMentorAvatar.js`:

```javascript
const response = await fetch('http://localhost:5000/api/mentor', {
  // ... rest of config
});
```

### Step 4: Test the AI Mentor

1. Navigate to `/dashboard/ai-mentor` in your app
2. Try sending a message like "I'm feeling stressed"
3. The AI mentor should respond with Gen Z style advice!

---

## 2. Digital Doppelganger Setup

### Step 1: Get Ready Player Me Subdomain

1. Go to [Ready Player Me for Developers](https://readyplayer.me/developers)
2. Sign up for a developer account
3. Create a new app/project
4. Note your subdomain (e.g., `your-app.readyplayer.me`)

### Step 2: Update Avatar Creator URL

In `src/components/DigitalDoppelganger.js`, update the subdomain:

```javascript
const openAvatarCreator = () => {
  const subdomain = 'your-app'; // ⬅️ Change this to your actual subdomain
  const url = `https://${subdomain}.readyplayer.me/avatar?frameApi`;
  // ... rest of code
};
```

### Step 3: Test the 3D Avatar

1. Navigate to `/dashboard/digital-doppelganger`
2. Click **"Create Your Avatar"**
3. Complete the avatar creation in the popup
4. Your avatar will appear and reflect your energy levels!

---

## 3. Connecting Stress Data to Avatars

The components automatically connect to your existing stress/burnout data:

- **AI Mentor**: Uses `stressLevel` from your daily log to provide context-aware responses
- **Digital Doppelganger**: Uses `riskScore` from daily log to calculate energy level (0-1)

The energy level calculation:
```javascript
const stressScore = (riskScore / 10) * 100; // 0-100
const energy = 1 - (stressScore / 100); // 0-1 (inverted)
```

---

## 4. API Documentation

### AI Mentor API

**Endpoint:** `POST /api/mentor`

**Request Body:**
```json
{
  "userMessage": "I'm feeling stressed",
  "avatarType": "panda",
  "stressLevel": 70
}
```

**Response:**
```json
{
  "reply": "Hey dude, that sounds tough 🐼 Maybe take a quick break? You've got this!"
}
```

**Avatar Types:**
- `panda` - Chill Panda 🐼
- `fox` - Focus Fox 🦊
- `robot` - Zen Robot 🤖
- `fairy` - Soft-girl Fairy ✨

---

## 5. Troubleshooting

### AI Mentor not responding?

1. Check if backend server is running: `http://localhost:5000/api/health`
2. Verify Gemini API key is set in `.env`
3. Check browser console for errors
4. If Gemini API fails, fallback responses will be used
5. Verify your API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)

### 3D Avatar not loading?

1. Verify three.js is loading (check browser console)
2. Make sure Ready Player Me subdomain is correct
3. Check that avatar URL is received from Ready Player Me
4. Verify GLTFLoader is available

### Avatar not reflecting energy levels?

1. Check if daily log data exists
2. Verify `riskScore` is being calculated correctly
3. Check browser console for any errors in energy calculation

---

## 6. Cost Considerations

### Google Gemini API Costs

- **Free Tier**: Generous free tier with 60 requests per minute
- **Gemini 1.5 Flash**: Free tier available, very fast responses
- **Gemini 1.5 Pro**: Available for more complex tasks

Google Gemini API has excellent free tier limits, perfect for development and moderate usage. Monitor usage in Google AI Studio dashboard.

### Ready Player Me

- Free tier available for basic usage
- Paid plans for advanced features and higher limits

---

## 7. Next Steps

- Customize avatar personalities in `backend/server.js`
- Add more avatar types
- Enhance 3D avatar animations based on stress levels
- Add voice responses for AI mentor
- Integrate with more stress detection sources

---

## Support

For issues or questions:
- Check the component code comments
- Review API documentation links in the code
- Test with fallback responses first before adding API keys

Happy coding! 🚀

