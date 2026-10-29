import { NotFoundError } from "../utils/AppError.js";

export default function notFoundMiddleware(_req, _res, next) {
  next(new NotFoundError("Route not found"));
}
