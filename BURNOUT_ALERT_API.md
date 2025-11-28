# Burnout Alert API Integration

## Overview

The application now sends a burnout alert to the backend API when a user's risk score exceeds 7 (High Risk).

## Implementation

### API Endpoint

**URL**: `http://localhost:4000/api/send-burnout-alert`  
**Method**: `POST`  
**Content-Type**: `application/json`

### Request Body

```json
{
  "email": "user@example.com",
  "screenTime": 9,
  "sleep": 5,
  "mood": "Stressed",
  "riskScore": 8,
  "date": "2024-01-15"
}
```

### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "message": "Alert sent successfully"
}
```

**Error (4xx/5xx)**:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Code Integration

### Files Modified

1. **`src/utils/burnoutAlertService.js`** (NEW)
   - Utility function to send burnout alerts
   - Handles API calls and error handling

2. **`src/components/DailyLogForm.js`** (UPDATED)
   - Added API call when `riskScore > 7`
   - Gets user email from AuthContext
   - Sends alert after saving daily log

### How It Works

1. User submits daily check-in form
2. Risk score is calculated using `calculateRisk()`
3. If `riskScore > 7`:
   - API call is made to `http://localhost:4000/api/send-burnout-alert`
   - Sends user email, screen time, sleep, mood, risk score, and date
4. Response is logged to console (success or error)

## Configuration

### Environment Variable (Optional)

You can configure a custom API URL by adding to `.env`:

```env
REACT_APP_BURNOUT_ALERT_API=http://your-api-url.com/api/send-burnout-alert
```

If not set, defaults to: `http://localhost:4000/api/send-burnout-alert`

## Backend Requirements

Your backend API should:

1. Accept POST requests at `/api/send-burnout-alert`
2. Handle JSON request body with the fields above
3. Process the alert (send email, notification, etc.)
4. Return appropriate response

### Example Backend Implementation (Node.js/Express)

```javascript
app.post('/api/send-burnout-alert', async (req, res) => {
  const { email, screenTime, sleep, mood, riskScore, date } = req.body;
  
  try {
    // Send email notification
    await sendEmail({
      to: email,
      subject: '⚠️ High Burnout Risk Detected',
      body: `Your burnout risk score is ${riskScore}. Please take care!`
    });
    
    // Log to database
    await logBurnoutAlert({ email, riskScore, date });
    
    res.json({ success: true, message: 'Alert sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Testing

### Manual Test

1. Fill in daily check-in form with values that result in `riskScore > 7`:
   - Sleep: < 6 hours
   - Screen Time: > 8 hours
   - Mood: "Stressed" or "Overwhelmed"

2. Submit the form

3. Check browser console (F12) for:
   - "Burnout alert sent successfully" (if API is running)
   - "Failed to send burnout alert: ..." (if API is not running)

### Risk Score Calculation

Risk score is calculated as:
- Sleep < 6 hrs: +3
- Sleep 6-7 hrs: +1
- Screen Time > 8 hrs: +3
- Screen Time 6-8 hrs: +2
- Screen Time 4-6 hrs: +1
- Mood "Stressed": +3
- Mood "Tired": +2
- Mood "Anxious": +2
- Mood "Overwhelmed": +3

**Alert is sent when `riskScore > 7`**

## Error Handling

- If API call fails, error is logged to console
- User experience is not affected (non-blocking)
- Form submission continues normally
- Alert failure doesn't prevent log from being saved

## Future Enhancements

- Add user notification when alert is sent
- Add retry mechanism for failed API calls
- Add alert history/logging in UI
- Support for phone number alerts (SMS)
- Configurable risk threshold

## Notes

- API call is **asynchronous** and **non-blocking**
- Alert is only sent if user has an email address
- Alert is sent every time risk score > 7 (even if already sent today)
- Backend should handle duplicate alerts if needed

