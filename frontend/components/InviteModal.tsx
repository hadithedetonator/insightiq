"use client";
import React, { useState } from 'react';
import { X, Mail, Shield, UserPlus } from 'lucide-react';
import { apiRequest } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
}

export default function InviteModal({ isOpen, onClose, workspaceId }: InviteModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'WORKSPACE_OWNER' | 'VIEWER'>('VIEWER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await apiRequest('/workspaces/invite', {
                method: 'POST',
                body: JSON.stringify({ workspaceId, email, role }),
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setEmail('');
                setSuccess(false);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Invite Team Member</h2>
                            <p className="text-sm text-slate-500">Add a new analyst or viewer to your workspace.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm rounded-xl text-center">
                            Invitation sent successfully!
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="analyst@insightiq.ai"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Access Role</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('VIEWER')}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${role === 'VIEWER'
                                            ? 'bg-indigo-600/10 border-indigo-600 text-indigo-400'
                                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                                        }`}
                                >
                                    <Mail size={20} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Viewer</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('WORKSPACE_OWNER')}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${role === 'WORKSPACE_OWNER'
                                            ? 'bg-indigo-600/10 border-indigo-600 text-indigo-400'
                                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                                        }`}
                                >
                                    <Shield size={20} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Owner</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl mt-4 transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Send Invitation'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
