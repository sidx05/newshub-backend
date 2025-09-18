// backend/src/routes/index.ts
import { Express } from "express";
import publicRoutes from "./public.routes";
import adminRoutes from "./admin.routes";
import authRoutes from "./auth.routes";

/**
 * Mount application routes in one place.
 * - /api -> public REST endpoints
 * - /admin -> admin UI / APIs
 * - /auth -> auth routes
 */
export function setupRoutes(app: Express) {
  // public API under /api
  app.use("/api", publicRoutes);

  // admin and auth (keep same base paths as project expects)
  app.use("/admin", adminRoutes);
  app.use("/auth", authRoutes);
}
