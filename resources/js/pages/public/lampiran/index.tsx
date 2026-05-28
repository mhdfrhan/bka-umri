import { Head, Link } from '@inertiajs/react';
import { FolderOpen, FileText, Search, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHero } from '@/components/layout/page-hero';
import {
    useScrollReveal,
    useScrollRevealChildren,
} from '@/hooks/use-scroll-reveal';

interface KategoriLampiran {
    nama: string;
    slug: string;
    deskripsi: string;
    jumlah_berkas: number;
}

interface LampiranProps {
    kategoriLampirans?: KategoriLampiran[];
}

// ─── Detailed Mock Categories for Fallback & Local Evaluator ───
const dummyKategoriLampirans: KategoriLampiran[] = [
    {
        nama: 'Peraturan & Kebijakan',
        slug: 'peraturan-dan-kebijakan',
        deskripsi:
            'Kumpulan Surat Keputusan Rektor, Peraturan Pemerintah, dan Ketetapan Persyarikatan Muhammadiyah tentang tata kelola keuangan kampus.',
        jumlah_berkas: 8,
    },
    {
        nama: 'Formulir Kemahasiswaan',
        slug: 'formulir-kemahasiswaan',
        deskripsi:
            'Formulir pengajuan dispensasi pembayaran kuliah, template proposal pengajuan dana, dan berkas Surat Pertanggungjawaban (SPJ) kegiatan.',
        jumlah_berkas: 12,
    },
    {
        nama: 'Panduan & SOP Pelayanan',
        slug: 'panduan-dan-sop-pelayanan',
        deskripsi:
            'Standar Operasional Prosedur (SOP) pencairan anggaran unit, alur pengajuan dana, dan buku panduan tata cara pembayaran Virtual Account.',
        jumlah_berkas: 6,
    },
    {
        nama: 'Rencana & Laporan Anggaran',
        slug: 'rencana-dan-laporan-anggaran',
        deskripsi:
            'Sosialisasi Rencana Kerja & Anggaran Tahunan (RKAT), kebijakan pagu dana operasional fakultas, serta laporan pertanggungjawaban tahunan.',
        jumlah_berkas: 4,
    },
];

export default function LampiranIndex({
    kategoriLampirans = [],
}: LampiranProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const heroRef = useScrollReveal<HTMLDivElement>();
    const filterRef = useScrollReveal<HTMLDivElement>();
    const gridRef = useScrollRevealChildren<HTMLDivElement>('.bka-reveal');

    // Safe fallback handling for dynamic vs mock data
    const resolvedKategori =
        kategoriLampirans.length > 0
            ? kategoriLampirans
            : dummyKategoriLampirans;

    // Filter categories based on search input for highly interactive preview
    const filteredKategori = resolvedKategori.filter(
        (cat) =>
            cat.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const breadcrumbItems = [
        { title: 'Beranda', href: '/' },
        { title: 'Lampiran & Dokumen', href: '/lampiran' },
    ];

    return (
        <>
            <Head title="Unduh Lampiran & Dokumen Resmi - BKA UMRI">
                <meta
                    name="description"
                    content="Portal unduhan dokumen administrasi, peraturan keuangan, formulir mahasiswa, panduan pembayaran, dan SOP di lingkungan Universitas Muhammadiyah Riau."
                />
            </Head>

            {/* Page Hero banner */}
            <PageHero
                title="Lampiran & Dokumen"
                description="Pusat unduhan berkas resmi, formulir kemahasiswaan, standar operasional (SOP), dan regulasi keuangan BKA UMRI."
            >
                <div ref={heroRef} className="bka-reveal">
                    <Breadcrumbs
                        breadcrumbs={breadcrumbItems}
                        variant="public"
                    />
                </div>
            </PageHero>

            {/* Search Filter Bar */}
            <section className="border-b border-[#e6f4ea] bg-white py-8">
                <div className="bka-container">
                    <div
                        ref={filterRef}
                        className="bka-reveal flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex flex-col gap-1">
                            <h2 className="text-lg font-bold text-[#1A1A1A]">
                                Repositori Dokumen
                            </h2>
                            <p className="text-xs text-[#5C6B73]">
                                Silakan pilih kategori map folder di bawah untuk
                                mencari berkas
                            </p>
                        </div>

                        {/* Search Bar Input */}
                        <div className="relative w-full sm:max-w-xs">
                            <input
                                type="text"
                                placeholder="Cari kategori dokumen..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-[#DDE5DD] bg-white py-2.5 pr-4 pl-11 text-[14px] text-[#1A1A1A] transition-colors focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32] focus:outline-none"
                            />
                            <Search
                                size={18}
                                className="absolute top-1/2 left-4 -translate-y-1/2 text-[#9EAAB2]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Kategori Grid Content */}
            <section className="min-h-[400px] flex-1 bg-[#F7F9F7] py-12 md:py-16">
                <div className="bka-container">
                    {filteredKategori.length > 0 ? (
                        <div
                            ref={gridRef}
                            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {filteredKategori.map((cat, idx) => (
                                <div
                                    key={cat.slug}
                                    className={`bka-reveal bka-stagger-${(idx % 6) + 1} group flex h-full flex-col rounded-2xl border border-[#DDE5DD] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
                                >
                                    {/* Top Line Header with Folder Icon & Badge */}
                                    <div className="mb-5 flex items-center justify-between">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e6f4ea] text-[#0a6c32] transition-colors duration-300 group-hover:bg-[#0a6c32] group-hover:text-white">
                                            <FolderOpen size={22} />
                                        </div>
                                        <div className="flex items-center gap-1.5 rounded-lg border border-[#e6f4ea] bg-[#F7F9F7] px-2.5 py-1.5 text-xs font-bold text-[#5C6B73]">
                                            <FileText
                                                size={13}
                                                className="text-[#C8A000]"
                                            />
                                            <span>
                                                {cat.jumlah_berkas} Berkas
                                            </span>
                                        </div>
                                    </div>

                                    {/* Category Title */}
                                    <h3 className="mb-3 text-lg leading-snug font-bold text-[#1A1A1A] transition-colors group-hover:text-[#0a6c32]">
                                        <Link href={`/lampiran/${cat.slug}`}>
                                            {cat.nama}
                                        </Link>
                                    </h3>

                                    {/* Description */}
                                    <p className="mb-6 flex-1 text-[13px] leading-relaxed text-[#5C6B73]">
                                        {cat.deskripsi}
                                    </p>

                                    {/* Footer Trigger Link */}
                                    <div className="mt-auto border-t border-[#F1F3F1] pt-4">
                                        <Link
                                            href={`/lampiran/${cat.slug}`}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0a6c32] transition-colors hover:text-[#085627]"
                                        >
                                            <span>Buka Berkas Kategori</span>
                                            <ArrowRight
                                                size={14}
                                                className="transition-transform group-hover:translate-x-1"
                                            />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State Container */
                        <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-3xl border border-[#DDE5DD] bg-white px-6 py-20 text-center">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f4ea] text-[#0a6c32]">
                                <FolderOpen size={28} />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-[#1A1A1A]">
                                Kategori Tidak Ditemukan
                            </h3>
                            <p className="mb-6 max-w-sm text-sm leading-relaxed text-[#5C6B73]">
                                Maaf, kami tidak dapat menemukan folder lampiran
                                dengan nama yang Anda cari. Silakan coba
                                pencarian lain.
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
            </section>
        </>
    );
}
