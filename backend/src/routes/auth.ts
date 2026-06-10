import { Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";

const router = Router();
const COOKIE_NAME = "atfal_session";

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 24 * 60 * 60 * 1000,
  };
}

router.post("/auth/login", (req, res) => {
  const { username, password } = (req.body ?? {}) as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = jwt.sign({ username, role: "admin" }, env.JWT_SECRET, { expiresIn: "24h" });
  res.cookie(COOKIE_NAME, token, cookieOptions());
  res.json({ username, role: "admin" });
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

router.get("/auth/me", (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  try {
    const user = jwt.verify(token, env.JWT_SECRET) as { username: string; role: string };
    res.json({ username: user.username, role: user.role });
  } catch {
    res.clearCookie(COOKIE_NAME);
    res.status(401).json({ error: "Invalid or expired session" });
  }
});

export default router;
