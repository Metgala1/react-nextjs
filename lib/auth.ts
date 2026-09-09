import crypto from "crypto"
import {prisma} from "@/lib/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

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
        select: {
            id: true,
            expiresAt: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    UserRole: true
                }
            }
        }
    })

    if(!session) {
        return null
    }

    if(session.expiresAt < new Date()) {
        await prisma.session.delete({
            where: {
                id: session.id
            }
        })
        return null
    }

    return session

}

export async function requireAdmin() {
    const session = await getSession()

    if(!session) {
       redirect("/auth/login")
    }

    if(session.user.UserRole !== "ADMIN") {
        return null
    }

    return session
}

export async function requireAuth() {
    const session = await getSession()

    if(!session) {
        redirect("/auth/login")
    }

    return session
}

export async function getCurrentUser() {
    const session = await getSession()

    return session?.user ?? null
}


import {
  hasPermission,
  type Permission,
} from "@/lib/permissions"

export async function requirePermission(
  permission: Permission
) {
  const session = await requireAuth()

  if (
    !hasPermission(
      session.user.UserRole,
      permission
    )
  ) {
    throw new Error("Forbidden")
  }

  return session
}