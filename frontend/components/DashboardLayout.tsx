"use client";
import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import WorkspaceSelector from './WorkspaceSelector';
import ProtectedRoute from './ProtectedRoute';

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
                            <WorkspaceSelector />
                            <div className="relative w-72 lg:w-96 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search datasets, reports..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-slate-900 rounded-full transition-colors relative">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-slate-950"></span>
                            </button>

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
