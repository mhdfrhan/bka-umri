import { useState, useEffect, useRef } from 'react';
import {
    X,
    Sliders,
    Image as ImageIcon,
    Check,
    Loader2,
    Maximize2,
} from 'lucide-react';
import { optimizeFile, OptimizedFileResult } from '@/lib/image-optimizer';
import { formatFileSize } from '@/lib/format-file-size';
import { toast } from 'sonner';

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: File | null;
    onConfirm: (result: {
        base64: string;
        size: number;
        originalSize: number;
        name: string;
        isVisible: boolean;
    }) => void;
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
    const [originalDimensions, setOriginalDimensions] = useState<{
        w: number;
        h: number;
    } | null>(null);
    const [optimizedResult, setOptimizedResult] =
        useState<OptimizedFileResult | null>(null);
    const [optimizedDimensions, setOptimizedDimensions] = useState<{
        w: number;
        h: number;
    } | null>(null);

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
                    setOptimizedDimensions({
                        w: optImg.width,
                        h: optImg.height,
                    });
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
                    createdAt: new Date().toISOString().split('T')[0],
                };

                assetsList.unshift(newAsset);
                localStorage.setItem('bka_assets', JSON.stringify(assetsList));
            } catch (e) {
                console.error(
                    'Failed to add optimized image to assets library:',
                    e,
                );
            }
        }

        // Return optimized asset result
        onConfirm({
            base64: optimizedResult.base64,
            size: optimizedResult.size,
            originalSize: file.size,
            name: file.name,
            isVisible: addToGallery,
        });

        onClose();
    };

    const originalSize = file.size;
    const optimizedSize = optimizedResult?.size || 0;
    const sizeSavings =
        originalSize > 0 && optimizedSize > 0
            ? Math.round(((originalSize - optimizedSize) / originalSize) * 100)
            : 0;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/70 p-4 backdrop-blur-xs duration-200 select-none fade-in"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative flex max-h-[90vh] w-full max-w-4xl animate-in flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl duration-200 zoom-in-95"
            >
                {/* Header */}
                <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-4">
                    <h3 className="flex items-center gap-2 text-base font-bold text-neutral-800">
                        <Sliders className="size-5 animate-pulse text-emerald-600" />
                        Konfigurasi & Optimasi Unggah Gambar
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Body (Split Screen: Preview Left/Top, Configurations Right/Bottom) */}
                <div className="grid min-h-[300px] flex-1 grid-cols-1 gap-6 overflow-y-auto pr-1 lg:grid-cols-12">
                    {/* Visual Comparison Area (8 cols) */}
                    <div className="flex flex-col gap-4 lg:col-span-8">
                        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Before Image */}
                            <div className="flex h-[280px] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50/50">
                                <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100/80 px-3 py-1.5 text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                    <span>Sebelum (Original)</span>
                                    <span>
                                        {originalDimensions
                                            ? `${originalDimensions.w} x ${originalDimensions.h}`
                                            : ''}
                                    </span>
                                </div>
                                <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] p-2">
                                    {originalUrl ? (
                                        <img
                                            src={originalUrl}
                                            alt="Original preview"
                                            className="max-h-full max-w-full rounded-lg object-contain shadow-sm"
                                        />
                                    ) : (
                                        <Loader2 className="size-8 animate-spin text-neutral-300" />
                                    )}
                                </div>
                                <div className="border-neutral-250/30 flex justify-between border-t bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-600">
                                    <span>Ukuran Berkas</span>
                                    <span className="font-bold text-neutral-700">
                                        {formatFileSize(originalSize)}
                                    </span>
                                </div>
                            </div>

                            {/* After Image */}
                            <div className="relative flex h-[280px] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50/50">
                                <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100/80 px-3 py-1.5 text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                    <span>Sesudah (Optimized WebP)</span>
                                    <span>
                                        {optimizedDimensions
                                            ? `${optimizedDimensions.w} x ${optimizedDimensions.h}`
                                            : ''}
                                    </span>
                                </div>
                                <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] p-2">
                                    {isOptimizing && (
                                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-xs">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="size-8 animate-spin text-emerald-600" />
                                                <span className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
                                                    Mengompresi...
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {optimizedResult ? (
                                        <img
                                            src={optimizedResult.base64}
                                            alt="Optimized preview"
                                            className="max-h-full max-w-full rounded-lg object-contain shadow-sm"
                                        />
                                    ) : (
                                        <div className="text-neutral-350 flex flex-col items-center">
                                            <ImageIcon className="mb-1 size-10 opacity-30" />
                                            <span className="text-[10px] font-bold uppercase">
                                                Memproses Gambar...
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="border-neutral-250/30 flex justify-between border-t bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-600">
                                    <span>Ukuran Berkas</span>
                                    <div className="flex items-center gap-1.5 font-bold">
                                        <span className="text-emerald-700">
                                            {optimizedResult
                                                ? formatFileSize(optimizedSize)
                                                : '...'}
                                        </span>
                                        {sizeSavings > 0 && (
                                            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                                                -{sizeSavings}% Hemat
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* File Details Bar */}
                        <div className="flex flex-col justify-between gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs font-medium text-neutral-600 md:flex-row md:items-center">
                            <span className="max-w-md truncate font-semibold text-neutral-700">
                                Nama Berkas:{' '}
                                <span className="font-mono font-normal text-neutral-500">
                                    {file.name}
                                </span>
                            </span>
                            <span className="shrink-0">
                                Format Akhir:{' '}
                                <span className="font-mono font-bold text-emerald-700">
                                    WEBP
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* Configuration Controls (4 cols) */}
                    <div className="flex flex-col justify-between space-y-6 border-t border-neutral-100 pt-6 lg:col-span-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
                        <div className="space-y-5">
                            <h4 className="text-neutral-450 border-b border-neutral-50 pb-2 text-xs font-extrabold tracking-wider uppercase">
                                Parameter Optimasi
                            </h4>

                            {/* Slider: Max Width */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
                                    <span>Lebar Maksimal</span>
                                    <span className="rounded-md border border-emerald-100/50 bg-emerald-50 px-2 py-0.5 font-mono font-bold text-emerald-700">
                                        {width}px
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={300}
                                    max={Math.max(
                                        1920,
                                        originalDimensions?.w || 1200,
                                    )}
                                    step={50}
                                    value={width}
                                    onChange={(e) =>
                                        setWidth(Number(e.target.value))
                                    }
                                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-emerald-600 outline-none"
                                />
                                <div className="flex justify-between font-mono text-[10px] font-semibold text-neutral-400">
                                    <span>300px</span>
                                    <span>
                                        {originalDimensions
                                            ? `${originalDimensions.w}px (Asli)`
                                            : 'Max'}
                                    </span>
                                </div>
                            </div>

                            {/* Slider: Compression Quality */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
                                    <span>Kualitas Kompresi</span>
                                    <span className="rounded-md border border-emerald-100/50 bg-emerald-50 px-2 py-0.5 font-mono font-bold text-emerald-700">
                                        {quality}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={10}
                                    max={100}
                                    step={5}
                                    value={quality}
                                    onChange={(e) =>
                                        setQuality(Number(e.target.value))
                                    }
                                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-emerald-600 outline-none"
                                />
                                <div className="flex justify-between font-mono text-[10px] font-semibold text-neutral-400">
                                    <span>10% (Ringan)</span>
                                    <span>100% (Lossless)</span>
                                </div>
                            </div>

                            {/* Checkbox: Add to gallery */}
                            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 transition-colors select-none hover:bg-neutral-50">
                                <input
                                    type="checkbox"
                                    checked={addToGallery}
                                    onChange={(e) =>
                                        setAddToGallery(e.target.checked)
                                    }
                                    className="mt-0.5 size-4 cursor-pointer rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-neutral-700">
                                        Simpan ke Pustaka Aset
                                    </span>
                                    <span className="mt-0.5 text-[10px] leading-relaxed font-light text-neutral-400">
                                        Aset akan disimpan ke galeri utama agar
                                        dapat digunakan kembali di
                                        halaman/konten lain.
                                    </span>
                                </div>
                            </label>
                        </div>

                        {/* Footer Buttons inside container */}
                        <div className="mt-auto flex items-center gap-3 border-t border-neutral-100 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-xs font-bold text-neutral-600 transition-colors outline-none hover:bg-neutral-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isOptimizing || !optimizedResult}
                                onClick={handleConfirm}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm transition-colors outline-none hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
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
