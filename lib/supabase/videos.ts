import { createAdminClient } from "./admin";

const BUCKET = "videos";
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB (Supabase's default per-file cap)

const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  "video/webm": "webm",
  "video/mp4": "mp4",
};

export type UploadVideoResult =
  | { success: true; path: string }
  | { success: false; message: string };

export async function uploadVideo(video: File): Promise<UploadVideoResult> {
  // MediaRecorder types look like "video/webm;codecs=vp9". Keep the base type.
  const contentType = video.type.split(";")[0].trim();
  const extension = ALLOWED_VIDEO_TYPES[contentType];

  if (!extension) {
    return { success: false, message: "Only WebM and MP4 videos are allowed" };
  }

  if (video.size === 0) {
    return { success: false, message: "The video is empty" };
  }

  if (video.size > MAX_VIDEO_SIZE) {
    return { success: false, message: "Video must be smaller than 50mb" };
  }


  const filePath = `recordings/${crypto.randomUUID()}.${extension}`;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, video, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error(error);
    return { success: false, message: "Failed to upload video" };
  }

  return { success: true, path: data.path };
}

// The bucket is private, so playback needs a temporary signed URL.
export async function getVideoUrl(
  path: string,
  expiresInSeconds = 60 * 60
): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
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
  const { error } = await supabase.storage.from(BUCKET).remove([path]);

  if (error) {
    console.error("Failed to delete video:", error);
  }
}