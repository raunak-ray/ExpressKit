import type { FieldError } from "../utils/responseHelpers";

export type AppErrorOptions = {
  code?: string;
  statusCode?: number;
};

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(
    message: string,
    { code = "INTERNAL_ERROR", statusCode = 500 }: AppErrorOptions = {},
  ) {
    super(message);

    this.name = this.constructor.name;
    this.code = code; // machine-readable code, e.g. "BAD_REQUEST"
    this.statusCode = statusCode; // HTTP status to send back
  }
}

export class BadRequestError extends AppError {
  public readonly fields: FieldError[]; // only this error carries fields

  constructor(message = "Bad request", fields: FieldError[] = []) {
    super(message, { code: "BAD_REQUEST", statusCode: 400 });

    this.fields = fields;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, { code: "UNAUTHORIZED", statusCode: 401 });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, { code: "NOT_FOUND", statusCode: 404 });
  }
}
