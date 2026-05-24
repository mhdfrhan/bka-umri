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

export function AssetPickerModal({ isOpen, onClose, onSelect }: AssetPickerModalProps) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAssetUrl, setSelectedAssetUrl] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('bka_assets');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // only show visible image assets
                    const images = parsed.filter((a: any) => a.type === 'image' && a.isVisible);
                    setAssets(images);
                } catch {
                    setAssets([]);
                }
            } else {
                setAssets([]);
            }
        }
    }, [isOpen]);

    const filtered = assets.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleConfirm = () => {
        if (selectedAssetUrl) {
            onSelect(selectedAssetUrl);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-3xl rounded-2xl bg-white border border-neutral-200 p-6 shadow-2xl flex flex-col max-h-[85vh] relative animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                    <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                        <ImageIcon className="size-5 text-emerald-600" />
                        Pilih Aset Gambar
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
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
                        className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold text-neutral-800 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto min-h-[300px] border border-neutral-100 rounded-xl p-4 bg-neutral-50/50 mb-6">
                    {filtered.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {filtered.map((asset) => {
                                const isSelected = selectedAssetUrl === asset.url;
                                return (
                                    <div
                                        key={asset.id}
                                        onClick={() => setSelectedAssetUrl(asset.url)}
                                        onDoubleClick={() => {
                                            onSelect(asset.url);
                                            onClose();
                                        }}
                                        className={`group cursor-pointer rounded-xl overflow-hidden border bg-white aspect-video relative flex flex-col justify-between transition-all select-none ${
                                            isSelected 
                                                ? 'border-emerald-600 ring-2 ring-emerald-600/20' 
                                                : 'border-neutral-200 hover:border-neutral-300 hover:shadow-xs'
                                        }`}
                                    >
                                        <img 
                                            src={asset.url} 
                                            alt={asset.name} 
                                            className="w-full h-full object-cover flex-1"
                                        />
                                        <div className="p-2 bg-white/90 border-t border-neutral-100 backdrop-blur-xs">
                                            <p className="text-xs font-bold text-neutral-700 truncate">{asset.name}</p>
                                        </div>

                                        {isSelected && (
                                            <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 size-5 flex items-center justify-center">
                                                <Check className="size-3 stroke-[3]" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                            <ImageIcon className="size-12 opacity-35 mb-2 animate-pulse" />
                            <p className="text-sm font-semibold">Belum ada aset gambar.</p>
                            <p className="text-xs text-neutral-400 mt-0.5">Unggah gambar di menu Aset Media terlebih dahulu.</p>
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
