"use client";
import React from 'react';
import { Database, Download, Sparkles, MoreVertical } from 'lucide-react';
import { apiRequest } from '@/services/api';

export interface Dataset {
    id: string;
    name: string;
    status: 'COMPLETED' | 'INGESTING' | 'VALIDATING' | 'ANALYZING' | 'QUEUED' | 'FAILED';
    recordsCount: number;
    lastUpdate: string;
}

interface DatasetTableProps {
    datasets: Dataset[];
    onRefresh: () => void;
}

export default function DatasetTable({ datasets, onRefresh }: DatasetTableProps) {
    const statusConfig = {
        COMPLETED: { color: 'text-emerald-400 bg-emerald-400/10', label: 'Success' },
        INGESTING: { color: 'text-blue-400 bg-blue-400/10 animate-pulse', label: 'Ingesting' },
        VALIDATING: { color: 'text-purple-400 bg-purple-400/10', label: 'Validating' },
        ANALYZING: { color: 'text-amber-400 bg-amber-400/10', label: 'AI Analysis' },
        QUEUED: { color: 'text-slate-400 bg-slate-400/10', label: 'Queued' },
        FAILED: { color: 'text-red-400 bg-red-400/10', label: 'Failed' },
    };

    const handleTriggerAI = async (datasetId: string) => {
        try {
            await apiRequest('/analytics/trigger', {
                method: 'POST',
                body: JSON.stringify({ datasetId }),
            });
            onRefresh();
        } catch (error) {
            console.error('Failed to trigger AI', error);
        }
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
                <h3 className="text-lg font-semibold">Active Datasets</h3>
                <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">
                    View All History
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-900/20 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-800">
                            <th className="px-6 py-4">Name & Source</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Total Records</th>
                            <th className="px-6 py-4">Processed At</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {datasets.map((dataset) => {
                            const config = statusConfig[dataset.status] || statusConfig.QUEUED;
                            return (
                                <tr key={dataset.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-600/10 group-hover:text-indigo-400 transition-colors">
                                                <Database size={18} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-slate-200 group-hover:text-white">{dataset.name}</p>
                                                <p className="text-[10px] text-slate-500 font-medium italic">JSON Source • {dataset.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${config.color}`}>
                                            {config.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                                        {dataset.recordsCount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {dataset.lastUpdate}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                title="Trigger AI Analysis"
                                                onClick={() => handleTriggerAI(dataset.id)}
                                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-400 outline-none transition-colors"
                                            >
                                                <Sparkles size={16} />
                                            </button>
                                            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors">
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
