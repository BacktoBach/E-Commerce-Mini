import type { FastifyInstance } from "fastify";
import type { HealthController } from "../controllers/health.controller.js";
import {
  HealthErrorResponseSchema,
  LiveResponseSchema,
  ReadyResponseSchema
} from "../schemas/health.schema.js";

export function registerHealthRoutes(app: FastifyInstance, controller: HealthController): void {
  app.get(
    "/health/live",
    {
      schema: {
        tags: ["Health"],
        summary: "Check whether the API process is running",
        response: { 200: LiveResponseSchema }
      }
    },
    controller.live
  );

  app.get(
    "/health/ready",
    {
      schema: {
        tags: ["Health"],
        summary: "Check whether the API and PostgreSQL are ready",
        response: { 200: ReadyResponseSchema, 503: HealthErrorResponseSchema }
      }
    },
    controller.ready
  );
}
