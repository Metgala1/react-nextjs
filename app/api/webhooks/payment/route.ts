// app/api/webhooks/route.ts
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";
import { handleApiError } from "@/lib/handle-api-error";
import { verifyWebhook } from "@/lib/webhook/verify-token";
import { ProcessPaymentWebhook } from "@/sevices/payment-webhook.service";

export async function POST(request: Request) {
    try {
        const payload = await verifyWebhook(request);

        console.log("Webhook received", payload);

        return NextResponse.json({ received: true });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json(
                { error: error.message },
                { status: error.statusCode }
            );
        }

        console.error("Webhook error", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}