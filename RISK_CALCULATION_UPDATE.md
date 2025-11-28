# Risk Calculation Logic Update

## Updated Risk Calculation Formula

The risk calculation has been simplified to match the new logic:

```javascript
function calculateRisk({ screenTime, sleep, mood }) {
  let risk = 0;

  if (sleep < 6) risk += 3;
  if (screenTime > 6) risk += 2;
  if (mood === "Stressed") risk += 3;
  if (mood === "Tired") risk += 2;

  return risk;
}
```

## Risk Score Breakdown

### Sleep Risk
- **Sleep < 6 hours**: +3 points

### Screen Time Risk
- **Screen Time > 6 hours**: +2 points

### Mood Risk
- **Mood = "Stressed"**: +3 points
- **Mood = "Tired"**: +2 points

## Risk Score Examples

| Sleep | Screen Time | Mood | Risk Score | Status |
|-------|-------------|------|------------|--------|
| 7 | 5 | Good | 0 | Low |
| 5 | 7 | Good | 5 | Moderate |
| 7 | 7 | Tired | 2 | Low |
| 5 | 7 | Tired | 7 | Moderate |
| 5 | 7 | Stressed | 8 | **High** ⚠️ |

## Alert Trigger

**Email alert is sent when `riskScore > 7`**

This means the alert will trigger when:
- Sleep < 6 (3) + Screen Time > 6 (2) + Stressed (3) = **8 points** ✅

## Status Thresholds

- **Low Risk**: 0-3 points
- **Moderate Risk**: 4-7 points
- **High Risk**: 8+ points (triggers email alert)

## Changes Made

### Before (Old Logic)
- Multiple sleep thresholds (6-7 hours, < 6 hours)
- Multiple screen time thresholds (> 8, 6-8, 4-6 hours)
- Multiple mood options (Stressed, Tired, Anxious, Overwhelmed)

### After (New Logic)
- Single sleep threshold (< 6 hours = +3)
- Single screen time threshold (> 6 hours = +2)
- Two mood options (Stressed = +3, Tired = +2)

## Impact

The new logic is:
- ✅ **Simpler** - Easier to understand and maintain
- ✅ **More focused** - Only tracks critical risk factors
- ✅ **Still effective** - Alerts trigger for high-risk combinations

## Files Updated

- `src/utils/riskCalculator.js` - Updated `calculateRisk()` function

## Testing

To test the new risk calculation:

1. **Low Risk Example**:
   - Sleep: 7 hours, Screen Time: 5 hours, Mood: Good
   - Expected: Risk Score = 0

2. **Moderate Risk Example**:
   - Sleep: 5 hours, Screen Time: 7 hours, Mood: Good
   - Expected: Risk Score = 5

3. **High Risk Example** (triggers alert):
   - Sleep: 5 hours, Screen Time: 7 hours, Mood: Stressed
   - Expected: Risk Score = 8 (triggers email alert)

---

**Note**: The alert threshold remains at `riskScore > 7`, so alerts will only be sent for the most critical risk combinations.

