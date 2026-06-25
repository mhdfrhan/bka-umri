import { Head, Link, router } from '@inertiajs/react';
import {
    Megaphone,
    Search,
    Plus,
    Trash2,
    Edit2,
    Calendar,
    User,
    Eye,
    AlertCircle,
    Star,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface AnnouncementItem {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    author?: string;
    status: 'draf' | 'terpublikasi' | 'diarsipkan';
    isPenting: boolean;
    thumbnail?: string;
    attachments?: Array<{
        name: string;
        url: string;
        size: number;
        extension: string;
    }>;
    deleted_at?: string | null;
}

interface PengumumanIndexProps {
    announcements: AnnouncementItem[];
}

export default function PengumumanIndex({
    announcements = [],
}: PengumumanIndexProps) {
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [filterPenting, setFilterPenting] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Delete Modal
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Confirm Delete
    const handleConfirmDelete = () => {
        if (deletingId === null) {
            return;
        }

        const target = announcements.find((a) => a.id === deletingId);
        router.delete(`/admin/pengumuman/${deletingId}`, {
            onSuccess: () => {
                setDeletingId(null);
                toast.success(
                    showTrashed 
                    ? `Pengumuman "${target?.title}" berhasil dihapus permanen.`
                    : `Pengumuman "${target?.title}" berhasil dipindahkan ke Sampah.`,
                );
            },
            onError: () => {
                setDeletingId(null);
                toast.error('Gagal menghapus pengumuman.');
            },
        });
    };

    // Trash logic
    const [showTrashed, setShowTrashed] = useState(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('trashed') === 'true';
        }
        return false;
    });

    const toggleTrashed = () => {
        const newValue = !showTrashed;
        setShowTrashed(newValue);
        router.get('/admin/pengumuman', { trashed: newValue ? 'true' : undefined }, { preserveState: true });
    };

    const handleRestore = (id: number) => {
        toast.promise(
            new Promise((resolve, reject) => {
                router.post(`/admin/pengumuman/${id}/restore`, {}, {
                    onSuccess: () => resolve(true),
                    onError: () => reject(new Error('Gagal memulihkan pengumuman')),
                });
            }),
            {
                loading: 'Memulihkan...',
                success: 'Pengumuman berhasil dipulihkan!',
                error: 'Terjadi kesalahan saat memulihkan pengumuman.',
            }
        );
    };

    // Filter Logic
    const filtered = announcements.filter((item) => {
        const matchesSearch = item.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesStatus =
            filterStatus === 'Semua' || item.status === filterStatus;
        const matchesPenting = !filterPenting || item.isPenting;

        return matchesSearch && matchesStatus && matchesPenting;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <>
            <Head title="Kelola Pengumuman - Admin BKA" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-neutral-800">
                            <Megaphone className="size-6 text-emerald-600" />
                            Manajemen Pengumuman BKA
                        </h1>
                        <p className="mt-1 text-sm leading-relaxed font-normal text-neutral-500">
                            Terbitkan pengumuman penting, jadwal registrasi,
                            dispensasi keuangan, beserta berkas lampirannya.
                        </p>
                    </div>

                    <Link
                        href="/admin/pengumuman/create"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all outline-none hover:bg-emerald-700"
                    >
                        <Plus className="size-4" />
                        Tambah Pengumuman
                    </Link>
                </div>

                {/* Filter and search bar */}
                <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-[28%_1fr]">
                    {/* Left Filter Column */}
                    <div className="space-y-6 rounded-2xl border border-neutral-200/60 bg-neutral-50/50 p-6">
                        <div className="border-b border-neutral-200 pb-3">
                            <h2 className="text-sm font-extrabold tracking-wider text-emerald-950 uppercase">
                                Filter Pencarian
                            </h2>
                        </div>

                        {/* Search Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold tracking-wide text-neutral-600 uppercase">
                                Kata Kunci Judul
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Cari pengumuman..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pr-4 pl-10 text-sm font-semibold text-neutral-800 transition-colors focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                                />
                                <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-400" />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold tracking-wide text-neutral-600 uppercase">
                                Pilih Status
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-colors focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            >
                                <option value="Semua">Semua Status</option>
                                <option value="terpublikasi">
                                    Terpublikasi
                                </option>
                                <option value="draf">Draf</option>
                                <option value="diarsipkan">Diarsipkan</option>
                            </select>
                        </div>

                        {/* Hanya Penting Toggle */}
                        <label className="flex cursor-pointer items-center gap-2 pt-2 select-none">
                            <input
                                type="checkbox"
                                checked={filterPenting}
                                onChange={(e) => {
                                    setFilterPenting(e.target.checked);
                                    setCurrentPage(1);
                                }}
                                className="size-4 cursor-pointer rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-neutral-700">
                                    Hanya Pengumuman Penting
                                </span>
                                <span className="text-[10px] leading-tight text-neutral-400">
                                    Menampilkan pengumuman bertanda bintang
                                    penting.
                                </span>
                            </div>
                        </label>


                        <div className="pt-4 border-t border-neutral-200/60">
                            <button
                                type="button"
                                onClick={toggleTrashed}
                                className={`flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition-colors ${showTrashed ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'}`}
                            >
                                <Trash2 className="size-4" />
                                <span>
                                    {showTrashed ? 'Kembali ke Data Aktif' : 'Lihat Sampah'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Right Table Column */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-neutral-100 text-xs font-bold tracking-wider text-neutral-400 uppercase">
                                            <th className="py-3 pl-3">
                                                Judul Pengumuman
                                            </th>
                                            <th className="w-28 px-3 py-3 text-center">
                                                Tingkat
                                            </th>
                                            <th className="w-28 px-3 py-3">
                                                Status
                                            </th>
                                            <th className="w-24 py-3 pr-3 text-right">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 text-sm text-neutral-800">
                                        {currentItems.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="group hover:bg-neutral-50/40"
                                            >
                                                {/* Title */}
                                                <td className="py-3 pl-3">
                                                    <div className="space-y-1">
                                                        <span className="line-clamp-2 leading-snug font-bold text-neutral-900 transition-colors group-hover:text-emerald-800">
                                                            {item.title}
                                                        </span>
                                                        <div className="flex items-center gap-4 text-xs font-medium text-neutral-400">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="size-3" />
                                                                {item.date}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <User className="size-3" />
                                                                {item.author ||
                                                                    'Admin'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Penting indicator */}
                                                <td className="px-3 py-3 text-center">
                                                    {item.isPenting ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                                                            <Star className="size-3 fill-amber-500 text-amber-500" />
                                                            Penting
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-medium text-neutral-400">
                                                            Biasa
                                                        </span>
                                                    )}
                                                </td>
                                                {/* Status Badge */}
                                                <td className="px-3 py-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                                                            item.status ===
                                                            'terpublikasi'
                                                                ? 'border border-green-200 bg-green-50 text-green-700'
                                                                : item.status ===
                                                                    'draf'
                                                                  ? 'border border-blue-200 bg-blue-50 text-blue-700'
                                                                  : 'border border-amber-200 bg-amber-50 text-amber-700'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`size-1.5 rounded-full ${
                                                                item.status ===
                                                                'terpublikasi'
                                                                    ? 'bg-green-600'
                                                                    : item.status ===
                                                                        'draf'
                                                                      ? 'bg-blue-600'
                                                                      : 'bg-amber-600'
                                                            }`}
                                                        />
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 pr-3 text-right">
                                                    <div className="inline-flex items-center gap-1">
                                                        {!item.deleted_at ? (
                                                            <>
                                                                <a
                                                                    href={`/pengumuman/${item.slug}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
                                                                    title="Pratinjau Publik"
                                                                >
                                                                    <Eye className="size-4" />
                                                                </a>
                                                                <Link
                                                                    href={`/admin/pengumuman/${item.id}/edit`}
                                                                    className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
                                                                    title="Edit Pengumuman"
                                                                >
                                                                    <Edit2 className="size-4" />
                                                                </Link>
                                                            </>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRestore(item.id)}
                                                                className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                                                                title="Pulihkan Pengumuman"
                                                            >
                                                                <AlertCircle className="size-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDeletingId(
                                                                    item.id,
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                                            title={item.deleted_at ? "Hapus Permanen" : "Hapus Pengumuman (Soft Delete)"}
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {filtered.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="py-16 text-center text-neutral-400"
                                                >
                                                    <Megaphone className="mx-auto mb-2 size-12 animate-pulse opacity-35" />
                                                    <p className="text-sm font-semibold">
                                                        Tidak ada pengumuman
                                                        yang ditemukan.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-between border-t border-neutral-100 pt-6">
                                    <span className="text-xs font-semibold text-neutral-500">
                                        Menampilkan {indexOfFirstItem + 1}–
                                        {Math.min(
                                            indexOfLastItem,
                                            filtered.length,
                                        )}{' '}
                                        dari {filtered.length} pengumuman
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            disabled={currentPage === 1}
                                            onClick={() =>
                                                setCurrentPage(
                                                    (prev) => prev - 1,
                                                )
                                            }
                                            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                                        >
                                            Sebelumnya
                                        </button>
                                        {[...Array(totalPages)].map(
                                            (_, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() =>
                                                        setCurrentPage(idx + 1)
                                                    }
                                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                                                        currentPage === idx + 1
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                                    }`}
                                                >
                                                    {idx + 1}
                                                </button>
                                            ),
                                        )}
                                        <button
                                            type="button"
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            onClick={() =>
                                                setCurrentPage(
                                                    (prev) => prev + 1,
                                                )
                                            }
                                            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                                        >
                                            Selanjutnya
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={deletingId !== null}
                onClose={() => setDeletingId(null)}
                onConfirm={handleConfirmDelete}
                title={showTrashed ? "Hapus Permanen Pengumuman?" : "Pindah ke Sampah?"}
                description={
                    <>
                        Apakah Anda yakin ingin {showTrashed ? 'menghapus permanen' : 'memindahkan'} pengumuman "
                        <strong>
                            {announcements.find((a) => a.id === deletingId)?.title}
                        </strong>
                        "? {showTrashed ? "Tindakan ini akan menghapus data secara permanen." : "Pengumuman akan dipindahkan ke Sampah."}
                    </>
                }
                confirmText={showTrashed ? "Hapus Permanen" : "Pindah ke Sampah"}
                danger={true}
            />
        </>
    );
}

PengumumanIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Kelola Pengumuman',
            href: '/admin/pengumuman',
        },
    ],
};
