package com.example.healthdemo

import android.content.Context
import android.util.Log
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.ReadRecordsRequest
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
 * Health Connect Manager
 * 
 * Manages Health Connect client initialization and permissions.
 * Provides a centralized way to access Health Connect functionality.
 */
class HealthConnectManager(private val context: Context) {
    private val TAG = "HealthConnectManager"

    val client: HealthConnectClient by lazy {
        HealthConnectClient.getOrCreate(context)
    }

    val permissions = setOf(
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getReadPermission(HeartRateRecord::class)
    )

    /**
     * Check if Health Connect is available on this device
     * 
     * @return true if Health Connect SDK is available, false otherwise
     */
    suspend fun isHealthConnectAvailable(): Boolean = withContext(Dispatchers.IO) {
        return@withContext when (HealthConnectClient.getSdkStatus(context)) {
            HealthConnectClient.SDK_AVAILABLE -> {
                Log.d(TAG, "Health Connect is available")
                true
            }
            HealthConnectClient.SDK_UNAVAILABLE -> {
                Log.w(TAG, "Health Connect SDK is unavailable")
                false
            }
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> {
                Log.w(TAG, "Health Connect requires provider update")
                false
            }
            else -> {
                Log.w(TAG, "Health Connect status unknown")
                false
            }
        }
    }

    /**
     * Check if all required permissions are granted
     * 
     * @return true if all permissions are granted, false otherwise
     */
    suspend fun hasPermissions(): Boolean = withContext(Dispatchers.IO) {
        try {
            val grantedPermissions = client.permissionController
                .getGrantedPermissions(permissions)

            val hasAllPermissions = grantedPermissions.size == permissions.size

            if (hasAllPermissions) {
                Log.d(TAG, "All Health Connect permissions are granted")
            } else {
                Log.d(TAG, "Missing ${permissions.size - grantedPermissions.size} permissions")
            }

            return@withContext hasAllPermissions
        } catch (e: Exception) {
            Log.e(TAG, "Error checking permissions: ${e.message}", e)
            return@withContext false
        }
    }

    /**
     * Request Health Connect permissions
     * 
     * This will show the system permission dialog if permissions are not granted.
     */
    suspend fun requestPermissions() = withContext(Dispatchers.Main) {
        try {
            // Check current permissions first
            val grantedPermissions = client.permissionController
                .getGrantedPermissions(permissions)

            if (grantedPermissions.size == permissions.size) {
                Log.d(TAG, "All permissions already granted")
                return@withContext
            }

            Log.d(TAG, "Requesting Health Connect permissions...")
            client.permissionController.requestPermissions(permissions)
            Log.d(TAG, "Permission request sent")
        } catch (e: Exception) {
            Log.e(TAG, "Error requesting permissions: ${e.message}", e)
            throw e
        }
    }

    /**
     * Get the list of granted permissions
     * 
     * @return Set of granted HealthPermission objects
     */
    suspend fun getGrantedPermissions(): Set<HealthPermission> = withContext(Dispatchers.IO) {
        try {
            return@withContext client.permissionController
                .getGrantedPermissions(permissions)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting granted permissions: ${e.message}", e)
            return@withContext emptySet()
        }
    }

    /**
     * Get the list of missing permissions
     * 
     * @return Set of HealthPermission objects that are not granted
     */
    suspend fun getMissingPermissions(): Set<HealthPermission> = withContext(Dispatchers.IO) {
        try {
            val grantedPermissions = client.permissionController
                .getGrantedPermissions(permissions)
            return@withContext permissions - grantedPermissions
        } catch (e: Exception) {
            Log.e(TAG, "Error getting missing permissions: ${e.message}", e)
            return@withContext permissions
        }
    }

    /**
     * Read today's total steps count
     * 
     * Reads steps from the start of today (00:00:00) to now.
     * 
     * @return Total number of steps taken today, or 0 if no data or error
     */
    suspend fun readTodaySteps(): Long = withContext(Dispatchers.IO) {
        try {
            val nowZoned: ZonedDateTime = ZonedDateTime.now()
            val startOfDay: ZonedDateTime =
                nowZoned.toLocalDate().atStartOfDay(ZoneId.systemDefault())

            val request = ReadRecordsRequest(
                recordType = StepsRecord::class,
                timeRangeFilter = TimeRangeFilter.between(
                    startOfDay.toInstant(),
                    nowZoned.toInstant()
                )
            )

            val response = client.readRecords(request)
            val totalSteps = response.records.sumOf { it.count }

            Log.d(TAG, "Today's steps: $totalSteps (from ${response.records.size} records)")
            return@withContext totalSteps
        } catch (e: SecurityException) {
            Log.w(TAG, "Permission denied for reading steps: ${e.message}")
            return@withContext 0L
        } catch (e: Exception) {
            Log.e(TAG, "Error reading today's steps: ${e.message}", e)
            return@withContext 0L
        }
    }

    /**
     * Read the latest heart rate reading from the last hour
     * 
     * Reads heart rate records from the last hour and returns the most recent reading.
     * 
     * @return Latest heart rate in beats per minute, or null if no data or error
     */
    suspend fun readLatestHeartRate(): Long? = withContext(Dispatchers.IO) {
        try {
            val now: Instant = Instant.now()
            val oneHourAgo: Instant = now.minus(1, ChronoUnit.HOURS)

            val request = ReadRecordsRequest(
                recordType = HeartRateRecord::class,
                timeRangeFilter = TimeRangeFilter.between(
                    oneHourAgo,
                    now
                )
            )

            val response = client.readRecords(request)
            val records = response.records

            if (records.isEmpty()) {
                Log.d(TAG, "No heart rate records found in the last hour")
                return@withContext null
            }

            val latestRecord = records.maxByOrNull { it.endTime } ?: return@withContext null
            val latestSample = latestRecord.samples.maxByOrNull { it.time } ?: return@withContext null

            val heartRate = latestSample.beatsPerMinute.toLong()
            Log.d(TAG, "Latest heart rate: $heartRate bpm (from ${records.size} records)")
            return@withContext heartRate
        } catch (e: SecurityException) {
            Log.w(TAG, "Permission denied for reading heart rate: ${e.message}")
            return@withContext null
        } catch (e: Exception) {
            Log.e(TAG, "Error reading latest heart rate: ${e.message}", e)
            return@withContext null
        }
    }

    /**
     * Read health data and send it to the server
     * 
     * Reads today's steps and latest heart rate, then sends them to the backend
     * in a single HealthDataPayload.
     * 
     * @param userId The user ID to associate with the health data
     */
    suspend fun readAndSendToServer(userId: String) = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Reading health data for user: $userId")

            val steps = readTodaySteps()
            val heartRate = readLatestHeartRate()
            val nowMillis = System.currentTimeMillis()

            val payload = HealthDataPayload(
                userId = userId,
                steps = steps,
                heartRate = heartRate,
                timestamp = nowMillis
            )

            Log.d(TAG, "Sending health data to server: steps=$steps, heartRate=$heartRate")
            val response = RetrofitClient.api.sendHealthData(payload)

            if (response.isSuccessful) {
                Log.d(TAG, "✅ Sent health data successfully: $payload")
            } else {
                val errorBody = try {
                    response.errorBody()?.string()
                } catch (e: Exception) {
                    "Unable to read error body"
                }
                Log.e(
                    TAG,
                    "❌ Failed to send health data. Code=${response.code()} Error=$errorBody"
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error reading/sending health data", e)
            throw e
        }
    }
}

