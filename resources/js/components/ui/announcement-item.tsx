import { Link } from '@inertiajs/react';
import { AlertCircle, ArrowRight, Calendar } from 'lucide-react';

interface AnnouncementItemProps {
    slug: string;
    title: string;
    date: string;
    isPenting?: boolean;
    excerpt?: string;
    isTerbaru?: boolean;
}

export default function AnnouncementItem({
    slug,
    title,
    date,
    isPenting = false,
    excerpt,
    isTerbaru = false,
}: AnnouncementItemProps) {
    return (
        <Link
            href={`/pengumuman/${slug}`}
            className="group block no-underline"
            aria-label={`Baca pengumuman: ${title}`}
        >
            <div
                className={`
                    relative flex items-start gap-4 p-5 transition-all duration-300 ease-out bg-white shadow-[0_4px_15px_rgba(0,0,0,0.02)]
                    ${isPenting
                        ? 'border-l-4 border-l-[#C62828] border-y border-r border-[#DDE5DD] rounded-r-2xl hover:border-l-[#C62828] hover:border-y-[#B5C5B5] hover:border-r-[#B5C5B5]'
                        : 'border-l-4 border-l-[#1B5E20] border-y border-r border-[#DDE5DD] rounded-r-2xl hover:border-l-[#C8A000] hover:border-y-[#B5C5B5] hover:border-r-[#B5C5B5]'
                    }
                    hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(27,94,32,0.06)]
                `}
            >
                {/* Content */}
                <div className="min-w-0 flex-1">
                    <div className="mb-2.5 flex flex-wrap items-center gap-2">
                        {isPenting ? (
                            <span className="rounded bg-[#C62828] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                                Penting
                            </span>
                        ) : isTerbaru ? (
                            <span className="rounded bg-[#C8A000] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                                Terbaru
                            </span>
                        ) : null}
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9EAAB2]">
                            <Calendar size={12} className="text-[#1B5E20]/80" />
                            {date}
                        </span>
                    </div>

                    <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-[#1A1A1A] transition-colors duration-200 group-hover:text-[#1B5E20]">
                        {title}
                    </h3>

                    {excerpt && (
                        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#5C6B73] font-normal">
                            {excerpt}
                        </p>
                    )}
                </div>

                {/* Arrow indicator on hover */}
                <ArrowRight
                    size={16}
                    className="mt-3.5 shrink-0 text-[#9EAAB2] opacity-0 -translate-x-2 transition-all duration-300 group-hover:translate-x-0 group-hover:text-[#1B5E20] group-hover:opacity-100"
                />
            </div>
        </Link>
    );
}
