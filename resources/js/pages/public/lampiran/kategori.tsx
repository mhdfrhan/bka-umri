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

// No mock categories for production
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

export default function KategoriLampiranShow({ kategori, berkas = [] }: Props) {
    const { url } = usePage();
    const [searchQuery, setSearchQuery] = useState('');

    const headerRef = useScrollReveal<HTMLDivElement>();
    const descRef = useScrollReveal<HTMLDivElement>();
    const listRef = useScrollRevealChildren<HTMLDivElement>('.bka-reveal');

    // ─── Data Resolution ───
    const resolvedKategori = kategori;
    const resolvedBerkas = berkas;

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
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#5C6B73] transition-colors hover:text-[#0a6c32]"
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
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6f4ea] px-3.5 py-1 text-xs font-bold text-[#0a6c32]">
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
                                    className="w-full rounded-xl border border-[#DDE5DD] bg-[#F7F9F7] py-2 pr-4 pl-10 text-[13px] text-[#1A1A1A] transition-colors focus:border-[#0a6c32] focus:bg-white focus:ring-1 focus:ring-[#0a6c32] focus:outline-none"
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
                                                    <h3 className="mb-1 text-[15px] leading-snug font-bold break-words text-[#1A1A1A] hover:text-[#0a6c32]">
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
                                                    className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-[#0a6c32] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#085627] sm:w-auto"
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
                                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#e6f4ea] text-[#0a6c32]">
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
                                        className="rounded-xl bg-[#0a6c32] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#085627]"
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
