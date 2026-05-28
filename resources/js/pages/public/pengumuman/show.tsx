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
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.875 1.218 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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
