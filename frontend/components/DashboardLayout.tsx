"use client";
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import ProtectedRoute from './ProtectedRoute';
import InvitationBell from './InvitationBell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();

    const getInitials = (name: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <ProtectedRoute>
            <div className="flex h-screen bg-slate-950 text-slate-50 font-sans">
                {/* Sidebar */}
                <Sidebar onLogout={logout} />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
                        <div className="flex items-center gap-6">
                            <h2 className="text-lg font-bold text-white">InsightIQ</h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <InvitationBell />

                            <div className="flex items-center gap-3 ml-4 border-l border-slate-800 pl-6">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold leading-none">{user?.name}</p>
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">{user?.role?.replace('_', ' ')}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center border border-white/10 shadow-lg shadow-indigo-500/10">
                                    <span className="text-sm font-bold text-white">{getInitials(user?.name || '')}</span>
                                </div>
                            </div>
                        </div>
                    </header>
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
