import { ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import SectionHeader from '@/components/ui/section-header';
import { useScrollRevealChildren } from '@/hooks/use-scroll-reveal';

interface BidangItem {
    slug: string;
    nama: string;
    deskripsiSingkat: string;
}

interface BidangSectionProps {
    bidangList: BidangItem[];
}

export default function BidangSection({ bidangList }: BidangSectionProps) {
    const gridRef = useScrollRevealChildren<HTMLDivElement>('.bka-reveal');

    if (bidangList.length === 0) {
        return null;
    }

    return (
        <section id="bidang-bagian" className="bka-section bg-white">
            <div className="bka-container">
                <div className="mb-12 text-center">
                    <SectionHeader
                        label="Struktur"
                        title="Bidang & Bagian"
                        description="Kenali lebih dekat setiap bidang yang ada di Biro Keuangan & Aset UMRI."
                        align="center"
                    />
                </div>

                <div ref={gridRef} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {bidangList.map((item, idx) => (
                        <div
                            key={item.slug}
                            className={`bka-reveal bka-stagger-${idx + 1}`}
                        >
                            <div className="group relative overflow-hidden rounded-2xl border border-[#DDE5DD] bg-[#F7F9F7] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#B5C5B5] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                                {/* Number badge */}
                                <span className="absolute top-6 right-6 text-[64px] font-black leading-none text-[#1B5E20]/[0.06]">
                                    {String(idx + 1).padStart(2, '0')}
                                </span>

                                {/* Content */}
                                <div className="relative z-[1]">
                                    <span className="bka-gold-line mb-5" />
                                    <h3 className="mb-3 text-[20px] font-bold leading-snug text-[#1A1A1A]">
                                        {item.nama}
                                    </h3>
                                    <p className="mb-6 max-w-[420px] text-[15px] leading-relaxed text-[#5C6B73]">
                                        {item.deskripsiSingkat}
                                    </p>

                                    <Link
                                        href={`/bidang/${item.slug}`}
                                        className="group/link inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B5E20] no-underline transition-all duration-200 hover:gap-2.5"
                                    >
                                        Lebih Banyak
                                        <ArrowRight
                                            size={16}
                                            className="transition-transform duration-200 group-hover/link:translate-x-0.5"
                                        />
                                    </Link>
                                </div>

                                {/* Decorative accent corner */}
                                <div
                                    aria-hidden="true"
                                    className="absolute bottom-0 right-0 h-24 w-24 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                    style={{
                                        background:
                                            'radial-gradient(circle at 100% 100%, rgba(200,160,0,0.08) 0%, transparent 70%)',
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
