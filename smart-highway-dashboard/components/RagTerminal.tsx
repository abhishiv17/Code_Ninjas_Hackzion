'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader, ThumbsUp, ThumbsDown, Mic, MicOff } from 'lucide-react';
import { solveTicket } from '@/lib/api';
import { useDashboard } from '@/context/DashboardContext';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  error?: boolean;
}

export default function RagTerminal() {
  const { ragTerminalQuery, setRagTerminalQuery } = useDashboard();
  const { submitFeedback } = useApp();
  const { t } = useLanguage();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Smart Highway IT RAG Agent online. Waiting for system queries or manual tickets.',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Map<string, boolean>>(new Map());
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setRagTerminalQuery((prev) => prev + (prev ? ' ' : '') + transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [setRagTerminalQuery]);

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

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = async (messageId: string, isHelpful: boolean, userQuery: string, response: string) => {
    setFeedbackGiven((prev) => new Map(prev).set(messageId, isHelpful));
    try {
      await submitFeedback(userQuery, response, isHelpful);
    } catch (error) {
      console.error('Error submitting feedback:', error);
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
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700/50 dark:bg-slate-800/30">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="text-blue-600 dark:text-blue-400" size={20} />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('rag.title')}</h2>
        </div>
        <button
          onClick={clearHistory}
          className="rounded px-3 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"
        >
          {t('rag.clear')}
        </button>
      </div>

      <div className="mb-4 flex flex-1 flex-col space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        {messages.map((message, idx) => {
          const prevMessage = idx > 0 ? messages[idx - 1] : null;
          return (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div>
                <div
                  className={`max-w-[80%] rounded-lg p-4 text-sm ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.error
                      ? 'border border-red-200 bg-red-50 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200'
                      : 'border border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <span className="text-xs opacity-60 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {message.role === 'assistant' && !message.error && !feedbackGiven.has(message.id) && (
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() =>
                        handleFeedback(
                          message.id,
                          true,
                          prevMessage?.content || '',
                          message.content
                        )
                      }
                      className="flex items-center space-x-1 rounded px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-200 hover:text-green-700 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-green-400"
                    >
                      <ThumbsUp size={14} />
                      <span>{t('rag.helpful')}</span>
                    </button>
                    <button
                      onClick={() =>
                        handleFeedback(
                          message.id,
                          false,
                          prevMessage?.content || '',
                          message.content
                        )
                      }
                      className="flex items-center space-x-1 rounded px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-200 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-red-400"
                    >
                      <ThumbsDown size={14} />
                      <span>{t('rag.notHelpful')}</span>
                    </button>
                  </div>
                )}
                {feedbackGiven.has(message.id) && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {feedbackGiven.get(message.id) ? '✓ Feedback recorded (helpful)' : '✓ Feedback recorded (not helpful)'}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
              <Loader size={16} className="animate-spin" />
              <span>Processing query...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex space-x-2">
        <button
          onClick={toggleListening}
          className={`p-3 rounded-lg flex items-center justify-center transition-colors ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
          }`}
          title="Voice Input"
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <input
          type="text"
          placeholder={t('rag.placeholder')}
          value={ragTerminalQuery}
          onChange={(e) => setRagTerminalQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500"
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