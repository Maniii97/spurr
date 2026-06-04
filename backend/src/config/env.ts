import 'dotenv/config';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:5173',
  geminiApiKey: requireEnv('GEMINI_API_KEY'),
  databaseUrl: requireEnv('DATABASE_URL'),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  isDev: (process.env['NODE_ENV'] ?? 'development') === 'development',
};
