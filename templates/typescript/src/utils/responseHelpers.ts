import type { Response } from "express";

export type FieldError = {
  field: string;
  message: string;
};

type SuccessOptions<T> = {
  statusCode?: number;
  message: string;
  data?: T;
};

export function successResponse<T>(
  res: Response,
  { statusCode = 200, message, data }: SuccessOptions<T>,
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

type ErrorOptions = {
  statusCode?: number;
  message: string;
  code?: string;
  fields?: FieldError[];
};

export function errorResponse(
  res: Response,
  { statusCode = 500, message, code = "INTERNAL_ERROR", fields }: ErrorOptions,
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    fields,
  });
}
