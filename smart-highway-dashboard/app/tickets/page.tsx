'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import TicketAnalysis from '@/components/TicketAnalysis';
import DashboardSlidePanel from '@/components/DashboardSlidePanel';
import CommunityTickets from '@/components/CommunityTickets';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { Ticket, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react';

export default function TicketsPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, tickets } = useApp();
  const { t } = useLanguage();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  const filteredTickets = filterStatus === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'closed':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle size={16} />;
      case 'in_progress':
        return <Clock size={16} />;
      case 'resolved':
        return <CheckCircle size={16} />;
      default:
        return <Ticket size={16} />;
    }
  };

  if (!isHydrated || !isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0f172a]">
      <Sidebar />
      <main className="ml-64 flex flex-1 flex-col h-full overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto p-6 pt-24 md:p-8 md:pt-28">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">{t('nav.tickets')}</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage and analyze system support tickets with AI</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tickets List */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tickets ({filteredTickets.length})</h2>
                  <Filter size={18} className="text-slate-500 dark:text-slate-400" />
                </div>

                {/* Filter and Buttons */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {(['all', 'open', 'in_progress', 'resolved'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`rounded px-3 py-1 text-xs font-medium transition-all ${
                        filterStatus === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20'
                      }`}
                    >
                      {status === 'all' ? 'All' : status.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                {/* Tickets */}
                <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                  {filteredTickets.map(ticket => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full rounded-lg border p-4 text-left transition-all ${
                        selectedTicket?.id === ticket.id
                          ? 'border-blue-500/50 bg-blue-50 dark:bg-blue-500/20'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${getStatusColor(ticket.status).split(' ')[0]}`}>
                          {getStatusIcon(ticket.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium text-slate-900 dark:text-white">{ticket.title}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">ID: {ticket.id}</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${getStatusColor(ticket.status)}`}>
                              {getStatusIcon(ticket.status)}
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ticket Details and Analysis */}
            <div className="lg:col-span-2 space-y-6">
              {selectedTicket ? (
                <>
                  {/* Ticket Info */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">{selectedTicket.title}</h3>
                    <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-300">{selectedTicket.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Status</p>
                        <span className={`inline-flex items-center gap-2 px-3 py-2 rounded border ${getStatusColor(selectedTicket.status)}`}>
                          {getStatusIcon(selectedTicket.status)}
                          {selectedTicket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Assigned To</p>
                        <p className="font-medium text-slate-900 dark:text-white">{selectedTicket.assignedTo || 'Unassigned'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Created</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Severity</p>
                        <p className="font-medium capitalize text-slate-900 dark:text-white">{selectedTicket.severity}</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">AI Analysis</h3>
                    <TicketAnalysis 
                      ticketDescription={selectedTicket.description}
                      onAnalysisComplete={setAnalysisResult}
                    />
                  </div>

                  {/* Analysis Result */}
                  {analysisResult && (
                    <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-emerald-200 mb-4">Resolution Plan</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-400 mb-2">Recommended Action</p>
                          <p className="text-slate-800 dark:text-white">{analysisResult.solution}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Confidence</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-white/10 rounded overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500"
                                  style={{ width: `${analysisResult.confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-sm text-emerald-300">{Math.round(analysisResult.confidence * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-12 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md">
                  <p className="text-slate-500 dark:text-slate-400">Select a ticket to view details and analysis</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
             <CommunityTickets />
          </div>
        </div>
      </main>
      <DashboardSlidePanel />
    </div>
  );
}
