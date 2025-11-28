# Neuroshield Backend Server

Backend server for AI Mentor Avatar feature using OpenAI API.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   PORT=5000
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### POST /api/mentor

Get AI mentor response based on user message and stress level.

**Request:**
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

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "openaiConfigured": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Getting Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Copy the key and add it to your `.env` file
5. The API key will look like: `AIzaSy...`

## Notes

- The server will work without Gemini API key, but will use fallback responses
- Fallback responses are still Gen Z style and context-aware
- Google Gemini API has generous free tier limits
- Monitor your usage in Google AI Studio dashboard

