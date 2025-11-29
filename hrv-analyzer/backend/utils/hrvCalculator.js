/**
 * HRV Calculator Utility
 * 
 * Calculates Heart Rate Variability (HRV) using the RMSSD formula.
 * 
 * RMSSD (Root Mean Square of Successive Differences):
 * HRV = sqrt( sum( (RR[i] - RR[i-1])² ) / (n-1) )
 * 
 * Where:
 * - RR[i] = RR interval at position i (in milliseconds)
 * - n = total number of RR intervals
 * 
 * HRV Interpretation:
 * - HRV > 70 ms: Relaxed (Green) - Good recovery, low stress
 * - HRV 40-70 ms: Normal (Yellow) - Moderate stress, normal state
 * - HRV < 40 ms: Stress (Red) - High stress, poor recovery
 */

/**
 * Calculate HRV from RR intervals using RMSSD formula
 * 
 * @param {number[]} rrIntervals - Array of RR intervals in milliseconds
 * @returns {number} HRV value in milliseconds
 * @throws {Error} If insufficient data or invalid input
 */
function calculateHRV(rrIntervals) {
  // Validate input
  if (!Array.isArray(rrIntervals) || rrIntervals.length < 2) {
    throw new Error('At least 2 RR intervals are required for HRV calculation');
  }

  // Filter out invalid values (null, undefined, NaN, negative, or zero)
  const validIntervals = rrIntervals.filter(
    interval => interval != null && 
                !isNaN(interval) && 
                interval > 0 && 
                typeof interval === 'number'
  );

  if (validIntervals.length < 2) {
    throw new Error('Insufficient valid RR intervals for HRV calculation');
  }

  // Calculate sum of squared successive differences
  let sumSquaredDifferences = 0;
  
  for (let i = 1; i < validIntervals.length; i++) {
    const difference = validIntervals[i] - validIntervals[i - 1];
    sumSquaredDifferences += difference * difference;
  }

  // Calculate RMSSD: sqrt( sum( (RR[i] - RR[i-1])² ) / (n-1) )
  const n = validIntervals.length;
  const meanSquaredDifference = sumSquaredDifferences / (n - 1);
  const hrv = Math.sqrt(meanSquaredDifference);

  return hrv;
}

/**
 * Calculate additional HRV metrics (optional extensions)
 * 
 * @param {number[]} rrIntervals - Array of RR intervals in milliseconds
 * @returns {Object} Additional HRV metrics
 */
function calculateAdditionalMetrics(rrIntervals) {
  const validIntervals = rrIntervals.filter(
    interval => interval != null && !isNaN(interval) && interval > 0
  );

  if (validIntervals.length === 0) {
    return null;
  }

  // Mean RR interval
  const meanRR = validIntervals.reduce((sum, val) => sum + val, 0) / validIntervals.length;

  // Standard deviation of RR intervals (SDNN)
  const variance = validIntervals.reduce((sum, val) => {
    return sum + Math.pow(val - meanRR, 2);
  }, 0) / validIntervals.length;
  const sdnn = Math.sqrt(variance);

  // Min and Max RR intervals
  const minRR = Math.min(...validIntervals);
  const maxRR = Math.max(...validIntervals);

  return {
    meanRR: Math.round(meanRR * 100) / 100,
    sdnn: Math.round(sdnn * 100) / 100,
    minRR: Math.round(minRR * 100) / 100,
    maxRR: Math.round(maxRR * 100) / 100
  };
}

module.exports = {
  calculateHRV,
  calculateAdditionalMetrics
};

