package com.example.healthdemo

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.health.connect.client.HealthConnectClient
import androidx.lifecycle.lifecycleScope
import com.example.healthdemo.ui.theme.HealthDemoTheme
import kotlinx.coroutines.launch

/**
 * MainActivity showing how to use HealthConnectManager with proper permission handling
 */
class MainActivity : ComponentActivity() {
    private val TAG = "MainActivity"

    private lateinit var healthManager: HealthConnectManager

    private val permissionsLauncher =
        registerForActivityResult(
            HealthConnectClient.requestPermissionsActivityContract()
        ) { grantedPermissions: Set<String> ->
            // Convert HealthPermission objects to strings for comparison
            val requiredPermissionStrings = healthManager.permissions.map { it.toString() }.toSet()
            val hasAllPermissions = requiredPermissionStrings.all { it in grantedPermissions }

            if (hasAllPermissions) {
                Log.d(TAG, "✅ All permissions granted")
                lifecycleScope.launch {
                    try {
                        // Use any string as userId: email, phone, random id, etc.
                        val userId = getUserId() // Get from your auth system
                        healthManager.readAndSendToServer(userId = userId)
                        Log.d(TAG, "Health data sent successfully")
                    } catch (e: Exception) {
                        Log.e(TAG, "Error sending health data: ${e.message}", e)
                        // Show error message to user
                    }
                }
            } else {
                Log.w(TAG, "⚠️ Not all permissions granted")
                // Show "Permissions required" message
                showPermissionsRequiredMessage()
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize Health Connect Manager
        healthManager = HealthConnectManager(applicationContext)

        // Set up Compose UI (or use setContentView for traditional views)
        setContent {
            HealthDemoTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    HealthConnectScreen(
                        healthManager = healthManager,
                        onRequestPermissions = {
                            requestHealthConnectPermissions()
                        }
                    )
                }
            }
        }

        // Check Health Connect availability and request permissions
        lifecycleScope.launch {
            if (healthManager.isHealthConnectAvailable()) {
                Log.d(TAG, "Health Connect is available")
                // Optionally auto-request permissions on startup
                // Or let user click a button to request permissions
                // requestHealthConnectPermissions()
            } else {
                Log.w(TAG, "Health Connect is not available")
                // Tell user to install/update Health Connect
                showHealthConnectNotAvailableMessage()
            }
        }
    }

    /**
     * Request Health Connect permissions
     */
    private fun requestHealthConnectPermissions() {
        lifecycleScope.launch {
            if (healthManager.isHealthConnectAvailable()) {
                // Check if permissions are already granted
                if (healthManager.hasPermissions()) {
                    Log.d(TAG, "Permissions already granted, sending data...")
                    val userId = getUserId()
                    healthManager.readAndSendToServer(userId = userId)
                } else {
                    // Launch permission request
                    permissionsLauncher.launch(healthManager.permissions)
                }
            } else {
                showHealthConnectNotAvailableMessage()
            }
        }
    }

    /**
     * Get user ID from your authentication system
     */
    private fun getUserId(): String {
        // TODO: Replace with your actual user authentication logic
        // Examples:
        // - Get from SharedPreferences
        // - Get from Firebase Auth
        // - Get from your backend API
        // - Use email/phone as userId
        
        // Using "log" as userId
        return "log"
    }

    /**
     * Show message that Health Connect is not available
     */
    private fun showHealthConnectNotAvailableMessage() {
        // TODO: Show dialog or snackbar to user
        Log.w(TAG, "Health Connect is not available. Please install or update Health Connect app.")
    }

    /**
     * Show message that permissions are required
     */
    private fun showPermissionsRequiredMessage() {
        // TODO: Show dialog or snackbar to user
        Log.w(TAG, "Health Connect permissions are required to sync health data.")
    }
}

/**
 * Compose UI for Health Connect screen
 */
@Composable
fun HealthConnectScreen(
    healthManager: HealthConnectManager,
    onRequestPermissions: () -> Unit
) {
    // TODO: Implement your Compose UI here
    // Example:
    Text("Health Connect Integration")
    // Add buttons, cards, etc. to display health data and request permissions
}
