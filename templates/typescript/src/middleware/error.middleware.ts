import type { NextFunction, Request, Response } from "express";
import { AppError, BadRequestError } from "../utils/AppError";
import { errorResponse } from "../utils/responseHelpers";
import { getTimeStamp } from "../utils/helpers";

// Express error handler — needs all 4 params, that's how Express recognizes it.
export default function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  const timeStamp = getTimeStamp();

  // Expected errors — log them and send their details
  if (error instanceof AppError) {
    console.log(
      `[${timeStamp}] [ERROR] ${req.method} ${req.originalUrl} - ${error.message}`,
    );

    return errorResponse(res, {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
      fields: error instanceof BadRequestError ? error.fields : undefined, // fields only for bad requests
    });
  }

  // Not an AppError — build a message if it's an Error, otherwise fall back
  const message =
    error instanceof Error ? error.message : "Internal server error";

  console.error(
    `[${timeStamp}] [ERROR] ${req.method} ${req.originalUrl} - ${message}`,
    error,
  );

  return errorResponse(res, {
    statusCode: 500,
    message,
  });
}
