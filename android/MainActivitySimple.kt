package com.example.healthdemo

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.health.connect.client.HealthConnectClient
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

/**
 * Simple MainActivity example matching the provided implementation
 * 
 * Note: This uses ComponentActivity (Jetpack Compose). If using AppCompatActivity,
 * see MainActivityExample.kt for a traditional view-based implementation.
 */
class MainActivity : ComponentActivity() {
    private lateinit var healthManager: HealthConnectManager

    private val permissionsLauncher =
        registerForActivityResult(
            HealthConnectClient.requestPermissionsActivityContract()
        ) { grantedPermissions: Set<String> ->
            // Convert HealthPermission objects to strings for comparison
            val requiredPermissionStrings = healthManager.permissions.map { it.toString() }.toSet()
            val hasAllPermissions = requiredPermissionStrings.all { it in grantedPermissions }

            if (hasAllPermissions) {
                lifecycleScope.launch {
                    // Use any string as userId: email, phone, random id, etc.
                    healthManager.readAndSendToServer(userId = "user123")
                }
            } else {
                // Show "Permissions required" message
                // TODO: Show dialog or snackbar
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
                // TODO: Show dialog or snackbar
            }
        }
    }
}

