import { describe, expect, it, vi } from "vitest";
import type { NightFoodPrismaClient } from "../src/config/prisma.js";
import { HealthService } from "../src/services/health.service.js";

function createPrismaMock(queryRaw = vi.fn()): NightFoodPrismaClient {
  return { $queryRaw: queryRaw } as unknown as NightFoodPrismaClient;
}

describe("HealthService", () => {
  it("reports the process as live", () => {
    expect(new HealthService(createPrismaMock()).live()).toEqual({ service: "up" });
  });

  it("reports readiness after the database responds", async () => {
    const prisma = createPrismaMock(vi.fn().mockResolvedValue([{ "?column?": 1 }]));

    await expect(new HealthService(prisma).ready()).resolves.toEqual({
      service: "up",
      database: "up"
    });
  });

  it("returns a public service error when the database is unavailable", async () => {
    const prisma = createPrismaMock(vi.fn().mockRejectedValue(new Error("connection refused")));

    await expect(new HealthService(prisma).ready()).rejects.toMatchObject({
      statusCode: 503,
      code: "DATABASE_UNAVAILABLE"
    });
  });
});
