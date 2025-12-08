import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import routes
import merchantRoutes from "./routes/merchants.js";
import sessionRoutes from "./routes/sessions.js";
import tipRoutes from "./routes/tips.js";
import paymentRoutes from "./routes/payments.js";
import receiptRoutes from "./routes/receipts.js";
import disputeRoutes from "./routes/disputes.js";
import webhookRoutes from "./routes/webhooks.js";
import embedRoutes from "./routes/embed.js";

// Import config
import { getChainConfig } from "./config/chains.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later" },
});
app.use("/api/", limiter);

// Body parsing
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/merchants", merchantRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/tips", tipRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/embed", embedRoutes);

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    name: "Tink Protocol API",
    version: "1.0.0",
    description:
      "AI-native micro-tipping backend with x402 + Thirdweb on Avalanche",
    endpoints: {
      health: "/health",
      merchants: "/api/merchants",
      sessions: "/api/sessions",
      tips: "/api/tips",
      payments: "/api/payments",
      receipts: "/api/receipts",
      disputes: "/api/disputes",
      webhooks: "/api/webhooks",
      embed: "/api/embed",
    },
  });
});

// API info endpoint
app.get("/api", (_req, res) => {
  res.json({
    name: "Tink Protocol API",
    version: "1.0.0",
    documentation: "/api/docs",
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
);

// Start server
const chainConfig = getChainConfig();
app.listen(PORT, () => {
  console.log(`
🟢 Server:      http://localhost:${PORT}
📡 API:         http://localhost:${PORT}/api
💚 Health:      http://localhost:${PORT}/health
🔗 Network:     ${chainConfig.name}
💰 USDC:        ${chainConfig.usdc}
  `);
});

export default app;
