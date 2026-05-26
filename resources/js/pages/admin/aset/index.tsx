import { Head, router } from '@inertiajs/react';
import {
    Image as ImageIcon,
    FileText,
    Upload,
    Copy,
    Trash2,
    Search,
    FileUp,
    Eye,
    Info,
    Check,
    HardDrive,
    Sliders,
    EyeOff,
    X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AdminModal } from '@/components/admin/admin-modal';
import { formatFileSize } from '@/lib/format-file-size';
import { optimizeFile } from '@/lib/image-optimizer';

interface Asset {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'file';
    extension: string;
    size: number;
    originalSize: number;
    isVisible: boolean;
    createdAt: string;
}

interface AsetIndexProps {
    assets: Asset[];
    totalOptimized: number;
    totalOriginal: number;
    savePercent: number;
}

export default function AsetIndex({
    assets = [],
    totalOptimized = 0,
    totalOriginal = 0,
    savePercent = 0,
}: AsetIndexProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'file'>(
        'all',
    );

    // Compression Options
    const [maxWidth, setMaxWidth] = useState(800);
    const [quality, setQuality] = useState(70);
    const [addToGallery, setAddToGallery] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Selected Asset Details modal / overlay
    const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);

    // Sync viewing asset details when assets prop changes
    useEffect(() => {
        if (viewingAsset) {
            const current = assets.find(
                (a) => String(a.id) === String(viewingAsset.id),
            );
            if (current) {
                setViewingAsset(current);
            } else {
                setViewingAsset(null);
            }
        }
    }, [assets]);

    // Handle file upload & optimization sequentially to prevent concurrent request conflicts in Inertia
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (!files || files.length === 0) {
            return;
        }

        setIsUploading(true);

        const uploadFile = (index: number) => {
            if (index >= files.length) {
                setIsUploading(false);
                toast.success('Semua file berhasil diunggah & dioptimasi!');
                // Reset file input
                e.target.value = '';
                return;
            }

            const file = files[index];
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File "${file.name}" melebihi batas 10MB!`);
                uploadFile(index + 1);
                return;
            }

            optimizeFile(file, maxWidth, quality / 100)
                .then((result) => {
                    router.post(
                        '/admin/aset',
                        {
                            name: result.name,
                            url: result.base64,
                            type: result.type,
                            extension: result.extension,
                            size: result.size,
                            originalSize: result.originalSize,
                            isVisible: addToGallery,
                        },
                        {
                            preserveScroll: true,
                            onSuccess: () => {
                                uploadFile(index + 1);
                            },
                            onError: () => {
                                toast.error(
                                    `Gagal mengunggah "${file.name}" ke server`,
                                );
                                uploadFile(index + 1);
                            },
                        },
                    );
                })
                .catch((err) => {
                    toast.error(`Gagal mengoptimasi file "${file.name}"`);
                    uploadFile(index + 1);
                });
        };

        uploadFile(0);
    };

    // Toggle asset visibility on the backend
    const handleToggleVisibility = (id: string) => {
        const asset = assets.find((a) => String(a.id) === String(id));
        if (!asset) return;

        router.put(
            `/admin/aset/${id}`,
            {
                is_visible: !asset.isVisible,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.info('Visibilitas aset diperbarui.');
                    if (
                        viewingAsset &&
                        String(viewingAsset.id) === String(id)
                    ) {
                        setViewingAsset((prev) =>
                            prev
                                ? { ...prev, isVisible: !prev.isVisible }
                                : null,
                        );
                    }
                },
                onError: () => {
                    toast.error('Gagal memperbarui visibilitas aset.');
                },
            },
        );
    };

    // Copy URL to Clipboard
    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('URL Aset berhasil disalin ke clipboard!');
    };

    // Delete asset from the backend
    const handleDeleteAsset = (id: string) => {
        const item = assets.find((a) => String(a.id) === String(id));
        router.delete(`/admin/aset/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Aset "${item?.name || ''}" berhasil dihapus.`);
                setViewingAsset(null);
            },
            onError: () => {
                toast.error('Gagal menghapus aset.');
            },
        });
    };

    // Filters logic
    const filtered = assets.filter((a) => {
        const matchesSearch = a.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'all' || a.type === activeFilter;

        return matchesSearch && matchesFilter;
    });

    // Helper to get file icon
    const renderFileIcon = (ext: string) => {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-emerald-50 text-emerald-800">
                <FileText className="mb-1 size-10" />
                <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white uppercase">
                    {ext}
                </span>
            </div>
        );
    };

    return (
        <>
            <Head title="Kelola Aset Media - Admin BKA" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-neutral-800">
                            <HardDrive className="size-6 text-emerald-600" />
                            Pustaka & Aset Media BKA
                        </h1>
                        <p className="mt-1 text-sm leading-relaxed font-normal text-neutral-500">
                            Unggah berkas, lakukan kompresi otomatis ke WebP,
                            atur kualitas penyimpanan, serta kelola visibilitas
                            aset global.
                        </p>
                    </div>
                </div>

                {/* Storage Dashboard Widget */}
                <div className="grid grid-cols-1 gap-6 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] md:grid-cols-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
                            Aset Terdaftar
                        </label>
                        <p className="text-2xl font-extrabold text-neutral-800">
                            {assets.length} Berkas
                        </p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
                            Ukuran di Penyimpanan
                        </label>
                        <p className="text-2xl font-extrabold text-emerald-800">
                            {formatFileSize(totalOptimized)}
                            {totalOriginal > 0 && (
                                <span className="ml-1 text-xs font-semibold text-neutral-400">
                                    (Semula {formatFileSize(totalOriginal)})
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
                            Efisiensi Kompresi
                        </label>
                        <p className="text-2xl font-extrabold text-amber-600">
                            {savePercent}% Lebih Hemat
                        </p>
                    </div>
                </div>

                {/* 2-Column Upload & Grid layout */}
                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[30%_1fr]">
                    {/* Left Column: Upload Form & Config Panel */}
                    <div className="space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                            <Sliders className="size-4 text-emerald-600" />
                            <h2 className="text-sm font-extrabold tracking-wide text-neutral-800 uppercase">
                                Pengaturan Upload
                            </h2>
                        </div>

                        {/* Upload area */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                                Pilih Berkas
                            </label>
                            <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center transition-all hover:border-emerald-500/50 hover:bg-emerald-50/20">
                                <FileUp className="mb-2 size-8 text-neutral-400 transition-colors group-hover:text-emerald-600" />
                                <span className="text-xs font-bold text-neutral-600">
                                    Seret file atau klik disini
                                </span>
                                <span className="mt-1 text-[10px] text-neutral-400">
                                    Maksimal 10MB per file
                                </span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf,.docx,.xlsx,.pptx"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    disabled={isUploading}
                                />
                            </label>
                            {isUploading && (
                                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600">
                                    <div className="size-3.5 animate-spin rounded-full border-t-2 border-b-2 border-emerald-600" />
                                    Sedang mengoptimasi & mengunggah...
                                </div>
                            )}
                        </div>

                        {/* Compression options */}
                        <div className="space-y-4 border-t border-neutral-100 pt-2">
                            {/* Max Width Slider */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
                                    <span>RESOLUSI LEBAR MAKS</span>
                                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">
                                        {maxWidth}px
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={400}
                                    max={1920}
                                    step={100}
                                    value={maxWidth}
                                    onChange={(e) =>
                                        setMaxWidth(Number(e.target.value))
                                    }
                                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-emerald-600"
                                />
                                <span className="block text-[10px] leading-tight text-neutral-400">
                                    Membatasi lebar gambar. Berguna mengurangi
                                    ukuran berkas secara signifikan.
                                </span>
                            </div>

                            {/* Quality Slider */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
                                    <span>KUALITAS KOMPRESI</span>
                                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">
                                        {quality}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={20}
                                    max={100}
                                    step={5}
                                    value={quality}
                                    onChange={(e) =>
                                        setQuality(Number(e.target.value))
                                    }
                                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-emerald-600"
                                />
                                <span className="block text-[10px] leading-tight text-neutral-400">
                                    Semakin kecil, gambar terkompresi lebih
                                    ekstrem tapi ketajaman berkurang.
                                </span>
                            </div>

                            {/* Tampilkan di Galeri Aset */}
                            <label className="flex cursor-pointer items-center gap-2 pt-2 select-none">
                                <input
                                    type="checkbox"
                                    checked={addToGallery}
                                    onChange={(e) =>
                                        setAddToGallery(e.target.checked)
                                    }
                                    className="size-4 cursor-pointer rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-neutral-700">
                                        Tampilkan di Galeri Aset
                                    </span>
                                    <span className="text-[10px] leading-tight text-neutral-400">
                                        Jika dicentang, gambar otomatis
                                        terdaftar di modal pustaka aset global.
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Right Column: Filters & Assets Grid */}
                    <div className="space-y-6">
                        {/* Filters and search toolbar */}
                        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] md:flex-row">
                            <div className="flex w-full items-center gap-1.5 md:w-auto">
                                <button
                                    onClick={() => setActiveFilter('all')}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                        activeFilter === 'all'
                                            ? 'bg-neutral-800 text-white'
                                            : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                                    }`}
                                >
                                    Semua
                                </button>
                                <button
                                    onClick={() => setActiveFilter('image')}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                        activeFilter === 'image'
                                            ? 'bg-neutral-800 text-white'
                                            : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                                    }`}
                                >
                                    Gambar
                                </button>
                                <button
                                    onClick={() => setActiveFilter('file')}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                        activeFilter === 'file'
                                            ? 'bg-neutral-800 text-white'
                                            : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                                    }`}
                                >
                                    Dokumen
                                </button>
                            </div>

                            {/* Search bar */}
                            <div className="relative w-full md:max-w-xs">
                                <input
                                    type="text"
                                    placeholder="Cari nama berkas..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-neutral-200 bg-white py-1.5 pr-4 pl-9 text-xs font-semibold text-neutral-800 transition-colors focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                                />
                                <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-neutral-400" />
                            </div>
                        </div>

                        {/* Assets Grid */}
                        {filtered.length > 0 ? (
                            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                                {filtered.map((asset) => {
                                    const compressionRatio =
                                        asset.originalSize > 0
                                            ? Math.round(
                                                  ((asset.originalSize -
                                                      asset.size) /
                                                      asset.originalSize) *
                                                      100,
                                              )
                                            : 0;

                                    return (
                                        <div
                                            key={asset.id}
                                            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all hover:shadow-md"
                                        >
                                            {/* Preview area */}
                                            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden border-b border-neutral-100 bg-neutral-50">
                                                {asset.type === 'image' ? (
                                                    <img
                                                        src={asset.url}
                                                        alt={asset.name}
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    renderFileIcon(
                                                        asset.extension,
                                                    )
                                                )}

                                                {/* Visibility indicator tag */}
                                                <div className="absolute top-2 left-2 z-10">
                                                    {asset.isVisible ? (
                                                        <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-extrabold text-white uppercase shadow-sm">
                                                            <Eye className="size-2.5" />
                                                            Galeri
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 rounded-full bg-neutral-600 px-2 py-0.5 text-[9px] font-extrabold text-white uppercase shadow-sm">
                                                            <EyeOff className="size-2.5" />
                                                            Private
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content details */}
                                            <div className="flex flex-1 flex-col justify-between space-y-2 p-3.5">
                                                <div className="space-y-0.5">
                                                    <p
                                                        className="truncate text-xs font-bold text-neutral-800"
                                                        title={asset.name}
                                                    >
                                                        {asset.name}
                                                    </p>
                                                    <div className="flex items-center justify-between text-[10px] font-medium text-neutral-400">
                                                        <span>
                                                            {formatFileSize(
                                                                asset.size,
                                                            )}
                                                        </span>
                                                        {asset.type ===
                                                            'image' &&
                                                            compressionRatio >
                                                                0 && (
                                                                <span className="font-bold text-emerald-700">
                                                                    -
                                                                    {
                                                                        compressionRatio
                                                                    }
                                                                    %
                                                                </span>
                                                            )}
                                                    </div>
                                                </div>

                                                {/* Hover details overlay button or explicit trigger */}
                                                <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setViewingAsset(
                                                                asset,
                                                            )
                                                        }
                                                        className="rounded-md p-1 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700"
                                                        title="Detail Aset"
                                                    >
                                                        <Info className="size-3.5" />
                                                    </button>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleCopyUrl(
                                                                    asset.url,
                                                                )
                                                            }
                                                            className="rounded-md p-1 text-neutral-500 hover:bg-neutral-50 hover:text-emerald-700"
                                                            title="Salin URL Aset"
                                                        >
                                                            <Copy className="size-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteAsset(
                                                                    asset.id,
                                                                )
                                                            }
                                                            className="rounded-md p-1 text-red-500 hover:bg-red-50"
                                                            title="Hapus Aset"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-neutral-200/80 bg-white p-20 text-center text-neutral-400">
                                <ImageIcon className="mx-auto mb-3 size-12 animate-pulse opacity-35" />
                                <h3 className="text-sm font-semibold">
                                    Tidak Ada Aset
                                </h3>
                                <p className="mt-1 text-xs text-neutral-400">
                                    Coba bersihkan kata kunci pencarian atau
                                    unggah aset baru di sebelah kiri.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Asset Detail Overlay Modal */}
            <AdminModal
                isOpen={!!viewingAsset}
                onClose={() => setViewingAsset(null)}
                title="Informasi Aset Media"
                maxWidth="md"
            >
                {viewingAsset && (
                    <div className="space-y-4">
                        {/* Image Preview */}
                        <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-200/60 bg-neutral-50">
                            {viewingAsset.type === 'image' ? (
                                <img
                                    src={viewingAsset.url}
                                    alt=""
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <FileText className="size-16 text-emerald-700" />
                            )}
                        </div>

                        {/* Metadata table */}
                        <div className="space-y-2.5 text-xs font-semibold text-neutral-700">
                            <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                                <span className="text-neutral-400">
                                    Nama File
                                </span>
                                <span className="text-right break-all text-neutral-800 select-all">
                                    {viewingAsset.name}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                                <span className="text-neutral-400">
                                    Tipe Berkas
                                </span>
                                <span className="font-extrabold text-neutral-800 uppercase">
                                    {viewingAsset.extension}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                                <span className="text-neutral-400">
                                    Ukuran Akhir (Optimasi)
                                </span>
                                <span className="font-bold text-emerald-700">
                                    {formatFileSize(viewingAsset.size)}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                                <span className="text-neutral-400">
                                    Ukuran Asli
                                </span>
                                <span className="text-neutral-600">
                                    {formatFileSize(viewingAsset.originalSize)}
                                </span>
                            </div>
                            {viewingAsset.type === 'image' &&
                                viewingAsset.originalSize > 0 && (
                                    <div className="flex justify-between rounded-lg border-b border-neutral-50 bg-emerald-50/50 p-2 pb-1.5">
                                        <span className="text-emerald-800">
                                            Rasio Penghematan
                                        </span>
                                        <span className="font-extrabold text-emerald-800">
                                            {Math.round(
                                                ((viewingAsset.originalSize -
                                                    viewingAsset.size) /
                                                    viewingAsset.originalSize) *
                                                    100,
                                            )}
                                            % Lebih Ringan
                                        </span>
                                    </div>
                                )}
                            <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                                <span className="text-neutral-400">
                                    Tanggal Diunggah
                                </span>
                                <span className="text-neutral-800">
                                    {viewingAsset.createdAt}
                                </span>
                            </div>

                            {/* Toggle visibility directly */}
                            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-200/50 bg-neutral-50 p-2 select-none">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-neutral-800">
                                        Tampilkan di Galeri Aset Utama
                                    </span>
                                    <span className="text-[10px] leading-tight text-neutral-400">
                                        Agar dapat digunakan di halaman web
                                        lainnya
                                    </span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={viewingAsset.isVisible}
                                    onChange={() =>
                                        handleToggleVisibility(viewingAsset.id)
                                    }
                                    className="size-4 cursor-pointer rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                                />
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 border-t border-neutral-100 pt-2">
                            <button
                                type="button"
                                onClick={() => handleCopyUrl(viewingAsset.url)}
                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                            >
                                <Copy className="size-3.5" />
                                Salin URL Aset
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleDeleteAsset(viewingAsset.id)
                                }
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-50 p-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                            >
                                <Trash2 className="size-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </AdminModal>
        </>
    );
}

// Layout Breadcrumbs Setup for top admin bar
AsetIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Aset Media',
            href: '/admin/aset',
        },
    ],
};
