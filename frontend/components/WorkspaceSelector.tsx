"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ChevronDown, Globe } from 'lucide-react';

export default function WorkspaceSelector() {
    const { workspaces, currentWorkspace, setCurrentWorkspace } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!currentWorkspace) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-all text-sm font-medium"
            >
                <Globe size={16} className="text-indigo-400" />
                <span>{currentWorkspace.name}</span>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-30 overflow-hidden py-1">
                        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 mb-1">
                            Switch Workspace
                        </div>
                        {workspaces.map((ws) => (
                            <button
                                key={ws.id}
                                onClick={() => {
                                    setCurrentWorkspace(ws);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-slate-800 flex items-center justify-between ${currentWorkspace.id === ws.id ? 'text-indigo-400 font-semibold bg-indigo-600/5' : 'text-slate-300'
                                    }`}
                            >
                                {ws.name}
                                {currentWorkspace.id === ws.id && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                )}
                            </button>
                        ))}
                        <div className="border-t border-slate-800 mt-1 pt-1">
                            <button className="w-full text-left px-3 py-2 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors">
                                + Create New Workspace
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
