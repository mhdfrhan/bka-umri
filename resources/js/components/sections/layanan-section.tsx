import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, CreditCard, Landmark } from 'lucide-react';
import SectionHeader from '@/components/ui/section-header';
import {
    useScrollReveal,
    useScrollRevealChildren,
} from '@/hooks/use-scroll-reveal';

interface LayananItem {
    icon: LucideIcon;
    title: string;
    description: string;
}

interface LayananSectionProps {
    title: string;
    description?: string;
    layananList: LayananItem[];
    youtubeEmbedUrl?: string;
}

const defaultLayanan: LayananItem[] = [
    {
        icon: CheckCircle2,
        title: 'Sistemasi Administrasi Keuangan',
        description:
            'Kepengurusan pembayaran tidak perlu membawa kertas/berkas lagi, semua sudah tercatat dalam sistem online.',
    },
    {
        icon: CreditCard,
        title: 'Pembayaran Uang Kuliah Online Maupun Di Kampus',
        description:
            'Kami memberi keleluasaan pembayaran instan via online maupun langsung datang ke kampus melalui teller Bank rekanan.',
    },
    {
        icon: Landmark,
        title: 'Pilihan Bank Rekanan',
        description:
            'Pembayaran online bisa dibayarkan melalui banyak pilihan bank rekanan yang tersebar di pelosok daerah.',
    },
];

const getCardBgClass = (idx: number) => {
    switch (idx % 3) {
        case 0:
            return 'bg-[#1B5E20]';
        case 1:
            return 'bg-[#2E7D46]';
        default:
            return 'bg-[#43A060]';
    }
};

export default function LayananSection({
    title = 'Layanan Biro Keuangan dan Aset',
    description = 'BKA memahami kemudahan transaksi adalah penting. Untuk itu, kami memfasilitasi kemudahan transaksi keuangan melalui beberapa hal berikut.',
    layananList = defaultLayanan,
    youtubeEmbedUrl = 'https://www.youtube.com/embed/4SI1Q-JkVm8?si=aSmMt81oihsA4yLQ',
}: LayananSectionProps) {
    const leftRef = useScrollRevealChildren<HTMLDivElement>('.bka-reveal');
    const videoRef = useScrollReveal<HTMLDivElement>();

    if (layananList.length === 0) {
        return null;
    }

    const hasVideo = !!youtubeEmbedUrl;

    return (
        <section
            id="layanan-bka"
            className="bka-section bka-noise-overlay relative bg-[#F0F7F0]/80"
        >
            <div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                aria-hidden="true"
            >
                <div
                    className="pointer-events-none absolute top-[10%] right-[-200px] h-[400px] w-[400px] rounded-full opacity-[0.06]"
                    style={{
                        background:
                            'radial-gradient(circle, #C8A000 0%, transparent 70%)',
                    }}
                />
            </div>

            <div className="bka-container">
                <div
                    className={`grid grid-cols-1 items-start gap-12 ${
                        hasVideo
                            ? 'lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_480px]'
                            : ''
                    }`}
                >
                    {/* Left: Header + Layanan items */}
                    <div ref={leftRef}>
                        <div className="bka-reveal mb-8">
                            <SectionHeader
                                label="Layanan"
                                title={title}
                                description={description}
                            />
                        </div>

                        <div className="flex flex-col gap-6 lg:pb-12">
                            {layananList.map((item, idx) => {
                                const Icon = item.icon || CheckCircle2;
                                const bgClass = getCardBgClass(idx);
                                const translateYClass =
                                    idx === 0
                                        ? 'lg:translate-y-0'
                                        : idx === 1
                                          ? 'lg:translate-y-4'
                                          : 'lg:translate-y-8';

                                return (
                                    <div
                                        key={item.title}
                                        className={`bka-reveal bka-stagger-${idx + 2} ${translateYClass}`}
                                    >
                                        <div
                                            className={`group flex items-start gap-5 rounded-2xl p-6 transition-all duration-300 ${bgClass} bka-cascade-card shadow-[0_12px_35px_rgba(27,94,32,0.12)]`}
                                        >
                                            {/* Icon */}
                                            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/12 text-white ring-4 ring-white/8 transition-all duration-300 group-hover:scale-105 group-hover:bg-white/20">
                                                <Icon size={26} />
                                            </span>

                                            {/* Text */}
                                            <div className="min-w-0 flex-1">
                                                <h3 className="mb-2 text-[17px] leading-snug font-bold tracking-wide text-white">
                                                    {item.title}
                                                </h3>
                                                <p className="text-[14.5px] leading-relaxed font-normal text-white/85">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: YouTube embed */}
                    {hasVideo && (
                        <div className="sticky top-28 self-start lg:pl-4">
                            <div ref={videoRef} className="bka-reveal-right">
                                {/* Premium gradient border wrapper */}
                                <div className="relative rounded-3xl bg-gradient-to-br from-[#1B5E20]/30 via-transparent to-[#C8A000]/30 p-1.5 shadow-[0_20px_50px_rgba(27,94,32,0.12)]">
                                    <div className="overflow-hidden rounded-[18px] bg-white">
                                        <div className="relative aspect-video w-full">
                                            <iframe
                                                src={youtubeEmbedUrl}
                                                title="Video Layanan BKA UMRI"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                referrerPolicy="strict-origin-when-cross-origin"
                                                allowFullScreen
                                                className="absolute inset-0 h-full w-full border-0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative caption */}
                                <p className="mt-4 text-center text-xs font-semibold tracking-wide text-[#5C6B73] uppercase">
                                    Video profil & panduan layanan BKA
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
