"use client";
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import DatasetTable, { Dataset } from '@/components/DatasetTable';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/services/api';
import { Plus, Filter, Search, UploadCloud } from 'lucide-react';

export default function DatasetsPage() {
    const { currentWorkspace } = useAuth();
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentWorkspace) {
            fetchDatasets();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentWorkspace]);

    const fetchDatasets = async () => {
        setLoading(true);
        try {
            const data = await apiRequest(`/datasets?workspaceId=${currentWorkspace?.id}`);
            setDatasets(data.map((d: any) => ({
                id: d.id,
                name: d.name,
                status: d.status,
                recordsCount: d._count?.records || 0,
                lastUpdate: new Date(d.updatedAt).toLocaleDateString()
            })));
        } catch (error) {
            // Mock data fallback
            setDatasets([
                { id: '1', name: 'Q4 Sales Analysis', status: 'COMPLETED', recordsCount: 45000, lastUpdate: '2024-01-30' },
                { id: '2', name: 'Customer Sentiment', status: 'ANALYZING', recordsCount: 12400, lastUpdate: '2024-01-29' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['ADMIN', 'WORKSPACE_OWNER']}>
            <DashboardLayout>
                <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white">Data Management</h1>
                            <p className="text-slate-500 mt-1 font-medium">Upload and oversee your workspace datasets.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all">
                                <Filter size={18} />
                                Filters
                            </button>
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                                <Plus size={18} />
                                New Dataset
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center group hover:border-indigo-500/30 transition-all cursor-pointer">
                            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mb-4 group-hover:bg-indigo-600/10 group-hover:text-indigo-400 transition-all">
                                <UploadCloud size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Drag and drop your data files</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">Support for JSON, CSV, and XLSX formats. Automated AI analysis starts immediately after upload.</p>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search datasets by name, status, or ID..."
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                            />
                        </div>

                        <DatasetTable datasets={datasets} onRefresh={fetchDatasets} />
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
