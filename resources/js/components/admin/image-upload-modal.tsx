import { useState, useEffect, useRef } from 'react';
import { X, Sliders, Image as ImageIcon, Check, Loader2, Maximize2 } from 'lucide-react';
import { optimizeFile, OptimizedFileResult } from '@/lib/image-optimizer';
import { formatFileSize } from '@/lib/format-file-size';
import { toast } from 'sonner';

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: File | null;
    onConfirm: (result: { base64: string; size: number; originalSize: number; name: string; isVisible: boolean }) => void;
    defaultWidth?: number;
    defaultQuality?: number;
}

export function ImageUploadModal({
    isOpen,
    onClose,
    file,
    onConfirm,
    defaultWidth = 800,
    defaultQuality = 75,
}: ImageUploadModalProps) {
    const [width, setWidth] = useState(defaultWidth);
    const [quality, setQuality] = useState(defaultQuality);
    const [addToGallery, setAddToGallery] = useState(true);
    const [isOptimizing, setIsOptimizing] = useState(false);
    
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [originalDimensions, setOriginalDimensions] = useState<{ w: number; h: number } | null>(null);
    const [optimizedResult, setOptimizedResult] = useState<OptimizedFileResult | null>(null);
    const [optimizedDimensions, setOptimizedDimensions] = useState<{ w: number; h: number } | null>(null);
    
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Initial setup when a file is loaded
    useEffect(() => {
        if (isOpen && file) {
            // Generate temporary URL for original image preview
            const url = URL.createObjectURL(file);
            setOriginalUrl(url);

            // Read original dimensions
            const img = new Image();
            img.src = url;
            img.onload = () => {
                setOriginalDimensions({ w: img.width, h: img.height });
                // If original image width is smaller than defaultWidth, default to it
                if (img.width < defaultWidth) {
                    setWidth(img.width);
                } else {
                    setWidth(defaultWidth);
                }
            };

            // Reset states
            setQuality(defaultQuality);
            setAddToGallery(true);
            setOptimizedResult(null);
            setOptimizedDimensions(null);

            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [isOpen, file, defaultWidth, defaultQuality]);

    // Handle optimization when width or quality changes (debounced)
    useEffect(() => {
        if (!isOpen || !file || !originalUrl) return;

        setIsOptimizing(true);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(async () => {
            try {
                const result = await optimizeFile(file, width, quality / 100);
                setOptimizedResult(result);

                // Read optimized image dimensions
                const optImg = new Image();
                optImg.src = result.base64;
                optImg.onload = () => {
                    setOptimizedDimensions({ w: optImg.width, h: optImg.height });
                    setIsOptimizing(false);
                };
            } catch (err) {
                toast.error('Gagal mengompresi pratinjau gambar.');
                setIsOptimizing(false);
            }
        }, 150);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [width, quality, originalUrl, file, isOpen]);

    if (!isOpen || !file) return null;

    const handleConfirm = () => {
        if (!optimizedResult) {
            toast.error('Harap tunggu hingga proses kompresi selesai.');
            return;
        }

        // Save to asset library if checked
        if (addToGallery) {
            try {
                const saved = localStorage.getItem('bka_assets');
                let assetsList = [];
                if (saved) {
                    assetsList = JSON.parse(saved);
                }
                
                const newAsset = {
                    id: String(Date.now()),
                    name: file.name,
                    url: optimizedResult.base64,
                    type: 'image',
                    extension: 'webp',
                    size: optimizedResult.size,
                    originalSize: file.size,
                    isVisible: true,
                    createdAt: new Date().toISOString().split('T')[0]
                };

                assetsList.unshift(newAsset);
                localStorage.setItem('bka_assets', JSON.stringify(assetsList));
            } catch (e) {
                console.error('Failed to add optimized image to assets library:', e);
            }
        }

        // Return optimized asset result
        onConfirm({
            base64: optimizedResult.base64,
            size: optimizedResult.size,
            originalSize: file.size,
            name: file.name,
            isVisible: addToGallery
        });
        
        onClose();
    };

    const originalSize = file.size;
    const optimizedSize = optimizedResult?.size || 0;
    const sizeSavings = originalSize > 0 && optimizedSize > 0 
        ? Math.round(((originalSize - optimizedSize) / originalSize) * 100)
        : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none">
            <div className="w-full max-w-4xl rounded-2xl bg-white border border-neutral-200 p-6 shadow-2xl flex flex-col max-h-[90vh] relative animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                    <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                        <Sliders className="size-5 text-emerald-600 animate-pulse" />
                        Konfigurasi & Optimasi Unggah Gambar
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Body (Split Screen: Preview Left/Top, Configurations Right/Bottom) */}
                <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[300px] pr-1">
                    
                    {/* Visual Comparison Area (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                            {/* Before Image */}
                            <div className="rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50/50 flex flex-col h-[280px]">
                                <div className="bg-neutral-100/80 px-3 py-1.5 border-b border-neutral-200 flex justify-between items-center text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                                    <span>Sebelum (Original)</span>
                                    <span>{originalDimensions ? `${originalDimensions.w} x ${originalDimensions.h}` : ''}</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-2 relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                                    {originalUrl ? (
                                        <img 
                                            src={originalUrl} 
                                            alt="Original preview" 
                                            className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                                        />
                                    ) : (
                                        <Loader2 className="size-8 animate-spin text-neutral-300" />
                                    )}
                                </div>
                                <div className="bg-neutral-50 px-3 py-1.5 border-t border-neutral-250/30 text-xs font-semibold text-neutral-600 flex justify-between">
                                    <span>Ukuran Berkas</span>
                                    <span className="font-bold text-neutral-700">{formatFileSize(originalSize)}</span>
                                </div>
                            </div>

                            {/* After Image */}
                            <div className="rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50/50 flex flex-col h-[280px] relative">
                                <div className="bg-neutral-100/80 px-3 py-1.5 border-b border-neutral-200 flex justify-between items-center text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                                    <span>Sesudah (Optimized WebP)</span>
                                    <span>{optimizedDimensions ? `${optimizedDimensions.w} x ${optimizedDimensions.h}` : ''}</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-2 relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                                    {isOptimizing && (
                                        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="size-8 animate-spin text-emerald-600" />
                                                <span className="text-[11px] font-bold text-emerald-700 tracking-wider uppercase">Mengompresi...</span>
                                            </div>
                                        </div>
                                    )}
                                    {optimizedResult ? (
                                        <img 
                                            src={optimizedResult.base64} 
                                            alt="Optimized preview" 
                                            className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-neutral-350">
                                            <ImageIcon className="size-10 opacity-30 mb-1" />
                                            <span className="text-[10px] font-bold uppercase">Memproses Gambar...</span>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-neutral-50 px-3 py-1.5 border-t border-neutral-250/30 text-xs font-semibold text-neutral-600 flex justify-between">
                                    <span>Ukuran Berkas</span>
                                    <div className="flex items-center gap-1.5 font-bold">
                                        <span className="text-emerald-700">{optimizedResult ? formatFileSize(optimizedSize) : '...'}</span>
                                        {sizeSavings > 0 && (
                                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-full font-extrabold">
                                                -{sizeSavings}% Hemat
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* File Details Bar */}
                        <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 flex flex-col md:flex-row justify-between md:items-center gap-2 text-xs font-medium text-neutral-600">
                            <span className="truncate max-w-md font-semibold text-neutral-700">
                                Nama Berkas: <span className="font-mono text-neutral-500 font-normal">{file.name}</span>
                            </span>
                            <span className="shrink-0">
                                Format Akhir: <span className="font-bold text-emerald-700 font-mono">WEBP</span>
                            </span>
                        </div>
                    </div>

                    {/* Configuration Controls (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-neutral-100 pt-6 lg:pt-0 lg:pl-6 space-y-6">
                        <div className="space-y-5">
                            <h4 className="text-xs font-extrabold uppercase text-neutral-450 tracking-wider pb-2 border-b border-neutral-50">
                                Parameter Optimasi
                            </h4>

                            {/* Slider: Max Width */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs font-semibold text-neutral-700">
                                    <span>Lebar Maksimal</span>
                                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-md font-mono font-bold">
                                        {width}px
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={300}
                                    max={Math.max(1920, originalDimensions?.w || 1200)}
                                    step={50}
                                    value={width}
                                    onChange={(e) => setWidth(Number(e.target.value))}
                                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 outline-none"
                                />
                                <div className="flex justify-between text-[10px] text-neutral-400 font-semibold font-mono">
                                    <span>300px</span>
                                    <span>{originalDimensions ? `${originalDimensions.w}px (Asli)` : 'Max'}</span>
                                </div>
                            </div>

                            {/* Slider: Compression Quality */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs font-semibold text-neutral-700">
                                    <span>Kualitas Kompresi</span>
                                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-md font-mono font-bold">
                                        {quality}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={10}
                                    max={100}
                                    step={5}
                                    value={quality}
                                    onChange={(e) => setQuality(Number(e.target.value))}
                                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 outline-none"
                                />
                                <div className="flex justify-between text-[10px] text-neutral-400 font-semibold font-mono">
                                    <span>10% (Ringan)</span>
                                    <span>100% (Lossless)</span>
                                </div>
                            </div>

                            {/* Checkbox: Add to gallery */}
                            <label className="flex items-start gap-2.5 cursor-pointer bg-neutral-50/50 border border-neutral-100 p-3 rounded-xl hover:bg-neutral-50 transition-colors select-none">
                                <input 
                                    type="checkbox"
                                    checked={addToGallery}
                                    onChange={(e) => setAddToGallery(e.target.checked)}
                                    className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 size-4 mt-0.5 cursor-pointer"
                                />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-neutral-700">Simpan ke Pustaka Aset</span>
                                    <span className="text-[10px] text-neutral-400 font-light mt-0.5 leading-relaxed">
                                        Aset akan disimpan ke galeri utama agar dapat digunakan kembali di halaman/konten lain.
                                    </span>
                                </div>
                            </label>
                        </div>

                        {/* Footer Buttons inside container */}
                        <div className="flex items-center gap-3 border-t border-neutral-100 pt-4 mt-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors outline-none"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isOptimizing || !optimizedResult}
                                onClick={handleConfirm}
                                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed outline-none"
                            >
                                <Check className="size-4 stroke-[2.5]" />
                                Simpan
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
export default ImageUploadModal;
