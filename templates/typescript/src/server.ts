import app from "./app";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
