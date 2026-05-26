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
    filters: {
        search: string;
        kategori: string;
    };
}

export default function BeritaIndex({
    beritas,
    categories = [],
    filters,
}: BeritaIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeCategory, setActiveCategory] = useState(
        filters.kategori || 'Semua',
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
            { search: searchQuery, kategori: cat },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/berita',
            { search: searchQuery, kategori: activeCategory },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Berita & Informasi - BKA UMRI">
                <meta
                    name="description"
                    content="Kumpulan berita dan informasi terbaru dari Biro Keuangan dan Aset Universitas Muhammadiyah Riau."
                />
            </Head>

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
            <section className="border-b border-[#E8F5E9] bg-white pt-10 pb-6">
                <div className="bka-container">
                    <div
                        ref={filterRef}
                        className="bka-reveal flex flex-col gap-5 md:flex-row md:items-center md:justify-between"
                    >
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                                        activeCategory === cat
                                            ? 'bg-[#1B5E20] text-white shadow-md'
                                            : 'bg-[#F7F9F7] text-[#5C6B73] hover:bg-[#E8F5E9] hover:text-[#1B5E20]'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative w-full md:max-w-xs"
                        >
                            <input
                                type="text"
                                placeholder="Cari berita..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-[#DDE5DD] bg-white py-2.5 pr-4 pl-11 text-[14px] text-[#1A1A1A] transition-colors focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] focus:outline-none"
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
