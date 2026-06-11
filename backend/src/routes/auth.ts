import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../lib/supabase";
import { env } from "../lib/env";
import { logger } from "../lib/logger";

const router = Router();

// Regular client for sign-in (uses anon key)
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

/**
 * POST /api/auth/signup
 * Creates a new user account in Supabase Auth
 */
router.post("/auth/signup", async (req, res) => {
  try {
    const { email, password } = (req.body ?? {}) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for local development
    });

    if (error) {
      logger.error({ error }, "Signup failed");
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({
      id: data.user.id,
      email: data.user.email,
    });
  } catch (err) {
    logger.error({ err }, "Signup error");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/auth/signin
 * Signs in a user and returns session tokens
 */
router.post("/auth/signin", async (req, res) => {
  try {
    const { email, password } = (req.body ?? {}) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error({ error }, "Signin failed");
      res.status(401).json({ error: error.message });
      return;
    }

    res.json({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (err) {
    logger.error({ err }, "Signin error");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/auth/logout
 * Invalidates the session (handled on client)
 */
router.post("/auth/logout", (_req, res) => {
  res.json({ ok: true });
});

/**
 * GET /api/auth/me
 * Returns current user from JWT token
 */
router.get("/auth/me", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    res.json(user);
  } catch (err) {
    logger.error({ err }, "Auth me error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
