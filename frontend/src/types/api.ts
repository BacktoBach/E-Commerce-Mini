export interface ApiMeta {
  requestId: string;
}

export interface ApiSuccessResponse<T> {
  status: "success";
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorResponse {
  status: "error";
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: ApiMeta;
}

export interface ApiClientError {
  status: number;
  message: string;
  data?: unknown;
}
