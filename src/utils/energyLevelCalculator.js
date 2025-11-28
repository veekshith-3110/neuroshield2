/**
 * Energy Level Calculator
 * Calculates energy level based on health data from Health Connect
 */

/**
 * Calculate energy level (0-100) based on multiple factors
 */
export const calculateEnergyLevel = (healthData, sleepHours, todayLog) => {
  let energyScore = 50; // Base energy level
  
  // Factor 1: Steps (0-30 points)
  if (healthData.steps) {
    const stepsScore = Math.min(30, (healthData.steps / 10000) * 30);
    energyScore += stepsScore;
  }
  
  // Factor 2: Heart Rate (0-20 points)
  if (healthData.heartRate) {
    // Optimal heart rate is 60-100 bpm (resting)
    if (healthData.heartRate >= 60 && healthData.heartRate <= 100) {
      energyScore += 20; // Normal resting heart rate
    } else if (healthData.heartRate > 100 && healthData.heartRate < 140) {
      energyScore += 15; // Slightly elevated (active)
    } else if (healthData.heartRate < 60) {
      energyScore += 10; // Low (may indicate fatigue)
    } else {
      energyScore += 5; // Very high (stressed or overexerted)
    }
  }
  
  // Factor 3: Sleep (0-30 points)
  if (sleepHours) {
    if (sleepHours >= 7 && sleepHours <= 9) {
      energyScore += 30; // Optimal sleep
    } else if (sleepHours >= 6 && sleepHours < 7) {
      energyScore += 20; // Adequate sleep
    } else if (sleepHours >= 5 && sleepHours < 6) {
      energyScore += 10; // Insufficient sleep
    } else if (sleepHours < 5) {
      energyScore += 0; // Very poor sleep
    } else if (sleepHours > 9) {
      energyScore += 15; // Oversleeping
    }
  }
  
  // Factor 4: Mood/Stress (0-20 points)
  if (todayLog?.mood) {
    const mood = todayLog.mood.toLowerCase();
    if (mood.includes('great') || mood.includes('good')) {
      energyScore += 20;
    } else if (mood.includes('okay') || mood.includes('tired')) {
      energyScore += 10;
    } else if (mood.includes('stressed') || mood.includes('anxious')) {
      energyScore += 5;
    } else if (mood.includes('critical') || mood.includes('crying')) {
      energyScore += 0;
    }
  }
  
  // Clamp between 0 and 100
  energyScore = Math.max(0, Math.min(100, energyScore));
  
  return {
    level: Math.round(energyScore),
    category: getEnergyCategory(energyScore),
    color: getEnergyColor(energyScore),
    factors: {
      steps: healthData.steps || 0,
      heartRate: healthData.heartRate || null,
      sleep: sleepHours || null,
      mood: todayLog?.mood || null
    }
  };
};

/**
 * Get energy category based on score
 */
const getEnergyCategory = (score) => {
  if (score >= 80) return 'High';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Moderate';
  if (score >= 20) return 'Low';
  return 'Very Low';
};

/**
 * Get energy color based on score
 */
const getEnergyColor = (score) => {
  if (score >= 80) return '#10b981'; // Green
  if (score >= 60) return '#3b82f6'; // Blue
  if (score >= 40) return '#f59e0b'; // Yellow
  if (score >= 20) return '#f97316'; // Orange
  return '#ef4444'; // Red
};

/**
 * Get energy recommendations based on level
 */
export const getEnergyRecommendations = (energyLevel) => {
  const recommendations = [];
  
  if (energyLevel.level < 40) {
    recommendations.push('💤 Get more sleep (aim for 7-9 hours)');
    recommendations.push('🚶 Take a short walk to boost energy');
    recommendations.push('💧 Stay hydrated');
    recommendations.push('☀️ Get some sunlight exposure');
  } else if (energyLevel.level < 60) {
    recommendations.push('⏰ Take regular breaks');
    recommendations.push('🍎 Eat nutritious meals');
    recommendations.push('🧘 Practice deep breathing');
  } else if (energyLevel.level < 80) {
    recommendations.push('✅ Maintain your current routine');
    recommendations.push('🏃 Continue light exercise');
  } else {
    recommendations.push('🎉 Great energy levels!');
    recommendations.push('💪 Keep up the good habits');
  }
  
  return recommendations;
};

