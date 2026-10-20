/** Stores Philippine mobile numbers in one format (+639XXXXXXXXX). */
export function normalizePhoneNumber(phoneNumber: string) {
  const digits = phoneNumber.replace(/[\s()-]/g, '');

  if (digits.startsWith('09')) {
    return `+63${digits.slice(1)}`;
  }

  if (digits.startsWith('639')) {
    return `+${digits}`;
  }

  return digits;
}

export function createCustomerCode() {
  return `CUS-${Date.now().toString(36).toUpperCase()}`;
}
