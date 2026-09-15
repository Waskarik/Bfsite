import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// Helmet adds security-related HTTP headers. HSTS is disabled on localhost
// so local development does not get forced from HTTP to HTTPS.
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
} else {
  app.use(helmet({ strictTransportSecurity: false }));
}

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  }),
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "badfish-auth-server" });
});

app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
