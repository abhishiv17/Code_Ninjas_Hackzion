'use client';

import { useState } from 'react';
import { Database, UploadCloud, CheckCircle, FileText, Loader } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function KnowledgeIngestionHub() {
  const { t } = useLanguage();
  const [docText, setDocText] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleIngest = async () => {
    if (!docText.trim() || !title.trim()) return;
    setLoading(true);
    setStatus('idle');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${API_URL}/api/knowledge/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_text: docText, metadata: { title } })
      });
      if (res.ok) {
        setStatus('success');
        setDocText('');
        setTitle('');
      } else {
        setStatus('error');
      }
    } catch (e) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
          <Database size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Knowledge Ingestion Hub</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Upload manuals instantly into the RAG brain.</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 flex flex-col">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Document Title</label>
          <input
            type="text"
            placeholder="e.g. Protocol for Resetting Toll Barrier 7"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
            <span>Raw Text Representation</span>
            {status === 'success' && <span className="text-emerald-500 flex items-center gap-1 text-xs"><CheckCircle size={14}/> Vectorized Successfully!</span>}
            {status === 'error' && <span className="text-red-500 text-xs">Failed to ingest vector.</span>}
          </label>
          <textarea
            placeholder="Paste raw manual documentation, JSON config limits, or incident runbooks here..."
            value={docText}
            onChange={(e) => setDocText(e.target.value)}
            className="flex-1 w-full resize-none rounded-lg border border-slate-300 bg-slate-50 p-4 text-sm font-mono outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>

        <button
          onClick={handleIngest}
          disabled={loading || !docText.trim() || !title.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <UploadCloud size={18} />}
          {loading ? 'Embedding into ChromaDB...' : 'Vectorize & Ingest'}
        </button>
      </div>
    </div>
  );
}
