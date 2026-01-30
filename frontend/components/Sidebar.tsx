"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Database,
    BarChart3,
    Settings,
    LogOut,
    Users,
    Globe,
    PieChart,
    Cpu,
    FileText,
    Activity,
    Shield,
    Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
    onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
    const { user } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const role = user.role;

    // Exact requirements:
    // Admin: Users, Workspaces, AI Usage, Pipelines
    // Owner: Datasets, AI Analysis, Reports, Dashboard
    // Viewer: Dashboard, Reports, Request AI Summary

    const menuItems = [
        // Common Dashboard
        {
            label: 'Dashboard',
            icon: <LayoutDashboard size={20} />,
            href: '/dashboard',
            allowedRoles: ['ADMIN', 'WORKSPACE_OWNER', 'VIEWER']
        },
        // Admin specific
        {
            label: 'User Management',
            icon: <Users size={20} />,
            href: '/admin/users',
            allowedRoles: ['ADMIN']
        },
        {
            label: 'All Workspaces',
            icon: <Globe size={20} />,
            href: '/admin/workspaces',
            allowedRoles: ['ADMIN']
        },


        {
            label: 'Datasets',
            icon: <Database size={20} />,
            href: '/datasets',
            allowedRoles: ['WORKSPACE_OWNER']
        },
        {
            label: 'Team Members',
            icon: <Users size={20} />,
            href: '/workspace/members',
            allowedRoles: ['WORKSPACE_OWNER']
        },

        // Viewer & Everyone
        {
            label: 'Reports & Downloads',
            icon: <FileText size={20} />,
            href: '/reports',
            allowedRoles: ['VIEWER', 'WORKSPACE_OWNER']
        },
    ];

    const filteredItems = menuItems.filter(item => item.allowedRoles.includes(role));

    return (
        <aside className="w-64 border-r border-slate-800 flex flex-col p-4 bg-slate-950">
            <div className="flex items-center gap-2 mb-8 px-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg">I</div>
                <span className="text-xl font-bold tracking-tight">InsightIQ</span>
            </div>

            <nav className="flex-1 space-y-1">
                {filteredItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === item.href
                            ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 shadow-sm'
                            }`}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="mt-auto pt-4 border-t border-slate-800">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
