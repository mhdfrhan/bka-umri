import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Search } from 'lucide-react';
import AnnouncementItem from '@/components/ui/announcement-item';
import { Pagination } from '@/components/ui/pagination';
import { useScrollReveal, useScrollRevealChildren } from '@/hooks/use-scroll-reveal';

interface PengumumanItem {
    slug: string;
    title: string;
    date: string;
    isPenting?: boolean;
    excerpt?: string;
}

// ─── Dummy Data ───
const dummyPengumuman: PengumumanItem[] = [
    {
        slug: 'jadwal-registrasi-keuangan-semester-ganjil-2026',
        title: 'Jadwal & Prosedur Registrasi Keuangan Semester Ganjil TA 2026/2027',
        date: '22 Mei 2026',
        isPenting: true,
        excerpt: 'Diberitahukan kepada seluruh mahasiswa Universitas Muhammadiyah Riau bahwa registrasi keuangan semester ganjil dimulai tanggal 1 Juni s.d. 30 Juli 2026.'
    },
    {
        slug: 'panduan-pembayaran-va-mahasiswa',
        title: 'Panduan Pembayaran Uang Kuliah Melalui Virtual Account (VA) Bank Mitra',
        date: '18 Mei 2026',
        isPenting: false,
        excerpt: 'Simak tata cara lengkap pembayaran SPP via m-banking dan ATM untuk Bank Syariah Indonesia (BSI), Bank Muamalat, Bank Bukopin, dan Bank Riau Kepri.'
    },
    {
        slug: 'kebijakan-keringanan-biaya-kuliah-2026',
        title: 'Pengajuan Dispensasi dan Keringanan Pembayaran SPP Mahasiswa Aktif',
        date: '12 Mei 2026',
        isPenting: true,
        excerpt: 'BKA membuka pendaftaran berkas dispensasi keringanan pembayaran kuliah hingga 15 Juni 2026 bagi mahasiswa yang memenuhi kriteria berkas pendukung.'
    },
    {
        slug: 'batas-akhir-pengajuan-spj-semester-genap',
        title: 'Batas Akhir Pengajuan SPJ Semester Genap 2025/2026',
        date: '05 Mei 2026',
        isPenting: true,
        excerpt: 'Seluruh unit kerja diwajibkan mengumpulkan SPJ paling lambat tanggal 30 Mei 2026 pukul 16.00 WIB ke loket administrasi BKA.'
    },
    {
        slug: 'jadwal-verifikasi-keuangan-juni',
        title: 'Jadwal Verifikasi Keuangan Bulan Juni 2026',
        date: '28 April 2026',
        isPenting: false,
        excerpt: 'Verifikasi keuangan akan dilaksanakan sesuai jadwal yang telah ditetapkan untuk setiap unit kerja (Fakultas dan Lembaga).'
    },
    {
        slug: 'perubahan-alur-pengajuan-dana-kegiatan',
        title: 'Perubahan Alur Pengajuan Dana Kegiatan Kemahasiswaan',
        date: '20 April 2026',
        isPenting: false,
        excerpt: 'Terdapat penyesuaian prosedur pengajuan dana kegiatan kemahasiswaan mulai bulan Mei 2026 yang wajib disetujui oleh BEM Universitas.'
    },
];

const dummyPagination = [
    { url: null, label: 'Prev', active: false },
    { url: '/pengumuman?page=1', label: '1', active: true },
    { url: '/pengumuman?page=2', label: '2', active: false },
    { url: '/pengumuman?page=3', label: '3', active: false },
    { url: '/pengumuman?page=2', label: 'Next', active: false },
];

export default function PengumumanIndex() {
    const [searchQuery, setSearchQuery] = useState('');

    const heroRef = useScrollReveal<HTMLDivElement>();
    const listRef = useScrollRevealChildren<HTMLDivElement>('.bka-reveal');

    return (
        <>
            <Head title="Pengumuman Resmi - BKA UMRI">
                <meta
                    name="description"
                    content="Daftar pengumuman dan informasi resmi penting dari Biro Keuangan dan Aset Universitas Muhammadiyah Riau."
                />
            </Head>

            {/* Hero Section */}
            <section className="relative flex min-h-[200px] items-center justify-center overflow-hidden bg-[#1B5E20] md:min-h-[260px]">
                <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-15"
                    style={{
                        backgroundImage:
                            'radial-gradient(#ffffff 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />
                <div ref={heroRef} className="bka-reveal bka-container relative z-[1] py-12 text-center">
                    <h1
                        className="mx-auto max-w-[720px] font-bold leading-[1.2] text-white"
                        style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
                    >
                        Pengumuman Resmi
                    </h1>
                    <p className="mx-auto mt-4 max-w-[600px] text-[15px] leading-relaxed text-white/80 md:text-[16px]">
                        Informasi administrasi, jadwal registrasi, dan pemberitahuan penting lainnya.
                    </p>
                </div>
            </section>

            <section className="bg-[#F7F9F7] py-12 md:py-16">
                <div className="bka-container">
                    <div className="mx-auto max-w-[800px]">
                        
                        {/* Search Bar */}
                        <div className="mb-8 flex justify-end">
                            <div className="relative w-full md:max-w-[320px]">
                                <input
                                    type="text"
                                    placeholder="Cari pengumuman..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-xl border border-[#DDE5DD] bg-white py-3 pl-11 pr-4 text-[14px] text-[#1A1A1A] shadow-sm transition-colors focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
                                />
                                <Search
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9EAAB2]"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div ref={listRef} className="flex flex-col gap-4">
                            {dummyPengumuman.map((item, idx) => (
                                <div key={item.slug} className={`bka-reveal bka-stagger-${(idx % 6) + 1}`}>
                                    <AnnouncementItem {...item} />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-12">
                            <Pagination links={dummyPagination} />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
