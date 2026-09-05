"use client";

import { useActionState } from "react";
import { createUser } from "@/actions/signUp";
import Link from "next/link";
import SignUpButton from "./SignupButton";

type CreateUserState = {
    success: boolean;
    message: string;
    error?: {
        name?: string[];
        email?: string[];
        password?: string[];
    };
};

const initialState: CreateUserState = {
    success: false,
    message: "",
};

export default function SignupPage() {
    const [state, formAction] = useActionState(createUser, initialState);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-10">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create an Account</h1>
                    <p className="text-sm text-slate-500 mt-1">Enter your details to get started</p>
                </div>

                {state.message && !state.success && (
                    <div className="mb-6 p-4 text-xs font-semibold text-red-600 bg-red-50 rounded-xl border border-red-100">
                        {state.message}
                    </div>
                )}

                <form action={formAction} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                            Full Name
                        </label>
                        <input
                            name="name"
                            type="text"
                            required
                            placeholder="met gala"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                        />
                        {state.error?.name && (
                            <p className="text-red-500 text-xs mt-1">{state.error.name[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                            Email Address
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="metgala@example.com"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                        />
                        {state.error?.email && (
                            <p className="text-red-500 text-xs mt-1">{state.error.email[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                        />
                        {state.error?.password && (
                            <p className="text-red-500 text-xs mt-1">{state.error.password[0]}</p>
                        )}
                    </div>

                    <SignUpButton />
                </form>

                <p className="text-center text-xs text-slate-500 mt-6">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
