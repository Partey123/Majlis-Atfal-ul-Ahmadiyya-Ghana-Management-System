import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabase";
import { logger } from "../lib/logger";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.path === "/healthz") {
    next();
    return;
  }

  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    // Verify JWT token using Supabase
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      logger.error({ error }, "Auth verification failed");
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // Attach user to request
    (req as Request & { user: typeof user }).user = user;
    next();
  } catch (err) {
    logger.error({ err }, "Auth middleware error");
    res.status(401).json({ error: "Authentication failed" });
  }
}
