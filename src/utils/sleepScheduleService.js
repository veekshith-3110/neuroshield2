/**
 * Sleep Schedule Service
 * Manages sleep schedule settings and calculates benefits
 */

const STORAGE_KEY = 'sleepSchedule';

export const getSleepSchedule = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading sleep schedule:', error);
  }
  
  // Default schedule: 10 PM to 6 AM (8 hours)
  return {
    bedtime: '22:00',
    wakeTime: '06:00',
    targetHours: 8,
    enabled: true
  };
};

export const saveSleepSchedule = (schedule) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
    return true;
  } catch (error) {
    console.error('Error saving sleep schedule:', error);
    return false;
  }
};

/**
 * Calculate sleep duration in hours
 */
export const calculateSleepDuration = (bedtime, wakeTime) => {
  const [bedHour, bedMin] = bedtime.split(':').map(Number);
  const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
  
  let bedMinutes = bedHour * 60 + bedMin;
  let wakeMinutes = wakeHour * 60 + wakeMin;
  
  // Handle overnight sleep (bedtime is before midnight, wake time is after)
  if (wakeMinutes < bedMinutes) {
    wakeMinutes += 24 * 60; // Add 24 hours
  }
  
  const durationMinutes = wakeMinutes - bedMinutes;
  return durationMinutes / 60; // Convert to hours
};

/**
 * Calculate benefits of following sleep schedule
 */
export const calculateSleepBenefits = (schedule, actualSleepHours) => {
  const targetHours = schedule.targetHours || 8;
  const duration = calculateSleepDuration(schedule.bedtime, schedule.wakeTime);
  const adherence = actualSleepHours ? (actualSleepHours / targetHours) * 100 : 0;
  
  const benefits = {
    duration: duration.toFixed(1),
    targetHours,
    adherence: Math.min(100, Math.max(0, adherence)),
    benefits: []
  };
  
  if (duration >= 7 && duration <= 9) {
    benefits.benefits.push('✅ Optimal sleep duration for cognitive function');
    benefits.benefits.push('✅ Improved memory consolidation');
    benefits.benefits.push('✅ Better immune system function');
    benefits.benefits.push('✅ Enhanced mood regulation');
  } else if (duration >= 6 && duration < 7) {
    benefits.benefits.push('⚠️ Slightly below recommended (aim for 7-9 hours)');
    benefits.benefits.push('✅ Still within acceptable range');
  } else if (duration < 6) {
    benefits.benefits.push('❌ Insufficient sleep duration');
    benefits.benefits.push('⚠️ May impact cognitive performance');
    benefits.benefits.push('⚠️ Increased risk of health issues');
  } else if (duration > 9) {
    benefits.benefits.push('⚠️ Excessive sleep duration');
    benefits.benefits.push('ℹ️ May indicate underlying health issues');
  }
  
  if (adherence >= 80) {
    benefits.benefits.push('✅ Excellent schedule adherence');
    benefits.benefits.push('✅ Consistent sleep pattern');
  } else if (adherence >= 60) {
    benefits.benefits.push('⚠️ Moderate schedule adherence');
    benefits.benefits.push('💡 Try to stick closer to your schedule');
  } else {
    benefits.benefits.push('❌ Low schedule adherence');
    benefits.benefits.push('💡 Consider adjusting your schedule');
  }
  
  return benefits;
};

/**
 * Check if current time is within sleep window
 */
export const isSleepTime = (schedule) => {
  if (!schedule.enabled) return false;
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentMinutes = currentHour * 60 + currentMin;
  
  const [bedHour, bedMin] = schedule.bedtime.split(':').map(Number);
  const [wakeHour, wakeMin] = schedule.wakeTime.split(':').map(Number);
  
  const bedMinutes = bedHour * 60 + bedMin;
  const wakeMinutes = wakeHour * 60 + wakeMin;
  
  // Handle overnight sleep
  if (wakeMinutes < bedMinutes) {
    // Sleep spans midnight
    return currentMinutes >= bedMinutes || currentMinutes < wakeMinutes;
  } else {
    // Sleep is within same day (unusual but possible)
    return currentMinutes >= bedMinutes && currentMinutes < wakeMinutes;
  }
};

/**
 * Get time until next sleep reminder
 */
export const getTimeUntilSleep = (schedule) => {
  if (!schedule.enabled) return null;
  
  const now = new Date();
  const [bedHour, bedMin] = schedule.bedtime.split(':').map(Number);
  
  const bedtime = new Date();
  bedtime.setHours(bedHour, bedMin, 0, 0);
  
  // If bedtime has passed today, set for tomorrow
  if (bedtime < now) {
    bedtime.setDate(bedtime.getDate() + 1);
  }
  
  const diffMs = bedtime - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    hours: diffHours,
    minutes: diffMinutes,
    totalMinutes: Math.floor(diffMs / (1000 * 60))
  };
};

