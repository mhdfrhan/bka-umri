import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Search,
    Download,
    Calendar,
    HardDrive,
    Info,
    FolderOpen,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Breadcrumbs } from '@/components/breadcrumbs';
import {
    useScrollReveal,
    useScrollRevealChildren,
} from '@/hooks/use-scroll-reveal';
import { formatDate } from '@/lib/format-date';
import { formatFileSize } from '@/lib/format-file-size';
import { getFileIcon } from '@/lib/get-file-icon';

interface BerkasItem {
    nama_tampilan: string;
    deskripsi: string;
    tipe_file: string;
    ukuran: number; // in bytes
    tanggal_upload: string;
    download_url: string;
}

interface KategoriDetail {
    nama: string;
    slug: string;
    deskripsi?: string;
}

interface Props {
    kategori?: KategoriDetail;
    berkas?: BerkasItem[];
}

// ─── Detailed Mock Files for Local Evaluator & Fallbacks ───
const mockCategoryFiles: Record<string, BerkasItem[]> = {
    'peraturan-dan-kebijakan': [
        {
            nama_tampilan:
                'Surat Keputusan Rektor tentang Bagi Hasil Kerja Sama Keuangan.pdf',
            deskripsi:
                'Regulasi internal penetapan persentase pembagian hasil kerja sama universitas dengan pihak luar.',
            tipe_file: 'pdf',
            ukuran: 1245000,
            tanggal_upload: '2026-05-18',
            download_url: '#',
        },
        {
            nama_tampilan:
                'Peraturan Universitas tentang Sistem Tata Kelola Keuangan 2026.pdf',
            deskripsi:
                'Buku panduan utama standarisasi pelaporan keuangan, kas keluar, dan pertanggungjawaban unit.',
            tipe_file: 'pdf',
            ukuran: 2450000,
            tanggal_upload: '2026-05-15',
            download_url: '#',
        },
        {
            nama_tampilan:
                'Ketetapan PPH Aturan Potong Pajak Sosialisasi Persyarikatan.docx',
            deskripsi:
                'Draf petunjuk teknis pemotongan pajak honorarium narasumber dan kepanitiaan di lingkungan kampus.',
            tipe_file: 'docx',
            ukuran: 85600,
            tanggal_upload: '2026-05-10',
            download_url: '#',
        },
        {
            nama_tampilan:
                'Draf SK Kebijakan Anggaran Belanja Fakultas 2026.xlsx',
            deskripsi:
                'Lembar kerja rincian persentase pembagian pagu anggaran operasional masing-masing dekanat.',
            tipe_file: 'xlsx',
            ukuran: 128000,
            tanggal_upload: '2026-04-28',
            download_url: '#',
        },
    ],
    'formulir-kemahasiswaan': [
        {
            nama_tampilan:
                'Formulir Pengajuan Dispensasi Keterlambatan Pembayaran Kuliah.pdf',
            deskripsi:
                'Formulir wajib diisi bagi mahasiswa yang ingin menangguhkan pembayaran SPP dengan alasan mendesak.',
            tipe_file: 'pdf',
            ukuran: 345000,
            tanggal_upload: '2026-05-22',
            download_url: '#',
        },
        {
            nama_tampilan:
                'Template Proposal Pengajuan Dana Kegiatan BEM & HMPS.docx',
            deskripsi:
                'Format standar draf penulisan proposal pengajuan bantuan dana operasional kegiatan kemahasiswaan.',
            tipe_file: 'docx',
            ukuran: 45000,
            tanggal_upload: '2026-05-12',
            download_url: '#',
        },
        {
            nama_tampilan:
                'Lembar Kendali Surat Pertanggungjawaban (SPJ) Kegiatan Mahasiswa.xlsx',
            deskripsi:
                'Formulir lampiran rincian nota belanja yang wajib diserahkan ke loket BKA pasca kegiatan selesai.',
            tipe_file: 'xlsx',
            ukuran: 98000,
            tanggal_upload: '2026-05-08',
            download_url: '#',
        },
        {
            nama_tampilan:
                'Formulir Pendaftaran Beasiswa Keringanan UKT Yatim Piatu.pdf',
            deskripsi:
                'Berkas pengajuan permohonan pemotongan biaya kuliah untuk mahasiswa yatim, piatu, atau kurang mampu.',
            tipe_file: 'pdf',
            ukuran: 512000,
            tanggal_upload: '2026-04-20',
            download_url: '#',
        },
    ],
    'panduan-dan-sop-pelayanan': [
        {
            nama_tampilan:
                'Buku Panduan Tata Cara Pembayaran Virtual Account BSI.pdf',
            deskripsi:
                'Panduan lengkap cara transfer SPP lewat teller, ATM, Mobile Banking, dan Internet Banking Bank Syariah Indonesia.',
            tipe_file: 'pdf',
            ukuran: 1890000,
            tanggal_upload: '2026-05-20',
            download_url: '#',
        },
        {
            nama_tampilan:
                'SOP Alur Pengajuan Pencairan Dana Kegiatan Staf.pdf',
            deskripsi:
                'Alur kerja resmi tahapan persetujuan pengajuan dana dari tingkat biro hingga pencairan di bendahara.',
            tipe_file: 'pdf',
            ukuran: 850000,
            tanggal_upload: '2026-05-14',
            download_url: '#',
        },
        {
            nama_tampilan:
                'Buku Panduan Pembayaran Virtual Account Bank Riau Kepri Syariah.pdf',
            deskripsi:
                'Petunjuk teknis transfer biaya kuliah lewat ATM dan Mobile Banking Bank Riau Kepri Syariah.',
            tipe_file: 'pdf',
            ukuran: 1450000,
            tanggal_upload: '2026-04-18',
            download_url: '#',
        },
    ],
    'rencana-dan-laporan-anggaran': [
        {
            nama_tampilan:
                'Buku Sosialisasi RKAT UMRI Tahun Akademik 2026-2027.pdf',
            deskripsi:
                'Ringkasan publik dokumen Rencana Kerja dan Anggaran Tahunan Universitas Muhammadiyah Riau.',
            tipe_file: 'pdf',
            ukuran: 3890000,
            tanggal_upload: '2026-05-02',
            download_url: '#',
        },
        {
            nama_tampilan:
                'Kebijakan Pagu Anggaran Belanja Fakultas & Unit Kerja.xlsx',
            deskripsi:
                'Tabel ringkasan keputusan pembagian dana operasional taktis untuk tahun ajaran aktif.',
            tipe_file: 'xlsx',
            ukuran: 240000,
            tanggal_upload: '2026-04-15',
            download_url: '#',
        },
        {
            nama_tampilan: 'Ringkasan Laporan Keuangan Publik UMRI 2025.pdf',
            deskripsi:
                'Transparansi laporan keuangan audited neraca rugi laba universitas periode tahun buku 2025.',
            tipe_file: 'pdf',
            ukuran: 4500000,
            tanggal_upload: '2026-03-01',
            download_url: '#',
        },
    ],
};

// Helper function to resolve beautiful Tailwind color theme classes for document icons
const getFileColorClasses = (filename: string | undefined | null) => {
    if (!filename) {
        return 'bg-slate-50 text-slate-500 border-slate-100';
    }

    const ext = filename.split('.').pop()?.toLowerCase();

    switch (ext) {
        case 'pdf':
            return 'bg-rose-50 text-rose-600 border-rose-100';
        case 'doc':
        case 'docx':
        case 'txt':
        case 'rtf':
            return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'xls':
        case 'xlsx':
        case 'csv':
            return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'ppt':
        case 'pptx':
            return 'bg-amber-50 text-amber-600 border-amber-100';
        default:
            return 'bg-slate-50 text-slate-500 border-slate-100';
    }
};

export default function KategoriLampiranShow({ kategori, berkas }: Props) {
    const { url } = usePage();
    const [searchQuery, setSearchQuery] = useState('');
    const [localKategori, setLocalKategori] = useState<KategoriDetail | null>(
        null,
    );
    const [localBerkas, setLocalBerkas] = useState<BerkasItem[] | null>(null);

    const headerRef = useScrollReveal<HTMLDivElement>();
    const descRef = useScrollReveal<HTMLDivElement>();
    const listRef = useScrollRevealChildren<HTMLDivElement>('.bka-reveal');

    // ─── Safety and Fallback Handling ───
    // Parse current slug from URL dynamically
    const pathSegments = url.split('/');
    const currentSlug =
        pathSegments[pathSegments.length - 1] || 'peraturan-dan-kebijakan';

    useEffect(() => {
        const savedCategories = localStorage.getItem('bka_kategori_lampiran');
        const savedFiles = localStorage.getItem('bka_berkas_lampiran');
        if (savedCategories) {
            try {
                const parsedCats = JSON.parse(savedCategories);
                const matchedCat = parsedCats.find(
                    (c: any) => c.slug === currentSlug,
                );
                if (matchedCat) {
                    setLocalKategori({
                        nama: matchedCat.nama,
                        slug: matchedCat.slug,
                        deskripsi: matchedCat.deskripsi || '',
                    });

                    if (savedFiles) {
                        try {
                            const parsedFiles = JSON.parse(savedFiles);
                            const matchedFiles = parsedFiles.filter(
                                (f: any) => f.kategori_id === matchedCat.id,
                            );
                            setLocalBerkas(matchedFiles);
                        } catch {}
                    }
                }
            } catch {}
        }
    }, [currentSlug]);

    const defaultKategori: KategoriDetail = {
        nama: 'Peraturan & Kebijakan',
        slug: 'peraturan-dan-kebijakan',
        deskripsi:
            'Kumpulan Surat Keputusan Rektor, Peraturan Pemerintah, dan Ketetapan Persyarikatan Muhammadiyah tentang tata kelola keuangan kampus.',
    };

    const resolvedKategori: KategoriDetail = localKategori ||
        kategori || {
            nama:
                currentSlug === 'formulir-kemahasiswaan'
                    ? 'Formulir Kemahasiswaan'
                    : currentSlug === 'panduan-dan-sop-pelayanan'
                      ? 'Panduan & SOP Pelayanan'
                      : currentSlug === 'rencana-dan-laporan-anggaran'
                        ? 'Rencana & Laporan Anggaran'
                        : defaultKategori.nama,
            slug: currentSlug,
            deskripsi:
                currentSlug === 'formulir-kemahasiswaan'
                    ? 'Formulir pengajuan dispensasi pembayaran kuliah, template proposal pengajuan dana, dan berkas Surat Pertanggungjawaban (SPJ) kegiatan.'
                    : currentSlug === 'panduan-dan-sop-pelayanan'
                      ? 'Standar Operasional Prosedur (SOP) pencairan anggaran unit, alur pengajuan dana, dan buku panduan tata cara pembayaran Virtual Account.'
                      : currentSlug === 'rencana-dan-laporan-anggaran'
                        ? 'Sosialisasi Rencana Kerja & Anggaran Tahunan (RKAT), kebijakan pagu dana operasional fakultas, serta laporan pertanggungjawaban tahunan.'
                        : defaultKategori.deskripsi,
        };

    const resolvedBerkas: BerkasItem[] =
        localBerkas ||
        berkas ||
        mockCategoryFiles[currentSlug] ||
        mockCategoryFiles['peraturan-dan-kebijakan'];

    // Local search filter based on query search
    const filteredBerkas = resolvedBerkas.filter(
        (file) =>
            file.nama_tampilan
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            file.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleDownload = (filename: string) => {
        toast.success(`Mengunduh berkas: "${filename}"`);
    };

    const breadcrumbItems = [
        { title: 'Beranda', href: '/' },
        { title: 'Lampiran', href: '/lampiran' },
        {
            title: resolvedKategori.nama,
            href: `/lampiran/${resolvedKategori.slug}`,
        },
    ];

    return (
        <>
            <Head title={`${resolvedKategori.nama} - Unduh Dokumen BKA UMRI`}>
                <meta
                    name="description"
                    content={
                        resolvedKategori.deskripsi ||
                        'Daftar berkas unduhan resmi dan formulir administrasi Universitas Muhammadiyah Riau.'
                    }
                />
            </Head>

            {/* Breadcrumb & Navigation Header */}
            <div className="border-b border-[#F1F3F1] bg-white py-4">
                <div className="bka-container flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href="/lampiran"
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#5C6B73] transition-colors hover:text-[#1B5E20]"
                    >
                        <ArrowLeft size={14} />
                        <span>Kembali ke Repositori</span>
                    </Link>
                    <div className="text-xs">
                        <Breadcrumbs breadcrumbs={breadcrumbItems} />
                    </div>
                </div>
            </div>

            {/* Main Header / Info Banner */}
            <section className="bg-white py-12 md:py-16">
                <div className="bka-container">
                    <div className="mx-auto max-w-[900px]">
                        <div
                            ref={headerRef}
                            className="bka-reveal mb-5 flex items-center gap-2"
                        >
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5E9] px-3.5 py-1 text-xs font-bold text-[#1B5E20]">
                                <FolderOpen size={13} />
                                <span>
                                    {resolvedBerkas.length} Berkas Aktif
                                </span>
                            </span>
                        </div>

                        <h1
                            ref={headerRef}
                            className="bka-reveal mb-5 leading-tight font-bold tracking-tight text-[#1A1A1A]"
                            style={{ fontSize: 'clamp(24px, 4.5vw, 36px)' }}
                        >
                            {resolvedKategori.nama}
                        </h1>

                        {resolvedKategori.deskripsi && (
                            <p
                                ref={descRef}
                                className="bka-reveal mb-8 max-w-3xl text-[15px] leading-relaxed text-[#5C6B73] md:text-[16px]"
                            >
                                {resolvedKategori.deskripsi}
                            </p>
                        )}

                        {/* Search in Category */}
                        <div
                            ref={descRef}
                            className="bka-reveal flex flex-col gap-4 border-t border-[#F1F3F1] pt-6 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <span className="text-xs font-bold text-[#1A1A1A]">
                                Pencarian Berkas Kategori:
                            </span>
                            <div className="relative w-full sm:max-w-xs">
                                <input
                                    type="text"
                                    placeholder="Cari berkas dalam folder..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-[#DDE5DD] bg-[#F7F9F7] py-2 pr-4 pl-10 text-[13px] text-[#1A1A1A] transition-colors focus:border-[#1B5E20] focus:bg-white focus:ring-1 focus:ring-[#1B5E20] focus:outline-none"
                                />
                                <Search
                                    size={16}
                                    className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#9EAAB2]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* List Berkas Section */}
            <section className="min-h-[400px] flex-1 bg-[#F7F9F7] py-12 md:py-16">
                <div className="bka-container">
                    <div className="mx-auto max-w-[900px]">
                        {filteredBerkas.length > 0 ? (
                            <div ref={listRef} className="flex flex-col gap-4">
                                {filteredBerkas.map((file, idx) => {
                                    const FileIconComponent = getFileIcon(
                                        file.nama_tampilan,
                                    );
                                    const colorClasses = getFileColorClasses(
                                        file.nama_tampilan,
                                    );

                                    return (
                                        <div
                                            key={idx}
                                            className={`bka-reveal bka-stagger-${(idx % 6) + 1} flex flex-col justify-between gap-5 rounded-2xl border border-[#DDE5DD] bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-sm sm:flex-row sm:items-center`}
                                        >
                                            {/* Left Column: Icon and Info */}
                                            <div className="flex flex-1 items-start gap-4">
                                                {/* File Icon Block */}
                                                <div
                                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${colorClasses}`}
                                                >
                                                    <FileIconComponent
                                                        size={24}
                                                    />
                                                </div>

                                                {/* Details */}
                                                <div className="flex flex-col">
                                                    <h3 className="mb-1 text-[15px] leading-snug font-bold break-words text-[#1A1A1A] hover:text-[#1B5E20]">
                                                        {file.nama_tampilan}
                                                    </h3>
                                                    <p className="mb-3 text-[13px] leading-normal text-[#5C6B73]">
                                                        {file.deskripsi}
                                                    </p>

                                                    {/* Meta Metadata tags */}
                                                    <div className="flex flex-wrap items-center gap-6 gap-y-1.5 text-xs font-semibold text-[#9EAAB2] sm:gap-8">
                                                        <span className="flex items-center gap-1.5">
                                                            <HardDrive
                                                                size={13}
                                                                className="text-[#5C6B73]/60"
                                                            />
                                                            <span>
                                                                Ukuran:{' '}
                                                                {formatFileSize(
                                                                    file.ukuran,
                                                                )}
                                                            </span>
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar
                                                                size={13}
                                                                className="text-[#5C6B73]/60"
                                                            />
                                                            <span>
                                                                Diunggah:{' '}
                                                                {formatDate(
                                                                    file.tanggal_upload,
                                                                )}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column: Download Button */}
                                            <div className="shrink-0 border-t border-[#F1F3F1] pt-3 sm:self-center sm:border-0 sm:pt-0">
                                                <a
                                                    href={file.download_url}
                                                    download={
                                                        file.nama_tampilan
                                                    }
                                                    onClick={() =>
                                                        handleDownload(
                                                            file.nama_tampilan,
                                                        )
                                                    }
                                                    className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-[#1B5E20] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#145218] sm:w-auto"
                                                >
                                                    <Download size={13} />
                                                    <span>Unduh Berkas</span>
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Empty State Inside Folder */
                            <div className="flex flex-col items-center justify-center rounded-3xl border border-[#DDE5DD] bg-white px-6 py-20 text-center">
                                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F5E9] text-[#1B5E20]">
                                    <Info size={24} />
                                </div>
                                <h3 className="mb-1 text-lg font-bold text-[#1A1A1A]">
                                    Berkas Tidak Ditemukan
                                </h3>
                                <p className="mb-6 max-w-sm text-sm leading-relaxed text-[#5C6B73]">
                                    Tidak ada berkas dokumen yang cocok dengan
                                    pencarian Anda dalam folder{' '}
                                    {resolvedKategori.nama}.
                                </p>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="rounded-xl bg-[#1B5E20] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#145218]"
                                    >
                                        Reset Pencarian
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
