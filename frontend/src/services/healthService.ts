import type { ApiSuccessResponse } from "../types/api";
import { baseApi } from "./api";

type LiveResponse = ApiSuccessResponse<{ service: "up" }>;

const healthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApiHealth: builder.query<LiveResponse, undefined>({
      query: () => ({ url: "/health/live" })
    })
  })
});

export const { useGetApiHealthQuery } = healthApi;
