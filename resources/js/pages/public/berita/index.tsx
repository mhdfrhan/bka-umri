import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, Newspaper } from 'lucide-react';
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
    status?: string;
}

// ─── Dummy Data fallback ───
const dummyNews: NewsItem[] = [
    {
        slug: 'bka-luncurkan-sistem-keuangan-baru-2026',
        thumbnail:
            'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
        category: 'Layanan',
        title: 'BKA UMRI Luncurkan Portal Keuangan Terintegrasi untuk Mahasiswa',
        excerpt:
            'Mulai semester ganjil ini, seluruh layanan administrasi keuangan dan pembayaran kuliah diintegrasikan dalam satu sistem online untuk mempermudah civitas akademika.',
        date: '20 Mei 2026',
        author: 'Admin BKA',
    },
    {
        slug: 'workshop-pengelolaan-aset-muhammadiyah',
        thumbnail:
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
        category: 'Kegiatan',
        title: 'Workshop Sinergi & Optimalisasi Aset Kampus bersama Wilayah Muhammadiyah',
        excerpt:
            'Biro Keuangan dan Aset UMRI menggelar workshop intensif membahas standarisasi pencatatan dan optimalisasi sarana fisik guna mencapai predikat kampus unggul.',
        date: '15 Mei 2026',
        author: 'Humas UMRI',
    },
    {
        slug: 'sosialisasi-pembayaran-mitra-perbankan',
        thumbnail:
            'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80',
        category: 'Mitra',
        title: 'Perluas Akses, UMRI Jalin Kerja Kerja Sama dengan 4 Bank Rekanan Baru',
        excerpt:
            'Kini mahasiswa dapat melakukan pembayaran SPP dan uang pembangunan melalui jaringan ATM, M-Banking, maupun teller di empat bank mitra resmi nasional.',
        date: '10 Mei 2026',
        author: 'Bagian Keuangan',
    },
    {
        slug: 'audit-keuangan-tahunan-berjalan-lancar',
        thumbnail:
            'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80',
        category: 'Prestasi',
        title: 'Audit Keuangan Tahunan Berjalan Lancar, BKA Pertahankan Kinerja Positif',
        excerpt:
            'Tim audit independen menyelesaikan pemeriksaan keuangan tahunan dan menyatakan BKA UMRI berhasil mempertahankan transparansi serta akuntabilitas.',
        date: '05 Mei 2026',
        author: 'Tim BKA',
    },
    {
        slug: 'pembaruan-sop-pengadaan-barang',
        thumbnail:
            'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
        category: 'Aturan',
        title: 'Pembaruan SOP Pengadaan Barang dan Jasa di Lingkungan UMRI',
        excerpt:
            'Untuk mempercepat proses pengadaan, BKA merilis SOP terbaru yang memangkas birokrasi tanpa mengurangi pengawasan.',
        date: '28 April 2026',
        author: 'Bagian Aset',
    },
    {
        slug: 'pelatihan-software-akuntansi-staf',
        thumbnail:
            'https://images.unsplash.com/photo-1531496730074-83b638c0a7ac?w=600&q=80',
        category: 'Kegiatan',
        title: 'Pelatihan Software Akuntansi Baru bagi Seluruh Staf Keuangan',
        excerpt:
            'Guna meningkatkan efisiensi kerja, BKA menyelenggarakan pelatihan intensif penggunaan software ERP keuangan terbaru.',
        date: '20 April 2026',
        author: 'Divisi SDM',
    },
];

const dummyCategories = [
    'Semua',
    'Kegiatan',
    'Layanan',
    'Mitra',
    'Prestasi',
    'Aturan',
];

export default function BeritaIndex() {
    const [news, setNews] = useState<NewsItem[]>(dummyNews);
    const [categories, setCategories] = useState<string[]>(dummyCategories);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Semua');

    const heroRef = useScrollReveal<HTMLDivElement>();
    const filterRef = useScrollReveal<HTMLDivElement>();
    const gridRef = useScrollRevealChildren<HTMLDivElement>('.bka-reveal');

    // Parse dynamic page from url params
    const pageParam =
        typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('page')
            : '1';
    const currentPage = parseInt(pageParam || '1', 10);
    const itemsPerPage = 9;

    // Load data from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedNews = localStorage.getItem('bka_berita');
            if (savedNews) {
                try {
                    const parsed = JSON.parse(savedNews);
                    // Filter: only show published articles (status === 'terpublikasi')
                    const published = parsed.filter(
                        (n: any) => n.status === 'terpublikasi',
                    );
                    setNews(published);
                } catch {
                    setNews(dummyNews);
                }
            }

            const savedCats = localStorage.getItem('bka_categories');
            if (savedCats) {
                try {
                    setCategories(['Semua', ...JSON.parse(savedCats)]);
                } catch {
                    setCategories(dummyCategories);
                }
            }
        }
    }, []);

    // Filter Logic
    const filteredNews = (news || []).filter((item) => {
        if (!item) return false;
        const titleText = item.title || '';
        const excerptText = item.excerpt || '';
        const matchesSearch =
            titleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
            excerptText.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
            activeCategory === 'Semua' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    // Pagination Calculation
    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const paginatedNews = filteredNews.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const paginationLinks = [
        {
            url: currentPage > 1 ? `?page=${currentPage - 1}` : null,
            label: 'Prev',
            active: false,
        },
        ...Array.from({ length: totalPages }).map((_, idx) => ({
            url: `?page=${idx + 1}`,
            label: String(idx + 1),
            active: currentPage === idx + 1,
        })),
        {
            url: currentPage < totalPages ? `?page=${currentPage + 1}` : null,
            label: 'Next',
            active: false,
        },
    ];

    return (
        <>
            <Head title="Berita & Informasi - BKA UMRI">
                <meta
                    name="description"
                    content="Kumpulan berita dan informasi terbaru dari Biro Keuangan dan Aset Universitas Muhammadiyah Riau."
                />
            </Head>

            {/* Hero Section */}
            <section className="relative flex min-h-[220px] items-center justify-center overflow-hidden bg-[#0D3B11] md:min-h-[280px]">
                <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 20% 150%, #C8A000 0%, transparent 50%), radial-gradient(circle at 80% -50%, #1B5E20 0%, transparent 50%)',
                    }}
                />
                <div
                    ref={heroRef}
                    className="bka-reveal bka-container relative z-[1] py-12 text-center"
                >
                    <h1
                        className="mx-auto max-w-[720px] leading-[1.2] font-bold text-white"
                        style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
                    >
                        Berita & Informasi
                    </h1>
                    <p className="mx-auto mt-4 max-w-[600px] text-[15px] leading-relaxed text-white/80 md:text-[16px]">
                        Ikuti perkembangan, kegiatan, dan liputan terbaru dari
                        Biro Keuangan & Aset UMRI.
                    </p>
                    <span className="bka-gold-line bka-gold-line-center mt-6" />
                </div>
            </section>

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
                                    onClick={() => {
                                        setActiveCategory(cat);
                                        // Reset current page on filter change
                                        if (typeof window !== 'undefined') {
                                            router.visit(`?page=1`, {
                                                preserveScroll: true,
                                            });
                                        }
                                    }}
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
                        <div className="relative w-full md:max-w-xs">
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
                        </div>
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
                        {paginatedNews.map((item, idx) => (
                            <div
                                key={item.slug}
                                className={`bka-reveal bka-stagger-${(idx % 6) + 1}`}
                            >
                                <NewsCard {...item} />
                            </div>
                        ))}
                    </div>

                    {filteredNews.length === 0 && (
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
                    {totalPages > 1 && (
                        <div className="mt-14">
                            <Pagination links={paginationLinks} />
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
