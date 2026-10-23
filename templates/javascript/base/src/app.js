import express from "express";
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

export default app;
