'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);

    useEffect(() => {
        if (isAuthenticated) router.replace('/');
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        const ok = await login(email.trim(), password);
        if (ok) {
            router.replace('/');
        } else {
            setError('Invalid email or password. Please try again.');
            setLoading(false);
            setShake(true);
            setTimeout(() => setShake(false), 600);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
            {/* Dark background gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(249,115,22,0.10),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.07),transparent_60%)]" />

            {/* Subtle grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* White card */}
            <div
                className="relative w-full max-w-md mx-4"
                style={shake ? { animation: 'shake 0.5s ease-in-out' } : {}}
            >
                <div className="bg-white rounded-2xl shadow-2xl shadow-black/50 overflow-hidden border border-white/10">

                    {/* Top accent bar */}
                    <div className="h-1.5 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400" />

                    <div className="px-8 py-8">
                        {/* Logo + Title */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-md p-1.5 flex items-center justify-center mb-4">
                                <Image src="/CEIT_Logo.png" alt="CEIT Logo" width={52} height={52} className="object-contain" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">CEIT CMS</h1>
                            <p className="text-sm text-slate-500 mt-1 font-medium text-center">
                                College of Engineering and Information Technology
                            </p>
                            <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200">
                                <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                                <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Admin Portal</span>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} noValidate className="space-y-5">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@ceit.edu"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:bg-white transition-all duration-200 shadow-sm"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPass ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:bg-white transition-all duration-200 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass((v) => !v)}
                                        tabIndex={-1}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        aria-label={showPass ? 'Hide password' : 'Show password'}
                                    >
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                id="login-submit"
                                type="submit"
                                disabled={loading || !email || !password}
                                className="w-full flex items-center justify-center gap-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold rounded-xl px-4 py-3 text-sm transition-all duration-200 shadow-md shadow-orange-200 disabled:shadow-none"
                            >
                                {loading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Signing in…
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-4 h-4" />
                                        Sign In to Dashboard
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-6 pt-5 border-t border-slate-100">
                            <p className="text-center text-xs text-slate-400">
                                Authorized personnel only &nbsp;·&nbsp; CEIT Administration System
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          15%,75%  { transform: translateX(-6px); }
          40%,90%  { transform: translateX(6px); }
        }
      `}</style>
        </div>
    );
}
