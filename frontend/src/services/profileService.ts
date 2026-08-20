import type { ApiSuccessResponse } from "../types/api";
import type { AuthProfile } from "../types/auth";
import apiClient from "./api";

export const profileService = {
  async getCurrent(): Promise<AuthProfile> {
    const response = await apiClient.get<ApiSuccessResponse<AuthProfile>>("/api/v1/auth/me");
    return response.data.data;
  }
};
