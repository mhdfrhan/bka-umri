import { Link } from '@inertiajs/react';
import { Calendar, User } from 'lucide-react';
import { formatDate } from '@/lib/format-date';

interface NewsCardProps {
    slug: string;
    thumbnail: string;
    category?: string;
    title: string;
    excerpt: string;
    date: string;
    author?: string;
}

export default function NewsCard({ slug, thumbnail, category, title, excerpt, date, author }: NewsCardProps) {
    return (
        <Link
            href={`/berita/${slug}`}
            className="group block h-full no-underline"
            aria-label={`Baca berita: ${title}`}
        >
            <article className="bka-card-modern flex h-full flex-col">
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-[#E5E7EB]">
                    <img
                        src={thumbnail}
                        alt={title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/800x450/E8F5E9/1B5E20?text=BKA+UMRI';
                        }}
                    />
                    {/* Gradient overlay on hover */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Category badge overlaid on thumbnail */}
                    {category && (
                        <span className="absolute top-3 left-3 z-10 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.04em] text-[#1B5E20] shadow-sm backdrop-blur-sm">
                            {category}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-2 line-clamp-2 text-[16px] font-semibold leading-snug text-[#1A1A1A] transition-colors duration-200 group-hover:text-[#1B5E20]">
                        {title}
                    </h3>

                    <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-[#5C6B73]">
                        {excerpt}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3.5 border-t border-[#DDE5DD] pt-3.5">
                        <span className="flex items-center gap-1.5 text-xs text-[#9EAAB2]">
                            <Calendar size={12} />
                            {formatDate(date)}
                        </span>
                        {author && (
                            <span className="flex items-center gap-1.5 text-xs text-[#9EAAB2]">
                                <User size={12} />
                                {author}
                            </span>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    );
}
