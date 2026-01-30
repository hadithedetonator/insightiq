"use client";
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardCard from '@/components/DashboardCard';
import { Users, Globe, Activity, ShieldAlert, Settings, Cpu } from 'lucide-react';

export default function AdminPage() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout>
                <div className="space-y-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white italic">Platform Control Center</h1>
                            <p className="text-slate-500 mt-1 font-medium italic underline decoration-indigo-500/50 underline-offset-4">System-wide monitoring and governance.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-red-600/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold hover:bg-red-600/20 transition-all">
                                <ShieldAlert size={18} />
                                System logs
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <DashboardCard icon={<Users size={24} />} label="Total Active Users" value="1,284" trend="+42 this week" trendType="up" />
                        <DashboardCard icon={<Globe size={24} />} label="Global Workspaces" value="84" trend="3 new today" trendType="up" />
                        <DashboardCard icon={<Cpu size={24} />} label="AI Node Load" value="14.2%" trend="Stable" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-8">
                                <Activity className="text-indigo-400" size={24} />
                                <h3 className="text-xl font-bold">System Health</h3>
                            </div>
                            <div className="space-y-6">
                                <HealthBar label="Database Cluster" status="Healthy" value={98} />
                                <HealthBar label="AI Pipeline (AWS ECS)" status="Optimal" value={100} />
                                <HealthBar label="API Response Time" status="124ms" value={85} />
                                <HealthBar label="Token Quota Engagement" status="On Track" value={64} />
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <ShieldAlert size={120} className="text-white" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-6">Recent Admin Actions</h3>
                                <div className="space-y-4">
                                    <ActionRow user="Administrator" action="Provisioned Workspace: Blue Horizon" time="2 min ago" />
                                    <ActionRow user="System" action="Automated Scaling: Backend instances +2" time="15 min ago" />
                                    <ActionRow user="Security" action="Blocked IP Branch: 192.168.1.* (Auth Failures)" time="45 min ago" />
                                    <ActionRow user="Administrator" action="Updated AI Token Policy (Tier 2 Upgrade)" time="2 hours ago" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

function HealthBar({ label, status, value }: { label: string, status: string, value: number }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-slate-300">{label}</span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">{status}</span>
            </div>
            <div className="h-2 bg-slate-800/50 rounded-full w-full overflow-hidden border border-slate-800/50">
                <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-all duration-1000"
                    style={{ width: `${value}%` }}
                ></div>
            </div>
        </div>
    );
}

function ActionRow({ user, action, time }: { user: string, action: string, time: string }) {
    return (
        <div className="flex items-start justify-between py-3 border-b border-slate-800 last:border-0">
            <div>
                <p className="text-sm font-bold text-slate-200">{action}</p>
                <p className="text-[11px] text-slate-500 font-medium">By {user} • {time}</p>
            </div>
            <Settings size={14} className="text-slate-600" />
        </div>
    );
}
