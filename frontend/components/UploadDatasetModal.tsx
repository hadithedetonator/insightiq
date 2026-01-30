"use client";
import React, { useState, useRef } from 'react';
import { X, FileText, Database, Upload, CheckCircle2, FileJson, FileSpreadsheet, File } from 'lucide-react';
import { apiRequest } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UploadDatasetModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
    const { currentWorkspace } = useAuth();
    const [name, setName] = useState('');
    const [data, setData] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadMode, setUploadMode] = useState<'json' | 'csv' | 'file'>('json');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        if (!name) {
            setName(file.name.replace(/\.[^/.]+$/, ""));
        }

        // Preview for text based files (optional, but good for UX)
        if (file.type === 'application/json' || file.type === 'text/csv' || file.type.startsWith('text/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setData(event.target?.result as string);
            };
            reader.readAsText(file);
        } else {
            setData(`[File Selected: ${file.name} - ${file.type}]\nContent will be extracted by AI Pipeline.`);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (uploadMode === 'file' && selectedFile) {
                // Upload via FormData
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('name', name);
                formData.append('workspaceId', currentWorkspace?.id || '');

                // We need to bypass the default JSON headers in apiRequest for FormData
                // Since apiRequest helper might enforce JSON, we'll use fetch directly for this specific call 
                // OR assuming apiRequest handles it if body is FormData (typical implementation checks instanceof FormData)
                // Let's assume we need to handle it.

                const token = localStorage.getItem('token');
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/datasets`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.message || 'File upload failed');
                }
            } else {
                // JSON/CSV Text Paste Mode
                let parsedData;

                if (uploadMode === 'csv' || (uploadMode === 'file' && !selectedFile)) {
                    // Parse CSV logic or Error
                    // ... for brevity reusing strict validation logic ...
                    // Actually let's keep it simple as user requested.
                    // If CSV, let backend or frontend parse.
                }

                // ... keep existing logic for text/json ...
                // For simplicity, if it's text paste, we send as JSON body `data`.
                // But wait, if user pastes CSV, we need to convert or send as raw text.
                // The backend now accepts `data` as string too.

                await apiRequest('/datasets', {
                    method: 'POST',
                    body: JSON.stringify({
                        name,
                        workspaceId: currentWorkspace?.id,
                        data: data // Send raw text/json string, backend handles parsing
                    })
                });
            }

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
                setSuccess(false);
                setName('');
                setData('');
                setSelectedFile(null);
                setUploadMode('json');
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to upload dataset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                            <Upload size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Import Dataset</h2>
                            <p className="text-sm text-slate-500">Inject raw data into the {currentWorkspace?.name} pipeline.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm rounded-xl text-center flex items-center justify-center gap-2">
                            <CheckCircle2 size={16} />
                            Dataset ingested successfully!
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Dataset Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Monthly Sales Report"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Upload Method</label>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setUploadMode('json')}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${uploadMode === 'json'
                                        ? 'border-indigo-500 bg-indigo-600/10 text-indigo-400'
                                        : 'border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700'
                                        }`}
                                >
                                    <FileJson size={20} />
                                    <span className="text-xs font-bold">JSON Paste</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadMode('csv')}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${uploadMode === 'csv'
                                        ? 'border-indigo-500 bg-indigo-600/10 text-indigo-400'
                                        : 'border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700'
                                        }`}
                                >
                                    <FileSpreadsheet size={20} />
                                    <span className="text-xs font-bold">CSV/Text Paste</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUploadMode('file');
                                        fileInputRef.current?.click();
                                    }}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${uploadMode === 'file'
                                        ? 'border-indigo-500 bg-indigo-600/10 text-indigo-400'
                                        : 'border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700'
                                        }`}
                                >
                                    <FileText size={20} />
                                    <span className="text-xs font-bold">PDF / File</span>
                                </button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json,.csv,.pdf,.txt,.md"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>

                        {uploadMode !== 'file' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                    Data Content
                                </label>
                                <textarea
                                    value={data}
                                    onChange={(e) => setData(e.target.value)}
                                    placeholder="Paste your JSON or CSV text here..."
                                    required
                                    rows={8}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm font-mono focus:ring-2 focus:ring-indigo-600 outline-none transition-all resize-none"
                                />
                            </div>
                        )}

                        {uploadMode === 'file' && selectedFile && (
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                                <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400">
                                    <File size={20} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-bold text-white truncate">{selectedFile.name}</p>
                                    <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Unknown Type'}</p>
                                </div>
                                <button type="button" onClick={() => setSelectedFile(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Database size={18} />
                                    {uploadMode === 'file' && selectedFile?.type === 'application/pdf' ? 'Extract & Ingest' : 'Start Ingestion Pipeline'}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
