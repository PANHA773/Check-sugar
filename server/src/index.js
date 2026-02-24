import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { getSugarLevel } from "./utils/sugarLevel.js";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cambo_sugar_scan";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = CLIENT_URL.split(",").map((value) => value.trim()).filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server, curl, and same-origin requests without Origin header.
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      try {
        const hostname = new URL(origin).hostname;
        const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
        const isNetlifyPreview = hostname.endsWith(".netlify.app");
        if (isLocalhost || isNetlifyPreview) {
          return callback(null, true);
        }
      } catch {
        return callback(new Error("Invalid Origin header"));
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Cambo Sugar Scan API is running" });
});

app.get("/api/sugar-score/:sugarPer100g", (req, res) => {
  const sugarPer100g = Number(req.params.sugarPer100g);
  const level = getSugarLevel(sugarPer100g);
  res.json({ sugarPer100g, sugarLevel: level });
});

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.use((err, _req, res, _next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      message: "Upload too large. Please use a smaller profile image."
    });
  }
  // Keep error output small and safe for production clients.
  console.error(err);
  res.status(500).json({ message: "មានបញ្ហានៅម៉ាស៊ីនមេ (Server error)" });
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Cannot start server:", error.message);
    process.exit(1);
  }
}

start();
