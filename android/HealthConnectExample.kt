/**
 * Complete Android Health Connect Integration Example
 * 
 * This file demonstrates how to integrate Health Connect with Retrofit
 * to send health data to the Neuroshield backend.
 */

package com.example.neuroshield

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.*
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import java.time.Instant
import java.time.temporal.ChronoUnit

// ============================================================================
// Retrofit API Interface
// ============================================================================

import com.example.healthdemo.network.HealthDataPayload
import com.example.healthdemo.network.HealthApiService
import com.example.healthdemo.network.RetrofitClient

// Use HealthApiService for the main endpoint
// HealthConnectApi is kept for backward compatibility with /api/health-connect endpoints

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
    val record: HealthRecord?
)

data class HealthRecord(
    val id: String,
    val userId: String,
    val dataType: String,
    val value: Double,
    val unit: String,
    val timestamp: String
)

// ============================================================================
// Retrofit Client
// ============================================================================

// RetrofitClient is now in a separate file: android/RetrofitClient.kt
// Import it: import com.example.healthdemo.network.RetrofitClient

// ============================================================================
// Health Data Sync Service
// ============================================================================

class HealthDataSyncService(
    private val healthConnectClient: HealthConnectClient,
    private val userId: String
) {
    // Use HealthApiService for the main endpoint
    private val api = RetrofitClient.api
    
    /**
     * Sync steps data from Health Connect to backend
     */
    suspend fun syncSteps() = withContext(Dispatchers.IO) {
        try {
            val startTime = Instant.now().minus(1, ChronoUnit.DAYS)
            val endTime = Instant.now()
            
            val request = ReadRecordsRequest(
                StepsRecord::class,
                timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
            )
            
            val response = healthConnectClient.readRecords(request)
            val totalSteps = response.records.sumOf { it.count }
            
            val healthData = HealthDataRequest(
                userId = userId,
                dataType = "steps",
                value = totalSteps.toDouble(),
                timestamp = Instant.now().toString(),
                unit = "count"
            )
            
            val apiResponse = api.sendHealthData(healthData)
            
            if (apiResponse.isSuccessful) {
                println("✅ Steps synced: $totalSteps")
            } else {
                println("❌ Failed to sync steps: ${apiResponse.message()}")
            }
        } catch (e: Exception) {
            println("❌ Error syncing steps: ${e.message}")
        }
    }
    
    /**
     * Sync heart rate data
     */
    suspend fun syncHeartRate() = withContext(Dispatchers.IO) {
        try {
            val startTime = Instant.now().minus(1, ChronoUnit.DAYS)
            val endTime = Instant.now()
            
            val request = ReadRecordsRequest(
                HeartRateRecord::class,
                timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
            )
            
            val response = healthConnectClient.readRecords(request)
            
            response.records.forEach { record ->
                val healthData = HealthDataRequest(
                    userId = userId,
                    dataType = "heart_rate",
                    value = record.bpm.toDouble(),
                    timestamp = record.time.toString(),
                    unit = "bpm"
                )
                
                api.sendHealthData(healthData)
            }
            
            println("✅ Heart rate synced: ${response.records.size} readings")
        } catch (e: Exception) {
            println("❌ Error syncing heart rate: ${e.message}")
        }
    }
    
    /**
     * Sync sleep data
     */
    suspend fun syncSleep() = withContext(Dispatchers.IO) {
        try {
            val startTime = Instant.now().minus(1, ChronoUnit.DAYS)
            val endTime = Instant.now()
            
            val request = ReadRecordsRequest(
                SleepSessionRecord::class,
                timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
            )
            
            val response = healthConnectClient.readRecords(request)
            
            response.records.forEach { session ->
                val durationHours = ChronoUnit.HOURS.between(
                    session.startTime,
                    session.endTime
                ).toDouble()
                
                val healthData = HealthDataRequest(
                    userId = userId,
                    dataType = "sleep",
                    value = durationHours,
                    timestamp = session.startTime.toString(),
                    unit = "hours"
                )
                
                api.sendHealthData(healthData)
            }
            
            println("✅ Sleep synced: ${response.records.size} sessions")
        } catch (e: Exception) {
            println("❌ Error syncing sleep: ${e.message}")
        }
    }
    
    /**
     * Sync weight data
     */
    suspend fun syncWeight() = withContext(Dispatchers.IO) {
        try {
            val startTime = Instant.now().minus(30, ChronoUnit.DAYS)
            val endTime = Instant.now()
            
            val request = ReadRecordsRequest(
                WeightRecord::class,
                timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
            )
            
            val response = healthConnectClient.readRecords(request)
            
            response.records.forEach { record ->
                val healthData = HealthDataRequest(
                    userId = userId,
                    dataType = "weight",
                    value = record.weight.inKilograms,
                    timestamp = record.time.toString(),
                    unit = "kg"
                )
                
                api.sendHealthData(healthData)
            }
            
            println("✅ Weight synced: ${response.records.size} records")
        } catch (e: Exception) {
            println("❌ Error syncing weight: ${e.message}")
        }
    }
    
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
            
            // Use HealthApiService (POST /api/health)
            val apiResponse = api.sendHealthData(payload)
            
            if (apiResponse.isSuccessful) {
                println("✅ Combined health data synced: steps=$totalSteps, heartRate=$heartRate")
            } else {
                println("❌ Failed to sync combined data: ${apiResponse.message()}")
            }
        } catch (e: Exception) {
            println("❌ Error syncing combined health data: ${e.message}")
        }
    }
    
    /**
     * Sync all health data types
     */
    suspend fun syncAllHealthData() {
        // Use combined sync for steps and heart rate
        syncStepsAndHeartRate()
        // Then sync other data types individually
        syncSleep()
        syncWeight()
        // Add more sync methods as needed
    }
}

// ============================================================================
// Usage Example in Activity
// ============================================================================

/*
class MainActivity : AppCompatActivity() {
    private lateinit var healthConnectClient: HealthConnectClient
    private lateinit var syncService: HealthDataSyncService
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Initialize Health Connect
        healthConnectClient = HealthConnectClient.getOrCreate(this)
        
        // Get user ID from your auth system
        val userId = getUserId()
        syncService = HealthDataSyncService(healthConnectClient, userId)
        
        // Sync button
        findViewById<Button>(R.id.syncButton).setOnClickListener {
            lifecycleScope.launch {
                syncService.syncAllHealthData()
            }
        }
    }
    
    private fun getUserId(): String {
        // Return your user ID from authentication
        return "user123"
    }
}
*/

