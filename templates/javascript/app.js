import express from "express";

const app = express();

app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "API is up and running",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

export default app;
