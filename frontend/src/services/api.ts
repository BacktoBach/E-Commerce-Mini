import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import axios, { type AxiosRequestConfig } from "axios";
import type { ApiClientError } from "../types/api";

interface ApiRequest {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: unknown;
  params?: unknown;
}

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: apiUrl,
  timeout: 10_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

let accessToken: string | null = null;

export function setApiAccessToken(token: string | null): void {
  accessToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`);
  else config.headers.delete("Authorization");
  return config;
});

const axiosBaseQuery = (): BaseQueryFn<ApiRequest, unknown, ApiClientError> => {
  return async ({ url, method = "GET", data, params }) => {
    try {
      const response = await apiClient({ url, method, data, params });
      return { data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData: unknown = error.response?.data;

        return {
          error: {
            status: error.response?.status ?? 0,
            message: error.message,
            ...(responseData === undefined ? {} : { data: responseData })
          }
        };
      }

      return {
        error: {
          status: 0,
          message: error instanceof Error ? error.message : "Unknown API error"
        }
      };
    }
  };
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  endpoints: () => ({})
});

export default apiClient;
