"use client";
import React from 'react';
import { Cpu, Sparkles, Download, ArrowRight } from 'lucide-react';

interface AIInsightPanelProps {
    insight?: string;
    loading?: boolean;
}

export default function AIInsightPanel({ insight, loading }: AIInsightPanelProps) {
    const defaultInsight = "We've detected a significant correlation between customer onboarding duration and 30-day retention rates. Optimizing the first 48 hours could yield a 15% increase in lifetime value.";

    return (
        <div className="bg-gradient-to-br from-indigo-900/10 to-purple-900/10 border border-indigo-500/20 rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
                <Cpu size={120} className="text-indigo-400" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <Sparkles size={20} />
                    </div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        AI Business Insights
                    </h3>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        <div className="h-4 bg-slate-800/50 rounded-full w-full animate-pulse"></div>
                        <div className="h-4 bg-slate-800/50 rounded-full w-[90%] animate-pulse"></div>
                        <div className="h-4 bg-slate-800/50 rounded-full w-[70%] animate-pulse"></div>
                    </div>
                ) : (
                    <>
                        <p className="text-slate-300 leading-relaxed font-medium mb-8">
                            &quot;{insight || defaultInsight}&quot;
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-800/50">
                            <button className="flex-1 bg-white text-slate-950 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5 active:scale-95">
                                <Download size={18} />
                                Download PDF Report
                            </button>
                            <button className="flex-1 bg-slate-900 text-white border border-slate-800 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95">
                                View Full Analysis
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
