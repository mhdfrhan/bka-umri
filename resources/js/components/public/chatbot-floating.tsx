import { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    X,
    Minimize2,
    Maximize2,
    Send,
    Bot,
    Sparkles,
    CornerDownLeft,
    PhoneCall,
    FileText,
    CreditCard,
    Calendar,
} from 'lucide-react';

interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: Date;
}

const FAQ_SUGGESTIONS = [
    {
        id: 'faq-kkn',
        label: 'Jadwal Pembayaran KKN 2026',
        icon: Calendar,
        question: 'Kapan jadwal pembayaran KKN 2026?',
        answer: 'Pembayaran KKN 2026 dilaksanakan mulai tanggal 09 Maret 2026 s/d 08 Juni 2026. Pembayaran dapat dilakukan melalui Virtual Account (VA) bank mitra yang terafiliasi.',
    },
    {
        id: 'faq-va',
        label: 'Cara Bayar Virtual Account (VA)',
        icon: CreditCard,
        question: 'Bagaimana cara melakukan pembayaran Virtual Account?',
        answer: 'Tata cara pembayaran via Virtual Account dapat diakses langsung pada akun SIA (Sistem Informasi Akademik) Anda di www.siam.umri.ac.id. Kami mendukung bank mitra seperti BRKSyariah, Bank Mandiri, Bank Muamalat, dan BSI.',
    },
    {
        id: 'faq-dokumen',
        label: 'Unduh Lampiran Resmi',
        icon: FileText,
        question: 'Di mana saya bisa mengunduh dokumen lampiran resmi?',
        answer: 'Seluruh lampiran resmi, surat keputusan, edaran, dan format dokumen BKA dapat Anda akses dan unduh secara bebas melalui menu "Lampiran" di website utama kami.',
    },
    {
        id: 'faq-kontak',
        label: 'Kontak Biro Keuangan & Aset',
        icon: PhoneCall,
        question: 'Bagaimana saya bisa menghubungi Biro Keuangan & Aset?',
        answer: 'Anda dapat mengunjungi kami di Gedung Rektorat Lt. 1, Jl. T. Tambusai, Pekanbaru pada jam operasional (Senin-Jumat 08.00-16.00 WIB, Sabtu 08.00-13.00 WIB). Atau hubungi via email bka@umri.ac.id / telp (0761) 35008.',
    },
];

export default function ChatbotFloating() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            sender: 'bot',
            text: 'Halo! Saya Asisten Virtual Biro Keuangan & Aset (BKA) UMRI. Ada yang bisa saya bantu hari ini?',
            timestamp: new Date(),
        },
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatInputRef = useRef<HTMLInputElement>(null);

    // Auto scroll to bottom when messages or typing status change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    // Handle initial greeting/typing focus
    useEffect(() => {
        if (isOpen && !isMinimized && chatInputRef.current) {
            chatInputRef.current.focus();
        }
    }, [isOpen, isMinimized]);

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: text,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // Find match in FAQs or use fallback
        const matchingFaq = FAQ_SUGGESTIONS.find(
            (faq) =>
                faq.question.toLowerCase().includes(text.toLowerCase()) ||
                text.toLowerCase().includes(faq.question.toLowerCase()) ||
                faq.label.toLowerCase().includes(text.toLowerCase()),
        );

        setTimeout(() => {
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: matchingFaq
                    ? matchingFaq.answer
                    : `Terima kasih atas pertanyaan Anda. Untuk informasi lebih lanjut mengenai "${text}", kami menyarankan Anda untuk langsung menghubungi staff BKA UMRI di Gedung Rektorat Lt. 1 atau mengirim email ke bka@umri.ac.id.`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
        }, 1000);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(inputText);
    };

    // Render nothing if chatbot is closed and launcher is hidden (not the case here, we show bubble)
    return (
        <div className="font-sans">
            {/* Launcher Bubble Button */}
            {!isOpen && (
                <button
                    onClick={() => {
                        setIsOpen(true);
                        setIsMinimized(false);
                    }}
                    className="group fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#0a6c32] to-[#048d46] text-white shadow-[0_8px_30px_rgba(10,108,50,0.4)] transition-all duration-300 hover:scale-105 active:scale-95"
                    aria-label="Buka Asisten BKA"
                >
                    <span className="absolute -top-12 right-0 hidden animate-in rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-md duration-200 fade-in slide-in-from-bottom-2 group-hover:block">
                        Tanya Asisten BKA 👋
                    </span>
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c8a000] opacity-75"></span>
                        <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-[#c8a000]"></span>
                    </span>
                    <MessageSquare className="h-6 w-6 transition-transform group-hover:rotate-6" />
                </button>
            )}

            {/* Minimized Tab / Bar */}
            {isOpen && isMinimized && (
                <button
                    onClick={() => setIsMinimized(false)}
                    className="fixed right-6 bottom-6 z-50 flex w-72 items-center justify-between rounded-xl border border-[#dde5dd] bg-white px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#0a6c32]/30"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0a6c32] to-[#048d46] text-white">
                            <Bot className="h-4.5 w-4.5" />
                            <span className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border border-white bg-emerald-400"></span>
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[13px] font-bold text-slate-800">
                                Asisten BKA
                            </span>
                            <span className="text-[10px] font-medium text-emerald-600">
                                Online • Perkecil
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </button>
            )}

            {/* Chatbot Window */}
            {isOpen && !isMinimized && (
                <>
                    {/* Fullscreen dark backdrop */}
                    {isFullscreen && (
                        <div
                            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
                            onClick={() => setIsFullscreen(false)}
                        />
                    )}

                    <div
                        className={`fixed z-50 flex flex-col border border-[#dde5dd] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.15)] transition-all duration-300 ease-out ${
                            isFullscreen
                                ? 'right-1/2 bottom-1/2 h-[650px] w-[90%] max-w-3xl translate-x-1/2 translate-y-1/2 rounded-2xl'
                                : 'right-6 bottom-6 h-[520px] w-96 rounded-2xl max-sm:right-0 max-sm:bottom-0 max-sm:h-full max-sm:w-full max-sm:rounded-none'
                        }`}
                        style={{
                            animation: isFullscreen
                                ? 'none'
                                : 'bka-fadeInScale 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between rounded-t-2xl border-b border-[#dde5dd] bg-gradient-to-r from-[#0a6c32] to-[#048d46] px-4 py-3 text-white max-sm:rounded-none">
                            <div className="flex items-center gap-3">
                                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white shadow-inner">
                                    <Bot className="h-5.5 w-5.5" />
                                    <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border border-white bg-emerald-400"></span>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[14px] font-bold tracking-wide">
                                            Asisten BKA
                                        </span>
                                        <Sparkles className="h-3 w-3 text-[#c8a000]" />
                                    </div>
                                    <span className="text-[10px] font-medium text-white/80">
                                        Biro Keuangan & Aset UMRI
                                    </span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsMinimized(true)}
                                    className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                                    title="Perkecil"
                                >
                                    <Minimize2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() =>
                                        setIsFullscreen(!isFullscreen)
                                    }
                                    className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white max-sm:hidden"
                                    title={
                                        isFullscreen
                                            ? 'Keluar Layar Penuh'
                                            : 'Layar Penuh'
                                    }
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                                    title="Tutup"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`relative max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] shadow-xs transition-all duration-300 ${
                                            msg.sender === 'user'
                                                ? 'rounded-tr-none bg-[#0a6c32] text-white'
                                                : 'rounded-tl-none border border-slate-100 bg-white text-slate-800'
                                        }`}
                                    >
                                        <p className="leading-relaxed whitespace-pre-line">
                                            {msg.text}
                                        </p>
                                        <span
                                            className={`mt-1 block text-right text-[9px] font-medium ${
                                                msg.sender === 'user'
                                                    ? 'text-white/60'
                                                    : 'text-slate-400'
                                            }`}
                                        >
                                            {msg.timestamp.toLocaleTimeString(
                                                [],
                                                {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                },
                                            )}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none border border-slate-100 bg-white px-4 py-3 shadow-xs">
                                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#0a6c32] [animation-delay:-0.3s]"></div>
                                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#0a6c32] [animation-delay:-0.15s]"></div>
                                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#0a6c32]"></div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Bottom Suggestions Panel */}
                        <div className="border-t border-[#dde5dd] bg-white px-4 py-2">
                            <span className="mb-1.5 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                Pertanyaan Populer:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {FAQ_SUGGESTIONS.map((faq) => {
                                    const IconComponent = faq.icon;
                                    return (
                                        <button
                                            key={faq.id}
                                            onClick={() =>
                                                handleSendMessage(faq.question)
                                            }
                                            className="flex items-center gap-1.5 rounded-lg border border-[#dde5dd] bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors hover:border-[#0a6c32]/40 hover:bg-[#e6f4ea]/40 hover:text-[#0a6c32]"
                                        >
                                            <IconComponent className="h-3 w-3 shrink-0" />
                                            <span>{faq.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Input Area */}
                        <form
                            onSubmit={handleFormSubmit}
                            className="flex items-center gap-2 border-t border-[#dde5dd] bg-white p-3 max-sm:pb-6"
                        >
                            <input
                                ref={chatInputRef}
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Ketik pertanyaan Anda di sini..."
                                className="flex-1 rounded-xl border border-[#dde5dd] bg-slate-50 px-4 py-2.5 text-[13px] text-slate-800 placeholder-slate-400 transition-colors focus:border-[#0a6c32] focus:bg-white focus:ring-1 focus:ring-[#0a6c32] focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-all ${
                                    inputText.trim()
                                        ? 'cursor-pointer bg-gradient-to-r from-[#0a6c32] to-[#048d46] hover:scale-103 active:scale-97'
                                        : 'cursor-not-allowed bg-slate-200 text-slate-400'
                                }`}
                            >
                                <Send className="h-4.5 w-4.5" />
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
