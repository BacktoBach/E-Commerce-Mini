import { Type } from "typebox";
import { ErrorResponseSchema, SuccessResponseSchema } from "./common.schema.js";

export const LiveResponseSchema = SuccessResponseSchema(
  Type.Object({ service: Type.Literal("up") }, { additionalProperties: false })
);

export const ReadyResponseSchema = SuccessResponseSchema(
  Type.Object(
    { service: Type.Literal("up"), database: Type.Literal("up") },
    { additionalProperties: false }
  )
);

export const HealthErrorResponseSchema = ErrorResponseSchema;
