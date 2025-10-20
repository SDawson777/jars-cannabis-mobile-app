import { z } from 'zod';
import { logger } from './utils/logger';

// Check if we're in test environment
const isTestEnvironment =
  process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

// Zod schema for environment validation (production/development)
const prodEnvSchema = z.object({
  // Critical API Keys
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  OPENWEATHER_API_KEY: z.string().min(1, 'OPENWEATHER_API_KEY is required'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // JWT Secret
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),

  // Firebase
  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
  FIREBASE_SERVICE_ACCOUNT_BASE64: z.string().min(1, 'FIREBASE_SERVICE_ACCOUNT_BASE64 is required'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),

  // Weather API (with defaults)
  WEATHER_API_URL: z.string().url().optional().default('https://api.openweathermap.org/data/2.5'),
  WEATHER_API_KEY: z.string().optional(),
  WEATHER_CACHE_TTL_MS: z
    .string()
    .regex(/^\d+$/, 'WEATHER_CACHE_TTL_MS must be a number')
    .optional()
    .default('300000'),

  // Optional configurations
  PORT: z.string().regex(/^\d+$/, 'PORT must be a number').optional().default('8080'),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
  DEBUG_DIAG: z.enum(['0', '1']).optional().default('0'),
  CORS_ORIGIN: z.string().optional(),
});

// Test schema with relaxed validation and defaults
const testEnvSchema = z.object({
  // Critical API Keys (with test defaults)
  OPENAI_API_KEY: z.string().min(1).optional().default('test-openai-key'),
  OPENWEATHER_API_KEY: z.string().min(1).optional().default('test-weather-key'),

  // Database (optional for tests, skip validation)
  DATABASE_URL: z.string().optional().default('postgresql://test:test@localhost:5432/testdb'),

  // JWT Secret (with test default)
  JWT_SECRET: z.string().min(1).optional().default('test-jwt-secret-at-least-32-characters-long'),

  // Firebase (with test defaults)
  FIREBASE_PROJECT_ID: z.string().min(1).optional().default('test-project'),
  FIREBASE_SERVICE_ACCOUNT_BASE64: z
    .string()
    .min(1)
    .optional()
    .default('dGVzdC1zZXJ2aWNlLWFjY291bnQ='),

  // Stripe (with test defaults)
  STRIPE_SECRET_KEY: z.string().min(1).optional().default('sk_test_test'),

  // Weather API (with defaults)
  WEATHER_API_URL: z.string().url().optional().default('https://api.openweathermap.org/data/2.5'),
  WEATHER_API_KEY: z.string().optional(),
  WEATHER_CACHE_TTL_MS: z
    .string()
    .regex(/^\d+$/, 'WEATHER_CACHE_TTL_MS must be a number')
    .optional()
    .default('300000'),

  // Optional configurations
  PORT: z.string().regex(/^\d+$/, 'PORT must be a number').optional().default('8080'),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('test'),
  DEBUG_DIAG: z.enum(['0', '1']).optional().default('0'),
  CORS_ORIGIN: z.string().optional(),
});

// Use appropriate schema based on environment
const envSchema = isTestEnvironment ? testEnvSchema : prodEnvSchema;

export type EnvConfig = z.infer<typeof prodEnvSchema>;

/**
 * Validates environment variables using Zod schema
 * Throws descriptive error if validation fails
 */
function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);

      logger.error('❌ Environment validation failed:');
      missingVars.forEach(msg => logger.error(`  • ${msg}`));

      const criticalError = new Error(
        `Missing or invalid environment variables:\n${missingVars
          .map(msg => `  • ${msg}`)
          .join('\n')}\n\nPlease check your .env file and ensure all required variables are set.`
      );

      // Set a clear error name for debugging
      criticalError.name = 'EnvironmentValidationError';
      throw criticalError;
    }
    throw error;
  }
}

/**
 * Validated environment configuration
 * Will throw on startup if any required variables are missing
 */
export const env = validateEnv();

/**
 * Helper to check if running in development mode
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Helper to check if running in production mode
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Helper to check if running in test mode
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Helper to check if debug diagnostics are enabled
 */
export const isDebugEnabled = env.DEBUG_DIAG === '1';
