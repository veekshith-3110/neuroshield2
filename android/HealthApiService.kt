package com.example.healthdemo.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

/**
 * Health API Service
 * 
 * Interface for sending health data to the backend.
 * Matches the backend route: POST /api/health
 */
interface HealthApiService {
    /**
     * Send health data payload to backend
     * 
     * @param body HealthDataPayload containing userId, steps, heartRate, and timestamp
     * @return Response<Unit> - Empty response on success (200 OK)
     */
    @POST("api/health")
    suspend fun sendHealthData(
        @Body body: HealthDataPayload
    ): Response<Unit>
}

