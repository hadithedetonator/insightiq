"use client";
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/services/api';
import { FileText, Download, Share2, Search, ExternalLink, Filter } from 'lucide-react';

export default function ReportsPage() {
    const { currentWorkspace } = useAuth();
    const [reports, setReports] = useState<any[]>([]);

    useEffect(() => {
        // Fetch reports for the workspace
        setReports([
            { id: '1', title: 'Q4 Performance Summary', type: 'PDF', date: '2024-01-30', size: '2.4 MB', status: 'Generated' },
            { id: '2', title: 'Customer Feedback Analysis', type: 'CSV', date: '2024-01-28', size: '1.2 MB', status: 'Ready' },
            { id: '3', title: 'Operational Efficiency Audit', type: 'PDF', date: '2024-01-25', size: '4.8 MB', status: 'Archived' },
        ]);
    }, [currentWorkspace]);

    return (
        <ProtectedRoute allowedRoles={['ADMIN', 'WORKSPACE_OWNER', 'VIEWER']}>
            <DashboardLayout>
                <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white">Knowledge Hub</h1>
                            <p className="text-slate-500 mt-1 font-medium">Access and export AI-generated business reports.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all">
                                <Filter size={18} />
                                Type
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map((report) => (
                            <div key={report.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all group hover:bg-slate-900">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                                        <FileText size={24} />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${report.type === 'PDF' ? 'bg-red-400/10 text-red-400' : 'bg-green-400/10 text-green-400'
                                            }`}>
                                            {report.type}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors mb-1 truncate">
                                    {report.title}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mb-6">
                                    Generated {report.date} • {report.size}
                                </p>

                                <div className="flex items-center gap-2 pt-4 border-t border-slate-800/50">
                                    <button className="flex-1 bg-slate-800 hover:bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                                        <Download size={14} />
                                        Download
                                    </button>
                                    <button className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all">
                                        <Share2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Report Request Section (For Viewers) */}
                    <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-3xl p-8 flex flex-col items-center md:flex-row md:justify-between gap-8 mt-12">
                        <div className="max-w-md">
                            <h3 className="text-xl font-bold text-white mb-2">Need a custom summary?</h3>
                            <p className="text-sm text-slate-400 font-medium">Request a new AI analysis based on the latest workspace data. Reports usually take less than 60 seconds to generate.</p>
                        </div>
                        <button className="whitespace-nowrap px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 transition-all active:scale-95">
                            Request AI Report
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
