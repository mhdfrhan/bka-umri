import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    Image as ImageIcon,
    Images,
    Search,
    ArrowRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHero } from '@/components/layout/page-hero';
import { Pagination } from '@/components/ui/pagination';
import {
    useScrollReveal,
    useScrollRevealChildren,
} from '@/hooks/use-scroll-reveal';
import { formatDate } from '@/lib/format-date';

interface AlbumItem {
    judul: string;
    slug: string;
    cover_url: string;
    tanggal_kegiatan: string;
    jumlah_foto: number;
    deskripsi?: string;
}

const dummyAlbums: AlbumItem[] = [
    {
        judul: 'Peluncuran Portal Keuangan Terintegrasi BKA UMRI',
        slug: 'peluncuran-portal-keuangan-bka',
        cover_url:
            'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
        tanggal_kegiatan: '2026-05-20',
        jumlah_foto: 12,
        deskripsi:
            'Dokumentasi resmi acara peluncuran portal pembayaran SPP baru terintegrasi virtual account bank syariah.',
    },
    {
        judul: 'Workshop Optimalisasi & Pencatatan Aset Wilayah Muhammadiyah',
        slug: 'workshop-optimalisasi-aset',
        cover_url:
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
        tanggal_kegiatan: '2026-05-15',
        jumlah_foto: 8,
        deskripsi:
            'Sinergi pencatatan sarana prasarana fisik guna meraih akreditasi kampus unggul tingkat nasional.',
    },
    {
        judul: 'Penandatanganan MoU Kerja Sama dengan Bank Syariah Indonesia',
        slug: 'penandatanganan-mou-mitra-bank',
        cover_url:
            'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&q=80',
        tanggal_kegiatan: '2026-05-10',
        jumlah_foto: 15,
        deskripsi:
            'Penandatanganan dokumen kerja sama kemitraan strategis pembayaran uang kuliah tunggal mahasiswa.',
    },
    {
        judul: 'Pelatihan Internal Software ERP Akuntansi Staf BKA',
        slug: 'pelatihan-erp-akuntansi-staf',
        cover_url:
            'https://images.unsplash.com/photo-1531496730074-83b638c0a7ac?w=600&q=80',
        tanggal_kegiatan: '2026-04-20',
        jumlah_foto: 6,
        deskripsi:
            'Peningkatan kompetensi staf administrasi keuangan dalam pengoperasian modul modul ERP terbaru.',
    },
    {
        judul: 'Bakti Sosial Ramadhan 1447H Biro Keuangan & Aset',
        slug: 'bakti-sosial-ramadhan-bka',
        cover_url:
            'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80',
        tanggal_kegiatan: '2026-04-05',
        jumlah_foto: 20,
        deskripsi:
            'Pemberian santunan dan paket kebutuhan pokok kepada panti asuhan muhammadiyah binaan UMRI.',
    },
    {
        judul: 'Rapat Kerja Tahunan Evaluasi Anggaran & Aset UMRI 2026',
        slug: 'rapat-kerja-tahunan-bka-2026',
        cover_url:
            'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=600&q=80',
        tanggal_kegiatan: '2026-03-12',
        jumlah_foto: 10,
        deskripsi:
            'Rapat kerja seluruh jajaran biro keuangan guna menyusun anggaran operasional tahun akademik baru.',
    },
];

const dummyPagination = [
    { url: null, label: 'Prev', active: false },
    { url: '/dokumentasi?page=1', label: '1', active: true },
    { url: null, label: 'Next', active: false },
];

export default function DokumentasiIndex() {
    const [searchQuery, setSearchQuery] = useState('');
    const [albumList, setAlbumList] = useState<any[]>([]);

    const heroRef = useScrollReveal<HTMLDivElement>();
    const filterRef = useScrollReveal<HTMLDivElement>();
    const gridRef = useScrollRevealChildren<HTMLDivElement>('.bka-reveal');

    useEffect(() => {
        const saved = localStorage.getItem('bka_albums');
        if (saved) {
            try {
                setAlbumList(JSON.parse(saved));
            } catch {
                setAlbumList([]);
            }
        } else {
            // Seed defaults mapped to admin schema
            const seeded = dummyAlbums.map((a, index) => ({
                id: index + 1,
                title: a.judul,
                slug: a.slug,
                description: a.deskripsi,
                date: a.tanggal_kegiatan,
                coverUrl: a.cover_url,
                photos: Array.from({ length: a.jumlah_foto }).map((_, i) => ({
                    id: String(i + 1),
                    url: a.cover_url,
                    order: i + 1
                }))
            }));
            localStorage.setItem('bka_albums', JSON.stringify(seeded));
            setAlbumList(seeded);
        }
    }, []);

    // Map keys to match public UI
    const mappedAlbums: AlbumItem[] = albumList.map((a: any) => ({
        judul: a.title || a.judul,
        slug: a.slug,
        cover_url: a.coverUrl || a.cover_url,
        tanggal_kegiatan: a.date || a.tanggal_kegiatan,
        jumlah_foto: a.photos ? a.photos.length : (a.jumlah_foto || 0),
        deskripsi: a.description || a.deskripsi
    }));

    const filteredAlbums = mappedAlbums.filter(
        (album) =>
            album.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (album.deskripsi || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
    );

    const breadcrumbItems = [
        { title: 'Beranda', href: '/' },
        { title: 'Dokumentasi', href: '/dokumentasi' },
    ];

    return (
        <>
            <Head title="Galeri Dokumentasi Kegiatan - BKA UMRI">
                <meta
                    name="description"
                    content="Kumpulan dokumentasi foto kegiatan, rapat kerja, sosialisasi, dan arsip visual Biro Keuangan dan Aset Universitas Muhammadiyah Riau."
                />
            </Head>

            {/* Page Hero */}
            <PageHero
                title="Galeri Dokumentasi"
                description="Arsip visual dan kumpulan dokumentasi berbagai agenda serta kegiatan resmi Biro Keuangan & Aset UMRI."
            >
                <div ref={heroRef} className="bka-reveal">
                    <Breadcrumbs breadcrumbs={breadcrumbItems} />
                </div>
            </PageHero>

            {/* Search Bar Section */}
            <section className="border-b border-[#E8F5E9] bg-white py-8">
                <div className="bka-container">
                    <div
                        ref={filterRef}
                        className="bka-reveal flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex flex-col gap-1">
                            <h2 className="text-lg font-bold text-[#1A1A1A]">
                                Album Kegiatan
                            </h2>
                            <p className="text-xs text-[#5C6B73]">
                                Menampilkan {filteredAlbums.length} album
                                dokumentasi resmi
                            </p>
                        </div>

                        {/* Premium Search Input */}
                        <div className="relative w-full sm:max-w-xs">
                            <input
                                type="text"
                                placeholder="Cari album kegiatan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-[#DDE5DD] bg-white py-2.5 pr-4 pl-11 text-[14px] text-[#1A1A1A] transition-colors focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] focus:outline-none"
                            />
                            <Search
                                size={18}
                                className="absolute top-1/2 left-4 -translate-y-1/2 text-[#9EAAB2]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Albums Grid Section */}
            <section className="min-h-[400px] flex-1 bg-[#F7F9F7] py-12 md:py-16">
                <div className="bka-container">
                    {filteredAlbums.length > 0 ? (
                        <>
                            <div
                                ref={gridRef}
                                className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                            >
                                {filteredAlbums.map((album, idx) => (
                                    <div
                                        key={album.slug}
                                        className={`bka-reveal bka-stagger-${(idx % 6) + 1} group flex h-full flex-col overflow-hidden rounded-2xl border border-[#DDE5DD] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
                                    >
                                        {/* Cover Image Container */}
                                        <Link
                                            href={`/dokumentasi/${album.slug}`}
                                            className="relative block aspect-video overflow-hidden bg-emerald-50"
                                        >
                                            <img
                                                src={album.cover_url}
                                                alt={album.judul}
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80';
                                                }}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            {/* Photo Count Badge */}
                                            <div className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-lg bg-[#1A1A1A]/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-xs">
                                                <Images
                                                    size={13}
                                                    className="text-[#C8A000]"
                                                />
                                                <span>
                                                    {album.jumlah_foto} Foto
                                                </span>
                                            </div>
                                        </Link>

                                        {/* Text Contents */}
                                        <div className="flex flex-1 flex-col p-5">
                                            {/* Date Info */}
                                            <div className="mb-2.5 flex items-center gap-2 text-xs font-medium text-[#5C6B73]">
                                                <Calendar
                                                    size={13}
                                                    className="text-[#1B5E20]"
                                                />
                                                <span>
                                                    {formatDate(
                                                        album.tanggal_kegiatan,
                                                    )}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="mb-2 line-clamp-2 text-[15px] leading-snug font-bold text-[#1A1A1A] hover:text-[#1B5E20]">
                                                <Link
                                                    href={`/dokumentasi/${album.slug}`}
                                                >
                                                    {album.judul}
                                                </Link>
                                            </h3>

                                            {/* Excerpt */}
                                            {album.deskripsi && (
                                                <p className="mb-4 line-clamp-2 text-[13px] leading-relaxed text-[#5C6B73]">
                                                    {album.deskripsi}
                                                </p>
                                            )}

                                            {/* Action Link */}
                                            <div className="mt-auto border-t border-[#F1F3F1] pt-3">
                                                <Link
                                                    href={`/dokumentasi/${album.slug}`}
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B5E20] transition-colors hover:text-[#145218]"
                                                >
                                                    <span>
                                                        Lihat Foto Album
                                                    </span>
                                                    <ArrowRight
                                                        size={14}
                                                        className="transition-transform group-hover:translate-x-1"
                                                    />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="mt-12 flex justify-center">
                                <Pagination links={dummyPagination} />
                            </div>
                        </>
                    ) : (
                        /* Beautiful Premium Empty State */
                        <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-3xl border border-[#DDE5DD] bg-white px-6 py-20 text-center shadow-xs">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5E9] text-[#1B5E20]">
                                <ImageIcon size={28} />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-[#1A1A1A]">
                                Belum Ada Album
                            </h3>
                            <p className="mb-6 max-w-sm text-sm leading-relaxed text-[#5C6B73]">
                                Kami tidak dapat menemukan album kegiatan dengan
                                kata kunci pencarian Anda. Silakan coba kata
                                kunci lain.
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="rounded-xl bg-[#1B5E20] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#145218]"
                                >
                                    Reset Pencarian
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
