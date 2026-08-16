import type { FastifyReply, FastifyRequest } from "fastify";
import type { HealthService } from "../services/health.service.js";
import { success } from "../utils/response.js";

export class HealthController {
  public constructor(private readonly service: HealthService) {}

  public live = async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.code(200).send(success(request, this.service.live()));
  };

  public ready = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.ready();
    return reply.code(200).send(success(request, result));
  };
}
