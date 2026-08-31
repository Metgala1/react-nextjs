"use client"

import { createContext, useContext, useState, useEffect } from "react";

export type User = {
    userId: number; // Changed from 'id' to match your backend code
    name: string;
    email: string;
    roles: string[];
};

type AuthContextType = {
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isLoading: boolean;
    token: string | undefined
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [token , setToken] = useState<string | undefined>('')

    // Check for existing token/user on app load (Fixes page refresh logout)
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                // If JSON parsing fails, clear bad data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setToken(token ?? undefined)
        setIsLoading(false);
    }, []);

    function login(token: string, userData: User) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading , token }}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        // Fixed typos here
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export { AuthProvider, useAuth };
