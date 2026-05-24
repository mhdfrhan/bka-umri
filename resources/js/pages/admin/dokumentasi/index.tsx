import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Images, Plus, Trash2, Edit2, Calendar, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AlbumItem {
    id: number;
    title: string;
    slug: string;
    description?: string;
    date: string;
    coverUrl: string;
    photos: Array<{ id: string; url: string; order: number }>;
}

const INITIAL_ALBUMS: AlbumItem[] = [
    {
        id: 1,
        title: 'Kunjungan Kerja LLDIKTI Wilayah X',
        slug: 'kunjungan-lldikti-wilayah-x',
        description: 'Dokumentasi kunjungan kerja evaluasi sarana prasarana dan verifikasi tata kelola aset BKA.',
        date: '2026-05-18',
        coverUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
        photos: [
            { id: '1', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80', order: 1 },
            { id: '2', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80', order: 2 }
        ]
    },
    {
        id: 2,
        title: 'Rapat Kerja Tahunan Penyusunan Anggaran',
        slug: 'rapat-kerja-anggaran-2026',
        description: 'Pembahasan rancangan anggaran belanja operasional universitas dan pembiayaan program studi.',
        date: '2026-05-10',
        coverUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
        photos: [
            { id: '3', url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80', order: 1 },
            { id: '4', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80', order: 2 }
        ]
    }
];

export default function DokumentasiIndex() {
    const [albums, setAlbums] = useState<AlbumItem[]>([]);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('bka_albums');
        if (saved) {
            try {
                setAlbums(JSON.parse(saved));
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
        const target = albums.find(a => a.id === deletingId);
        const updated = albums.filter(a => a.id !== deletingId);
        saveAlbums(updated);
        setDeletingId(null);
        toast.success(`Album "${target?.title}" berhasil dihapus.`);
    };

    return (
        <>
            <Head title="Kelola Dokumentasi - Admin BKA" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-neutral-800">
                            <Images className="size-6 text-emerald-600" />
                            Galeri Dokumentasi BKA
                        </h1>
                        <p className="mt-1 text-sm leading-relaxed font-normal text-neutral-500">
                            Kelola album kegiatan, liputan dokumentasi sarana prasarana, rapat kerja, dan visual perkuliahan BKA.
                        </p>
                    </div>

                    <Link
                        href="/admin/dokumentasi/create"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-all outline-none"
                    >
                        <Plus className="size-4" />
                        Tambah Album
                    </Link>
                </div>

                {/* Grid album */}
                {albums.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {albums.map((album) => (
                            <div
                                key={album.id}
                                className="group bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                {/* Cover Image */}
                                <div className="aspect-video w-full overflow-hidden bg-neutral-100 relative border-b border-neutral-100">
                                    <img 
                                        src={album.coverUrl} 
                                        alt={album.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/800x450/E8F5E9/1B5E20?text=Album+BKA';
                                        }}
                                    />
                                    <div className="absolute top-2 right-2 bg-neutral-900/70 text-white rounded-lg px-2 py-0.5 text-[10px] font-extrabold backdrop-blur-xs">
                                        {album.photos.length} Foto
                                    </div>
                                </div>

                                {/* Body details */}
                                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-neutral-800 text-sm leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors">
                                            {album.title}
                                        </h3>
                                        {album.description && (
                                            <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed font-light">
                                                {album.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Date and actions */}
                                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs font-semibold text-neutral-400">
                                        <span className="flex items-center gap-1 text-[11px]">
                                            <Calendar className="size-3.5" />
                                            {album.date}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <Link
                                                href={`/admin/dokumentasi/${album.id}/edit`}
                                                className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                                                title="Edit Album & Foto"
                                            >
                                                <Edit2 className="size-3.5" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => setDeletingId(album.id)}
                                                className="p-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50"
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
                    <div className="bg-white border border-neutral-200/80 p-20 rounded-2xl text-center text-neutral-400">
                        <ImageIcon className="mx-auto mb-3 size-12 opacity-35 animate-pulse" />
                        <h3 className="text-sm font-semibold">Belum Ada Album Dokumentasi</h3>
                        <p className="text-xs text-neutral-400 mt-1">Buat album kegiatan perdana dengan mengklik tombol "Tambah Album" di atas.</p>
                    </div>
                )}
            </div>

            {/* Confirm Dialog */}
            {deletingId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center border border-neutral-200 animate-in zoom-in-95 duration-150">
                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <AlertCircle className="size-6" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-2">Hapus Album Kegiatan?</h3>
                        <p className="text-sm leading-relaxed text-neutral-500 mb-6">
                            Apakah Anda yakin ingin menghapus album "<strong>{albums.find(a => a.id === deletingId)?.title}</strong>"? Seluruh berkas foto di dalam album ini akan ikut terhapus dari sistem local.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeletingId(null)}
                                className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors outline-none"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 shadow-sm transition-all outline-none"
                            >
                                Hapus Permanen
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
