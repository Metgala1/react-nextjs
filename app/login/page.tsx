
'use client';

import { useActionState } from 'react';
import { loginUser } from '@/actions/login';
import type { LoginState } from '@/actions/login';

const initialState: LoginState = {
    success: false,
    message: '',
};

export default function LoginPage() {
    const [state, formAction, pending] = useActionState(
        loginUser,
        initialState
    );

    return (
        <main>
            <h1>Login</h1>

            {state.message && (
                <p role="alert" aria-live="polite">
                    {state.message}
                </p>
            )}

            <form action={formAction}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        aria-invalid={Boolean(state.error?.email)}
                    />

                    {state.error?.email?.map((message) => (
                        <p key={message} role="alert">
                            {message}
                        </p>
                    ))}
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        aria-invalid={Boolean(state.error?.password)}
                    />

                    {state.error?.password?.map((message) => (
                        <p key={message} role="alert">
                            {message}
                        </p>
                    ))}
                </div>

                <button type="submit" disabled={pending}>
                    {pending ? 'Logging in...' : 'Log in'}
                </button>
            </form>
        </main>
    );
}
