# Android Health Connect Integration Setup

## Overview

This document explains how to integrate Android Health Connect with the Neuroshield web application. Since this is a React web app, the Android Health Connect API cannot be used directly. Instead, you'll need to create a bridge between an Android app and the web backend.

## Architecture

```
Android Device (Health Connect) 
    ↓
Android App (Native)
    ↓
Backend API (Node.js/Express)
    ↓
React Web App
```

## Android App Setup

### 1. Add Dependencies to Android App

In your Android app's `build.gradle` (Module: app), add:

```gradle
dependencies {
    // Health Connect
    implementation "androidx.health.connect:connect-client:1.1.0"
    
    // Retrofit + Gson for HTTP requests
    implementation "com.squareup.retrofit2:retrofit:2.9.0"
    implementation "com.squareup.retrofit2:converter-gson:2.9.0"
    
    // Coroutines for async operations
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3"
    
    // Additional dependencies
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.6.2'
}
```

### 2. Add Permissions to AndroidManifest.xml

```xml
<uses-permission android:name="android.permission.health.READ_STEPS"/>
<uses-permission android:name="android.permission.health.WRITE_STEPS"/>
<uses-permission android:name="android.permission.health.READ_HEART_RATE"/>
<uses-permission android:name="android.permission.health.READ_SLEEP"/>
<uses-permission android:name="android.permission.health.READ_WEIGHT"/>
<uses-permission android:name="android.permission.health.READ_HEIGHT"/>
<uses-permission android:name="android.permission.health.READ_ACTIVE_CALORIES_BURNED"/>
<uses-permission android:name="android.permission.health.READ_DISTANCE"/>
<uses-permission android:name="android.permission.INTERNET"/>
```

### 3. Request Health Connect Permissions

```kotlin
// Example Kotlin code for requesting permissions
val healthConnectClient = HealthConnectClient.getOrCreate(context)

val permissions = setOf(
    HealthPermission.getReadPermission(Steps::class),
    HealthPermission.getReadPermission(HeartRate::class),
    HealthPermission.getReadPermission(SleepSession::class),
    HealthPermission.getReadPermission(Weight::class),
    HealthPermission.getReadPermission(Height::class)
)

healthConnectClient.permissionController.requestPermissions(permissions)
```

### 4. Create Health Data Payload

Create a new file `HealthDataPayload.kt`:

```kotlin
package com.example.healthdemo.network

data class HealthDataPayload(
    val userId: String,
    val steps: Long,
    val heartRate: Long?,   // nullable if no HR data
    val timestamp: Long     // System.currentTimeMillis()
)
```

### 5. Create Retrofit API Interface

Create a new file `HealthConnectApi.kt`:

```kotlin
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST
import com.example.healthdemo.network.HealthDataPayload

interface HealthConnectApi {
    // Combined payload endpoint (recommended)
    @POST("api/health-connect/batch")
    suspend fun sendHealthDataBatch(@Body payload: HealthDataPayload): Response<HealthDataResponse>
    
    // Individual data endpoint (for backward compatibility)
    @POST("api/health-connect/data")
    suspend fun sendHealthData(@Body data: HealthDataRequest): Response<HealthDataResponse>
}

data class HealthDataRequest(
    val userId: String,
    val dataType: String,
    val value: Double,
    val timestamp: String? = null,
    val unit: String? = null
)

data class HealthDataResponse(
    val success: Boolean,
    val message: String,
    val record: HealthRecord?,
    val records: List<HealthRecord>? = null,  // For batch endpoint
    val count: Int? = null
)

data class HealthRecord(
    val id: String,
    val userId: String,
    val dataType: String,
    val value: Double,
    val unit: String,
    val timestamp: String
)
```

### 6. Initialize Retrofit Client

```kotlin
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import okhttp3.OkHttpClient
import java.util.concurrent.TimeUnit

object RetrofitClient {
    private const val BASE_URL = "http://your-backend-url/" // Replace with your backend URL
    
    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val healthConnectApi: HealthConnectApi = retrofit.create(HealthConnectApi::class.java)
}
```

### 7. Read Health Data and Send to Backend (Combined Payload)

```kotlin
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.Instant
import java.time.temporal.ChronoUnit
import com.example.healthdemo.network.HealthDataPayload

class HealthDataSyncService(
    private val healthConnectClient: HealthConnectClient,
    private val api: HealthConnectApi,
    private val userId: String
) {
    /**
     * Sync steps and heart rate together using combined payload
     * This is more efficient than sending separate requests
     */
    suspend fun syncStepsAndHeartRate() = withContext(Dispatchers.IO) {
        try {
            val timestamp = System.currentTimeMillis()
            val startTime = Instant.now().minus(1, ChronoUnit.DAYS)
            val endTime = Instant.now()
            
            // Read steps
            val stepsRequest = ReadRecordsRequest(
                StepsRecord::class,
                timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
            )
            val stepsResponse = healthConnectClient.readRecords(stepsRequest)
            val totalSteps = stepsResponse.records.sumOf { it.count }
            
            // Read heart rate (latest reading)
            var heartRate: Long? = null
            try {
                val hrRequest = ReadRecordsRequest(
                    HeartRateRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
                val hrResponse = healthConnectClient.readRecords(hrRequest)
                // Get the most recent heart rate reading
                heartRate = hrResponse.records
                    .maxByOrNull { it.time }?.bpm?.toLong()
            } catch (e: Exception) {
                println("⚠️ Heart rate not available: ${e.message}")
            }
            
            // Send combined payload
            val payload = HealthDataPayload(
                userId = userId,
                steps = totalSteps,
                heartRate = heartRate,
                timestamp = timestamp
            )
            
            val apiResponse = api.sendHealthDataBatch(payload)
            
            if (apiResponse.isSuccessful) {
                println("✅ Combined health data synced: steps=$totalSteps, heartRate=$heartRate")
            } else {
                println("❌ Failed to sync combined data: ${apiResponse.message()}")
            }
        } catch (e: Exception) {
            println("❌ Error syncing combined health data: ${e.message}")
        }
    }
}
```

### 8. Usage in Activity/Fragment

```kotlin
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {
    private lateinit var healthConnectClient: HealthConnectClient
    private lateinit var syncService: HealthDataSyncService
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Initialize Health Connect client
        healthConnectClient = HealthConnectClient.getOrCreate(this)
        
        // Initialize sync service (replace with actual user ID)
        val userId = getUserId() // Get from your auth system
        val api = RetrofitClient.healthConnectApi
        syncService = HealthDataSyncService(healthConnectClient, api, userId)
        
        // Sync button click
        findViewById<Button>(R.id.syncButton).setOnClickListener {
            lifecycleScope.launch {
                syncService.syncStepsAndHeartRate()
            }
        }
        
        // Auto-sync periodically (e.g., every hour)
        startPeriodicSync()
    }
    
    private fun startPeriodicSync() {
        lifecycleScope.launch {
            while (true) {
                delay(3600000) // 1 hour
                syncService.syncAllHealthData()
            }
        }
    }
}
```

## Backend API Endpoints

The backend service (`backend/healthConnectService.js`) provides these endpoints:

### POST /api/health-connect/batch (Recommended)
Store combined health data payload from Android device. This endpoint accepts multiple health metrics in a single request.

**Request Body (HealthDataPayload):**
```json
{
  "userId": "user123",
  "steps": 8500,
  "heartRate": 72,
  "timestamp": 1705312200000
}
```

**Note:** `heartRate` is optional (can be `null` if no heart rate data is available).

**Response:**
```json
{
  "success": true,
  "message": "Health data batch stored successfully",
  "records": [
    {
      "id": "1705312200000_steps",
      "userId": "user123",
      "dataType": "steps",
      "value": 8500,
      "unit": "count",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "1705312200000_heart_rate",
      "userId": "user123",
      "dataType": "heart_rate",
      "value": 72,
      "unit": "bpm",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 2
}
```

### POST /api/health-connect/data
Store individual health data record from Android device (for backward compatibility).

**Request Body:**
```json
{
  "userId": "user123",
  "dataType": "steps",
  "value": 8500,
  "timestamp": "2024-01-15T10:30:00Z",
  "unit": "count"
}
```

### GET /api/health-connect/data/:userId
Get health data for a user.

**Query Parameters:**
- `dataType` (optional): Filter by data type (steps, heart_rate, sleep, etc.)
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter
- `limit` (optional): Limit number of results

### GET /api/health-connect/latest/:userId
Get the latest health data point.

**Query Parameters:**
- `dataType` (optional): Filter by data type

### GET /api/health-connect/stats/:userId
Get aggregated health statistics.

**Query Parameters:**
- `dataType` (optional): Filter by data type
- `period` (optional): 'day', 'week', or 'month' (default: 'day')

### DELETE /api/health-connect/data/:userId/:recordId
Delete a specific health data record.

## Supported Data Types

- `steps` - Step count
- `heart_rate` - Heart rate (bpm)
- `sleep` - Sleep duration (hours)
- `weight` - Weight (kg)
- `height` - Height (cm)
- `bmi` - Body Mass Index
- `calories` - Active calories burned
- `distance` - Distance traveled (meters)
- `active_minutes` - Active minutes
- `blood_pressure_systolic` - Systolic blood pressure
- `blood_pressure_diastolic` - Diastolic blood pressure
- `blood_glucose` - Blood glucose level
- `oxygen_saturation` - Oxygen saturation percentage

## Example Files

Complete example code is provided in the `android/` directory:

- `android/build.gradle` - Complete dependency list
- `android/AndroidManifest.xml` - Required permissions and provider setup
- `android/HealthConnectExample.kt` - Full implementation example with Retrofit and Coroutines

## Integration Steps

1. **Set up Android App:**
   - Create a native Android app
   - Copy dependencies from `android/build.gradle` to your app's `build.gradle`
   - Copy permissions from `android/AndroidManifest.xml` to your `AndroidManifest.xml`
   - Use `android/HealthConnectExample.kt` as a reference for implementation
   - Request Health Connect permissions
   - Read health data using Health Connect API
   - Send data to backend API using Retrofit

2. **Backend Setup:**
   - The backend service is already created at `backend/healthConnectService.js`
   - The service is already mounted in `backend/server.js`
   - Make sure your backend server is running on the URL you configure in `RetrofitClient`

3. **Web App Integration:**
   - Create React components to fetch and display health data
   - Use the backend API endpoints (GET `/api/health-connect/data/:userId`, etc.)

## Mounting the Health Connect Service

Add to your `backend/server.js`:

```javascript
const healthConnectService = require('./healthConnectService');

// Mount the health connect routes
app.use('/api/health-connect', healthConnectService);
```

## Testing

You can test the backend API using curl or Postman:

```bash
# Store health data
curl -X POST http://localhost:5000/api/health-connect/data \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "dataType": "steps",
    "value": 8500,
    "unit": "count"
  }'

# Get user's health data
curl http://localhost:5000/api/health-connect/data/test123

# Get latest data
curl http://localhost:5000/api/health-connect/latest/test123?dataType=steps

# Get statistics
curl http://localhost:5000/api/health-connect/stats/test123?period=day
```

## Notes

- Health Connect requires Android 14+ or devices with Health Connect app installed
- The Android app must be installed on the user's device
- Data is sent from Android app to backend, then to web app
- Consider implementing authentication/authorization for API endpoints
- In production, use a proper database instead of in-memory storage

