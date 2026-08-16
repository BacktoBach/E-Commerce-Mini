import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify, { type FastifyInstance } from "fastify";
import type { AppConfig } from "./config/env.js";
import type { HealthController } from "./controllers/health.controller.js";
import { registerErrorHandler } from "./middlewares/error-handler.js";
import { registerHealthRoutes } from "./routes/health.routes.js";

export interface CreateAppOptions {
  config: AppConfig;
  healthController: HealthController;
  logger?: boolean;
}

export async function createApp(options: CreateAppOptions): Promise<FastifyInstance> {
  const app = Fastify({
    logger:
      options.logger === false
        ? false
        : {
            level: options.config.logLevel,
            redact: {
              paths: [
                "req.headers.authorization",
                "req.headers.cookie",
                "request.headers.authorization",
                "config.databaseUrl",
                "config.accessTokenSecret",
                "config.refreshTokenPepper"
              ],
              censor: "[REDACTED]"
            }
          }
  }).withTypeProvider<TypeBoxTypeProvider>();

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    credentials: true,
    origin:
      options.config.corsOrigins.length === 0
        ? false
        : (origin, callback) => {
            if (!origin || options.config.corsOrigins.includes(origin)) callback(null, true);
            else callback(new Error("Origin is not allowed by CORS"), false);
          }
  });

  await app.register(swagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "NightFood API",
        description: "Backend API for the NightFood food delivery platform.",
        version: "0.1.0"
      }
    }
  });
  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: true }
  });

  registerErrorHandler(app);
  registerHealthRoutes(app, options.healthController);

  return app;
}
