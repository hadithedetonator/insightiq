"use client";
import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Mail } from 'lucide-react';
import { apiRequest } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function InvitationBell() {
    const [invitations, setInvitations] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const { refreshWorkspaces } = useAuth();

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            const data = await apiRequest('/workspaces/invitations');
            setInvitations(data);
        } catch (error) {
            console.error('Failed to fetch invitations', error);
        }
    };

    const handleAccept = async (workspaceId: string) => {
        try {
            await apiRequest('/workspaces/accept', {
                method: 'POST',
                body: JSON.stringify({ workspaceId }),
            });
            setInvitations(prev => prev.filter(inv => inv.workspaceId !== workspaceId));
            await refreshWorkspaces();
        } catch (error) {
            console.error('Failed to accept invitation', error);
        }
    };

    if (invitations.length === 0) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all relative"
            >
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-3 h-3 bg-indigo-600 rounded-full border-2 border-slate-950"></span>
            </button>

            {open && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pending Invitations</h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50">
                        {invitations.map((inv) => (
                            <div key={inv.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-400 mt-0.5">
                                        <Mail size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{inv.workspace.name}</p>
                                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">You&apos;ve been invited as {inv.role}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => handleAccept(inv.workspaceId)}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <Check size={12} />
                                        Accept
                                    </button>
                                    <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5">
                                        <X size={12} />
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
