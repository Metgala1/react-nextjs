"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
});

export type LoginState = {
    success: boolean;
    message: string;
    error?: {
        email?: string[];
        password?: string[];
    };
};

export async function loginUser(prevState: LoginState, formData: FormData): Promise<LoginState> {
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

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return {
            success: false,
            message: "Invalid email or password.",
        };
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
        return {
            success: false,
            message: "Invalid email or password.",
        };
    }

    redirect("/");
}
