"use client";
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiRequest } from '@/services/api';
import { Search, Globe, Trash2, Check, X, Building, Users, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Workspace {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    _count: { users: number; datasets: number };
}

interface JoinRequest {
    id: string;
    userId: string;
    workspaceId: string;
    workspace: { id: string; name: string };
    user: { id: string; name: string; email: string };
    createdAt: string;
}

export default function AdminWorkspacesPage() {
    const { refreshUser } = useAuth();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [filteredWorkspaces, setFilteredWorkspaces] = useState<Workspace[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'requests'>('all');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            setFilteredWorkspaces(
                workspaces.filter(w =>
                    w.name.toLowerCase().includes(query) ||
                    w.slug.toLowerCase().includes(query)
                )
            );
        } else {
            setFilteredWorkspaces(workspaces);
        }
    }, [searchQuery, workspaces]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [wsData, reqData] = await Promise.all([
                apiRequest('/workspaces/all'),
                apiRequest('/workspaces/global-requests')
            ]);
            setWorkspaces(wsData);
            setFilteredWorkspaces(wsData);
            setRequests(reqData);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteWorkspace = async (id: string) => {
        if (!confirm('Area you sure? This will delete the workspace and ALL its data (datasets, members, etc).')) return;
        try {
            await apiRequest(`/workspaces/${id}`, { method: 'DELETE' }); // Note: Need DELETE endpoint
            fetchData();
        } catch (error: any) {
            alert(error.message || 'Failed to delete workspace');
        }
    };

    const handleRequest = async (workspaceId: string, userId: string, action: 'approve' | 'reject') => {
        try {
            await apiRequest(`/workspaces/${action}-request`, {
                method: 'POST',
                body: JSON.stringify({ workspaceId, userId }),
            });
            fetchData();
        } catch (error: any) {
            alert(error.message || `Failed to ${action} request`);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout>
                <div className="space-y-8">
                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">Workspaces</h1>
                            <p className="text-slate-500 mt-1 font-medium">Manage workspaces and join requests.</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-800">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'all'
                                    ? 'border-indigo-600 text-indigo-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            All Workspaces
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'requests'
                                    ? 'border-indigo-600 text-indigo-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Join Requests
                            {requests.length > 0 && (
                                <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                    {requests.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {activeTab === 'all' && (
                        <div className="space-y-6">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {loading ? (
                                    <div className="col-span-full py-12 text-center text-slate-500">Loading...</div>
                                ) : filteredWorkspaces.length === 0 ? (
                                    <div className="col-span-full py-12 text-center text-slate-500">No workspaces found</div>
                                ) : (
                                    filteredWorkspaces.map(ws => (
                                        <div key={ws.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400">
                                                    <Building size={24} />
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteWorkspace(ws.id)}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-1">{ws.name}</h3>
                                            <p className="text-xs text-slate-500 font-mono mb-4 truncate">{ws.slug}</p>

                                            <div className="flex items-center gap-4 text-sm text-slate-400 pt-4 border-t border-slate-800/50">
                                                <div className="flex items-center gap-1.5">
                                                    <Users size={14} />
                                                    {ws._count.users} members
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Globe size={14} />
                                                    {ws._count.datasets} datasets
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-900/40 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-800">
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Target Workspace</th>
                                        <th className="px-6 py-4">Requested At</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                No pending requests
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.map(req => (
                                            <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-semibold text-sm text-white">{req.user.name}</p>
                                                        <p className="text-xs text-slate-500">{req.user.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-indigo-400 font-medium">
                                                    {req.workspace.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500 flex items-center gap-2">
                                                    <Clock size={14} />
                                                    {new Date(req.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleRequest(req.workspace.id, req.user.id, 'approve')}
                                                            className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-emerald-500/20"
                                                        >
                                                            <Check size={14} /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleRequest(req.workspace.id, req.user.id, 'reject')}
                                                            className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-red-500/20"
                                                        >
                                                            <X size={14} /> Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
