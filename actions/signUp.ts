"use server";

import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/schema/products.schema";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

export type CreateUserState = {
    success: boolean;
    message: string;
    error?: {
        name?: string[];
        email?: string[];
        password?: string[];
    };
};

export async function createUser(previousState: CreateUserState, formData: FormData): Promise<CreateUserState> {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = signupSchema.safeParse({ name, email, password });

    if (!result.success) {
        return {
            success: false,
            message: "Validation failed. Please check the fields below.",
            error: result.error.flatten().fieldErrors,
        };
    }

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return {
            success: false,
            message: "An account with this email already exists.",
        };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
        await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
        });
    } catch (error) {
        return {
            success: false,
            message: "Failed to create account. Please try again.",
        };
    }

    redirect("/");
}
