# Health Backend API Documentation

Base URL: `http://<your-ip>:5000`

## POST /api/health

Ingest health data from Android app.

### Request body (JSON)

```json
{
  "userId": "user123",
  "steps": 4500,
  "heartRate": 82,
  "timestamp": 1732900000000
}
```

- `userId` (string, required)
- `steps` (number, required)
- `heartRate` (number or null, optional)
- `timestamp` (number, ms since epoch; optional, defaults to server time)

### Responses

**201 Created:**
```json
{
  "success": true,
  "data": { ... }
}
```

**400 Bad Request** — missing or invalid fields.

## GET /api/health?userId=USER_ID

Get all health data for a user.

### Response
```json
{
  "userId": "user123",
  "count": 3,
  "data": [
    { "userId": "user123", "steps": 3000, "heartRate": 80, "timestamp": 1732900000000 },
    ...
  ]
}
```

## GET /api/health/latest?userId=USER_ID

Get the latest data point for a user.

### Response
```json
{
  "userId": "user123",
  "steps": 4500,
  "heartRate": 82,
  "timestamp": 1732900500000
}
```

**404** if no data.

## GET /api/health/stats?userId=USER_ID

Get aggregated statistics.

### Response
```json
{
  "userId": "user123",
  "totalEntries": 10,
  "totalSteps": 32000,
  "avgHeartRate": 81.4,
  "minHeartRate": 72,
  "maxHeartRate": 95
}
```

## GET /api/health/today?userId=USER_ID

Get today's summary.

### Response
```json
{
  "userId": "user123",
  "todaySteps": 6500,
  "latestHeartRate": 79,
  "latestTimestamp": 1732900650000
}
```

## Error Handling

- **400** — missing userId
- **404** — no data / no data for today
- **500** — unexpected server error
