"use client";
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiRequest } from '@/services/api';
import { Search, UserPlus, Edit2, Trash2, Shield, Eye, Briefcase, X, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'WORKSPACE_OWNER' | 'VIEWER';
    createdAt: string;
    workspaces: Array<{
        workspace: { name: string };
    }>;
    _count: { aiRequests: number };
}

export default function UserManagementPage() {
    const { refreshUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            setFilteredUsers(
                users.filter(u =>
                    u.email.toLowerCase().includes(query) ||
                    u.name?.toLowerCase().includes(query)
                )
            );
        } else {
            setFilteredUsers(users);
        }
    }, [searchQuery, users]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await apiRequest('/users');
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await apiRequest('/users/role', {
                method: 'PUT',
                body: JSON.stringify({ userId, role: newRole }),
            });
            fetchUsers();
            setEditingUser(null);
            await refreshUser();
        } catch (error: any) {
            alert(error.message || 'Failed to update role');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await apiRequest(`/users/${userId}`, { method: 'DELETE' });
            fetchUsers();
        } catch (error: any) {
            alert(error.message || 'Failed to delete user');
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'ADMIN': return <Shield size={16} className="text-red-400" />;
            case 'WORKSPACE_OWNER': return <Briefcase size={16} className="text-indigo-400" />;
            case 'VIEWER': return <Eye size={16} className="text-slate-400" />;
            default: return null;
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
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout>
                <div className="space-y-8">
                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">User Management</h1>
                            <p className="text-slate-500 mt-1 font-medium">Manage platform users and roles.</p>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                            <UserPlus size={18} />
                            Add User
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                        />
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-900/40 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-800">
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Workspaces</th>
                                        <th className="px-6 py-4">AI Requests</th>
                                        <th className="px-6 py-4">Joined</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                    Loading users...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-semibold text-sm text-white">{user.name || 'Unnamed'}</p>
                                                        <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingUser?.id === user.id ? (
                                                        <select
                                                            value={editingUser.role}
                                                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                                                            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                                                        >
                                                            <option value="VIEWER">Viewer</option>
                                                            <option value="WORKSPACE_OWNER">Workspace Owner</option>
                                                            <option value="ADMIN">Admin</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${getRoleBadge(user.role)}`}>
                                                            {getRoleIcon(user.role)}
                                                            {user.role.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400">
                                                    {user.workspaces?.length || 0}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400">
                                                    {user._count?.aiRequests || 0}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {editingUser?.id === user.id ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleRoleChange(user.id, editingUser.role)}
                                                                    className="p-2 hover:bg-emerald-500/10 rounded-lg text-emerald-400 transition-colors"
                                                                    title="Save"
                                                                >
                                                                    <Check size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingUser(null)}
                                                                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                                                                    title="Cancel"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => setEditingUser(user)}
                                                                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors"
                                                                    title="Edit Role"
                                                                >
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                                                    title="Delete User"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {isCreateModalOpen && (
                    <CreateUserModal
                        onClose={() => setIsCreateModalOpen(false)}
                        onSuccess={() => {
                            fetchUsers();
                            setIsCreateModalOpen(false);
                        }}
                    />
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}

function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('VIEWER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await apiRequest('/users', {
                method: 'POST',
                body: JSON.stringify({ name, email, password, role }),
            });
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="flex flex-col items-center mb-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-500 mb-4">
                            <UserPlus size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Create New User</h2>
                        <p className="text-xs text-slate-500 mt-1">Add a new user to the platform.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@company.com"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                            >
                                <option value="VIEWER">Viewer</option>
                                <option value="WORKSPACE_OWNER">Workspace Owner</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Creating...' : 'Create User'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
