import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
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

    return (
        <>
            <Head title="Pengumuman Resmi - BKA UMRI">
                <meta
                    name="description"
                    content="Daftar pengumuman dan informasi resmi penting dari Biro Keuangan dan Aset Universitas Muhammadiyah Riau."
                />
            </Head>

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
                    <div className="mx-auto max-w-[800px]">
                        {/* Search Bar */}
                        <div className="mb-8 flex justify-end">
                            <form
                                onSubmit={handleSearchSubmit}
                                className="relative w-full md:max-w-[320px]"
                            >
                                <input
                                    type="text"
                                    placeholder="Cari pengumuman..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-[#DDE5DD] bg-white py-3 pr-4 pl-11 text-[14px] text-[#1A1A1A] shadow-sm transition-colors focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] focus:outline-none"
                                />
                                <Search
                                    size={18}
                                    className="absolute top-1/2 left-4 -translate-y-1/2 text-[#9EAAB2]"
                                />
                            </form>
                        </div>

                        {/* List */}
                        <div ref={listRef} className="flex flex-col gap-4">
                            {pengumumans.data.length > 0 ? (
                                pengumumans.data.map((item, idx) => (
                                    <div
                                        key={item.slug}
                                        className={`bka-reveal bka-stagger-${(idx % 6) + 1}`}
                                    >
                                        <AnnouncementItem {...item} />
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-[#DDE5DD] bg-white py-16 text-center text-neutral-400">
                                    Tidak ada pengumuman yang sesuai kata kunci.
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {pengumumans.links && pengumumans.links.length > 3 && (
                            <div className="mt-12">
                                <Pagination links={pengumumans.links} />
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
