/**
 * Password validation utility
 */

export const passwordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

/**
 * Validate password against requirements
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid, errors, and strength
 */
export const validatePassword = (password) => {
  const errors = [];
  const checks = {
    length: false,
    uppercase: false,
    lowercase: false,
    numbers: false,
    specialChars: false,
  };

  // Check minimum length
  if (password.length >= passwordRequirements.minLength) {
    checks.length = true;
  } else {
    errors.push(`At least ${passwordRequirements.minLength} characters`);
  }

  // Check uppercase
  if (!passwordRequirements.requireUppercase || /[A-Z]/.test(password)) {
    checks.uppercase = true;
  } else {
    errors.push('One uppercase letter');
  }

  // Check lowercase
  if (!passwordRequirements.requireLowercase || /[a-z]/.test(password)) {
    checks.lowercase = true;
  } else {
    errors.push('One lowercase letter');
  }

  // Check numbers
  if (!passwordRequirements.requireNumbers || /\d/.test(password)) {
    checks.numbers = true;
  } else {
    errors.push('One number');
  }

  // Check special characters
  if (!passwordRequirements.requireSpecialChars || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    checks.specialChars = true;
  } else {
    errors.push('One special character (!@#$%^&*)');
  }

  const isValid = errors.length === 0;

  // Calculate password strength
  const strength = calculatePasswordStrength(password, checks);

  return {
    isValid,
    errors,
    checks,
    strength, // 'weak', 'medium', 'strong', 'very-strong'
  };
};

/**
 * Calculate password strength
 * @param {string} password - Password to check
 * @param {Object} checks - Validation checks object
 * @returns {string} Strength level
 */
const calculatePasswordStrength = (password, checks) => {
  let score = 0;

  // Length score
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety score
  if (checks.uppercase) score += 1;
  if (checks.lowercase) score += 1;
  if (checks.numbers) score += 1;
  if (checks.specialChars) score += 1;

  // Determine strength
  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  if (score <= 6) return 'strong';
  return 'very-strong';
};

/**
 * Get strength color for UI
 * @param {string} strength - Strength level
 * @returns {string} Tailwind CSS color class
 */
export const getStrengthColor = (strength) => {
  switch (strength) {
    case 'weak':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'strong':
      return 'bg-blue-500';
    case 'very-strong':
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
};

/**
 * Get strength text for UI
 * @param {string} strength - Strength level
 * @returns {string} Display text
 */
export const getStrengthText = (strength) => {
  switch (strength) {
    case 'weak':
      return 'Weak';
    case 'medium':
      return 'Medium';
    case 'strong':
      return 'Strong';
    case 'very-strong':
      return 'Very Strong';
    default:
      return '';
  }
};

