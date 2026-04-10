'use client';

import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { MessageSquare, ThumbsUp, ThumbsDown, Send, Users } from 'lucide-react';
import { useState } from 'react';

export default function CommunityTickets() {
  const { communityTickets, rateCommunityTicket, commentCommunityTicket } = useApp();
  const { t } = useLanguage();
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handleComment = (id: string) => {
    const text = commentInputs[id];
    if (text?.trim()) {
      commentCommunityTicket(id, text);
      setCommentInputs((prev) => ({ ...prev, [id]: '' }));
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md">
      <div className="flex items-center space-x-2 mb-2">
        <Users className="text-blue-500" size={20} />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('community.title')}</h2>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t('community.subtitle')}</p>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
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
