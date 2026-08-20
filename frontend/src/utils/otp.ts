export const EMAIL_OTP_LENGTH = 6;

export function sanitizeOtp(value: string): string {
  return value.replace(/\D/g, "").slice(0, EMAIL_OTP_LENGTH);
}

export function replaceOtpDigit(value: string, index: number, input: string): string {
  const digits = sanitizeOtp(value).split("");
  const nextDigit = sanitizeOtp(input).slice(-1);

  if (!nextDigit) digits.splice(index, 1);
  else if (index < digits.length) digits[index] = nextDigit;
  else digits.push(nextDigit);

  return digits.join("").slice(0, EMAIL_OTP_LENGTH);
}
