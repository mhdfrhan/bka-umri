import {
    X,
    Sliders,
    Image as ImageIcon,
    Check,
    Loader2,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { formatFileSize } from '@/lib/format-file-size';
import type { OptimizedFileResult } from '@/lib/image-optimizer';
import { optimizeFile } from '@/lib/image-optimizer';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: File | null;
    onConfirm: (
        result: { base64: string; size: number; originalSize: number; name: string; isVisible: boolean },
        addToGallery: boolean
    ) => void;
    defaultWidth?: number;
    defaultQuality?: number;
    aspectRatio?: number;
    hideGalleryOption?: boolean;
}

// Slices an image using Canvas based on percentage crop parameters
const cropImage = (
    imageUrl: string,
    cropPercent: { x: number; y: number; w: number; h: number }
): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const sX = Math.max(0, (cropPercent.x / 100) * img.naturalWidth);
            const sY = Math.max(0, (cropPercent.y / 100) * img.naturalHeight);
            const sW = Math.min(img.naturalWidth - sX, (cropPercent.w / 100) * img.naturalWidth);
            const sH = Math.min(img.naturalHeight - sY, (cropPercent.h / 100) * img.naturalHeight);

            canvas.width = sW;
            canvas.height = sH;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas 2D context not available'));
                return;
            }
            ctx.drawImage(img, sX, sY, sW, sH, 0, 0, sW, sH);

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Canvas toBlob failed'));
                }
            }, 'image/jpeg', 0.95);
        };
        img.onerror = (err) => reject(err);
    });
};

export function ImageUploadModal({
    isOpen,
    onClose,
    file,
    onConfirm,
    defaultWidth = 800,
    defaultQuality = 75,
    aspectRatio,
    hideGalleryOption = false,
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

    // Cropping States
    const [localAspectRatio, setLocalAspectRatio] = useState<number | undefined>(aspectRatio);
    const [crop, setCrop] = useState<{ x: number; y: number; w: number; h: number }>({
        x: 5,
        y: 5,
        w: 90,
        h: 90,
    });
    const [dragInfo, setDragInfo] = useState<{
        type: 'move' | 'nw' | 'ne' | 'sw' | 'se';
        startX: number;
        startY: number;
        initialCrop: { x: number; y: number; w: number; h: number };
    } | null>(null);

    const overlayRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Keep local aspect ratio in sync when prop changes
    useEffect(() => {
        setLocalAspectRatio(aspectRatio);
    }, [aspectRatio]);

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

                // Initialize crop box ratio
                const imgRatio = img.width / img.height;
                let initialCrop;
                const activeRatio = localAspectRatio || aspectRatio;
                if (activeRatio) {
                    if (imgRatio > activeRatio) {
                        const h = 100;
                        const w = activeRatio * h * (img.height / img.width);
                        const x = (100 - w) / 2;
                        const y = 0;
                        initialCrop = { x, y, w, h };
                    } else {
                        const w = 100;
                        const h = (w * (img.width / img.height)) / activeRatio;
                        const x = 0;
                        const y = (100 - h) / 2;
                        initialCrop = { x, y, w, h };
                    }
                } else {
                    initialCrop = { x: 0, y: 0, w: 100, h: 100 };
                }
                setCrop(initialCrop);

                // Default to the original image width to avoid unwanted resolution loss
                setWidth(img.width);
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
    }, [isOpen, file, defaultWidth, defaultQuality, aspectRatio, localAspectRatio]);

    // Drag and Resize event listeners for the crop box
    useEffect(() => {
        if (!dragInfo) return;

        const handlePointerMove = (clientX: number, clientY: number) => {
            if (!overlayRef.current) return;
            const rect = overlayRef.current.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const dx = clientX - dragInfo.startX;
            const dy = clientY - dragInfo.startY;

            const dxPercent = (dx / rect.width) * 100;
            const dyPercent = (dy / rect.height) * 100;

            const newCrop = { ...dragInfo.initialCrop };
            const activeRatio = localAspectRatio;

            if (dragInfo.type === 'move') {
                newCrop.x = Math.max(
                    0,
                    Math.min(100 - newCrop.w, newCrop.x + dxPercent),
                );
                newCrop.y = Math.max(
                    0,
                    Math.min(100 - newCrop.h, newCrop.y + dyPercent),
                );
            } else {
                if (!activeRatio) {
                    // Free aspect ratio cropping
                    if (dragInfo.type === 'nw') {
                        const right = newCrop.x + newCrop.w;
                        const bottom = newCrop.y + newCrop.h;
                        newCrop.x = Math.max(
                            0,
                            Math.min(right - 5, newCrop.x + dxPercent),
                        );
                        newCrop.w = right - newCrop.x;
                        newCrop.y = Math.max(
                            0,
                            Math.min(bottom - 5, newCrop.y + dyPercent),
                        );
                        newCrop.h = bottom - newCrop.y;
                    } else if (dragInfo.type === 'ne') {
                        const left = newCrop.x;
                        const bottom = newCrop.y + newCrop.h;
                        newCrop.w = Math.max(
                            5,
                            Math.min(100 - left, newCrop.w + dxPercent),
                        );
                        newCrop.y = Math.max(
                            0,
                            Math.min(bottom - 5, newCrop.y + dyPercent),
                        );
                        newCrop.h = bottom - newCrop.y;
                    } else if (dragInfo.type === 'sw') {
                        const right = newCrop.x + newCrop.w;
                        const top = newCrop.y;
                        newCrop.x = Math.max(
                            0,
                            Math.min(right - 5, newCrop.x + dxPercent),
                        );
                        newCrop.w = right - newCrop.x;
                        newCrop.h = Math.max(
                            5,
                            Math.min(100 - top, newCrop.h + dyPercent),
                        );
                    } else if (dragInfo.type === 'se') {
                        const left = newCrop.x;
                        const top = newCrop.y;
                        newCrop.w = Math.max(
                            5,
                            Math.min(100 - left, newCrop.w + dxPercent),
                        );
                        newCrop.h = Math.max(
                            5,
                            Math.min(100 - top, newCrop.h + dyPercent),
                        );
                    }
                } else {
                    // Fixed aspect ratio cropping
                    const targetRatioPercent =
                        activeRatio * (rect.height / rect.width);

                    if (dragInfo.type === 'se') {
                        const dw = dxPercent;
                        newCrop.w = Math.max(
                            5,
                            Math.min(100 - newCrop.x, newCrop.w + dw),
                        );
                        newCrop.h = newCrop.w / targetRatioPercent;

                        if (newCrop.y + newCrop.h > 100) {
                            newCrop.h = 100 - newCrop.y;
                            newCrop.w = newCrop.h * targetRatioPercent;
                        }
                    } else if (dragInfo.type === 'sw') {
                        const dw = -dxPercent;
                        const newX = Math.max(
                            0,
                            Math.min(
                                newCrop.x + newCrop.w - 5,
                                newCrop.x - dw,
                            ),
                        );
                        const actualDw = newCrop.x - newX;

                        newCrop.x = newX;
                        newCrop.w = newCrop.w + actualDw;
                        newCrop.h = newCrop.w / targetRatioPercent;

                        if (newCrop.y + newCrop.h > 100) {
                            newCrop.h = 100 - newCrop.y;
                            newCrop.w = newCrop.h * targetRatioPercent;
                            newCrop.x =
                                dragInfo.initialCrop.x +
                                dragInfo.initialCrop.w -
                                newCrop.w;
                        }
                    } else if (dragInfo.type === 'ne') {
                        const dw = dxPercent;
                        newCrop.w = Math.max(
                            5,
                            Math.min(100 - newCrop.x, newCrop.w + dw),
                        );
                        const newH = newCrop.w / targetRatioPercent;
                        const newY = Math.max(
                            0,
                            newCrop.y + newCrop.h - newH,
                        );
                        const actualDh = newCrop.y + newCrop.h - newY;

                        newCrop.y = newY;
                        newCrop.h = actualDh;
                        newCrop.w = newCrop.h * targetRatioPercent;
                    } else if (dragInfo.type === 'nw') {
                        const dw = -dxPercent;
                        const newX = Math.max(
                            0,
                            Math.min(
                                newCrop.x + newCrop.w - 5,
                                newCrop.x - dw,
                            ),
                        );
                        const actualDw = newCrop.x - newX;

                        newCrop.x = newX;
                        newCrop.w = newCrop.w + actualDw;
                        const newH = newCrop.w / targetRatioPercent;
                        const newY = Math.max(
                            0,
                            newCrop.y + dragInfo.initialCrop.h - newH,
                        );
                        const actualDh =
                            dragInfo.initialCrop.y +
                            dragInfo.initialCrop.h -
                            newY;

                        newCrop.y = newY;
                        newCrop.h = actualDh;
                        newCrop.w = newCrop.h * targetRatioPercent;
                    }
                }
            }

            setCrop(newCrop);
        };

        const handleMouseMove = (e: MouseEvent) => {
            handlePointerMove(e.clientX, e.clientY);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                handlePointerMove(
                    e.touches[0].clientX,
                    e.touches[0].clientY,
                );
            }
        };

        const handlePointerUp = () => {
            setDragInfo(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('mouseup', handlePointerUp);
        window.addEventListener('touchend', handlePointerUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('mouseup', handlePointerUp);
            window.removeEventListener('touchend', handlePointerUp);
        };
    }, [dragInfo, localAspectRatio]);

    // Handle optimization when width, quality, or crop changes (debounced)
    useEffect(() => {
        if (!isOpen || !file || !originalUrl) {
            return;
        }

        setIsOptimizing(true);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(async () => {
            try {
                // First crop the image using canvas
                const croppedBlob = await cropImage(originalUrl, crop);
                const croppedFile = new File([croppedBlob], file.name, {
                    type: 'image/jpeg',
                });

                // Optimize the cropped image file
                const result = await optimizeFile(croppedFile, width, quality / 100);
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
                console.error(err);
                toast.error('Gagal mengompresi dan memotong gambar.');
                setIsOptimizing(false);
            }
        }, 250);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [width, quality, originalUrl, file, isOpen, crop]);


    const handlePresetChange = (presetValue: number | undefined) => {
        setLocalAspectRatio(presetValue);

        // Re-initialize the crop box for the new aspect ratio
        if (originalDimensions) {
            const imgRatio = originalDimensions.w / originalDimensions.h;
            let initialCrop;
            if (presetValue) {
                if (imgRatio > presetValue) {
                    const h = 100;
                    const w = presetValue * h * (originalDimensions.h / originalDimensions.w);
                    const x = (100 - w) / 2;
                    const y = 0;
                    initialCrop = { x, y, w, h };
                } else {
                    const w = 100;
                    const h = (w * (originalDimensions.w / originalDimensions.h)) / presetValue;
                    const x = 0;
                    const y = (100 - h) / 2;
                    initialCrop = { x, y, w, h };
                }
            } else {
                initialCrop = { x: 0, y: 0, w: 100, h: 100 };
            }
            setCrop(initialCrop);
        }
    };

    const handleMouseDown = (
        e: React.MouseEvent,
        type: 'move' | 'nw' | 'ne' | 'sw' | 'se',
    ) => {
        e.preventDefault();
        setDragInfo({
            type,
            startX: e.clientX,
            startY: e.clientY,
            initialCrop: { ...crop },
        });
    };

    const handleTouchStart = (
        e: React.TouchEvent,
        type: 'move' | 'nw' | 'ne' | 'sw' | 'se',
    ) => {
        if (e.touches.length > 0) {
            setDragInfo({
                type,
                startX: e.touches[0].clientX,
                startY: e.touches[0].clientY,
                initialCrop: { ...crop },
            });
        }
    };

    if (!isOpen || !file) {
        return null;
    }

    const handleConfirm = async () => {
        if (!optimizedResult) {
            toast.error('Harap tunggu hingga proses kompresi selesai.');
            return;
        }

        // Save to asset library if checked
        if (addToGallery) {
            setIsOptimizing(true);
            try {
                const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
                const response = await fetch('/admin/editor-upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({
                        image: optimizedResult.base64,
                        name: file.name,
                    }),
                });
                
                if (!response.ok) throw new Error('Upload failed');
                const data = await response.json();
                
                // Return optimized asset result with the new URL
                onConfirm({
                    base64: data.url,
                    size: optimizedResult.size,
                    originalSize: file.size,
                    name: file.name,
                    isVisible: true,
                }, true);
                
                onClose();
                return;
            } catch (e: unknown) {
                console.error(
                    'Failed to add optimized image to assets library:',
                    e,
                );
                toast.error('Gagal menyimpan gambar ke Pustaka Aset.');
            } finally {
                setIsOptimizing(false);
            }
        }

        // Return optimized asset result with base64 data
        onConfirm({
            base64: optimizedResult.base64,
            size: optimizedResult.size,
            originalSize: file.size,
            name: file.name,
            isVisible: addToGallery,
        }, addToGallery);

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
                        Konfigurasi, Potong & Optimasi Gambar
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
                            {/* Before Image with Crop Overlay */}
                            <div className="flex h-[280px] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50/50">
                                <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100/80 px-3 py-1.5 text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                    <span>Geser & Potong Gambar</span>
                                    <span>
                                        {originalDimensions
                                            ? `${originalDimensions.w} x ${originalDimensions.h}`
                                            : ''}
                                    </span>
                                </div>
                                <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] p-2">
                                    {originalUrl ? (
                                        <div className="relative max-h-full max-w-full">
                                            <img
                                                src={originalUrl}
                                                alt="Original preview"
                                                className="max-h-[230px] max-w-full w-auto h-auto rounded-lg shadow-sm select-none pointer-events-none"
                                            />
                                            {/* Crop Overlay */}
                                            <div
                                                ref={overlayRef}
                                                className="absolute inset-0 overflow-hidden rounded-lg pointer-events-auto"
                                            >
                                                {/* Shaded overlay borders surrounding crop area */}
                                                <div
                                                    style={{
                                                        left: `${crop.x}%`,
                                                        top: `${crop.y}%`,
                                                        width: `${crop.w}%`,
                                                        height: `${crop.h}%`,
                                                    }}
                                                    className="absolute border-2 border-emerald-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] cursor-move"
                                                    onMouseDown={(e) => handleMouseDown(e, 'move')}
                                                    onTouchStart={(e) => handleTouchStart(e, 'move')}
                                                >
                                                    {/* Thirds Grid lines */}
                                                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30">
                                                        <div className="border-r border-b border-white border-dashed" />
                                                        <div className="border-r border-b border-white border-dashed" />
                                                        <div className="border-b border-white border-dashed" />
                                                        <div className="border-r border-b border-white border-dashed" />
                                                        <div className="border-r border-b border-white border-dashed" />
                                                        <div className="border-b border-white border-dashed" />
                                                        <div className="border-r border-white border-dashed" />
                                                        <div className="border-r border-white border-dashed" />
                                                        <div />
                                                    </div>

                                                    {/* Corner Handles */}
                                                    <div
                                                        className="absolute -top-1.5 -left-1.5 size-3 cursor-nwse-resize rounded-full border-2 border-emerald-600 bg-white shadow-md active:scale-125 transition-transform"
                                                        onMouseDown={(e) => {
                                                            e.stopPropagation();
                                                            handleMouseDown(e, 'nw');
                                                        }}
                                                        onTouchStart={(e) => {
                                                            e.stopPropagation();
                                                            handleTouchStart(e, 'nw');
                                                        }}
                                                    />
                                                    <div
                                                        className="absolute -top-1.5 -right-1.5 size-3 cursor-nesw-resize rounded-full border-2 border-emerald-600 bg-white shadow-md active:scale-125 transition-transform"
                                                        onMouseDown={(e) => {
                                                            e.stopPropagation();
                                                            handleMouseDown(e, 'ne');
                                                        }}
                                                        onTouchStart={(e) => {
                                                            e.stopPropagation();
                                                            handleTouchStart(e, 'ne');
                                                        }}
                                                    />
                                                    <div
                                                        className="absolute -bottom-1.5 -left-1.5 size-3 cursor-nesw-resize rounded-full border-2 border-emerald-600 bg-white shadow-md active:scale-125 transition-transform"
                                                        onMouseDown={(e) => {
                                                            e.stopPropagation();
                                                            handleMouseDown(e, 'sw');
                                                        }}
                                                        onTouchStart={(e) => {
                                                            e.stopPropagation();
                                                            handleTouchStart(e, 'sw');
                                                        }}
                                                    />
                                                    <div
                                                        className="absolute -bottom-1.5 -right-1.5 size-3 cursor-nwse-resize rounded-full border-2 border-emerald-600 bg-white shadow-md active:scale-125 transition-transform"
                                                        onMouseDown={(e) => {
                                                            e.stopPropagation();
                                                            handleMouseDown(e, 'se');
                                                        }}
                                                        onTouchStart={(e) => {
                                                            e.stopPropagation();
                                                            handleTouchStart(e, 'se');
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <Loader2 className="size-8 animate-spin text-neutral-300" />
                                    )}
                                </div>
                                <div className="border-neutral-250/30 flex justify-between border-t bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-600">
                                    <span>Ukuran Asli</span>
                                    <span className="font-bold text-neutral-700">
                                        {formatFileSize(originalSize)}
                                    </span>
                                </div>
                            </div>

                            {/* After Image (Optimized & Cropped) */}
                            <div className="relative flex h-[280px] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50/50">
                                <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100/80 px-3 py-1.5 text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                    <span>Hasil Potongan & Optimasi (WebP)</span>
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
                                                    Memproses...
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

                            {/* Aspect Ratio Presets (only shown if not strictly forced by parent component) */}
                            {!aspectRatio && (
                                <div className="space-y-2">
                                    <span className="text-xs font-semibold text-neutral-700 block">
                                        Rasio Aspek Potongan (Crop)
                                    </span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: 'Bebas / Free', val: undefined },
                                            { label: '1:1 (Kotak)', val: 1 },
                                            { label: '16:9 (Landscape)', val: 16 / 9 },
                                            { label: '4:3 (Dokumentasi)', val: 4 / 3 },
                                        ].map((preset, idx) => {
                                            const isActive = localAspectRatio === preset.val;
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => handlePresetChange(preset.val)}
                                                    className={cn(
                                                        "rounded-xl border p-2 text-center text-xs font-bold transition-all",
                                                        isActive
                                                            ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                                            : "border-neutral-200 hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900"
                                                    )}
                                                >
                                                    {preset.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {aspectRatio && (
                                <div className="rounded-xl bg-neutral-50 border border-neutral-200/60 p-3 text-xs">
                                    <span className="font-semibold text-neutral-500 block uppercase tracking-wider text-[10px]">
                                        Rasio Aspek Terkunci
                                    </span>
                                    <span className="font-bold text-neutral-700 block mt-1">
                                        {aspectRatio === 1
                                            ? '1:1 (Persegi)'
                                            : aspectRatio === 16 / 9
                                            ? '16:9 (Landscape)'
                                            : aspectRatio === 4 / 3
                                            ? '4:3 (Dokumentasi)'
                                            : `Custom (${aspectRatio.toFixed(2)}:1)`}
                                    </span>
                                    <span className="text-neutral-450 block mt-0.5 leading-relaxed font-light">
                                        Halaman ini mewajibkan pemotongan gambar dikunci pada rasio tertentu demi konsistensi tampilan.
                                    </span>
                                </div>
                            )}

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
                                    min={Math.min(300, originalDimensions?.w || 300)}
                                    max={originalDimensions?.w || 1200}
                                    step={50}
                                    value={width}
                                    onChange={(e) =>
                                        setWidth(Number(e.target.value))
                                    }
                                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-emerald-600 outline-none"
                                />
                                <div className="flex justify-between font-mono text-[10px] font-semibold text-neutral-400">
                                    <span>{Math.min(300, originalDimensions?.w || 300)}px</span>
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
                            {!hideGalleryOption && (
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
                            )}
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
