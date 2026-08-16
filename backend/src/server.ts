import "dotenv/config";
import { createApp } from "./app.js";
import { loadConfig } from "./config/env.js";
import { createPrismaClient } from "./config/prisma.js";
import { HealthController } from "./controllers/health.controller.js";
import { HealthService } from "./services/health.service.js";

const config = loadConfig();
const prisma = createPrismaClient(config.databaseUrl);
const healthService = new HealthService(prisma);
const healthController = new HealthController(healthService);
const app = await createApp({ config, healthController });

async function shutdown(signal: string): Promise<void> {
  app.log.info({ signal }, "Shutting down NightFood API");
  await app.close();
  await prisma.$disconnect();
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error(error);
  await prisma.$disconnect();
  process.exitCode = 1;
}
