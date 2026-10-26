
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { z } from "zod";
import { cookies } from "next/headers";
import { createSession } from "@/lib/auth";
import {
    checkLoginRateLimit,
    recordFailedLogin,
    clearFailedLogins,
} from "@/lib/rate-limit";

const loginSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address",
    }),
    password: z.string().min(8, {
        message: "Password is required",
    }),
});

export type LoginState = {
    success: boolean;
    message: string;
    error?: {
        email?: string[];
        password?: string[];
    };
};

export async function loginUser(
    prevState: LoginState,
    formData: FormData
): Promise<LoginState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
        return {
            success: false,
            message: "Validation failed. Please check your inputs.",
            error: result.error.flatten().fieldErrors,
        };
    }

    const normalizedEmail = result.data.email.trim().toLowerCase();

    // 1. Check the rate limit before accessing the database.
    const rateLimit = checkLoginRateLimit(normalizedEmail);

    if (rateLimit.limited) {
        return {
            success: false,
            message: `Too many failed login attempts. Try again in ${rateLimit.retryAfterSeconds} seconds.`,
        };
    }

    // 2. Find the user.
    const user = await prisma.user.findUnique({
        where: { email },
    });

    // 3. Record failed attempts without revealing
    // whether the email address exists.
    if (!user) {
        recordFailedLogin(normalizedEmail);

        return {
            success: false,
            message: "Invalid email or password.",
        };
    }

    // 4. Verify the password.
    const passwordMatch = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!passwordMatch) {
        recordFailedLogin(normalizedEmail);

        return {
            success: false,
            message: "Invalid email or password.",
        };
    }

    // 5. Successful login clears this email's failure history.
    clearFailedLogins(normalizedEmail);

    // 6. Keep your existing session creation.
    const sessionId = await createSession(user.id);
    const cookieStore = await cookies();

    cookieStore.set("session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });

    redirect("/");
}
