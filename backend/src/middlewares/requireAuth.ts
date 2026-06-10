import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";

const COOKIE_NAME = "atfal_session";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.path === "/healthz") {
    next();
    return;
  }

  const token =
    req.cookies?.[COOKIE_NAME] ??
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const user = jwt.verify(token, env.JWT_SECRET) as { username: string; role: string };
    (req as Request & { user: typeof user }).user = user;
    next();
  } catch {
    res.clearCookie(COOKIE_NAME);
    res.status(401).json({ error: "Invalid or expired session" });
  }
}
