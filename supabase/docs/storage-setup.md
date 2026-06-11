# Supabase Storage — Member Photo Uploads

The app uses Supabase Storage for member photo uploads. This provides a persistent, CDN-backed object store that scales automatically.

---

## Step 1 — Create the storage bucket

The storage bucket is created automatically via migration: `supabase/migrations/20250611000001_storage_setup.sql`

### Manual Setup (if needed)

1. Open your project → **Storage**
2. Click **New bucket**
3. Name: `member-photos`
4. Toggle **Public bucket** ON (photos are public — anyone with the URL can view)
5. Click **Create bucket**

### Via SQL migration

```sql
-- supabase/migrations/0001_storage.sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'member-photos',
  'member-photos',
  true,
  5242880,  -- 5 MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Allow authenticated users to upload
CREATE POLICY "auth_upload_photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'member-photos');

-- Allow public read
CREATE POLICY "public_read_photos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'member-photos');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "auth_delete_photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'member-photos');
```

---

## Step 2 — Install the Supabase client (if not already done)

```bash
pnpm --filter backend add @supabase/supabase-js
```

---

## Step 3 — Upload Route Implementation

The upload route is already implemented in `backend/src/routes/uploads.ts` and configured to use Supabase Storage:

```typescript
// backend/src/routes/uploads.ts
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
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Invalid file type"));
  },
});

const router = Router();

router.post("/upload/photo", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ status: "error", message: "No file uploaded" });
    return;
  }

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
```

---

## Step 4 — Required Environment Variables

Supabase URL and credentials must be configured in `.env`:

```env
# Already configured in backend .env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
```

---

## Step 5 — Wire up the upload in the frontend

In the member creation wizard (`MemberWizard.tsx`), add a photo upload field:

```typescript
// Upload helper
async function uploadPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("photo", file);

  const res = await fetch("/api/upload/photo", {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type header — the browser sets it with the boundary
  });

  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url; // Supabase public URL
}
```

Store the returned URL in the `photoUrl` field when creating/updating a member.

---

## File size and type limits

| Setting | Value |
|---|---|
| Max file size | 5 MB |
| Allowed types | JPEG, PNG, WebP, GIF |
| Storage location | Supabase CDN (globally distributed) |
| URL format | `https://<project>.supabase.co/storage/v1/object/public/member-photos/<filename>` |

---

## Cleaning up orphaned files

If a member is deleted, their photo remains in Storage. To clean up automatically, use a Supabase database webhook or a scheduled Edge Function:

```typescript
// supabase/functions/cleanup-orphaned-photos/index.ts
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: files } = await supabase.storage.from("member-photos").list("photos");
  const { data: members } = await supabase.from("members").select("photo_url");

  const activeUrls = new Set(members?.map((m: any) => m.photo_url).filter(Boolean));

  for (const file of files ?? []) {
    const path = `photos/${file.name}`;
    const { data } = supabase.storage.from("member-photos").getPublicUrl(path);
    if (!activeUrls.has(data.publicUrl)) {
      await supabase.storage.from("member-photos").remove([path]);
    }
  }

  return new Response("Cleanup done");
});
```
