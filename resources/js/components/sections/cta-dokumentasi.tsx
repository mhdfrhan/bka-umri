import { Camera, Images } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

export default function CtaDokumentasi() {
    const sectionRef = useScrollReveal<HTMLDivElement>();

    return (
        <section
            id="cta-dokumentasi"
            className="bka-section"
            aria-label="Galeri Dokumentasi Kegiatan"
            style={{ backgroundColor: '#F7F9F7' }}
        >
            <div className="bka-container">
                <div
                    ref={sectionRef}
                    className="bka-reveal-scale relative min-h-[340px] overflow-hidden rounded-3xl"
                >
                    {/* Background Image */}
                    <img
                        src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80"
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover object-center"
                    />

                    {/* Premium gradient overlay */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(135deg, rgba(27,94,32,0.93) 0%, rgba(27,94,32,0.75) 50%, rgba(10,40,14,0.88) 100%)',
                        }}
                    />

                    {/* Decorative circles */}
                    <div
                        aria-hidden="true"
                        className="bka-float-slow pointer-events-none absolute -top-10 -right-10 h-60 w-60 rounded-full border-2 border-[#C8A000]/20"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute top-5 right-5 h-40 w-40 rounded-full border border-[#C8A000]/10"
                    />

                    {/* Content */}
                    <div className="relative z-[2] flex w-full flex-wrap items-center justify-between gap-12 p-10 md:p-12">
                        {/* Left: Text */}
                        <div className="min-w-[240px] flex-1">
                            <div className="mb-4 flex items-center gap-2.5">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(200,160,0,0.2)]">
                                    <Camera size={22} className="text-[#C8A000]" />
                                </div>
                                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#C8A000]">
                                    Galeri Dokumentasi
                                </span>
                            </div>

                            <h2
                                className="mb-3 font-bold leading-[1.25] text-white"
                                style={{ fontSize: 'clamp(20px, 3.5vw, 30px)' }}
                            >
                                Momen & Kegiatan
                                <br />
                                BKA UMRI
                            </h2>
                            <p className="max-w-[420px] text-[15px] leading-relaxed text-white/80">
                                Saksikan berbagai momen penting dan kegiatan
                                resmi yang telah dilaksanakan oleh Biro
                                Keuangan & Aset UMRI.
                            </p>
                        </div>

                        {/* Right: Gallery Preview + CTA */}
                        <div className="flex flex-col items-start gap-5">
                            {/* Mini gallery grid */}
                            <div className="grid grid-cols-3 gap-1.5">
                                {[
                                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=120&q=70',
                                    'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=120&q=70',
                                    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=120&q=70',
                                ].map((src, i) => (
                                    <div
                                        key={i}
                                        className="group/thumb h-[72px] w-[72px] overflow-hidden rounded-[10px] border-2 border-white/20 transition-all duration-200 hover:border-[#C8A000]/50 hover:shadow-[0_0_16px_rgba(200,160,0,0.2)]"
                                    >
                                        <img
                                            src={src}
                                            alt=""
                                            aria-hidden="true"
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button with glow */}
                            <a
                                href="/dokumentasi"
                                className="group inline-flex min-h-[44px] items-center gap-2 rounded-[10px] bg-[#C8A000] px-6 py-3 text-[15px] font-bold text-[#1A1A1A] no-underline shadow-[0_4px_20px_rgba(200,160,0,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#b89200] hover:shadow-[0_6px_28px_rgba(200,160,0,0.45)]"
                            >
                                <Images size={18} className="transition-transform duration-200 group-hover:-rotate-3" />
                                Lihat Galeri
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
