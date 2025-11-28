// backend/server.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from '@google/generative-ai';
import oauthSecurity from './oauthSecurity.js';

dotenv.config();

const app = express();

// CORS and body parser - MUST be before security headers and routes
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle all OPTIONS requests globally
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  res.sendStatus(204);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// OAuth 2.0 Security: Apply security headers middleware (after CORS)
app.use(oauthSecurity.securityHeaders);

const PORT = process.env.PORT || 5000;

// In-memory store: { [userId]: [ { userId, steps, heartRate, timestamp } ] }
const healthDataStore = {};

// In-memory user store: { [identifier]: { email, phone, name, password, id, provider } }
const userStore = {};

// Helper: ensure array for a user
function ensureUser(userId) {
  if (!healthDataStore[userId]) {
    healthDataStore[userId] = [];
  }
}

// POST /api/health  (called by Android app)
app.post("/api/health", (req, res) => {
  const { userId, steps, heartRate, timestamp } = req.body || {};

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  if (typeof steps !== "number") {
    return res.status(400).json({ error: "steps must be a number" });
  }
  // heartRate can be null or number
  if (heartRate !== null && heartRate !== undefined && typeof heartRate !== "number") {
    return res.status(400).json({ error: "heartRate must be a number or null" });
  }

  const safeTimestamp = typeof timestamp === "number" ? timestamp : Date.now();

  const entry = {
    userId,
    steps,
    heartRate: heartRate ?? null,
    timestamp: safeTimestamp,
  };

  ensureUser(userId);
  healthDataStore[userId].push(entry);

  console.log(`✅ Received health data for ${userId}:`, entry);

  // Return 200 OK with empty body for Android Response<Unit>
  return res.status(200).send();
});

// GET /api/health?userId=user123  -> all data points for user
app.get("/api/health", (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "userId query param is required" });
  }

  ensureUser(userId);
  return res.json({
    userId,
    count: healthDataStore[userId].length,
    data: healthDataStore[userId],
  });
});

// GET /api/health/latest?userId=user123  -> latest data point
app.get("/api/health/latest", (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "userId query param is required" });
  }

  const list = healthDataStore[userId] || [];
  if (list.length === 0) {
    return res.status(404).json({ error: "No data for this user yet" });
  }

  // sort by timestamp descending
  const latest = [...list].sort((a, b) => b.timestamp - a.timestamp)[0];

  return res.json(latest);
});

// GET /api/health/stats?userId=user123  -> aggregated statistics
app.get("/api/health/stats", (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "userId query param is required" });
  }

  const list = healthDataStore[userId] || [];
  if (list.length === 0) {
    return res.status(404).json({ error: "No data for this user yet" });
  }

  const totalSteps = list.reduce((sum, item) => sum + (item.steps || 0), 0);

  const heartRates = list
    .map((item) => item.heartRate)
    .filter((hr) => typeof hr === "number");

  const avgHeartRate =
    heartRates.length > 0
      ? heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length
      : null;

  const minHeartRate = heartRates.length > 0 ? Math.min(...heartRates) : null;
  const maxHeartRate = heartRates.length > 0 ? Math.max(...heartRates) : null;

  return res.json({
    userId,
    totalEntries: list.length,
    totalSteps,
    avgHeartRate,
    minHeartRate,
    maxHeartRate,
  });
});

// GET /api/health/today?userId=user123  -> today's summary (steps + latest HR)
app.get("/api/health/today", (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "userId query param is required" });
  }

  const list = healthDataStore[userId] || [];
  if (list.length === 0) {
    return res.status(404).json({ error: "No data for this user yet" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();

  const todayData = list.filter((item) => item.timestamp >= todayStart);

  if (todayData.length === 0) {
    return res.status(404).json({ error: "No data for today" });
  }

  const todaySteps = todayData.reduce((sum, item) => sum + (item.steps || 0), 0);

  const todayHeartRates = todayData
    .map((item) => item.heartRate)
    .filter((hr) => typeof hr === "number");

  const latestToday = [...todayData].sort(
    (a, b) => b.timestamp - a.timestamp
  )[0];

  return res.json({
    userId,
    todaySteps,
    latestHeartRate: latestToday.heartRate ?? null,
    latestTimestamp: latestToday.timestamp,
  });
});

// AI Mentor endpoint (already imported GoogleGenerativeAI above)

// Initialize Google Gemini AI client
let geminiClient = null;
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDyMFjskonQ9xdzG8ipui1BcdlfQSdVg4o';
if (apiKey && apiKey !== 'your-gemini-api-key-here') {
  try {
    geminiClient = new GoogleGenerativeAI(apiKey);
    console.log('✅ Google Gemini AI client initialized');
  } catch (error) {
    console.error('❌ Error initializing Gemini client:', error);
  }
}

/**
 * AI Mentor API Endpoint
 * POST /api/mentor
 */
app.post('/api/mentor', async (req, res) => {
  try {
    const { userMessage, avatarType = 'panda', stressLevel = 50 } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }

    // Validate stressLevel
    const validStressLevel = Math.max(0, Math.min(100, Number(stressLevel) || 50));
    const validAvatarType = ['panda', 'fox', 'robot', 'fairy'].includes(avatarType) ? avatarType : 'panda';

    // Avatar personalities
    const avatarPersonalities = {
      panda: {
        name: 'Chill Panda',
        emoji: '🐼',
        style: 'super chill, laid-back, uses "dude" and "bro" sometimes, very supportive'
      },
      fox: {
        name: 'Focus Fox',
        emoji: '🦊',
        style: 'energetic, motivational, uses "let\'s go!" and "you got this!", action-oriented'
      },
      robot: {
        name: 'Zen Robot',
        emoji: '🤖',
        style: 'calm, logical, uses "analyzing" and "processing", very methodical but kind'
      },
      fairy: {
        name: 'Soft-girl Fairy',
        emoji: '✨',
        style: 'gentle, caring, uses "beautiful" and "sweetie", very nurturing and supportive'
      }
    };

    const personality = avatarPersonalities[validAvatarType] || avatarPersonalities.panda;

    // System prompt for Gen Z style mentor
    const systemPrompt = `You are ${personality.name} ${personality.emoji}, a Gen Z style wellness mentor.

Your personality: ${personality.style}

Guidelines:
- Give GENTLE reminders (not harsh or judgmental)
- Give sincere, specific compliments
- Suggest short breaks when stress level is high (${validStressLevel}% currently)
- Use emojis sparingly (1-2 per message max)
- Stay kind, non-judgy, and supportive
- Keep replies SHORT (1-3 sentences max)
- If stressLevel is high (>70), prioritize break suggestions and reassurance
- If stressLevel is low (<40), give encouragement and celebrate wins
- Use Gen Z language naturally but not excessively
- Be authentic and caring

Current stress level: ${stressLevel}%
User message: "${userMessage}"

Respond as ${personality.name} would, keeping it brief and supportive.`;

    // If Gemini AI is available, use it
    if (geminiClient) {
      const modelsToTry = [
        'gemini-3-pro-preview',
        'gemini-2.5-pro',
        'gemini-2.5-flash'
      ];
      
      for (const modelName of modelsToTry) {
        try {
          const model = geminiClient.getGenerativeModel({ model: modelName });
          const fullPrompt = `${systemPrompt}\n\nUser message: "${userMessage}"`;
          const result = await model.generateContent(fullPrompt);
          const response = await result.response;
          const reply = response.text();
          return res.json({ reply, model: modelName });
        } catch (geminiError) {
          if (geminiError.message && (
            geminiError.message.includes('quota') || 
            geminiError.message.includes('429') ||
            geminiError.message.includes('billing')
          )) {
            continue;
          } else {
            continue;
          }
        }
      }
    }

    // Fallback responses
    const fallbackResponses = {
      panda: [
        "Hey dude, I hear you 🐼 Take a deep breath and remember you're doing your best!",
        "That sounds tough, but you've got this! Maybe take a quick break? 🐼",
        "I'm here for you! Let's tackle this one step at a time 🐼"
      ],
      fox: [
        "Let's go! You've got this! 🦊 Take a quick break and come back stronger!",
        "I believe in you! 🦊 You're capable of handling this!",
        "Time for a power break! 🦊 You'll feel so much better after!"
      ],
      robot: [
        "Analyzing situation... Processing support... You are doing well 🤖",
        "Recommendation: Take a 5-minute break. Your productivity will increase 🤖",
        "Status: You are valued and capable 🤖 Continue with confidence"
      ],
      fairy: [
        "Oh sweetie, you're doing amazing! ✨ Take care of yourself, okay?",
        "Beautiful, you deserve a break! ✨ Come back when you're ready!",
        "You're so strong! ✨ Remember to be kind to yourself today!"
      ]
    };

    const responses = fallbackResponses[validAvatarType] || fallbackResponses.panda;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return res.json({ reply: randomResponse });
  } catch (error) {
    console.error('Error in /api/mentor:', error);
    res.status(500).json({ error: 'AI mentor error' });
  }
});

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// Rate limiting middleware wrapper
const rateLimitMiddleware = (req, res, next) => {
  const identifier = req.body?.identifier || req.ip;
  const check = oauthSecurity.checkRateLimit(identifier);
  if (!check.allowed) {
    return res.status(429).json({ error: check.message });
  }
  next();
};

// POST /api/auth/login
app.post('/api/auth/login', rateLimitMiddleware, (req, res) => {
  try {
    const { identifier, password } = req.body;
    const identifierShort = identifier ? (identifier.length > 20 ? identifier.substring(0, 20) + '...' : identifier) : 'none';
    console.log(`🔐 [LOGIN] ${identifierShort}`);

    if (!identifier || !password) {
      console.log(`   ❌ Missing credentials`);
      return res.status(400).json({ error: 'Email/phone and password are required' });
    }

    // Find user by email or phone
    const user = Object.values(userStore).find(u => 
      (u.email && u.email === identifier) || (u.phone && u.phone === identifier)
    );

    if (!user) {
      console.log(`   ❌ User not found`);
      return res.status(401).json({ error: 'Invalid email/phone or password. Please sign up first.' });
    }

    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
      console.log(`   ❌ Invalid password`);
      return res.status(401).json({ error: 'Invalid email/phone or password' });
    }

    console.log(`   ✅ Success (User: ${user.id})`);

    // Generate JWT token
    const token = oauthSecurity.generateAccessToken({
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name
    });

    const responseData = {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        provider: user.provider
      }
    };
    
    res.json(responseData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Handle OPTIONS preflight requests for signup
app.options('/api/auth/signup', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

// Handle OPTIONS preflight requests for signup
app.options('/api/auth/signup', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

// POST /api/auth/signup
app.post('/api/auth/signup', rateLimitMiddleware, (req, res) => {
  try {
    const { identifier, password, name } = req.body;
    const identifierShort = identifier ? (identifier.length > 20 ? identifier.substring(0, 20) + '...' : identifier) : 'none';

    if (!identifier || !password || !name) {
      console.log(`📝 [SIGNUP] ${identifierShort} - ❌ Missing fields`);
      return res.status(400).json({ error: 'Email/phone, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = Object.values(userStore).find(u => 
      u.email === identifier || u.phone === identifier
    );

    if (existingUser) {
      console.log(`📝 [SIGNUP] ${identifierShort} - ❌ Already exists`);
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create new user
    const isEmail = identifier.includes('@');
    const userId = Date.now().toString();
    
    const newUser = {
      id: userId,
      email: isEmail ? identifier : null,
      phone: !isEmail ? identifier : null,
      name,
      password, // In production, hash this with bcrypt
      provider: isEmail ? 'email' : 'phone'
    };

    userStore[userId] = newUser;
    
    console.log(`📝 [SIGNUP] ${identifierShort} - ✅ Created (ID: ${userId})`);

    // Generate JWT token
    const token = oauthSecurity.generateAccessToken({
      id: newUser.id,
      email: newUser.email,
      phone: newUser.phone,
      name: newUser.name
    });

    const responseData = {
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        name: newUser.name,
        provider: newUser.provider
      }
    };
    
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Handle OPTIONS preflight requests
app.options('/api/auth/google', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

// POST /api/auth/google
app.post('/api/auth/google', rateLimitMiddleware, (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    // Decode Google JWT (simple base64 decode for now)
    let payload;
    try {
      const parts = credential.split('.');
      if (parts.length !== 3) {
        return res.status(400).json({ error: 'Invalid Google credential format' });
      }
      payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      // Check expiration
      if (Date.now() >= payload.exp * 1000) {
        return res.status(400).json({ error: 'Google credential expired' });
      }
    } catch (decodeError) {
      console.error('Error decoding Google credential:', decodeError);
      return res.status(400).json({ error: 'Invalid Google credential' });
    }

    // Check if user exists
    let user = Object.values(userStore).find(u => u.email === payload.email);

    if (!user) {
      // Create new user
      const userId = payload.sub || Date.now().toString();
      user = {
        id: userId,
        email: payload.email,
        name: payload.name || payload.given_name || payload.email.split('@')[0],
        picture: payload.picture,
        provider: 'google'
      };
      userStore[userId] = user;
    }

    // Generate JWT token
    const token = oauthSecurity.generateAccessToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        provider: user.provider
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google login failed' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Neuroshield Backend API',
    server: 'Neuroshield Backend',
    version: '1.0.0',
    endpoints: {
      healthCheck: '/api/health-check',
      login: '/api/auth/login',
      signup: '/api/auth/signup',
      health: '/api/health',
      mentor: '/api/mentor'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health-check', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!geminiClient,
    timestamp: new Date().toISOString(),
    server: 'Neuroshield Backend',
    version: '1.0.0'
  });
});

// Global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('\n❌ [ERROR] Uncaught Exception:', error.message);
  // Don't exit - log and continue
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ [ERROR] Unhandled Rejection:', reason);
  // Don't exit - log and continue
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error(`❌ [ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  console.log(`⚠️  [404] ${req.method} ${req.path} - Not found`);
  res.status(404).json({ 
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  // Clear screen and show startup info
  console.clear();
  console.log('═'.repeat(60));
  console.log('🛡️  NEUROSHIELD BACKEND SERVER');
  console.log('═'.repeat(60));
  console.log(`\n🚀 Server Status: RUNNING`);
  console.log(`📍 Listening on: http://0.0.0.0:${PORT}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   GET  /                          - API information`);
  console.log(`   GET  /api/health-check          - Health check`);
  console.log(`   POST /api/health               - Store health data (Android)`);
  console.log(`   GET  /api/health?userId=xxx     - Get health data`);
  console.log(`   GET  /api/health/latest         - Get latest health data`);
  console.log(`   GET  /api/health/stats          - Get health statistics`);
  console.log(`   GET  /api/health/today         - Get today's data`);
  console.log(`   POST /api/auth/login           - User login`);
  console.log(`   POST /api/auth/signup           - User signup`);
  console.log(`   POST /api/auth/google          - Google OAuth login`);
  console.log(`   POST /api/mentor               - AI Mentor chat`);
  console.log(`\n✅ Server started successfully!`);
  console.log(`\n💡 Tip: Use mouse wheel or Page Up/Down to scroll`);
  console.log('═'.repeat(60));
  console.log('\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
