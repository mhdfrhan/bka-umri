import { Award, BookOpen, Building2, Users } from 'lucide-react';
import StatCounter from '@/components/ui/stat-counter';
import {
    useScrollReveal,
    useScrollRevealChildren,
} from '@/hooks/use-scroll-reveal';

interface StatItem {
    icon: typeof Award;
    value: string;
    label: string;
}

const defaultStats: StatItem[] = [
    { icon: Building2, value: '2015', label: 'Tahun Berdiri' },
    { icon: Users, value: '25+', label: 'Staf Berpengalaman' },
    { icon: Award, value: '40+', label: 'Unit Kerja Dilayani' },
    { icon: BookOpen, value: '1.000+', label: 'Dokumen Dikelola' },
];

interface StatistikSectionProps {
    stats?: StatItem[];
}

export default function StatistikSection({
    stats = defaultStats,
}: StatistikSectionProps) {
    const headerRef = useScrollReveal<HTMLDivElement>();
    const gridRef =
        useScrollRevealChildren<HTMLDivElement>('.bka-reveal-scale');

    return (
        <section
            id="statistik-kelembagaan"
            aria-label="Statistik Kelembagaan BKA UMRI"
            className="relative z-[3] overflow-hidden border-t-[3px] border-[#C8A000]"
            style={{
                background:
                    'linear-gradient(135deg, #144317 0%, #0a6c32 50%, #206825 100%)',
            }}
        >
            {/* Dot Pattern Overlay */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[1] opacity-80"
                style={{
                    backgroundImage:
                        'radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px',
                }}
            />

            {/* Ambient Glow Orbs */}
            <div
                aria-hidden="true"
                className="bka-float-slow pointer-events-none absolute -top-[10%] -right-[5%] z-[1] h-[400px] w-[400px] rounded-full"
                style={{
                    background:
                        'radial-gradient(circle, rgba(200,160,0,0.15) 0%, rgba(200,160,0,0) 70%)',
                    filter: 'blur(40px)',
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-[10%] -left-[5%] z-[1] h-[300px] w-[300px] rounded-full"
                style={{
                    background:
                        'radial-gradient(circle, rgba(4,141,70,0.3) 0%, rgba(4,141,70,0) 70%)',
                    filter: 'blur(30px)',
                }}
            />

            <div className="bka-container relative z-[2] py-20">
                {/* Header */}
                <div ref={headerRef} className="bka-reveal mb-12 text-center">
                    <span className="mb-3 inline-block rounded-full bg-[rgba(200,160,0,0.15)] px-3 py-1 text-[11px] font-bold tracking-[0.1em] text-[#C8A000] uppercase">
                        Kelembagaan
                    </span>
                    <h2
                        className="mb-4 leading-[1.2] font-extrabold tracking-tight text-white"
                        style={{ fontSize: 'clamp(28px, 4.5vw, 40px)' }}
                    >
                        BKA UMRI dalam Angka
                    </h2>
                    <span className="bka-gold-line bka-gold-line-center" />
                </div>

                {/* Stats Grid */}
                <div
                    ref={gridRef}
                    className="grid grid-cols-2 gap-5 lg:grid-cols-4"
                >
                    {stats.map((stat, idx) => (
                        <div
                            key={stat.label}
                            className={`bka-reveal-scale bka-stagger-${idx + 1}`}
                        >
                            <StatCounter
                                icon={stat.icon}
                                value={stat.value}
                                label={stat.label}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
