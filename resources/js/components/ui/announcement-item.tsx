import { Link } from '@inertiajs/react';
import { ArrowRight, BellRing } from 'lucide-react';

interface AnnouncementItemProps {
    slug: string;
    title: string;
    date: string;
    isPenting?: boolean;
    excerpt?: string;
    isTerbaru?: boolean;
}

const parseDate = (dateStr: string) => {
    if (!dateStr) return { day: '00', month: '---', year: '0000' };
    
    const parts = dateStr.split('-');
    if (parts.length >= 3) {
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
        const monthIndex = parseInt(parts[1], 10) - 1;
        return {
            day: parts[2],
            month: months[monthIndex] || '---',
            year: parts[0]
        };
    }
    
    try {
        const dateObj = new Date(dateStr);
        if (!isNaN(dateObj.getTime())) {
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
            return {
                day: String(dateObj.getDate()).padStart(2, '0'),
                month: months[dateObj.getMonth()],
                year: String(dateObj.getFullYear())
            };
        }
    } catch {
        // ignore
    }

    return { day: '00', month: '---', year: '0000' };
};

export default function AnnouncementItem({
    slug,
    title,
    date,
    isPenting = false,
    excerpt,
    isTerbaru = false,
}: AnnouncementItemProps) {
    const dateInfo = parseDate(date);

    return (
        <Link
            href={`/pengumuman/${slug}`}
            className="group block no-underline"
            aria-label={`Baca pengumuman: ${title}`}
        >
            <div
                className={`
                    relative flex items-center gap-5 p-5 transition-all duration-300 ease-out bg-white border rounded-2xl
                    ${isPenting
                        ? 'bg-gradient-to-br from-red-50/20 via-white to-white border-red-200 hover:border-red-300 shadow-[0_4px_15px_rgba(198,40,40,0.02)] hover:shadow-[0_12px_36px_rgba(198,40,40,0.06)]'
                        : 'border-[#DDE5DD] hover:border-[#0a6c32]/35 shadow-[0_4px_15px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_36px_rgba(10,108,50,0.05)]'
                    }
                    hover:-translate-y-1
                `}
            >
                {/* Visual Date Badge */}
                <div className="flex flex-col items-center justify-center shrink-0 w-16 sm:w-18 rounded-xl border border-[#DDE5DD] bg-[#F7F9F7] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 group-hover:scale-102 group-hover:border-[#0a6c32]/30">
                    <div className={`w-full text-center py-1 text-[9px] font-black tracking-widest uppercase transition-colors duration-300 ${
                        isPenting ? 'bg-red-50 text-[#C62828]' : 'bg-[#e6f4ea] text-[#0a6c32]'
                    }`}>
                        {dateInfo.month}
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 bg-white w-full">
                        <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1A1A1A] leading-none">
                            {dateInfo.day}
                        </span>
                        <span className="text-[9px] font-semibold text-neutral-400 mt-0.5">
                            {dateInfo.year}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        {isPenting ? (
                            <span className="inline-flex items-center gap-1 rounded bg-[#FFEAE5] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#C62828] border border-red-100">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-600"></span>
                                </span>
                                Penting
                            </span>
                        ) : isTerbaru ? (
                            <span className="rounded bg-[#FFF8DC] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#9A6F00] border border-amber-100">
                                Terbaru
                            </span>
                        ) : (
                            <span className="rounded bg-[#F0F2F0] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-neutral-500 border border-neutral-200">
                                Pengumuman
                            </span>
                        )}
                    </div>

                    <h3 className="line-clamp-2 text-[14px] sm:text-[15px] font-bold leading-snug text-[#1A1A1A] transition-colors duration-200 group-hover:text-[#0a6c32]">
                        {title}
                    </h3>

                    {excerpt && (
                        <p className="mt-1.5 line-clamp-1 sm:line-clamp-2 text-[12px] sm:text-[13px] leading-relaxed text-[#5C6B73] font-normal">
                            {excerpt}
                        </p>
                    )}
                </div>

                {/* Arrow indicator on hover */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-50 border border-neutral-100 text-[#9EAAB2] opacity-0 -translate-x-2 transition-all duration-300 group-hover:translate-x-0 group-hover:bg-[#e6f4ea] group-hover:text-[#0a6c32] group-hover:border-[#e6f4ea] group-hover:opacity-100">
                    <ArrowRight size={14} className="stroke-[2.5]" />
                </div>
            </div>
        </Link>
    );
}

