import { NotFoundError } from "../utils/AppError.js";

export default function notFoundMiddleware(req, res, next) {
  next(new NotFoundError("Route not found"));
}
