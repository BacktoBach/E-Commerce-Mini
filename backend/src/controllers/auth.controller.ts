import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../errors/app-error.js";
import type { AuthService } from "../services/auth.service.js";
import { success } from "../utils/response.js";

export class AuthController {
  public constructor(private readonly service: AuthService) {}

  public me = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.authIdentity) {
      throw new AppError(401, "UNAUTHORIZED", "An authenticated identity is required.");
    }

    const profile = await this.service.getOrCreateProfile(request.authIdentity);
    return reply.code(200).send(success(request, profile));
  };
}
