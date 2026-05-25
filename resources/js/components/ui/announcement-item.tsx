import { Link } from '@inertiajs/react';
import { AlertCircle, ArrowRight, Calendar } from 'lucide-react';

interface AnnouncementItemProps {
    slug: string;
    title: string;
    date: string;
    isPenting?: boolean;
    excerpt?: string;
}

export default function AnnouncementItem({ slug, title, date, isPenting = false, excerpt }: AnnouncementItemProps) {
    return (
        <Link
            href={`/pengumuman/${slug}`}
            className="group block no-underline"
            aria-label={`Baca pengumuman: ${title}`}
        >
            <div
                className={`
                    relative flex items-start gap-4 rounded-xl border p-4 transition-all duration-200 ease-out
                    ${isPenting
                        ? 'border-[#FFCDD2] bg-[#FFF8F8] hover:border-[#EF9A9A]'
                        : 'border-[#DDE5DD] bg-white hover:border-[#B5C5B5]'
                    }
                    hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)]
                `}
            >


                {/* Icon */}
                <span
                    className={`
                        mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                        ${isPenting
                            ? 'bg-gradient-to-br from-[#FFEBEE] to-[#FFCDD2] text-[#C62828]'
                            : 'bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] text-[#1B5E20]'
                        }
                    `}
                >
                    <AlertCircle size={18} />
                </span>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        {isPenting && (
                            <span className="bka-badge bka-badge-danger">
                                Penting
                            </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-[#9EAAB2]">
                            <Calendar size={11} />
                            {date}
                        </span>
                    </div>

                    <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#1A1A1A] transition-colors duration-200 group-hover:text-[#1B5E20]">
                        {title}
                    </h3>

                    {excerpt && (
                        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[#5C6B73]">
                            {excerpt}
                        </p>
                    )}
                </div>

                {/* Arrow indicator on hover */}
                <ArrowRight
                    size={16}
                    className="mt-3 shrink-0 text-[#9EAAB2] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#1B5E20] group-hover:opacity-100"
                />
            </div>
        </Link>
    );
}
