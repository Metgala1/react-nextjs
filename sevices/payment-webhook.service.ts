import { Prisma } from "@/app/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export interface PaymentWebhookPayload {
    event: string
    eventId: string
    transactionId: string
    orderId: number
    amount: number
    currency: string
}

export async function ProcessPaymentWebhook(
    payload: PaymentWebhookPayload
) {
    try {
        await prisma.webhookEvent.create({
            data: {
                eventId: payload.eventId,
                eventType: payload.event,
            },
        })

        return { duplicate: false }
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return { duplicate: true }
        }

        throw error
    }
}

export async function getPaymentWebhook(eventId: string) {
    return prisma.webhookEvent.findUnique({
        where: {
            eventId,
        },
    })
}