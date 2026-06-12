import crypto from 'crypto';

export const generateVerificationCode = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const generateExpiryDate = (minutes: number = 15): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};