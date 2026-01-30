"use client";
import React, { useState, useEffect } from 'react';
import { Globe, Search, Users, Database, Send, Clock, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface DiscoveredWorkspace {
    id: string;
    name: string;
    slug: string;
    memberCount: number;
    datasetCount: number;
    membershipStatus: 'PENDING' | 'ACCEPTED' | null;
    membershipRole: string | null;
}

export default function ViewerWorkspaceDiscovery() {
    const [workspaces, setWorkspaces] = useState<DiscoveredWorkspace[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const { refreshWorkspaces } = useAuth();

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
            // Refresh to update the workspace list in case of auto-approval
            setTimeout(() => refreshWorkspaces(), 1000);
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
                    Pending Approval
                </span>
            );
        }
        return null;
    };

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl space-y-8">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 flex items-center justify-center text-indigo-500">
                            <Globe size={40} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">Discover Workspaces</h1>
                    <p className="text-slate-500 font-medium max-w-md mx-auto">
                        Search for available workspaces and request access to start viewing analytics and reports.
                    </p>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search workspaces by name..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : workspaces.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl">
                        <p className="text-slate-500">
                            {searchQuery ? 'No workspaces found matching your search' : 'No workspaces available'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {workspaces.map((ws) => (
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
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-lg shadow-indigo-600/20"
                                    >
                                        <Send size={16} />
                                        Request to Join
                                    </button>
                                )}

                                {ws.membershipStatus === 'PENDING' && (
                                    <div className="w-full bg-slate-800 text-slate-400 px-4 py-3 rounded-xl text-center font-medium text-sm">
                                        Awaiting owner approval...
                                    </div>
                                )}

                                {ws.membershipStatus === 'ACCEPTED' && (
                                    <div className="w-full bg-emerald-600/10 text-emerald-400 px-4 py-3 rounded-xl text-center font-bold text-sm border border-emerald-500/30">
                                        ✓ You&apos;re a member
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="text-center">
                    <p className="text-xs text-slate-600">
                        Can&apos;t find a workspace? Contact your administrator to get invited.
                    </p>
                </div>
            </div>
        </div>
    );
}
