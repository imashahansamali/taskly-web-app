const dns = require('node:dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

require("dotenv").config();
const express = require("express"),
  mongoose = require("mongoose"),
  cors = require("cors");
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));
// Small bounded, process-local throttle for authentication endpoints.
const attempts = new Map();
app.use("/api/auth", (req, res, next) => {
  if (req.method !== "POST") return next();
  const now = Date.now(),
    key = req.ip;
  let a = attempts.get(key);
  if (!a || a.until < now) a = { count: 0, until: now + 15 * 60 * 1000 };
  a.count++;
  attempts.set(key, a);
  if (attempts.size > 5000)
    for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
  if (a.count > 50)
    return res
      .status(429)
      .json({ message: "Too many attempts. Try again in 15 minutes." });
  next();
});
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));
app.use((err, _req, res, _next) => {
  const invalid =
    err.name === "ValidationError" ||
    err.name === "CastError" ||
    err.message?.includes("task") ||
    err.message?.includes("subtask");
  res
    .status(err.code === 11000 ? 409 : invalid ? 400 : 500)
    .json({
      message:
        err.code === 11000
          ? "Email is already in use."
          : invalid
            ? err.message
            : "Could not process the request. Please retry.",
    });
});
async function start() {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET)
    throw new Error("Set MONGO_URI and JWT_SECRET in taskly-backend/.env");
  await mongoose.connect(process.env.MONGO_URI);
  app.listen(process.env.PORT || 5000, () =>
    console.log("Taskly API ready on port " + (process.env.PORT || 5000)),
  );
}
if (require.main === module)
  start().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
module.exports = app;
