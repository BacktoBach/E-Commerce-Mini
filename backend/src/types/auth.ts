import type { Role } from "../generated/prisma/client.js";

export interface AuthIdentity {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface AuthProfile {
  id: string;
  email: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

declare module "fastify" {
  interface FastifyRequest {
    authIdentity?: AuthIdentity;
  }
}
