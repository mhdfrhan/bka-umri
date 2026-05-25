import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
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
import { toast } from 'sonner';
import { AdminModal } from '@/components/admin/admin-modal';

interface AlbumItem {
    id: number;
    title: string;
    slug: string;
    description?: string;
    date: string;
    coverUrl: string;
    category?: string;
    photos: Array<{ id: string; url: string; order: number }>;
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

export default function DokumentasiIndex() {
    const [albums, setAlbums] = useState<AlbumItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        const savedCats = localStorage.getItem('bka_dokumentasi_categories');
        let loadedCats = ['Keuangan', 'Aset'];
        if (savedCats) {
            try {
                loadedCats = JSON.parse(savedCats);
            } catch {
                loadedCats = ['Keuangan', 'Aset'];
            }
        } else {
            localStorage.setItem(
                'bka_dokumentasi_categories',
                JSON.stringify(loadedCats),
            );
        }
        setCategories(loadedCats);

        const saved = localStorage.getItem('bka_albums');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const updated = parsed.map((a: any) => ({
                    ...a,
                    category: a.category || 'Tanpa Kategori',
                }));
                setAlbums(updated);
            } catch {
                setAlbums(INITIAL_ALBUMS);
            }
        } else {
            setAlbums(INITIAL_ALBUMS);
            localStorage.setItem('bka_albums', JSON.stringify(INITIAL_ALBUMS));
        }
    }, []);

    const saveAlbums = (updated: AlbumItem[]) => {
        setAlbums(updated);
        localStorage.setItem('bka_albums', JSON.stringify(updated));
    };

    const handleConfirmDelete = () => {
        if (deletingId === null) return;
        const target = albums.find((a) => a.id === deletingId);
        const updated = albums.filter((a) => a.id !== deletingId);
        saveAlbums(updated);
        setDeletingId(null);
        toast.success(`Album "${target?.title}" berhasil dihapus.`);
    };

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newCategoryName.trim();
        if (!trimmed) return;

        if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
            toast.error('Kategori tersebut sudah terdaftar!');
            return;
        }

        const updated = [...categories, trimmed];
        setCategories(updated);
        localStorage.setItem(
            'bka_dokumentasi_categories',
            JSON.stringify(updated),
        );
        setNewCategoryName('');
        toast.success(`Kategori "${trimmed}" berhasil ditambahkan!`);
    };

    const handleDeleteCategory = (catToDelete: string) => {
        const updatedCategories = categories.filter((c) => c !== catToDelete);
        setCategories(updatedCategories);
        localStorage.setItem(
            'bka_dokumentasi_categories',
            JSON.stringify(updatedCategories),
        );

        const updatedAlbums = albums.map((item) =>
            item.category === catToDelete
                ? { ...item, category: 'Tanpa Kategori' }
                : item,
        );
        saveAlbums(updatedAlbums);
        toast.success(
            `Kategori "${catToDelete}" dihapus. Album terkait dialihkan ke "Tanpa Kategori".`,
        );
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

                    <div className="flex items-center gap-2">
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
                                            <Link
                                                href={`/admin/dokumentasi/${album.id}/edit`}
                                                className="rounded-lg border border-neutral-200 p-1.5 text-neutral-600 hover:bg-neutral-50"
                                                title="Edit Album & Foto"
                                            >
                                                <Edit2 className="size-3.5" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeletingId(album.id)
                                                }
                                                className="rounded-lg border border-red-100 p-1.5 text-red-600 hover:bg-red-50"
                                                title="Hapus Album"
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

            <AdminModal
                isOpen={deletingId !== null}
                onClose={() => setDeletingId(null)}
                title="Hapus Album Kegiatan?"
                icon={<AlertCircle className="size-5 text-red-600" />}
                maxWidth="sm"
            >
                <div className="p-2 text-center">
                    <p className="mb-6 text-sm leading-relaxed text-neutral-500">
                        Apakah Anda yakin ingin menghapus album "
                        <strong>
                            {albums.find((a) => a.id === deletingId)?.title}
                        </strong>
                        "? Seluruh berkas foto di dalam album ini akan ikut
                        terhapus dari sistem local.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => setDeletingId(null)}
                            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 transition-colors outline-none hover:bg-neutral-50"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmDelete}
                            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all outline-none hover:bg-red-700"
                        >
                            Hapus Permanen
                        </button>
                    </div>
                </div>
            </AdminModal>
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
