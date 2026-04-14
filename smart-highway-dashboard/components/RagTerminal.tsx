'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader, ThumbsUp, ThumbsDown, Mic, MicOff, Paperclip, FileText, Image as ImageIcon, X } from 'lucide-react';
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
  const { t, language } = useLanguage();

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
  const [attachments, setAttachments] = useState<{ type: 'image' | 'document'; data: string; name: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setRagTerminalQuery((prev) => prev + (prev ? ' ' : '') + finalTranscript);
          }
        };

        recognitionRef.current.onerror = (e: any) => {
          console.error('Speech recognition error', e.error);
          setIsListening(false);
          recognitionRef.current.stop();
        };

        recognitionRef.current.onend = () => {
          setIsListening((current) => {
            if (current) {
              try { recognitionRef.current.start(); } catch (e) {}
            }
            return current;
          });
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (file.type.startsWith('image/')) {
          setAttachments(prev => [...prev, { type: 'image', data: result, name: file.name }]);
        } else {
          // Document text
          setAttachments(prev => [...prev, { type: 'document', data: result, name: file.name }]);
        }
      };
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
    // Clear input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSendMessage = async () => {
    if (!ragTerminalQuery.trim() && attachments.length === 0) return;

    let finalQuery = ragTerminalQuery;
    
    // Process Document attachments into the prompt
    const docAttachments = attachments.filter(a => a.type === 'document');
    if (docAttachments.length > 0) {
      finalQuery += '\n\n[Attached Documents for Context]:\n' + docAttachments.map(d => `--- ${d.name} ---\n${d.data}\n`).join('\n');
    }

    // Process Image attachments
    const imgAttachments = attachments.filter(a => a.type === 'image');
    const imageBase64 = imgAttachments.length > 0 ? imgAttachments[0].data : undefined;

    // Add user message to UI
    const displayContent = ragTerminalQuery + (attachments.length > 0 ? `\n[Attached: ${attachments.map(a => a.name).join(', ')}]` : '');
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: displayContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setRagTerminalQuery('');
    setAttachments([]);
    setIsLoading(true);
    
    // Automatically turn off microphone
    if (isListening) {
      setIsListening(false);
      try { if (recognitionRef.current) recognitionRef.current.stop(); } catch(e) {}
    }

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ]);

    try {
      const history = messages
        .filter((m) => m.id !== '0' && m.role !== 'assistant' || (m.role === 'assistant' && !!m.content && m.id !== '0'))
        .slice(-6) 
        .map((m) => ({ role: m.role, content: m.content }));

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_BASE_URL}/api/diagnostics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: finalQuery, 
          history, 
          language: language || 'en',
          ...(imageBase64 && { image_base64: imageBase64 })
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to the diagnostic engine');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: m.content + chunk }
                  : m
              )
            );
          }
        }
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: 'Connection error: Unable to reach the backend service.', error: true }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      setIsListening(false);
      try { recognitionRef.current.stop(); } catch (e) {}
    } else {
      setIsListening(true);
      try { recognitionRef.current.start(); } catch (e) { console.warn(e); }
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
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-col space-y-2">
        {/* Attachment preview area */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2 pr-8 dark:border-slate-700 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
                {att.type === 'image' ? (
                  // Use img instead of next/image since it's a blob/base64
                  <img src={att.data} alt="preview" className="h-8 w-8 rounded object-cover" />
                ) : (
                  <FileText size={16} className="text-blue-500" />
                )}
                <span className="max-w-[120px] truncate">{att.name}</span>
                <button onClick={() => removeAttachment(idx)} className="absolute right-1 top-1 p-1 text-slate-400 hover:text-red-500 rounded bg-white/50 dark:bg-black/50">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            multiple 
            accept="image/*,.txt,.md,.csv" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-lg flex items-center justify-center transition-colors bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            title="Attach file (Image or Document)"
          >
            <Paperclip size={18} />
          </button>
          
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
            disabled={isLoading || (!ragTerminalQuery.trim() && attachments.length === 0)}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}