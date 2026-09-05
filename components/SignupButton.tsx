"use client";

import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
    children?: React.ReactNode;
    loadingText?: string;
    className?: string;
}

export default function SignUpButton({
    children = "Sign Up",
    loadingText = "Processing...",
    className = "",
}: SubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {pending ? loadingText : children}
        </button>
    );
}
