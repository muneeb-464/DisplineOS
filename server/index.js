require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const rateLimit = require("express-rate-limit");
const { Redis } = require("@upstash/redis");
const { RedisStore } = require("rate-limit-redis");
const authRoutes = require("./routes/auth");
const dataRoutes = require("./routes/data");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:8080",
  credentials: true,
}));
app.use(express.json({ limit: "512kb" }));
app.use(cookieParser());
app.use(passport.initialize());

// Redis-backed rate limiting — works correctly across Vercel serverless instances.
// Falls back to in-memory if UPSTASH_REDIS_REST_URL is not set (local dev).
function makeStore() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    return new RedisStore({ sendCommand: (...args) => redis.sendCommand(args) });
  }
  return undefined; // in-memory (local dev only)
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
  message: { error: "Too many requests, please try again later" },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
  message: { error: "Too many requests, please try again later" },
});

app.use("/auth", authLimiter);
app.use("/api", apiLimiter);

app.use("/auth", authRoutes);
app.use("/api", dataRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });
