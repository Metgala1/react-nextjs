// app/api/webhooks/payment/route.ts
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";
import { verifyWebhook } from "@/lib/webhook/verify-token";
import { paymentWebhookSchema } from "@/schema/payment-webhook.schema";
import { ProcessPaymentWebhook } from "@/sevices/payment-webhook.service";
import { handleApiError } from "@/lib/handle-api-error";
export async function POST(request: Request) {
    try {
        const body = await verifyWebhook(request);

        const result = paymentWebhookSchema.safeParse(body);
        if (!result.success) {
            throw new AppError(
                "Invalid webhook payload",
                400,
                "INVALID_WEBHOOK_PAYLOAD",
            );
        }

        const payload = result.data; // fully typed, no cast needed

        const res = await ProcessPaymentWebhook({
            ...payload,
            orderId: Number(payload.orderId),
        });
        // handle payload.event, payload.orderId, etc.

        return NextResponse.json({
            received: true,
            duplicate: res.duplicate

        });
    } catch (error) {
        console.error("Webhook error", error);
        return handleApiError(error)
    }
}
//1