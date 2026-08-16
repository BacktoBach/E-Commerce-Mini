import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/env.js";

const validEnvironment: NodeJS.ProcessEnv = {
  APP_ENV: "test",
  DATABASE_URL: "postgresql://nightfood:password@localhost:5435/nightfood",
  ACCESS_TOKEN_SECRET: "a".repeat(32),
  REFRESH_TOKEN_PEPPER: "b".repeat(32)
};

describe("loadConfig", () => {
  it("loads defaults and normalizes CORS origins", () => {
    const config = loadConfig({
      ...validEnvironment,
      CORS_ORIGINS: " http://localhost:5173,https://nightfood.example "
    });

    expect(config).toMatchObject({
      appEnv: "test",
      host: "0.0.0.0",
      port: 5000,
      accessTokenTtlMinutes: 30,
      refreshTokenTtlDays: 14,
      corsOrigins: ["http://localhost:5173", "https://nightfood.example"]
    });
  });

  it("rejects a missing database URL", () => {
    const environment = { ...validEnvironment };
    delete environment.DATABASE_URL;

    expect(() => loadConfig(environment)).toThrow(
      "Missing required environment variable: DATABASE_URL"
    );
  });

  it("rejects weak token secrets", () => {
    expect(() => loadConfig({ ...validEnvironment, ACCESS_TOKEN_SECRET: "too-short" })).toThrow(
      "ACCESS_TOKEN_SECRET must be at least 32 characters"
    );
  });

  it("rejects ports outside the valid range", () => {
    expect(() => loadConfig({ ...validEnvironment, PORT: "70000" })).toThrow(
      "PORT must be an integer between 1 and 65535"
    );
  });
});
