'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin } from '@/lib/api';

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: AdminUser | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

// ── 4 Hardcoded Admin Accounts ──────────────────────────────────────────────
const ADMIN_ACCOUNTS = [
    { id: 1, name: 'Super Admin', email: 'admin@ceit.edu', password: 'Admin123!', role: 'super_admin' },
    { id: 2, name: 'Civil Engineer', email: 'ce.author@ceit.edu', password: 'Admin123!', role: 'author_ce' },
    { id: 3, name: 'Electrical Engineer', email: 'ee.author@ceit.edu', password: 'Admin123!', role: 'author_ee' },
    { id: 4, name: 'IT Specialist', email: 'it.author@ceit.edu', password: 'Admin123!', role: 'author_it' },
];

type JwtPayload = {
    first_name?: string;
    last_name?: string;
    role_name?: string;
};

function parseJwtPayload(token: string): JwtPayload | null {
    try {
        const payload = token.split('.')[1];
        if (!payload) return null;
        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(normalized);
        return JSON.parse(decoded) as JwtPayload;
    } catch {
        return null;
    }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null);

    // Persist login across page refreshes
    useEffect(() => {
        const stored = sessionStorage.getItem('ceit_admin_user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
        }
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        const match = ADMIN_ACCOUNTS.find(
            (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
        );

        if (!match) {
            return false;
        }

        try {
            const tokenData = await loginAdmin(match.email, match.password);
            localStorage.setItem('access_token', tokenData.access_token);
            if (tokenData.refresh_token) {
                localStorage.setItem('refresh_token', tokenData.refresh_token);
            }

            const payload = parseJwtPayload(tokenData.access_token);
            const derivedName = `${payload?.first_name ?? ''} ${payload?.last_name ?? ''}`.trim();
            const safeUser: AdminUser = {
                id: match.id,
                email: match.email,
                name: derivedName || match.name,
                role: payload?.role_name || match.role,
            };

            setUser(safeUser);
            sessionStorage.setItem('ceit_admin_user', JSON.stringify(safeUser));
            return true;
        } catch {
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('ceit_admin_user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
