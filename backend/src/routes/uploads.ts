import { Router } from "express";
import multer from "multer";
import { supabaseAdmin } from "../lib/supabase";
import { env } from "../lib/env";
import { logger } from "../lib/logger";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"));
  },
});

const router = Router();

router.post("/upload/photo", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ status: "error", message: "No file uploaded" });
    return;
  }

  try {
    const ext = req.file.originalname.split(".").pop()?.toLowerCase() ?? "jpg";
    const filename = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from("member-photos")
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      logger.error({ error: error.message }, "Photo upload failed");
      res.status(500).json({ status: "error", message: error.message });
      return;
    }

    const { data } = supabaseAdmin.storage
      .from("member-photos")
      .getPublicUrl(filename);

    logger.info({ url: data.publicUrl }, "Photo uploaded successfully");
    res.status(201).json({ status: "ok", url: data.publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error({ error: message }, "Photo upload error");
    res.status(500).json({ status: "error", message });
  }
});

export default router;
