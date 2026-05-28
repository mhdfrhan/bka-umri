import { useState, useEffect, useRef, useCallback } from 'react';
import {
    MessageSquare,
    X,
    Minus,
    Maximize2,
    Minimize2,
    Send,
    Bot,
    Sparkles,
    PhoneCall,
    FileText,
    CreditCard,
    Calendar,
    ArrowDown,
    RotateCcw,
    HelpCircle,
} from 'lucide-react';

interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: Date;
}

interface DynamicFaqItem {
    id: number;
    label: string;
    question: string;
}

// Helper to get CSRF token in Laravel
const getCsrfToken = (): string => {
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (metaToken) return metaToken;
    
    const xsrfCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
    return xsrfCookie ? decodeURIComponent(xsrfCookie) : '';
};

// Helper to parse inline markdown (links, bold, and italic tags recursively)
const parseInlineMarkdown = (text: string, baseKey: string): React.ReactNode[] => {
    // Regex matches bold (**text**), italic (*text*), or markdown link ([label](url))
    const inlineRegex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|\/[^\s)]+)\))/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let count = 0;

    while ((match = inlineRegex.exec(text)) !== null) {
        const matchIndex = match.index;

        // Add preceding text as plain text
        if (matchIndex > lastIndex) {
            parts.push(
                <span key={`text-${baseKey}-${count}`}>
                    {text.substring(lastIndex, matchIndex)}
                </span>
            );
        }

        const [fullMatch, boldFull, boldText, italicFull, italicText, linkFull, linkLabel, linkUrl] = match;

        if (boldFull) {
            parts.push(
                <strong key={`bold-${baseKey}-${count}`} className="font-extrabold text-slate-900">
                    {parseInlineMarkdown(boldText, `${baseKey}-b-${count}`)}
                </strong>
            );
        } else if (italicFull) {
            parts.push(
                <em key={`italic-${baseKey}-${count}`} className="italic text-slate-700 font-medium">
                    {parseInlineMarkdown(italicText, `${baseKey}-i-${count}`)}
                </em>
            );
        } else if (linkFull) {
            parts.push(
                <a
                    key={`link-${baseKey}-${count}`}
                    href={linkUrl}
                    target={linkUrl.startsWith('mailto:') ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    className="font-semibold text-emerald-700 hover:text-emerald-900 underline decoration-[#0a6c32] hover:decoration-emerald-900 inline-flex items-center gap-0.5 mx-0.5"
                >
                    {parseInlineMarkdown(linkLabel, `${baseKey}-l-${count}`)}
                </a>
            );
        }

        lastIndex = inlineRegex.lastIndex;
        count++;
    }

    if (lastIndex < text.length) {
        parts.push(
            <span key={`text-${baseKey}-post`}>
                {text.substring(lastIndex)}
            </span>
        );
    }

    return parts;
};

interface ListItem {
    text: string;
    indent: number;
}

interface MessageBlock {
    type: 'p' | 'ul' | 'ol';
    items?: ListItem[];
    text?: string;
}

// Markdown Block & List Parser helper
const renderMessageText = (text: string, isGeneratingActive: boolean = false) => {
    if (!text) {
        if (isGeneratingActive) {
            return (
                <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-600 animate-pulse align-middle" />
            );
        }
        return null;
    }

    const lines = text.split(/\r?\n/);
    const blocks: MessageBlock[] = [];
    let currentList: { type: 'ul' | 'ol'; items: ListItem[] } | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Match bullet lists: start with optional whitespace, then *, -, or •, then space, then content
        const bulletMatch = line.match(/^(\s*)([*\-•])\s+(.*)$/);
        // Match numbered lists: start with optional whitespace, then digits, then dot, then space, then content
        const numberMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);

        if (bulletMatch) {
            const indent = bulletMatch[1].length;
            const content = bulletMatch[3];
            
            if (currentList && currentList.type === 'ul') {
                currentList.items.push({ text: content, indent });
            } else {
                if (currentList) {
                    blocks.push({ type: currentList.type, items: currentList.items });
                }
                currentList = { type: 'ul', items: [{ text: content, indent }] };
            }
        } else if (numberMatch) {
            const indent = numberMatch[1].length;
            const content = numberMatch[3];
            
            if (currentList && currentList.type === 'ol') {
                currentList.items.push({ text: content, indent });
            } else {
                if (currentList) {
                    blocks.push({ type: currentList.type, items: currentList.items });
                }
                currentList = { type: 'ol', items: [{ text: content, indent }] };
            }
        } else {
            if (currentList) {
                blocks.push({ type: currentList.type, items: currentList.items });
                currentList = null;
            }
            blocks.push({ type: 'p', text: line });
        }
    }

    if (currentList) {
        blocks.push({ type: currentList.type, items: currentList.items });
    }

    return (
        <>
            {blocks.map((block, index) => {
                const key = `block-${index}`;
                const isLastBlock = index === blocks.length - 1;

                if (block.type === 'ul' && block.items) {
                    return (
                        <ul key={key} className="list-disc pl-5 my-2 space-y-1 text-slate-800">
                            {block.items.map((item, itemIdx) => {
                                const isLastItem = itemIdx === block.items!.length - 1;
                                return (
                                    <li 
                                        key={`li-${key}-${itemIdx}`} 
                                        className="marker:text-emerald-600"
                                        style={{
                                            marginLeft: item.indent > 0 ? `${item.indent * 8}px` : undefined,
                                            listStyleType: item.indent > 0 ? 'circle' : 'disc'
                                        }}
                                    >
                                        {parseInlineMarkdown(item.text, `${key}-${itemIdx}`)}
                                        {isGeneratingActive && isLastBlock && isLastItem && (
                                            <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-600 animate-pulse align-middle" />
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    );
                }

                if (block.type === 'ol' && block.items) {
                    return (
                        <ol key={key} className="list-decimal pl-5 my-2 space-y-1 text-slate-800">
                            {block.items.map((item, itemIdx) => {
                                const isLastItem = itemIdx === block.items!.length - 1;
                                return (
                                    <li 
                                        key={`li-${key}-${itemIdx}`} 
                                        className="marker:text-emerald-600"
                                        style={{
                                            marginLeft: item.indent > 0 ? `${item.indent * 8}px` : undefined
                                        }}
                                    >
                                        {parseInlineMarkdown(item.text, `${key}-${itemIdx}`)}
                                        {isGeneratingActive && isLastBlock && isLastItem && (
                                            <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-600 animate-pulse align-middle" />
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    );
                }

                // Paragraph block
                const isParagraphEmpty = !block.text || block.text.trim() === '';
                if (isParagraphEmpty) {
                    if (isGeneratingActive && isLastBlock) {
                        return (
                            <p key={key} className="my-1.5 first:mt-0 last:mb-0 leading-relaxed text-slate-800">
                                <span className="inline-block w-1.5 h-3.5 bg-emerald-600 animate-pulse align-middle" />
                            </p>
                        );
                    }
                    return <div key={key} className="h-2" />;
                }

                return (
                    <p key={key} className="my-1.5 first:mt-0 last:mb-0 leading-relaxed text-slate-800">
                        {parseInlineMarkdown(block.text || '', key)}
                        {isGeneratingActive && isLastBlock && (
                            <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-600 animate-pulse align-middle" />
                        )}
                    </p>
                );
            })}
        </>
    );
};


export default function ChatbotFloating() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [inputText, setInputText] = useState('');
    const [showScrollBtn, setShowScrollBtn] = useState(false);

    // Typewriter Queue references
    const streamQueueRef = useRef<string>('');
    const activeMsgIdRef = useRef<string | null>(null);
    const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isStreamingRef = useRef(false);

    // Typewriter loop cleanup on unmount
    useEffect(() => {
        return () => {
            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        };
    }, []);

    // Animation and display states
    const [launcherVisible, setLauncherVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [faqs, setFaqs] = useState<DynamicFaqItem[]>([]);
    
    // Session state
    const [sessionId, setSessionId] = useState<string>('');

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            sender: 'bot',
            text: 'Halo! 👋 Saya Asisten Virtual BKA UMRI. Ada yang bisa saya bantu hari ini?',
            timestamp: new Date(),
        },
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatInputRef = useRef<HTMLInputElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Launcher entrance delay on first load & initialize session
    useEffect(() => {
        const timer = setTimeout(() => setLauncherVisible(true), 300);
        
        // Fetch popular FAQs dynamically
        fetch('/api/chatbot/faqs')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setFaqs(data);
                }
            })
            .catch(() => {
                // Fallback list if server is offline
                setFaqs([
                    {
                        id: 1,
                        label: 'Cara Bayar UKT',
                        question: 'Bagaimana cara melakukan pembayaran Virtual Account UKT?',
                    },
                    {
                        id: 2,
                        label: 'Unduh Lampiran',
                        question: 'Di mana saya bisa mengunduh dokumen lampiran resmi BKA?',
                    },
                    {
                        id: 3,
                        label: 'Hubungi Admin BKA',
                        question: 'Bagaimana cara menghubungi Admin BKA via WhatsApp?',
                    }
                ]);
            });

        // Initialize session ID
        let storedSessionId = localStorage.getItem('chatbot_session_id');
        if (storedSessionId) {
            setSessionId(storedSessionId);
        } else {
            fetch('/api/chatbot/new-session', { 
                method: 'POST', 
                headers: { 
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json'
                } 
            })
            .then(res => res.json())
            .then(data => {
                if (data.session_id) {
                    localStorage.setItem('chatbot_session_id', data.session_id);
                    setSessionId(data.session_id);
                }
            })
            .catch(() => {
                const localId = crypto.randomUUID();
                localStorage.setItem('chatbot_session_id', localId);
                setSessionId(localId);
            });
        }

        return () => clearTimeout(timer);
    }, []);

    // Auto scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && !isMinimized && chatInputRef.current) {
            setTimeout(() => chatInputRef.current?.focus(), 150);
        }
    }, [isOpen, isMinimized]);

    // Scroll detection for "scroll to bottom" button
    const handleScroll = useCallback(() => {
        if (!messagesContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } =
            messagesContainerRef.current;
        setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 80);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleOpen = () => {
        setIsOpen(true);
        setIsMinimized(false);
        setTimeout(() => setAnimateIn(true), 30);
    };

    const handleClose = () => {
        setAnimateIn(false);
        setIsOpen(false);
        setIsFullscreen(false);
    };

    const handleMinimize = () => {
        setIsMinimized(true);
    };

    const handleRestore = () => {
        setIsMinimized(false);
    };

    // Reset Session / Clear Chat
    const handleNewSession = () => {
        if (confirm('Apakah Anda yakin ingin memulai percakapan baru? Riwayat obrolan ini akan dihapus dari layar.')) {
            setIsTyping(true);
            fetch('/api/chatbot/new-session', { 
                method: 'POST', 
                headers: { 
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json'
                } 
            })
            .then(res => res.json())
            .then(data => {
                if (data.session_id) {
                    localStorage.setItem('chatbot_session_id', data.session_id);
                    setSessionId(data.session_id);
                    setMessages([
                        {
                            id: 'welcome',
                            sender: 'bot',
                            text: 'Halo! 👋 Saya Asisten Virtual BKA UMRI. Ada yang bisa saya bantu hari ini?',
                            timestamp: new Date(),
                        },
                    ]);
                    setShowSuggestions(true);
                }
                setIsTyping(false);
            })
            .catch(() => {
                const localId = crypto.randomUUID();
                localStorage.setItem('chatbot_session_id', localId);
                setSessionId(localId);
                setMessages([
                    {
                        id: 'welcome',
                        sender: 'bot',
                        text: 'Halo! 👋 Saya Asisten Virtual BKA UMRI. Ada yang bisa saya bantu hari ini?',
                        timestamp: new Date(),
                    },
                ]);
                setShowSuggestions(true);
                setIsTyping(false);
            });
        }
    };

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || isGenerating) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: text,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);
        setShowSuggestions(false);
        setIsGenerating(true);

        const botMsgId = (Date.now() + 1).toString();
        activeMsgIdRef.current = botMsgId;
        streamQueueRef.current = '';
        isStreamingRef.current = true;
        const activeSessionId = sessionId || localStorage.getItem('chatbot_session_id') || crypto.randomUUID();

        // Setup the typewriter ticking loop
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = setInterval(() => {
            if (streamQueueRef.current.length > 0) {
                // Determine speed: type faster if queue gets backlog to avoid lagging behind real-time
                const charCount = streamQueueRef.current.length > 80 
                    ? 6 
                    : (streamQueueRef.current.length > 30 ? 3 : 1);
                
                const charsToType = streamQueueRef.current.substring(0, charCount);
                streamQueueRef.current = streamQueueRef.current.substring(charCount);

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === activeMsgIdRef.current
                            ? { ...msg, text: msg.text + charsToType }
                            : msg
                    )
                );
            } else if (!isStreamingRef.current) {
                // Done streaming and queue is fully typed
                if (typingIntervalRef.current) {
                    clearInterval(typingIntervalRef.current);
                    typingIntervalRef.current = null;
                }
                setIsGenerating(false);
            }
        }, 12); // butter-smooth typesetting ticking rate!

        try {
            const response = await fetch('/api/chatbot/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'text/event-stream, application/json',
                },
                body: JSON.stringify({
                    session_id: activeSessionId,
                    message: text,
                }),
            });

            if (!response.ok) {
                isStreamingRef.current = false;
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData.error || 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.';
                
                if (typingIntervalRef.current) {
                    clearInterval(typingIntervalRef.current);
                    typingIntervalRef.current = null;
                }
                setIsGenerating(false);
                setIsTyping(false);

                setMessages((prev) => [
                    ...prev,
                    {
                        id: botMsgId,
                        sender: 'bot',
                        text: errMsg,
                        timestamp: new Date(),
                    },
                ]);
                return;
            }

            // Create placeholder message for streaming content
            setMessages((prev) => [
                ...prev,
                {
                    id: botMsgId,
                    sender: 'bot',
                    text: '',
                    timestamp: new Date(),
                },
            ]);
            setIsTyping(false);

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error('No stream reader available');

            let buffer = '';
            let currentEvent = 'message';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                let lineBreakIndex;
                while ((lineBreakIndex = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.slice(0, lineBreakIndex).trim();
                    buffer = buffer.slice(lineBreakIndex + 1);

                    if (line === '' || line === 'data: [DONE]') {
                        if (line === '') {
                            currentEvent = 'message';
                        }
                        continue;
                    }

                    if (line.startsWith('event: ')) {
                        currentEvent = line.slice(7).trim();
                        if (currentEvent === 'error_retry') {
                            streamQueueRef.current = '';
                            setMessages((prev) =>
                                prev.map((msg) =>
                                    msg.id === botMsgId
                                        ? { ...msg, text: '' }
                                        : msg
                                )
                            );
                        }
                        continue;
                    }

                    if (line.startsWith('data: ')) {
                        if (currentEvent === 'error_retry') {
                            continue;
                        }
                        try {
                            const jsonStr = line.slice(6);
                            const parsed = JSON.parse(jsonStr);
                            if (parsed && parsed.text !== undefined) {
                                streamQueueRef.current += parsed.text;
                            }
                        } catch (e) {
                            // Suppress parse errors for chunk boundaries
                        }
                    }
                }
            }

            isStreamingRef.current = false;

        } catch (error) {
            isStreamingRef.current = false;
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current);
                typingIntervalRef.current = null;
            }
            setIsGenerating(false);
            setIsTyping(false);

            setMessages((prev) => [
                ...prev,
                {
                    id: botMsgId,
                    sender: 'bot',
                    text: 'Gagal menghubungi asisten virtual. Silakan periksa koneksi internet Anda.',
                    timestamp: new Date(),
                },
            ]);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(inputText);
    };

    return (
        <>
            <style>{`
                /* ─── Typing dots ─── */
                @keyframes cb-typing-bounce {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-4px); opacity: 1; }
                }
                .cb-typing-dot {
                    animation: cb-typing-bounce 1.2s ease-in-out infinite;
                }
                .cb-typing-dot:nth-child(2) { animation-delay: 0.15s; }
                .cb-typing-dot:nth-child(3) { animation-delay: 0.3s; }

                /* ─── Backdrop ─── */
                @keyframes cb-backdrop-in {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                .cb-backdrop {
                    animation: cb-backdrop-in 0.2s ease forwards;
                }

                /* ─── Custom scrollbar ─── */
                .cb-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .cb-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .cb-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(10, 108, 50, 0.12);
                    border-radius: 99px;
                }
                .cb-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(10, 108, 50, 0.25);
                }

                /* ─── Background Ripple Rings ─── */
                @keyframes cb-ripple {
                    0% {
                        transform: scale(0.95);
                        opacity: 0.8;
                    }
                    50% {
                        opacity: 0.4;
                    }
                    100% {
                        transform: scale(1.6);
                        opacity: 0;
                    }
                }
                .cb-ripple-ring {
                    position: absolute;
                    inset: 0;
                    border-radius: 9999px;
                    background-color: rgba(10, 108, 50, 0.24);
                    pointer-events: none;
                    animation: cb-ripple 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
                }
                .cb-ripple-ring:nth-child(2) {
                    animation-delay: 0.8s;
                }
                .cb-ripple-ring:nth-child(3) {
                    animation-delay: 1.6s;
                }
            `}</style>

            <div className="font-sans">
                {/* ═══ Launcher Bubble (Always mounted to support entry/exit transitions) ═══ */}
                <div
                    className={`fixed right-6 bottom-6 z-50 flex h-[60px] w-[60px] items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        launcherVisible && !isOpen && !isMinimized
                            ? 'scale-100 opacity-100'
                            : 'scale-0 opacity-0 pointer-events-none'
                    }`}
                >
                    {/* Ripple Rings (Spread animation) */}
                    <div className="cb-ripple-ring" />
                    <div className="cb-ripple-ring" />
                    <div className="cb-ripple-ring" />

                    <button
                        onClick={handleOpen}
                        className="group relative flex h-[60px] w-[60px] cursor-pointer items-center justify-center rounded-full bg-[#0a6c32] text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                        aria-label="Buka Asisten BKA"
                    >
                        {/* Tooltip */}
                        <span className="pointer-events-none absolute -top-12 right-0 hidden rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold whitespace-nowrap text-white shadow-xl group-hover:block">
                            Tanya Asisten BKA 👋
                            <span className="absolute -bottom-1 right-5 h-2 w-2 rotate-45 bg-slate-900" />
                        </span>

                        <MessageSquare className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                    </button>
                </div>

                {/* ═══ Minimized Bar ═══ */}
                {isOpen && isMinimized && (
                    <button
                        onClick={handleRestore}
                        className="fixed right-6 bottom-6 z-50 flex w-[260px] cursor-pointer items-center justify-between overflow-hidden rounded-2xl bg-white px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-[#0a6c32]">
                                <img 
                                    src="/assets/chatbot.webp" 
                                    alt="Chatbot BKA" 
                                    className="h-6 w-6 object-contain rounded-full" 
                                />
                                <span className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border border-white bg-emerald-500" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[13px] font-bold text-slate-800">
                                    Asisten BKA
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                                    Online
                                </span>
                            </div>
                        </div>
                        <span
                            onClick={(e) => {
                                  e.stopPropagation();
                                  handleClose();
                            }}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        >
                            <X className="h-3.5 w-3.5" />
                        </span>
                    </button>
                )}

                {/* ═══ Chat Window ═══ */}
                {isOpen && (
                    <>
                        {/* Fullscreen backdrop */}
                        {isFullscreen && (
                            <div
                                className="cb-backdrop fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs"
                                onClick={() => setIsFullscreen(false)}
                            />
                        )}

                        <div
                            className={`fixed z-50 flex flex-col overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                                isFullscreen
                                    ? 'inset-4 rounded-2xl sm:inset-8 md:right-1/2 md:bottom-1/2 md:left-auto md:top-auto md:h-[680px] md:w-[90%] md:max-w-3xl md:translate-x-1/2 md:translate-y-1/2 md:rounded-2xl'
                                    : 'right-6 bottom-6 h-[540px] w-[400px] rounded-2xl max-sm:right-0 max-sm:bottom-0 max-sm:h-full max-sm:w-full max-sm:rounded-none'
                            } ${
                                isMinimized || !animateIn
                                    ? 'pointer-events-none translate-y-10 scale-95 opacity-0'
                                    : 'translate-y-0 scale-100 opacity-100'
                            }`}
                        >
                            {/* ─── Header ─── */}
                            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4.5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                                        <img 
                                            src="/assets/chatbot.webp" 
                                            alt="Chatbot BKA" 
                                            className="h-8 w-8 object-contain rounded-full" 
                                        />
                                        <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[14px] font-bold text-slate-800">
                                                Asisten BKA
                                            </span>
                                            <Sparkles className="h-3.5 w-3.5 text-[#c8a000]" />
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-400">
                                            Biro Keuangan & Aset UMRI
                                        </span>
                                    </div>
                                </div>

                                {/* Window controls */}
                                <div className="flex items-center gap-0.5">
                                    {/* Reset Chat */}
                                    <button
                                        onClick={handleNewSession}
                                        disabled={isGenerating}
                                        className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-450 transition-colors hover:bg-slate-50 hover:text-[#0a6c32] ${
                                            isGenerating ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                                        }`}
                                        title="Mulai Percakapan Baru"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                    </button>
                                    {/* Minimize */}
                                    <button
                                        onClick={handleMinimize}
                                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-450 transition-colors hover:bg-slate-50 hover:text-slate-800"
                                        title="Perkecil"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    {/* Fullscreen toggle */}
                                    <button
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                        className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-450 transition-colors hover:bg-slate-50 hover:text-slate-800 sm:flex"
                                        title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                                    >
                                        {isFullscreen ? (
                                            <Minimize2 className="h-3.5 w-3.5" />
                                        ) : (
                                            <Maximize2 className="h-3.5 w-3.5" />
                                        )}
                                    </button>
                                    {/* Close */}
                                    <button
                                        onClick={handleClose}
                                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-450 transition-colors hover:bg-red-50 hover:text-red-500"
                                        title="Tutup"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* ─── Messages Area ─── */}
                            <div
                                ref={messagesContainerRef}
                                onScroll={handleScroll}
                                className="cb-scrollbar relative flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4.5"
                            >
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`relative max-w-[82%] px-4 py-3 text-[13px] leading-relaxed transition-all ${
                                                msg.sender === 'user'
                                                    ? 'rounded-2xl rounded-tr-sm bg-[#0a6c32] text-white shadow-xs'
                                                    : 'rounded-2xl rounded-tl-sm bg-slate-100/80 text-slate-800'
                                            }`}
                                        >
                                             {msg.sender === 'bot' ? (
                                                 <div className="space-y-1">
                                                     {renderMessageText(msg.text, msg.id === activeMsgIdRef.current && isGenerating)}
                                                 </div>
                                             ) : (
                                                 <div className="whitespace-pre-line">
                                                     {msg.text}
                                                 </div>
                                             )}
                                            <span
                                                className={`mt-1.5 block text-right text-[9px] font-semibold ${
                                                    msg.sender === 'user'
                                                        ? 'text-white/60'
                                                        : 'text-slate-400'
                                                }`}
                                            >
                                                {msg.timestamp.toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {/* Typing indicator */}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-slate-100/80 px-4 py-3.5">
                                            <span className="cb-typing-dot h-1.5 w-1.5 rounded-full bg-[#0a6c32]" />
                                            <span className="cb-typing-dot h-1.5 w-1.5 rounded-full bg-[#0a6c32]" />
                                            <span className="cb-typing-dot h-1.5 w-1.5 rounded-full bg-[#0a6c32]" />
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />

                                {/* Scroll-to-bottom button */}
                                {showScrollBtn && (
                                    <button
                                        onClick={scrollToBottom}
                                        className="sticky bottom-2 left-1/2 mx-auto flex h-8 w-8 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-[#0a6c32]"
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* ─── FAQ Suggestions ─── */}
                            {showSuggestions && faqs.length > 0 && (
                                <div className="border-t border-slate-100 bg-white px-4 py-3.5">
                                    <span className="mb-2 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                        Pertanyaan Populer
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {faqs.map((faq) => {
                                            return (
                                                <button
                                                    key={faq.id}
                                                    onClick={() => handleSendMessage(faq.question)}
                                                    disabled={isGenerating}
                                                    className={`flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-650 transition-colors ${
                                                        isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                                >
                                                    <HelpCircle className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                    <span>{faq.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ─── Input Area ─── */}
                            <form
                                onSubmit={handleFormSubmit}
                                className="flex items-center gap-2 border-t border-slate-100 bg-white p-3 max-sm:pb-6"
                            >
                                <div className="relative flex-1">
                                    <input
                                        ref={chatInputRef}
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        disabled={isGenerating}
                                        placeholder={isGenerating ? "Asisten sedang mengetik..." : "Ketik pertanyaan Anda..."}
                                        className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-[13px] text-slate-800 placeholder-slate-400 transition-all focus:border-[#0a6c32] focus:bg-white focus:outline-none ${
                                            isGenerating ? 'opacity-65 cursor-not-allowed' : ''
                                        }`}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!inputText.trim() || isGenerating}
                                    className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all ${
                                        inputText.trim() && !isGenerating
                                            ? 'bg-[#0a6c32] text-white shadow-sm hover:bg-[#085627] active:scale-95'
                                            : 'cursor-not-allowed bg-slate-50 text-slate-300'
                                    }`}
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
