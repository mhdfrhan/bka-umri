import type { LucideIcon } from 'lucide-react';
import { useCountUp } from '@/hooks/use-count-up';

interface StatCounterProps {
    icon: LucideIcon;
    value: string;
    label: string;
}

export default function StatCounter({ icon: Icon, value, label }: StatCounterProps) {
    const { ref, displayValue } = useCountUp(value, { duration: 2000 });

    // Clean value for background watermark (extract only digits)
    const watermarkDigits = value.replace(/[^0-9]/g, '') || value;

    return (
        <div
            ref={ref as React.RefObject<HTMLDivElement>}
            className="group relative flex flex-col items-center rounded-2xl border border-white/12 border-t-2 border-t-[#C8A000] bg-white/5 p-8 text-center backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1.5 hover:bg-white/10 hover:shadow-[0_16px_40px_rgba(0,0,0,0.22)] overflow-hidden"
        >
            {/* Huge background number watermark */}
            <span className="absolute inset-0 flex items-center justify-center text-[100px] lg:text-[120px] font-black text-white/[0.03] select-none pointer-events-none transition-transform duration-500 group-hover:scale-105 z-0">
                {watermarkDigits}
            </span>

            {/* Icon container with gradient border glow */}
            <div className="relative mb-5 z-[2]">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#C8A000]/40 to-[#E8C840]/20 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(200,160,0,0.25)]">
                    <Icon size={24} className="text-[#C8A000]" />
                </div>
            </div>

            {/* Animated value */}
            <span className="relative z-[2] mb-3 text-[clamp(36px,6vw,60px)] font-extrabold leading-none tracking-tight text-white">
                {displayValue}
            </span>

            {/* Label */}
            <span className="relative z-[2] text-sm font-medium leading-snug text-white/70">
                {label}
            </span>
        </div>
    );
}
