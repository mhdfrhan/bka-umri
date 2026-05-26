import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Facebook,
    Linkedin,
    Twitter,
    User,
    Link as LinkIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

interface NewsItem {
    slug: string;
    thumbnail: string;
    category?: string;
    title: string;
    date: string;
    author?: string;
    content: string;
}

const formatDateIndo = (dateStr: string) => {
    if (!dateStr) {
        return '';
    }

    if (dateStr.includes(' ') && isNaN(Number(dateStr.split(' ')[0]))) {
        return dateStr;
    } // already formatted like "20 Mei 2026"

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

export default function BeritaShow({ berita }: { berita: NewsItem }) {
    const articleRef = useScrollReveal<HTMLDivElement>();

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Tautan berita berhasil disalin ke papan klip!');
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
            `Lihat berita "${berita.title}" di Website BKA UMRI: ${window.location.href}`,
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
            `Lihat berita "${berita.title}" di Website BKA UMRI: ${window.location.href}`,
        );
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    };

    return (
        <>
            <Head title={`${berita.title} - BKA UMRI`}>
                <meta
                    name="description"
                    content="Detail berita Biro Keuangan dan Aset Universitas Muhammadiyah Riau."
                />
            </Head>

            {/* Article Header / Hero */}
            <section className="relative pt-28 pb-16 md:pt-36 md:pb-24">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={berita.thumbnail}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover"
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(to bottom, rgba(13, 59, 17, 0.85) 0%, rgba(10, 40, 14, 0.95) 100%)',
                        }}
                    />
                </div>

                <div className="bka-container relative z-10">
                    <div className="mx-auto max-w-[800px] text-center">
                        {/* Category Badge */}
                        <div className="mb-6">
                            <span className="inline-block rounded-full bg-[#C8A000] px-4 py-1.5 text-xs font-bold tracking-widest text-[#1A1A1A] uppercase shadow-md">
                                {berita.category}
                            </span>
                        </div>

                        {/* Title */}
                        <h1
                            className="mb-8 leading-tight font-bold text-white"
                            style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
                        >
                            {berita.title}
                        </h1>

                        {/* Meta Data */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-[14px] font-medium text-white/80">
                            <div className="flex items-center gap-2">
                                <Calendar
                                    size={16}
                                    className="text-[#C8A000]"
                                />
                                <span>{formatDateIndo(berita.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-[#C8A000]" />
                                <span>{berita.author}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <section className="bg-white py-12 md:py-20">
                <div className="bka-container">
                    <div
                        ref={articleRef}
                        className="bka-reveal mx-auto max-w-[760px]"
                    >
                        {/* Prose Content */}
                        <div
                            className="prose-[#5C6B73] prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-[#1A1A1A] prose-h3:text-2xl prose-a:text-[#1B5E20] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-[#C8A000] prose-blockquote:bg-[#F7F9F7] prose-blockquote:px-6 prose-blockquote:py-3 prose-blockquote:font-medium prose-blockquote:text-[#1B5E20] prose-blockquote:italic prose-img:rounded-2xl prose-img:shadow-md"
                            dangerouslySetInnerHTML={{
                                __html: berita.content,
                            }}
                        />

                        {/* Share & Back Area */}
                        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-[#DDE5DD] pt-8 md:flex-row">
                            <Link
                                href="/berita"
                                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#5C6B73] no-underline transition-all duration-200 hover:gap-3 hover:text-[#1B5E20]"
                            >
                                <ArrowLeft
                                    size={16}
                                    className="transition-transform duration-200 group-hover:-translate-x-0.5"
                                />
                                Kembali ke Daftar Berita
                            </Link>

                            <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
                                <span className="text-sm font-semibold text-[#1A1A1A]">
                                    Bagikan:
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={handleShareWhatsApp}
                                        aria-label="Share on WhatsApp"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F9F7] text-[#5C6B73] transition-colors hover:bg-[#1B5E20] hover:text-white"
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
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F9F7] text-[#5C6B73] transition-colors hover:bg-[#1B5E20] hover:text-white"
                                        title="Bagikan ke Facebook"
                                    >
                                        <Facebook size={16} />
                                    </button>
                                    <button
                                        onClick={handleShareTwitter}
                                        aria-label="Share on Twitter"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F9F7] text-[#5C6B73] transition-colors hover:bg-[#1B5E20] hover:text-white"
                                        title="Bagikan ke Twitter / X"
                                    >
                                        <Twitter size={16} />
                                    </button>
                                    <button
                                        onClick={handleShareLinkedIn}
                                        aria-label="Share on LinkedIn"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F9F7] text-[#5C6B73] transition-colors hover:bg-[#1B5E20] hover:text-white"
                                        title="Bagikan ke LinkedIn"
                                    >
                                        <Linkedin size={16} />
                                    </button>
                                    <button
                                        onClick={handleCopyLink}
                                        aria-label="Copy Link"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F9F7] text-[#5C6B73] transition-colors hover:bg-[#1B5E20] hover:text-white"
                                        title="Salin Tautan Berita"
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
