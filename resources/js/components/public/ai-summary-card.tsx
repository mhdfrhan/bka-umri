import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Sparkles,
    Copy,
    Check,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    AlertCircle,
    Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AiSummaryCardProps {
    id: number;
    updatedAt?: number | string;
    type: 'berita' | 'pengumuman';
    title: string;
    className?: string;
}

export default function AiSummaryCard({
    id,
    updatedAt,
    type,
    title,
    className,
}: AiSummaryCardProps) {
    const storageKey = `bka_ai_sum_${type}_${id}_${updatedAt || 0}`;

    const [summary, setSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    const fetchSummary = useCallback(async (bypassCache = false) => {
        setIsLoading(true);
        setError(null);

        // 1. Check client-side localStorage unless bypass is requested
        if (!bypassCache) {
            try {
                const cached = localStorage.getItem(storageKey);
                if (cached && cached.trim().length > 0) {
                    setSummary(cached);
                    setIsLoading(false);
                    return;
                }
            } catch (err) {
                // If localStorage is blocked or full, proceed to fetch
            }
        }

        // 2. Fetch from backend API
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';

            const response = await fetch('/api/ai/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    id,
                    type,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success && data.summary) {
                setSummary(data.summary);
                try {
                    localStorage.setItem(storageKey, data.summary);
                } catch (e) {
                    // Ignore localStorage quota limits
                }
            } else {
                setError(
                    data.message ||
                        'Ringkasan AI belum dapat diproses saat ini.',
                );
            }
        } catch (err: any) {
            setError(
                'Terjadi gangguan saat memuat ringkasan AI. Silakan periksa koneksi internet Anda.',
            );
        } finally {
            setIsLoading(false);
        }
    }, [id, type, storageKey]);

    useEffect(() => {
        fetchSummary(false);
    }, [fetchSummary]);

    const handleCopy = () => {
        if (!summary) return;

        // Clean markdown symbols for plain clipboard text
        const plainText = summary
            .replace(/[#*`_~]/g, '')
            .replace(/\|/g, ' ')
            .trim();

        navigator.clipboard.writeText(
            `Ringkasan AI: ${title}\n(Sumber: Biro Keuangan dan Aset UMRI)\n\n${plainText}`,
        );
        setIsCopied(true);
        toast.success('Ringkasan AI berhasil disalin ke clipboard');
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <section
            aria-label="Ringkasan AI Eksekutif"
            className={cn(
                'relative my-7 overflow-hidden rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 p-5 shadow-xs transition-all duration-300 md:my-8 md:p-6',
                className,
            )}
        >
            {/* Soft decorative background glow */}
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-emerald-200/30 blur-2xl" />

            {/* Header section */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-100/90 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0a6c32] to-[#128a42] text-white shadow-xs shadow-emerald-700/20">
                        <Sparkles className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold tracking-tight text-slate-900">
                                Ringkasan AI Eksekutif
                            </h3>
                            <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                                Pintar & Terstruktur
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">
                            Poin kunci dan informasi esensial yang dirangkum otomatis
                        </p>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                    {summary && !isLoading && (
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-emerald-50 hover:text-emerald-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            title="Salin ringkasan"
                        >
                            {isCopied ? (
                                <>
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                    <span className="text-emerald-700 font-semibold">Tersalin</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                                    <span>Salin</span>
                                </>
                            )}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none"
                        title={isCollapsed ? 'Bentangkan ringkasan' : 'Ciutkan ringkasan'}
                        aria-expanded={!isCollapsed}
                    >
                        {isCollapsed ? (
                            <>
                                <span>Lihat</span>
                                <ChevronDown className="h-3.5 w-3.5" />
                            </>
                        ) : (
                            <>
                                <span>Tutup</span>
                                <ChevronUp className="h-3.5 w-3.5" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Body content */}
            {!isCollapsed && (
                <div className="pt-4">
                    {isLoading && (
                        <div className="space-y-3 py-2 animate-pulse">
                            <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
                                <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                                <span>Sedang mengekstrak intisari artikel & menyusun poin-poin kunci...</span>
                            </div>
                            <div className="h-4 w-11/12 rounded-md bg-emerald-100/70" />
                            <div className="h-4 w-4/5 rounded-md bg-emerald-100/60" />
                            <div className="mt-3 grid grid-cols-2 gap-3">
                                <div className="h-14 rounded-lg bg-emerald-100/40" />
                                <div className="h-14 rounded-lg bg-emerald-100/40" />
                            </div>
                        </div>
                    )}

                    {!isLoading && error && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                                <span>{error}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => fetchSummary(true)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-1 font-semibold text-amber-800 hover:bg-amber-100/70 transition-colors"
                            >
                                <RefreshCw className="h-3 w-3" />
                                <span>Coba Lagi</span>
                            </button>
                        </div>
                    )}

                    {!isLoading && summary && (
                        <div className="prose prose-slate max-w-none text-slate-700">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    table: ({ node, ...props }) => (
                                        <div className="my-3 overflow-x-auto rounded-xl border border-emerald-200/90 bg-white shadow-xs">
                                            <table
                                                className="min-w-full divide-y divide-emerald-100 border-collapse text-left"
                                                {...props}
                                            />
                                        </div>
                                    ),
                                    thead: ({ node, ...props }) => (
                                        <thead
                                            className="bg-emerald-50/90 font-bold text-emerald-950 text-xs uppercase tracking-wider"
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
                                            className="hover:bg-emerald-50/40 transition-colors"
                                            {...props}
                                        />
                                    ),
                                    th: ({ node, ...props }) => (
                                        <th
                                            className="px-3.5 py-2.5 text-xs font-semibold text-emerald-950 border-r border-emerald-100 last:border-r-0"
                                            {...props}
                                        />
                                    ),
                                    td: ({ node, ...props }) => (
                                        <td
                                            className="px-3.5 py-2 text-[13px] text-slate-700 border-r border-slate-100 last:border-r-0"
                                            {...props}
                                        />
                                    ),
                                    ul: ({ node, ...props }) => (
                                        <ul
                                            className="my-2 list-disc space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-slate-700"
                                            {...props}
                                        />
                                    ),
                                    ol: ({ node, ...props }) => (
                                        <ol
                                            className="my-2 list-decimal space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-slate-700"
                                            {...props}
                                        />
                                    ),
                                    li: ({ node, ...props }) => (
                                        <li
                                            className="text-[13.5px] leading-relaxed text-slate-700"
                                            {...props}
                                        />
                                    ),
                                    p: ({ node, ...props }) => (
                                        <p
                                            className="my-2 text-[13.5px] leading-relaxed text-slate-700"
                                            {...props}
                                        />
                                    ),
                                    strong: ({ node, ...props }) => (
                                        <strong
                                            className="font-bold text-slate-900"
                                            {...props}
                                        />
                                    ),
                                    blockquote: ({ node, ...props }) => (
                                        <blockquote
                                            className="my-3 rounded-xl border-l-4 border-[#0a6c32] bg-emerald-50/80 p-3.5 text-[13px] italic leading-relaxed text-emerald-950 not-italic"
                                            {...props}
                                        />
                                    ),
                                    a: ({ node, ...props }) => (
                                        <a
                                            className="text-[#0a6c32] font-semibold underline underline-offset-2 hover:text-[#048d46] transition-colors"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            {...props}
                                        />
                                    ),
                                    code: ({ node, inline, ...props }: any) =>
                                        inline ? (
                                            <code
                                                className="rounded bg-emerald-100/70 px-1.5 py-0.5 text-xs font-semibold text-emerald-900 font-mono"
                                                {...props}
                                            />
                                        ) : (
                                            <div className="my-2 overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-100 font-mono">
                                                <code {...props} />
                                            </div>
                                        ),
                                }}
                            >
                                {summary}
                            </ReactMarkdown>

                            {/* Informative footer caption */}
                            <div className="mt-3.5 flex items-center gap-1.5 border-t border-emerald-100/80 pt-2.5 text-[11px] text-slate-400">
                                <Info className="h-3 w-3 shrink-0 text-emerald-600" />
                                <span>
                                    Ringkasan diproses secara mandiri oleh kecerdasan buatan. Untuk keabsahan rincian resmi, mohon baca naskah lengkap artikel.
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
