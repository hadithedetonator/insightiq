"use client";
import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Database, BarChart3, Settings, LogOut, Search, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [userName, setUserName] = useState('User');
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserName(user.name || 'User');
            } catch (e) { }
        }
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth/login');
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="flex h-screen bg-slate-950 text-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 flex flex-col p-4">
                <div className="flex items-center gap-2 mb-8 px-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg">I</div>
                    <span className="text-xl font-bold tracking-tight">InsightIQ</span>
                </div>

                <nav className="flex-1 space-y-1">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                    <NavItem icon={<Database size={20} />} label="Datasets" />
                    <NavItem icon={<BarChart3 size={20} />} label="Analytics" />
                    <NavItem icon={<Settings size={20} />} label="Settings" />
                </nav>

                <div className="mt-auto pt-4 border-t border-slate-800" onClick={handleSignOut}>
                    <NavItem icon={<LogOut size={20} />} label="Sign Out" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search datasets..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-slate-900 rounded-full transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3 ml-4 border-l border-slate-800 pl-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium leading-none">{userName}</p>
                                <p className="text-[10px] text-slate-500 mt-1">Workspace Owner</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center border border-white/10 shadow-lg shadow-indigo-500/10">
                                <span className="text-xs font-bold text-white">{getInitials(userName)}</span>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
            }`}>
            {icon}
            {label}
        </button>
    );
}
