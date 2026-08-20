export type AppEnvironment = "development" | "test" | "production";
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface AppConfig {
  appEnv: AppEnvironment;
  host: string;
  port: number;
  logLevel: LogLevel;
  databaseUrl: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
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
  return {
    appEnv: oneOf(source, "APP_ENV", "development", ["development", "test", "production"]),
    host: source.HOST?.trim() || "0.0.0.0",
    port: integer(source, "PORT", 5000, 1, 65_535),
    logLevel: oneOf(source, "LOG_LEVEL", "info", ["debug", "info", "warn", "error"]),
    databaseUrl: required(source, "DATABASE_URL"),
    supabaseUrl: required(source, "SUPABASE_URL").replace(/\/$/, ""),
    supabasePublishableKey: required(source, "SUPABASE_PUBLISHABLE_KEY"),
    corsOrigins: (source.CORS_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  };
}
