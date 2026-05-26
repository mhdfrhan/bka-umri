import { Head, usePage } from '@inertiajs/react';
import * as Icons from 'lucide-react';
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
}

export default function Home({
    banners = [],
    kepalaBiro = null,
    bidangs = [],
    layanan,
    stats = [],
    beritaTerbaru = [],
    pengumumanTerbaru = [],
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
    const finalBanners =
        banners.length > 0
            ? banners
            : [
                  {
                      id: 1,
                      image: 'assets/bg-umri.jpeg',
                      title: 'Biro Keuangan & Aset UMRI',
                      description:
                          'Mengelola keuangan dan aset secara transparan, akuntabel, dan profesional demi kemajuan civitas akademika Universitas Muhammadiyah Riau.',
                      ctaText: 'Layanan Mahasiswa',
                      ctaHref: '#layanan-bka',
                  },
                  {
                      id: 2,
                      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80',
                      title: 'Transformasi Layanan Keuangan Digital',
                      description:
                          'Kemudahan pembayaran uang kuliah dan administrasi civitas akademika melalui integrasi sistem online yang handal dan aman.',
                      ctaText: 'Panduan Pembayaran',
                      ctaHref: '#pengumuman-terbaru',
                  },
                  {
                      id: 3,
                      image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&q=80',
                      title: 'Sinergi & Akuntabilitas Aset',
                      description:
                          'Mengoptimalkan pemanfaatan dan pencatatan aset universitas secara sistematis guna mendukung sarana prasarana perkuliahan yang unggul.',
                      ctaText: 'Profil BKA',
                      ctaHref: '/profil/tentang-kami',
                  },
              ];

    const finalKepalaBiro = kepalaBiro || {
        nama: 'Rahmawita, S.E',
        jabatan: 'Kepala Biro Keuangan & Aset UMRI',
        periode: 'Periode 2024 - 2028',
        foto: 'https://smart.umri.ac.id/application/modules/personalia/assets/uploads/foto/f405f-rahmawita-se.jpg',
        sambutan:
            "Assalamu'alaikum Warahmatullahi Wabarakatuh. Selamat datang di portal resmi Biro Keuangan dan Aset Universitas Muhammadiyah Riau (UMRI). Biro ini berkomitmen to menyelenggarakan administrasi keuangan dan pengelolaan aset yang transparan, akuntabel, dan berorientasi pada pelayanan prima. Melalui website ini, kami berharap civitas akademika UMRI dan masyarakat luas dapat mengakses informasi serta layanan administrasi keuangan secara cepat, akurat, dan efisien. Kami terus berinovasi mengintegrasikan sistem digital demi kemudahan kita bersama. Terima kasih atas kepercayaan dan kerjasama Anda semua. Wassalamu'alaikum Warahmatullahi Wabarakatuh.",
    };

    const defaultBidangs = [
        {
            slug: 'keuangan',
            nama: 'Bidang Keuangan & Pembiayaan',
            deskripsiSingkat:
                'Mengelola penganggaran, pembukuan, pelaporan keuangan universitas, verifikasi transaksi, serta pelayanan administrasi pembayaran mahasiswa.',
        },
        {
            slug: 'aset',
            nama: 'Bidang Aset & Logistik',
            deskripsiSingkat:
                'Mengatur inventarisasi, distribusi, pemeliharaan sarana prasarana, pengadaan barang, serta optimalisasi pemanfaatan aset fisik Universitas Muhammadiyah Riau.',
        },
    ];
    const finalBidangs = bidangs.length > 0 ? bidangs : defaultBidangs;

    // Resolve Layanan Icons Dynamically
    const resolvedLayananItems =
        layanan?.items && layanan.items.length > 0
            ? layanan.items.map((item: any) => {
                  const IconComponent =
                      (Icons as any)[item.icon] || Icons.CheckCircle2;
                  return {
                      icon: IconComponent,
                      title: item.title,
                      description: item.description,
                  };
              })
            : [
                  {
                      icon: Icons.CheckCircle2,
                      title: 'Sistemasi Administrasi Keuangan',
                      description:
                          'Kepengurusan pembayaran tidak perlu membawa kertas/berkas lagi, semua sudah tercatat dalam sistem online.',
                  },
                  {
                      icon: Icons.CreditCard,
                      title: 'Pembayaran Uang Kuliah Online Maupun Di Kampus',
                      description:
                          'Kami memberi keleluasaan pembayaran instan via online maupun langsung datang ke kampus melalui teller Bank rekanan.',
                  },
                  {
                      icon: Icons.Landmark,
                      title: 'Pilihan Bank Rekanan',
                      description:
                          'Pembayaran online bisa dibayarkan melalui banyak pilihan bank rekanan yang tersebar di pelosok daerah.',
                  },
              ];

    const finalLayanan = {
        judul_section:
            layanan?.judul_section ||
            'Kemudahan Layanan Finansial & Administrasi',
        deskripsi_section:
            layanan?.deskripsi_section ||
            'BKA memahami kemudahan transaksi adalah kunci kenyamanan akademik. Kami memfasilitasi berbagai bentuk kemudahan administrasi berikut.',
        youtube_url:
            layanan?.youtube_url ||
            'https://www.youtube.com/embed/4SI1Q-JkVm8?si=aSmMt81oihsA4yLQ',
        layananList: resolvedLayananItems,
    };

    // Resolve Stats Icons Dynamically
    const finalStats =
        stats && stats.length > 0
            ? stats.map((item: any) => {
                  const IconComponent =
                      (Icons as any)[item.icon] || Icons.Award;
                  return {
                      icon: IconComponent,
                      value: item.value,
                      label: item.label,
                  };
              })
            : [
                  {
                      icon: Icons.Building2,
                      value: '2015',
                      label: 'Tahun Berdiri',
                  },
                  {
                      icon: Icons.Users,
                      value: '25+',
                      label: 'Staf Berpengalaman',
                  },
                  {
                      icon: Icons.Award,
                      value: '40+',
                      label: 'Unit Kerja Dilayani',
                  },
                  {
                      icon: Icons.BookOpen,
                      value: '1.000+',
                      label: 'Dokumen Dikelola',
                  },
              ];

    const defaultBerita = [
        {
            slug: 'bka-luncurkan-sistem-keuangan-baru-2026',
            thumbnail:
                'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
            category: 'Layanan',
            title: 'BKA UMRI Luncurkan Portal Keuangan Terintegrasi untuk Mahasiswa',
            excerpt:
                'Mulai semester ganjil ini, seluruh layanan administrasi keuangan dan pembayaran kuliah diintegrasikan dalam satu sistem online untuk mempermudah civitas akademika.',
            date: '2026-05-20',
            author: 'Admin BKA',
        },
        {
            slug: 'workshop-pengelolaan-aset-muhammadiyah',
            thumbnail:
                'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
            category: 'Kegiatan',
            title: 'Workshop Sinergi & Optimalisasi Aset Kampus bersama Wilayah Muhammadiyah',
            excerpt:
                'Biro Keuangan dan Aset UMRI menggelar workshop intensif membahas standarisasi pencatatan dan optimalisasi sarana fisik guna mencapai predikat kampus unggul.',
            date: '2026-05-15',
            author: 'Humas UMRI',
        },
        {
            slug: 'sosialisasi-pembayaran-mitra-perbankan',
            thumbnail:
                'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80',
            category: 'Mitra',
            title: 'Perluas Akses, UMRI Jalin Kerja Kerja Sama dengan 4 Bank Rekanan Baru',
            excerpt:
                'Kini mahasiswa dapat melakukan pembayaran SPP dan uang pembangunan melalui jaringan ATM, M-Banking, maupun teller di empat bank mitra resmi nasional.',
            date: '2026-05-10',
            author: 'Bagian Keuangan',
        },
        {
            slug: 'bka-umri-raih-penghargaan-akuntabilitas-terbaik-2026',
            thumbnail:
                'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80',
            category: 'Prestasi',
            title: 'BKA UMRI Raih Penghargaan Pengelolaan Keuangan & Akuntabilitas Terbaik 2026',
            excerpt:
                'Dalam Rapat Koordinasi Tahunan, Biro Keuangan & Aset UMRI mendapatkan apresiasi tinggi atas implementasi transparansi tata kelola keuangan yang bersih.',
            date: '2026-05-05',
            author: 'Rektorat',
        },
    ];
    const finalBerita =
        beritaTerbaru.length > 0
            ? beritaTerbaru.length < 3
                ? [
                      ...beritaTerbaru,
                      ...defaultBerita.slice(beritaTerbaru.length, 3),
                  ]
                : beritaTerbaru.slice(0, 3)
            : defaultBerita.slice(0, 3);

    const defaultPengumuman = [
        {
            slug: 'jadwal-registrasi-keuangan-semester-ganjil-2026',
            title: 'Jadwal & Prosedur Registrasi Keuangan Semester Ganjil TA 2026/2027',
            date: '2026-05-22',
            isPenting: true,
            excerpt:
                'Diberitahukan kepada seluruh mahasiswa Universitas Muhammadiyah Riau bahwa registrasi keuangan semester ganjil dimulai tanggal 1 Juni s.d. 30 Juli 2026.',
        },
        {
            slug: 'panduan-pembayaran-va-mahasiswa',
            title: 'Panduan Pembayaran Uang Kuliah Melalui Virtual Account (VA) Bank Mitra',
            date: '2026-05-18',
            isPenting: false,
            excerpt:
                'Simak tata cara lengkap pembayaran SPP via m-banking dan ATM untuk Bank Syariah Indonesia (BSI), Bank Muamalat, Bank Bukopin, dan Bank Riau Kepri.',
        },
        {
            slug: 'kebijakan-keringanan-biaya-kuliah-2026',
            title: 'Pengajuan Dispensasi dan Keringanan Pembayaran SPP Mahasiswa Aktif',
            date: '2026-05-12',
            isPenting: true,
            excerpt:
                'BKA membuka pendaftaran berkas dispensasi keringanan pembayaran kuliah hingga 15 Juni 2026 bagi mahasiswa yang memenuhi kriteria berkas pendukung.',
        },
    ];
    const finalPengumuman =
        pengumumanTerbaru.length > 0 ? pengumumanTerbaru : defaultPengumuman;

    return (
        <>
            <Head>
                <title>{`Beranda - ${siteName}`}</title>
                <meta name="description" content={siteDescription} />
            </Head>

            <div className="flex w-full flex-col">
                {/* Seksi 1: Hero Slider */}
                <HeroSlider slides={finalBanners} />

                {/* Seksi 2: Kata Sambutan */}
                <SambutanSection kepalaBiro={finalKepalaBiro} />

                {/* Seksi 3: Bidang / Bagian */}
                <BidangSection bidangList={finalBidangs} />

                {/* Seksi 4: Layanan */}
                <LayananSection
                    title={finalLayanan.judul_section}
                    description={finalLayanan.deskripsi_section}
                    youtubeEmbedUrl={finalLayanan.youtube_url}
                    layananList={finalLayanan.layananList}
                />

                {/* Seksi 5: Sorotan Berita Terbaru */}
                <BeritaSection beritaList={finalBerita} />

                {/* Seksi 6: Sorotan Pengumuman Terbaru */}
                <PengumumanSection pengumumanList={finalPengumuman} />

                {/* Seksi 7: Statistik Kelembagaan */}
                <StatistikSection stats={finalStats} />

                {/* Seksi Tambahan: CTA Dokumentasi */}
                <CtaDokumentasi />
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
                            <Icons.X className="size-5 stroke-[2.5]" />
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
                                        className="h-auto max-h-[75vh] w-full rounded-2xl object-contain"
                                    />
                                </a>
                            ) : (
                                <img
                                    src={pengaturan.pemberitahuan_gambar}
                                    alt="Flyer Pemberitahuan"
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
