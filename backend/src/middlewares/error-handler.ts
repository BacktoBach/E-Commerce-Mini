import type { FastifyError, FastifyInstance } from "fastify";
import { AppError } from "../errors/app-error.js";
import { failure } from "../utils/response.js";

export function registerErrorHandler(app: FastifyInstance): void {
  app.setNotFoundHandler(async (request, reply) => {
    return reply
      .code(404)
      .send(failure(request, { code: "NOT_FOUND", message: "Route not found." }));
  });

  app.setErrorHandler(async (error: FastifyError, request, reply) => {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send(
        failure(request, {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {})
        })
      );
    }

    if (error.validation) {
      return reply.code(400).send(
        failure(request, {
          code: "VALIDATION_ERROR",
          message: "Request validation failed."
        })
      );
    }

    request.log.error({ err: error }, "Unhandled request error");
    return reply.code(500).send(
      failure(request, {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred."
      })
    );
  });
}
