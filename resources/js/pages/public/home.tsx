import { Head, usePage } from '@inertiajs/react';
import { Seo } from '@/components/seo';
import {
    Building2,
    Users,
    Award,
    BookOpen,
    CheckCircle2,
    CreditCard,
    Landmark,
    FileText,
    Megaphone,
    Images,
    FolderDown,
    Settings2,
    Coins,
    X,
} from 'lucide-react';

const IconMap: Record<string, any> = {
    Building2,
    Users,
    Award,
    BookOpen,
    CheckCircle2,
    CreditCard,
    Landmark,
    FileText,
    Megaphone,
    Images,
    FolderDown,
    Settings2,
    Coins,
    X,
};
import { useState, useEffect } from 'react';
import BeritaSection from '@/components/sections/berita-section';
import BidangSection from '@/components/sections/bidang-section';
import CtaDokumentasi from '@/components/sections/cta-dokumentasi';
import HeroSlider from '@/components/sections/hero-slider';
import LayananSection from '@/components/sections/layanan-section';
import PengumumanSection from '@/components/sections/pengumuman-section';
import SambutanSection from '@/components/sections/sambutan-section';
import StatistikSection from '@/components/sections/statistik-section';
import PublicLayout from '@/layouts/public-layout';

// Import icons for services section

interface Banner {
    id: number;
    image: string;
    title: string;
    description?: string;
    ctaText?: string;
    ctaHref?: string;
    urutan?: number;
}

interface KepalaBiro {
    nama: string;
    jabatan: string;
    periode: string;
    foto: string;
    sambutan: string;
}

interface BidangItem {
    slug: string;
    nama: string;
    deskripsiSingkat: string;
}

interface LayananItem {
    icon: any;
    title: string;
    description: string;
}

interface LayananData {
    judul_section: string;
    deskripsi_section?: string;
    youtube_url?: string;
    items?: LayananItem[];
}

interface NewsItem {
    slug: string;
    thumbnail: string;
    category?: string;
    title: string;
    excerpt: string;
    date: string;
    author?: string;
}

interface PengumumanItem {
    slug: string;
    title: string;
    date: string;
    isPenting?: boolean;
    excerpt?: string;
}

interface HomeProps {
    banners?: Banner[];
    kepalaBiro?: KepalaBiro | null;
    bidangs?: BidangItem[];
    layanan?: LayananData;
    stats?: any[];
    beritaTerbaru?: NewsItem[];
    pengumumanTerbaru?: PengumumanItem[];
    galeriTerbaru?: any[];
}

export default function Home({
    banners = [],
    kepalaBiro = null,
    bidangs = [],
    layanan,
    stats = [],
    beritaTerbaru = [],
    pengumumanTerbaru = [],
    galeriTerbaru = [],
}: HomeProps) {
    const { pengaturan } = usePage().props as any;
    const siteName = pengaturan?.nama_website || 'Biro Keuangan & Aset UMRI';
    const siteDescription =
        pengaturan?.deskripsi_seo ||
        'Portal resmi Biro Keuangan dan Aset Universitas Muhammadiyah Riau (UMRI). Menyediakan layanan administrasi keuangan dan informasi pengelolaan aset yang transparan dan akuntabel.';

    const [showPopup, setShowPopup] = useState(false);
    const [dontShowToday, setDontShowToday] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && pengaturan) {
            const isAktif = pengaturan.pemberitahuan_aktif === '1';
            const gambar = pengaturan.pemberitahuan_gambar;

            if (isAktif && gambar) {
                // Get today's local date string YYYY-MM-DD
                const d = new Date();
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const todayStr = `${year}-${month}-${day}`;

                const lastShown = localStorage.getItem('bka_popup_last_shown');
                if (lastShown !== todayStr) {
                    setShowPopup(true);
                }
            }
        }
    }, [pengaturan]);

    // Prevent background scrolling when popup is open
    useEffect(() => {
        if (showPopup) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [showPopup]);

    const handleClosePopup = () => {
        if (typeof window !== 'undefined' && dontShowToday) {
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;

            localStorage.setItem('bka_popup_last_shown', todayStr);
        }
        setIsExiting(true);
        setTimeout(() => {
            setShowPopup(false);
            setIsExiting(false);
        }, 300); // 300ms matches duration-300
    };
    // ----------------------------------------------------
    // Fallback Mock Data for UI Visual Completeness
    // ----------------------------------------------------
    // ----------------------------------------------------
    // Resolve Dynamic Data & Fallback Mock Data
    // ----------------------------------------------------
    const finalBanners = banners || [];
    const finalKepalaBiro = kepalaBiro || null;

    const finalBidangs = bidangs || [];

    const resolvedLayananItems =
        layanan?.items && layanan.items.length > 0
            ? layanan.items.map((item: any) => {
                  const IconComponent = IconMap[item.icon] || CheckCircle2;
                  return {
                      icon: IconComponent,
                      title: item.title,
                      description: item.description,
                  };
              })
            : [];

    const finalLayanan = {
        judul_section: layanan?.judul_section || '',
        deskripsi_section: layanan?.deskripsi_section || '',
        youtube_url: layanan?.youtube_url || '',
        layananList: resolvedLayananItems,
    };
    const finalStats =
        stats && stats.length > 0
            ? stats.map((item: any) => {
                  const IconComponent = IconMap[item.icon] || Award;
                  return {
                      icon: IconComponent,
                      value: item.value,
                      label: item.label,
                  };
              })
            : [];
    const finalBerita = beritaTerbaru || [];

    const finalPengumuman = pengumumanTerbaru || [];

    return (
        <>
            <Seo title="Beranda" />

            <div className="flex w-full flex-col">
                    {/* Seksi 1: Hero Slider */}
                    <div className="overflow-hidden">
                        <HeroSlider slides={finalBanners} />
                    </div>

                    {/* Seksi 2: Kata Sambutan */}
                    <div className="overflow-hidden">
                        <SambutanSection kepalaBiro={finalKepalaBiro} />
                    </div>

                    {/* Seksi 3: Bidang / Bagian */}
                    <div className="overflow-hidden bka-lazy-section">
                        <BidangSection bidangList={finalBidangs} />
                    </div>

                    {/* Seksi 4: Layanan */}
                    <div className="bka-lazy-section">
                        <LayananSection
                            title={finalLayanan.judul_section}
                            description={finalLayanan.deskripsi_section}
                            youtubeEmbedUrl={finalLayanan.youtube_url}
                            layananList={finalLayanan.layananList}
                        />
                    </div>

                    {/* Seksi 5: Sorotan Berita Terbaru */}
                    <div className="overflow-hidden bka-lazy-section">
                        <BeritaSection beritaList={finalBerita} />
                    </div>

                    {/* Seksi 6: Sorotan Pengumuman Terbaru */}
                    <div className="overflow-hidden bka-lazy-section">
                        <PengumumanSection pengumumanList={finalPengumuman} />
                    </div>

                    {/* Seksi 7: Statistik Kelembagaan */}
                    <div className="overflow-hidden bka-lazy-section">
                        <StatistikSection stats={finalStats} />
                    </div>

                    {/* Seksi Tambahan: CTA Dokumentasi */}
                    <div className="overflow-hidden bka-lazy-section">
                        <CtaDokumentasi images={galeriTerbaru} />
                    </div>
                </div>

            {/* Modal Popup Pemberitahuan */}
            {showPopup && (
                <div
                    onClick={handleClosePopup}
                    className={`fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 p-4 backdrop-blur-xs transition-all duration-300 select-none ${
                        isExiting
                            ? 'animate-out duration-300 fade-out'
                            : 'animate-in duration-300 fade-in'
                    }`}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`relative flex w-full max-w-2xl flex-col items-center justify-center bg-transparent transition-all duration-300 ${
                            isExiting
                                ? 'animate-out duration-300 zoom-out-95 fade-out'
                                : 'animate-in duration-300 zoom-in-95 fade-in'
                        }`}
                    >
                        {/* Close button top-right */}
                        <button
                            onClick={handleClosePopup}
                            className="text-neutral-850 border-neutral-250/30 absolute -top-4 -right-4 z-50 cursor-pointer rounded-full border bg-white p-2 shadow-md transition-all hover:bg-neutral-100 hover:text-black"
                            aria-label="Tutup"
                        >
                            <X className="size-5 stroke-[2.5]" />
                        </button>

                        {/* Flyer image */}
                        <div className="flex h-auto w-full items-center justify-center overflow-hidden rounded-2xl shadow-2xl">
                            {pengaturan.pemberitahuan_link_url ? (
                                <a
                                    href={pengaturan.pemberitahuan_link_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block h-full w-full cursor-pointer transition-opacity hover:opacity-95"
                                    onClick={handleClosePopup}
                                >
                                    <img
                                        src={pengaturan.pemberitahuan_gambar}
                                        alt="Flyer Pemberitahuan"
                                        width="800"
                                        height="1000"
                                        className="h-auto max-h-[75vh] w-full rounded-2xl object-contain"
                                    />
                                </a>
                            ) : (
                                <img
                                    src={pengaturan.pemberitahuan_gambar}
                                    alt="Flyer Pemberitahuan"
                                    width="800"
                                    height="1000"
                                    className="h-auto max-h-[75vh] w-full rounded-2xl object-contain"
                                />
                            )}
                        </div>

                        {/* Optional Description Text */}
                        {pengaturan.pemberitahuan_link_teks && (
                            <p className="mt-3.5 max-w-lg text-center text-xs leading-normal font-semibold text-white/95 drop-shadow-md">
                                {pengaturan.pemberitahuan_link_teks}
                            </p>
                        )}

                        {/* Optional CTA Button */}
                        {pengaturan.pemberitahuan_link_url &&
                            pengaturan.pemberitahuan_tombol_teks && (
                                <a
                                    href={pengaturan.pemberitahuan_link_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-emerald-650 mt-3.5 inline-flex items-center justify-center rounded-xl border border-emerald-500/20 px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:scale-102 hover:bg-emerald-700 active:scale-98"
                                    onClick={handleClosePopup}
                                >
                                    {pengaturan.pemberitahuan_tombol_teks}
                                </a>
                            )}

                        {/* Checkbox "Jangan tampilkan hari ini" */}
                        <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-white/90 drop-shadow-md select-none hover:text-white md:text-sm">
                            <input
                                type="checkbox"
                                checked={dontShowToday}
                                onChange={(e) =>
                                    setDontShowToday(e.target.checked)
                                }
                                className="text-emerald-650 accent-emerald-650 size-4 cursor-pointer rounded border-white/50 bg-transparent transition-all focus:ring-emerald-500 focus:ring-offset-0 focus:outline-none"
                            />
                            <span>Jangan tampilkan hari ini</span>
                        </label>
                    </div>
                </div>
            )}
        </>
    );
}

Home.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>;
