import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Camera,
    Facebook,
    Link as LinkIcon,
    Share2,
    ZoomIn,
} from 'lucide-react';
import { toast } from 'sonner';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { formatDate } from '@/lib/format-date';
import {
    useScrollReveal,
    useScrollRevealChildren,
} from '@/hooks/use-scroll-reveal';

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
    fotos: (string | PhotoItem)[];
}

interface Props {
    album?: AlbumDetail;
}

// ─── Detailed Mock Photos for Local Evaluator ───
const mockAlbumPhotos: Record<string, (string | PhotoItem)[]> = {
    'peluncuran-portal-keuangan-bka': [
        {
            url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
            caption: 'Presentasi alur sistem pembayaran Virtual Account baru',
        },
        {
            url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80',
            caption: 'Sambutan Kepala Biro Keuangan & Aset UMRI',
        },
        {
            url: 'https://images.unsplash.com/photo-1542744095-291d1f67b221?w=1200&q=80',
            caption: 'Demo aplikasi portal keuangan untuk perwakilan mahasiswa',
        },
        {
            url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80',
            caption: 'Sesi tanya jawab dengan para dekan fakultas',
        },
        {
            url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80',
            caption:
                'Tim IT dan Keuangan BKA berfoto bersama setelah peluncuran',
        },
        {
            url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=80',
            caption: 'Penjelasan tata cara klaim dispensasi UKT online',
        },
        {
            url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
            caption: 'Tampilan dasbor administrasi tagihan mahasiswa',
        },
        {
            url: 'https://images.unsplash.com/photo-1552581230-c0152862c21a?w=1200&q=80',
            caption: 'Pemberian materi digitalisasi sistem pelaporan',
        },
    ],
    'workshop-optimalisasi-aset': [
        {
            url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80',
            caption: 'Pembukaan workshop aset wilayah muhammadiyah',
        },
        {
            url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
            caption: 'Diskusi kelompok standarisasi pencatatan inventaris',
        },
        {
            url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80',
            caption: 'Sesi pemaparan materi dari perwakilan PP Muhammadiyah',
        },
        {
            url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
            caption: 'Tinjauan lapangan sarana fisik kampus 3 UMRI',
        },
        {
            url: 'https://images.unsplash.com/photo-1542744188-8e6e38a5986b?w=1200&q=80',
            caption: 'Penyerahan cinderamata kepada narasumber utama',
        },
        {
            url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&q=80',
            caption:
                'Rapat koordinasi pimpinan universitas mengenai tata ruang',
        },
    ],
};

const defaultMockPhotos: (string | PhotoItem)[] = [
    {
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
        caption: 'Suasana ruang kerja dan fasilitas BKA UMRI',
    },
    {
        url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&q=80',
        caption: 'Pelayanan prima staf keuangan bagi mahasiswa',
    },
    {
        url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80',
        caption: 'Rapat koordinasi mingguan internal BKA',
    },
    {
        url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&q=80',
        caption: 'Penataan sarana komputerisasi administrasi',
    },
    {
        url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
        caption: 'Kunjungan kerja benchmarking dari kampus mitra',
    },
    {
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
        caption: 'Tampak depan gedung Rektorat Kampus Utama UMRI',
    },
];

export default function DokumentasiShow({ album }: Props) {
    const { url } = usePage();
    const [lightboxIndex, setLightboxIndex] = useState(-1);

    const headerRef = useScrollReveal<HTMLDivElement>();
    const descRef = useScrollReveal<HTMLDivElement>();
    const gridRef = useScrollRevealChildren<HTMLDivElement>('.bka-reveal');

    // ─── Safety and Fallback Handling ───
    // If no album prop is passed (e.g. mockup SPA link), resolve based on slug or fall back
    const pathSegments = url.split('/');
    const currentSlug =
        pathSegments[pathSegments.length - 1] ||
        'peluncuran-portal-keuangan-bka';

    const defaultAlbum: AlbumDetail = {
        judul: 'Peluncuran Portal Keuangan Terintegrasi BKA UMRI',
        slug: 'peluncuran-portal-keuangan-bka',
        tanggal_kegiatan: '2026-05-20',
        deskripsi:
            'Segenap civitas akademika UMRI menghadiri acara peluncuran portal keuangan baru terintegrasi virtual account bank syariah. Portal ini dikembangkan untuk mempercepat administrasi keuangan mahasiswa secara real-time.',
        fotos:
            mockAlbumPhotos['peluncuran-portal-keuangan-bka'] ||
            defaultMockPhotos,
    };

    const resolvedAlbum: AlbumDetail = album || {
        judul:
            currentSlug === 'workshop-optimalisasi-aset'
                ? 'Workshop Optimalisasi & Pencatatan Aset Wilayah Muhammadiyah'
                : currentSlug === 'penandatanganan-mou-mitra-bank'
                  ? 'Penandatanganan MoU Kerja Sama dengan Bank Syariah Indonesia'
                  : currentSlug === 'pelatihan-erp-akuntansi-staf'
                    ? 'Pelatihan Internal Software ERP Akuntansi Staf BKA'
                    : currentSlug === 'bakti-sosial-ramadhan-bka'
                      ? 'Bakti Sosial Ramadhan 1447H Biro Keuangan & Aset'
                      : currentSlug === 'rapat-kerja-tahunan-bka-2026'
                        ? 'Rapat Kerja Tahunan Evaluasi Anggaran & Aset UMRI 2026'
                        : defaultAlbum.judul,
        slug: currentSlug,
        tanggal_kegiatan:
            currentSlug === 'workshop-optimalisasi-aset'
                ? '2026-05-15'
                : '2026-05-20',
        deskripsi:
            currentSlug === 'workshop-optimalisasi-aset'
                ? 'Sinergi pencatatan sarana prasarana fisik guna meraih akreditasi kampus unggul tingkat nasional.'
                : defaultAlbum.deskripsi,
        fotos: mockAlbumPhotos[currentSlug] || defaultMockPhotos,
    };

    // ─── Format photos for Lightbox structure ───
    const slides = (resolvedAlbum.fotos || [])
        .map((photo, idx) => {
            if (typeof photo === 'string') {
                return {
                    src: photo,
                    alt: `${resolvedAlbum.judul} - Foto ${idx + 1}`,
                    title: `${resolvedAlbum.judul} - Foto ${idx + 1}`,
                };
            }

            return {
                src: photo.url || '',
                alt:
                    photo.caption || `${resolvedAlbum.judul} - Foto ${idx + 1}`,
                title:
                    photo.caption || `${resolvedAlbum.judul} - Foto ${idx + 1}`,
            };
        })
        .filter((slide) => !!slide.src);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Tautan album berhasil disalin ke papan klip!');
    };

    const handleShareWhatsApp = () => {
        const text = encodeURIComponent(
            `Lihat album dokumentasi "${resolvedAlbum.judul}" di Website BKA UMRI: ${window.location.href}`,
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

    const breadcrumbItems = [
        { title: 'Beranda', href: '/' },
        { title: 'Dokumentasi', href: '/dokumentasi' },
        {
            title: resolvedAlbum.judul,
            href: `/dokumentasi/${resolvedAlbum.slug}`,
        },
    ];

    return (
        <>
            <Head
                title={`${resolvedAlbum.judul} - Galeri Dokumentasi BKA UMRI`}
            >
                <meta
                    name="description"
                    content={
                        resolvedAlbum.deskripsi ||
                        'Detail foto dokumentasi kegiatan resmi Biro Keuangan dan Aset UMRI.'
                    }
                />
            </Head>

            {/* Back Button & Breadcrumbs Container */}
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

            {/* Main Header / Banner Info */}
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
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#5C6B73]">
                                <Calendar
                                    size={13}
                                    className="text-[#C8A000]"
                                />
                                <span>
                                    Kegiatan:{' '}
                                    {formatDate(resolvedAlbum.tanggal_kegiatan)}
                                </span>
                            </span>
                        </div>

                        <h1
                            ref={headerRef}
                            className="bka-reveal mb-6 leading-tight font-bold tracking-tight text-[#1A1A1A]"
                            style={{ fontSize: 'clamp(24px, 4.5vw, 36px)' }}
                        >
                            {resolvedAlbum.judul}
                        </h1>

                        {resolvedAlbum.deskripsi && (
                            <p
                                ref={descRef}
                                className="bka-reveal mb-8 max-w-3xl text-[15px] leading-relaxed text-[#5C6B73] md:text-[16px]"
                            >
                                {resolvedAlbum.deskripsi}
                            </p>
                        )}

                        {/* Share buttons */}
                        <div
                            ref={descRef}
                            className="bka-reveal flex flex-wrap items-center gap-3 border-t border-[#F1F3F1] pt-6"
                        >
                            <span className="mr-2 text-xs font-bold text-[#1A1A1A]">
                                Bagikan Album:
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

            {/* Photos Grid Section */}
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
                                        {/* Image */}
                                        <img
                                            src={photo.src}
                                            alt={photo.alt}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />

                                        {/* Premium Hover Dark Overlay with Zoom Icon */}
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

                            {/* Lightbox Module */}
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
                        /* Empty State if photos is empty */
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
