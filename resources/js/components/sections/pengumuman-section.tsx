import { ArrowRight } from 'lucide-react';
import AnnouncementItem from '@/components/ui/announcement-item';
import SectionHeader from '@/components/ui/section-header';
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

    // Find the first non-penting announcement to label as "Terbaru"
    const firstNonPentingIdx = pengumumanList.findIndex((p) => !p.isPenting);

    return (
        <section
            id="pengumuman-terbaru"
            className="bka-section bka-noise-overlay relative overflow-hidden bg-gradient-to-b from-[#F7F9F7] via-[#e8f3ec] to-[#F7F9F7]"
        >
            {/* Rich multi-color radial gradient mesh overlay */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-40 select-none"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 10% 20%, rgba(10,108,50,0.06) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(200,160,0,0.05) 0%, transparent 50%)',
                }}
            />

            <div className="bka-container relative z-[1]">
                <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-[1fr_520px]">
                    {/* Left Column */}
                    <div ref={leftRef} className="bka-reveal-left flex flex-col justify-center">
                        <SectionHeader
                            label="Pengumuman"
                            title="Informasi & Pengumuman Resmi"
                            description="Temukan pengumuman penting, jadwal registrasi, dan panduan administrasi keuangan resmi dari BKA UMRI."
                        />

                        {/* CTA Button - Desktop only */}
                        <div className="mt-2 hidden lg:block">
                            <a
                                href="/pengumuman"
                                className="bka-btn-primary px-6 py-3.5 rounded-2xl shadow-sm transition-all duration-300 hover:scale-102 active:scale-98 inline-flex items-center"
                            >
                                Lihat Semua Pengumuman
                                <ArrowRight size={15} className="ml-2 stroke-[2.5]" />
                            </a>
                        </div>
                    </div>

                    {/* Right Column - Announcement items */}
                    <div ref={rightRef} className="flex flex-col gap-4">
                        {pengumumanList.slice(0, 3).map((item, idx) => (
                            <div
                                key={item.slug}
                                className={`bka-reveal bka-stagger-${idx + 1}`}
                            >
                                <AnnouncementItem
                                    {...item}
                                    isTerbaru={idx === firstNonPentingIdx}
                                />
                            </div>
                        ))}

                        {/* Mobile CTA */}
                        <div className="mt-2 lg:hidden">
                            <a
                                href="/pengumuman"
                                className="bka-btn-primary w-full justify-center rounded-2xl shadow-md transition-transform active:scale-98"
                            >
                                Lihat Semua Pengumuman
                                <ArrowRight size={16} className="ml-1" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
