import { useState, useEffect, useRef, useCallback } from 'react';
import {
    MessageSquare,
    X,
    Minus,
    Maximize2,
    Minimize2,
    Send,
    Sparkles,
    ArrowDown,
    RotateCcw,
    HelpCircle,
    Loader2,
    Globe,
    Database,
    CheckCircle2,
    Volume2,
    VolumeX,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
    return xsrfCookie ? decodeURIComponent(xsrfCookie) : '';
};

// Web Audio API & Vibration Haptics (Sound & Haptics ala HanX Chat)
class SoundFx {
    private ctx: AudioContext | null = null;

    private getContext(): AudioContext | null {
        if (typeof window === 'undefined') return null;
        if (!this.ctx) {
            const AudioContextClass =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (!AudioContextClass) return null;
            this.ctx = new AudioContextClass();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    private tone(
        freq: number,
        start: number,
        dur: number,
        vol: number,
        type: OscillatorType = 'sine',
        endFreq?: number
    ) {
        try {
            const ctx = this.getContext();
            if (!ctx) return;
            const t0 = ctx.currentTime + start;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, t0);
            if (endFreq) {
                osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
            }

            gain.gain.setValueAtTime(0.0001, t0);
            gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

            osc.connect(gain).connect(ctx.destination);
            osc.start(t0);
            osc.stop(t0 + dur + 0.03);
        } catch {
            // Suppress audio context errors on restrictive browsers
        }
    }

    private buzz(pattern: number | number[]) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try {
                navigator.vibrate(pattern);
            } catch {
                // Ignore vibration errors if disabled
            }
        }
    }

    // Message dispatch effect (soft upward chime + short haptic)
    playSent(muted: boolean) {
        if (muted) return;
        this.buzz(8);
        this.tone(420, 0, 0.17, 0.15, 'sine', 1100);
        this.tone(840, 0, 0.17, 0.04, 'triangle', 2200);
    }

    // Message arrival effect (crisp Apple-inspired tri-tone chime + double haptic)
    playReceived(muted: boolean) {
        if (muted) return;
        this.buzz([12, 50, 14]);
        this.tone(1175, 0, 0.32, 0.12);
        this.tone(1568, 0.1, 0.4, 0.12);
        this.tone(2093, 0.2, 0.55, 0.07);
    }

    // Toggle mute confirmation sound
    playToggle(muted: boolean) {
        if (muted) return;
        this.buzz(10);
        this.tone(880, 0, 0.12, 0.1);
    }
}

const soundFx = new SoundFx();

export default function ChatbotFloating() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [agentStatus, setAgentStatus] = useState<string>('');
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
    const [inputText, setInputText] = useState('');
    const [showScrollBtn, setShowScrollBtn] = useState(false);

    // Sound & Haptics state
    const [isMuted, setIsMuted] = useState<boolean>(() => {
        try {
            return localStorage.getItem('bka-chatbot-muted') === '1';
        } catch {
            return false;
        }
    });
    const isMutedRef = useRef(isMuted);
    const hasPlayedArrivalRef = useRef(false);

    useEffect(() => {
        isMutedRef.current = isMuted;
    }, [isMuted]);

    const toggleMute = () => {
        setIsMuted((prev) => {
            const next = !prev;
            try {
                localStorage.setItem('bka-chatbot-muted', next ? '1' : '0');
            } catch {
                // Ignore storage errors
            }
            if (!next) {
                soundFx.playToggle(false);
            }
            return next;
        });
    };

    // Typewriter Queue references
    const streamQueueRef = useRef<string>('');
    const activeMsgIdRef = useRef<string | null>(null);
    const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const statusTimerRef = useRef<NodeJS.Timeout | null>(null);
    const hasStartedContentRef = useRef(false);
    const isStreamingRef = useRef(false);

    // Animation and display states
    const [launcherVisible, setLauncherVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [faqs, setFaqs] = useState<DynamicFaqItem[]>([]);

    // Session state
    const [sessionId, setSessionId] = useState<string>('');
    const [greetingMessage, setGreetingMessage] = useState<string>(
        'Halo! 👋 Saya Asisten Virtual BKA UMRI. Ada yang bisa saya bantu terkait layanan keuangan, beasiswa, atau informasi kampus?'
    );
    const [isChatbotEnabled, setIsChatbotEnabled] = useState<boolean>(true);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            sender: 'bot',
            text: 'Halo! 👋 Saya Asisten Virtual BKA UMRI. Ada yang bisa saya bantu terkait layanan keuangan, beasiswa, atau informasi kampus?',
            timestamp: new Date(),
        },
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatTextareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
            if (statusTimerRef.current) clearInterval(statusTimerRef.current);
        };
    }, []);

    // Launcher entrance delay on first load & initialize session
    useEffect(() => {
        const timer = setTimeout(() => setLauncherVisible(true), 300);

        // Fetch popular FAQs dynamically
        fetch('/api/chatbot/faqs')
            .then((res) => res.json())
            .then((data) => {
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
                    },
                ]);
            });

        // Initialize session ID & fetch dynamic greeting/enabled status
        const storedSessionId = localStorage.getItem('chatbot_session_id');
        if (storedSessionId) {
            setSessionId(storedSessionId);
        }

        fetch('/api/chatbot/new-session', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
                Accept: 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (typeof data.enabled === 'boolean') {
                    setIsChatbotEnabled(data.enabled);
                }
                if (data.greeting_message) {
                    setGreetingMessage(data.greeting_message);
                    setMessages((prev) =>
                        prev.map((m) => (m.id === 'welcome' ? { ...m, text: data.greeting_message } : m))
                    );
                }
                if (!storedSessionId && data.session_id) {
                    localStorage.setItem('chatbot_session_id', data.session_id);
                    setSessionId(data.session_id);
                }
            })
            .catch(() => {
                if (!storedSessionId) {
                    const localId = crypto.randomUUID();
                    localStorage.setItem('chatbot_session_id', localId);
                    setSessionId(localId);
                }
            });

        return () => clearTimeout(timer);
    }, []);

    // Auto scroll to bottom
    const scrollToBottom = useCallback((smooth = true) => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
        }
    }, []);

    useEffect(() => {
        scrollToBottom(true);
    }, [messages, isTyping, agentStatus, scrollToBottom]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && !isMinimized && chatTextareaRef.current) {
            setTimeout(() => {
                chatTextareaRef.current?.focus();
            }, 180);
        }
    }, [isOpen, isMinimized]);

    // Scroll detection for "scroll to bottom" button
    const handleScroll = useCallback(() => {
        if (!messagesContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 80);
    }, []);

    const handleOpen = () => {
        setIsOpen(true);
        setIsMinimized(false);
        // Request animation frame for smooth pop
        requestAnimationFrame(() => {
            setTimeout(() => setAnimateIn(true), 20);
        });
    };

    const handleClose = () => {
        setAnimateIn(false);
        // Wait for smooth scale & fade out transition before resetting
        setTimeout(() => {
            setIsOpen(false);
            setIsFullscreen(false);
            setIsMinimized(false);
        }, 260);
    };

    const handleMinimize = () => {
        // Smooth minimize: triggers fade out of main window and hides backdrop
        setIsMinimized(true);
    };

    const handleRestore = () => {
        setIsMinimized(false);
        requestAnimationFrame(() => {
            setTimeout(() => setAnimateIn(true), 20);
        });
    };

    // Reset Session / Clear Chat
    const handleNewSession = () => {
        if (confirm('Mulai percakapan baru? Riwayat obrolan di layar akan dibersihkan.')) {
            setIsTyping(true);
            fetch('/api/chatbot/new-session', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    Accept: 'application/json',
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    const nextGreeting = data.greeting_message || greetingMessage;
                    if (data.greeting_message) {
                        setGreetingMessage(data.greeting_message);
                    }
                    if (data.session_id) {
                        localStorage.setItem('chatbot_session_id', data.session_id);
                        setSessionId(data.session_id);
                        setMessages([
                            {
                                id: 'welcome',
                                sender: 'bot',
                                text: nextGreeting,
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
                            text: greetingMessage,
                            timestamp: new Date(),
                        },
                    ]);
                    setShowSuggestions(true);
                    setIsTyping(false);
                });
        }
    };

    const handleSendMessage = async (text: string) => {
        const cleanText = text.trim();
        if (!cleanText || isGenerating) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: cleanText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputText('');
        if (chatTextareaRef.current) {
            chatTextareaRef.current.style.height = 'auto';
        }

        // Play Sound & Haptics for message dispatch
        soundFx.playSent(isMutedRef.current);
        hasPlayedArrivalRef.current = false;

        setIsTyping(true);
        setShowSuggestions(false);
        setIsGenerating(true);
        setAgentStatus('Sedang menganalisis pertanyaan Anda...');
        setCompletedSteps([]);
        setElapsedSeconds(0);
        hasStartedContentRef.current = false;

        const botMsgId = (Date.now() + 1).toString();
        activeMsgIdRef.current = botMsgId;
        streamQueueRef.current = '';
        isStreamingRef.current = true;
        const activeSessionId = sessionId || localStorage.getItem('chatbot_session_id') || crypto.randomUUID();

        // Setup real-time elapsed timer & progressive status updates
        if (statusTimerRef.current) clearInterval(statusTimerRef.current);
        statusTimerRef.current = setInterval(() => {
            if (hasStartedContentRef.current) {
                if (statusTimerRef.current) {
                    clearInterval(statusTimerRef.current);
                    statusTimerRef.current = null;
                }
                return;
            }
            setElapsedSeconds((prev) => {
                const next = prev + 1;
                setAgentStatus((currentStatus) => {
                    // Only auto-advance generic thinking messages, do not overwrite specific tool search messages
                    const isSpecificTool =
                        currentStatus.includes('internet') ||
                        currentStatus.includes('halaman web') ||
                        currentStatus.includes('database BKA:') ||
                        currentStatus.includes('dokumen') ||
                        currentStatus.includes('struktur');
                    if (isSpecificTool) return currentStatus;

                    if (next === 3) {
                        return 'Sedang memeriksa konteks database BKA UMRI...';
                    }
                    if (next === 6) {
                        return 'Sedang berpikir & menelaah informasi...';
                    }
                    if (next === 10) {
                        return 'Sedang memverifikasi keakuratan data & menyusun jawaban...';
                    }
                    if (next === 15) {
                        return 'Hampir selesai, sedang merangkum jawaban lengkap...';
                    }
                    return currentStatus;
                });
                return next;
            });
        }, 1000);

        // Setup the typewriter ticking loop
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = setInterval(() => {
            if (streamQueueRef.current.length > 0) {
                hasStartedContentRef.current = true;
                const charCount =
                    streamQueueRef.current.length > 80 ? 6 : streamQueueRef.current.length > 30 ? 3 : 1;

                const charsToType = streamQueueRef.current.substring(0, charCount);
                streamQueueRef.current = streamQueueRef.current.substring(charCount);

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === activeMsgIdRef.current ? { ...msg, text: msg.text + charsToType } : msg
                    )
                );
            } else if (!isStreamingRef.current) {
                if (typingIntervalRef.current) {
                    clearInterval(typingIntervalRef.current);
                    typingIntervalRef.current = null;
                }
                if (statusTimerRef.current) {
                    clearInterval(statusTimerRef.current);
                    statusTimerRef.current = null;
                }
                setAgentStatus('');
                setCompletedSteps([]);
                setIsGenerating(false);
            }
        }, 12);

        try {
            const response = await fetch('/api/chatbot/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    Accept: 'text/event-stream, application/json',
                },
                body: JSON.stringify({
                    session_id: activeSessionId,
                    message: cleanText,
                }),
            });

            if (!response.ok) {
                if (!hasPlayedArrivalRef.current) {
                    hasPlayedArrivalRef.current = true;
                    soundFx.playReceived(isMutedRef.current);
                }
                isStreamingRef.current = false;
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData.error || 'Terjadi gangguan sementara pada sistem. Silakan coba sesaat lagi.';

                if (typingIntervalRef.current) {
                    clearInterval(typingIntervalRef.current);
                    typingIntervalRef.current = null;
                }
                if (statusTimerRef.current) {
                    clearInterval(statusTimerRef.current);
                    statusTimerRef.current = null;
                }
                setAgentStatus('');
                setCompletedSteps([]);
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

                    if (line === '' || line === 'data: [DONE]' || line.startsWith(':')) {
                        if (line === '') {
                            currentEvent = 'message';
                        }
                        continue;
                    }

                    if (line.startsWith('event: ')) {
                        currentEvent = line.slice(7).trim();
                        if (currentEvent === 'error_retry') {
                            streamQueueRef.current = '';
                            setAgentStatus('Mengalihkan ke server model cadangan...');
                            setMessages((prev) =>
                                prev.map((msg) => (msg.id === botMsgId ? { ...msg, text: '' } : msg))
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
                            if (currentEvent === 'status' && parsed && typeof parsed.text === 'string') {
                                const nextStatus = parsed.text.trim();
                                if (nextStatus !== '') {
                                    setAgentStatus((prevStatus) => {
                                        if (prevStatus && prevStatus !== nextStatus) {
                                            setCompletedSteps((steps) => {
                                                const filtered = steps.filter((s) => s !== prevStatus);
                                                return [...filtered.slice(-2), prevStatus];
                                            });
                                        }
                                        return nextStatus;
                                    });
                                } else {
                                    setAgentStatus('');
                                }
                            } else if (parsed && parsed.text !== undefined && currentEvent !== 'done') {
                                if (parsed.text !== '') {
                                    if (!hasPlayedArrivalRef.current) {
                                        hasPlayedArrivalRef.current = true;
                                        soundFx.playReceived(isMutedRef.current);
                                    }
                                    hasStartedContentRef.current = true;
                                    setAgentStatus('');
                                    streamQueueRef.current += parsed.text;
                                }
                            }
                        } catch {
                            // Suppress parse errors for chunk boundaries
                        }
                    }
                }
            }

            isStreamingRef.current = false;
        } catch {
            if (!hasPlayedArrivalRef.current) {
                hasPlayedArrivalRef.current = true;
                soundFx.playReceived(isMutedRef.current);
            }
            isStreamingRef.current = false;
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current);
                typingIntervalRef.current = null;
            }
            if (statusTimerRef.current) {
                clearInterval(statusTimerRef.current);
                statusTimerRef.current = null;
            }
            setAgentStatus('');
            setCompletedSteps([]);
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

    // Autosize textarea & keydown handling
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (inputText.trim() && !isGenerating) {
                handleSendMessage(inputText);
            }
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(inputText);
    };

    if (!isChatbotEnabled) {
        return null;
    }

    return (
        <>
            <style>{`
                /* ─── Spring Pop Bubble Animations (ala HanX Chat) ─── */
                @keyframes cb-pop-me {
                    0% {
                        opacity: 0;
                        transform: translateY(14px) scale(0.6);
                    }
                    70% {
                        opacity: 1;
                        transform: translateY(-2px) scale(1.02);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                @keyframes cb-pop-bot {
                    0% {
                        opacity: 0;
                        transform: translateY(14px) scale(0.6);
                    }
                    70% {
                        opacity: 1;
                        transform: translateY(-2px) scale(1.02);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .cb-pop-me {
                    animation: cb-pop-me 0.42s cubic-bezier(0.34, 1.5, 0.5, 1) both;
                    transform-origin: 100% 100%;
                }
                .cb-pop-bot {
                    animation: cb-pop-bot 0.42s cubic-bezier(0.34, 1.5, 0.5, 1) both;
                    transform-origin: 0% 100%;
                }

                /* ─── Typing Waves ─── */
                @keyframes cb-wave {
                    0%, 60%, 100% {
                        transform: translateY(0);
                        opacity: 0.35;
                    }
                    30% {
                        transform: translateY(-4px);
                        opacity: 1;
                    }
                }
                .cb-wave-dot {
                    display: inline-block;
                    width: 6.5px;
                    height: 6.5px;
                    border-radius: 9999px;
                    background-color: #0a6c32;
                    animation: cb-wave 1.3s infinite ease-in-out;
                }
                .cb-wave-dot:nth-child(2) { animation-delay: 0.16s; }
                .cb-wave-dot:nth-child(3) { animation-delay: 0.32s; }

                /* ─── Send Button Transition ─── */
                .cb-send-btn {
                    transform: scale(0);
                    opacity: 0;
                    pointer-events: none;
                    transition: transform 0.32s cubic-bezier(0.34, 1.56, 0.5, 1), opacity 0.2s ease, background-color 0.2s;
                }
                .cb-send-btn.cb-send-on {
                    transform: scale(1);
                    opacity: 1;
                    pointer-events: auto;
                }
                .cb-send-btn:active {
                    transform: scale(0.88);
                }

                /* ─── Custom scrollbar ─── */
                .cb-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .cb-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .cb-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(10, 108, 50, 0.14);
                    border-radius: 99px;
                }
                .cb-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(10, 108, 50, 0.28);
                }

                /* ─── Ripple Ring ─── */
                @keyframes cb-ripple {
                    0% {
                        transform: scale(0.95);
                        opacity: 0.7;
                    }
                    50% {
                        opacity: 0.35;
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
                    background-color: rgba(10, 108, 50, 0.22);
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

            <div className="font-sans antialiased">
                {/* ═══ Launcher Bubble (Bottom Right) ═══ */}
                <div
                    className={`fixed right-5 sm:right-6 bottom-5 sm:bottom-6 z-50 flex h-[60px] w-[60px] items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        launcherVisible && !isOpen && !isMinimized
                            ? 'scale-100 opacity-100 pointer-events-auto'
                            : 'scale-0 opacity-0 pointer-events-none'
                    }`}
                >
                    <div className="cb-ripple-ring" />
                    <div className="cb-ripple-ring" />
                    <div className="cb-ripple-ring" />

                    <button
                        onClick={handleOpen}
                        className="group relative flex h-[60px] w-[60px] cursor-pointer items-center justify-center rounded-full bg-gradient-to-tr from-[#0a6c32] to-[#0e8540] text-white shadow-[0_8px_25px_rgba(10,108,50,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_32px_rgba(10,108,50,0.45)] active:scale-95"
                        aria-label="Buka Asisten Virtual BKA UMRI"
                    >
                        {/* Tooltip */}
                        <span className="pointer-events-none absolute -top-12 right-0 hidden rounded-xl bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-xl backdrop-blur-xs group-hover:block transition-all">
                            Tanya Asisten BKA 👋
                            <span className="absolute -bottom-1 right-5 h-2 w-2 rotate-45 bg-slate-900/90" />
                        </span>

                        <MessageSquare className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                    </button>
                </div>

                {/* ═══ Minimized Floating Pill Bar ═══ */}
                {isOpen && isMinimized && (
                    <button
                        onClick={handleRestore}
                        className="cb-pop-bot fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 flex w-[280px] cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-emerald-100/90 bg-white/95 px-4 py-3 shadow-[0_12px_36px_rgba(10,108,50,0.14)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(10,108,50,0.2)] active:scale-98"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                                <img
                                    src="/assets/chatbot.webp"
                                    alt="Chatbot BKA"
                                    className="h-7 w-7 rounded-full object-contain"
                                />
                                <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[13px] font-bold text-slate-800">Asisten BKA</span>
                                <span className="flex items-center gap-1.5 text-[10.5px] font-medium text-emerald-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Klik untuk melanjutkan
                                </span>
                            </div>
                        </div>
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClose();
                            }}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                            title="Tutup Chat"
                        >
                            <X className="h-4 w-4" />
                        </span>
                    </button>
                )}

                {/* ═══ Chat Window & Modal Area ═══ */}
                {isOpen && (
                    <>
                        {/* Fullscreen Backdrop (Strictly only when open, fullscreen, NOT minimized, and animated in) */}
                        {isFullscreen && !isMinimized && (
                            <div
                                className={`fixed inset-0 z-[65] bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ${
                                    animateIn ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                }`}
                                onClick={() => setIsFullscreen(false)}
                                aria-hidden="true"
                            />
                        )}

                        {/* Chat Window Frame */}
                        <div
                            className={`fixed z-[70] flex flex-col overflow-hidden bg-white shadow-[0_20px_60px_-15px_rgba(10,108,50,0.18),0_10px_30px_-5px_rgba(0,0,0,0.06)] border border-slate-200/70 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                                isFullscreen
                                    ? 'inset-3 sm:inset-6 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[92%] md:max-w-4xl md:h-[84vh] md:max-h-[820px] rounded-3xl'
                                    : 'right-4 sm:right-6 bottom-4 sm:bottom-6 w-[calc(100vw-32px)] sm:w-[410px] h-[580px] max-h-[calc(100dvh-36px)] rounded-3xl max-sm:right-0 max-sm:bottom-0 max-sm:w-full max-sm:h-full max-sm:rounded-none max-sm:inset-0'
                            } ${
                                isMinimized || !animateIn
                                    ? 'pointer-events-none translate-y-10 scale-95 opacity-0'
                                    : 'translate-y-0 scale-100 opacity-100 pointer-events-auto'
                            }`}
                        >
                            {/* ─── Header (Glassmorphic BKA UMRI style) ─── */}
                            <div className="flex items-center justify-between border-b border-slate-100 bg-white/90 px-4.5 py-3.5 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-50 to-slate-50 border border-emerald-100/60 shadow-xs">
                                        <img
                                            src="/assets/chatbot.webp"
                                            alt="Chatbot BKA"
                                            className="h-7 w-7 rounded-full object-contain"
                                        />
                                        <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[14px] font-bold text-slate-800">
                                                Asisten BKA
                                            </span>
                                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-[#0a6c32]">
                                                <Sparkles className="h-2.5 w-2.5 text-[#c8a000]" />
                                                AI
                                            </span>
                                        </div>
                                        <span className="text-[11px] font-medium text-slate-400">
                                            Biro Keuangan & Aset UMRI
                                        </span>
                                    </div>
                                </div>

                                {/* ─── Window Controls (3 Top Buttons + Mute + Reset) ─── */}
                                <div className="flex items-center gap-1">
                                    {/* Sound & Haptics Toggle (Web Audio API) */}
                                    <button
                                        onClick={toggleMute}
                                        className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all active:scale-95 ${
                                            isMuted
                                                ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                                : 'text-[#0a6c32] bg-emerald-50 hover:bg-emerald-100'
                                        }`}
                                        title={isMuted ? 'Nyalakan Efek Suara & Getar' : 'Matikan Efek Suara & Getar'}
                                        aria-label={isMuted ? 'Nyalakan Efek Suara & Getar' : 'Matikan Efek Suara & Getar'}
                                        aria-pressed={!isMuted}
                                    >
                                        {isMuted ? (
                                            <VolumeX className="h-3.5 w-3.5" />
                                        ) : (
                                            <Volume2 className="h-3.5 w-3.5" />
                                        )}
                                    </button>

                                    {/* Reset Chat */}
                                    <button
                                        onClick={handleNewSession}
                                        disabled={isGenerating}
                                        className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-100 hover:text-[#0a6c32] active:scale-95 ${
                                            isGenerating ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
                                        }`}
                                        title="Mulai Percakapan Baru"
                                        aria-label="Mulai Percakapan Baru"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                    </button>

                                    {/* Minimize Button */}
                                    <button
                                        onClick={handleMinimize}
                                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 active:scale-95"
                                        title="Kecilkan Obrolan"
                                        aria-label="Kecilkan Obrolan"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>

                                    {/* Fullscreen Toggle (Hidden on mobile phones) */}
                                    <button
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                        className="hidden sm:flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 active:scale-95"
                                        title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                                        aria-label={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                                    >
                                        {isFullscreen ? (
                                            <Minimize2 className="h-3.5 w-3.5" />
                                        ) : (
                                            <Maximize2 className="h-3.5 w-3.5" />
                                        )}
                                    </button>

                                    {/* Close Button */}
                                    <button
                                        onClick={handleClose}
                                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 active:scale-95"
                                        title="Tutup Obrolan"
                                        aria-label="Tutup Obrolan"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* ─── Messages Scroll Area ─── */}
                            <div
                                ref={messagesContainerRef}
                                onScroll={handleScroll}
                                className="cb-scrollbar relative flex-1 space-y-3.5 overflow-y-auto bg-slate-50/60 p-4 sm:p-5"
                            >
                                {/* Subtle Timestamp Stamp */}
                                <div className="flex justify-center my-1">
                                    <span className="rounded-full bg-slate-200/60 px-2.5 py-0.5 text-[10.5px] font-medium text-slate-500">
                                        Hari ini
                                    </span>
                                </div>

                                {messages.map((msg, index) => {
                                    const isUser = msg.sender === 'user';
                                    const isLast = index === messages.length - 1;

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`relative max-w-[85%] sm:max-w-[78%] px-4 py-3 text-[13.5px] leading-relaxed transition-all ${
                                                    isUser
                                                        ? 'cb-pop-me bg-gradient-to-br from-[#0a6c32] to-[#0e8540] text-white rounded-2xl rounded-tr-[4px] sm:rounded-[22px] sm:rounded-tr-[5px] shadow-[0_3px_14px_rgba(10,108,50,0.22)]'
                                                        : 'cb-pop-bot bg-white text-slate-800 border border-slate-200/80 rounded-2xl rounded-tl-[4px] sm:rounded-[22px] sm:rounded-tl-[5px] shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
                                                }`}
                                            >
                                                {!isUser ? (
                                                    <div className="space-y-1 relative">
                                                        {msg.id === activeMsgIdRef.current &&
                                                        isGenerating &&
                                                        msg.text === '' ? (
                                                            /* ─── Dynamic Agent Activity State ─── */
                                                            <div className="flex flex-col gap-2.5 py-1 min-w-[220px]">
                                                                {completedSteps.length > 0 && (
                                                                    <div className="flex flex-col gap-1 border-b border-slate-100 pb-2">
                                                                        {completedSteps.map((step, sIdx) => (
                                                                            <div
                                                                                key={sIdx}
                                                                                className="flex items-center gap-1.5 text-[11px] text-slate-400"
                                                                            >
                                                                                <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
                                                                                <span className="truncate">{step}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-2.5 text-[12.5px] font-semibold text-[#0a6c32]">
                                                                    <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#0a6c32] shadow-xs">
                                                                        {agentStatus.toLowerCase().includes('internet') ||
                                                                        agentStatus.toLowerCase().includes('web') ? (
                                                                            <Globe
                                                                                className="h-4 w-4 animate-spin"
                                                                                style={{ animationDuration: '3s' }}
                                                                            />
                                                                        ) : agentStatus.toLowerCase().includes('database') ||
                                                                          agentStatus.toLowerCase().includes('artikel') ||
                                                                          agentStatus.toLowerCase().includes('dokumen') ||
                                                                          agentStatus.toLowerCase().includes('struktur') ? (
                                                                            <Database className="h-4 w-4 animate-pulse" />
                                                                        ) : (
                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-1 flex-col">
                                                                        <span className="leading-snug text-slate-700">
                                                                            {agentStatus || 'Sedang berpikir & menelaah...'}
                                                                        </span>
                                                                        {elapsedSeconds > 0 && (
                                                                            <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                                                                                Memproses real-time ({elapsedSeconds}d)
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            /* ─── Markdown Formatted Bot Reply ─── */
                                                            <>
                                                                <div className="max-w-none text-slate-800">
                                                                    <ReactMarkdown
                                                                        remarkPlugins={[remarkGfm]}
                                                                        components={{
                                                                            table: ({ node, ...props }) => (
                                                                                <div className="my-2.5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                                                                                    <table
                                                                                        className="min-w-full divide-y divide-slate-200 border-collapse"
                                                                                        {...props}
                                                                                    />
                                                                                </div>
                                                                            ),
                                                                            thead: ({ node, ...props }) => (
                                                                                <thead
                                                                                    className="bg-slate-50/80 font-bold text-slate-700"
                                                                                    {...props}
                                                                                />
                                                                            ),
                                                                            tbody: ({ node, ...props }) => (
                                                                                <tbody
                                                                                    className="divide-y divide-slate-100 bg-white"
                                                                                    {...props}
                                                                                />
                                                                            ),
                                                                            tr: ({ node, ...props }) => (
                                                                                <tr
                                                                                    className="hover:bg-slate-50/50 transition-colors"
                                                                                    {...props}
                                                                                />
                                                                            ),
                                                                            th: ({ node, ...props }) => (
                                                                                <th
                                                                                    className="px-3 py-2 text-left text-xs font-semibold text-slate-700 border-r border-slate-200 last:border-r-0"
                                                                                    {...props}
                                                                                />
                                                                            ),
                                                                            td: ({ node, ...props }) => (
                                                                                <td
                                                                                    className="px-3 py-2 text-[12.5px] text-slate-600 border-r border-slate-200 last:border-r-0"
                                                                                    {...props}
                                                                                />
                                                                            ),
                                                                            ul: ({ node, ...props }) => (
                                                                                <ul
                                                                                    className="my-2 list-disc pl-5 space-y-1 text-slate-700"
                                                                                    {...props}
                                                                                />
                                                                            ),
                                                                            ol: ({ node, ...props }) => (
                                                                                <ol
                                                                                    className="my-2 list-decimal pl-5 space-y-1 text-slate-700"
                                                                                    {...props}
                                                                                />
                                                                            ),
                                                                            li: ({ node, ...props }) => (
                                                                                <li
                                                                                    className="text-[13.5px] leading-relaxed"
                                                                                    {...props}
                                                                                />
                                                                            ),
                                                                            p: ({ node, ...props }) => (
                                                                                <p
                                                                                    className="my-1.5 text-[13.5px] leading-relaxed text-slate-700"
                                                                                    {...props}
                                                                                />
                                                                            ),
                                                                            pre: ({ node, ...props }) => (
                                                                                <div className="my-2 overflow-x-auto rounded-xl bg-slate-900 p-3 shadow-inner">
                                                                                    <pre
                                                                                        className="text-xs text-slate-100 font-mono"
                                                                                        {...props}
                                                                                    />
                                                                                </div>
                                                                            ),
                                                                            code: ({ node, inline, ...props }) =>
                                                                                inline ? (
                                                                                    <code
                                                                                        className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-[#0a6c32] font-semibold font-mono"
                                                                                        {...props}
                                                                                    />
                                                                                ) : (
                                                                                    <code
                                                                                        className="text-xs font-mono"
                                                                                        {...props}
                                                                                    />
                                                                                ),
                                                                            a: ({ node, ...props }) => (
                                                                                <a
                                                                                    className="text-[#0a6c32] font-semibold underline hover:text-[#048d46] transition-colors"
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    {...props}
                                                                                />
                                                                            ),
                                                                        }}
                                                                    >
                                                                        {msg.text}
                                                                    </ReactMarkdown>
                                                                </div>
                                                                {msg.id === activeMsgIdRef.current && isGenerating && (
                                                                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-600 animate-pulse align-middle" />
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="whitespace-pre-line text-white font-normal">
                                                        {msg.text}
                                                    </div>
                                                )}

                                                {/* Timestamp */}
                                                <span
                                                    className={`mt-1.5 block text-right text-[9.5px] font-medium tracking-tight ${
                                                        isUser ? 'text-white/70' : 'text-slate-400'
                                                    }`}
                                                >
                                                    {msg.timestamp.toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Typing wave while preparing stream */}
                                {isTyping && (
                                    <div className="cb-pop-bot flex justify-start">
                                        <div className="flex items-center gap-2 rounded-2xl rounded-tl-[4px] bg-white border border-slate-200/80 px-4 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                                            <div className="flex items-center gap-1.5">
                                                <span className="cb-wave-dot" />
                                                <span className="cb-wave-dot" />
                                                <span className="cb-wave-dot" />
                                            </div>
                                            <span className="text-[12px] font-medium text-slate-500 ml-1">
                                                {agentStatus || 'Menghubungkan ke Asisten BKA...'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />

                                {/* Scroll-to-bottom button */}
                                {showScrollBtn && (
                                    <button
                                        onClick={() => scrollToBottom(true)}
                                        className="sticky bottom-2 left-1/2 mx-auto flex h-8 w-8 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-500 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-[#0a6c32] hover:scale-105 active:scale-95"
                                        aria-label="Gulir ke bawah"
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* ─── FAQ Suggestions ─── */}
                            {showSuggestions && faqs.length > 0 && (
                                <div className="border-t border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-sm">
                                    <span className="mb-2 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                        Pertanyaan Populer
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {faqs.map((faq) => (
                                            <button
                                                key={faq.id}
                                                onClick={() => handleSendMessage(faq.question)}
                                                disabled={isGenerating}
                                                className={`flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50/70 hover:bg-emerald-50/60 hover:border-emerald-200 hover:text-[#0a6c32] px-3.5 py-1.5 text-[11.5px] font-medium text-slate-650 transition-all ${
                                                    isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                <HelpCircle className="h-3 w-3 shrink-0 text-slate-400" />
                                                <span>{faq.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ─── Input Composer (ala HanX Chat) ─── */}
                            <form
                                onSubmit={handleFormSubmit}
                                className="flex items-end gap-2 border-t border-slate-100 bg-white p-3 max-sm:pb-6"
                            >
                                <div className="relative flex-1 flex items-end rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 transition-all focus-within:border-[#0a6c32] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(10,108,50,0.1)]">
                                    <textarea
                                        ref={chatTextareaRef}
                                        rows={1}
                                        value={inputText}
                                        onChange={handleTextareaChange}
                                        onKeyDown={handleKeyDown}
                                        disabled={isGenerating}
                                        placeholder={
                                            isGenerating
                                                ? agentStatus || 'Asisten sedang memproses...'
                                                : 'Ketik pesan Anda di sini...'
                                        }
                                        className="w-full resize-none border-0 bg-transparent text-[13.5px] leading-snug text-slate-800 placeholder-slate-400 outline-none max-h-[120px] py-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!inputText.trim() || isGenerating}
                                    className={`cb-send-btn flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0a6c32] to-[#0e8540] text-white shadow-[0_4px_12px_rgba(10,108,50,0.28)] hover:shadow-[0_6px_16px_rgba(10,108,50,0.38)] ${
                                        inputText.trim() && !isGenerating ? 'cb-send-on' : ''
                                    }`}
                                    aria-label="Kirim Pesan"
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
