import { Camera, Images, X, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { AdminModal } from '@/components/admin/admin-modal';

const defaultImages = [
    {
        src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80',
        title: 'Gedung Rektorat KH. Ahmad Dahlan',
        category: 'Fasilitas',
        desc: 'Gedung utama Rektorat Universitas Muhammadiyah Riau yang megah, berfungsi sebagai pusat administrasi dan biro rektorat.',
    },
    {
        src: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&q=80',
        title: 'Rapat Koordinasi Evaluasi Keuangan',
        category: 'Kegiatan',
        desc: 'Sinergi antar unit kerja dalam menyelaraskan anggaran tahunan universitas secara transparan dan akuntabel.',
    },
    {
        src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
        title: 'Penyerahan Penghargaan Akuntabilitas 2026',
        category: 'Prestasi',
        desc: 'Apresiasi tinggi atas tata kelola administrasi keuangan BKA UMRI yang berorientasi pada transparansi publik.',
    },
    {
        src: 'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=1200&q=80',
        title: 'Sosialisasi Pembayaran VA Mahasiswa',
        category: 'Sosialisasi',
        desc: 'Edukasi layanan digitalisasi keuangan terintegrasi bagi perwakilan mahasiswa baru dan organisasi mahasiswa.',
    },
    {
        src: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&q=80',
        title: 'Penandatanganan MoU Bank Rekanan Baru',
        category: 'Kerjasama',
        desc: 'Langkah strategis memperluas akses pembayaran SPP/UKT mahasiswa melalui 4 bank rekanan nasional terkemuka.',
    },
    {
        src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
        title: 'Audit Keuangan Independen Tahunan',
        category: 'Audit',
        desc: 'Verifikasi berkala oleh Kantor Akuntan Publik guna menjamin akurasi data laporan keuangan BKA UMRI.',
    },
];

export default function CtaDokumentasi() {
    const sectionRef = useScrollReveal<HTMLDivElement>();
    const [selectedImage, setSelectedImage] = useState<
        null | (typeof defaultImages)[0]
    >(null);

    return (
        <section
            id="cta-dokumentasi"
            className="bka-noise-overlay relative overflow-hidden bg-[#FAFBFA] py-20"
            aria-label="Galeri Dokumentasi Kegiatan"
        >
            {/* Infinite Marquee Animation Keyframe */}
            <style>{`
                @keyframes bka-marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .bka-marquee-track {
                    animation: bka-marquee 45s linear infinite;
                }
                .bka-marquee-container:hover .bka-marquee-track {
                    animation-play-state: paused !important;
                }
            `}</style>

            <div className="bka-container mb-12">
                {/* Header info */}
                <div
                    ref={sectionRef}
                    className="bka-reveal flex flex-wrap items-end justify-between gap-6"
                >
                    <div>
                        <span className="mb-3 inline-block rounded-full bg-[#E8F5E9] px-3.5 py-1 text-[11px] font-bold tracking-[0.1em] text-[#1B5E20] uppercase">
                            Galeri
                        </span>
                        <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-[#1A1A1A] lg:text-3xl">
                            Dokumentasi Kegiatan BKA
                        </h2>
                        <p className="text-sm text-[#5C6B73]">
                            Saksikan berbagai momen penting dan laporan kegiatan
                            resmi kami. Klik pada gambar untuk detail.
                        </p>
                    </div>
                    <a
                        href="/dokumentasi"
                        className="group hidden shrink-0 items-center gap-1.5 text-sm font-bold text-[#1B5E20] no-underline transition-all duration-200 hover:gap-2.5 lg:inline-flex"
                    >
                        Lihat Semua Galeri
                        <ArrowRight
                            size={15}
                            className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                    </a>
                </div>
            </div>

            {/* Full-width edge-to-edge marquee track */}
            <div className="bka-marquee-container relative w-full overflow-hidden py-4">
                <div
                    className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-16 md:w-32 lg:w-48"
                    style={{
                        background:
                            'linear-gradient(to right, #FAFBFA 0%, rgba(250, 251, 250, 0.95) 20%, rgba(250, 251, 250, 0.4) 65%, transparent 100%)',
                    }}
                />
                <div
                    className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-16 md:w-32 lg:w-48"
                    style={{
                        background:
                            'linear-gradient(to left, #FAFBFA 0%, rgba(250, 251, 250, 0.95) 20%, rgba(250, 251, 250, 0.4) 65%, transparent 100%)',
                    }}
                />

                <div className="bka-marquee-track flex w-max cursor-pointer gap-0">
                    {/* First Half */}
                    <div className="flex shrink-0 gap-6 pr-6">
                        {defaultImages.map((img, idx) => (
                            <div
                                key={`half1-${idx}`}
                                onClick={() => setSelectedImage(img)}
                                className="group relative h-[240px] w-[360px] shrink-0 overflow-hidden rounded-2xl border border-[#1B5E20]/10 shadow-[0_12px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(27,94,32,0.1)] md:h-[280px] md:w-[420px]"
                            >
                                <img
                                    src={img.src}
                                    alt={img.title}
                                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                                    loading="lazy"
                                />

                                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/25 to-transparent p-6 transition-opacity duration-300" />

                                <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-white transition-all duration-300">
                                    <span className="mb-2.5 inline-block rounded bg-[#C8A000] px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
                                        {img.category}
                                    </span>
                                    <h3 className="line-clamp-1 font-sans text-[16px] leading-tight font-bold">
                                        {img.title}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Second Half (Exact Duplicate) */}
                    <div className="flex shrink-0 gap-6 pr-6">
                        {defaultImages.map((img, idx) => (
                            <div
                                key={`half2-${idx}`}
                                onClick={() => setSelectedImage(img)}
                                className="group relative h-[240px] w-[360px] shrink-0 overflow-hidden rounded-2xl border border-[#1B5E20]/10 shadow-[0_12px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(27,94,32,0.1)] md:h-[280px] md:w-[420px]"
                            >
                                <img
                                    src={img.src}
                                    alt={img.title}
                                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                                    loading="lazy"
                                />

                                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/25 to-transparent p-6 transition-opacity duration-300" />

                                <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-white transition-all duration-300">
                                    <span className="mb-2.5 inline-block rounded bg-[#C8A000] px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
                                        {img.category}
                                    </span>
                                    <h3 className="line-clamp-1 font-sans text-[16px] leading-tight font-bold">
                                        {img.title}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <AdminModal
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                maxWidth="4xl"
                className="rounded-[24px] p-0"
            >
                {selectedImage && (
                    <div className="relative h-full w-full md:flex">
                        {/* Large Image Column */}
                        <div className="aspect-video shrink-0 bg-neutral-950 md:aspect-auto md:h-[480px] md:w-3/5">
                            <img
                                src={selectedImage.src}
                                alt={selectedImage.title}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Content Info Column */}
                        <div className="flex flex-1 flex-col justify-between p-6 font-sans md:w-2/5 md:p-9">
                            <div>
                                <span className="mb-4 inline-block rounded bg-[#1B5E20] px-3 py-1 text-[10px] font-extrabold tracking-wider text-white uppercase">
                                    {selectedImage.category}
                                </span>
                                <h3 className="mb-3 text-lg leading-snug font-extrabold text-neutral-900 md:text-xl">
                                    {selectedImage.title}
                                </h3>
                                <p className="text-[13.5px] leading-relaxed font-normal text-neutral-500">
                                    {selectedImage.desc}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedImage(null)}
                                className="mt-8 w-full rounded-xl bg-neutral-900 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-neutral-800"
                            >
                                Tutup Detail
                            </button>
                        </div>
                    </div>
                )}
            </AdminModal>
        </section>
    );
}
