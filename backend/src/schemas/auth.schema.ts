import { Type } from "typebox";
import { SuccessResponseSchema } from "./common.schema.js";

export const AuthProfileSchema = Type.Object(
  {
    id: Type.String({ format: "uuid" }),
    email: Type.String({ format: "email" }),
    username: Type.Union([Type.String(), Type.Null()]),
    fullName: Type.Union([Type.String(), Type.Null()]),
    avatarUrl: Type.Union([Type.String(), Type.Null()]),
    phone: Type.Union([Type.String(), Type.Null()]),
    role: Type.Union([
      Type.Literal("CUSTOMER"),
      Type.Literal("ORDER_STAFF"),
      Type.Literal("SHIPPER"),
      Type.Literal("ADMIN")
    ]),
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" })
  },
  { additionalProperties: false }
);

export const AuthProfileResponseSchema = SuccessResponseSchema(AuthProfileSchema);
