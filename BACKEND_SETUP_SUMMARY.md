# Backend Setup Summary

## Technology Stack

✅ **Node.js with Express** (NOT Firebase)
- Framework: Express.js
- Language: JavaScript (ES Modules)
- Port: 5000 (default, configurable)

## Backend URL Configuration

### Current Configuration

**Android App** (`android/RetrofitClient.kt`):
```kotlin
private const val BASE_URL = "http://192.168.1.10:3000/"
```
⚠️ **Note**: Currently set to port 3000, but backend defaults to 5000

**Website** (`src/utils/healthDataService.js`):
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### Recommended Configuration

1. **Set backend to port 3000** (to match Android app):
   - Create `backend/.env`:
     ```env
     PORT=3000
     ```

2. **Or update Android app to port 5000**:
   - Update `android/RetrofitClient.kt`:
     ```kotlin
     private const val BASE_URL = "http://192.168.1.10:5000/"
     ```

## API Endpoints

### For Android App
- **POST** `/api/health` - Store health data
  - Accepts: `{ userId, steps, heartRate?, timestamp }`
  - Returns: `200 OK` (empty body)

### For Website
- **GET** `/api/health-connect/data/:userId` - Get all health data
- **GET** `/api/health-connect/latest/:userId` - Get latest data point
- **GET** `/api/health-connect/stats/:userId` - Get statistics

## Quick Start

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Configure Android App**:
   - Update `android/RetrofitClient.kt` with your IP address
   - Ensure port matches backend

3. **Use in Website**:
   - Import `healthDataService.js`
   - Use provided React component example

## Files Created

1. **`backend/API_DOCUMENTATION.md`** - Complete API documentation
2. **`backend/BACKEND_URL_CONFIG.md`** - URL configuration guide
3. **`src/utils/healthDataService.js`** - Website service to fetch health data
4. **`src/components/HealthDataDisplay.js`** - Example React component

## Next Steps

1. Update backend port to match Android app (or vice versa)
2. Set `REACT_APP_API_URL` in website `.env` file
3. Test endpoints with provided examples
4. Integrate `HealthDataDisplay` component into your dashboard

