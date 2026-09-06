import crypto from "crypto"
import {prisma} from "@/lib/prisma"
import { cookies } from "next/headers"

export async function createSession(userId: number) {
    const sessionId = crypto.randomBytes(32).toString("hex")

    const expiresAt = new Date()

    expiresAt.setDate(
        expiresAt.getDate() + 7
    )

    await prisma.session.create({
        data: {
            id: sessionId,
            userId,
            expiresAt
        }
    })

    return sessionId

}

export async function getSession() {
    const cookieStore = await cookies()

    const sessionId = cookieStore.get("session")?.value

    if(!sessionId) {
        return null
    }

    const session = await prisma.session.findUnique({
        where: {
            id: sessionId
        },
        include: {
            user: true
        }
    })

    if(!session) {
        return null
    }

    if(session.expiresAt < new Date()) {
        return null
    }

    return session

}