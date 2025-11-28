# ✅ Automatic Screen Time Tracking & Risk Monitoring - Complete

## 🎯 Implementation Summary

All requested features have been implemented:

### ✅ 1. Automatic Screen Time Tracking
- **Location**: `src/utils/screenTimeTracker.js`
- **Features**:
  - Tracks active screen time using Page Visibility API
  - Monitors window focus/blur events
  - Updates every minute
  - Saves to localStorage every 5 minutes
  - Tracks only when page is visible and active

### ✅ 2. Automatic Risk Calculation
- **Location**: `src/utils/autoRiskCalculator.js`
- **Features**:
  - Calculates risk every 5 minutes
  - Uses screen time, sleep, and mood
  - Same formula as manual calculation:
    - Sleep < 6: +3
    - Screen Time > 6: +2
    - Mood "Stressed": +3
    - Mood "Tired": +2

### ✅ 3. Email Alerts
- **Triggers**:
  - Risk > 7: Email alert sent
  - Risk > 8: Email alert + screen lock + notification
- **Service**: Uses EmailJS (configured in `.env`)
- **Recipient**: User's login email

### ✅ 4. Screen Lock (Risk > 8)
- **Location**: `src/components/ScreenLock.js`
- **Features**:
  - Fullscreen lock mode
  - Black screen overlay
  - Unlock code required
  - Prevents escape key
  - Shows warning message

### ✅ 5. Alert System
- **Initial Alerts**: Sent when risk > 7 or > 8
- **After 6 Alerts**: Sends alerts every 10 minutes
- **Notifications**: Browser notifications for high risk
- **Switch-off Reminders**: After 6 alerts, reminds to switch off device

### ✅ 6. Dashboard Integration
- **Location**: `src/components/ScreenTimeMonitor.js`
- **Features**:
  - Real-time screen time display
  - Current risk score
  - Alert count
  - 7-day screen time history chart
  - Warning messages for high risk

### ✅ 7. Graphs & Visualization
- **Chart**: 7-day screen time history
- **Library**: Recharts (already installed)
- **Display**: Line chart showing daily screen time

## 📊 How It Works

### Flow Diagram

```
User Logs In
    ↓
Screen Time Tracking Starts (automatic)
    ↓
Every 5 Minutes: Calculate Risk
    ↓
Risk > 7? → Send Email Alert
    ↓
Risk > 8? → Lock Screen + Send Email + Notification
    ↓
After 6 Alerts → Send Alerts Every 10 Minutes
    ↓
Show Switch-off Reminders
```

### Screen Time Tracking

1. **Starts automatically** when user logs into dashboard
2. **Tracks** only when:
   - Page is visible (not in background tab)
   - Window is focused
   - User is actively using the app
3. **Saves** to localStorage every 5 minutes
4. **Updates** display every minute

### Risk Calculation

1. **Runs every 5 minutes** automatically
2. **Uses**:
   - Current tracked screen time
   - Sleep hours from daily log (or default 7)
   - Mood from daily log (or default "Good")
3. **Calculates** risk score using formula
4. **Triggers** alerts if threshold exceeded

### Screen Lock

1. **Activates** when risk > 8
2. **Fullscreen mode** - covers entire screen
3. **Unlock required** - user must enter code
4. **Cannot bypass** easily (escape key disabled)

### Alert System

1. **First 6 Alerts**: Sent when risk threshold exceeded
2. **After 6 Alerts**: Periodic alerts every 10 minutes
3. **Notifications**: Browser notifications (if permission granted)
4. **Email**: Sent via EmailJS service

## 🎨 User Interface

### Screen Time Monitor (Top of Dashboard)

```
┌─────────────────────────────────────┐
│  📊 Screen Time Monitor             │
├─────────────────────────────────────┤
│  Today's Screen Time: 6.5 hrs      │
│  Current Risk Score: 8              │
│  Alerts Sent: 3                     │
├─────────────────────────────────────┤
│  ⚠️ High Risk Detected!             │
│  Screen is locked. Take a break.   │
├─────────────────────────────────────┤
│  7-Day Screen Time History          │
│  [Line Chart]                       │
└─────────────────────────────────────┘
```

### Screen Lock (When Risk > 8)

```
┌─────────────────────────────────────┐
│                                     │
│        ⚠️ Screen Locked             │
│                                     │
│  Your burnout risk is too high.    │
│  Please take a break.               │
│                                     │
│  [Enter unlock code]                │
│  [Unlock Screen Button]             │
│                                     │
└─────────────────────────────────────┘
```

## 🔧 Configuration

### Risk Thresholds

- **Low**: 0-3 points
- **Moderate**: 4-7 points (email alert)
- **High**: 8+ points (screen lock + alerts)

### Timing

- **Screen Time Update**: Every 1 minute
- **Risk Check**: Every 5 minutes
- **Data Save**: Every 5 minutes
- **Periodic Alerts**: Every 10 minutes (after 6 alerts)

## 📝 Files Created/Modified

### New Files
1. `src/utils/screenTimeTracker.js` - Screen time tracking
2. `src/utils/autoRiskCalculator.js` - Automatic risk calculation
3. `src/components/ScreenLock.js` - Screen lock component
4. `src/components/ScreenTimeMonitor.js` - Dashboard monitor
5. `SCREEN_TIME_TRACKING.md` - Documentation

### Modified Files
1. `src/pages/Dashboard.js` - Added ScreenTimeMonitor
2. `src/components/DailyLogForm.js` - Auto-fill screen time from tracker

## ⚠️ Important Notes

### Browser Limitations

1. **Screen Lock**: Uses fullscreen API (not true OS lock)
   - User can still close browser
   - Not system-level protection

2. **Screen Time**: Only tracks when app is open
   - Doesn't track other tabs/apps
   - Resets if browser closes

3. **Device Shutdown**: Cannot actually shut down device
   - Web apps have no OS control
   - Shows notifications/reminders instead

### Production Considerations

1. **Unlock Code**: Currently simple (customize for security)
2. **Notification Permission**: Request on first use
3. **EmailJS**: Must be configured in `.env`
4. **Data Privacy**: All data stored locally

## 🚀 Usage

### For Users

1. **Log in** to dashboard
2. **Screen time tracking starts automatically**
3. **Monitor** your screen time and risk in real-time
4. **Receive alerts** when risk is high
5. **Screen locks** if risk > 8
6. **Take breaks** when prompted

### For Developers

1. **Screen time tracking** starts automatically on login
2. **Risk calculation** runs every 5 minutes
3. **Alerts** sent via EmailJS
4. **Screen lock** triggered at risk > 8
5. **All data** stored in localStorage

## ✅ Testing Checklist

- [ ] Screen time tracks when page is active
- [ ] Screen time stops when page is hidden
- [ ] Risk calculates every 5 minutes
- [ ] Email alert sent when risk > 7
- [ ] Screen locks when risk > 8
- [ ] Unlock code works
- [ ] Alerts sent every 10 min after 6 alerts
- [ ] Browser notifications work
- [ ] Chart displays 7-day history
- [ ] Data saves to localStorage

---

**All features implemented and ready to use!** 🎉

