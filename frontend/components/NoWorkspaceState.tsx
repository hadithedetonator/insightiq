"use client";
import React, { useState } from 'react';
import { Plus, Globe, ArrowRight } from 'lucide-react';
import { apiRequest } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function NoWorkspaceState() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { refreshWorkspaces } = useAuth();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await apiRequest('/workspaces', {
                method: 'POST',
                body: JSON.stringify({ name }),
            });
            await refreshWorkspaces();
        } catch (err: any) {
            setError(err.message || 'Failed to create workspace');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md text-center space-y-8">
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 flex items-center justify-center text-indigo-500 mb-6">
                        <Globe size={40} />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white italic">Welcome to InsightIQ</h1>
                    <p className="text-slate-500 mt-2 font-medium">To begin your AI journey, you first need a dedicated workspace.</p>
                </div>

                <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden text-left">
                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Workspace Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Acme Analytics Hub"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-700"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !name}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group"
                        >
                            {loading ? 'Configuring Space...' : 'Initialize Workspace'}
                            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </div>

                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Plus size={120} />
                    </div>
                </form>

                <p className="text-xs text-slate-600">
                    Workspaces are isolated environments where you can manage specific team memberships and data pipelines.
                </p>
            </div>
        </div>
    );
}
