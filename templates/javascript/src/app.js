import express from "express";
import errorMiddleware from "./middleware/error.middleware.js";
import notFoundMiddleware from "./middleware/notFound.middleware.js";
import { getTimeStamp } from "./utils/helpers.js";
import { successResponse } from "./utils/responseHelpers.js";

const app = express();

app.use(express.json());

// Health check
app.get("/health", (_req, res) =>
  successResponse(res, {
    statusCode: 200,
    message: "API is up and running",
    data: {
      status: "ok",
      uptime: Math.round(process.uptime()),
      timestamp: getTimeStamp(),
    },
  }),
);

// Unknown routes → 404, then every error gets formatted in one place.
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
