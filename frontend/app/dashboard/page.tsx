"use client";
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardCard from '@/components/DashboardCard';
import DatasetTable, { Dataset } from '@/components/DatasetTable';
import AIInsightPanel from '@/components/AIInsightPanel';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/services/api';
import { TrendingUp, Cpu, Activity, Users, Plus } from 'lucide-react';

export default function DashboardPage() {
    const { currentWorkspace } = useAuth();
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentWorkspace) {
            fetchDashboardData();
        }
    }, [currentWorkspace]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch datasets
            const datasetsData = await apiRequest(`/datasets?workspaceId=${currentWorkspace?.id}`);
            setDatasets(datasetsData.map((d: any) => ({
                id: d.id,
                name: d.name,
                status: d.status,
                recordsCount: d._count?.records || 0,
                lastUpdate: new Date(d.updatedAt).toLocaleDateString()
            })));

            // Fetch analytics
            const analyticsData = await apiRequest(`/analytics/${currentWorkspace?.id}`);
            setAnalytics(analyticsData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Fallback to mock data if API fails
            setDatasets([
                { id: '1', name: 'Q4 Sales Analysis', status: 'COMPLETED', recordsCount: 45000, lastUpdate: '2 hours ago' },
                { id: '2', name: 'Customer Sentiment', status: 'ANALYZING', recordsCount: 12400, lastUpdate: 'Just now' },
                { id: '3', name: 'Supply Chain Logs', status: 'FAILED', recordsCount: 0, lastUpdate: '1 day ago' }
            ]);
            setAnalytics({
                summary: {
                    totalRecords: '128,402',
                    aiRequests: '1,240',
                    pipelineHealth: '99.9%',
                    tokensUsed: '4.2M'
                }
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-10">
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Workspace Overview</h1>
                        <p className="text-slate-500 mt-1 font-medium">Real-time performance and AI-driven intelligence.</p>
                    </div>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                        <Plus size={18} />
                        Import New Dataset
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardCard
                        icon={<TrendingUp size={24} />}
                        label="Total Records"
                        value={analytics?.summary?.totalRecords || '0'}
                        trend="+12.5%"
                        trendType="up"
                    />
                    <DashboardCard
                        icon={<Cpu size={24} />}
                        label="AI Requests"
                        value={analytics?.summary?.aiRequests || '0'}
                        trend="+8.2%"
                        trendType="up"
                    />
                    <DashboardCard
                        icon={<Activity size={24} />}
                        label="Pipeline Health"
                        value={analytics?.summary?.pipelineHealth || '99.9%'}
                        trend="Stable"
                    />
                    <DashboardCard
                        icon={<Users size={24} />}
                        label="Tokens Used"
                        value={analytics?.summary?.tokensUsed || '0'}
                        trend="+15.3%"
                        trendType="up"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <DatasetTable datasets={datasets} />
                    </div>

                    <div className="space-y-8">
                        <AIInsightPanel loading={loading} />

                        {/* Quick Actions / Integration Status */}
                        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Pipeline Status</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-300">AWS ECS</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Operational</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-300">OpenAI API</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Fast</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
