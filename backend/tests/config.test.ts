import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/env.js";

const validEnvironment: NodeJS.ProcessEnv = {
  APP_ENV: "test",
  DATABASE_URL: "postgresql://nightfood:password@localhost:5435/nightfood",
  SUPABASE_URL: "https://nightfood.supabase.co/",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test"
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
      supabaseUrl: "https://nightfood.supabase.co",
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

  it("rejects a missing Supabase publishable key", () => {
    const environment = { ...validEnvironment };
    delete environment.SUPABASE_PUBLISHABLE_KEY;

    expect(() => loadConfig(environment)).toThrow(
      "Missing required environment variable: SUPABASE_PUBLISHABLE_KEY"
    );
  });

  it("rejects ports outside the valid range", () => {
    expect(() => loadConfig({ ...validEnvironment, PORT: "70000" })).toThrow(
      "PORT must be an integer between 1 and 65535"
    );
  });
});
