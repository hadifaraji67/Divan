export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>'"]/g, '').trim();
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^09\d{9}$/;
  return phoneRegex.test(phone);
};
