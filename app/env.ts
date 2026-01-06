// BASE_URL

export const mustGet = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set or is empty.`);
  }
  return value;
};

export const BASE_URL = mustGet("BASE_URL");
export const MONGODB_URI = mustGet("MONGODB_URI");
export const JWT_SECRET = mustGet("JWT_SECRET") as string;
export const JWT_EXPIRES_IN :any= process.env.JWT_EXPIRES_IN ?? "7d";
export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "token";
export const SMTP_HOST = mustGet("SMTP_HOST");
export const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
export const SMTP_USER = mustGet("SMTP_USER");
export const SMTP_PASSWORD = mustGet("SMTP_PASSWORD");
export const SMTP_FROM = process.env.SMTP_FROM ?? SMTP_USER;
export const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES ?? 10);

// Razorpay
export const RAZORPAY_KEY_ID = mustGet("RAZOR_PAY_ID");
export const RAZORPAY_KEY_SECRET = mustGet("RAZOR_PAY_SECRET");
