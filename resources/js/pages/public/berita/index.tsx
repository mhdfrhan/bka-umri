import { Seo } from '@/components/seo';
import { Head, router } from '@inertiajs/react';
import { Search, Newspaper } from 'lucide-react';
import { useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHero } from '@/components/layout/page-hero';
import NewsCard from '@/components/ui/news-card';
import { Pagination } from '@/components/ui/pagination';
import {
    useScrollReveal,
    useScrollRevealChildren,
} from '@/hooks/use-scroll-reveal';

interface NewsItem {
    id?: number;
    slug: string;
    thumbnail: string;
    category?: string;
    title: string;
    excerpt: string;
    date: string;
    author?: string;
    bidang?: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedBeritas {
    data: NewsItem[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

interface BeritaIndexProps {
    beritas: PaginatedBeritas;
    categories: string[];
    bidangs: string[];
    filters: {
        search: string;
        kategori: string;
        bidang: string;
    };
}

export default function BeritaIndex({
    beritas,
    categories = [],
    bidangs = [],
    filters,
}: BeritaIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeCategory, setActiveCategory] = useState(
        filters.kategori || 'Semua',
    );
    const [activeBidang, setActiveBidang] = useState(
        filters.bidang || 'Semua',
    );

    const heroRef = useScrollReveal<HTMLDivElement>();
    const filterRef = useScrollReveal<HTMLDivElement>();
    const gridRef = useScrollRevealChildren<HTMLDivElement>('.bka-reveal');

    const breadcrumbItems = [
        { title: 'Beranda', href: '/' },
        { title: 'Berita & Informasi', href: '/berita' },
    ];

    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat);
        router.get(
            '/berita',
            { search: searchQuery, kategori: cat, bidang: activeBidang },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleBidangChange = (bid: string) => {
        setActiveBidang(bid);
        router.get(
            '/berita',
            { search: searchQuery, kategori: activeCategory, bidang: bid },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/berita',
            { search: searchQuery, kategori: activeCategory, bidang: activeBidang },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Seo title="Berita & Informasi - BKA UMRI" description="Kumpulan berita dan informasi terbaru dari Biro Keuangan dan Aset Universitas Muhammadiyah Riau." />

            {/* Hero Section */}
            <PageHero
                title="Berita & Informasi"
                description="Ikuti perkembangan, kegiatan, dan liputan terbaru dari Biro Keuangan & Aset UMRI."
            >
                <div ref={heroRef} className="bka-reveal">
                    <Breadcrumbs
                        breadcrumbs={breadcrumbItems}
                        variant="public"
                    />
                </div>
            </PageHero>

            {/* Filter & Search */}
            <section className="border-b border-[#e6f4ea] bg-white pt-10 pb-6">
                <div className="bka-container">
                    <div
                        ref={filterRef}
                        className="bka-reveal flex flex-col gap-5 md:flex-row md:items-start md:justify-between"
                    >
                        {/* Filters (Categories & Bidang) */}
                        <div className="flex flex-col gap-4">
                            {/* Categories */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-sm font-semibold text-neutral-400 mr-2 uppercase tracking-wider text-xs">Kategori:</span>
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryChange(cat)}
                                        className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                                            activeCategory === cat
                                                ? 'bg-[#0a6c32] text-white shadow-md'
                                                : 'bg-[#F7F9F7] text-[#5C6B73] hover:bg-[#e6f4ea] hover:text-[#0a6c32]'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Bidangs */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-sm font-semibold text-neutral-400 mr-2 uppercase tracking-wider text-xs">Bidang:</span>
                                {bidangs.map((bid) => (
                                    <button
                                        key={bid}
                                        onClick={() => handleBidangChange(bid)}
                                        className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                                            activeBidang === bid
                                                ? 'bg-[#0a6c32] text-white shadow-md'
                                                : 'bg-[#F7F9F7] text-[#5C6B73] hover:bg-[#e6f4ea] hover:text-[#0a6c32]'
                                        }`}
                                    >
                                        {bid}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search Bar */}
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative w-full md:max-w-xs md:mt-2"
                        >
                            <input
                                type="text"
                                placeholder="Cari berita..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-[#DDE5DD] bg-white py-2.5 pr-4 pl-11 text-[14px] text-[#1A1A1A] transition-colors focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32] focus:outline-none"
                            />
                            <Search
                                size={18}
                                className="absolute top-1/2 left-4 -translate-y-1/2 text-[#9EAAB2]"
                            />
                        </form>
                    </div>
                </div>
            </section>

            {/* News Grid */}
            <section className="bka-section bg-[#F7F9F7]">
                <div className="bka-container">
                    <div
                        ref={gridRef}
                        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {beritas.data.map((item, idx) => (
                            <div
                                key={item.slug}
                                className={`bka-reveal bka-stagger-${(idx % 6) + 1}`}
                            >
                                <NewsCard {...item} />
                            </div>
                        ))}
                    </div>

                    {beritas.data.length === 0 && (
                        <div className="py-16 text-center">
                            <Newspaper className="mx-auto mb-3 size-12 text-neutral-300" />
                            <h3 className="text-lg font-bold text-neutral-800">
                                Belum Ada Berita
                            </h3>
                            <p className="mt-1 text-sm text-neutral-400">
                                Tidak ada berita terpublikasi yang cocok dengan
                                pencarian Anda.
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {beritas.links && beritas.links.length > 3 && (
                        <div className="mt-14">
                            <Pagination links={beritas.links} />
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
