import { Seo } from '@/components/seo';
import { Head, Link, router } from '@inertiajs/react';
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
    kategori?: string;
}

interface PaginatedAlbums {
    data: AlbumItem[];
    links: any[];
}

interface DokumentasiIndexProps {
    albums: PaginatedAlbums;
    categories: string[];
    filters: {
        search?: string;
        category?: string;
    };
}

export default function DokumentasiIndex({
    albums,
    categories = [],
    filters,
}: DokumentasiIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeCategory, setActiveCategory] = useState(
        filters.category || 'Semua',
    );

    const heroRef = useScrollReveal<HTMLDivElement>();
    const filterRef = useScrollReveal<HTMLDivElement>();
    const gridRef = useScrollRevealChildren<HTMLDivElement>('.bka-reveal');

    // Debounce search query updates
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters.search || '')) {
                router.get(
                    '/dokumentasi',
                    {
                        search: searchQuery,
                        category: activeCategory,
                    },
                    {
                        preserveState: true,
                        replace: true,
                    },
                );
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat);
        router.get(
            '/dokumentasi',
            {
                search: searchQuery,
                category: cat,
            },
            {
                preserveState: true,
            },
        );
    };

    const breadcrumbItems = [
        { title: 'Beranda', href: '/' },
        { title: 'Dokumentasi', href: '/dokumentasi' },
    ];

    const albumList = albums?.data || [];

    return (
        <>
            <Seo title="Galeri Dokumentasi Kegiatan - BKA UMRI" description="Kumpulan dokumentasi foto kegiatan, rapat kerja, sosialisasi, dan arsip visual Biro Keuangan dan Aset Universitas Muhammadiyah Riau." />

            <PageHero
                title="Galeri Dokumentasi"
                description="Arsip visual dan kumpulan dokumentasi berbagai agenda serta kegiatan resmi Biro Keuangan & Aset UMRI."
            >
                <div ref={heroRef} className="bka-reveal">
                    <Breadcrumbs
                        breadcrumbs={breadcrumbItems}
                        variant="public"
                    />
                </div>
            </PageHero>

            <section className="border-b border-[#e6f4ea] bg-white py-8">
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
                                Menampilkan {albumList.length} album dokumentasi
                                resmi
                            </p>
                        </div>

                        <div className="relative w-full sm:max-w-xs">
                            <input
                                type="text"
                                placeholder="Cari album kegiatan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-[#DDE5DD] bg-white py-2.5 pr-4 pl-11 text-[14px] text-[#1A1A1A] transition-colors focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32] focus:outline-none"
                            />
                            <Search
                                size={18}
                                className="absolute top-1/2 left-4 -translate-y-1/2 text-[#9EAAB2]"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2 border-t border-[#F1F3F1] pt-5">
                        <button
                            onClick={() => handleCategoryChange('Semua')}
                            className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition-all ${
                                activeCategory === 'Semua'
                                    ? 'bg-[#0a6c32] text-white shadow-xs'
                                    : 'border border-[#DDE5DD] bg-[#F7F9F7] text-[#5C6B73] hover:bg-[#e6f4ea] hover:text-[#0a6c32]'
                            }`}
                        >
                            Semua
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition-all ${
                                    activeCategory === cat
                                        ? 'bg-[#0a6c32] text-white shadow-xs'
                                        : 'border border-[#DDE5DD] bg-[#F7F9F7] text-[#5C6B73] hover:bg-[#e6f4ea] hover:text-[#0a6c32]'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="min-h-[400px] flex-1 bg-[#F7F9F7] py-12 md:py-16">
                <div className="bka-container">
                    {albumList.length > 0 ? (
                        <>
                            <div
                                ref={gridRef}
                                className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                            >
                                {albumList.map((album, idx) => (
                                    <div
                                        key={album.slug}
                                        className={`bka-reveal bka-stagger-${(idx % 6) + 1} group flex h-full flex-col overflow-hidden rounded-2xl border border-[#DDE5DD] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
                                    >
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
                                            <div className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-lg bg-[#1A1A1A]/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-xs">
                                                <Images
                                                    size={13}
                                                    className="text-[#C8A000]"
                                                />
                                                <span>
                                                    {album.jumlah_foto} Foto
                                                </span>
                                            </div>
                                            <div
                                                className={`absolute top-3 left-3 rounded-lg px-2.5 py-1 text-[10px] font-extrabold text-white shadow-xs backdrop-blur-xs ${
                                                    album.kategori === 'Aset'
                                                        ? 'bg-[#C8A000]'
                                                        : 'bg-[#0a6c32]'
                                                }`}
                                            >
                                                {album.kategori}
                                            </div>
                                        </Link>

                                        <div className="flex flex-1 flex-col p-5">
                                            <div className="mb-2.5 flex items-center gap-2 text-xs font-medium text-[#5C6B73]">
                                                <Calendar
                                                    size={13}
                                                    className="text-[#0a6c32]"
                                                />
                                                <span>
                                                    {formatDate(
                                                        album.tanggal_kegiatan,
                                                    )}
                                                </span>
                                            </div>

                                            <h3 className="mb-2 line-clamp-2 text-[15px] leading-snug font-bold text-[#1A1A1A] hover:text-[#0a6c32]">
                                                <Link
                                                    href={`/dokumentasi/${album.slug}`}
                                                >
                                                    {album.judul}
                                                </Link>
                                            </h3>

                                            {album.deskripsi && (
                                                <p className="mb-4 line-clamp-2 text-[13px] leading-relaxed text-[#5C6B73]">
                                                    {album.deskripsi}
                                                </p>
                                            )}

                                            <div className="mt-auto border-t border-[#F1F3F1] pt-3">
                                                <Link
                                                    href={`/dokumentasi/${album.slug}`}
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0a6c32] transition-colors hover:text-[#085627]"
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

                            <div className="mt-12 flex justify-center">
                                <Pagination links={albums.links} />
                            </div>
                        </>
                    ) : (
                        <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-6 py-20 text-center text-[#5C6B73]">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f4ea] text-[#0a6c32]">
                                <ImageIcon size={28} />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-[#1A1A1A]">
                                Belum Ada Album
                            </h3>
                            <p className="mb-6 max-w-sm text-sm leading-relaxed text-[#5C6B73]">
                                Kami tidak dapat menemukan album kegiatan dengan
                                kata kunci atau kategori yang Anda pilih.
                            </p>
                            {(searchQuery || activeCategory !== 'Semua') && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        handleCategoryChange('Semua');
                                    }}
                                    className="rounded-xl bg-[#0a6c32] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#085627]"
                                >
                                    Reset Filter & Pencarian
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
