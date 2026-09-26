import z from "zod";

export const paymentWebhookSchema = z.object({
    event: z.string(),
    eventId: z.string(),
    transactionId: z.string(),
    orderId: z.coerce.string(),
    amount: z.number(),
    currency: z.string()
})

