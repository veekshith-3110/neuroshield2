# Android Health Connect Integration - Quick Start

This directory contains example code for integrating Android Health Connect with the Neuroshield backend.

## Files

- **`build.gradle`** - Dependencies to add to your Android app
- **`AndroidManifest.xml`** - Required permissions and provider configuration
- **`HealthConnectExample.kt`** - Complete Kotlin implementation example
- **`HealthDataPayload.kt`** - Health data payload structure
- **`HealthApiService.kt`** - Retrofit interface for POST /api/health
- **`HealthConnectManager.kt`** - Manager class for Health Connect client and permissions
- **`HealthDataSyncService.kt`** - Service class for syncing health data
- **`RetrofitClient.kt`** - Retrofit client singleton with lazy initialization
- **`MainActivityExample.kt`** - Example Activity showing how to use the services

## Quick Setup

### 1. Add Dependencies

Copy the dependencies from `build.gradle` to your app's `build.gradle` (Module: app).

### 2. Configure Permissions

Copy the permissions from `AndroidManifest.xml` to your app's `AndroidManifest.xml`.

### 3. Update Backend URL

In `RetrofitClient.kt`, update the `BASE_URL`:

```kotlin
private const val BASE_URL = "http://192.168.1.10:3000/" // Your backend URL
```

**Note:** 
- The URL must end with a slash (`/`)
- Use your laptop's local IP address if testing on the same Wi-Fi network
- For production, use your actual server URL

### 4. Get User ID

Replace the `getUserId()` method with your actual user authentication logic.

### 5. Request Permissions

Before reading health data, request permissions:

```kotlin
val healthConnectClient = HealthConnectClient.getOrCreate(context)
val permissions = setOf(
    HealthPermission.getReadPermission(StepsRecord::class),
    HealthPermission.getReadPermission(HeartRateRecord::class),
    // Add more as needed
)
healthConnectClient.permissionController.requestPermissions(permissions)
```

## Usage

### Basic Setup with Permission Launcher (Recommended)

```kotlin
class MainActivity : ComponentActivity() {
    private lateinit var healthManager: HealthConnectManager

    private val permissionsLauncher =
        registerForActivityResult(
            HealthConnectClient.requestPermissionsActivityContract()
        ) { grantedPermissions: Set<String> ->
            val requiredPermissionStrings = healthManager.permissions.map { it.toString() }.toSet()
            val hasAllPermissions = requiredPermissionStrings.all { it in grantedPermissions }

            if (hasAllPermissions) {
                lifecycleScope.launch {
                    healthManager.readAndSendToServer(userId = "user123")
                }
            } else {
                // Show "Permissions required" message
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        healthManager = HealthConnectManager(applicationContext)

        lifecycleScope.launch {
            if (healthManager.isHealthConnectAvailable()) {
                permissionsLauncher.launch(healthManager.permissions)
            } else {
                // Tell user to install/update Health Connect
            }
        }
    }
}
```

### Alternative: Using Sync Service

```kotlin
// Initialize Health Connect Manager
val healthConnectManager = HealthConnectManager(this)

// Initialize Sync Service
val syncService = HealthDataSyncService(
    context = this,
    healthConnectManager = healthConnectManager,
    userId = "user123" // Get from your auth system
)

// Check availability and request permissions
lifecycleScope.launch {
    if (healthConnectManager.isHealthConnectAvailable()) {
        if (!healthConnectManager.hasPermissions()) {
            healthConnectManager.requestPermissions()
        }
    } else {
        // Show message: Health Connect not available
    }
}

// Sync health data
lifecycleScope.launch {
    try {
        syncService.syncStepsAndHeartRate()
    } catch (e: Exception) {
        Log.e("MainActivity", "Error syncing health data: ${e.message}")
    }
}

// Or sync for a specific time range
lifecycleScope.launch {
    val startTime = Instant.now().minus(7, ChronoUnit.DAYS)
    val endTime = Instant.now()
    syncService.syncHealthDataForRange(startTime, endTime)
}

// Read today's steps directly
lifecycleScope.launch {
    val todaySteps = healthConnectManager.readTodaySteps()
    Log.d("MainActivity", "Today's steps: $todaySteps")
}

// Read latest heart rate (from last hour)
lifecycleScope.launch {
    val latestHeartRate = healthConnectManager.readLatestHeartRate()
    if (latestHeartRate != null) {
        Log.d("MainActivity", "Latest heart rate: $latestHeartRate bpm")
    } else {
        Log.d("MainActivity", "No heart rate data available")
    }
}

// Read and send health data to server in one call
lifecycleScope.launch {
    try {
        healthConnectManager.readAndSendToServer("user123")
    } catch (e: Exception) {
        Log.e("MainActivity", "Error: ${e.message}")
    }
}
```

**Note:** `RetrofitClient.api` is accessed internally by `HealthDataSyncService`, so you don't need to pass it explicitly.

## API Endpoint

The Android app sends data to:

- **POST** `/api/health` - Store health data (returns `Response<Unit>`)
  - Accepts `HealthDataPayload` with `userId`, `steps`, `heartRate` (nullable), `timestamp`

## HealthDataPayload Structure

```kotlin
data class HealthDataPayload(
    val userId: String,
    val steps: Long,
    val heartRate: Long?,   // nullable if no HR data
    val timestamp: Long     // System.currentTimeMillis()
)
```

## HealthApiService Interface

```kotlin
interface HealthApiService {
    @POST("api/health")
    suspend fun sendHealthData(
        @Body body: HealthDataPayload
    ): Response<Unit>
}
```

## Alternative Endpoints

The backend also supports:
- **POST** `/api/health-connect/batch` - Alternative batch endpoint
- **GET** `/api/health-connect/data/:userId` - Get user's health data
- **GET** `/api/health-connect/latest/:userId` - Get latest data point
- **GET** `/api/health-connect/stats/:userId` - Get aggregated statistics

See `ANDROID_HEALTH_CONNECT_SETUP.md` in the project root for complete documentation.
