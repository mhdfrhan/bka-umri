import { Head, router } from '@inertiajs/react';
import {
    Mail,
    MailOpen,
    Search,
    User,
    Calendar,
    Phone,
    ExternalLink,
    CheckCircle,
    Trash2,
    Copy,
    Check,
    MessageSquare,
    AlertCircle,
    Inbox,
    ArrowUpRight,
    Filter,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

import { type BreadcrumbItem } from '@/types';

interface InboxMessage {
    id: string;
    nama: string;
    email: string;
    nomor_wa: string;
    subjek: string;
    pesan: string;
    dibaca: boolean;
    tanggal: string;
}

interface StatsData {
    total: number;
    unread: number;
    read: number;
}

interface KontakMasukProps {
    messages: InboxMessage[];
    stats: StatsData;
    filters: {
        search?: string;
        filter?: 'all' | 'unread' | 'read';
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin',
    },
    {
        title: 'Kontak Masuk',
        href: '/admin/kontak-masuk',
    },
];

// Helper to normalize phone number to international WhatsApp format
export function sanitizeWhatsAppNumber(phone: string): string {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.slice(1);
    } else if (!cleaned.startsWith('62') && cleaned.length >= 9) {
        cleaned = '62' + cleaned;
    }
    return cleaned;
}

// Generate direct WhatsApp link with official BKA UMRI greeting draft
export function generateWhatsAppReplyUrl(
    phone: string,
    nama: string,
    subjek: string,
): string {
    const cleanPhone = sanitizeWhatsAppNumber(phone);
    if (!cleanPhone) return '';
    const greeting = `Halo Bapak/Ibu/Sdr/i ${nama},\n\nTerima kasih telah menghubungi Biro Keuangan & Aset (BKA) Universitas Muhammadiyah Riau melalui website kami perihal:\n"${subjek}"\n\nMenindaklanjuti pesan yang Anda kirimkan: `;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(greeting)}`;
}

export default function KontakMasukIndex({
    messages = [],
    stats = { total: 0, unread: 0, read: 0 },
    filters = { search: '', filter: 'all' },
}: KontakMasukProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'read'>(
        filters.filter || 'all',
    );
    const [activeMessage, setActiveMessage] = useState<InboxMessage | null>(null);
    const [copiedWa, setCopiedWa] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Format display date
    const formatDate = (isoString?: string) => {
        if (!isoString) return '-';
        try {
            const date = new Date(isoString);
            return new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(date);
        } catch {
            return isoString;
        }
    };

    // Filter messages on client side for instantaneous responsiveness
    const filteredMessages = useMemo(() => {
        return messages.filter((msg) => {
            const matchesFilter =
                activeFilter === 'all'
                    ? true
                    : activeFilter === 'unread'
                      ? !msg.dibaca
                      : msg.dibaca;

            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                msg.nama.toLowerCase().includes(q) ||
                msg.email.toLowerCase().includes(q) ||
                (msg.nomor_wa && msg.nomor_wa.toLowerCase().includes(q)) ||
                msg.subjek.toLowerCase().includes(q) ||
                msg.pesan.toLowerCase().includes(q);

            return matchesFilter && matchesSearch;
        });
    }, [messages, activeFilter, searchQuery]);

    // Handle Open message & auto-mark as read
    const handleOpenMessage = (msg: InboxMessage) => {
        setActiveMessage(msg);
        if (!msg.dibaca) {
            router.post(
                `/admin/kontak-masuk/${msg.id}/toggle-read`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Keep current active modal synced
                        setActiveMessage((prev) =>
                            prev && prev.id === msg.id
                                ? { ...prev, dibaca: true }
                                : prev,
                        );
                    },
                },
            );
        }
    };

    // Handle toggle read status
    const handleToggleReadStatus = (msgId: string, currentStatus: boolean) => {
        router.post(
            `/admin/kontak-masuk/${msgId}/toggle-read`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        currentStatus
                            ? 'Pesan ditandai sebagai belum dibaca'
                            : 'Pesan ditandai sebagai sudah dibaca',
                    );
                    if (activeMessage && activeMessage.id === msgId) {
                        setActiveMessage((prev) =>
                            prev ? { ...prev, dibaca: !currentStatus } : null,
                        );
                    }
                },
                onError: () => {
                    toast.error('Gagal memperbarui status pesan');
                },
            },
        );
    };

    // Handle delete message
    const handleDeleteMessage = (msgId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus pesan kontak ini? Tindakan ini tidak dapat dibatalkan.')) {
            return;
        }

        setDeletingId(msgId);
        router.delete(`/admin/kontak-masuk/${msgId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pesan kontak berhasil dihapus');
                if (activeMessage && activeMessage.id === msgId) {
                    setActiveMessage(null);
                }
            },
            onError: () => {
                toast.error('Gagal menghapus pesan');
            },
            onFinish: () => {
                setDeletingId(null);
            },
        });
    };

    // Copy WhatsApp number
    const handleCopyWhatsApp = (phone: string) => {
        if (!phone) return;
        navigator.clipboard.writeText(phone);
        setCopiedWa(true);
        toast.success(`Nomor WhatsApp ${phone} disalin ke papan klip!`);
        setTimeout(() => setCopiedWa(false), 2000);
    };

    return (
        <>
            <Head title="Kontak Masuk (Pesan Pengunjung) - Admin BKA UMRI" />

            <div className="flex flex-col gap-6 p-4 md:p-8">
                {/* Header Title & Description */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-[#0a6c32]">
                                <Inbox className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl">
                                    Kontak Masuk
                                </h1>
                                <p className="text-xs text-neutral-500">
                                    Kelola seluruh pertanyaan, saran, dan pesan yang dikirim pengunjung melalui form Hubungi Kami.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Statistics Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                            <Mail className="size-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-neutral-500 uppercase">
                                Total Pesan
                            </span>
                            <p className="text-2xl font-black text-neutral-900">
                                {stats.total}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl border border-rose-200 bg-rose-50/20 p-4 shadow-xs">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                            <AlertCircle className="size-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-rose-600 uppercase">
                                Belum Dibaca
                            </span>
                            <p className="text-2xl font-black text-rose-700">
                                {stats.unread}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 p-4 shadow-xs">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-[#0a6c32]">
                            <CheckCircle className="size-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-emerald-700 uppercase">
                                Sudah Ditindaklanjuti
                            </span>
                            <p className="text-2xl font-black text-emerald-800">
                                {stats.read}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-md">
                        <input
                            type="text"
                            placeholder="Cari nama, email, WhatsApp, subjek, isi pesan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 py-2.5 pr-4 pl-9 text-xs text-neutral-800 outline-none transition-colors focus:border-[#0a6c32] focus:bg-white focus:ring-1 focus:ring-[#0a6c32]"
                        />
                        <Search
                            size={15}
                            className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-neutral-400 hover:text-neutral-600"
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto">
                        <span className="mr-1 hidden text-[11px] font-semibold text-neutral-400 sm:inline-flex items-center gap-1">
                            <Filter size={12} /> Filter:
                        </span>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('all')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                activeFilter === 'all'
                                    ? 'bg-[#0a6c32] text-white shadow-xs'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                        >
                            Semua ({stats.total})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('unread')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                activeFilter === 'unread'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                        >
                            Belum Dibaca ({stats.unread})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('read')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                activeFilter === 'read'
                                    ? 'bg-emerald-700 text-white shadow-xs'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                        >
                            Sudah Dibaca ({stats.read})
                        </button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex flex-col gap-3">
                    {filteredMessages.length > 0 ? (
                        filteredMessages.map((msg) => {
                            const waUrl = generateWhatsAppReplyUrl(
                                msg.nomor_wa,
                                msg.nama,
                                msg.subjek,
                            );

                            return (
                                <div
                                    key={msg.id}
                                    onClick={() => handleOpenMessage(msg)}
                                    className={`group relative flex cursor-pointer flex-col gap-3 rounded-2xl border p-4.5 transition-all md:flex-row md:items-start md:justify-between ${
                                        msg.dibaca
                                            ? 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/40 shadow-xs'
                                            : 'border-emerald-300 bg-emerald-50/15 shadow-sm hover:border-emerald-400 hover:bg-emerald-50/25'
                                    }`}
                                >
                                    <div className="flex min-w-0 flex-1 items-start gap-3.5">
                                        <div
                                            className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                                                msg.dibaca
                                                    ? 'bg-neutral-100 text-neutral-500'
                                                    : 'bg-emerald-100 text-[#0a6c32] ring-2 ring-emerald-200'
                                            }`}
                                        >
                                            {msg.dibaca ? (
                                                <MailOpen size={18} />
                                            ) : (
                                                <Mail size={18} />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            {/* Top info line */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`text-sm ${
                                                        msg.dibaca
                                                            ? 'font-bold text-neutral-800'
                                                            : 'font-extrabold text-neutral-900'
                                                    }`}
                                                >
                                                    {msg.nama}
                                                </span>

                                                {!msg.dibaca && (
                                                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-black tracking-wider text-white uppercase">
                                                        Baru
                                                    </span>
                                                )}

                                                {/* WhatsApp Badge */}
                                                {msg.nomor_wa && (
                                                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-[#0a6c32]">
                                                        <MessageSquare size={11} className="text-emerald-600" />
                                                        <span>{msg.nomor_wa}</span>
                                                    </span>
                                                )}

                                                <span className="text-[11px] text-neutral-400">
                                                    • {msg.email}
                                                </span>

                                                <span className="ml-auto text-[11px] font-medium text-neutral-400">
                                                    {formatDate(msg.tanggal)}
                                                </span>
                                            </div>

                                            {/* Subject */}
                                            <h3
                                                className={`mt-1.5 text-xs md:text-sm ${
                                                    msg.dibaca
                                                        ? 'font-medium text-neutral-700'
                                                        : 'font-bold text-neutral-900'
                                                }`}
                                            >
                                                {msg.subjek}
                                            </h3>

                                            {/* Content snippet */}
                                            <p className="mt-1 line-clamp-2 text-xs text-neutral-500 leading-relaxed">
                                                {msg.pesan}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div
                                        className="mt-2 flex shrink-0 items-center justify-end gap-2 border-t border-neutral-100 pt-2 md:mt-0 md:border-t-0 md:pt-0"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Direct WhatsApp button */}
                                        {msg.nomor_wa && waUrl && (
                                            <a
                                                href={waUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#0a6c32] transition-all hover:bg-[#0a6c32] hover:text-white"
                                                title={`Balas langsung ke WhatsApp ${msg.nomor_wa}`}
                                            >
                                                <MessageSquare size={13} />
                                                <span>Balas WA</span>
                                                <ArrowUpRight size={11} />
                                            </a>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleToggleReadStatus(
                                                    msg.id,
                                                    msg.dibaca,
                                                )
                                            }
                                            className={`rounded-xl border border-neutral-200 bg-white p-2 text-xs transition-colors ${
                                                msg.dibaca
                                                    ? 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
                                                    : 'text-[#0a6c32] hover:bg-emerald-50'
                                            }`}
                                            title={
                                                msg.dibaca
                                                    ? 'Tandai belum dibaca'
                                                    : 'Tandai sudah dibaca'
                                            }
                                        >
                                            <CheckCircle size={15} />
                                        </button>

                                        <button
                                            type="button"
                                            disabled={deletingId === msg.id}
                                            onClick={() =>
                                                handleDeleteMessage(msg.id)
                                            }
                                            className="rounded-xl border border-neutral-200 bg-white p-2 text-rose-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                                            title="Hapus Pesan"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                                <Inbox className="size-7 stroke-1" />
                            </div>
                            <h3 className="mt-4 text-sm font-bold text-neutral-800">
                                Tidak Ada Pesan Masuk
                            </h3>
                            <p className="mt-1 max-w-sm text-xs text-neutral-500">
                                {searchQuery || activeFilter !== 'all'
                                    ? 'Tidak ditemukan pesan yang cocok dengan kata kunci pencarian atau filter yang dipilih.'
                                    : 'Belum ada pesan yang dikirimkan oleh pengunjung melalui formulir kontak website.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* MODAL: INBOX MESSAGE DETAIL READER */}
                {activeMessage && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs select-none"
                        onClick={() => setActiveMessage(null)}
                    >
                        <div
                            className="flex max-h-[90vh] w-full max-w-lg flex-col space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-start justify-between border-b border-neutral-100 pb-3.5">
                                <div className="min-w-0 flex-1 pr-3">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                                activeMessage.dibaca
                                                    ? 'bg-neutral-100 text-neutral-600'
                                                    : 'bg-emerald-100 text-[#0a6c32]'
                                            }`}
                                        >
                                            {activeMessage.dibaca ? (
                                                <MailOpen size={11} />
                                            ) : (
                                                <Mail size={11} />
                                            )}
                                            <span>
                                                {activeMessage.dibaca
                                                    ? 'Sudah Dibaca'
                                                    : 'Pesan Baru'}
                                            </span>
                                        </span>
                                    </div>
                                    <h2 className="mt-2 text-base font-bold text-neutral-900">
                                        {activeMessage.subjek}
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveMessage(null)}
                                    className="rounded-lg p-1 text-xs font-bold text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                                >
                                    ✕ Tutup
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 space-y-4 overflow-y-auto py-1 pr-1">
                                {/* Sender Info Block */}
                                <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-[#0a6c32]">
                                            <User size={20} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-neutral-900">
                                                {activeMessage.nama}
                                            </p>
                                            <a
                                                href={`mailto:${activeMessage.email}`}
                                                className="block truncate text-[11px] font-semibold text-[#0a6c32] hover:underline"
                                            >
                                                {activeMessage.email}
                                            </a>
                                        </div>
                                    </div>

                                    {/* WhatsApp Detail Field */}
                                    {activeMessage.nomor_wa ? (
                                        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white p-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-[#0a6c32]">
                                                    <MessageSquare size={13} />
                                                </div>
                                                <div>
                                                    <span className="block text-[9px] font-semibold text-neutral-400 uppercase">
                                                        Nomor WhatsApp
                                                    </span>
                                                    <span className="text-xs font-extrabold text-neutral-800">
                                                        {activeMessage.nomor_wa}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCopyWhatsApp(
                                                            activeMessage.nomor_wa,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] font-bold text-neutral-600 hover:bg-neutral-100"
                                                    title="Salin nomor WhatsApp"
                                                >
                                                    {copiedWa ? (
                                                        <Check size={12} className="text-emerald-600" />
                                                    ) : (
                                                        <Copy size={12} />
                                                    )}
                                                    <span>{copiedWa ? 'Tersalin' : 'Salin'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-[11px] italic text-neutral-400">
                                            Pengirim tidak mencantumkan nomor WhatsApp.
                                        </p>
                                    )}

                                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-neutral-400">
                                        <Calendar size={12} />
                                        <span>
                                            Diterima: {formatDate(activeMessage.tanggal)} WIB
                                        </span>
                                    </div>
                                </div>

                                {/* Message Content */}
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] font-extrabold tracking-wider text-neutral-400 uppercase">
                                        Isi Pesan
                                    </span>
                                    <div className="min-h-[140px] rounded-2xl border border-neutral-200 bg-white p-4 text-xs leading-relaxed text-neutral-800 whitespace-pre-wrap select-text">
                                        {activeMessage.pesan}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer Actions */}
                            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDeleteMessage(activeMessage.id)
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50"
                                >
                                    <Trash2 size={14} />
                                    <span>Hapus</span>
                                </button>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleToggleReadStatus(
                                                activeMessage.id,
                                                activeMessage.dibaca,
                                            )
                                        }
                                        className="rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-bold text-neutral-700 transition-colors hover:bg-neutral-50"
                                    >
                                        {activeMessage.dibaca
                                            ? 'Tandai Belum Dibaca'
                                            : 'Tandai Sudah Dibaca'}
                                    </button>

                                    {/* Primary WhatsApp Direct Reply Button */}
                                    {activeMessage.nomor_wa && (
                                        <a
                                            href={generateWhatsAppReplyUrl(
                                                activeMessage.nomor_wa,
                                                activeMessage.nama,
                                                activeMessage.subjek,
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#1ebc59] hover:shadow-sm"
                                        >
                                            <MessageSquare size={14} />
                                            <span>Balas via WhatsApp</span>
                                            <ExternalLink size={12} />
                                        </a>
                                    )}

                                    {/* Secondary Email Reply Button */}
                                    <a
                                        href={`mailto:${activeMessage.email}?subject=Balasan BKA UMRI: ${encodeURIComponent(activeMessage.subjek)}`}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#0a6c32] bg-white px-3.5 py-2 text-xs font-bold text-[#0a6c32] transition-all hover:bg-emerald-50"
                                    >
                                        <Mail size={13} />
                                        <span>Balas Email</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

KontakMasukIndex.layout = {
    breadcrumbs,
};
