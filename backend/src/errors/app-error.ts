export type ErrorCode =
  "VALIDATION_ERROR" | "DATABASE_UNAVAILABLE" | "NOT_FOUND" | "INTERNAL_ERROR";

export class AppError extends Error {
  public constructor(
    public readonly statusCode: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}
