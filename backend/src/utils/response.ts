import type { FastifyRequest } from "fastify";

export function success<T>(request: FastifyRequest, data: T) {
  return {
    status: "success" as const,
    data,
    meta: { requestId: request.id }
  };
}

export function failure(
  request: FastifyRequest,
  error: { code: string; message: string; details?: Record<string, unknown> }
) {
  return {
    status: "error" as const,
    error,
    meta: { requestId: request.id }
  };
}
