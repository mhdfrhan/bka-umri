import { Head, Link, router } from '@inertiajs/react';
import {
    Images,
    Plus,
    Trash2,
    Edit2,
    Calendar,
    Image as ImageIcon,
    AlertCircle,
    FolderOpen,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AdminModal } from '@/components/admin/admin-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface AlbumItem {
    id: number;
    title: string;
    slug: string;
    description?: string;
    date: string;
    coverUrl: string;
    category?: string;
    photos: Array<{ id: string; url: string; order: number }>;
    deleted_at?: string | null;
}

const INITIAL_ALBUMS: AlbumItem[] = [
    {
        id: 1,
        title: 'Kunjungan Kerja LLDIKTI Wilayah X',
        slug: 'kunjungan-lldikti-wilayah-x',
        description:
            'Dokumentasi kunjungan kerja evaluasi sarana prasarana dan verifikasi tata kelola aset BKA.',
        date: '2026-05-18',
        coverUrl:
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
        category: 'Aset',
        photos: [
            {
                id: '1',
                url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
                order: 1,
            },
            {
                id: '2',
                url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80',
                order: 2,
            },
        ],
    },
    {
        id: 2,
        title: 'Rapat Kerja Tahunan Penyusunan Anggaran',
        slug: 'rapat-kerja-anggaran-2026',
        description:
            'Pembahasan rancangan anggaran belanja operasional universitas dan pembiayaan program studi.',
        date: '2026-05-10',
        coverUrl:
            'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
        category: 'Keuangan',
        photos: [
            {
                id: '3',
                url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
                order: 1,
            },
            {
                id: '4',
                url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80',
                order: 2,
            },
        ],
    },
];

interface KategoriItem {
    id: number;
    nama: string;
}

interface DokumentasiIndexProps {
    albums: AlbumItem[];
    categories: string[];
    categoriesWithId: KategoriItem[];
}

export default function DokumentasiIndex({
    albums = [],
    categories = [],
    categoriesWithId = [],
}: DokumentasiIndexProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleConfirmDelete = () => {
        if (deletingId === null) {
            return;
        }

        const target = albums.find((a) => a.id === deletingId);
        router.delete(`/admin/dokumentasi/${deletingId}`, {
            onSuccess: () => {
                setDeletingId(null);
                toast.success(
                    showTrashed 
                    ? `Album "${target?.title}" berhasil dihapus permanen.`
                    : `Album "${target?.title}" berhasil dipindahkan ke Sampah.`,
                );
            },
            onError: () => {
                toast.error('Gagal menghapus album.');
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
        router.get('/admin/dokumentasi', { trashed: newValue ? 'true' : undefined }, { preserveState: true });
    };

    const handleRestore = (id: number) => {
        toast.promise(
            new Promise((resolve, reject) => {
                router.post(`/admin/dokumentasi/${id}/restore`, {}, {
                    onSuccess: () => resolve(true),
                    onError: () => reject(new Error('Gagal memulihkan album')),
                });
            }),
            {
                loading: 'Memulihkan...',
                success: 'Album berhasil dipulihkan!',
                error: 'Terjadi kesalahan saat memulihkan album.',
            }
        );
    };

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newCategoryName.trim();

        if (!trimmed) {
            return;
        }

        if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
            toast.error('Kategori tersebut sudah terdaftar!');
            return;
        }

        router.post(
            '/admin/dokumentasi/kategori',
            { nama: trimmed },
            {
                onSuccess: () => {
                    setNewCategoryName('');
                    toast.success(
                        `Kategori "${trimmed}" berhasil ditambahkan!`,
                    );
                },
                onError: (errors: any) => {
                    if (errors.nama) {
                        toast.error(errors.nama);
                    } else {
                        toast.error('Gagal menambahkan kategori.');
                    }
                },
            },
        );
    };

    const handleDeleteCategory = (catToDelete: string) => {
        const catObj = categoriesWithId.find((c) => c.nama === catToDelete);
        if (!catObj) {
            toast.error('Kategori tidak ditemukan.');
            return;
        }

        router.delete(`/admin/dokumentasi/kategori/${catObj.id}`, {
            onSuccess: () => {
                toast.success(`Kategori "${catToDelete}" berhasil dihapus.`);
            },
            onError: () => {
                toast.error('Gagal menghapus kategori.');
            },
        });
    };

    return (
        <>
            <Head title="Kelola Dokumentasi - Admin BKA" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-neutral-800">
                            <Images className="size-6 text-emerald-600" />
                            Galeri Dokumentasi BKA
                        </h1>
                        <p className="mt-1 text-sm leading-relaxed font-normal text-neutral-500">
                            Kelola album kegiatan, liputan dokumentasi sarana
                            prasarana, rapat kerja, dan visual perkuliahan BKA.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleTrashed}
                                className={`flex h-10 w-full md:w-auto items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition-colors ${showTrashed ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'}`}
                            >
                                <Trash2 className="size-4" />
                                <span>
                                    {showTrashed ? 'Data Aktif' : 'Lihat Sampah'}
                                </span>
                            </button>
                        <button
                            type="button"
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-xs hover:bg-neutral-50"
                        >
                            <FolderOpen className="size-4 text-neutral-500" />
                            Kelola Kategori
                        </button>
                        <Link
                            href="/admin/dokumentasi/create"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all outline-none hover:bg-emerald-700"
                        >
                            <Plus className="size-4" />
                            Tambah Album
                        </Link>
                    </div>
                </div>

                {albums.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {albums.map((album) => (
                            <div
                                key={album.id}
                                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:shadow-md"
                            >
                                <div className="relative aspect-video w-full overflow-hidden border-b border-neutral-100 bg-neutral-100">
                                    <img
                                        src={album.coverUrl}
                                        alt={album.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                'https://placehold.co/800x450/E8F5E9/1B5E20?text=Album+BKA';
                                        }}
                                    />
                                    <div className="absolute top-2 right-2 rounded-lg bg-neutral-900/70 px-2 py-0.5 text-[10px] font-extrabold text-white backdrop-blur-xs">
                                        {album.photos.length} Foto
                                    </div>
                                    <div className="absolute top-2 left-2 rounded-lg bg-emerald-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs backdrop-blur-xs">
                                        {album.category || 'Tanpa Kategori'}
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col justify-between space-y-2 p-4">
                                    <div className="space-y-1">
                                        <h3 className="line-clamp-2 text-sm leading-snug font-bold text-neutral-800 transition-colors group-hover:text-emerald-800">
                                            {album.title}
                                        </h3>
                                        {album.description && (
                                            <p className="line-clamp-2 text-xs leading-relaxed font-light text-neutral-500">
                                                {album.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-neutral-100 pt-3 text-xs font-semibold text-neutral-400">
                                        <span className="flex items-center gap-1 text-[11px]">
                                            <Calendar className="size-3.5" />
                                            {album.date}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            {!album.deleted_at ? (
                                                <Link
                                                    href={`/admin/dokumentasi/${album.id}/edit`}
                                                    className="rounded-lg border border-neutral-200 p-1.5 text-neutral-600 hover:bg-neutral-50"
                                                    title="Edit Album & Foto"
                                                >
                                                    <Edit2 className="size-3.5" />
                                                </Link>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRestore(album.id)}
                                                    className="rounded-lg border border-emerald-100 p-1.5 text-emerald-600 hover:bg-emerald-50"
                                                    title="Pulihkan Album"
                                                >
                                                    <AlertCircle className="size-3.5" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeletingId(album.id)
                                                }
                                                className="rounded-lg border border-red-100 p-1.5 text-red-600 hover:bg-red-50"
                                                title={album.deleted_at ? "Hapus Permanen" : "Hapus Album (Soft Delete)"}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center text-neutral-400">
                        <ImageIcon className="mx-auto mb-3 size-12 animate-pulse opacity-35" />
                        <h3 className="text-sm font-semibold">
                            Belum Ada Album Dokumentasi
                        </h3>
                        <p className="mt-1 text-xs text-neutral-400">
                            Buat album kegiatan perdana dengan mengklik tombol
                            "Tambah Album" di atas.
                        </p>
                    </div>
                )}
            </div>

            <AdminModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                title="Kelola Kategori Dokumentasi"
                icon={<FolderOpen className="size-5 text-emerald-600" />}
                maxWidth="sm"
            >
                <form onSubmit={handleAddCategory} className="mb-6 flex gap-2">
                    <input
                        type="text"
                        maxLength={50}
                        placeholder="Tulis kategori baru..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                    <button
                        type="submit"
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                    >
                        Tambah
                    </button>
                </form>

                <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
                    <label className="block text-xs font-bold tracking-wider text-neutral-400 uppercase">
                        Kategori Terdaftar
                    </label>
                    {categories.map((cat) => (
                        <div
                            key={cat}
                            className="flex items-center justify-between rounded-xl border border-neutral-200/50 bg-neutral-50 px-3.5 py-2"
                        >
                            <span className="text-sm font-semibold text-neutral-800">
                                {cat}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat)}
                                className="text-red-550 rounded-lg p-1 hover:bg-red-50"
                                title="Hapus Kategori"
                            >
                                <Trash2 className="size-3.5 text-red-600" />
                            </button>
                        </div>
                    ))}

                    {categories.length === 0 && (
                        <div className="py-6 text-center text-xs text-neutral-400">
                            Belum ada kategori kustom.
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end border-t border-neutral-100 pt-4">
                    <button
                        type="button"
                        onClick={() => setIsCategoryModalOpen(false)}
                        className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50"
                    >
                        Selesai
                    </button>
                </div>
            </AdminModal>

            <ConfirmDialog
                isOpen={deletingId !== null}
                onClose={() => setDeletingId(null)}
                onConfirm={handleConfirmDelete}
                title={showTrashed ? "Hapus Permanen Album?" : "Pindah ke Sampah?"}
                description={
                    <>
                        Apakah Anda yakin ingin {showTrashed ? 'menghapus permanen' : 'memindahkan'} album "
                        <strong>
                            {albums.find((a) => a.id === deletingId)?.title}
                        </strong>
                        "? {showTrashed ? "Tindakan ini akan menghapus data secara permanen beserta seluruh berkas foto di dalamnya." : "Album akan dipindahkan ke Sampah."}
                    </>
                }
                confirmText={showTrashed ? "Hapus Permanen" : "Pindah ke Sampah"}
                danger={true}
            />
        </>
    );
}

DokumentasiIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Kelola Dokumentasi',
            href: '/admin/dokumentasi',
        },
    ],
};
