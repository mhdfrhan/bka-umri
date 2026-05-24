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

    return (
        <section
            id="sambutan"
            className="bka-section bg-white"
        >
            <div className="bka-container">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[360px_1fr] lg:gap-16">
                    {/* Photo Column */}
                    <div
                        ref={photoRef}
                        className="bka-reveal-left flex flex-col items-center gap-0"
                    >
                        <div className="relative mx-auto w-full max-w-[320px]">
                            {/* Decorative gradient background */}
                            <div
                                aria-hidden="true"
                                className="absolute -top-4 -left-4 right-4 bottom-4 z-0 rounded-[20px]"
                                style={{
                                    background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D46 100%)',
                                }}
                            />

                            {/* Decorative gold corner */}
                            <div
                                aria-hidden="true"
                                className="bka-float-slow absolute -right-2 -bottom-2 z-0 h-20 w-20 rounded-xl"
                                style={{
                                    background: 'linear-gradient(135deg, #C8A000 0%, #E8C840 100%)',
                                }}
                            />

                            {/* Photo */}
                            <div className="relative z-[1] aspect-[3/4] overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
                                <img
                                    src={kepalaBiro.foto}
                                    alt={`Foto ${kepalaBiro.nama}`}
                                    className="h-full w-full object-cover object-[center_top]"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src =
                                            'https://placehold.co/320x427/E8F5E9/1B5E20?text=Kepala+Biro';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Name Card */}
                        <div className="mx-auto mt-7 w-full max-w-[320px] rounded-2xl border border-[#DDE5DD] bg-[#F7F9F7] p-5 text-center">
                            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#9EAAB2]">
                                {kepalaBiro.periode}
                            </p>
                            <h3 className="mb-1 text-lg font-bold leading-tight text-[#1A1A1A]">
                                {kepalaBiro.nama}
                            </h3>
                            <p className="text-sm font-semibold text-[#1B5E20]">
                                {kepalaBiro.jabatan}
                            </p>
                        </div>
                    </div>

                    {/* Content Column */}
                    <div
                        ref={contentRef}
                        className="bka-reveal-right"
                    >
                        <span className="mb-4 inline-block rounded-full bg-[#E8F5E9] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#1B5E20]">
                            Kata Sambutan
                        </span>

                        <h2
                            className="mb-3 font-bold leading-[1.25] text-[#1A1A1A]"
                            style={{ fontSize: 'clamp(22px, 3.5vw, 30px)' }}
                        >
                            Selamat Datang di Website
                            <br />
                            <span className="bka-gradient-text">BKA UMRI</span>
                        </h2>

                        <span className="bka-gold-line mb-10" />

                        {/* Quote block */}
                        <div className="relative">
                            <Quote
                                size={56}
                                aria-hidden="true"
                                className="absolute -top-6 -left-6 z-0 -scale-x-100 text-[#E8F5E9]"
                            />
                            <div className="relative z-[1] rounded-xl border-l-[3px] border-[#C8A000] bg-[#F7F9F7] py-5 pr-5 pl-5">
                                <p className="text-base leading-[1.8] text-[#5C6B73] italic">
                                    {kepalaBiro.sambutan}
                                </p>
                            </div>
                        </div>

                        {/* Signature */}
                        <div className="mt-8 flex items-center gap-4 border-t border-[#DDE5DD] pt-6">
                            <span className="bka-gold-line" />
                            <div>
                                <p className="text-[15px] font-bold text-[#1A1A1A]">
                                    {kepalaBiro.nama}
                                </p>
                                <p className="text-[13px] text-[#5C6B73]">
                                    {kepalaBiro.jabatan}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
