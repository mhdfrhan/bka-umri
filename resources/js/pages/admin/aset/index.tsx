import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
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
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { optimizeFile } from '@/lib/image-optimizer';
import { formatFileSize } from '@/lib/format-file-size';

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

export default function AsetIndex() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'file'>('all');
    
    // Compression Options
    const [maxWidth, setMaxWidth] = useState(800);
    const [quality, setQuality] = useState(70);
    const [addToGallery, setAddToGallery] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Selected Asset Details modal / overlay
    const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);

    // Load assets from local storage
    useEffect(() => {
        const saved = localStorage.getItem('bka_assets');
        if (saved) {
            try {
                setAssets(JSON.parse(saved));
            } catch {
                setAssets([]);
            }
        }
    }, []);

    const saveAssets = (updatedList: Asset[]) => {
        setAssets(updatedList);
        localStorage.setItem('bka_assets', JSON.stringify(updatedList));
    };

    // Handle file upload & optimization
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        let successCount = 0;
        const newList = [...assets];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Limit 10MB
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File "${file.name}" melebihi batas 10MB!`);
                continue;
            }

            try {
                const result = await optimizeFile(file, maxWidth, quality / 100);
                
                const newAsset: Asset = {
                    id: String(Date.now() + i),
                    name: result.name,
                    url: result.base64,
                    type: result.type,
                    extension: result.extension,
                    size: result.size,
                    originalSize: result.originalSize,
                    isVisible: addToGallery,
                    createdAt: new Date().toISOString().split('T')[0]
                };

                newList.unshift(newAsset);
                successCount++;
            } catch (err) {
                toast.error(`Gagal mengoptimasi file "${file.name}"`);
            }
        }

        if (successCount > 0) {
            saveAssets(newList);
            toast.success(`${successCount} file berhasil diunggah & dioptimasi!`);
        }

        setIsUploading(false);
        // Reset file input
        e.target.value = '';
    };

    // Toggle asset visibility
    const handleToggleVisibility = (id: string) => {
        const updated = assets.map(a => a.id === id ? { ...a, isVisible: !a.isVisible } : a);
        saveAssets(updated);
        toast.info('Visibilitas aset diperbarui.');
        if (viewingAsset && viewingAsset.id === id) {
            setViewingAsset(prev => prev ? { ...prev, isVisible: !prev.isVisible } : null);
        }
    };

    // Copy URL to Clipboard
    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('URL Aset (Base64 Data) berhasil disalin ke clipboard!');
    };

    // Delete asset
    const handleDeleteAsset = (id: string) => {
        const item = assets.find(a => a.id === id);
        const updated = assets.filter(a => a.id !== id);
        saveAssets(updated);
        toast.success(`Aset "${item?.name}" berhasil dihapus.`);
        setViewingAsset(null);
    };

    // Filters logic
    const filtered = assets.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'all' || a.type === activeFilter;
        return matchesSearch && matchesFilter;
    });

    // Helper to get file icon
    const renderFileIcon = (ext: string) => {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-emerald-50 text-emerald-800">
                <FileText className="size-10 mb-1" />
                <span className="text-[10px] font-extrabold uppercase bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                    {ext}
                </span>
            </div>
        );
    };

    // Calculate total optimized size vs original size
    const totalOptimized = assets.reduce((sum, a) => sum + a.size, 0);
    const totalOriginal = assets.reduce((sum, a) => sum + a.originalSize, 0);
    const savePercent = totalOriginal > 0 ? Math.round(((totalOriginal - totalOptimized) / totalOriginal) * 100) : 0;

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
                            Unggah berkas, lakukan kompresi otomatis ke WebP, atur kualitas penyimpanan, serta kelola visibilitas aset global.
                        </p>
                    </div>
                </div>

                {/* Storage Dashboard Widget */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-neutral-200/80 p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Aset Terdaftar</label>
                        <p className="text-2xl font-extrabold text-neutral-800">{assets.length} Berkas</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Ukuran di Penyimpanan</label>
                        <p className="text-2xl font-extrabold text-emerald-800">
                            {formatFileSize(totalOptimized)} 
                            {totalOriginal > 0 && (
                                <span className="text-xs font-semibold text-neutral-400 ml-1">
                                    (Semula {formatFileSize(totalOriginal)})
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Efisiensi Kompresi</label>
                        <p className="text-2xl font-extrabold text-amber-600">
                            {savePercent}% Lebih Hemat
                        </p>
                    </div>
                </div>

                {/* 2-Column Upload & Grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[30%_1fr] gap-8 items-start">
                    
                    {/* Left Column: Upload Form & Config Panel */}
                    <div className="space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                        <div className="border-b border-neutral-100 pb-3 flex items-center gap-2">
                            <Sliders className="size-4 text-emerald-600" />
                            <h2 className="text-sm font-extrabold uppercase tracking-wide text-neutral-800">Pengaturan Upload</h2>
                        </div>

                        {/* Upload area */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Pilih Berkas</label>
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 hover:border-emerald-500/50 hover:bg-emerald-50/20 rounded-xl p-8 cursor-pointer text-center group transition-all">
                                <FileUp className="size-8 text-neutral-400 group-hover:text-emerald-600 transition-colors mb-2" />
                                <span className="text-xs font-bold text-neutral-600">Seret file atau klik disini</span>
                                <span className="text-[10px] text-neutral-400 mt-1">Maksimal 10MB per file</span>
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
                                    <div className="size-3.5 border-t-2 border-b-2 border-emerald-600 rounded-full animate-spin" />
                                    Sedang mengoptimasi & mengunggah...
                                </div>
                            )}
                        </div>

                        {/* Compression options */}
                        <div className="space-y-4 pt-2 border-t border-neutral-100">
                            {/* Max Width Slider */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-bold text-neutral-600">
                                    <span>RESOLUSI LEBAR MAKS</span>
                                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{maxWidth}px</span>
                                </div>
                                <input
                                    type="range"
                                    min={400}
                                    max={1920}
                                    step={100}
                                    value={maxWidth}
                                    onChange={(e) => setMaxWidth(Number(e.target.value))}
                                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                />
                                <span className="text-[10px] text-neutral-400 block leading-tight">Membatasi lebar gambar. Berguna mengurangi ukuran berkas secara signifikan.</span>
                            </div>

                            {/* Quality Slider */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-bold text-neutral-600">
                                    <span>KUALITAS KOMPRESI</span>
                                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{quality}%</span>
                                </div>
                                <input
                                    type="range"
                                    min={20}
                                    max={100}
                                    step={5}
                                    value={quality}
                                    onChange={(e) => setQuality(Number(e.target.value))}
                                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                />
                                <span className="text-[10px] text-neutral-400 block leading-tight">Semakin kecil, gambar terkompresi lebih ekstrem tapi ketajaman berkurang.</span>
                            </div>

                            {/* Tampilkan di Galeri Aset */}
                            <label className="flex items-center gap-2 cursor-pointer select-none pt-2">
                                <input
                                    type="checkbox"
                                    checked={addToGallery}
                                    onChange={(e) => setAddToGallery(e.target.checked)}
                                    className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 size-4 cursor-pointer"
                                />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-neutral-700">Tampilkan di Galeri Aset</span>
                                    <span className="text-[10px] text-neutral-400 leading-tight">Jika dicentang, gambar otomatis terdaftar di modal pustaka aset global.</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Right Column: Filters & Assets Grid */}
                    <div className="space-y-6">
                        
                        {/* Filters and search toolbar */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center gap-1.5 w-full md:w-auto">
                                <button
                                    onClick={() => setActiveFilter('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        activeFilter === 'all' 
                                            ? 'bg-neutral-800 text-white' 
                                            : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                                    }`}
                                >
                                    Semua
                                </button>
                                <button
                                    onClick={() => setActiveFilter('image')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        activeFilter === 'image' 
                                            ? 'bg-neutral-800 text-white' 
                                            : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                                    }`}
                                >
                                    Gambar
                                </button>
                                <button
                                    onClick={() => setActiveFilter('file')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-lg border border-neutral-200 bg-white py-1.5 pl-9 pr-4 text-xs font-semibold text-neutral-800 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
                            </div>
                        </div>

                        {/* Assets Grid */}
                        {filtered.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {filtered.map((asset) => {
                                    const compressionRatio = asset.originalSize > 0 
                                        ? Math.round(((asset.originalSize - asset.size) / asset.originalSize) * 100) 
                                        : 0;

                                    return (
                                        <div
                                            key={asset.id}
                                            className="group border border-neutral-200/80 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all flex flex-col justify-between relative shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
                                        >
                                            {/* Preview area */}
                                            <div className="aspect-video w-full border-b border-neutral-100 overflow-hidden bg-neutral-50 flex items-center justify-center relative">
                                                {asset.type === 'image' ? (
                                                    <img 
                                                        src={asset.url} 
                                                        alt={asset.name} 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    renderFileIcon(asset.extension)
                                                )}
                                                
                                                {/* Visibility indicator tag */}
                                                <div className="absolute top-2 left-2 z-10">
                                                    {asset.isVisible ? (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-600 text-white shadow-sm">
                                                            <Eye className="size-2.5" />
                                                            Galeri
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-neutral-600 text-white shadow-sm">
                                                            <EyeOff className="size-2.5" />
                                                            Private
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content details */}
                                            <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-bold text-neutral-800 truncate" title={asset.name}>
                                                        {asset.name}
                                                    </p>
                                                    <div className="flex items-center justify-between text-[10px] font-medium text-neutral-400">
                                                        <span>{formatFileSize(asset.size)}</span>
                                                        {asset.type === 'image' && compressionRatio > 0 && (
                                                            <span className="text-emerald-700 font-bold">-{compressionRatio}%</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Hover details overlay button or explicit trigger */}
                                                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => setViewingAsset(asset)}
                                                        className="p-1 rounded-md text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700"
                                                        title="Detail Aset"
                                                    >
                                                        <Info className="size-3.5" />
                                                    </button>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopyUrl(asset.url)}
                                                            className="p-1 rounded-md text-neutral-500 hover:bg-neutral-50 hover:text-emerald-700"
                                                            title="Salin URL Aset"
                                                        >
                                                            <Copy className="size-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteAsset(asset.id)}
                                                            className="p-1 rounded-md text-red-500 hover:bg-red-50"
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
                            <div className="bg-white border border-neutral-200/80 p-20 rounded-2xl text-center text-neutral-400">
                                <ImageIcon className="mx-auto mb-3 size-12 opacity-35 animate-pulse" />
                                <h3 className="text-sm font-semibold">Tidak Ada Aset</h3>
                                <p className="text-xs text-neutral-400 mt-1">Coba bersihkan kata kunci pencarian atau unggah aset baru di sebelah kiri.</p>
                            </div>
                        )}

                    </div>

                </div>

            </div>

            {/* Asset Detail Overlay Modal */}
            {viewingAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md rounded-2xl bg-white border border-neutral-200 p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 space-y-4">
                        <h3 className="text-base font-bold text-neutral-800 border-b border-neutral-100 pb-3 flex items-center justify-between">
                            <span>Informasi Aset Media</span>
                            <button
                                onClick={() => setViewingAsset(null)}
                                className="p-1 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg"
                            >
                                <X className="size-4" />
                            </button>
                        </h3>

                        {/* Image Preview */}
                        <div className="aspect-video w-full rounded-xl border border-neutral-200/60 overflow-hidden bg-neutral-50 flex items-center justify-center">
                            {viewingAsset.type === 'image' ? (
                                <img src={viewingAsset.url} alt="" className="w-full h-full object-contain" />
                            ) : (
                                <FileText className="size-16 text-emerald-700" />
                            )}
                        </div>

                        {/* Metadata table */}
                        <div className="text-xs font-semibold space-y-2.5 text-neutral-700">
                            <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                                <span className="text-neutral-400">Nama File</span>
                                <span className="text-neutral-800 break-all select-all">{viewingAsset.name}</span>
                            </div>
                            <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                                <span className="text-neutral-400">Tipe Berkas</span>
                                <span className="text-neutral-800 font-extrabold uppercase">{viewingAsset.extension}</span>
                            </div>
                            <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                                <span className="text-neutral-400">Ukuran Akhir (Optimasi)</span>
                                <span className="text-emerald-700 font-bold">{formatFileSize(viewingAsset.size)}</span>
                            </div>
                            <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                                <span className="text-neutral-400">Ukuran Asli</span>
                                <span className="text-neutral-600">{formatFileSize(viewingAsset.originalSize)}</span>
                            </div>
                            {viewingAsset.type === 'image' && viewingAsset.originalSize > 0 && (
                                <div className="flex justify-between border-b border-neutral-50 pb-1.5 bg-emerald-50/50 p-2 rounded-lg">
                                    <span className="text-emerald-800">Rasio Penghematan</span>
                                    <span className="text-emerald-800 font-extrabold">
                                        {Math.round(((viewingAsset.originalSize - viewingAsset.size) / viewingAsset.originalSize) * 100)}% Lebih Ringan
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                                <span className="text-neutral-400">Tanggal Diunggah</span>
                                <span className="text-neutral-800">{viewingAsset.createdAt}</span>
                            </div>
                            
                            {/* Toggle visibility directly */}
                            <label className="flex items-center justify-between p-2 bg-neutral-50 border border-neutral-200/50 rounded-xl cursor-pointer select-none">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-neutral-800">Tampilkan di Galeri Aset Utama</span>
                                    <span className="text-[10px] text-neutral-400 leading-tight">Agar dapat digunakan di halaman web lainnya</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={viewingAsset.isVisible}
                                    onChange={() => handleToggleVisibility(viewingAsset.id)}
                                    className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 size-4 cursor-pointer"
                                />
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                            <button
                                type="button"
                                onClick={() => handleCopyUrl(viewingAsset.url)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                            >
                                <Copy className="size-3.5" />
                                Salin URL Aset
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteAsset(viewingAsset.id)}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-50 p-2.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
                            >
                                <Trash2 className="size-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
