import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    Bot,
    MessageSquare,
    Clock,
    ShieldAlert,
    Database,
    Trash2,
    Calendar,
    ArrowRight,
    Search,
    RefreshCw,
    AlertTriangle,
    Eye,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface StatsData {
    totalConversations: number;
    todayConversations: number;
    totalMessages: number;
    todayMessages: number;
    avgLatencyMs: number;
    totalFallback: number;
    totalBlocked: number;
    totalTokens: number;
    trend: Array<{
        date: string;
        count: number;
        label: string;
    }>;
}

interface ConversationItem {
    id: number;
    session_id: string;
    ip_address: string;
    user_agent: string;
    messages_count: number;
    duration_seconds: number;
    last_activity_at: string;
}

interface PaginatedConversations {
    data: ConversationItem[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    total: number;
}

export default function ChatbotMonitoringPage({
    stats: initialStats,
    conversations: initialConversations,
}: {
    stats: StatsData;
    conversations: PaginatedConversations;
}) {
    const [stats, setStats] = useState<StatsData>(initialStats);
    const [conversations, setConversations] = useState<PaginatedConversations>(initialConversations);
    const [search, setSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);

    // Sync props
    useEffect(() => {
        setStats(initialStats);
        setConversations(initialConversations);
    }, [initialStats, initialConversations]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            router.reload({
                only: ['stats', 'conversations'],
                onSuccess: () => {
                    toast.success('Statistik berhasil diperbarui.');
                    setIsRefreshing(false);
                },
                onError: () => {
                    toast.error('Gagal memperbarui data.');
                    setIsRefreshing(false);
                },
            });
        } catch (error) {
            setIsRefreshing(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        router.get(
            '/admin/chatbot/monitoring',
            { search },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['conversations'],
                onFinish: () => setIsSearching(false),
            }
        );
    };

    const handleClearLogs = () => {
        if (confirm('PERINGATAN: Apakah Anda yakin ingin menghapus semua riwayat percakapan chatbot? Tindakan ini permanen dan tidak dapat dibatalkan.')) {
            router.delete('/admin/chatbot/monitoring/conversations', {
                onSuccess: () => {
                    toast.success('Semua riwayat percakapan chatbot berhasil dihapus.');
                },
            });
        }
    };

    // Format duration helper
    const formatDuration = (sec: number) => {
        if (sec < 60) return `${sec} dtk`;
        const min = Math.floor(sec / 60);
        const rem = sec % 60;
        return `${min} m ${rem} d`;
    };

    // Format date helper
    const formatDate = (isoString: string) => {
        const d = new Date(isoString);
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Head title="Monitoring Chatbot AI - Admin BKA" />

            <div className="flex flex-col gap-6 mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-2 border-b border-neutral-100 pb-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
                            <Activity className="text-[#0a6c32]" size={28} />
                            Monitoring & Analytics Chatbot
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500">
                            Lihat performa asisten virtual secara real-time, volume pesan, token terpakai, dan transkrip percakapan.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold text-neutral-700 shadow-3xs transition-all hover:bg-neutral-50 disabled:bg-neutral-100"
                        >
                            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-neutral-400' : 'text-neutral-500'} />
                            <span>Refresh Data</span>
                        </button>

                        <button
                            onClick={handleClearLogs}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 shadow-3xs transition-all hover:bg-red-100"
                        >
                            <Trash2 size={14} />
                            <span>Hapus Semua Chat Log</span>
                        </button>
                    </div>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="flex border-b border-neutral-200">
                    <Link
                        href="/admin/chatbot"
                        className="border-b-2 border-transparent px-4 py-2 text-sm font-semibold text-neutral-500 hover:text-[#0a6c32] transition-all"
                    >
                        Pengaturan Model
                    </Link>
                    <Link
                        href="/admin/chatbot/faqs"
                        className="border-b-2 border-transparent px-4 py-2 text-sm font-semibold text-neutral-500 hover:text-[#0a6c32] transition-all"
                    >
                        Daftar Tanya-Jawab (FAQ)
                    </Link>
                    <Link
                        href="/admin/chatbot/monitoring"
                        className="border-b-2 border-[#0a6c32] px-4 py-2 text-sm font-bold text-[#0a6c32] transition-all"
                    >
                        Monitoring & Logs
                    </Link>
                </div>

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Conversations */}
                    <div className="group rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-bold tracking-wider text-neutral-400 uppercase">Sesi Percakapan</p>
                                <p className="text-3xl font-extrabold tracking-tight text-neutral-800">{stats.totalConversations}</p>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <Bot className="size-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs text-neutral-500">
                            <span>Hari ini: <strong className="font-semibold text-neutral-700">{stats.todayConversations} sesi</strong></span>
                            <span className="text-emerald-600 font-semibold">Aktif</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="group rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-bold tracking-wider text-neutral-400 uppercase">Total Pesan</p>
                                <p className="text-3xl font-extrabold tracking-tight text-neutral-800">{stats.totalMessages}</p>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <MessageSquare className="size-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs text-neutral-500">
                            <span>Hari ini: <strong className="font-semibold text-neutral-700">{stats.todayMessages} pesan</strong></span>
                            <span className="text-neutral-400">User + Assistant</span>
                        </div>
                    </div>

                    {/* Avg Latency */}
                    <div className="group rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-bold tracking-wider text-neutral-400 uppercase">Avg Response Time</p>
                                <p className="text-3xl font-extrabold tracking-tight text-neutral-800">{stats.avgLatencyMs < 1000 ? `${stats.avgLatencyMs}ms` : `${(stats.avgLatencyMs / 1000).toFixed(2)}s`}</p>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                                <Clock className="size-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs text-neutral-500">
                            <span>Latency server LLM</span>
                            <span className={`font-semibold ${stats.avgLatencyMs > 4000 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {stats.avgLatencyMs > 4000 ? 'Cukup Lambat' : 'Responsif'}
                            </span>
                        </div>
                    </div>

                    {/* Security Blocks & Fallback */}
                    <div className="group rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-bold tracking-wider text-neutral-400 uppercase">Fallback & Blok</p>
                                <p className="text-3xl font-extrabold tracking-tight text-neutral-800">
                                    {stats.totalFallback} <span className="text-sm font-semibold text-neutral-400">/</span> {stats.totalBlocked}
                                </p>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                <ShieldAlert className="size-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs text-neutral-500">
                            <span>Kiri: Fallback model | Kanan: Blok Guardrail</span>
                            <span className="text-neutral-400">Sistem Proteksi</span>
                        </div>
                    </div>
                </div>

                {/* Visitor Chart & Token info */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Bar Chart */}
                    <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] lg:col-span-2">
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-neutral-700">Grafik Volume Pesan (7 Hari Terakhir)</h3>
                                <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">Aktivitas Chat</span>
                            </div>

                            {/* Chart */}
                            <div className="relative mt-8 h-64 w-full">
                                {(() => {
                                    const trendData = stats.trend || [];
                                    const maxVal = Math.max(...trendData.map((d) => d.count), 10);

                                    const width = 500;
                                    const height = 220;
                                    const paddingLeft = 45;
                                    const paddingRight = 35;
                                    const paddingTop = 30;
                                    const paddingBottom = 30;

                                    const plotWidth = width - paddingLeft - paddingRight;
                                    const plotHeight = height - paddingTop - paddingBottom;

                                    const points = trendData.map((item, index) => {
                                        const x = paddingLeft + index * (plotWidth / 6);
                                        const y = (height - paddingBottom) - (item.count / maxVal) * plotHeight;
                                        return { x, y, item, index };
                                    });

                                    // Construct SVG path for line
                                    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                                    // Construct SVG path for filled area underneath
                                    const areaPath = points.length > 0
                                        ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
                                        : '';

                                    return (
                                        <div className="relative w-full h-full">
                                            {/* Tooltips */}
                                            {points.map((p, idx) => {
                                                if (hoveredBar !== idx) return null;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="pointer-events-none absolute z-30 mb-2 flex flex-col items-center transition-all duration-200"
                                                        style={{
                                                            left: `${(p.x / width) * 100}%`,
                                                            bottom: `${((height - p.y) / height) * 100}%`,
                                                            transform: 'translate(-50%, -12px)',
                                                        }}
                                                    >
                                                        <div className="rounded-lg bg-neutral-800 px-2.5 py-1.5 text-center text-[10px] font-bold text-white shadow-lg whitespace-nowrap">
                                                            <p className="font-semibold text-emerald-300">{p.item.count} Pesan</p>
                                                            <p className="text-[8px] font-light text-neutral-300">{p.item.label}</p>
                                                        </div>
                                                        <div className="-mt-1 h-2 w-2 rotate-45 bg-neutral-800" />
                                                    </div>
                                                );
                                            })}

                                            {/* SVG Graph */}
                                            <svg
                                                viewBox={`0 0 ${width} ${height}`}
                                                className="w-full h-full overflow-visible"
                                                preserveAspectRatio="none"
                                            >
                                                <defs>
                                                    <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#0a6c32" stopOpacity="0.25" />
                                                        <stop offset="100%" stopColor="#0a6c32" stopOpacity="0.00" />
                                                    </linearGradient>
                                                </defs>

                                                {/* Grid lines and Y labels */}
                                                {[...Array(5)].map((_, i) => {
                                                    const y = paddingTop + i * (plotHeight / 4);
                                                    const val = Math.round(maxVal - (maxVal / 4) * i);
                                                    return (
                                                        <g key={i}>
                                                            {/* Y Axis Label */}
                                                            <text
                                                                x={paddingLeft - 12}
                                                                y={y + 3}
                                                                textAnchor="end"
                                                                className="text-[9px] font-bold fill-neutral-400 select-none"
                                                            >
                                                                {val}
                                                            </text>
                                                            {/* Grid Line */}
                                                            <line
                                                                x1={paddingLeft}
                                                                y1={y}
                                                                x2={width - paddingRight}
                                                                y2={y}
                                                                stroke="#f1f5f9"
                                                                strokeWidth={1}
                                                                strokeDasharray={val === 0 ? undefined : "4 4"}
                                                            />
                                                        </g>
                                                    );
                                                })}

                                                {/* Filled Area */}
                                                {areaPath && (
                                                    <path
                                                        d={areaPath}
                                                        fill="url(#area-gradient)"
                                                        className="transition-all duration-300"
                                                    />
                                                )}

                                                {/* Stroke Line */}
                                                {linePath && (
                                                    <path
                                                        d={linePath}
                                                        fill="none"
                                                        stroke="#0a6c32"
                                                        strokeWidth="2.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="transition-all duration-300"
                                                    />
                                                )}

                                                {/* Interactive dots and hover targets */}
                                                {points.map((p, idx) => {
                                                    const isHovered = hoveredBar === idx;
                                                    return (
                                                        <g key={idx}>
                                                            {/* Larger hover target area */}
                                                            <circle
                                                                cx={p.x}
                                                                cy={p.y}
                                                                r="16"
                                                                fill="transparent"
                                                                className="cursor-pointer"
                                                                onMouseEnter={() => setHoveredBar(idx)}
                                                                onMouseLeave={() => setHoveredBar(null)}
                                                            />
                                                            {/* Inner circle dot */}
                                                            <circle
                                                                cx={p.x}
                                                                cy={p.y}
                                                                r={isHovered ? "5" : "3.5"}
                                                                fill="#ffffff"
                                                                stroke="#0a6c32"
                                                                strokeWidth={isHovered ? "2.5" : "2"}
                                                                className="pointer-events-none transition-all duration-200"
                                                            />
                                                        </g>
                                                    );
                                                })}

                                                {/* X Axis Labels */}
                                                {points.map((p, idx) => (
                                                    <text
                                                        key={idx}
                                                        x={p.x}
                                                        y={height - 8}
                                                        textAnchor="middle"
                                                        className="text-[9px] font-bold fill-neutral-500 select-none uppercase"
                                                    >
                                                        {p.item.label}
                                                    </text>
                                                ))}
                                            </svg>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Token & System health side info */}
                    <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                        <div>
                            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-700">
                                <Database size={16} className="text-emerald-600" />
                                Konsumsi API & Token
                            </h3>
                            <p className="text-xs text-neutral-500 font-light leading-relaxed">
                                Statistik penggunaan token model AI. Total estimasi biaya dan volume transfer token yang terpakai selama melayani pertanyaan pengguna.
                            </p>

                            <div className="mt-6 space-y-4">
                                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                                    <span className="text-xs font-semibold text-neutral-600">Total Transfer Token</span>
                                    <span className="text-sm font-bold text-neutral-800">{stats.totalTokens.toLocaleString('id-ID')} token</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                                    <span className="text-xs font-semibold text-neutral-600">Estimasi Kata Terjawab</span>
                                    <span className="text-sm font-bold text-neutral-800">{Math.round(stats.totalTokens * 0.75).toLocaleString('id-ID')} kata</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                                    <span className="text-xs font-semibold text-neutral-600">Sistem Keamanan</span>
                                    <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">Aktif</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-xl bg-neutral-50 p-3.5 text-xs text-neutral-500 border border-neutral-150 flex items-start gap-2">
                            <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                            <span>
                                Jika tingkat kegagalan (fallback) meningkat mendadak, silakan periksa kuota token API key utama di panel penyedia.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Conversation Logs Table */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div>
                            <h3 className="text-base font-bold text-neutral-900">Log Percakapan Terkini</h3>
                            <p className="text-xs text-neutral-500">Daftar sesi obrolan yang terekam sistem bersama alamat IP dan rincian interaksi.</p>
                        </div>

                        {/* Search form */}
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Cari IP Address / Session ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 px-4 py-2 pr-9 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                />
                                <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                            </div>
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="rounded-xl bg-[#0a6c32] hover:bg-[#085627] text-white px-3.5 py-2.5 text-xs font-bold transition-all disabled:bg-neutral-300"
                            >
                                Cari
                            </button>
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-100 text-[11px] font-bold text-neutral-450 uppercase tracking-wider">
                                    <th className="py-3 px-4">Session ID</th>
                                    <th className="py-3 px-4">IP Address</th>
                                    <th className="py-3 px-4">Browser / User Agent</th>
                                    <th className="py-3 px-4 text-center">Jumlah Pesan</th>
                                    <th className="py-3 px-4 text-center">Durasi Obrolan</th>
                                    <th className="py-3 px-4">Aktivitas Terakhir</th>
                                    <th className="py-3 px-4 text-right">Rincian</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 text-xs font-medium text-neutral-700">
                                {conversations.data.length > 0 ? (
                                    conversations.data.map((convo) => (
                                        <tr key={convo.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="py-3.5 px-4 font-mono text-[10px] text-[#0a6c32] max-w-[130px] truncate" title={convo.session_id}>
                                                {convo.session_id}
                                            </td>
                                            <td className="py-3.5 px-4">{convo.ip_address}</td>
                                            <td className="py-3.5 px-4 max-w-[180px] truncate text-neutral-500" title={convo.user_agent}>
                                                {convo.user_agent}
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-bold text-neutral-800">
                                                {convo.messages_count}
                                            </td>
                                            <td className="py-3.5 px-4 text-center text-neutral-500">
                                                {formatDuration(convo.duration_seconds)}
                                            </td>
                                            <td className="py-3.5 px-4 text-neutral-550">{formatDate(convo.last_activity_at)}</td>
                                            <td className="py-3.5 px-4 text-right">
                                                <Link
                                                    href={`/admin/chatbot/monitoring/conversations/${convo.id}`}
                                                    className="inline-flex items-center gap-1 hover:text-[#0a6c32] text-neutral-400 font-bold transition-all"
                                                >
                                                    <Eye size={14} />
                                                    <span>Buka</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-neutral-400">
                                            Tidak ada riwayat percakapan yang terekam.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {conversations.last_page > 1 && (
                        <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
                            <span className="text-xs text-neutral-500 font-light">
                                Menampilkan halaman <strong className="font-semibold text-neutral-700">{conversations.current_page}</strong> dari <strong className="font-semibold text-neutral-700">{conversations.last_page}</strong> halaman.
                            </span>
                            
                            <div className="flex gap-1.5">
                                {conversations.links.map((link, index) => {
                                    // Skip first/last labels matching icons
                                    let label = link.label;
                                    if (label.includes('Previous')) label = 'Sebelumnya';
                                    if (label.includes('Next')) label = 'Berikutnya';

                                    return link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${
                                                link.active
                                                    ? 'bg-[#0a6c32] border-[#0a6c32] text-white shadow-3xs'
                                                    : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                                            }`}
                                            preserveScroll
                                        >
                                            {label}
                                        </Link>
                                    ) : (
                                        <span
                                            key={index}
                                            className="rounded-lg border border-neutral-150 bg-neutral-50 px-3 py-1.5 text-xs font-bold text-neutral-350 cursor-not-allowed select-none"
                                        >
                                            {label}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
