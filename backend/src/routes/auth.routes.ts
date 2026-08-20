import type { FastifyInstance, preHandlerAsyncHookHandler } from "fastify";
import type { AuthController } from "../controllers/auth.controller.js";
import { AuthProfileResponseSchema } from "../schemas/auth.schema.js";
import { ErrorResponseSchema } from "../schemas/common.schema.js";

export function registerAuthRoutes(
  app: FastifyInstance,
  controller: AuthController,
  authenticate: preHandlerAsyncHookHandler
): void {
  app.get(
    "/api/v1/auth/me",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Auth"],
        summary: "Get or create the current NightFood profile",
        security: [{ bearerAuth: [] }],
        response: {
          200: AuthProfileResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          500: ErrorResponseSchema
        }
      }
    },
    controller.me
  );
}
