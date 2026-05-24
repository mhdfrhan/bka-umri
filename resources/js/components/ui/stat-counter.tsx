import type { LucideIcon } from 'lucide-react';
import { useCountUp } from '@/hooks/use-count-up';

interface StatCounterProps {
    icon: LucideIcon;
    value: string;
    label: string;
}

export default function StatCounter({ icon: Icon, value, label }: StatCounterProps) {
    const { ref, displayValue } = useCountUp(value, { duration: 2000 });

    return (
        <div
            ref={ref as React.RefObject<HTMLDivElement>}
            className="group flex flex-col items-center rounded-2xl border border-white/15 bg-white/10 p-8 text-center backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white/[0.18] hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
        >
            {/* Icon container with gradient border glow */}
            <div className="relative mb-5">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#C8A000]/40 to-[#E8C840]/20 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(200,160,0,0.25)]">
                    <Icon size={24} className="text-[#C8A000]" />
                </div>
            </div>

            {/* Animated value */}
            <span className="mb-2 text-[clamp(28px,5vw,40px)] font-bold leading-none tracking-tight text-white">
                {displayValue}
            </span>

            {/* Label */}
            <span className="text-sm font-medium leading-snug text-white/70">
                {label}
            </span>
        </div>
    );
}
