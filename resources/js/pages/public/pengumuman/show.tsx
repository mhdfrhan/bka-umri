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
} from 'lucide-react';
import { toast } from 'sonner';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

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

    return (
        <>
            <Head title={`${announcement.title} - BKA UMRI`}>
                <meta
                    name="description"
                    content="Detail pengumuman resmi dari Biro Keuangan dan Aset Universitas Muhammadiyah Riau."
                />
            </Head>

            {/* Header */}
            <section className="bg-white pt-24 pb-10 md:pt-32 md:pb-14">
                <div className="bka-container">
                    <div className="mx-auto max-w-[800px] text-center">
                        {announcement.isPenting && (
                            <div className="mb-6">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFEAE5] px-3.5 py-1.5 text-xs font-bold tracking-widest text-[#E53935] uppercase">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E53935] opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E53935]"></span>
                                    </span>
                                    Penting
                                </span>
                            </div>
                        )}

                        <h1
                            className="mb-6 leading-[1.3] font-bold text-[#1A1A1A]"
                            style={{ fontSize: 'clamp(24px, 3.5vw, 36px)' }}
                        >
                            {announcement.title}
                        </h1>

                        <div className="flex items-center justify-center gap-2 text-[14px] font-medium text-[#5C6B73]">
                            <Calendar size={16} />
                            <span>
                                Dipublikasikan pada{' '}
                                {formatDateIndo(announcement.date)}
                            </span>
                        </div>
                        <span className="bka-gold-line bka-gold-line-center mt-8" />
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <section className="bg-white pb-16 md:pb-24">
                <div className="bka-container">
                    <div
                        ref={articleRef}
                        className="bka-reveal mx-auto max-w-[760px]"
                    >
                        {/* Prose Content */}
                        <div
                            className="prose-[#5C6B73] prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-[#1A1A1A] prose-h3:text-xl prose-a:text-[#0a6c32] prose-a:no-underline hover:prose-a:underline prose-li:marker:text-[#C8A000]"
                            dangerouslySetInnerHTML={{
                                __html: announcement.content,
                            }}
                        />

                        {/* Attachments */}
                        {announcement.attachments &&
                            announcement.attachments.length > 0 && (
                                <div className="mt-12 rounded-2xl border border-[#DDE5DD] bg-[#F7F9F7] p-6 md:p-8">
                                    <h3 className="mb-4 text-lg font-bold text-[#1A1A1A]">
                                        Lampiran Dokumen
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        {announcement.attachments.map(
                                            (file, idx) => (
                                                <a
                                                    key={idx}
                                                    href={file.url}
                                                    download={file.name}
                                                    className="group flex items-center justify-between rounded-xl border border-transparent bg-white p-4 shadow-sm transition-all duration-200 hover:border-[#0a6c32] hover:shadow-md"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e6f4ea] text-[#0a6c32]">
                                                            <FileText
                                                                size={20}
                                                            />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-bold text-[#1A1A1A] group-hover:text-[#0a6c32]">
                                                                {file.name}
                                                            </p>
                                                            <p className="text-xs text-[#9EAAB2]">
                                                                Ukuran:{' '}
                                                                {file.size}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F9F7] text-[#0a6c32] transition-colors group-hover:bg-[#0a6c32] group-hover:text-white">
                                                        <Download size={16} />
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
                                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#5C6B73] no-underline transition-all duration-200 hover:gap-3 hover:text-[#0a6c32]"
                            >
                                <ArrowLeft
                                    size={16}
                                    className="transition-transform duration-200 group-hover:-translate-x-0.5"
                                />
                                Kembali ke Daftar Pengumuman
                            </Link>

                            <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
                                <span className="text-sm font-semibold text-[#1A1A1A]">
                                    Bagikan:
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={handleShareWhatsApp}
                                        aria-label="Share on WhatsApp"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F9F7] text-[#5C6B73] transition-colors hover:bg-[#0a6c32] hover:text-white"
                                        title="Bagikan ke WhatsApp"
                                    >
                                        <svg
                                            className="size-4 fill-current"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.501-5.733-1.455L0 24zm6.79-11.767c.186-.12.308-.24.428-.36.12-.12.18-.24.3-.36l.24-.36c.06-.12.12-.18.12-.3 0-.12-.06-.24-.12-.36l-.9-2.16c-.12-.3-.24-.3-.42-.3h-.3c-.18 0-.42.06-.6.24-.18.18-.72.72-.72 1.74 0 1.02.72 2.04.84 2.16.12.12 1.44 2.16 3.42 2.94.48.18.84.3 1.14.36.48.12.9.12 1.26.06.36-.06 1.14-.48 1.32-.96.18-.48.18-.9 0-.96-.06-.06-.18-.12-.36-.24-.18-.12-.96-.48-1.14-.54-.18-.06-.3-.12-.42.06-.12.18-.48.6-.6.72-.12.12-.24.12-.42 0-.18-.12-.78-.3-1.5-1.02-.54-.48-.9-1.08-1.02-1.2-.12-.18-.02-.3.08-.36z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={handleShareFacebook}
                                        aria-label="Share on Facebook"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F9F7] text-[#5C6B73] transition-colors hover:bg-[#0a6c32] hover:text-white"
                                        title="Bagikan ke Facebook"
                                    >
                                        <Facebook size={16} />
                                    </button>
                                    <button
                                        onClick={handleShareTwitter}
                                        aria-label="Share on Twitter"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F9F7] text-[#5C6B73] transition-colors hover:bg-[#0a6c32] hover:text-white"
                                        title="Bagikan ke Twitter / X"
                                    >
                                        <Twitter size={16} />
                                    </button>
                                    <button
                                        onClick={handleShareLinkedIn}
                                        aria-label="Share on LinkedIn"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F9F7] text-[#5C6B73] transition-colors hover:bg-[#0a6c32] hover:text-white"
                                        title="Bagikan ke LinkedIn"
                                    >
                                        <Linkedin size={16} />
                                    </button>
                                    <button
                                        onClick={handleCopyLink}
                                        aria-label="Copy Link"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F9F7] text-[#5C6B73] transition-colors hover:bg-[#0a6c32] hover:text-white"
                                        title="Salin Tautan Pengumuman"
                                    >
                                        <LinkIcon size={16} />
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
