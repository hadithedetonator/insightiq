"use client";
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function PlaceholderPage({ title }: { title: string }) {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">{title}</h1>
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping"></div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Module Under Construction</h3>
                    <p className="text-slate-500 max-w-sm">This feature is currently being developed and will be available in the next platform update.</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
