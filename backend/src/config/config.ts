import dotenv from 'dotenv';
dotenv.config();

// Validates that a required env variable is present — throws at startup if missing
const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config = {
  // Server
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  mongoUri: requireEnv('MONGO_URI'),

  // File Upload
  maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE_BYTES || '5242880', 10),
  get maxFileSizeMb(): number {
    return Math.round(this.maxFileSizeBytes / (1024 * 1024));
  },

  // Groq
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',

  // Helpers
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  },
} as const;
