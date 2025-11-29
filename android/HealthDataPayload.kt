package com.example.healthdemo.network

/**
 * Combined Health Data Payload
 * 
 * This payload structure allows sending multiple health metrics
 * (steps, heartRate) in a single API request.
 */
data class HealthDataPayload(
    val userId: String,
    val steps: Long,
    val heartRate: Long?,   // nullable if no HR data
    val timestamp: Long     // System.currentTimeMillis()
)

