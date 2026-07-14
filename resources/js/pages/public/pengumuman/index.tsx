import { Seo } from '@/components/seo';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { Search, ArrowRight, PhoneCall, MessageSquare, FileText, Download } from 'lucide-react';
import { useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHero } from '@/components/layout/page-hero';
import AnnouncementItem from '@/components/ui/announcement-item';
import { Pagination } from '@/components/ui/pagination';
import {
    useScrollReveal,
    useScrollRevealChildren,
} from '@/hooks/use-scroll-reveal';

interface PengumumanItem {
    slug: string;
    title: string;
    date: string;
    isPenting?: boolean;
    excerpt?: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedPengumumans {
    data: PengumumanItem[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

interface PengumumanIndexProps {
    pengumumans: PaginatedPengumumans;
    filters: {
        search: string;
    };
}

export default function PengumumanIndex({
    pengumumans,
    filters,
}: PengumumanIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState<'semua' | 'penting' | 'umum'>('semua');
    const { pengaturan } = usePage().props as any;

    const heroRef = useScrollReveal<HTMLDivElement>();
    const listRef = useScrollRevealChildren<HTMLDivElement>('.bka-reveal');

    const breadcrumbItems = [
        { title: 'Beranda', href: '/' },
        { title: 'Pengumuman Resmi', href: '/pengumuman' },
    ];

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/pengumuman',
            { search: searchQuery },
            { preserveState: true, preserveScroll: true },
        );
    };

    // Filter announcements based on active tab
    const filteredData = pengumumans.data.filter((item) => {
        if (activeTab === 'penting') {
            return item.isPenting;
        }

        if (activeTab === 'umum') {
            return !item.isPenting;
        }

        return true;
    });

    const featuredItem = filteredData[0];
    const remainingItems = filteredData.slice(1);

    return (
        <>
            <Seo title="Pengumuman Resmi - BKA UMRI" description="Daftar pengumuman dan informasi resmi penting dari Biro Keuangan dan Aset Universitas Muhammadiyah Riau." />

            {/* Hero Section */}
            <PageHero
                title="Pengumuman Resmi"
                description="Informasi administrasi, jadwal registrasi, dan pemberitahuan penting lainnya."
            >
                <div ref={heroRef} className="bka-reveal">
                    <Breadcrumbs
                        breadcrumbs={breadcrumbItems}
                        variant="public"
                    />
                </div>
            </PageHero>

            <section className="bg-[#F7F9F7] py-12 md:py-16">
                <div className="bka-container">
                    {/* Grid Layout (Main Content + Sidebar) */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
                        
                        {/* Left Column: Feed & Tabs */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            
                            {/* Mobile Search Bar (Visible only on smaller screens) */}
                            <div className="block lg:hidden">
                                <form onSubmit={handleSearchSubmit} className="relative w-full">
                                    <input
                                        type="text"
                                        placeholder="Cari pengumuman..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-2xl border border-[#DDE5DD] bg-white py-3.5 pr-4 pl-12 text-[14px] text-[#1A1A1A] shadow-sm transition-all focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32] focus:outline-none"
                                    />
                                    <Search size={18} className="absolute top-1/2 left-4.5 -translate-y-1/2 text-[#9EAAB2]" />
                                </form>
                            </div>

                            {/* Tab Filters */}
                            <div className="flex flex-wrap items-center gap-1.5 border-b border-[#DDE5DD] pb-4">
                                <button
                                    onClick={() => setActiveTab('semua')}
                                    className={`px-4.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                                        activeTab === 'semua'
                                            ? 'bg-[#0a6c32] text-white shadow-sm'
                                            : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                                    }`}
                                >
                                    Semua Pengumuman
                                </button>
                                <button
                                    onClick={() => setActiveTab('penting')}
                                    className={`inline-flex items-center gap-1.5 px-4.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                                        activeTab === 'penting'
                                            ? 'bg-[#C62828] text-white shadow-sm'
                                            : 'text-neutral-500 hover:bg-red-50 hover:text-[#C62828]'
                                    }`}
                                >
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-600"></span>
                                    </span>
                                    Penting & Urgent
                                </button>
                                <button
                                    onClick={() => setActiveTab('umum')}
                                    className={`px-4.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                                        activeTab === 'umum'
                                            ? 'bg-[#c8a000] text-white shadow-sm'
                                            : 'text-neutral-500 hover:bg-amber-50 hover:text-[#9A6F00]'
                                    }`}
                                >
                                    Pemberitahuan Umum
                                </button>
                            </div>

                            {/* Announcement Feed */}
                            <div ref={listRef} className="flex flex-col gap-6">
                                {filteredData.length > 0 ? (
                                    <div className="flex flex-col gap-6">
                                        {/* Highlighted/Featured Card */}
                                        {featuredItem && (
                                            <div className="bka-reveal bka-stagger-1">
                                                <Link
                                                    href={`/pengumuman/${featuredItem.slug}`}
                                                    className="group block no-underline"
                                                >
                                                    <div className={`relative overflow-hidden rounded-3xl border bg-white p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.01)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(10,108,50,0.06)] ${
                                                        featuredItem.isPenting 
                                                            ? 'bg-gradient-to-br from-red-50/20 via-white to-white border-red-200 hover:border-red-300 shadow-[0_4px_20px_rgba(198,40,40,0.02)]' 
                                                            : 'border-[#DDE5DD] hover:border-[#0a6c32]/30'
                                                    }`}>
                                                        {/* Mesh Light Glow Decoration */}
                                                        <div className="absolute -right-24 -bottom-24 w-72 h-72 rounded-full bg-[#e6f4ea] opacity-40 blur-3xl pointer-events-none" />

                                                        <div className="relative z-10">
                                                            <div className="mb-4.5 flex items-center gap-3">
                                                                {featuredItem.isPenting ? (
                                                                    <span className="inline-flex items-center gap-1 rounded bg-[#FFEAE5] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#C62828] border border-red-100">
                                                                        <span className="relative flex h-1.5 w-1.5">
                                                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                                                                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-600"></span>
                                                                        </span>
                                                                        Penting & Urgent
                                                                    </span>
                                                                ) : (
                                                                    <span className="rounded bg-[#e6f4ea] px-3 py-1 text-[10px] font-black tracking-wider uppercase text-[#0a6c32] border border-emerald-100">
                                                                        Sorotan Utama
                                                                    </span>
                                                                )}
                                                                <span className="text-xs font-semibold text-neutral-400">
                                                                    {featuredItem.date}
                                                                </span>
                                                            </div>

                                                            <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A] leading-snug group-hover:text-[#0a6c32] transition-colors duration-200">
                                                                {featuredItem.title}
                                                            </h2>

                                                            {featuredItem.excerpt && (
                                                                <p className="mt-3.5 text-sm leading-relaxed text-[#5C6B73] font-normal line-clamp-3">
                                                                    {featuredItem.excerpt}
                                                                </p>
                                                            )}

                                                            <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0a6c32] uppercase tracking-widest group-hover:text-[#c8a000] transition-colors">
                                                                Lihat Selengkapnya
                                                                <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1 stroke-[2.5]" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        )}

                                        {/* Staggered Remaining Cards Grid */}
                                        {remainingItems.length > 0 && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {remainingItems.map((item, idx) => (
                                                    <div
                                                        key={item.slug}
                                                        className={`bka-reveal bka-stagger-${(idx % 4) + 2}`}
                                                    >
                                                        <AnnouncementItem {...item} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-3xl border border-[#DDE5DD] bg-white py-20 text-center text-neutral-400 font-medium shadow-[0_4px_15px_rgba(0,0,0,0.01)]">
                                        Tidak ada pengumuman yang sesuai kategori atau kata kunci.
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {pengumumans.links && pengumumans.links.length > 3 && (
                                <div className="mt-8">
                                    <Pagination links={pengumumans.links} />
                                </div>
                            )}
                        </div>

                        {/* Right Column: Sticky Sidebar */}
                        <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-28">
                            
                            {/* Desktop Search Card */}
                            <div className="hidden lg:block bg-white rounded-3xl border border-[#DDE5DD] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.01)]">
                                <h3 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest mb-3">Cari Informasi</h3>
                                <form onSubmit={handleSearchSubmit} className="relative w-full">
                                    <input
                                        type="text"
                                        placeholder="Kata kunci pengumuman..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-2xl border border-[#DDE5DD] bg-white py-3 pr-4 pl-11 text-[13px] text-[#1A1A1A] shadow-xs transition-all focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32] focus:outline-none"
                                    />
                                    <Search size={16} className="absolute top-1/2 left-4 -translate-y-1/2 text-[#9EAAB2]" />
                                </form>
                            </div>

                            {/* Help Center (WhatsApp) Care Widget */}
                            <div className="bg-gradient-to-br from-[#0a6c32] via-[#085627] to-[#04411d] rounded-3xl p-6 text-white shadow-[0_15px_30px_rgba(10,108,50,0.12)] border border-white/5 relative overflow-hidden">
                                <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-[#E8C840] opacity-10 blur-2xl pointer-events-none" />
                                
                                <div className="relative z-10">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10 text-[#E8C840] mb-4 shadow-inner">
                                        <PhoneCall size={18} className="stroke-[2.5]" />
                                    </div>
                                    <h3 className="text-base font-extrabold mb-1.5 leading-snug">Butuh Layanan Bantuan?</h3>
                                    <p className="text-xs text-white/75 leading-relaxed mb-5">
                                        Ada kendala registrasi keuangan mahasiswa, Virtual Account bank, atau bebas keuangan? Hubungi layanan Care Desk BKA.
                                    </p>
                                    <a
                                        href={`https://wa.me/${(pengaturan?.telepon || '').includes('/') ? (pengaturan?.telepon || '').split('/')[1].replace(/\D/g, '') : (pengaturan?.telepon || '628117676000').replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-white text-[#0a6c32] text-xs font-black tracking-wider uppercase shadow-md transition-all duration-300 hover:bg-[#E8C840] hover:text-[#0a6c32] hover:scale-102 active:scale-98"
                                    >
                                        <MessageSquare size={14} className="stroke-[2.5]" />
                                        WhatsApp Care BKA
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
}

