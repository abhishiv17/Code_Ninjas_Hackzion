'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader } from 'lucide-react';
import { solveTicket } from '@/lib/api';
import { useDashboard } from '@/context/DashboardContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  error?: boolean;
}

export default function RagTerminal() {
  const { ragTerminalQuery, setRagTerminalQuery } = useDashboard();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Smart Highway IT RAG Agent online. Waiting for system queries or manual tickets.',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('ragTerminalMessages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages).map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(parsed);
      } catch (error) {
        console.error('Failed to load messages from localStorage:', error);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ragTerminalMessages', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!ragTerminalQuery.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: ragTerminalQuery,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setRagTerminalQuery('');
    setIsLoading(true);

    try {
      // Call backend API
      const response = await solveTicket(ragTerminalQuery);

      let assistantMessage: Message;

      if (response.status === 'success') {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
        };
      } else {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${response.error || 'Failed to process request'}`,
          timestamp: new Date(),
          error: true,
        };
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Connection error: Unable to reach the backend service.`,
        timestamp: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearHistory = () => {
    setMessages([
      {
        id: '0',
        role: 'assistant',
        content: 'Smart Highway IT RAG Agent online. Waiting for system queries or manual tickets.',
        timestamp: new Date(),
      },
    ]);
    localStorage.removeItem('ragTerminalMessages');
  };

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bot className="text-blue-400" size={20} />
          <h2 className="text-lg font-semibold text-white">RAG Agent Terminal</h2>
        </div>
        <button
          onClick={clearHistory}
          className="text-xs px-3 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-lg p-4 mb-4 overflow-y-auto flex flex-col space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] text-sm p-4 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.error
                  ? 'bg-red-500/10 border border-red-500/20 text-red-200'
                  : 'bg-blue-500/10 border border-blue-500/20 text-blue-200'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              <span className="text-xs opacity-60 mt-2 block">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm p-4 rounded-lg">
              <Loader size={16} className="animate-spin" />
              <span>Processing query...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Describe an issue or ask a manual question..."
          value={ragTerminalQuery}
          onChange={(e) => setRagTerminalQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !ragTerminalQuery.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors flex items-center justify-center"
        >
          {isLoading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}