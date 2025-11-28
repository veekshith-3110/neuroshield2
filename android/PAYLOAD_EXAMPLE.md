# Health Data Payload Example

## Payload Structure

The `HealthDataPayload` sent to the backend has the following structure:

```json
{
  "userId": "user123",
  "steps": 4567,
  "heartRate": 82,
  "timestamp": 1732900000000
}
```

## Field Descriptions

- **`userId`** (String, required): The unique identifier for the user
- **`steps`** (Long, required): Total number of steps taken today (from 00:00:00 to now)
- **`heartRate`** (Long?, optional): Latest heart rate reading in beats per minute (BPM). Can be `null` if no heart rate data is available
- **`timestamp`** (Long, required): Unix timestamp in milliseconds (e.g., `System.currentTimeMillis()`)

## Example Payloads

### With Heart Rate Data

```json
{
  "userId": "user123",
  "steps": 4567,
  "heartRate": 82,
  "timestamp": 1732900000000
}
```

### Without Heart Rate Data

```json
{
  "userId": "user123",
  "steps": 4567,
  "heartRate": null,
  "timestamp": 1732900000000
}
```

## Kotlin Data Class

```kotlin
data class HealthDataPayload(
    val userId: String,
    val steps: Long,
    val heartRate: Long?,   // nullable if no HR data
    val timestamp: Long     // System.currentTimeMillis()
)
```

## Backend Endpoint

**POST** `/api/health`

The backend will:
1. Store steps as a separate record with `dataType: "steps"`
2. Store heart rate as a separate record with `dataType: "heart_rate"` (if provided)
3. Return `200 OK` with empty body on success

## Response

### Success (200 OK)
Empty response body

### Error (400 Bad Request)
```json
{
  "success": false,
  "error": "Missing required fields: userId, steps"
}
```

### Error (500 Internal Server Error)
```json
{
  "success": false,
  "error": "Failed to store health data"
}
```

## Testing with curl

```bash
# Test with heart rate
curl -X POST http://192.168.1.10:3000/api/health \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "steps": 4567,
    "heartRate": 82,
    "timestamp": 1732900000000
  }'

# Test without heart rate
curl -X POST http://192.168.1.10:3000/api/health \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "steps": 4567,
    "heartRate": null,
    "timestamp": 1732900000000
  }'
```

## Usage in Android

```kotlin
val payload = HealthDataPayload(
    userId = "user123",
    steps = 4567L,
    heartRate = 82L,  // or null
    timestamp = System.currentTimeMillis()
)

val response = RetrofitClient.api.sendHealthData(payload)
```

Or use the convenience method:

```kotlin
healthConnectManager.readAndSendToServer("user123")
```

