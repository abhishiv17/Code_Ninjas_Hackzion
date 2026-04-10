'use client';

import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { MessageSquare, ThumbsUp, ThumbsDown, Send, Users, PlusCircle } from 'lucide-react';
import { useState } from 'react';

export default function CommunityTickets() {
  const { communityTickets, rateCommunityTicket, commentCommunityTicket, createCommunityTicket } = useApp();
  const { t } = useLanguage();
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newIssue, setNewIssue] = useState('');
  const [newSolution, setNewSolution] = useState('');

  const handleComment = (id: string) => {
    const text = commentInputs[id];
    if (text?.trim()) {
      commentCommunityTicket(id, text);
      setCommentInputs((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleCreateNew = async () => {
    if (newIssue.trim() && newSolution.trim()) {
      await createCommunityTicket(newIssue, newSolution);
      setNewIssue('');
      setNewSolution('');
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/40 dark:backdrop-blur-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Users className="text-blue-500" size={20} />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('community.title')}</h2>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center space-x-1 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <PlusCircle size={14} />
          <span>New Ticket</span>
        </button>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t('community.subtitle')}</p>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {isCreating && (
          <div className="rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10 p-4 mb-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 text-sm">Post a New Solution</h3>
            <input 
              type="text" 
              placeholder="Hardware / System Issue..."
              className="w-full mb-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-400"
              value={newIssue}
              onChange={(e) => setNewIssue(e.target.value)}
            />
            <textarea 
              placeholder="How did you resolve it?"
              className="w-full mb-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-400 min-h-[80px]"
              value={newSolution}
              onChange={(e) => setNewSolution(e.target.value)}
            />
            <div className="flex justify-end space-x-2 text-right">
              <button 
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors mr-2"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateNew}
                disabled={!newIssue.trim() || !newSolution.trim()}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Post Ticket
              </button>
            </div>
          </div>
        )}

        {communityTickets.map((ticket) => (
          <div key={ticket.id} className="rounded-lg border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">{ticket.issue}</h3>
              <span className="text-xs text-slate-400">{ticket.time}</span>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 bg-white dark:bg-slate-900/50 p-3 rounded border border-slate-100 dark:border-slate-700/30">
              <span className="font-medium text-slate-500 dark:text-slate-400 mr-2">{t('community.solution')}</span>
              {ticket.solution}
            </p>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-full px-2 py-1">
                <button 
                  onClick={() => rateCommunityTicket(ticket.id, 'up')}
                  className="p-1 hover:text-emerald-500 text-slate-500 transition-colors"
                >
                  <ThumbsUp size={14} />
                </button>
                <span className="text-xs font-semibold px-1 min-w-[20px] text-center dark:text-slate-300">{ticket.rating}</span>
                <button 
                  onClick={() => rateCommunityTicket(ticket.id, 'down')}
                  className="p-1 hover:text-red-500 text-slate-500 transition-colors"
                >
                  <ThumbsDown size={14} />
                </button>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MessageSquare size={14} />
                <span>{ticket.comments.length} {t('community.comments')}</span>
              </div>
            </div>

            {ticket.comments.length > 0 && (
              <div className="space-y-2 mb-3 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                {ticket.comments.map((comment, i) => (
                  <div key={i} className="text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 mr-2">{comment.author}</span>
                    <span className="text-slate-600 dark:text-slate-400">{comment.text}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-3 relative">
              <input 
                type="text" 
                placeholder={t('community.leaveComment')}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-400"
                value={commentInputs[ticket.id] || ''}
                onChange={(e) => setCommentInputs(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleComment(ticket.id)}
              />
              <button 
                onClick={() => handleComment(ticket.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded p-1.5 transition-colors flex items-center justify-center min-w-[32px]"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        ))}
        {communityTickets.length === 0 && (
          <p className="text-sm text-slate-400 italic text-center mt-8">No community verified tickets yet.</p>
        )}
      </div>
    </div>
  );
}
