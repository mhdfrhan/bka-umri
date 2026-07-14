import { Seo } from '@/components/seo';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    FileText,
    Download,
    Facebook,
    Linkedin,
    Twitter,
    Link as LinkIcon,
    ZoomIn,
} from 'lucide-react';
import { toast } from 'sonner';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface Attachment {
    name: string;
    url: string;
    size: string;
    extension: string;
}

interface AnnouncementDetail {
    title: string;
    slug: string;
    content: string;
    isPenting: boolean;
    date: string;
    thumbnail: string;
    attachments: Attachment[];
}

const formatDateIndo = (dateStr: string) => {
    if (!dateStr) {
        return '';
    }

    if (dateStr.includes(' ') && isNaN(Number(dateStr.split(' ')[0]))) {
        return dateStr;
    }

    try {
        const dateObj = new Date(dateStr);

        if (isNaN(dateObj.getTime())) {
            return dateStr;
        }

        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        };

        return dateObj.toLocaleDateString('id-ID', options);
    } catch {
        return dateStr;
    }
};

export default function PengumumanShow({
    announcement,
}: {
    announcement: AnnouncementDetail;
}) {
    const articleRef = useScrollReveal<HTMLDivElement>();
    const [isOpen, setIsOpen] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Tautan pengumuman berhasil disalin ke papan klip!');
    };

    const handleShareFacebook = () => {
        const shareUrl = encodeURIComponent(window.location.href);
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
            '_blank',
        );
    };

    const handleShareTwitter = () => {
        const text = encodeURIComponent(
            `Lihat pengumuman "${announcement.title}" di Website BKA UMRI: ${window.location.href}`,
        );
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    };

    const handleShareLinkedIn = () => {
        const shareUrl = encodeURIComponent(window.location.href);
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
            '_blank',
        );
    };

    const handleShareWhatsApp = () => {
        const text = encodeURIComponent(
            `Lihat pengumuman "${announcement.title}" di Website BKA UMRI: ${window.location.href}`,
        );
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    };

    const rawExcerpt = announcement.content.replace(/<[^>]+>/g, '').substring(0, 160).trim();
    const finalExcerpt = rawExcerpt.length > 0 ? `${rawExcerpt}...` : "Detail pengumuman resmi dari Biro Keuangan dan Aset Universitas Muhammadiyah Riau.";

    return (
        <>
            <Seo 
                title={announcement.title}
                description={finalExcerpt}
                image={announcement.thumbnail ? (announcement.thumbnail.startsWith('http') ? announcement.thumbnail : `/storage/${announcement.thumbnail}`) : undefined}
                type="article"
                author="Admin BKA"
                publishedTime={announcement.date ? new Date(announcement.date).toISOString() : undefined}
                keywords={`Pengumuman BKA, BKA UMRI, Universitas Muhammadiyah Riau, ${announcement.title.split(' ').slice(0,3).join(', ')}`}
            />

            {/* Header */}
            <section className="bg-gradient-to-b from-[#e8f3ec]/40 via-[#F7F9F7]/10 to-white pt-24 pb-8 md:pt-32 md:pb-12">
                <div className="bka-container">
                    <div className="mx-auto max-w-[800px] text-center">
                        {announcement.isPenting && (
                            <div className="mb-6">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFEAE5] px-4 py-2 text-[10px] font-black tracking-widest text-[#E53935] uppercase border border-red-100 shadow-sm">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E53935] opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E53935]"></span>
                                    </span>
                                    Penting & Urgent
                                </span>
                            </div>
                        )}

                        <h1
                            className="mb-6 leading-[1.35] font-black text-[#1A1A1A] tracking-tight"
                            style={{ fontSize: 'clamp(22px, 3.5vw, 32px)' }}
                        >
                            {announcement.title}
                        </h1>

                        <div className="flex items-center justify-center gap-2 text-[12px] font-bold text-[#5C6B73] uppercase tracking-wider bg-neutral-100/80 px-4 py-1.5 rounded-full w-fit mx-auto border border-neutral-200/40">
                            <Calendar size={14} className="text-[#0a6c32]" />
                            <span>
                                Diterbitkan: {formatDateIndo(announcement.date)}
                            </span>
                        </div>
                        <span className="bka-gold-line bka-gold-line-center mt-6" />
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <section className="bg-white pb-16 md:pb-24">
                <div className="bka-container">
                    <div
                        ref={articleRef}
                        className="bka-reveal mx-auto max-w-[800px] bg-white rounded-3xl border border-[#DDE5DD] p-6 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
                    >
                        {/* Thumbnail */}
                        {announcement.thumbnail && (
                            <>
                                <div 
                                    className="group relative cursor-zoom-in overflow-hidden rounded-2xl shadow-sm border border-[#DDE5DD] mb-8 bg-neutral-100/50"
                                    onClick={() => setIsOpen(true)}
                                >
                                    <img
                                        src={announcement.thumbnail}
                                        alt={announcement.title}
                                        className="w-full h-auto max-h-[550px] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                                        loading="lazy"
                                    />
                                    {/* Zoom overlay indicator */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 font-medium text-white backdrop-blur-md">
                                            <ZoomIn size={20} />
                                            <span>Perbesar Gambar</span>
                                        </div>
                                    </div>
                                </div>
                                <Lightbox
                                    open={isOpen}
                                    close={() => setIsOpen(false)}
                                    slides={[{ src: announcement.thumbnail }]}
                                />
                            </>
                        )}

                        {/* Prose Content */}
                        <div
                            className="prose-[#5C6B73] prose prose-lg max-w-none prose-headings:font-black prose-headings:text-[#1A1A1A] prose-h3:text-xl prose-a:text-[#0a6c32] prose-a:font-bold prose-a:no-underline hover:prose-a:underline prose-li:marker:text-[#C8A000]"
                            dangerouslySetInnerHTML={{
                                __html: announcement.content,
                            }}
                        />

                        {/* Attachments */}
                        {announcement.attachments &&
                            announcement.attachments.length > 0 && (
                                <div className="mt-12 rounded-2xl border border-[#DDE5DD] bg-neutral-50/50 p-5 sm:p-6">
                                    <h3 className="mb-4 text-sm font-black text-[#1A1A1A] uppercase tracking-widest border-b border-neutral-200 pb-2">
                                        Lampiran Dokumen
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        {announcement.attachments.map(
                                            (file, idx) => (
                                                <a
                                                    key={idx}
                                                    href={file.url}
                                                    download={file.name}
                                                    className="group flex items-center justify-between rounded-xl border border-[#DDE5DD] bg-white p-4 shadow-xs transition-all duration-250 hover:border-[#0a6c32]/30 hover:bg-[#e6f4ea]/20 hover:shadow-sm"
                                                >
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e6f4ea] text-[#0a6c32] border border-emerald-100">
                                                            <FileText
                                                                size={18}
                                                            />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-bold text-[#1A1A1A] group-hover:text-[#0a6c32] transition-colors">
                                                                {file.name}
                                                            </p>
                                                            <p className="text-xs text-[#9EAAB2] font-medium mt-0.5">
                                                                Ukuran:{' '}
                                                                {file.size}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F9F7] border border-neutral-200 text-[#0a6c32] transition-all group-hover:bg-[#0a6c32] group-hover:text-white group-hover:border-[#0a6c32]">
                                                        <Download size={14} className="stroke-[2.5]" />
                                                    </div>
                                                </a>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Share & Back Area */}
                        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-[#DDE5DD] pt-8 md:flex-row">
                            <Link
                                href="/pengumuman"
                                className="group inline-flex items-center gap-2 text-xs font-black text-[#5C6B73] uppercase tracking-wider no-underline transition-all duration-200 hover:text-[#0a6c32]"
                            >
                                <ArrowLeft
                                    size={14}
                                    className="transition-transform duration-200 group-hover:-translate-x-1 stroke-[2.5]"
                                />
                                Kembali ke Daftar
                            </Link>

                            <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
                                <span className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest">
                                    Bagikan:
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={handleShareWhatsApp}
                                        aria-label="Share on WhatsApp"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-50 border border-neutral-200 text-[#5C6B73] transition-all hover:bg-[#0a6c32] hover:text-white hover:border-[#0a6c32] cursor-pointer"
                                        title="Bagikan ke WhatsApp"
                                    >
                                        <svg
                                            className="size-4 fill-current"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.875 1.218 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={handleShareFacebook}
                                        aria-label="Share on Facebook"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-50 border border-neutral-200 text-[#5C6B73] transition-all hover:bg-[#0a6c32] hover:text-white hover:border-[#0a6c32] cursor-pointer"
                                        title="Bagikan ke Facebook"
                                    >
                                        <Facebook size={14} />
                                    </button>
                                    <button
                                        onClick={handleShareTwitter}
                                        aria-label="Share on Twitter"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-50 border border-neutral-200 text-[#5C6B73] transition-all hover:bg-[#0a6c32] hover:text-white hover:border-[#0a6c32] cursor-pointer"
                                        title="Bagikan ke Twitter / X"
                                    >
                                        <Twitter size={14} />
                                    </button>
                                    <button
                                        onClick={handleShareLinkedIn}
                                        aria-label="Share on LinkedIn"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-50 border border-neutral-200 text-[#5C6B73] transition-all hover:bg-[#0a6c32] hover:text-white hover:border-[#0a6c32] cursor-pointer"
                                        title="Bagikan ke LinkedIn"
                                    >
                                        <Linkedin size={14} />
                                    </button>
                                    <button
                                        onClick={handleCopyLink}
                                        aria-label="Copy Link"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-50 border border-neutral-200 text-[#5C6B73] transition-all hover:bg-[#0a6c32] hover:text-white hover:border-[#0a6c32] cursor-pointer"
                                        title="Salin Tautan Pengumuman"
                                    >
                                        <LinkIcon size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
