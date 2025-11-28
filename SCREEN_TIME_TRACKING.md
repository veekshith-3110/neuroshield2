# Screen Time Tracking & Automatic Risk Monitoring

## Overview

The application now automatically tracks screen time and monitors burnout risk in real-time, sending email alerts and locking the screen when risk is too high.

## Features

### 1. Automatic Screen Time Tracking
- Tracks active screen time using browser APIs (Page Visibility API)
- Monitors when the page is visible/active
- Saves data to localStorage
- Updates every minute

### 2. Automatic Risk Calculation
- Calculates risk every 5 minutes based on:
  - Current screen time
  - Sleep hours (from daily log)
  - Mood (from daily log)
- Uses the same risk calculation formula:
  - Sleep < 6 hours: +3
  - Screen Time > 6 hours: +2
  - Mood "Stressed": +3
  - Mood "Tired": +2

### 3. Email Alerts
- **Risk > 7**: Sends email alert to user's email
- **Risk > 8**: Sends email alert + locks screen + sends browser notification

### 4. Screen Lock
- When risk > 8, screen is locked
- Fullscreen mode activated
- User must enter unlock code to continue
- Prevents escape key from exiting

### 5. Alert System
- After 6 alerts, sends alerts every 10 minutes
- Browser notifications for high risk
- Switch-off reminders after 6 alerts

### 6. Real-time Dashboard
- Shows current screen time
- Displays current risk score
- Shows alert count
- 7-day screen time history chart

## How It Works

### Screen Time Tracking

```javascript
// Automatically starts when user logs in
screenTimeTracker.startTracking();

// Tracks:
// - Page visibility (hidden/visible)
// - Window focus/blur
// - Active time only (not when tab is hidden)
```

### Risk Monitoring

```javascript
// Checks risk every 5 minutes
autoRiskCalculator.startMonitoring(userEmail);

// Actions taken:
// - Risk > 7: Email alert
// - Risk > 8: Email + Screen lock + Notification
// - After 6 alerts: Alerts every 10 minutes
```

## User Interface

### Screen Time Monitor Component

Located at the top of the Dashboard, shows:
- **Today's Screen Time**: Current hours tracked
- **Current Risk Score**: Real-time risk calculation
- **Alerts Sent**: Number of alerts triggered
- **7-Day History Chart**: Visual graph of screen time

### Screen Lock

When risk > 8:
- Full black screen overlay
- Warning message
- Unlock code input
- Cannot be bypassed easily

## Configuration

### Risk Thresholds

- **Low Risk**: 0-3 points
- **Moderate Risk**: 4-7 points
- **High Risk**: 8+ points (triggers screen lock)

### Alert Settings

- **Initial Alerts**: Sent when risk > 7 or > 8
- **Max Alerts**: 6 alerts before periodic mode
- **Periodic Interval**: 10 minutes after 6 alerts

### Screen Time Tracking

- **Update Interval**: Every 1 minute
- **Save Interval**: Every 5 minutes to localStorage
- **Tracking**: Only when page is visible and active

## Browser Requirements

### Required APIs

- **Page Visibility API**: For tracking when page is hidden
- **Fullscreen API**: For screen lock functionality
- **Notifications API**: For browser notifications (optional)

### Notification Permission

The app will request notification permission on first use. Users should grant permission for alerts.

## Data Storage

Screen time data is stored in localStorage:
```javascript
{
  "2024-01-15": 6.5,  // hours
  "2024-01-16": 7.2,
  ...
}
```

## Email Alerts

Email alerts are sent using EmailJS (configured in `.env`):
- Sent to user's login email
- Includes screen time, sleep, mood, and risk score
- Uses the same email service as manual alerts

## Limitations

### Browser Limitations

1. **Screen Lock**: Uses fullscreen mode (not true system lock)
   - User can still close browser/tab
   - Not a true OS-level lock

2. **Screen Time Tracking**: Only tracks when app is open
   - Doesn't track other browser tabs
   - Doesn't track other applications
   - Resets if browser is closed

3. **Device Shutdown**: Cannot actually shut down device
   - Web apps cannot control OS
   - Shows notifications/reminders instead

### Recommendations

For true screen time tracking and device control:
- Use browser extensions
- Use native mobile apps
- Use system-level applications

## Testing

### Test Screen Time Tracking

1. Log in to dashboard
2. Keep page open and active
3. Watch screen time increase in real-time
4. Check localStorage for saved data

### Test Risk Calculation

1. Set screen time > 6 hours (or wait)
2. Set sleep < 6 hours in daily log
3. Set mood to "Stressed"
4. Risk should exceed 8
5. Screen should lock

### Test Alerts

1. Trigger risk > 7: Check email
2. Trigger risk > 8: Check screen lock
3. Wait for 6 alerts: Check periodic alerts

## Troubleshooting

### Screen Time Not Tracking

- ✅ Check browser console for errors
- ✅ Verify page is visible (not in background tab)
- ✅ Check localStorage for data
- ✅ Refresh page to restart tracking

### Screen Lock Not Working

- ✅ Check browser supports Fullscreen API
- ✅ Verify risk score is actually > 8
- ✅ Check browser console for errors
- ✅ Try different browser

### Email Alerts Not Sending

- ✅ Check EmailJS configuration in `.env`
- ✅ Verify user email is set
- ✅ Check browser console for errors
- ✅ Verify EmailJS service is configured

### Notifications Not Showing

- ✅ Grant notification permission
- ✅ Check browser notification settings
- ✅ Verify browser supports Notifications API

## Security Notes

- Screen lock uses simple unlock code (customize for production)
- Screen time data stored locally (not sent to server)
- Email alerts sent to user's login email
- No sensitive data transmitted

---

**The automatic screen time tracking and risk monitoring system is now active!** 📊

