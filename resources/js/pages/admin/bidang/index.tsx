import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Briefcase,
    Plus,
    Trash2,
    Edit2,
    ArrowUp,
    ArrowDown,
    Search,
    Users,
    ChevronRight,
    HelpCircle,
    Info,
    AlertTriangle,
    Eye,
} from 'lucide-react';
import { toast } from 'sonner';

// Define the type structure for Bidang
interface Anggota {
    nama: string;
    jabatan: string;
}

interface BidangItem {
    id: string;
    nama: string;
    slug: string;
    deskripsiSingkat: string;
    deskripsiLengkap: string;
    urutan: number;
    kepalaBagian: {
        nama: string;
        jabatan: string;
        foto: string;
        deskripsiTugas: string;
    };
    anggota: Anggota[];
    cta?: {
        heading: string;
        subCta: string;
        btnText: string;
        btnUrl: string;
    };
}

// Initial dummy data for BKA UMRI fields
const DEFAULT_BIDANGS: BidangItem[] = [
    {
        id: '1',
        nama: 'Bidang Keuangan & Pembiayaan',
        slug: 'keuangan',
        deskripsiSingkat:
            'Mengelola penganggaran, pembukuan, pelaporan keuangan universitas, verifikasi transaksi, serta pelayanan administrasi pembayaran mahasiswa.',
        deskripsiLengkap:
            'Bidang Keuangan & Pembiayaan bertanggung jawab penuh atas pengelolaan arus kas masuk dan keluar universitas secara transparan dan akuntabel. Kami mengintegrasikan sistem pembayaran digital bekerjasama dengan bank mitra untuk memberikan kemudahan bagi mahasiswa dalam melunasi kewajiban akademik.',
        urutan: 1,
        kepalaBagian: {
            nama: 'Heni Marlina, S.Ak.',
            jabatan: 'Kepala Urusan Keuangan & Pembiayaan',
            foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
            deskripsiTugas:
                'Mengoordinasikan penganggaran tahunan, menyusun laporan keuangan bulanan/tahunan, serta memvalidasi pengeluaran operasional universitas.',
        },
        anggota: [
            { nama: 'Rika Amalia', jabatan: 'Staf Kasir & Pembayaran' },
            { nama: 'Dedi Rahman', jabatan: 'Staf Verifikasi & Anggaran' },
        ],
        cta: {
            heading: 'Butuh Bantuan Administrasi Pembayaran Kuliah?',
            subCta: 'Hubungi loket keuangan BKA atau buka panduan pembayaran online.',
            btnText: 'Lihat Panduan Pembayaran',
            btnUrl: '#panduan',
        },
    },
    {
        id: '2',
        nama: 'Bidang Aset & Logistik',
        slug: 'aset',
        deskripsiSingkat:
            'Mengatur inventarisasi, distribusi, pemeliharaan sarana prasarana, pengadaan barang, serta optimalisasi pemanfaatan aset fisik Universitas Muhammadiyah Riau.',
        deskripsiLengkap:
            'Bidang Aset & Logistik berfokus pada pemeliharaan seluruh fasilitas fisik kampus, pencatatan inventaris berkala, serta digitalisasi pengadaan barang. Kami memastikan sarana perkuliahan selalu dalam kondisi prima demi menunjang kenyamanan kegiatan belajar mengajar.',
        urutan: 2,
        kepalaBagian: {
            nama: 'M. Taufik, S.T.',
            jabatan: 'Kepala Urusan Aset & Logistik',
            foto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
            deskripsiTugas:
                'Merencanakan program pemeliharaan berkala gedung, mengawasi pengadaan sarana perkuliahan, serta mengelola inventarisasi digital aset universitas.',
        },
        anggota: [
            { nama: 'Ahmad Syarif', jabatan: 'Staf Inventarisasi Fisik' },
            { nama: 'Zulfahmi', jabatan: 'Staf Teknisi & Pemeliharaan' },
        ],
        cta: {
            heading: 'Ingin Mengajukan Peminjaman Ruang atau Fasilitas Kampus?',
            subCta: 'Gunakan sistem peminjaman aset online untuk respons yang lebih cepat.',
            btnText: 'Sistem Peminjaman Aset',
            btnUrl: '/admin/settings',
        },
    },
];

export default function IndexBidang() {
    const [bidangs, setBidangs] = useState<BidangItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [bidangToDelete, setBidangToDelete] = useState<BidangItem | null>(
        null,
    );

    // Synchronize with LocalStorage for fully interactive mock operations across pages
    useEffect(() => {
        const stored = localStorage.getItem('bka_bidangs');
        if (stored) {
            try {
                setBidangs(JSON.parse(stored));
            } catch (e) {
                setBidangs(DEFAULT_BIDANGS);
            }
        } else {
            localStorage.setItem(
                'bka_bidangs',
                JSON.stringify(DEFAULT_BIDANGS),
            );
            setBidangs(DEFAULT_BIDANGS);
        }
    }, []);

    // Save helpers
    const saveToLocalStorage = (updated: BidangItem[]) => {
        setBidangs(updated);
        localStorage.setItem('bka_bidangs', JSON.stringify(updated));
    };

    // Reordering functionality
    const handleMove = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === bidangs.length - 1) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const newBidangs = [...bidangs];

        // Swap items
        const temp = newBidangs[index];
        newBidangs[index] = newBidangs[targetIndex];
        newBidangs[targetIndex] = temp;

        // Reassign urutan field
        const updated = newBidangs.map((item, idx) => ({
            ...item,
            urutan: idx + 1,
        }));

        saveToLocalStorage(updated);
        toast.success(
            `Urutan ${temp.nama} berhasil digeser ke ${direction === 'up' ? 'atas' : 'bawah'}!`,
        );
    };

    // Trigger delete confirmation modal
    const handleOpenDelete = (item: BidangItem) => {
        setBidangToDelete(item);
        setIsConfirmOpen(true);
    };

    // Confirm deletion
    const handleConfirmDelete = () => {
        if (!bidangToDelete) return;
        const filtered = bidangs
            .filter((b) => b.id !== bidangToDelete.id)
            .map((item, idx) => ({
                ...item,
                urutan: idx + 1,
            }));
        saveToLocalStorage(filtered);
        setIsConfirmOpen(false);
        setBidangToDelete(null);
        toast.success(
            `Bidang "${bidangToDelete.nama}" berhasil dihapus dari sistem!`,
        );
    };

    // Filtered lists
    const filteredBidangs = bidangs.filter(
        (b) =>
            b.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.deskripsiSingkat
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            b.kepalaBagian.nama
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
    );

    const isLimitReached = bidangs.length >= 6;

    return (
        <>
            <Head title="Kelola Bidang BKA" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-neutral-800">
                            <Briefcase className="size-6 text-emerald-600" />
                            Kelola Bidang Kelembagaan
                        </h1>
                        <p className="mt-1 text-sm leading-relaxed font-light text-neutral-500">
                            Organisasikan sub-bidang/bagian di bawah BKA, profil
                            pimpinan divisi, bagan anggota staf, serta materi
                            aksi promosi eksternal (CTA).
                        </p>
                    </div>

                    <div className="relative">
                        {isLimitReached ? (
                            <div className="group relative">
                                <button
                                    disabled
                                    className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl bg-neutral-300 px-4 py-2.5 text-sm font-bold text-neutral-500 shadow-sm transition-all select-none"
                                >
                                    <Plus className="size-4" />
                                    Tambah Bidang
                                </button>
                                <span className="absolute right-0 bottom-full z-10 mb-2 hidden w-52 flex-col items-center rounded-lg bg-neutral-800 p-2 text-center text-xs leading-normal text-white shadow-lg group-hover:flex">
                                    Batas maksimum 6 bidang tercapai. Hapus
                                    bidang yang tidak terpakai.
                                </span>
                            </div>
                        ) : (
                            <Link
                                href="/admin/bidang/create"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all outline-none hover:bg-emerald-700 active:scale-95"
                            >
                                <Plus className="size-4" />
                                Tambah Bidang
                            </Link>
                        )}
                    </div>
                </div>

                {/* Toolbar Area */}
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    {/* Search Field */}
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Cari bidang atau kepala divisi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pr-4 pl-9 text-sm font-medium text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        />
                    </div>

                    {/* Stats Summary Badge */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-neutral-500 select-none">
                        <span className="rounded-lg border border-emerald-100/60 bg-emerald-50 px-3 py-1.5 font-bold text-emerald-800">
                            {bidangs.length} / 6 Bidang Aktif
                        </span>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="w-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[700px] border-collapse text-left">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-sm font-bold tracking-wider text-neutral-600 uppercase select-none">
                                    <th className="w-20 px-6 py-4 text-center">
                                        Urutan
                                    </th>
                                    <th className="px-6 py-4">
                                        Nama Bidang & Deskripsi
                                    </th>
                                    <th className="px-6 py-4">Kepala Bagian</th>
                                    <th className="w-28 px-6 py-4 text-center">
                                        Anggota
                                    </th>
                                    <th className="w-44 px-6 py-4 text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 text-neutral-700">
                                {filteredBidangs.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="group transition-colors hover:bg-neutral-50/40"
                                    >
                                        {/* Sort Handler Buttons */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <button
                                                    onClick={() =>
                                                        handleMove(index, 'up')
                                                    }
                                                    disabled={index === 0}
                                                    className="rounded p-1 transition-all outline-none hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
                                                    title="Naikkan"
                                                >
                                                    <ArrowUp className="size-4 text-neutral-500" />
                                                </button>
                                                <span className="font-mono text-sm font-extrabold text-emerald-800 select-none">
                                                    #{item.urutan}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        handleMove(
                                                            index,
                                                            'down',
                                                        )
                                                    }
                                                    disabled={
                                                        index ===
                                                        bidangs.length - 1
                                                    }
                                                    className="rounded p-1 transition-all outline-none hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
                                                    title="Turunkan"
                                                >
                                                    <ArrowDown className="size-4 text-neutral-500" />
                                                </button>
                                            </div>
                                        </td>

                                        {/* Name & Details */}
                                        <td className="px-6 py-4">
                                            <div className="max-w-[280px] space-y-1.5">
                                                <div className="flex items-center gap-1.5 text-base font-bold text-neutral-800">
                                                    <span className="truncate">
                                                        {item.nama}
                                                    </span>
                                                </div>
                                                <p className="line-clamp-2 text-sm leading-relaxed font-light text-neutral-500">
                                                    {item.deskripsiSingkat}
                                                </p>
                                                <div className="flex items-center gap-1.5 pt-0.5 select-none">
                                                    <span className="rounded border bg-neutral-100 px-2 py-0.5 font-mono text-xs text-neutral-500 uppercase">
                                                        slug: {item.slug}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Kepala Urusan */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-11 shrink-0 overflow-hidden rounded-full border bg-neutral-100 select-none">
                                                    <img
                                                        src={
                                                            item.kepalaBagian
                                                                .foto
                                                        }
                                                        alt={
                                                            item.kepalaBagian
                                                                .nama
                                                        }
                                                        className="size-full object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0 space-y-0.5">
                                                    <div className="truncate text-base font-bold text-neutral-800">
                                                        {item.kepalaBagian.nama}
                                                    </div>
                                                    <div className="truncate text-xs font-bold tracking-wider text-emerald-800 uppercase">
                                                        {
                                                            item.kepalaBagian
                                                                .jabatan
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Total Staff Count */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1 rounded-lg border bg-neutral-100 px-3 py-1.5 text-sm font-bold text-neutral-700 select-none">
                                                <Users className="size-4 text-neutral-500" />
                                                <span>
                                                    {item.anggota.length}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Edit & Delete Controls */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Preview Link */}
                                                <a
                                                    href={`/profil/tentang-kami#${item.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="rounded-lg border border-neutral-200 p-2 text-neutral-600 outline-none hover:bg-neutral-100/80"
                                                    title="Lihat Halaman Publik"
                                                >
                                                    <Eye className="size-4" />
                                                </a>

                                                {/* Edit Link */}
                                                <Link
                                                    href={`/admin/bidang/${item.id}/edit`}
                                                    className="rounded-lg border border-neutral-200 p-2 text-neutral-700 transition-all outline-none hover:bg-neutral-100/80"
                                                    title="Edit Bidang"
                                                >
                                                    <Edit2 className="size-4" />
                                                </Link>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() =>
                                                        handleOpenDelete(item)
                                                    }
                                                    className="rounded-lg border border-red-100 p-2 text-red-600 transition-all outline-none hover:border-red-200 hover:bg-red-50"
                                                    title="Hapus Bidang"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredBidangs.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="mx-auto max-w-xs">
                                                <Briefcase className="mx-auto mb-3 size-12 animate-pulse text-neutral-300" />
                                                <h3 className="text-base font-bold text-neutral-700">
                                                    {searchQuery
                                                        ? 'Hasil Pencarian Kosong'
                                                        : 'Belum Ada Bidang Kelembagaan'}
                                                </h3>
                                                <p className="mt-1 text-sm leading-normal font-light text-neutral-500">
                                                    {searchQuery
                                                        ? 'Coba gunakan kata kunci pencarian yang lain atau bersihkan kotak teks.'
                                                        : 'Belum ada bidang organisasi yang terdaftar. Klik "Tambah Bidang" di atas untuk membuat.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Custom confirmation dialog with smooth transition & bounce */}
            {isConfirmOpen && bidangToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs transition-all">
                    <div className="w-full max-w-sm animate-in space-y-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl duration-200 zoom-in-95 fade-in">
                        <div className="flex items-center gap-3 text-red-600">
                            <div className="rounded-xl border border-red-100 bg-red-50 p-2">
                                <AlertTriangle className="size-5" />
                            </div>
                            <h3 className="text-base font-bold text-neutral-800">
                                Hapus Bidang Organisasi?
                            </h3>
                        </div>

                        <p className="text-sm leading-relaxed font-light text-neutral-500">
                            Apakah Anda yakin ingin menghapus bidang{' '}
                            <strong className="font-bold text-neutral-800">
                                "{bidangToDelete.nama}"
                            </strong>
                            ? Seluruh data kepala divisi, data staf anggota, dan
                            CTA bidang ini akan terhapus permanen dari website.
                        </p>

                        <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
                            <button
                                onClick={() => setIsConfirmOpen(false)}
                                className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-600 outline-none hover:bg-neutral-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all outline-none hover:bg-red-700"
                            >
                                Ya, Hapus Bidang
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Layout Breadcrumbs Setup for top admin bar
IndexBidang.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Kelola Bidang',
            href: '/admin/bidang',
        },
    ],
};
