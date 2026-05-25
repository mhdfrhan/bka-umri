import { ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import SectionHeader from '@/components/ui/section-header';
import { formatDate } from '@/lib/format-date';
import {
    useScrollReveal,
    useScrollRevealChildren,
} from '@/hooks/use-scroll-reveal';

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

    const featured = beritaList[0];
    const secondary = beritaList.slice(1, 4);

    return (
        <section
            id="berita-terbaru"
            className="bka-section bka-noise-overlay relative overflow-hidden bg-[#FAFBFA]"
        >
            {/* Background geometric mesh decoration */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-150px] bottom-[-150px] h-[350px] w-[350px] rounded-full opacity-[0.04] select-none"
                style={{
                    background:
                        'radial-gradient(circle, #C8A000 0%, transparent 70%)',
                }}
            />

            <div className="bka-container relative z-1">
                {/* Header with "Lihat Semua" link */}
                <div
                    ref={headerRef}
                    className="bka-reveal mb-12 flex flex-wrap items-end justify-between gap-6"
                >
                    <SectionHeader
                        label="Berita"
                        title="Informasi Terkini"
                        description="Ikuti perkembangan terbaru seputar kegiatan dan program Biro Keuangan & Aset UMRI."
                    />
                    <a
                        href="/berita"
                        className="group hidden shrink-0 items-center gap-1.5 text-sm font-bold text-[#1B5E20] no-underline transition-all duration-200 hover:gap-2.5 lg:inline-flex"
                    >
                        Lihat Semua Berita
                        <ArrowRight
                            size={15}
                            className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                    </a>
                </div>

                {/* Asymmetric Editorial Grid */}
                <div
                    ref={gridRef}
                    className="grid grid-cols-1 gap-8 lg:grid-cols-12"
                >
                    {/* Left: Featured News Card (Col Span 7) */}
                    <div className="bka-reveal lg:col-span-7">
                        <Link
                            href={`/berita/${featured.slug}`}
                            className="group bka-featured-card relative block h-full min-h-[380px] overflow-hidden rounded-[24px] shadow-[0_15px_40px_rgba(0,0,0,0.04)] lg:min-h-[440px]"
                            aria-label={`Baca berita utama: ${featured.title}`}
                        >
                            {/* Image Background */}
                            <img
                                src={featured.thumbnail}
                                alt=""
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src =
                                        'https://placehold.co/800x450/E8F5E9/1B5E20?text=BKA+UMRI+Berita';
                                }}
                            />
                            {/* Rich dark overlay */}
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/60 to-transparent transition-opacity duration-300 group-hover:opacity-95"
                            />

                            {/* Content inside overlay */}
                            <div className="absolute inset-0 z-2 flex flex-col justify-end p-6 text-white lg:p-10">
                                {/* Category Badge */}
                                {featured.category && (
                                    <span className="mb-4 self-start rounded bg-[#C8A000] px-2.5 py-0.5 text-[10px] font-bold tracking-[0.1em] text-white uppercase">
                                        {featured.category}
                                    </span>
                                )}

                                {/* Date */}
                                <p className="mb-2.5 text-[11px] font-bold tracking-wide text-white/70 uppercase">
                                    {formatDate(featured.date)}
                                </p>

                                {/* Oversized Title */}
                                <h3 className="mb-4 text-xl leading-snug font-bold tracking-tight transition-colors duration-200 group-hover:text-white/95 lg:text-[23px]">
                                    {featured.title}
                                </h3>

                                {/* Excerpt */}
                                <p className="line-clamp-2 text-[14px] leading-relaxed font-normal text-white/80">
                                    {featured.excerpt}
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Right: Secondary News Cards Stacked (Col Span 5) */}
                    <div className="flex flex-col gap-5 lg:col-span-5">
                        {secondary.length > 0 ? (
                            secondary.map((item, idx) => (
                                <div
                                    key={item.slug}
                                    className={`bka-reveal bka-stagger-${idx + 2}`}
                                >
                                    <Link
                                        href={`/berita/${item.slug}`}
                                        className="group block rounded-2xl border border-[#DDE5DD] bg-white p-4 transition-all duration-300 hover:border-[#B5C5B5] hover:shadow-[0_12px_30px_rgba(27,94,32,0.04)]"
                                        aria-label={`Baca berita: ${item.title}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Thumbnail (100px x 80px equivalent: h-20 w-24) */}
                                            <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                                                <img
                                                    src={item.thumbnail}
                                                    alt=""
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                    onError={(e) => {
                                                        (
                                                            e.currentTarget as HTMLImageElement
                                                        ).src =
                                                            'https://placehold.co/150x120/E8F5E9/1B5E20?text=Berita';
                                                    }}
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    {/* Accent indicator */}
                                                    <div className="h-1.5 w-1.5 rounded-full bg-[#1B5E20]" />
                                                    <span className="text-[10px] font-extrabold tracking-[0.05em] text-[#9EAAB2] uppercase">
                                                        {item.category ||
                                                            'Berita'}
                                                    </span>
                                                    <span className="text-[10px] text-[#9EAAB2]">
                                                        |
                                                    </span>
                                                    <span className="text-[10px] text-[#9EAAB2]">
                                                        {formatDate(item.date)}
                                                    </span>
                                                </div>

                                                <h4 className="line-clamp-2 text-[14.5px] leading-snug font-bold text-[#1A1A1A] transition-colors duration-200 group-hover:text-[#1B5E20]">
                                                    {item.title}
                                                </h4>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-[#DDE5DD] p-8 text-center text-sm text-[#9EAAB2]">
                                Tidak ada berita tambahan.
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile CTA */}
                <div className="mt-10 text-center lg:hidden">
                    <a
                        href="/berita"
                        className="bka-btn-secondary w-full max-w-[280px]"
                    >
                        Lihat Semua Berita
                    </a>
                </div>
            </div>
        </section>
    );
}
