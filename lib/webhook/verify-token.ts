// lib/webhooks/verify-webhook.ts
import crypto from "node:crypto";
import { AppError } from "@/lib/errors";

export async function verifyWebhook<T = unknown>(request: Request): Promise<T> {
    // 1. Raw body (must be read as text, before any JSON parsing)
    const rawBody = await request.text();

    // 2. Signature header
    const signature = request.headers.get("x-webhook-signature");

    // 3. Secret
    const secret = process.env.WEBHOOK_SECRET;
    if (!secret) {
        throw new Error("WEBHOOK_SECRET is not configured");
    }

    if (!signature) {
        throw new AppError(
            "Missing webhook signature",
            400,
            "MISSING_WEBHOOK_SIGNATURE",
        );
    }

    // 4. Generate the expected HMAC-SHA256 signature
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

    // 5. Constant-time comparison (timingSafeEqual throws if lengths differ)
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    const isValid =
        signatureBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    // 6. Reject invalid signatures
    if (!isValid) {
        throw new AppError(
            "Invalid webhook signature",
            401,
            "INVALID_WEBHOOK_SIGNATURE",
        );
    }

    // 7. Only now parse the JSON
    try {
        return JSON.parse(rawBody) as T;
    } catch {
        throw new AppError("Invalid JSON payload", 400, "INVALID_JSON_PAYLOAD");
    }
}