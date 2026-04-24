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

let mongoConnected = false;
async function connectMongo() {
  if (mongoConnected || mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  mongoConnected = true;
}

// Vercel serverless — export app and connect on each cold start
if (process.env.VERCEL) {
  module.exports = async (req, res) => {
    await connectMongo();
    app(req, res);
  };
} else {
  // Local dev — connect then listen
  connectMongo()
    .then(() => {
      console.log("MongoDB connected");
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error("MongoDB connection failed:", err.message);
      process.exit(1);
    });
}
