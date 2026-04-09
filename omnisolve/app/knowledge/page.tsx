'use client';

import { useState } from 'react';
import { mockDocs } from '@/lib/mockData';
import { Search, FileText, Download, ChevronRight } from 'lucide-react';

export default function KnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocs = mockDocs.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.contentSnippet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Knowledge Base</h2>
          <p className="text-sm text-gray-400 mt-1">Search through indexed vendor manuals and historical resolutions.</p>
        </div>
      </div>

      <div className="relative shrink-0">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-4 py-4 bg-card/80 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
          placeholder="Search firmware logs, thermal limits, vendor manuals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-1">Top RAG Vectors</h3>
        
        {filteredDocs.map((doc, idx) => (
          <div key={doc.id} className="group bg-card/40 hover:bg-card/80 border border-white/5 hover:border-blue-500/30 rounded-xl p-5 transition-all cursor-pointer relative overflow-hidden shadow-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex justify-between items-start gap-4">
               <div className="flex items-start gap-4 flex-1">
                 <div className="p-3 bg-white/5 rounded-lg text-blue-400">
                    <FileText className="w-6 h-6" />
                 </div>
                 <div>
                   <div className="flex items-center gap-3 mb-1">
                     <h4 className="text-base font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">{doc.title}</h4>
                     <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">{doc.category}</span>
                   </div>
                   <p className="text-sm text-gray-400 leading-relaxed max-w-3xl">{doc.contentSnippet}</p>
                 </div>
               </div>
               
               <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-green-400 font-mono bg-green-500/10 px-2 py-1 rounded">
                    Match: {doc.relevance}%
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-blue-400 hover:bg-white/10 rounded-lg transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
               </div>
            </div>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No documents matched your query.
          </div>
        )}
      </div>
    </div>
  );
}
