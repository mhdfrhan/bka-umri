import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Camera,
    Facebook,
    Link as LinkIcon,
    Share2,
    ZoomIn,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import { Breadcrumbs } from '@/components/breadcrumbs';
import {
    useScrollReveal,
    useScrollRevealChildren,
} from '@/hooks/use-scroll-reveal';
import { formatDate } from '@/lib/format-date';

import 'yet-another-react-lightbox/styles.css';

interface PhotoItem {
    url: string;
    caption?: string;
}

interface AlbumDetail {
    judul: string;
    slug: string;
    deskripsi?: string;
    tanggal_kegiatan: string;
    kategori?: string;
    fotos: (string | PhotoItem)[];
}

export default function DokumentasiShow() {
    const [lightboxIndex, setLightboxIndex] = useState(-1);
    const [album, setAlbum] = useState<AlbumDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const headerRef = useScrollReveal<HTMLDivElement>();
    const descRef = useScrollReveal<HTMLDivElement>();
    const gridRef = useScrollRevealChildren<HTMLDivElement>('.bka-reveal');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const segments = window.location.pathname.split('/');
            const slug = segments[segments.length - 1];

            const saved = localStorage.getItem('bka_albums');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    const found = parsed.find((a: any) => a.slug === slug);
                    if (found) {
                        setAlbum({
                            judul: found.title || found.judul,
                            slug: found.slug,
                            deskripsi: found.description || found.deskripsi,
                            tanggal_kegiatan:
                                found.date || found.tanggal_kegiatan,
                            kategori:
                                found.category ||
                                found.kategori ||
                                'Tanpa Kategori',
                            fotos: found.photos
                                ? found.photos.map((p: any) => ({
                                      url: p.url,
                                      caption: p.caption || '',
                                  }))
                                : found.fotos || [],
                        });
                    }
                } catch {
                    // ignore
                }
            }
            setIsLoading(false);
        }
    }, []);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Tautan album berhasil disalin ke papan klip!');
    };

    const handleShareWhatsApp = () => {
        if (!album) return;
        const text = encodeURIComponent(
            `Lihat album dokumentasi "${album.judul}" di Website BKA UMRI: ${window.location.href}`,
        );
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    };

    const handleShareFacebook = () => {
        const shareUrl = encodeURIComponent(window.location.href);
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
            '_blank',
        );
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center bg-white pt-24">
                <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-[#1B5E20]"></div>
            </div>
        );
    }

    if (!album) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center bg-white pt-24 text-neutral-500">
                <p className="text-lg font-bold">
                    Album kegiatan tidak ditemukan!
                </p>
                <Link
                    href="/dokumentasi"
                    className="mt-4 font-semibold text-[#1B5E20] hover:underline"
                >
                    Kembali ke Galeri
                </Link>
            </div>
        );
    }

    const slides = (album.fotos || [])
        .map((photo, idx) => {
            if (typeof photo === 'string') {
                return {
                    src: photo,
                    alt: `${album.judul} - Foto ${idx + 1}`,
                    title: `${album.judul} - Foto ${idx + 1}`,
                };
            }

            return {
                src: photo.url || '',
                alt: photo.caption || `${album.judul} - Foto ${idx + 1}`,
                title: photo.caption || `${album.judul} - Foto ${idx + 1}`,
            };
        })
        .filter((slide) => !!slide.src);

    const breadcrumbItems = [
        { title: 'Beranda', href: '/' },
        { title: 'Dokumentasi', href: '/dokumentasi' },
        {
            title: album.judul,
            href: `/dokumentasi/${album.slug}`,
        },
    ];

    return (
        <>
            <Head title={`${album.judul} - Galeri Dokumentasi BKA UMRI`}>
                <meta
                    name="description"
                    content={
                        album.deskripsi ||
                        'Detail foto dokumentasi kegiatan resmi Biro Keuangan dan Aset UMRI.'
                    }
                />
            </Head>

            <div className="border-b border-[#F1F3F1] bg-white py-4">
                <div className="bka-container flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href="/dokumentasi"
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#5C6B73] transition-colors hover:text-[#1B5E20]"
                    >
                        <ArrowLeft size={14} />
                        <span>Kembali ke Galeri</span>
                    </Link>
                    <div className="text-xs">
                        <Breadcrumbs breadcrumbs={breadcrumbItems} />
                    </div>
                </div>
            </div>

            <section className="bg-white py-12 md:py-16">
                <div className="bka-container">
                    <div className="mx-auto max-w-[900px]">
                        <div
                            ref={headerRef}
                            className="bka-reveal mb-6 flex flex-wrap items-center gap-3"
                        >
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5E9] px-3.5 py-1 text-xs font-bold text-[#1B5E20]">
                                <Camera size={13} />
                                <span>{slides.length} Dokumentasi</span>
                            </span>
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold text-white shadow-xs ${
                                    album.kategori === 'Aset'
                                        ? 'bg-[#C8A000]'
                                        : 'bg-[#1B5E20]'
                                }`}
                            >
                                <span>{album.kategori}</span>
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#5C6B73]">
                                <Calendar
                                    size={13}
                                    className="text-[#C8A000]"
                                />
                                <span>
                                    Kegiatan:{' '}
                                    {formatDate(album.tanggal_kegiatan)}
                                </span>
                            </span>
                        </div>

                        <h1
                            ref={headerRef}
                            className="bka-reveal mb-6 leading-tight font-bold tracking-tight text-[#1A1A1A]"
                            style={{ fontSize: 'clamp(24px, 3.5vw, 36px)' }}
                        >
                            {album.judul}
                        </h1>

                        {album.deskripsi && (
                            <p
                                ref={descRef}
                                className="bka-reveal mb-8 max-w-3xl text-[15px] leading-relaxed text-[#5C6B73] md:text-[16px]"
                            >
                                {album.deskripsi}
                            </p>
                        )}

                        <div
                            ref={descRef}
                            className="bka-reveal flex flex-wrap items-center gap-3 border-t border-[#F1F3F1] pt-6"
                        >
                            <span className="mr-2 text-xs font-bold text-[#1A1A1A]">
                                Bagikan:
                            </span>
                            <button
                                onClick={handleShareWhatsApp}
                                className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#E8F5E9] px-4 text-xs font-bold text-[#1B5E20] transition-colors hover:bg-[#1B5E20] hover:text-white"
                            >
                                <Share2 size={13} />
                                <span>WhatsApp</span>
                            </button>
                            <button
                                onClick={handleShareFacebook}
                                className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#F7F9F7] px-4 text-xs font-bold text-[#5C6B73] transition-colors hover:bg-[#1B5E20] hover:text-white"
                            >
                                <Facebook size={13} />
                                <span>Facebook</span>
                            </button>
                            <button
                                onClick={handleCopyLink}
                                className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#F7F9F7] px-4 text-xs font-bold text-[#5C6B73] transition-colors hover:bg-[#1B5E20] hover:text-white"
                                title="Salin Tautan Album"
                            >
                                <LinkIcon size={13} />
                                <span>Salin Tautan</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="min-h-[300px] flex-1 bg-[#F7F9F7] py-12 md:py-16">
                <div className="bka-container">
                    {slides.length > 0 ? (
                        <>
                            <div
                                ref={gridRef}
                                className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                            >
                                {slides.map((photo, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setLightboxIndex(idx)}
                                        className={`bka-reveal bka-stagger-${(idx % 6) + 1} group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border border-[#DDE5DD] bg-white shadow-sm transition-all duration-300 hover:shadow-md`}
                                    >
                                        <img
                                            src={photo.src}
                                            alt={photo.alt}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />

                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0D3B11]/70 p-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
                                            <div className="flex h-11 w-11 translate-y-3 transform items-center justify-center rounded-full bg-[#C8A000] text-white shadow-lg transition-transform duration-300 group-hover:translate-y-0">
                                                <ZoomIn size={20} />
                                            </div>
                                            {photo.alt && (
                                                <p className="mt-3 line-clamp-2 translate-y-3 transform text-center text-xs font-medium text-white/95 transition-all duration-300 group-hover:translate-y-0">
                                                    {photo.alt}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Lightbox
                                index={lightboxIndex}
                                open={lightboxIndex >= 0}
                                close={() => setLightboxIndex(-1)}
                                slides={slides}
                                plugins={[Zoom]}
                                zoom={{
                                    maxZoomPixelRatio: 3,
                                    scrollToZoom: true,
                                }}
                            />
                        </>
                    ) : (
                        <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-3xl border border-[#DDE5DD] bg-white px-6 py-20 text-center">
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F5E9] text-[#1B5E20]">
                                <Camera size={24} />
                            </div>
                            <h3 className="mb-1 text-lg font-bold text-[#1A1A1A]">
                                Belum Ada Foto
                            </h3>
                            <p className="text-sm leading-relaxed text-[#5C6B73]">
                                Album ini masih kosong dan belum diunggah
                                dokumentasi fotonya oleh admin. Silakan kembali
                                nanti.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
