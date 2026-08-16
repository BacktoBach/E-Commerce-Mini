import { Type } from "typebox";

export const ErrorCodeSchema = Type.Union([
  Type.Literal("VALIDATION_ERROR"),
  Type.Literal("DATABASE_UNAVAILABLE"),
  Type.Literal("NOT_FOUND"),
  Type.Literal("INTERNAL_ERROR")
]);

export const ErrorResponseSchema = Type.Object(
  {
    status: Type.Literal("error"),
    error: Type.Object(
      {
        code: ErrorCodeSchema,
        message: Type.String(),
        details: Type.Optional(Type.Record(Type.String(), Type.Unknown()))
      },
      { additionalProperties: false }
    ),
    meta: Type.Object({ requestId: Type.String() }, { additionalProperties: false })
  },
  { additionalProperties: false }
);

export function SuccessResponseSchema<T extends ReturnType<typeof Type.Object>>(data: T) {
  return Type.Object(
    {
      status: Type.Literal("success"),
      data,
      meta: Type.Object({ requestId: Type.String() }, { additionalProperties: false })
    },
    { additionalProperties: false }
  );
}
