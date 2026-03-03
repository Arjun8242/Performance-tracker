import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import {
    Send,
    Trash2,
    Brain,
    User,
    Loader2,
    MessageSquare,
    Zap,
    TrendingUp,
    Dumbbell,
    Shield
} from 'lucide-react';




// Quick suggestion chips to lower friction
const QUICK_SUGGESTIONS = [
    { label: "What's my streak?", icon: Zap },
    { label: "Which muscles are weak?", icon: TrendingUp },
    { label: "Analyze my workout frequency", icon: Dumbbell },
    { label: "What should I focus on today?", icon: Brain },
];

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isClearing, setIsClearing] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const isSendingRef = useRef(false);


    // Load history on mount
    useEffect(() => {
        const loadHistory = async () => {
            try {
                setIsLoadingHistory(true);
                const res = await api.get('/ai/chat');
                setMessages(res.data.messages || []);
            } catch (err) {
                console.error('Failed to load chat history:', err);
            } finally {
                setIsLoadingHistory(false);
            }
        };
        loadHistory();
    }, []);

    // Auto-scroll whenever messages update
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const sendMessage = async (text) => {
        const messageText = (text || input).trim();
        if (!messageText || isLoading || isSendingRef.current) return;
        isSendingRef.current = true;

        const userMsg = { role: 'user', content: messageText };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await api.post(
                '/ai/chat',
                { message: messageText }
            );
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
        } catch (err) {
            const errMsg = err.response?.data?.message || "Connection error. Please try again.";
            setMessages(prev => [...prev, { role: 'assistant', content: errMsg, isError: true }]);
        } finally {
            setIsLoading(false);
            isSendingRef.current = false;
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearHistory = async () => {
        if (!window.confirm('Clear all chat history?')) return;
        try {
            setIsClearing(true);
            await api.delete('/ai/chat');
            setMessages([]);
        } catch (err) {
            console.error('Failed to clear chat:', err);
            const detail = err?.response?.data?.message || err?.message || 'Unknown error';
            window.alert(`Failed to clear chat. Please try again.\n\nDetails: ${detail}`);
        } finally {
            setIsClearing(false);
        }
    };

    const isEmpty = messages.length === 0 && !isLoadingHistory;

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shrink-0">
                        <Brain className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight">AI Coach</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Shield className="w-3 h-3 text-green-500" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600">
                                Read-Only · Advisory Mode
                            </p>
                        </div>
                    </div>
                </div>
                {messages.length > 0 && (
                    <button
                        onClick={clearHistory}
                        disabled={isClearing}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-neutral-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all duration-200 text-xs font-bold uppercase tracking-widest"
                    >
                        {isClearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Clear
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col">

                {isLoadingHistory ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex items-center gap-3 text-neutral-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm font-bold uppercase tracking-widest">Loading history...</span>
                        </div>
                    </div>
                ) : isEmpty ? (
                    /* Empty state */
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mb-6 border border-orange-100">
                            <MessageSquare className="w-10 h-10 text-orange-500" />
                        </div>
                        <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight mb-2">
                            Your AI Coach
                        </h2>
                        <p className="text-neutral-500 text-sm font-medium max-w-xs leading-relaxed mb-2">
                            Ask anything about your training — I have access to your real performance data.
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-green-600 flex items-center gap-1.5 mb-8">
                            <Shield className="w-3 h-3" />
                            I can only give advice, never modify your data
                        </p>

                        {/* Quick suggestions */}
                        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                            {QUICK_SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(s.label)}
                                    className="flex items-center gap-2 p-4 bg-neutral-50 hover:bg-orange-50 border border-neutral-200 hover:border-orange-200 rounded-2xl text-left transition-all duration-200 group"
                                >
                                    <s.icon className="w-4 h-4 text-neutral-400 group-hover:text-orange-500 transition-colors shrink-0" />
                                    <span className="text-xs font-bold text-neutral-600 group-hover:text-orange-600 leading-tight">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Message list */
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user'
                                    ? 'bg-black'
                                    : 'bg-orange-50 border border-orange-100'
                                    }`}>
                                    {msg.role === 'user'
                                        ? <User className="w-4 h-4 text-white" />
                                        : <Brain className="w-4 h-4 text-orange-500" />
                                    }
                                </div>

                                {/* Bubble */}
                                <div className={`max-w-[75%] px-5 py-3.5 rounded-3xl text-sm leading-relaxed font-medium ${msg.role === 'user'
                                    ? 'bg-black text-white rounded-br-lg'
                                    : msg.isError
                                        ? 'bg-red-50 text-red-700 border border-red-100 rounded-bl-lg'
                                        : 'bg-neutral-50 text-neutral-800 border border-neutral-100 rounded-bl-lg'
                                    }`}>
                                    {/* Render bold markdown (**text**) */}
                                    {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                                        part.startsWith('**') && part.endsWith('**')
                                            ? <strong key={i}>{part.slice(2, -2)}</strong>
                                            : part
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div className="flex items-end gap-3">
                                <div className="w-8 h-8 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center shrink-0">
                                    <Brain className="w-4 h-4 text-orange-500" />
                                </div>
                                <div className="bg-neutral-50 border border-neutral-100 px-5 py-4 rounded-3xl rounded-bl-lg flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:300ms]" />
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            {/* Quick suggestions below history (persistent) */}
            {!isEmpty && !isLoadingHistory && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                    {QUICK_SUGGESTIONS.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => sendMessage(s.label)}
                            disabled={isLoading}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl text-[11px] font-bold text-neutral-500 hover:text-orange-600 transition-all duration-200 disabled:opacity-50"
                        >
                            <s.icon className="w-3 h-3" />
                            {s.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="mt-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-4xl shadow-sm flex items-end gap-4 p-4 pl-6">
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask your coach anything about your training..."
                    disabled={isLoading || isLoadingHistory}
                    rows={1}
                    style={{ resize: 'none', overflowY: 'hidden' }}
                    onInput={e => {
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    className="flex-1 bg-transparent text-sm text-black dark:text-white placeholder-neutral-400 font-medium outline-none resize-none leading-relaxed min-h-6 disabled:opacity-50"
                />
                <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    aria-label={isLoading ? "Sending message" : "Send message"}
                    className="w-10 h-10 bg-black hover:bg-orange-600 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 group"
                >
                    {isLoading
                        ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                        : <Send className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    }
                </button>
            </div>

            <p className="text-center text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-3">
                Advisory only · Your data is never modified by AI
            </p>
        </div>
    );
};

export default ChatPage;
