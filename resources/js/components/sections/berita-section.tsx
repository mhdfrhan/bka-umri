import { ArrowRight } from 'lucide-react';
import NewsCard from '@/components/ui/news-card';
import SectionHeader from '@/components/ui/section-header';
import { useScrollReveal, useScrollRevealChildren } from '@/hooks/use-scroll-reveal';

interface NewsItem {
    slug: string;
    thumbnail: string;
    category?: string;
    title: string;
    excerpt: string;
    date: string;
    author?: string;
}

interface BeritaSectionProps {
    beritaList: NewsItem[];
}

export default function BeritaSection({ beritaList }: BeritaSectionProps) {
    const headerRef = useScrollReveal<HTMLDivElement>();
    const gridRef = useScrollRevealChildren<HTMLDivElement>('.bka-reveal');

    if (beritaList.length === 0) {
        return null;
    }

    return (
        <section
            id="berita-terbaru"
            className="bka-section bka-dots-pattern relative"
            style={{ backgroundColor: '#F7F9F7' }}
        >
            <div className="bka-container">
                {/* Header with "Lihat Semua" link */}
                <div
                    ref={headerRef}
                    className="bka-reveal mb-10 flex flex-wrap items-start justify-between gap-4"
                >
                    <SectionHeader
                        label="Berita"
                        title="Informasi Terkini"
                        description="Ikuti perkembangan terbaru seputar kegiatan dan program Biro Keuangan & Aset UMRI."
                    />
                    <a
                        href="/berita"
                        className="group hidden shrink-0 items-center gap-1.5 pt-1 text-sm font-semibold text-[#1B5E20] no-underline transition-all duration-200 hover:gap-2.5 lg:inline-flex"
                    >
                        Lihat Semua
                        <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </a>
                </div>

                {/* News Grid */}
                <div ref={gridRef} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {beritaList.map((item, idx) => (
                        <div
                            key={item.slug}
                            className={`bka-reveal bka-stagger-${idx + 1}`}
                        >
                            <NewsCard {...item} />
                        </div>
                    ))}
                </div>

                {/* Mobile CTA */}
                <div className="mt-9 text-center lg:hidden">
                    <a href="/berita" className="bka-btn-secondary">
                        Lihat Semua Berita
                    </a>
                </div>
            </div>
        </section>
    );
}
