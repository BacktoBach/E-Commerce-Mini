import "dotenv/config";
import { createApp } from "./app.js";
import { loadConfig } from "./config/env.js";
import { createPrismaClient } from "./config/prisma.js";
import { createSupabaseAuthClient } from "./config/supabase.js";
import { AuthController } from "./controllers/auth.controller.js";
import { HealthController } from "./controllers/health.controller.js";
import { createAuthenticateMiddleware } from "./middlewares/authenticate.js";
import { AuthService } from "./services/auth.service.js";
import { HealthService } from "./services/health.service.js";

const config = loadConfig();
const prisma = createPrismaClient(config.databaseUrl);
const supabase = createSupabaseAuthClient(config.supabaseUrl, config.supabasePublishableKey);
const authService = new AuthService(prisma, supabase, config.supabaseUrl);
const authController = new AuthController(authService);
const authenticate = createAuthenticateMiddleware(authService);
const healthService = new HealthService(prisma);
const healthController = new HealthController(healthService);
const app = await createApp({ config, authController, authenticate, healthController });

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
