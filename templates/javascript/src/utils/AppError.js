export class AppError extends Error {
  constructor(message, { code = "INTERNAL_ERROR", statusCode = 500 } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.code = code; // machine-readable code, e.g. "BAD_REQUEST"
    this.statusCode = statusCode; // HTTP status to send back
  }
}

export class BadRequestError extends AppError {
  // fields: validation errors, e.g. [{ field: "email", message: "required" }]
  constructor(message = "Bad request", fields = []) {
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
