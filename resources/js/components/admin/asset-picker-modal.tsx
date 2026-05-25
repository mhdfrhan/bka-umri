import { useState, useEffect } from 'react';
import { X, Search, Image as ImageIcon, Check } from 'lucide-react';

interface Asset {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'file';
    extension: string;
    size: number;
    isVisible: boolean;
    createdAt: string;
}

interface AssetPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
}

export function AssetPickerModal({
    isOpen,
    onClose,
    onSelect,
}: AssetPickerModalProps) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAssetUrl, setSelectedAssetUrl] = useState<string | null>(
        null,
    );

    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('bka_assets');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // only show visible image assets
                    const images = parsed.filter(
                        (a: any) => a.type === 'image' && a.isVisible,
                    );
                    setAssets(images);
                } catch {
                    setAssets([]);
                }
            } else {
                setAssets([]);
            }
        }
    }, [isOpen]);

    const filtered = assets.filter((a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleConfirm = () => {
        if (selectedAssetUrl) {
            onSelect(selectedAssetUrl);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-200 fade-in"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative flex max-h-[85vh] w-full max-w-3xl animate-in flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl duration-200 zoom-in-95"
            >
                {/* Header */}
                <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-4">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-800">
                        <ImageIcon className="size-5 text-emerald-600" />
                        Pilih Aset Gambar
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Cari nama gambar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pr-4 pl-10 text-sm font-semibold text-neutral-800 transition-colors focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                    <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-400" />
                </div>

                {/* Grid */}
                <div className="mb-6 min-h-[300px] flex-1 overflow-y-auto rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                    {filtered.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                            {filtered.map((asset) => {
                                const isSelected =
                                    selectedAssetUrl === asset.url;
                                return (
                                    <div
                                        key={asset.id}
                                        onClick={() =>
                                            setSelectedAssetUrl(asset.url)
                                        }
                                        onDoubleClick={() => {
                                            onSelect(asset.url);
                                            onClose();
                                        }}
                                        className={`group relative flex aspect-video cursor-pointer flex-col justify-between overflow-hidden rounded-xl border bg-white transition-all select-none ${
                                            isSelected
                                                ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                                                : 'border-neutral-200 hover:border-neutral-300 hover:shadow-xs'
                                        }`}
                                    >
                                        <img
                                            src={asset.url}
                                            alt={asset.name}
                                            className="h-full w-full flex-1 object-cover"
                                        />
                                        <div className="border-t border-neutral-100 bg-white/90 p-2 backdrop-blur-xs">
                                            <p className="truncate text-xs font-bold text-neutral-700">
                                                {asset.name}
                                            </p>
                                        </div>

                                        {isSelected && (
                                            <div className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-emerald-600 p-1 text-white">
                                                <Check className="size-3 stroke-[3]" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                            <ImageIcon className="mb-2 size-12 animate-pulse opacity-35" />
                            <p className="text-sm font-semibold">
                                Belum ada aset gambar.
                            </p>
                            <p className="mt-0.5 text-xs text-neutral-400">
                                Unggah gambar di menu Aset Media terlebih
                                dahulu.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 border-t border-neutral-100 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        disabled={!selectedAssetUrl}
                        onClick={handleConfirm}
                        className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                        Pilih Gambar
                    </button>
                </div>
            </div>
        </div>
    );
}
export default AssetPickerModal;
