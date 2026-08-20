import type { Session, User } from "@supabase/supabase-js";
import { useEffect, type PropsWithChildren } from "react";
import {
  authAuthenticated,
  authFailed,
  authLoading,
  authUnauthenticated
} from "../redux/slices/authSlice";
import { useAppDispatch } from "../redux/hooks";
import { setApiAccessToken } from "../services/api";
import { authService } from "../services/authService";
import { profileService } from "../services/profileService";
import type { AuthUser } from "../types/auth";

function optionalMetadataString(user: User, ...keys: string[]): string | null {
  for (const key of keys) {
    const value: unknown = user.user_metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? "",
    displayName: optionalMetadataString(user, "full_name", "name"),
    avatarUrl: optionalMetadataString(user, "avatar_url", "picture")
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let active = true;
    let synchronizationId = 0;

    const synchronize = async (session: Session | null) => {
      const currentId = ++synchronizationId;
      setApiAccessToken(session?.access_token ?? null);

      if (!session) {
        if (active) dispatch(authUnauthenticated());
        return;
      }

      const user = toAuthUser(session.user);
      if (active) dispatch(authLoading(user));

      try {
        const profile = await profileService.getCurrent();
        if (active && currentId === synchronizationId) {
          dispatch(authAuthenticated({ user, profile }));
        }
      } catch (error) {
        if (active && currentId === synchronizationId) {
          setApiAccessToken(null);
          dispatch(
            authFailed(error instanceof Error ? error.message : "Unable to load your profile.")
          );
        }
      }
    };

    void authService
      .getSession()
      .then(synchronize)
      .catch((error: unknown) => {
        if (active) {
          dispatch(
            authFailed(error instanceof Error ? error.message : "Unable to restore session.")
          );
        }
      });

    const { data } = authService.onAuthStateChange((_event, session) => {
      void synchronize(session);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [dispatch]);

  return children;
}
