import type { SupabaseClient } from "@supabase/supabase-js";
import type { NightFoodPrismaClient } from "../config/prisma.js";
import { AppError } from "../errors/app-error.js";
import type { AuthIdentity, AuthProfile } from "../types/auth.js";

const profileSelect = {
  id: true,
  email: true,
  username: true,
  fullName: true,
  avatarUrl: true,
  phone: true,
  role: true,
  isBlocked: true,
  createdAt: true,
  updatedAt: true
} as const;

function optionalMetadataString(
  metadata: Record<string, unknown> | undefined,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = metadata?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function hasAuthenticatedAudience(audience: string | string[] | undefined): boolean {
  return (
    audience === "authenticated" || (Array.isArray(audience) && audience.includes("authenticated"))
  );
}

export class AuthService {
  private readonly expectedIssuer: string;

  public constructor(
    private readonly prisma: NightFoodPrismaClient,
    private readonly supabase: SupabaseClient,
    supabaseUrl: string
  ) {
    this.expectedIssuer = `${supabaseUrl.replace(/\/$/, "")}/auth/v1`;
  }

  public async verifyAccessToken(accessToken: string): Promise<AuthIdentity> {
    const { data, error } = await this.supabase.auth.getClaims(accessToken);
    const claims = data?.claims;

    if (error || !claims) {
      throw new AppError(401, "UNAUTHORIZED", "The access token is invalid or expired.");
    }

    if (
      typeof claims.sub !== "string" ||
      typeof claims.email !== "string" ||
      claims.iss !== this.expectedIssuer ||
      !hasAuthenticatedAudience(claims.aud)
    ) {
      throw new AppError(401, "UNAUTHORIZED", "The access token claims are invalid.");
    }

    const metadata =
      claims.user_metadata && typeof claims.user_metadata === "object"
        ? (claims.user_metadata as Record<string, unknown>)
        : undefined;

    return {
      id: claims.sub,
      email: claims.email.toLowerCase(),
      fullName: optionalMetadataString(metadata, "full_name", "name"),
      avatarUrl: optionalMetadataString(metadata, "avatar_url", "picture")
    };
  }

  public async getOrCreateProfile(identity: AuthIdentity): Promise<AuthProfile> {
    const user = await this.prisma.user.upsert({
      where: { id: identity.id },
      create: {
        id: identity.id,
        email: identity.email,
        fullName: identity.fullName,
        avatarUrl: identity.avatarUrl
      },
      update: { email: identity.email },
      select: profileSelect
    });

    if (user.isBlocked) {
      throw new AppError(403, "FORBIDDEN", "This account has been blocked.");
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
