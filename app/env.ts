// BASE_URL

export const mustGet = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set or is empty.`);
  }
  return value;
};


export const BASE_URL = mustGet("BASE_URL");