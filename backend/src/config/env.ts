export type AppEnvironment = "development" | "test" | "production";
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface AppConfig {
  appEnv: AppEnvironment;
  host: string;
  port: number;
  logLevel: LogLevel;
  databaseUrl: string;
  accessTokenSecret: string;
  refreshTokenPepper: string;
  accessTokenTtlMinutes: number;
  refreshTokenTtlDays: number;
  corsOrigins: string[];
}

function required(source: NodeJS.ProcessEnv, name: string): string {
  const value = source[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function integer(
  source: NodeJS.ProcessEnv,
  name: string,
  fallback: number,
  minimum: number,
  maximum: number
): number {
  const raw = source[name]?.trim();
  const value = raw ? Number(raw) : fallback;
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be an integer between ${minimum} and ${maximum}`);
  }
  return value;
}

function oneOf<T extends string>(
  source: NodeJS.ProcessEnv,
  name: string,
  fallback: T,
  values: readonly T[]
): T {
  const value = (source[name]?.trim() || fallback) as T;
  if (!values.includes(value)) {
    throw new Error(`${name} must be one of: ${values.join(", ")}`);
  }
  return value;
}

export function loadConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const accessTokenSecret = required(source, "ACCESS_TOKEN_SECRET");
  const refreshTokenPepper = required(source, "REFRESH_TOKEN_PEPPER");
  if (accessTokenSecret.length < 32) {
    throw new Error("ACCESS_TOKEN_SECRET must be at least 32 characters");
  }
  if (refreshTokenPepper.length < 32) {
    throw new Error("REFRESH_TOKEN_PEPPER must be at least 32 characters");
  }

  return {
    appEnv: oneOf(source, "APP_ENV", "development", ["development", "test", "production"]),
    host: source.HOST?.trim() || "0.0.0.0",
    port: integer(source, "PORT", 5000, 1, 65_535),
    logLevel: oneOf(source, "LOG_LEVEL", "info", ["debug", "info", "warn", "error"]),
    databaseUrl: required(source, "DATABASE_URL"),
    accessTokenSecret,
    refreshTokenPepper,
    accessTokenTtlMinutes: integer(source, "ACCESS_TOKEN_TTL_MINUTES", 30, 5, 120),
    refreshTokenTtlDays: integer(source, "REFRESH_TOKEN_TTL_DAYS", 14, 1, 90),
    corsOrigins: (source.CORS_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  };
}
