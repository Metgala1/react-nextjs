// lib/supabase/videos.ts
import { createAdminClient } from "./admin";

export const VIDEO_BUCKET = "videos";
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB (Supabase's default per-file cap)

const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  "video/webm": "webm",
  "video/mp4": "mp4",
};

export type ValidateVideoResult =
  | { ok: true; contentType: string; extension: string }
  | { ok: false; message: string };

export type UploadToStorageResult =
  | { success: true }
  | { success: false; message: string };

// Step 1: check the file before touching the database or storage.
export function validateVideo(video: File): ValidateVideoResult {
  // MediaRecorder types look like "video/webm;codecs=vp9". Keep the base type.
  const contentType = video.type.split(";")[0].trim();
  const extension = ALLOWED_VIDEO_TYPES[contentType];

  if (!extension) {
    return { ok: false, message: "Only WebM and MP4 videos are allowed" };
  }

  if (video.size === 0) {
    return { ok: false, message: "The video is empty" };
  }

  if (video.size > MAX_VIDEO_SIZE) {
    return { ok: false, message: "Video must be smaller than 50mb" };
  }

  return { ok: true, contentType, extension };
}

// Step 2: build the storage path up front so it can be saved on the
// database row before the upload starts.
export function createVideoPath(extension: string): string {
  return `recordings/${crypto.randomUUID()}.${extension}`;
}

// Step 3: upload the file to exactly that path.
export async function uploadVideoToStorage(
  video: File,
  path: string,
  contentType: string
): Promise<UploadToStorageResult> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .upload(path, video, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error(error);
    return { success: false, message: "Failed to upload video" };
  }

  return { success: true };
}

// The bucket is private, so playback needs a temporary signed URL.
export async function getVideoUrl(
  path: string,
  expiresInSeconds = 60 * 60
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    console.error("Failed to create signed URL:", error);
    return null;
  }

  return data.signedUrl;
}

export async function deleteVideo(
  path: string | null | undefined
): Promise<void> {
  if (!path) return;

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(VIDEO_BUCKET).remove([path]);

  if (error) {
    console.error("Failed to delete video:", error);
  }
}

// Sign many paths in one request. Returns a map of path -> signed URL.
export async function getVideoUrls(
  paths: string[],
  expiresInSeconds = 60 * 60
): Promise<Record<string, string>> {
  if (paths.length === 0) return {};

  const supabase = createAdminClient();

  const { data, error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .createSignedUrls(paths, expiresInSeconds);

  if (error || !data) {
    console.error("Failed to create signed URLs:", error);
    return {};
  }

  const urls: Record<string, string> = {};

  for (const item of data) {
    if (item.path && item.signedUrl) {
      urls[item.path] = item.signedUrl;
    }
  }

  return urls;
}