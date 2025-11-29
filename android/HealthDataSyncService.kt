package com.example.healthdemo

import android.content.Context
import android.util.Log
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.time.TimeRangeFilter
import com.example.healthdemo.network.HealthDataPayload
import com.example.healthdemo.network.RetrofitClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit

/**
 * Health Data Sync Service
 * 
 * Syncs health data from Health Connect to the backend API
 * using the combined payload format via POST /api/health
 */
class HealthDataSyncService(
    private val context: Context,
    private val healthConnectManager: HealthConnectManager,
    private val userId: String
) {
    private val api = RetrofitClient.api
    private val TAG = "HealthDataSyncService"
    
    // Access HealthConnectClient through the manager
    private val healthConnectClient: HealthConnectClient
        get() = healthConnectManager.client

    /**
     * Request Health Connect permissions
     * Call this before syncing data
     */
    suspend fun requestPermissions() {
        healthConnectManager.requestPermissions()
    }

    /**
     * Check if Health Connect permissions are granted
     */
    suspend fun hasPermissions(): Boolean {
        return healthConnectManager.hasPermissions()
    }

    /**
     * Sync steps and heart rate together using combined payload
     * This is more efficient than sending separate requests
     */
    suspend fun syncStepsAndHeartRate() = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Starting health data sync for user: $userId")

            // Check if Health Connect is available
            if (!healthConnectManager.isHealthConnectAvailable()) {
                throw IllegalStateException("Health Connect is not available on this device")
            }

            // Check permissions first
            if (!hasPermissions()) {
                Log.w(TAG, "Permissions not granted. Requesting...")
                requestPermissions()
                // Wait a bit for permissions to be granted
                kotlinx.coroutines.delay(1000)
                
                // Check again after requesting
                if (!hasPermissions()) {
                    throw SecurityException("Health Connect permissions not granted")
                }
            }

            val timestamp = System.currentTimeMillis()
            val endTime = Instant.now()
            val startTime = endTime.minus(1, ChronoUnit.DAYS)

            Log.d(TAG, "Reading health data from $startTime to $endTime")

            // Read steps
            val totalSteps = readSteps(startTime, endTime)
            Log.d(TAG, "Total steps read: $totalSteps")

            // Read heart rate (latest reading)
            val heartRate = readLatestHeartRate(startTime, endTime)
            if (heartRate != null) {
                Log.d(TAG, "Latest heart rate: $heartRate bpm")
            } else {
                Log.d(TAG, "No heart rate data available")
            }

            // Create payload
            val payload = HealthDataPayload(
                userId = userId,
                steps = totalSteps,
                heartRate = heartRate,
                timestamp = timestamp
            )

            Log.d(TAG, "Sending health data to backend...")
            val apiResponse = api.sendHealthData(payload)

            if (apiResponse.isSuccessful) {
                Log.i(TAG, "✅ Health data synced successfully: steps=$totalSteps, heartRate=$heartRate")
            } else {
                Log.e(TAG, "❌ Failed to sync health data: ${apiResponse.code()} - ${apiResponse.message()}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error syncing health data: ${e.message}", e)
            throw e
        }
    }

    /**
     * Read steps data from Health Connect
     */
    private suspend fun readSteps(
        startTime: Instant,
        endTime: Instant
    ): Long = withContext(Dispatchers.IO) {
        try {
            val request = ReadRecordsRequest(
                StepsRecord::class,
                timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
            )

            val response = healthConnectClient.readRecords(request)
            val totalSteps = response.records.sumOf { it.count }

            Log.d(TAG, "Read ${response.records.size} step records, total: $totalSteps steps")
            return@withContext totalSteps
        } catch (e: Exception) {
            Log.e(TAG, "Error reading steps: ${e.message}", e)
            throw e
        }
    }

    /**
     * Read latest heart rate from Health Connect
     */
    private suspend fun readLatestHeartRate(
        startTime: Instant,
        endTime: Instant
    ): Long? = withContext(Dispatchers.IO) {
        try {
            val request = ReadRecordsRequest(
                HeartRateRecord::class,
                timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
            )

            val response = healthConnectClient.readRecords(request)

            if (response.records.isEmpty()) {
                Log.d(TAG, "No heart rate records found")
                return@withContext null
            }

            // Get the most recent heart rate reading
            val latestRecord = response.records.maxByOrNull { it.time }
            val heartRate = latestRecord?.bpm?.toLong()

            Log.d(TAG, "Read ${response.records.size} heart rate records, latest: $heartRate bpm")
            return@withContext heartRate
        } catch (e: SecurityException) {
            Log.w(TAG, "Permission denied for heart rate: ${e.message}")
            return@withContext null
        } catch (e: Exception) {
            Log.e(TAG, "Error reading heart rate: ${e.message}", e)
            return@withContext null
        }
    }

    /**
     * Sync health data for a specific time range
     */
    suspend fun syncHealthDataForRange(
        startTime: Instant,
        endTime: Instant
    ) = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Syncing health data for range: $startTime to $endTime")

            val totalSteps = readSteps(startTime, endTime)
            val heartRate = readLatestHeartRate(startTime, endTime)

            val timestamp = System.currentTimeMillis()
            val payload = HealthDataPayload(
                userId = userId,
                steps = totalSteps,
                heartRate = heartRate,
                timestamp = timestamp
            )

            val apiResponse = api.sendHealthData(payload)

            if (apiResponse.isSuccessful) {
                Log.i(TAG, "✅ Health data synced for range: steps=$totalSteps, heartRate=$heartRate")
            } else {
                Log.e(TAG, "❌ Failed to sync health data: ${apiResponse.code()}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error syncing health data for range: ${e.message}", e)
            throw e
        }
    }

    /**
     * Get formatted timestamp for logging
     */
    private fun formatTimestamp(instant: Instant): String {
        val zonedDateTime = ZonedDateTime.ofInstant(instant, ZoneId.systemDefault())
        return zonedDateTime.toString()
    }
}
