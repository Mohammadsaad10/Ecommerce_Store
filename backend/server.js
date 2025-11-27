import express from "express";
import dotenv from "dotenv";
dotenv.config();
import path from "path";

const __dirname = path.resolve();

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json({ limit: "10mb" })); //allows to parse JSON bodies with a size limit of 10mb, json -> object
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "frontend", "dist");
  app.use(express.static(clientDist));

  // Fallback middleware: serve index.html for any request that doesn't match
  // a static file. Using `app.use` avoids registering a path pattern that
  // may be interpreted by path-to-regexp and cause parsing errors.
  app.use((req, res) => {
    res.sendFile(path.resolve(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log("Server is running at http://localhost:" + PORT);
  connectDB();
});
