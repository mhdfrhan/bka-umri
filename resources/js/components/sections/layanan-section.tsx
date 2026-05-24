import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, CreditCard, Landmark } from 'lucide-react';
import SectionHeader from '@/components/ui/section-header';
import { useScrollReveal, useScrollRevealChildren } from '@/hooks/use-scroll-reveal';

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
        <section id="layanan-bka" className="bka-section bg-white">
            <div className="bka-container">
                <div
                    className={`grid grid-cols-1 items-start gap-12 ${
                        hasVideo ? 'lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_480px]' : ''
                    }`}
                >
                    {/* Left: Header + Layanan items */}
                    <div ref={leftRef}>
                        <div className="bka-reveal">
                            <SectionHeader
                                label="Layanan"
                                title={title}
                                description={description}
                            />
                        </div>

                        <div className="flex flex-col gap-5">
                            {layananList.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.title}
                                        className={`bka-reveal bka-stagger-${idx + 2}`}
                                    >
                                        <div className="group flex items-start gap-4 rounded-xl border border-transparent p-4 transition-all duration-200 hover:border-[#DDE5DD] hover:bg-[#F7F9F7]">
                                            {/* Icon */}
                                            <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] text-[#1B5E20] transition-all duration-200 group-hover:shadow-md">
                                                <Icon size={20} />
                                            </span>

                                            {/* Text */}
                                            <div className="min-w-0">
                                                <h3 className="mb-1.5 text-[16px] font-semibold leading-snug text-[#1A1A1A]">
                                                    {item.title}
                                                </h3>
                                                <p className="text-[14px] leading-relaxed text-[#5C6B73]">
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
                        <div
                            ref={videoRef}
                            className="bka-reveal-right sticky top-24"
                        >
                            <div className="overflow-hidden rounded-2xl border border-[#DDE5DD] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
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

                            {/* Decorative caption */}
                            <p className="mt-3 text-center text-xs text-[#9EAAB2]">
                                Video profil layanan BKA UMRI
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
