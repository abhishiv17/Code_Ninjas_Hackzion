// Auth utilities
export const calcPasswordStrength = (pw: string): number => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

export const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

export const getStrengthColor = (score: number): string => {
  if (score === 4) return 'bg-green-500';
  if (score === 3) return 'bg-yellow-500';
  if (score === 2) return 'bg-orange-500';
  return 'bg-red-500';
};
