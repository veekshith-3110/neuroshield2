/**
 * Calculate burnout risk score based on sleep, screen time, and mood
 * @param {Object} params - Input parameters
 * @param {number} params.sleep - Sleep hours
 * @param {number} params.screenTime - Screen time hours
 * @param {string} params.mood - Mood value
 * @returns {Object} - Risk score and status
 */
export function calculateRisk({ sleep, screenTime, mood }) {
  let risk = 0;

  // Sleep-related risk
  if (sleep < 6) risk += 3;

  // Screen time risk
  if (screenTime > 6) risk += 2;

  // Mood-related risk
  if (mood === 'Stressed') risk += 3;
  if (mood === 'Tired') risk += 2;

  // Determine status
  let status = 'Low';
  let color = 'burnout-low';
  
  if (risk >= 7) {
    status = 'High';
    color = 'burnout-high';
  } else if (risk >= 4) {
    status = 'Moderate';
    color = 'burnout-moderate';
  }

  return {
    riskScore: risk,
    status,
    color
  };
}

/**
 * Get health status message based on risk score
 */
export function getHealthMessage(riskScore) {
  if (riskScore >= 7) {
    return "High risk detected. Take a break and prioritize self-care!";
  } else if (riskScore >= 4) {
    return "Moderate risk. Consider reducing screen time and improving sleep.";
  } else {
    return "You're doing great! Keep up the healthy habits.";
  }
}

