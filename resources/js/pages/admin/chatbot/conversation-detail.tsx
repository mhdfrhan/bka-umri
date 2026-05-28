import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Bot,
    User,
    Calendar,
    Clock,
    Activity,
    Info,
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    Database,
} from 'lucide-react';
import { toast } from 'sonner';

interface MessageItem {
    id: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    token_count: number | null;
    model_used: string | null;
    response_time_ms: number | null;
    was_fallback: boolean;
    was_blocked: boolean;
    created_at: string;
}

interface ConversationData {
    id: number;
    session_id: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    last_activity_at: string;
    duration_seconds: number;
    messages_count: number;
}

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
                <strong key={`bold-${baseKey}-${count}`} className="font-extrabold text-neutral-900">
                    {parseInlineMarkdown(boldText, `${baseKey}-b-${count}`)}
                </strong>
            );
        } else if (italicFull) {
            parts.push(
                <em key={`italic-${baseKey}-${count}`} className="italic text-neutral-750 font-medium">
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
                    className="font-semibold text-emerald-750 hover:text-emerald-900 underline inline-flex items-center gap-0.5 mx-0.5"
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
const renderMessageText = (text: string) => {
    if (!text) return null;

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

                if (block.type === 'ul' && block.items) {
                    return (
                        <ul key={key} className="list-disc pl-5 my-2 space-y-1 text-neutral-800">
                            {block.items.map((item, itemIdx) => (
                                <li 
                                    key={`li-${key}-${itemIdx}`} 
                                    className="marker:text-emerald-600"
                                    style={{
                                        marginLeft: item.indent > 0 ? `${item.indent * 8}px` : undefined,
                                        listStyleType: item.indent > 0 ? 'circle' : 'disc'
                                    }}
                                >
                                    {parseInlineMarkdown(item.text, `${key}-${itemIdx}`)}
                                </li>
                            ))}
                        </ul>
                    );
                }

                if (block.type === 'ol' && block.items) {
                    return (
                        <ol key={key} className="list-decimal pl-5 my-2 space-y-1 text-neutral-800">
                            {block.items.map((item, itemIdx) => (
                                <li 
                                    key={`li-${key}-${itemIdx}`} 
                                    className="marker:text-emerald-600"
                                    style={{
                                        marginLeft: item.indent > 0 ? `${item.indent * 8}px` : undefined
                                    }}
                                >
                                    {parseInlineMarkdown(item.text, `${key}-${itemIdx}`)}
                                </li>
                            ))}
                        </ol>
                    );
                }

                // Paragraph block
                const isParagraphEmpty = !block.text || block.text.trim() === '';
                if (isParagraphEmpty) {
                    return <div key={key} className="h-2" />;
                }

                return (
                    <p key={key} className="my-1.5 first:mt-0 last:mb-0 leading-relaxed text-neutral-800">
                        {parseInlineMarkdown(block.text || '', key)}
                    </p>
                );
            })}
        </>
    );
};


export default function ConversationDetailPage({
    conversation,
    messages,
}: {
    conversation: ConversationData;
    messages: MessageItem[];
}) {
    // Format duration helper
    const formatDuration = (sec: number) => {
        if (sec < 60) return `${sec} detik`;
        const min = Math.floor(sec / 60);
        const rem = sec % 60;
        return `${min} menit ${rem} detik`;
    };

    // Format date helper
    const formatDate = (isoString: string) => {
        const d = new Date(isoString);
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatMessageTime = (isoString: string) => {
        const d = new Date(isoString);
        return d.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Head title={`Sesi Chat ${conversation.session_id.substring(0, 8)} - Admin BKA`} />

            <div className="flex flex-col gap-6 mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Back link & Header */}
                <div className="flex flex-col gap-3 border-b border-neutral-100 pb-5">
                    <Link
                        href="/admin/chatbot/monitoring"
                        className="inline-flex max-w-fit items-center gap-1 text-xs font-bold text-neutral-500 hover:text-[#0a6c32] transition-colors"
                    >
                        <ArrowLeft size={14} />
                        <span>Kembali ke Monitoring</span>
                    </Link>

                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900">
                                Transkrip Detail Percakapan
                            </h1>
                            <p className="mt-1 text-sm text-neutral-500 font-mono text-[11px]">
                                Session ID: {conversation.session_id}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Session Meta Info Grid */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-3xs md:col-span-2">
                        <h3 className="text-xs font-bold text-neutral-450 uppercase tracking-wider mb-3">Informasi Perangkat & Koneksi</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                            <div>
                                <span className="text-neutral-400 block mb-0.5">IP Address</span>
                                <span className="font-semibold text-neutral-800">{conversation.ip_address}</span>
                            </div>
                            <div>
                                <span className="text-neutral-400 block mb-0.5">Waktu Mulai</span>
                                <span className="font-semibold text-neutral-800">{formatDate(conversation.created_at)}</span>
                            </div>
                            <div className="sm:col-span-2">
                                <span className="text-neutral-400 block mb-0.5">User Agent (Browser)</span>
                                <span className="font-medium text-neutral-600 block break-all leading-normal bg-neutral-50 p-2 rounded-xl border border-neutral-150">
                                    {conversation.user_agent}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-3xs flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-neutral-450 uppercase tracking-wider mb-3">Statistik Sesi</h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center py-1.5 border-b border-neutral-50">
                                    <span className="text-neutral-500">Total Interaksi</span>
                                    <span className="font-bold text-neutral-800">{conversation.messages_count} pesan</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-neutral-50">
                                    <span className="text-neutral-500">Durasi Sesi</span>
                                    <span className="font-bold text-neutral-800">{formatDuration(conversation.duration_seconds)}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5">
                                    <span className="text-neutral-500">Terakhir Aktif</span>
                                    <span className="font-bold text-neutral-800">{formatMessageTime(conversation.last_activity_at)} WIB</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl bg-emerald-50/50 border border-emerald-100 p-2.5 text-[10px] text-emerald-800 font-light leading-normal flex items-start gap-1.5">
                            <CheckCircle2 size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                            <span>Sesi chat ini disimpan permanen untuk analisis kualitas respons asisten virtual.</span>
                        </div>
                    </div>
                </div>

                {/* Transkrip Obrolan Box */}
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50/40 shadow-xs flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-white border-b border-neutral-200 px-5 py-4 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-neutral-850 flex items-center gap-2">
                            <Bot size={16} className="text-[#0a6c32]" />
                            Alur Percakapan (Transcript)
                        </h3>
                        <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                            Read-Only
                        </span>
                    </div>

                    {/* Messages Area */}
                    <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto bg-slate-50/50">
                        {messages.length > 0 ? (
                            messages.map((msg) => {
                                const isUser = msg.role === 'user';
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse text-right' : 'flex-row'}`}>
                                            {/* Avatar */}
                                            <div className={`flex size-8 shrink-0 items-center justify-center rounded-xl select-none ${
                                                isUser ? 'bg-neutral-600 text-white font-bold' : ''
                                            }`}>
                                                {isUser ? (
                                                    <User size={14} />
                                                ) : (
                                                    <img 
                                                        src="/assets/chatbot.webp" 
                                                        alt="Chatbot BKA" 
                                                        className="h-8 w-8 object-contain rounded-xl" 
                                                    />
                                                )}
                                            </div>

                                            {/* Bubble */}
                                            <div className="flex flex-col gap-1">
                                                <div className={`relative px-4 py-3 text-[13px] leading-relaxed shadow-3xs transition-all ${
                                                    isUser
                                                        ? 'rounded-2xl rounded-tr-sm bg-[#0a6c32] text-white text-left'
                                                        : 'rounded-2xl rounded-tl-sm bg-white text-neutral-800'
                                                } ${msg.was_blocked ? 'border-2 border-red-200 bg-red-50/40 text-red-900' : ''}`}>
                                                    
                                                    {isUser ? (
                                                        <div className="whitespace-pre-line">
                                                            {msg.content}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            {renderMessageText(msg.content)}
                                                        </div>
                                                    )}

                                                    {/* Warnings / Block badges */}
                                                    {msg.was_blocked && (
                                                        <div className="mt-2 flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 uppercase max-w-fit select-none">
                                                            <ShieldAlert size={11} />
                                                            <span>Diblokir Guardrail</span>
                                                        </div>
                                                    )}

                                                    {msg.was_fallback && (
                                                        <div className="mt-2 flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase max-w-fit select-none">
                                                            <AlertTriangle size={11} />
                                                            <span>Menggunakan Model Fallback</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Meta details below bubbles */}
                                                <div className="flex items-center gap-2 px-1 text-[10px] text-neutral-400 font-semibold mt-0.5 justify-start">
                                                    <span>{formatMessageTime(msg.created_at)}</span>
                                                    {!isUser && msg.model_used && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="font-mono text-[9px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600">{msg.model_used}</span>
                                                        </>
                                                    )}
                                                    {!isUser && msg.response_time_ms !== null && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-neutral-500">{(msg.response_time_ms / 1000).toFixed(2)}s latency</span>
                                                        </>
                                                    )}
                                                    {!isUser && msg.token_count !== null && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-neutral-500">{msg.token_count} token</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12 text-neutral-400 text-xs font-medium">
                                Transkrip kosong. Tidak ada pesan yang terekam pada sesi ini.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
