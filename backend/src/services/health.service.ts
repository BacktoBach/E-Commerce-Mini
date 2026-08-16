import type { NightFoodPrismaClient } from "../config/prisma.js";
import { AppError } from "../errors/app-error.js";

export class HealthService {
  public constructor(private readonly prisma: NightFoodPrismaClient) {}

  public live() {
    return { service: "up" as const };
  }

  public async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { service: "up" as const, database: "up" as const };
    } catch {
      throw new AppError(
        503,
        "DATABASE_UNAVAILABLE",
        "The database is not ready to accept requests."
      );
    }
  }
}
