import { ArrowRight } from 'lucide-react';
import AnnouncementItem from '@/components/ui/announcement-item';
import SectionHeader from '@/components/ui/section-header';
import { useScrollReveal, useScrollRevealChildren } from '@/hooks/use-scroll-reveal';

interface PengumumanItem {
    slug: string;
    title: string;
    date: string;
    isPenting?: boolean;
    excerpt?: string;
}

interface PengumumanSectionProps {
    pengumumanList: PengumumanItem[];
}

export default function PengumumanSection({
    pengumumanList,
}: PengumumanSectionProps) {
    const leftRef = useScrollReveal<HTMLDivElement>();
    const rightRef = useScrollRevealChildren<HTMLDivElement>('.bka-reveal');

    if (pengumumanList.length === 0) {
        return null;
    }

    return (
        <section
            id="pengumuman-terbaru"
            className="bka-section relative overflow-hidden"
            style={{ backgroundColor: '#E8F5E9' }}
        >
            {/* Subtle geometric pattern in background */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 10% 20%, rgba(27,94,32,0.06) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(200,160,0,0.05) 0%, transparent 50%)',
                }}
            />

            <div className="bka-container relative z-[1]">
                <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_480px]">
                    {/* Left Column */}
                    <div ref={leftRef} className="bka-reveal-left">
                        <SectionHeader
                            label="Pengumuman"
                            title="Informasi Penting"
                            description="Jangan lewatkan pengumuman dan informasi resmi terbaru dari BKA UMRI."
                        />

                        {/* Info panel - desktop only */}
                        <div className="mt-2 hidden rounded-2xl bg-[#1B5E20] p-6 lg:block">
                            {/* Subtle inner pattern */}
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 rounded-2xl opacity-30"
                                style={{
                                    backgroundImage:
                                        'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
                                    backgroundSize: '16px 16px',
                                }}
                            />
                            <p className="relative mb-5 text-sm leading-[1.7] text-white/75">
                                Semua pengumuman resmi BKA UMRI tersedia di
                                halaman pengumuman. Pastikan untuk selalu
                                memperhatikan pengumuman berlabel{' '}
                                <strong className="text-[#C8A000]">
                                    PENTING
                                </strong>
                                .
                            </p>
                            <a
                                href="/pengumuman"
                                className="group relative inline-flex items-center gap-1.5 text-sm font-semibold text-[#C8A000] no-underline transition-all duration-200 hover:gap-2.5"
                            >
                                Lihat Semua Pengumuman
                                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                            </a>
                        </div>
                    </div>

                    {/* Right Column - Announcement items */}
                    <div
                        ref={rightRef}
                        className="flex flex-col gap-3"
                    >
                        {pengumumanList.map((item, idx) => (
                            <div
                                key={item.slug}
                                className={`bka-reveal bka-stagger-${idx + 1}`}
                            >
                                <AnnouncementItem {...item} />
                            </div>
                        ))}

                        {/* Mobile CTA */}
                        <div className="mt-2 lg:hidden">
                            <a
                                href="/pengumuman"
                                className="bka-btn-primary w-full justify-center"
                            >
                                Lihat Semua Pengumuman
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
