import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

const app = express();
const port = 3000;

await connectDB();

/* ================================
   🔐 STRIPE WEBHOOK (RAW BODY)
   MUST BE BEFORE express.json()
================================ */
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

/* ================================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json()); // ❗ AFTER webhook
app.use(clerkMiddleware());

/* ================================
   ROUTES
================================ */
app.get("/", (req, res) => res.send("Server is live"));

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

/* ================================
   SERVER
================================ */
app.listen(port, () =>
  console.log(`🚀 Server running at http://localhost:${port}`)
);
