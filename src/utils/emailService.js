import emailjs from "emailjs-com";

/**
 * Send burnout alert email using EmailJS
 * @param {Object} params - Email parameters
 * @param {string} params.email - Recipient email address
 * @param {number} params.screenTime - Screen time hours
 * @param {number} params.sleep - Sleep hours
 * @param {string} params.mood - User's mood
 * @param {number} params.riskScore - Calculated risk score
 * @returns {Promise<Object>} Response from EmailJS
 */
export function sendAlertEmail({ email, screenTime, sleep, mood, riskScore }) {
  const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID || "your_service_id";
  const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "your_template_id";
  const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "your_public_key";

  return emailjs.send(
    serviceId,
    templateId,
    {
      to_email: email,
      screen_time: screenTime,
      sleep_hours: sleep,
      mood,
      risk_score: riskScore,
    },
    publicKey
  );
}

