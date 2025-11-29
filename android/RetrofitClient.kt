package com.example.healthdemo.network

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    // Backend URL - Updated with your actual IP address
    // Must end with a slash
    // Backend runs on port 5000 by default
    private const val BASE_URL = "http://192.168.10.65:5000/"
    // Your laptop IP on same Wi-Fi network

    val api: HealthApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(HealthApiService::class.java)
    }
}

