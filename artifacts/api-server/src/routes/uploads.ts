import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `photo-${unique}${ext}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

router.use("/uploads", (req, res, next) => {
  const filename = path.basename(req.path);
  const filePath = path.join(UPLOAD_DIR, filename);
  if (!filePath.startsWith(UPLOAD_DIR)) {
    res.status(400).json({ status: "error", message: "Invalid path" });
    return;
  }
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ status: "error", message: "File not found" });
    return;
  }
  next();
});

router.use("/uploads", (req, res, next) => {
  const filename = path.basename(req.path);
  const filePath = path.join(UPLOAD_DIR, filename);
  res.sendFile(filePath, (err) => {
    if (err) next(err);
  });
});

router.post("/upload/photo", upload.single("photo"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ status: "error", message: "No file uploaded" });
    return;
  }
  const url = `/api/uploads/${req.file.filename}`;
  res.status(201).json({ status: "ok", url });
});

export default router;
