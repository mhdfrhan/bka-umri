import { Quote } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

interface KepalaBiro {
    nama: string;
    jabatan: string;
    periode: string;
    foto: string;
    sambutan: string;
}

interface SambutanSectionProps {
    kepalaBiro: KepalaBiro;
}

export default function SambutanSection({ kepalaBiro }: SambutanSectionProps) {
    const photoRef = useScrollReveal<HTMLDivElement>();
    const contentRef = useScrollReveal<HTMLDivElement>();

    // Split first sentence to serve as an editorial pull quote
    const sentences = kepalaBiro.sambutan.match(/[^.!?]+[.!?]+/g) || [
        kepalaBiro.sambutan,
    ];
    const pullQuote = sentences[0] ? sentences[0].trim() : '';
    const remainingText = sentences.slice(1).join(' ').trim();

    return (
        <section
            id="sambutan"
            className="bka-section bka-noise-overlay relative overflow-hidden bg-[#FAFBFA]"
        >
            {/* Soft background mesh gradient */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    background:
                        'radial-gradient(circle at 80% 20%, rgba(46,125,70,0.06) 0%, transparent 50%)',
                }}
            />

            <div className="bka-container relative z-1">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[400px_1fr] lg:gap-16">
                    {/* Photo Column */}
                    <div
                        ref={photoRef}
                        className="bka-reveal-left relative flex flex-col items-center pl-0 lg:pl-10"
                    >
                        {/* Rotated vertical text label */}
                        <div
                            aria-hidden="true"
                            className="absolute top-1/2 -left-12 hidden origin-center -translate-y-1/2 -rotate-90 text-[11px] font-extrabold tracking-[0.25em] whitespace-nowrap text-[#1B5E20]/45 uppercase select-none lg:block"
                        >
                            KEPALA BIRO BKA
                        </div>

                        <div className="relative mx-auto w-full max-w-[340px]">
                            {/* Decorative gradient background */}
                            <div
                                aria-hidden="true"
                                className="absolute -top-4 right-4 bottom-4 -left-4 z-0 rounded-[20px]"
                                style={{
                                    background:
                                        'linear-gradient(135deg, #1B5E20 0%, #2E7D46 100%)',
                                }}
                            />

                            {/* Decorative gold corner */}
                            <div
                                aria-hidden="true"
                                className="bka-float-slow absolute -right-2 -bottom-2 z-0 h-20 w-20 rounded-xl"
                                style={{
                                    background:
                                        'linear-gradient(135deg, #C8A000 0%, #E8C840 100%)',
                                }}
                            />

                            {/* Photo */}
                            <div className="relative z-[1] aspect-[3/4] overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
                                <img
                                    src={kepalaBiro.foto}
                                    alt={`Foto ${kepalaBiro.nama}`}
                                    className="h-full w-full object-cover object-[center_top]"
                                    onError={(e) => {
                                        (
                                            e.currentTarget as HTMLImageElement
                                        ).src =
                                            'https://placehold.co/320x427/E8F5E9/1B5E20?text=Kepala+Biro';
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content Column */}
                    <div
                        ref={contentRef}
                        className="bka-reveal-right flex flex-col justify-center"
                    >
                        <span className="mb-4 self-start rounded-full bg-[#E8F5E9] px-3.5 py-1 text-[11px] font-bold tracking-[0.1em] text-[#1B5E20] uppercase">
                            Kata Sambutan
                        </span>

                        <h2
                            className="mb-6 leading-[1.2] font-bold text-[#1A1A1A]"
                            style={{ fontSize: 'clamp(28px, 4.5vw, 38px)' }}
                        >
                            Selamat Datang di Website
                            <br />
                            <span className="bka-gradient-text">BKA UMRI</span>
                        </h2>

                        {/* Pull Quote */}
                        {pullQuote && (
                            <div className="relative mb-8 border-l-4 border-[#C8A000] pl-5 font-sans">
                                <p className="text-lg leading-relaxed font-medium text-[#1B5E20]/90 italic md:text-xl">
                                    "{pullQuote}"
                                </p>
                            </div>
                        )}

                        {/* Full Text / Remaining Text */}
                        <div className="relative">
                            <Quote
                                size={56}
                                aria-hidden="true"
                                className="absolute -top-7 -left-7 z-0 -scale-x-100 text-[#1B5E20]/5 opacity-60"
                            />
                            <p className="relative z-[1] text-base leading-[1.85] font-normal text-[#5C6B73]">
                                {remainingText || kepalaBiro.sambutan}
                            </p>
                        </div>

                        {/* Signature / Name Info */}
                        <div className="mt-10 flex flex-col gap-3 border-t border-[#DDE5DD] pt-6 font-sans sm:flex-row sm:items-center">
                            <span className="h-[2px] w-12 bg-[#C8A000]" />
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]">
                                <span className="font-extrabold tracking-wide text-[#1A1A1A] uppercase">
                                    {kepalaBiro.nama}
                                </span>
                                <span className="hidden text-neutral-300 sm:inline">
                                    |
                                </span>
                                <span className="font-semibold text-[#1B5E20]">
                                    {kepalaBiro.jabatan}
                                </span>
                                <span className="hidden text-neutral-300 sm:inline">
                                    |
                                </span>
                                <span className="font-medium text-[#9EAAB2]">
                                    {kepalaBiro.periode}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
