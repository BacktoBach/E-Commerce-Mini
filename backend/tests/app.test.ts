import type { FastifyInstance } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import type { AppConfig } from "../src/config/env.js";
import type { NightFoodPrismaClient } from "../src/config/prisma.js";
import { HealthController } from "../src/controllers/health.controller.js";
import { HealthService } from "../src/services/health.service.js";

const config: AppConfig = {
  appEnv: "test",
  host: "127.0.0.1",
  port: 5000,
  logLevel: "error",
  databaseUrl: "postgresql://unused",
  accessTokenSecret: "a".repeat(32),
  refreshTokenPepper: "b".repeat(32),
  accessTokenTtlMinutes: 30,
  refreshTokenTtlDays: 14,
  corsOrigins: ["http://localhost:5173"]
};

const openApps: FastifyInstance[] = [];

function createPrismaMock(queryRaw = vi.fn()): NightFoodPrismaClient {
  return { $queryRaw: queryRaw } as unknown as NightFoodPrismaClient;
}

async function appWith(queryRaw = vi.fn()): Promise<FastifyInstance> {
  const app = await createApp({
    config,
    healthController: new HealthController(new HealthService(createPrismaMock(queryRaw))),
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
      info: { title: "NightFood API", version: "0.1.0" }
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
});
