import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { CheckCircle2, CreditCard, Landmark } from 'lucide-react';
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
    icon: typeof CheckCircle2;
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
    beritaTerbaru?: NewsItem[];
    pengumumanTerbaru?: PengumumanItem[];
}

export default function Home({
    banners = [],
    kepalaBiro = null,
    bidangs = [],
    layanan,
    beritaTerbaru = [],
    pengumumanTerbaru = [],
}: HomeProps) {
    const [liveBerita, setLiveBerita] = useState<NewsItem[]>([]);
    const [livePengumuman, setLivePengumuman] = useState<PengumumanItem[]>([]);
    const [liveBidangs, setLiveBidangs] = useState<BidangItem[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Sync Bidang
            const savedBidangs = localStorage.getItem('bka_bidangs');
            if (savedBidangs) {
                try {
                    const parsed = JSON.parse(savedBidangs);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setLiveBidangs(
                            parsed.map((b: any) => ({
                                slug: b.slug,
                                nama: b.nama,
                                deskripsiSingkat:
                                    b.deskripsiSingkat ||
                                    b.deskripsi_singkat ||
                                    '',
                            })),
                        );
                    }
                } catch {}
            }

            // Sync Berita
            const savedNews = localStorage.getItem('bka_berita');
            if (savedNews) {
                try {
                    const parsed = JSON.parse(savedNews);
                    if (Array.isArray(parsed)) {
                        const published = parsed
                            .filter((n: any) => n.status === 'terpublikasi')
                            .slice(0, 4);
                        if (published.length > 0) {
                            setLiveBerita(published);
                        }
                    }
                } catch {}
            }

            // Sync Pengumuman
            const savedAnnouncements = localStorage.getItem('bka_pengumuman');
            if (savedAnnouncements) {
                try {
                    const parsed = JSON.parse(savedAnnouncements);
                    if (Array.isArray(parsed)) {
                        const published = parsed.filter(
                            (p: any) =>
                                p.status === 'terpublikasi' ||
                                p.status === undefined,
                        );
                        const sorted = [...published]
                            .sort((a, b) => {
                                if (a.is_penting && !b.is_penting) return -1;
                                if (!a.is_penting && b.is_penting) return 1;
                                return (
                                    new Date(b.date).getTime() -
                                    new Date(a.date).getTime()
                                );
                            })
                            .slice(0, 3);
                        if (sorted.length > 0) {
                            setLivePengumuman(sorted);
                        }
                    }
                } catch {}
            }
        }
    }, []);

    // ----------------------------------------------------
    // Fallback Mock Data for UI Visual Completeness
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
            "Assalamu'alaikum Warahmatullahi Wabarakatuh. Selamat datang di portal resmi Biro Keuangan dan Aset Universitas Muhammadiyah Riau (UMRI). Biro ini berkomitmen untuk menyelenggarakan administrasi keuangan dan pengelolaan aset yang transparan, akuntabel, dan berorientasi pada pelayanan prima. Melalui website ini, kami berharap civitas akademika UMRI dan masyarakat luas dapat mengakses informasi serta layanan administrasi keuangan secara cepat, akurat, dan efisien. Kami terus berinovasi mengintegrasikan sistem digital demi kemudahan kita bersama. Terima kasih atas kepercayaan dan kerjasama Anda semua. Wassalamu'alaikum Warahmatullahi Wabarakatuh.",
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
    const finalBidangs =
        liveBidangs.length > 0
            ? liveBidangs
            : bidangs.length > 0
              ? bidangs
              : defaultBidangs;

    const finalLayananList = layanan?.items || [
        {
            icon: CheckCircle2,
            title: 'Sistemasi Administrasi Keuangan',
            description:
                'Kepengurusan pembayaran tidak perlu membawa kertas/berkas lagi, semua sudah tercatat dalam sistem online.',
        },
        {
            icon: CreditCard,
            title: 'Pembayaran Uang Kuliah Online Maupun Di Kampus',
            description:
                'Kami memberi keleluasaan pembayaran instan via online maupun langsung datang ke kampus melalui teller Bank rekanan.',
        },
        {
            icon: Landmark,
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
        layananList: finalLayananList,
    };

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
        liveBerita.length > 0
            ? liveBerita.length < 4
                ? [...liveBerita, ...defaultBerita.slice(liveBerita.length, 4)]
                : liveBerita
            : beritaTerbaru.length > 0
              ? beritaTerbaru.length < 4
                  ? [
                        ...beritaTerbaru,
                        ...defaultBerita.slice(beritaTerbaru.length, 4),
                    ]
                  : beritaTerbaru
              : defaultBerita;

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
        livePengumuman.length > 0
            ? livePengumuman
            : pengumumanTerbaru.length > 0
              ? pengumumanTerbaru
              : defaultPengumuman;

    return (
        <>
            <Head>
                <title>Beranda - Biro Keuangan & Aset UMRI</title>
                <meta
                    name="description"
                    content="Portal resmi Biro Keuangan dan Aset Universitas Muhammadiyah Riau (UMRI). Menyediakan layanan administrasi keuangan dan informasi pengelolaan aset yang transparan dan akuntabel."
                />
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
                <StatistikSection />

                {/* Seksi Tambahan: CTA Dokumentasi */}
                <CtaDokumentasi />
            </div>
        </>
    );
}

Home.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>;
