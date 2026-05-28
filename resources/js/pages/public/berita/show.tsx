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
                            className="prose-[#5C6B73] prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-[#1A1A1A] prose-h3:text-2xl prose-a:text-[#0a6c32] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-[#C8A000] prose-blockquote:bg-[#F7F9F7] prose-blockquote:px-6 prose-blockquote:py-3 prose-blockquote:font-medium prose-blockquote:text-[#0a6c32] prose-blockquote:italic prose-img:rounded-2xl prose-img:shadow-md"
                            dangerouslySetInnerHTML={{
                                __html: berita.content,
                            }}
                        />

                        {/* Share & Back Area */}
                        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-[#DDE5DD] pt-8 md:flex-row">
                            <Link
                                href="/berita"
                                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#5C6B73] no-underline transition-all duration-200 hover:gap-3 hover:text-[#0a6c32]"
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
