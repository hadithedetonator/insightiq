"use client";
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiRequest } from '@/services/api';
import { Search, Globe, Users, Database, Send, CheckCircle, Clock } from 'lucide-react';

interface DiscoveredWorkspace {
    id: string;
    name: string;
    slug: string;
    memberCount: number;
    datasetCount: number;
    membershipStatus: 'PENDING' | 'ACCEPTED' | null;
    membershipRole: string | null;
}

export default function DiscoverWorkspacesPage() {
    const [workspaces, setWorkspaces] = useState<DiscoveredWorkspace[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkspaces();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const fetchWorkspaces = async () => {
        setLoading(true);
        try {
            const data = await apiRequest(`/workspaces/discover?search=${searchQuery}`);
            setWorkspaces(data);
        } catch (error) {
            console.error('Failed to discover workspaces', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestJoin = async (workspaceId: string) => {
        try {
            await apiRequest('/workspaces/request-join', {
                method: 'POST',
                body: JSON.stringify({ workspaceId }),
            });
            fetchWorkspaces();
        } catch (error: any) {
            alert(error.message || 'Failed to send join request');
        }
    };

    const getStatusBadge = (status: string | null) => {
        if (status === 'ACCEPTED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle size={12} />
                    Member
                </span>
            );
        }
        if (status === 'PENDING') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Clock size={12} />
                    Pending
                </span>
            );
        }
        return null;
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Discover Workspaces</h1>
                    <p className="text-slate-500 mt-1 font-medium">Browse and request to join available workspaces.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search workspaces..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : workspaces.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            No workspaces found
                        </div>
                    ) : (
                        workspaces.map((ws) => (
                            <div key={ws.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400">
                                        <Globe size={24} />
                                    </div>
                                    {getStatusBadge(ws.membershipStatus)}
                                </div>

                                <h3 className="text-lg font-bold text-white mb-2">{ws.name}</h3>
                                <p className="text-xs text-slate-500 font-mono mb-4">{ws.slug}</p>

                                <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <Users size={14} />
                                        <span>{ws.memberCount} members</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Database size={14} />
                                        <span>{ws.datasetCount} datasets</span>
                                    </div>
                                </div>

                                {!ws.membershipStatus && (
                                    <button
                                        onClick={() => handleRequestJoin(ws.id)}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-lg shadow-indigo-600/20"
                                    >
                                        <Send size={16} />
                                        Request to Join
                                    </button>
                                )}

                                {ws.membershipStatus === 'PENDING' && (
                                    <div className="w-full bg-slate-800 text-slate-400 px-4 py-2.5 rounded-xl text-center font-medium text-sm">
                                        Awaiting approval...
                                    </div>
                                )}

                                {ws.membershipStatus === 'ACCEPTED' && (
                                    <div className="w-full bg-emerald-600/10 text-emerald-400 px-4 py-2.5 rounded-xl text-center font-bold text-sm border border-emerald-500/30">
                                        You&apos;re a member
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
