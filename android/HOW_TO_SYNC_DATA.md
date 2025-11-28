# How to Sync Health Data from Android to Backend

## Step-by-Step Guide

### Step 1: Update User ID ✅ (Already Done)
The `MainActivityExample.kt` is now configured to use `"log"` as the userId.

### Step 2: Ensure Backend is Running
Make sure your backend server is running:
```bash
cd backend
node server.js
```

You should see:
```
🚀 Backend server listening on http://0.0.0.0:5000
```

### Step 3: Configure Android App

#### 3.1. Update Backend URL
In `RetrofitClient.kt`, ensure the URL matches your computer's IP:
```kotlin
private const val BASE_URL = "http://192.168.10.65:5000/"
```

#### 3.2. Add Dependencies
Make sure your `build.gradle` (Module: app) includes:
```gradle
dependencies {
    // Health Connect
    implementation "androidx.health.connect:connect-client:1.1.0"
    
    // Retrofit + Gson
    implementation "com.squareup.retrofit2:retrofit:2.9.0"
    implementation "com.squareup.retrofit2:converter-gson:2.9.0"
    
    // Coroutines
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3"
}
```

#### 3.3. Add Permissions
In `AndroidManifest.xml`, add:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.health.READ_STEPS" />
<uses-permission android:name="android.permission.health.READ_HEART_RATE" />

<application>
    <provider
        android:name="androidx.startup.InitializationProvider"
        android:authorities="${applicationId}.androidx-startup"
        android:exported="false"
        tools:node="merge">
        <meta-data
            android:name="androidx.health.HealthConnectClientInitializer"
            android:value="androidx.startup" />
    </provider>
</application>
```

### Step 4: Install Health Connect App
1. Open Google Play Store on your Android device
2. Search for "Health Connect"
3. Install the official Health Connect app by Google
4. Open Health Connect and set it up
5. Connect Google Fit (if you use it) to sync data to Health Connect

### Step 5: Build and Run Your Android App

1. **Open your Android project** in Android Studio
2. **Copy the files** from `android/` folder to your app:
   - `HealthConnectManager.kt`
   - `HealthDataPayload.kt`
   - `HealthApiService.kt`
   - `RetrofitClient.kt`
   - Update `MainActivity.kt` with code from `MainActivityExample.kt`

3. **Build the app:**
   ```bash
   ./gradlew assembleDebug
   ```

4. **Install on device:**
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

### Step 6: Grant Permissions

When you run the app:
1. The app will request Health Connect permissions
2. Tap **"Allow"** to grant access to Steps and Heart Rate
3. The app will automatically read and send data to the backend

### Step 7: Verify Data Sync

#### Check Android Logs:
```bash
adb logcat | grep -E "HealthConnect|MainActivity"
```

Look for:
- `✅ All permissions granted`
- `✅ Sent health data successfully`
- `Reading health data for user: log`

#### Check Backend:
```bash
# Check if data was received
curl "http://localhost:5000/api/health?userId=log"

# Or check latest data
curl "http://localhost:5000/api/health/latest?userId=log"

# Check statistics
curl "http://localhost:5000/api/health/stats?userId=log"
```

### Step 8: Manual Sync (Optional)

If you want to manually trigger a sync, add a button in your UI:

```kotlin
@Composable
fun HealthConnectScreen(
    healthManager: HealthConnectManager,
    onRequestPermissions: () -> Unit
) {
    Column {
        Button(onClick = {
            lifecycleScope.launch {
                try {
                    healthManager.readAndSendToServer("log")
                    // Show success message
                } catch (e: Exception) {
                    // Show error message
                }
            }
        }) {
            Text("Sync Health Data")
        }
    }
}
```

## Troubleshooting

### ❌ "Health Connect is not available"
- Install Health Connect app from Play Store
- Update Health Connect to latest version

### ❌ "Permission denied"
- Go to Android Settings → Apps → Health Connect → Permissions
- Grant Steps and Heart Rate permissions
- Or re-run the app and grant permissions when prompted

### ❌ "Failed to send health data"
- Check if backend is running: `curl http://localhost:5000/api/health-check`
- Verify IP address in `RetrofitClient.kt` matches your computer's IP
- Ensure Android device and computer are on same Wi-Fi network
- Check Android logs for network errors

### ❌ "No data available"
- Open Health Connect app
- Check if Google Fit is connected
- Verify you have steps/heart rate data in Health Connect
- Make sure you've walked or exercised to generate data

### ❌ "Connection refused"
- Check Windows Firewall allows port 5000
- Verify backend is running
- Check IP address is correct

## Quick Test

Test the connection manually:

```bash
# From your computer, test if backend receives data:
curl -X POST http://localhost:5000/api/health \
  -H "Content-Type: application/json" \
  -d '{"userId":"log","steps":5000,"heartRate":75,"timestamp":1732900000000}'

# Then check:
curl "http://localhost:5000/api/health?userId=log"
```

If this works, the backend is ready. The issue is likely in the Android app configuration or network connection.

## Expected Flow

1. **App starts** → Checks if Health Connect is available
2. **Requests permissions** → User grants Steps + Heart Rate access
3. **Reads data** → Gets today's steps and latest heart rate from Health Connect
4. **Sends to backend** → POST to `http://192.168.10.65:5000/api/health`
5. **Backend stores** → Data saved with userId "log"
6. **Website can fetch** → GET `/api/health?userId=log`

## Success Indicators

✅ Android Logcat shows: `✅ Sent health data successfully`  
✅ Backend console shows: `✅ Received health data for log:`  
✅ Backend API returns data: `curl "http://localhost:5000/api/health?userId=log"`

