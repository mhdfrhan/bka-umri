import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Slide {
    id: number;
    image: string;
    title: string;
    description?: string;
    ctaText?: string;
    ctaHref?: string;
}

interface HeroSliderProps {
    slides: Slide[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
    const [current, setCurrent] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [progressKey, setProgressKey] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const goTo = useCallback(
        (index: number) => {
            setCurrent((index + slides.length) % slides.length);
            setProgressKey((k) => k + 1);
        },
        [slides.length],
    );

    const next = useCallback(() => goTo(current + 1), [goTo, current]);
    const prev = useCallback(() => goTo(current - 1), [goTo, current]);

    useEffect(() => {
        if (slides.length <= 1 || isHovered) {
            return;
        }

        intervalRef.current = setInterval(next, 5000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [next, slides.length, isHovered]);

    if (slides.length === 0) {
        return null;
    }

    return (
        <section
            id="hero-slider"
            aria-label="Banner utama"
            className="relative w-full overflow-hidden bg-[#0D3B11]"
            style={{ height: 'clamp(480px, 65vw, 720px)' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Slides */}
            {slides.map((slide, idx) => (
                <div
                    key={slide.id}
                    aria-hidden={idx !== current}
                    className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                    style={{
                        opacity: idx === current ? 1 : 0,
                        pointerEvents: idx === current ? 'auto' : 'none',
                    }}
                >
                    {/* Background image */}
                    <img
                        src={slide.image}
                        alt=""
                        aria-hidden="true"
                        className={`absolute inset-0 h-full w-full object-cover object-center transition-transform ${
                            idx === current
                                ? 'scale-100 delay-0 duration-[6000ms] ease-out'
                                : 'scale-110 delay-1000 duration-0'
                        }`}
                    />

                    <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(to right, rgba(8,32,12,0.75) 0%, rgba(8,32,12,0.45) 45%, rgba(8,32,12,0.15) 75%, transparent 100%)',
                        }}
                    />

                    {/* Radial ambient glow */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(ellipse at 20% 50%, rgba(200,160,0,0.1) 0%, transparent 60%)',
                        }}
                    />

                    {/* Content */}
                    <div className="bka-container relative z-[2] flex h-full items-center">
                        <div className="max-w-[720px] pl-0 lg:pl-6">
                            {/* Gold accent line */}
                            <div
                                className="mb-6 h-[3px] w-16 rounded-full transition-all duration-700 ease-out"
                                style={{
                                    background:
                                        'linear-gradient(90deg, #C8A000, #E8C840)',
                                    opacity: idx === current ? 1 : 0,
                                    transform:
                                        idx === current
                                            ? 'translateX(0) scaleX(1)'
                                            : 'translateX(-20px) scaleX(0.5)',
                                    transitionDelay: '200ms',
                                }}
                            />

                            {/* Title */}
                            <h1
                                className="mb-5 leading-[1.12] font-bold tracking-tight text-white"
                                style={{
                                    fontSize: 'clamp(34px, 5.5vw, 64px)',
                                    opacity: idx === current ? 1 : 0,
                                    transform:
                                        idx === current
                                            ? 'translateY(0)'
                                            : 'translateY(20px)',
                                    transition:
                                        'opacity 700ms ease-out 300ms, transform 700ms ease-out 300ms',
                                }}
                            >
                                {slide.title}
                            </h1>

                            {/* Description */}
                            {slide.description && (
                                <p
                                    className="max-w-[580px] leading-relaxed text-white/90"
                                    style={{
                                        fontSize: 'clamp(15px, 2.2vw, 20px)',
                                        marginBottom: slide.ctaText
                                            ? '40px'
                                            : 0,
                                        opacity: idx === current ? 1 : 0,
                                        transform:
                                            idx === current
                                                ? 'translateY(0)'
                                                : 'translateY(20px)',
                                        transition:
                                            'opacity 700ms ease-out 400ms, transform 700ms ease-out 400ms',
                                    }}
                                >
                                    {slide.description}
                                </p>
                            )}

                            {/* CTA */}
                            {slide.ctaText && (
                                <div
                                    className="flex flex-wrap items-center gap-4"
                                    style={{
                                        opacity: idx === current ? 1 : 0,
                                        transform:
                                            idx === current
                                                ? 'translateY(0)'
                                                : 'translateY(20px)',
                                        transition:
                                            'opacity 700ms ease-out 500ms, transform 700ms ease-out 500ms',
                                    }}
                                >
                                    <a
                                        href={slide.ctaHref ?? '#'}
                                        className="bka-btn-primary shadow-[0_4px_25px_rgba(10,108,50,0.45)]"
                                        style={{
                                            fontSize: '15px',
                                            padding: '14px 32px',
                                        }}
                                    >
                                        {slide.ctaText}
                                    </a>
                                    {idx === 0 && (
                                        <a
                                            href="/profil/tentang-kami"
                                            className="rounded-full border border-white/40 bg-white/5 px-8 py-3.5 text-[15px] font-medium text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-[#0a6c32] hover:shadow-[0_4px_20px_rgba(255,255,255,0.15)]"
                                        >
                                            Profil BKA
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Decorative diagonal geometric lines */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 bottom-10 z-[1] hidden h-[1px] w-[50%] origin-right rotate-[-40deg] bg-gradient-to-l from-white/12 to-transparent lg:block"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 bottom-24 z-[1] hidden h-[1px] w-[40%] origin-right rotate-[-40deg] bg-gradient-to-l from-[#C8A000]/25 to-transparent lg:block"
            />

            {/* Decorative floating shapes */}
            <div
                aria-hidden="true"
                className="bka-float-slow pointer-events-none absolute top-[15%] right-[8%] z-[1] h-[200px] w-[200px] rounded-full border border-white/[0.06] lg:h-[300px] lg:w-[300px]"
            />
            <div
                aria-hidden="true"
                className="bka-float-medium pointer-events-none absolute right-[12%] bottom-[20%] z-[1] h-[120px] w-[120px] rounded-full border border-[#C8A000]/[0.1] lg:h-[180px] lg:w-[180px]"
                style={{ animationDelay: '-2s' }}
            />

            {/* Navigation Buttons */}
            {slides.length > 1 && (
                <>
                    <button
                        id="hero-prev"
                        aria-label="Slide sebelumnya"
                        onClick={prev}
                        className="bka-glass absolute top-1/2 left-4 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-white transition-all duration-200 hover:bg-white/25 md:left-6"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <button
                        id="hero-next"
                        aria-label="Slide berikutnya"
                        onClick={next}
                        className="bka-glass absolute top-1/2 right-4 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-white transition-all duration-200 hover:bg-white/25 md:right-6"
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}

            {/* Slide indicators with progress */}
            {slides.length > 1 && (
                <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            aria-label={`Pergi ke slide ${idx + 1}`}
                            onClick={() => goTo(idx)}
                            className="relative h-[6px] cursor-pointer overflow-hidden rounded-full border-none p-0 transition-all duration-300 ease-out"
                            style={{
                                width: idx === current ? '36px' : '8px',
                                backgroundColor:
                                    idx === current
                                        ? 'rgba(200,160,0,0.3)'
                                        : 'rgba(255,255,255,0.4)',
                            }}
                        >
                            {idx === current && !isHovered && (
                                <span
                                    key={progressKey}
                                    className="bka-slide-progress absolute inset-0 h-full w-full rounded-full"
                                />
                            )}
                            {idx === current && isHovered && (
                                <span className="absolute inset-0 h-full w-full rounded-full bg-[#C8A000]" />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Bottom gradient fade */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-0 bottom-0 left-0 z-[5] h-20"
                style={{
                    background:
                        'linear-gradient(to bottom, transparent, rgba(247,249,247,0.12))',
                }}
            />
        </section>
    );
}
