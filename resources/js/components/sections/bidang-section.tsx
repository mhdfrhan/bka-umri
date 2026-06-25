import { Link } from '@inertiajs/react';
import { ArrowRight, Banknote, Package } from 'lucide-react';
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

const getBidangIcon = (slug: string) => {
    const s = slug.toLowerCase();
    if (s.includes('keuangan')) {
        return Banknote;
    }
    if (s.includes('aset') || s.includes('logistik')) {
        return Package;
    }
    return Package;
};

export default function BidangSection({ bidangList }: BidangSectionProps) {
    const gridRef = useScrollRevealChildren<HTMLDivElement>('.bka-reveal');

    if (bidangList.length === 0) {
        return null;
    }

    return (
        <section
            id="bidang-bagian"
            className="bka-section relative overflow-hidden bg-white"
        >
            {/* Background geometric flare */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 -left-40 h-[350px] w-[350px] rounded-full opacity-[0.03] select-none"
                style={{
                    background:
                        'radial-gradient(circle, #0a6c32 0%, transparent 70%)',
                }}
            />

            <div className="bka-container relative z-1">
                <div className="mb-14 text-center">
                    <SectionHeader
                        label="Struktur"
                        title="Bidang & Bagian"
                        description="Kenali lebih dekat setiap bidang operasional di Biro Keuangan & Aset UMRI."
                        align="center"
                    />
                </div>

                <div
                    ref={gridRef}
                    className="grid grid-cols-1 gap-6 lg:grid-cols-3"
                >
                    {bidangList.map((item, idx) => {
                        const Icon = getBidangIcon(item.slug);
                        const isFirst = idx === 0;

                        return (
                            <div
                                key={item.slug}
                                className={`bka-reveal bka-stagger-${idx + 1} ${
                                    isFirst ? 'lg:col-span-2' : 'lg:col-span-1'
                                }`}
                            >
                                <div
                                    className={`group relative flex h-full min-h-[380px] flex-col justify-between overflow-hidden rounded-3xl p-8 transition-all duration-300 lg:p-10 ${
                                        isFirst
                                            ? 'border-none bg-gradient-to-br from-[#0a6c32] to-[#0A3B11] text-white shadow-[0_24px_50px_rgba(10,108,50,0.18)]'
                                            : 'border border-[#DDE5DD] bg-[#FAFBFA] shadow-[0_10px_35px_rgba(0,0,0,0.02)] hover:border-[#B5C5B5]'
                                    } bka-cascade-card`}
                                >
                                    {isFirst && (
                                        <div className="bka-noise-overlay pointer-events-none absolute inset-0 opacity-[0.03]" />
                                    )}

                                    {/* Decorative subtle background gradient corner */}
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute right-0 bottom-0 h-32 w-32 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                        style={{
                                            background: isFirst
                                                ? 'radial-gradient(circle at 100% 100%, rgba(200,160,0,0.15) 0%, transparent 70%)'
                                                : 'radial-gradient(circle at 100% 100%, rgba(10,108,50,0.06) 0%, transparent 70%)',
                                        }}
                                    />

                                    {/* Number Watermark */}
                                    <span
                                        className={`pointer-events-none absolute -right-4 -bottom-6 text-[120px] leading-none font-black transition-transform duration-500 select-none group-hover:scale-105 lg:text-[140px] ${
                                            isFirst
                                                ? 'text-white/[0.04]'
                                                : 'text-[#0a6c32]/[0.04]'
                                        }`}
                                    >
                                        {String(idx + 1).padStart(2, '0')}
                                    </span>

                                    {/* Header Row */}
                                    <div>
                                        <div className="relative z-[2] mb-8 flex items-start justify-between">
                                            <div
                                                className={`rounded-2xl p-3.5 transition-transform duration-300 group-hover:scale-105 ${
                                                    isFirst
                                                        ? 'bg-white/10 text-white'
                                                        : 'bg-[#e6f4ea] text-[#0a6c32]'
                                                }`}
                                            >
                                                <Icon size={28} />
                                            </div>
                                            <span
                                                className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.18em] uppercase ${
                                                    isFirst
                                                        ? 'bg-white/12 text-white/90'
                                                        : 'bg-neutral-200/50 text-neutral-500'
                                                }`}
                                            >
                                                {isFirst
                                                    ? 'Featured Bidang'
                                                    : 'Bidang'}
                                            </span>
                                        </div>

                                        {/* Main Text Content */}
                                        <div className="relative z-[2] mb-8">
                                            <h3
                                                className={`mb-3.5 text-[22px] leading-snug font-bold lg:text-[26px] ${
                                                    isFirst
                                                        ? 'text-white'
                                                        : 'text-[#1A1A1A]'
                                                }`}
                                            >
                                                {item.nama}
                                            </h3>
                                            <p
                                                className={`mb-6 text-[15px] leading-relaxed ${
                                                    isFirst
                                                        ? 'max-w-[560px] text-white/80'
                                                        : 'text-[#5C6B73]'
                                                }`}
                                            >
                                                {item.deskripsiSingkat}
                                            </p>

                                            {/* Sub-features or extra details */}
                                            {isFirst ? (
                                                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-[13.5px] text-white/70 md:grid-cols-2">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-[#C8A000]" />
                                                        Administrasi Pembayaran
                                                        & SPP
                                                    </div>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-[#C8A000]" />
                                                        Penyusunan Rencana
                                                        Anggaran (RAPB)
                                                    </div>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-[#C8A000]" />
                                                        Verifikasi & Transaksi
                                                        Keuangan
                                                    </div>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-[#C8A000]" />
                                                        Pelaporan &
                                                        Akuntabilitas Publik
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-6 flex flex-col gap-2.5 border-t border-neutral-200/60 pt-6 text-[13.5px] text-[#5C6B73]">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-[#C8A000]" />
                                                        Pencatatan &
                                                        Inventarisasi Aset Fisik
                                                    </div>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-[#C8A000]" />
                                                        Pemeliharaan & Logistik
                                                        Sarana Kampus
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Row */}
                                    <div className="relative z-[2] mt-auto">
                                        <Link
                                            href={`/bidang/${item.slug}`}
                                            className={`group/link inline-flex items-center gap-2 text-[14px] font-bold transition-all duration-200 ${
                                                isFirst
                                                    ? 'text-white hover:text-[#C8A000]'
                                                    : 'text-[#0a6c32] hover:text-[#0a6c32]/80'
                                            }`}
                                        >
                                            Selengkapnya
                                            <ArrowRight
                                                size={15}
                                                className="transition-transform duration-200 group-hover/link:translate-x-1"
                                            />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
