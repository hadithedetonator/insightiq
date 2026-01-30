"use client";
import React, { ReactNode } from 'react';

interface DashboardCardProps {
    icon: ReactNode;
    label: string;
    value: string | number;
    trend?: string;
    trendType?: 'up' | 'down' | 'neutral';
}

export default function DashboardCard({ icon, label, value, trend, trendType = 'neutral' }: DashboardCardProps) {
    const trendColors = {
        up: 'bg-emerald-400/10 text-emerald-400',
        down: 'bg-red-400/10 text-red-400',
        neutral: 'bg-slate-800 text-slate-400'
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all group hover:bg-slate-900 shadow-sm hover:shadow-indigo-500/5">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform group-hover:bg-indigo-600/10 group-hover:text-indigo-400">
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${trendColors[trendType]}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-bold mt-1 tracking-tight text-white">{value}</p>
            </div>
        </div>
    );
}
