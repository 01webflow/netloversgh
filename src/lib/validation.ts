/**
 * Validates a Ghana phone number format
 * Ghana phone numbers are 10 digits starting with 0
 * Examples: 0241234567, 0551234567, 0201234567
 */
export const validateGhanaPhone = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // Ghana phone numbers: 10 digits starting with 0
  return /^0\d{9}$/.test(cleaned);
};

/**
 * Sanitizes a phone number by removing non-digit characters
 */
export const sanitizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Formats a phone number for display (e.g., 024 123 4567)
 */
export const formatPhoneDisplay = (phone: string): string => {
  const cleaned = sanitizePhone(phone);
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return cleaned;
};
