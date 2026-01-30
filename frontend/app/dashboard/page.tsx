"use client";
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { TrendingUp, Users, Cpu, Activity, Download, Plus, Database } from 'lucide-react';

export default function Dashboard() {
    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Workspace Overview</h1>
                        <p className="text-slate-400 mt-1">Real-time performance and AI metrics.</p>
                    </div>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all shadow-lg shadow-indigo-600/20">
                        <Plus size={20} />
                        New Dataset
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<TrendingUp className="text-emerald-400" />} label="Total Records" value="128,402" trend="+12.5%" />
                    <StatCard icon={<Cpu className="text-purple-400" />} label="AI Requests" value="1,240" trend="+8.2%" />
                    <StatCard icon={<Activity className="text-blue-400" />} label="Pipeline Health" value="99.9%" trend="Stable" />
                    <StatCard icon={<Users className="text-amber-400" />} label="Tokens Used" value="4.2M" trend="+15.3%" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Active Datasets */}
                    <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Active Datasets</h2>
                            <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View all</button>
                        </div>
                        <div className="space-y-4">
                            <DatasetRow name="Q4 Sales Data" status="COMPLETED" records="45,000" date="2 hours ago" />
                            <DatasetRow name="Customer Feedback" status="INGESTING" records="... " date="Just now" />
                            <DatasetRow name="Inventory Logs" status="COMPLETED" records="12,400" date="Yesterday" />
                            <DatasetRow name="User Activity" status="FAILED" records="0" date="2 days ago" />
                        </div>
                    </div>

                    {/* AI Insights Summary */}
                    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Cpu className="text-indigo-400" size={24} />
                            AI Insights
                        </h2>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-300 leading-relaxed italic">
                                "We've detected a significant correlation between customer onboarding duration and 30-day retention rates. Optimizing the first 48 hours could yield a 15% increase in lifetime value."
                            </p>
                            <div className="pt-4 border-t border-slate-800">
                                <button className="w-full bg-slate-100 text-slate-950 py-2.5 rounded-xl font-semibold text-sm hover:bg-white transition-colors flex items-center justify-center gap-2">
                                    <Download size={18} />
                                    Download PDF Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
    return (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-colors group">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend === 'Stable' ? 'bg-slate-800 text-slate-400' : 'bg-emerald-400/10 text-emerald-400'
                    }`}>{trend}</span>
            </div>
            <div>
                <p className="text-slate-400 text-sm font-medium">{label}</p>
                <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
            </div>
        </div>
    );
}

function DatasetRow({ name, status, records, date }: { name: string, status: string, records: string, date: string }) {
    const statusColors: Record<string, string> = {
        COMPLETED: 'text-emerald-400 bg-emerald-400/10',
        INGESTING: 'text-blue-400 bg-blue-400/10 animate-pulse',
        FAILED: 'text-red-400 bg-red-400/10'
    }
    return (
        <div className="flex items-center justify-between p-4 hover:bg-slate-800/50 rounded-xl transition-colors group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                    <Database size={20} className="text-slate-500" />
                </div>
                <div>
                    <p className="font-semibold text-sm">{name}</p>
                    <p className="text-xs text-slate-500">{records} records • {date}</p>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusColors[status] || 'bg-slate-800 text-slate-400'}`}>
                    {status}
                </span>
                <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download size={18} className="text-slate-500 hover:text-slate-100" />
                </button>
            </div>
        </div>
    );
}
