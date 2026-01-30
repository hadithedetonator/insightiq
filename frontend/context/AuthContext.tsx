"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/services/api';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'WORKSPACE_OWNER' | 'VIEWER';
}

interface Workspace {
    id: string;
    name: string;
    slug: string;
}

interface AuthContextType {
    user: User | null;
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;
    loading: boolean;
    login: (token: string, user: User, workspaces: any[]) => void;
    logout: () => void;
    setCurrentWorkspace: (workspace: Workspace) => void;
    refreshWorkspaces: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedWorkspaces = localStorage.getItem('workspaces');
        const storedCurrentWorkspace = localStorage.getItem('currentWorkspace');

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
            if (storedWorkspaces) {
                const parsedWorkspaces = JSON.parse(storedWorkspaces);
                setWorkspaces(parsedWorkspaces);
                if (storedCurrentWorkspace) {
                    setCurrentWorkspaceState(JSON.parse(storedCurrentWorkspace));
                } else if (parsedWorkspaces.length > 0) {
                    const defaultWs = parsedWorkspaces[0];
                    setCurrentWorkspaceState(defaultWs);
                    localStorage.setItem('currentWorkspace', JSON.stringify(defaultWs));
                }
            }
        }
        setLoading(false);
    }, []);

    const login = (token: string, user: User, workspacesData: any[]) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        const normalizedWorkspaces = workspacesData.map(w => w.workspace || w);
        localStorage.setItem('workspaces', JSON.stringify(normalizedWorkspaces));
        setUser(user);
        setWorkspaces(normalizedWorkspaces);
        if (normalizedWorkspaces.length > 0) {
            setCurrentWorkspaceState(normalizedWorkspaces[0]);
            localStorage.setItem('currentWorkspace', JSON.stringify(normalizedWorkspaces[0]));
        }
        router.push('/dashboard');
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        setWorkspaces([]);
        setCurrentWorkspaceState(null);
        router.push('/auth/login');
    };

    const setCurrentWorkspace = (workspace: Workspace) => {
        setCurrentWorkspaceState(workspace);
        localStorage.setItem('currentWorkspace', JSON.stringify(workspace));
    };

    const refreshWorkspaces = async () => {
        try {
            const data = await apiRequest('/workspaces');
            const normalized = data.map((w: any) => w.workspace || w);
            setWorkspaces(normalized);
            localStorage.setItem('workspaces', JSON.stringify(normalized));
            if (!currentWorkspace && normalized.length > 0) {
                setCurrentWorkspace(normalized[0]);
            }
        } catch (error) {
            console.error('Failed to refresh workspaces', error);
        }
    };

    const refreshUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Decode token to get user ID, then fetch fresh user data
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData.user);
                localStorage.setItem('user', JSON.stringify(userData.user));

                // If role changed, refresh workspaces too
                if (userData.workspaces) {
                    const normalized = userData.workspaces.map((w: any) => w.workspace || w);
                    setWorkspaces(normalized);
                    localStorage.setItem('workspaces', JSON.stringify(normalized));
                }
            }
        } catch (error) {
            console.error('Failed to refresh user', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, workspaces, currentWorkspace, loading, login, logout, setCurrentWorkspace, refreshWorkspaces, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
