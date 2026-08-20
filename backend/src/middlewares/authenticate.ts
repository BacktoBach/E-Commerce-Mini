import type { preHandlerAsyncHookHandler } from "fastify";
import { AppError } from "../errors/app-error.js";
import type { AuthService } from "../services/auth.service.js";

export function createAuthenticateMiddleware(authService: AuthService): preHandlerAsyncHookHandler {
  return async (request) => {
    const match = /^Bearer\s+(.+)$/i.exec(request.headers.authorization ?? "");
    const accessToken = match?.[1]?.trim();

    if (!accessToken) {
      throw new AppError(401, "UNAUTHORIZED", "A Bearer access token is required.");
    }

    request.authIdentity = await authService.verifyAccessToken(accessToken);
  };
}
