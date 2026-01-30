"use client";
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiRequest } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Users, Check, X, Clock, Mail, Trash2 } from 'lucide-react';

interface JoinRequest {
    id: string;
    userId: string;
    workspaceId: string;
    role: string;
    status: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

export default function WorkspaceMembersPage() {
    const { currentWorkspace } = useAuth();
    const [members, setMembers] = useState<any[]>([]);
    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentWorkspace) {
            fetchData();
        } else {
            setMembers([]);
            setRequests([]);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentWorkspace?.id]); // React to workspace changes

    const fetchData = async () => {
        if (!currentWorkspace) return;
        setLoading(true);
        try {
            const [membersData, requestsData] = await Promise.all([
                apiRequest(`/workspaces/${currentWorkspace.id}/members`),
                apiRequest(`/workspaces/${currentWorkspace.id}/requests`)
            ]);
            setMembers(membersData.filter((m: any) => m.status === 'ACCEPTED'));
            setRequests(requestsData);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId: string) => {
        try {
            await apiRequest('/workspaces/approve-request', {
                method: 'POST',
                body: JSON.stringify({ workspaceId: currentWorkspace?.id, userId }),
            });
            fetchData();
        } catch (error: any) {
            alert(error.message || 'Failed to approve request');
        }
    };

    const handleReject = async (userId: string) => {
        try {
            await apiRequest('/workspaces/reject-request', {
                method: 'POST',
                body: JSON.stringify({ workspaceId: currentWorkspace?.id, userId }),
            });
            fetchData();
        } catch (error: any) {
            alert(error.message || 'Failed to reject request');
        }
    };

    const handleRemove = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this user from the workspace?')) return;
        try {
            await apiRequest('/users/remove-from-workspace', {
                method: 'POST',
                body: JSON.stringify({ userId, workspaceId: currentWorkspace?.id }),
            });
            fetchData();
        } catch (error: any) {
            alert(error.message || 'Failed to remove member');
        }
    };

    const getRoleBadge = (role: string) => {
        const configs = {
            ADMIN: 'bg-red-500/10 text-red-400 border-red-500/30',
            WORKSPACE_OWNER: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
            VIEWER: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
        };
        return configs[role as keyof typeof configs] || configs.VIEWER;
    };

    return (
        <ProtectedRoute allowedRoles={['WORKSPACE_OWNER']}>
            <DashboardLayout>
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Team Members</h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Manage members and join requests for <span className="text-indigo-400 font-bold">{currentWorkspace?.name || 'this workspace'}</span>
                        </p>
                    </div>

                    {requests.length > 0 && (
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="text-amber-400" size={20} />
                                <h3 className="text-lg font-bold text-amber-400">Pending Join Requests ({requests.length})</h3>
                            </div>
                            <div className="space-y-3">
                                {requests.map((request) => (
                                    <div key={request.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-400 font-bold">
                                                {request.user.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{request.user.name}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Mail size={12} />
                                                    {request.user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleApprove(request.userId)}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 font-bold text-sm transition-all"
                                            >
                                                <Check size={16} />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(request.userId)}
                                                className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg flex items-center gap-2 font-bold text-sm transition-all border border-red-500/30"
                                            >
                                                <X size={16} />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-800 bg-slate-900/40">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Users size={20} />
                                Current Members ({members.length})
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-900/20 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-800">
                                        <th className="px-6 py-4">Member</th>
                                        <th className="px-6 py-4">Roles</th>
                                        <th className="px-6 py-4">Joined</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                    Loading members...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : members.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                No members yet
                                            </td>
                                        </tr>
                                    ) : (
                                        members.map((member) => (
                                            <tr key={member.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-400 font-bold">
                                                            {member.user.name?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-white">{member.user.name}</p>
                                                            <p className="text-xs text-slate-500">{member.user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${getRoleBadge(member.role)}`}>
                                                        {member.role.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400">
                                                    {new Date(member.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {member.role !== 'WORKSPACE_OWNER' && (
                                                        <button
                                                            onClick={() => handleRemove(member.userId)}
                                                            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                                                            title="Remove Member"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
