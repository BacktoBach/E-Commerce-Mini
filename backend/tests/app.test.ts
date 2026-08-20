import type { FastifyInstance } from "fastify";
import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import type { AppConfig } from "../src/config/env.js";
import type { NightFoodPrismaClient } from "../src/config/prisma.js";
import { AuthController } from "../src/controllers/auth.controller.js";
import { HealthController } from "../src/controllers/health.controller.js";
import { createAuthenticateMiddleware } from "../src/middlewares/authenticate.js";
import { AuthService } from "../src/services/auth.service.js";
import { HealthService } from "../src/services/health.service.js";

const config: AppConfig = {
  appEnv: "test",
  host: "127.0.0.1",
  port: 5000,
  logLevel: "error",
  databaseUrl: "postgresql://unused",
  supabaseUrl: "https://nightfood.supabase.co",
  supabasePublishableKey: "sb_publishable_test",
  corsOrigins: ["http://localhost:5173"]
};

const openApps: FastifyInstance[] = [];

function createPrismaMock(queryRaw = vi.fn(), userUpsert = vi.fn()): NightFoodPrismaClient {
  return { $queryRaw: queryRaw, user: { upsert: userUpsert } } as unknown as NightFoodPrismaClient;
}

function createSupabaseMock(getClaims = vi.fn()): SupabaseClient {
  return { auth: { getClaims } } as unknown as SupabaseClient;
}

async function appWith(
  queryRaw = vi.fn(),
  userUpsert = vi.fn(),
  getClaims = vi.fn()
): Promise<FastifyInstance> {
  const prisma = createPrismaMock(queryRaw, userUpsert);
  const authService = new AuthService(prisma, createSupabaseMock(getClaims), config.supabaseUrl);
  const app = await createApp({
    config,
    authController: new AuthController(authService),
    authenticate: createAuthenticateMiddleware(authService),
    healthController: new HealthController(new HealthService(prisma)),
    logger: false
  });
  openApps.push(app);
  return app;
}

afterEach(async () => {
  await Promise.all(openApps.splice(0).map(async (app) => app.close()));
});

describe("NightFood API", () => {
  it("serves liveness using the standard success envelope", async () => {
    const app = await appWith();
    const response = await app.inject({ method: "GET", url: "/health/live" });
    const body = response.json<{ meta: { requestId: string } }>();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      status: "success",
      data: { service: "up" }
    });
    expect(typeof body.meta.requestId).toBe("string");
  });

  it("reports database readiness", async () => {
    const app = await appWith(vi.fn().mockResolvedValue([{ "?column?": 1 }]));
    const response = await app.inject({ method: "GET", url: "/health/ready" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "success",
      data: { service: "up", database: "up" }
    });
  });

  it("maps a failed database ping to HTTP 503", async () => {
    const app = await appWith(vi.fn().mockRejectedValue(new Error("offline")));
    const response = await app.inject({ method: "GET", url: "/health/ready" });
    const body = response.json<{ meta: { requestId: string } }>();

    expect(response.statusCode).toBe(503);
    expect(body).toMatchObject({
      status: "error",
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "The database is not ready to accept requests."
      }
    });
    expect(typeof body.meta.requestId).toBe("string");
  });

  it("publishes an OpenAPI document", async () => {
    const app = await appWith();
    const response = await app.inject({ method: "GET", url: "/docs/json" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      openapi: "3.0.3",
      info: { title: "NightFood API", version: "0.1.0" },
      components: { securitySchemes: { bearerAuth: { scheme: "bearer" } } }
    });
  });

  it("uses the standard error envelope for unknown routes", async () => {
    const app = await appWith();
    const response = await app.inject({ method: "GET", url: "/not-found" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      status: "error",
      error: { code: "NOT_FOUND", message: "Route not found." }
    });
  });

  it("requires a Bearer token for the current profile", async () => {
    const app = await appWith();
    const response = await app.inject({ method: "GET", url: "/api/v1/auth/me" });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      status: "error",
      error: { code: "UNAUTHORIZED", message: "A Bearer access token is required." }
    });
  });

  it("verifies Supabase claims and returns the NightFood profile", async () => {
    const now = new Date("2026-08-20T00:00:00.000Z");
    const userUpsert = vi.fn((args: unknown) => {
      void args;
      return Promise.resolve({
        id: "4c25be4c-c264-44c7-9241-8b4469b7b5a8",
        email: "customer@example.com",
        username: null,
        fullName: "Night Customer",
        avatarUrl: null,
        phone: null,
        role: "CUSTOMER",
        isBlocked: false,
        createdAt: now,
        updatedAt: now
      });
    });
    const getClaims = vi.fn().mockResolvedValue({
      data: {
        claims: {
          sub: "4c25be4c-c264-44c7-9241-8b4469b7b5a8",
          email: "CUSTOMER@example.com",
          iss: "https://nightfood.supabase.co/auth/v1",
          aud: "authenticated",
          user_metadata: { full_name: "Night Customer" }
        }
      },
      error: null
    });
    const app = await appWith(vi.fn(), userUpsert, getClaims);
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      headers: { authorization: "Bearer valid-token" }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "success",
      data: {
        id: "4c25be4c-c264-44c7-9241-8b4469b7b5a8",
        email: "customer@example.com",
        fullName: "Night Customer",
        role: "CUSTOMER"
      }
    });
    expect(userUpsert).toHaveBeenCalledOnce();
    expect(userUpsert.mock.calls[0]?.[0]).toMatchObject({
      where: { id: "4c25be4c-c264-44c7-9241-8b4469b7b5a8" },
      create: { email: "customer@example.com" }
    });
  });
});
