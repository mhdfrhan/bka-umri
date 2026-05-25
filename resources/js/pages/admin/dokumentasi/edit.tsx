import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Images,
    ArrowLeft,
    Save,
    Globe,
    Image as ImageIcon,
    Trash2,
    ArrowUp,
    ArrowDown,
    Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { AssetPickerModal } from '@/components/admin/asset-picker-modal';
import { ImageUploadModal } from '@/components/admin/image-upload-modal';
import { optimizeFile } from '@/lib/image-optimizer';

interface PhotoItem {
    id: string;
    url: string;
    order: number;
}

export default function EditAlbum() {
    const [albumId, setAlbumId] = useState<number | null>(null);
    const [albumList, setAlbumList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState<string[]>([
        'Keuangan',
        'Aset',
    ]);
    const [photos, setPhotos] = useState<PhotoItem[]>([]);

    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(
        null,
    );
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
    const [isSlugEdited, setIsSlugEdited] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const pathSegments = window.location.pathname.split('/');
            const idStr = pathSegments[pathSegments.length - 2];
            const parsedId = parseInt(idStr, 10);
            setAlbumId(parsedId);

            const saved = localStorage.getItem('bka_albums');
            let loaded: any[] = [];
            if (saved) {
                try {
                    loaded = JSON.parse(saved);
                    setAlbumList(loaded);
                } catch {
                    loaded = [];
                }
            }

            const savedCats = localStorage.getItem(
                'bka_dokumentasi_categories',
            );
            let loadedCats = ['Keuangan', 'Aset'];
            if (savedCats) {
                try {
                    loadedCats = JSON.parse(savedCats);
                } catch {
                    // ignore
                }
            }
            setCategories(loadedCats);

            const item = loaded.find((a: any) => a.id === parsedId);
            if (item) {
                setTitle(item.title || '');
                setSlug(item.slug || '');
                setDescription(item.description || '');
                setDate(item.date || new Date().toISOString().split('T')[0]);
                setCoverUrl(item.coverUrl || '');
                setPhotos(item.photos || []);
                setCategory(item.category || loadedCats[0] || 'Tanpa Kategori');
            } else {
                toast.error('Album tidak ditemukan!');
                router.visit('/admin/dokumentasi');
            }
            setIsLoading(false);
        }
    }, []);

    const handleTitleChange = (val: string) => {
        setTitle(val);
        if (!isSlugEdited) {
            const generated = val
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            setSlug(generated);
        }
    };

    const handleSlugChange = (val: string) => {
        setIsSlugEdited(true);
        const cleaned = val
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        setSlug(cleaned);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File gambar melebihi batas 10MB!');
            return;
        }

        setSelectedUploadFile(file);
        setIsUploadModalOpen(true);
        e.target.value = '';
    };

    const handleUploadConfirm = (result: { base64: string }) => {
        setCoverUrl(result.base64);
        toast.success('Cover album berhasil diunggah & dioptimasi!');
    };

    const handlePhotosUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (photos.length + files.length > 50) {
            toast.error('Maksimal 50 foto per album!');
            return;
        }

        setIsUploadingPhotos(true);
        const newPhotos = [...photos];
        const savedAssets = localStorage.getItem('bka_assets');
        const assetsList = savedAssets ? JSON.parse(savedAssets) : [];
        let successCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File "${file.name}" melebihi batas 10MB!`);
                continue;
            }

            try {
                const result = await optimizeFile(file, 800, 0.7);
                const nextOrder =
                    newPhotos.length > 0
                        ? Math.max(...newPhotos.map((p) => p.order)) + 1
                        : 1;

                const newPhoto: PhotoItem = {
                    id: String(Date.now() + i),
                    url: result.base64,
                    order: nextOrder,
                };

                newPhotos.push(newPhoto);

                assetsList.unshift({
                    id: String(Date.now() + i),
                    name: result.name,
                    url: result.base64,
                    type: 'image',
                    extension: 'webp',
                    size: result.size,
                    originalSize: result.originalSize,
                    isVisible: true,
                    createdAt: new Date().toISOString().split('T')[0],
                });

                successCount++;
            } catch {
                toast.error(`Gagal mengompresi foto "${file.name}"`);
            }
        }

        if (successCount > 0) {
            setPhotos(newPhotos);
            localStorage.setItem('bka_assets', JSON.stringify(assetsList));
            toast.success(
                `${successCount} foto berhasil dikompresi & dimasukkan ke album!`,
            );
        }

        setIsUploadingPhotos(false);
        e.target.value = '';
    };

    const handleDeletePhoto = (id: string) => {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        toast.info(
            'Foto dilepas dari album (berkas asli di Aset Media tetap aman).',
        );
    };

    const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === photos.length - 1) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const updated = [...photos];

        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;

        const final = updated.map((p, idx) => ({ ...p, order: idx + 1 }));
        setPhotos(final);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (title.trim().length < 5) {
            toast.error('Judul album minimal harus 5 karakter!');
            return;
        }
        if (!slug.trim()) {
            toast.error('Slug URL wajib diisi!');
            return;
        }

        setIsSaving(true);

        try {
            const isSlugTaken = albumList.some(
                (a: any) => a.slug === slug && a.id !== albumId,
            );
            if (isSlugTaken) {
                toast.error(
                    'Slug URL sudah digunakan album lain! Ubah secara manual.',
                );
                setIsSaving(false);
                return;
            }

            const updatedAlbum = {
                id: albumId,
                title: title.trim(),
                slug: slug.trim(),
                description: description.trim(),
                date,
                coverUrl,
                category,
                photos,
            };

            const updatedList = albumList.map((a: any) =>
                a.id === albumId ? updatedAlbum : a,
            );
            localStorage.setItem('bka_albums', JSON.stringify(updatedList));

            toast.success(`Album "${title}" berhasil diperbarui!`);
            router.visit('/admin/dokumentasi');
        } catch {
            toast.error('Gagal menyimpan album.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <>
            <Head title={`Edit Album - ${title}`} />

            <div className="mx-auto w-full max-w-4xl space-y-6 p-6 md:space-y-8 md:p-8">
                <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center">
                    <div>
                        <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-neutral-400">
                            <Link
                                href="/admin/dokumentasi"
                                className="flex items-center gap-1 transition-colors select-none hover:text-emerald-700"
                            >
                                <ArrowLeft className="size-4" />
                                Kembali ke Daftar
                            </Link>
                        </div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-neutral-800">
                            <Images className="size-6 text-emerald-600" />
                            Kelola Album: {title}
                        </h1>
                        <p className="mt-1 text-sm leading-relaxed font-light text-neutral-500">
                            Sesuaikan rincian album, tambahkan foto dokumentasi
                            secara massal, dan atur tata urutannya.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-5 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                        <div className="border-b border-neutral-100 pb-2">
                            <h2 className="text-sm font-extrabold tracking-wide text-neutral-800 uppercase">
                                Detail Informasi Album
                            </h2>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700">
                                Judul Album
                            </label>
                            <input
                                type="text"
                                maxLength={150}
                                required
                                value={title}
                                onChange={(e) =>
                                    handleTitleChange(e.target.value)
                                }
                                placeholder="Contoh: Kunjungan Evaluasi LLDIKTI Wilayah X"
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1 text-sm font-semibold text-neutral-700">
                                <Globe className="size-4 text-neutral-400" />
                                Slug URL Album
                                <span className="text-xs font-normal text-neutral-400">
                                    (Auto-generated / Editable)
                                </span>
                            </label>
                            <input
                                type="text"
                                required
                                value={slug}
                                onChange={(e) =>
                                    handleSlugChange(e.target.value)
                                }
                                placeholder="contoh: kunjungan-evaluasi-lldikti"
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 font-mono text-sm text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-1.5 md:col-span-1">
                                <label className="text-sm font-semibold text-neutral-700">
                                    Kategori Album
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                    {categories.length === 0 && (
                                        <option value="Tanpa Kategori">
                                            Tanpa Kategori
                                        </option>
                                    )}
                                    <option value="Tanpa Kategori">
                                        Tanpa Kategori
                                    </option>
                                </select>
                            </div>

                            <div className="space-y-1.5 md:col-span-1">
                                <label className="text-sm font-semibold text-neutral-700">
                                    Tanggal Kegiatan
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                            </div>

                            <div className="space-y-1.5 md:col-span-1">
                                <label className="text-sm font-semibold text-neutral-700">
                                    Deskripsi Singkat (Maks 500 Karakter)
                                </label>
                                <textarea
                                    maxLength={500}
                                    rows={2}
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Rangkuman singkat isi album liputan kegiatan ini..."
                                    className="w-full resize-none rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="block text-sm font-semibold text-neutral-700">
                                Foto Sampul Album (Rasio 16:9)
                            </label>

                            <div className="flex flex-col items-start gap-4 md:flex-row">
                                <div className="w-full flex-1 space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={coverUrl}
                                            onChange={(e) =>
                                                setCoverUrl(e.target.value)
                                            }
                                            placeholder="URL Gambar..."
                                            className="flex-1 rounded-xl border border-neutral-200 bg-white p-3 font-mono text-xs text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsPickerOpen(true)
                                            }
                                            className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-100"
                                        >
                                            Pilih dari Aset
                                        </button>
                                    </div>

                                    <div className="space-y-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-neutral-600">
                                                Unggah Gambar Langsung
                                            </span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="w-full text-xs text-neutral-500 file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-emerald-700 file:hover:bg-emerald-100"
                                        />
                                    </div>
                                </div>

                                <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-200/60 bg-neutral-100 md:w-56">
                                    <img
                                        src={coverUrl}
                                        alt="Pratinjau Cover"
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                'https://placehold.co/800x450/E8F5E9/1B5E20?text=Album+BKA';
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                            <h2 className="text-sm font-extrabold tracking-wide text-neutral-800 uppercase">
                                Foto Dokumentasi ({photos.length} / 50)
                            </h2>
                            <span className="text-neutral-450 text-[10px] font-bold">
                                Dimaksimalkan ke format WebP
                            </span>
                        </div>

                        <div className="space-y-3">
                            <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center transition-all hover:border-emerald-500/50 hover:bg-emerald-50/20">
                                <Plus className="mb-2 size-8 text-neutral-400 transition-colors group-hover:text-emerald-600" />
                                <span className="text-xs font-bold text-neutral-600">
                                    Unggah foto liputan baru ke album
                                </span>
                                <span className="mt-1 text-[10px] text-neutral-400">
                                    Multi-upload berkas JPG/PNG/WebP, maks 10MB
                                </span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handlePhotosUpload}
                                    className="hidden"
                                    disabled={isUploadingPhotos}
                                />
                            </label>
                            {isUploadingPhotos && (
                                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600">
                                    <div className="size-3.5 animate-spin rounded-full border-t-2 border-b-2 border-emerald-600" />
                                    Sedang mengompresi & menyalin foto-foto ke
                                    album...
                                </div>
                            )}
                        </div>

                        {photos.length > 0 ? (
                            <div className="grid grid-cols-2 gap-6 pt-2 sm:grid-cols-3 md:grid-cols-4">
                                {photos
                                    .sort((a, b) => a.order - b.order)
                                    .map((photo, index) => (
                                        <div
                                            key={photo.id}
                                            className="group relative aspect-video overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                                        >
                                            <img
                                                src={photo.url}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />

                                            <div className="absolute inset-0 flex items-center justify-center gap-2.5 bg-neutral-900/60 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                                                <button
                                                    type="button"
                                                    disabled={index === 0}
                                                    onClick={() =>
                                                        handleMovePhoto(
                                                            index,
                                                            'up',
                                                        )
                                                    }
                                                    className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20 disabled:opacity-30"
                                                    title="Pindah ke Kiri"
                                                >
                                                    <ArrowUp className="size-4 -rotate-90" />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={
                                                        index ===
                                                        photos.length - 1
                                                    }
                                                    onClick={() =>
                                                        handleMovePhoto(
                                                            index,
                                                            'down',
                                                        )
                                                    }
                                                    className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20 disabled:opacity-30"
                                                    title="Pindah ke Kanan"
                                                >
                                                    <ArrowDown className="size-4 -rotate-90" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeletePhoto(
                                                            photo.id,
                                                        )
                                                    }
                                                    className="bg-red-650 rounded-lg p-1.5 text-white hover:bg-red-700"
                                                    title="Lepas dari Album"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-10 text-center text-neutral-400">
                                <ImageIcon className="mx-auto mb-2 size-10 opacity-35" />
                                <p className="text-xs font-bold">
                                    Belum ada foto dalam album.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href="/admin/dokumentasi"
                            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-98 disabled:opacity-50"
                        >
                            <Save className="size-4" />
                            {isSaving ? 'Menyimpan...' : 'Perbarui Album'}
                        </button>
                    </div>
                </form>
            </div>

            <AssetPickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={setCoverUrl}
            />

            <ImageUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setSelectedUploadFile(null);
                }}
                file={selectedUploadFile}
                onConfirm={handleUploadConfirm}
            />
        </>
    );
}

EditAlbum.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Kelola Dokumentasi',
            href: '/admin/dokumentasi',
        },
        {
            title: 'Edit Album',
            href: '#',
        },
    ],
};
