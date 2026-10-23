export function successResponse(res, { statusCode = 200, message, data }) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(
  res,
  { statusCode = 500, message, code = "INTERNAL_ERROR", fields },
) {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    fields,
  });
}
