import { Head, router } from '@inertiajs/react';
import {
    Home,
    Sliders,
    Award,
    Layout,
    Plus,
    Trash2,
    Edit2,
    ArrowUp,
    ArrowDown,
    Sparkles,
    Check,
    Eye,
    ArrowRight,
    Calendar,
    Upload,
    Image as ImageIcon,
    Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AdminModal } from '@/components/admin/admin-modal';
import { AssetPickerModal } from '@/components/admin/asset-picker-modal';
import { ImageUploadModal } from '@/components/admin/image-upload-modal';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

// Curated list of Lucide icons for statistics and services dropdowns
const CURATED_ICONS = [
    { name: 'FileText', label: 'Dokumen / Teks' },
    { name: 'Megaphone', label: 'Pengumuman / Megafon' },
    { name: 'Images', label: 'Galeri / Gambar' },
    { name: 'Building2', label: 'Gedung / Kampus' },
    { name: 'FolderDown', label: 'Unduhan / Folder' },
    { name: 'Users', label: 'Pengguna / Rapat' },
    { name: 'Settings2', label: 'Pengaturan / Gigi' },
    { name: 'Award', label: 'Penghargaan / Akreditasi' },
    { name: 'Coins', label: 'Keuangan / Koin' },
];

interface IconPickerProps {
    value: string;
    onChange: (val: string) => void;
}

function IconPicker({ value, onChange }: IconPickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const currentIcon = CURATED_ICONS.find((i) => i.name === value) || CURATED_ICONS[0];
    const LucideIcon = (LucideIcons as any)[currentIcon.name] || LucideIcons.HelpCircle;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center gap-2 rounded-lg border border-neutral-200 bg-white p-2.5 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 hover:bg-neutral-50"
            >
                <LucideIcon className="size-4.5 text-emerald-600 shrink-0" />
                <span className="truncate">{currentIcon.label}</span>
                <LucideIcons.ChevronDown className="ml-auto size-4 text-neutral-400 shrink-0" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute left-0 mt-1.5 z-40 w-[260px] rounded-xl border border-neutral-200 bg-white p-3 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="grid grid-cols-3 gap-2">
                            {CURATED_ICONS.map((i) => {
                                const ItemIcon = (LucideIcons as any)[i.name] || LucideIcons.HelpCircle;
                                const isSelected = i.name === value;
                                return (
                                    <button
                                        key={i.name}
                                        type="button"
                                        onClick={() => {
                                            onChange(i.name);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-1.5 rounded-lg p-2 transition-all",
                                            isSelected
                                                ? "bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold"
                                                : "border border-neutral-100 hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900"
                                        )}
                                        title={i.label}
                                    >
                                        <ItemIcon className={cn("size-5", isSelected ? "text-emerald-600" : "text-neutral-500")} />
                                        <span className="text-[10px] text-center leading-tight truncate w-full">
                                            {i.label.split(' / ')[0]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}


interface Banner {
    id: number;
    title: string;
    desc: string;
    btnText: string;
    btnUrl: string;
    imgUrl: string;
    active: boolean;
    urutan: number;
}

interface KepalaBiro {
    nama: string;
    jabatan: string;
    periode: string;
    sambutan: string;
    fotoUrl: string;
}

interface StatItem {
    id: number;
    angka: string;
    label: string;
    icon: string;
    urutan: number;
}

interface LayananItem {
    id: number;
    title: string;
    desc: string;
    icon: string;
    urutan: number;
}

interface LayananSection {
    judul: string;
    desc: string;
    youtubeUrl: string;
}

interface Props {
    banners: Banner[];
    kepalaBiro: KepalaBiro;
    stats: StatItem[];
    layananSection: LayananSection;
    layananItems: LayananItem[];
}

export default function EditBeranda({
    banners: initialBanners = [],
    kepalaBiro: initialKepalaBiro = {
        nama: '',
        jabatan: '',
        periode: '',
        sambutan: '',
        fotoUrl: '',
    },
    stats: initialStats = [],
    layananSection: initialLayananSection = {
        judul: '',
        desc: '',
        youtubeUrl: '',
    },
    layananItems: initialLayananItems = [],
}: Props) {
    // Current Active Tab State
    const [activeTab, setActiveTab] = useState<
        'banners' | 'kepalaBiro' | 'stats' | 'services'
    >('banners');

    // ────────────────────────────────────────────────────────
    // DATA STATES & STORAGE LOADING
    // ────────────────────────────────────────────────────────

    // Asset Picker Modal Target State
    const [assetPickerTarget, setAssetPickerTarget] = useState<
        'banner' | 'kepalaBiro' | null
    >(null);

    const handleSelectAsset = (url: string) => {
        if (assetPickerTarget === 'banner') {
            setBannerForm((prev) => ({ ...prev, imgUrl: url }));
        } else if (assetPickerTarget === 'kepalaBiro') {
            setKepalaBiro((prev) => ({ ...prev, fotoUrl: url }));
        }

        setAssetPickerTarget(null);
    };

    // Direct Upload Configuration for Banners
    const [isBannerUploadModalOpen, setIsBannerUploadModalOpen] =
        useState(false);
    const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(
        null,
    );

    const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File gambar melebihi batas 10MB!');

            return;
        }

        setSelectedBannerFile(file);
        setIsBannerUploadModalOpen(true);
        e.target.value = '';
    };

    const handleBannerUploadConfirm = (result: { base64: string }) => {
        setBannerForm((prev) => ({ ...prev, imgUrl: result.base64 }));
        toast.success('Gambar banner berhasil diunggah & dioptimasi!');
    };

    // Direct Upload Configuration for Kepala Biro
    const [isKbUploadModalOpen, setIsKbUploadModalOpen] = useState(false);
    const [selectedKbFile, setSelectedKbFile] = useState<File | null>(null);

    const handleKbFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File gambar melebihi batas 10MB!');

            return;
        }

        setSelectedKbFile(file);
        setIsKbUploadModalOpen(true);
        e.target.value = '';
    };

    const handleKbUploadConfirm = (result: { base64: string }) => {
        setKepalaBiro((prev) => ({ ...prev, fotoUrl: result.base64 }));
        toast.success('Foto Kepala Biro berhasil diunggah & dioptimasi!');
    };

    // ────────────────────────────────────────────────────────
    // 1. BANNER/SLIDER STATE & ACTIONS
    // ────────────────────────────────────────────────────────
    const [banners, setBanners] = useState(initialBanners);
    const [bannerToDelete, setBannerToDelete] = useState<number | null>(null);

    useEffect(() => {
        setBanners(initialBanners);
    }, [initialBanners]);

    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [isProcessingBanner, setIsProcessingBanner] = useState(false);
    const [isDeletingBanner, setIsDeletingBanner] = useState(false);
    const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
    const [bannerForm, setBannerForm] = useState({
        title: '',
        desc: '',
        btnText: 'Pelajari Selengkapnya',
        btnUrl: '',
        imgUrl: '',
        active: true,
    });

    const handleOpenAddBanner = () => {
        if (banners.length >= 5) {
            toast.warning('Batas maksimum 5 slide aktif tercapai!');

            return;
        }

        setEditingBannerId(null);
        setBannerForm({
            title: '',
            desc: '',
            btnText: 'Pelajari Selengkapnya',
            btnUrl: '',
            imgUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
            active: true,
        });
        setIsBannerModalOpen(true);
    };

    const handleOpenEditBanner = (id: number) => {
        const item = banners.find((b) => b.id === id);

        if (!item) {
            return;
        }

        setEditingBannerId(id);
        setBannerForm({ ...item });
        setIsBannerModalOpen(true);
    };

    const handleSaveBanner = (e: React.FormEvent) => {
        e.preventDefault();

        if (!bannerForm.imgUrl.trim()) {
            toast.error('Gambar banner wajib diisi!');

            return;
        }

        setIsProcessingBanner(true);
        if (editingBannerId !== null) {
            router.put(
                `/admin/beranda/banners/${editingBannerId}`,
                bannerForm,
                {
                    onSuccess: () => {
                        toast.success('Slide Banner berhasil diperbarui!');
                        setIsBannerModalOpen(false);
                    },
                    onError: (err: any) => {
                        toast.error(
                            (Object.values(err)[0] as string) ||
                                'Gagal memperbarui slide banner.',
                        );
                    },
                    onFinish: () => setIsProcessingBanner(false),
                },
            );
        } else {
            router.post('/admin/beranda/banners', bannerForm, {
                onSuccess: () => {
                    toast.success('Slide Banner baru ditambahkan!');
                    setIsBannerModalOpen(false);
                },
                onError: (err: any) => {
                    toast.error(
                        (Object.values(err)[0] as string) ||
                            'Gagal menambahkan slide banner.',
                    );
                },
                onFinish: () => setIsProcessingBanner(false),
            });
        }
    };

    const handleDeleteBanner = (id: number) => {
        setBannerToDelete(id);
    };

    const handleConfirmDeleteBanner = () => {
        if (bannerToDelete === null) {
            return;
        }

        setIsDeletingBanner(true);
        router.delete(`/admin/beranda/banners/${bannerToDelete}`, {
            onSuccess: () => {
                toast.success('Slide Banner berhasil dihapus!');
                setBannerToDelete(null);
            },
            onError: () => {
                toast.error('Gagal menghapus slide banner.');
            },
            onFinish: () => setIsDeletingBanner(false),
        });
    };

    const handleToggleBannerStatus = (id: number) => {
        router.patch(
            `/admin/beranda/banners/${id}/toggle`,
            {},
            {
                onSuccess: () => {
                    toast.info('Status slide berhasil diubah!');
                },
                onError: () => {
                    toast.error('Gagal mengubah status slide.');
                },
            },
        );
    };

    const handleMoveBanner = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) {
            return;
        }

        if (direction === 'down' && index === banners.length - 1) {
            return;
        }

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const newBanners = [...banners];
        const temp = newBanners[index];
        newBanners[index] = newBanners[targetIndex];
        newBanners[targetIndex] = temp;

        const ids = newBanners.map((b) => b.id);

        router.post(
            '/admin/beranda/banners/reorder',
            { ids },
            {
                onSuccess: () => {
                    toast.success('Urutan slide berhasil diubah!');
                },
                onError: () => {
                    toast.error('Gagal memperbarui urutan slide.');
                },
            },
        );
    };

    // ────────────────────────────────────────────────────────
    // 2. KEPALA BIRO STATE & SYNC
    // ────────────────────────────────────────────────────────
    const [kepalaBiro, setKepalaBiro] = useState(initialKepalaBiro);

    useEffect(() => {
        setKepalaBiro(initialKepalaBiro);
    }, [initialKepalaBiro]);

    const handleSaveKepalaBiro = (e: React.FormEvent) => {
        e.preventDefault();
        router.put('/admin/beranda/kepala-biro', kepalaBiro as any, {
            onSuccess: () => {
                toast.success(
                    'Profil & Sambutan Kepala Biro berhasil disimpan!',
                );
            },
            onError: (err: any) => {
                toast.error(
                    (Object.values(err)[0] as string) ||
                        'Gagal menyimpan profil Kepala Biro.',
                );
            },
        });
    };

    // ────────────────────────────────────────────────────────
    // 3. STATISTIK KELEMBAGAAN STATE & ACTIONS
    // ────────────────────────────────────────────────────────
    const [stats, setStats] = useState(initialStats);

    useEffect(() => {
        setStats(initialStats);
    }, [initialStats]);

    const handleAddStat = () => {
        if (stats.length >= 4) {
            toast.warning('Batas maksimum 4 statistik kelembagaan tercapai!');

            return;
        }

        setStats((prev) => [
            ...prev,
            {
                id: Date.now(),
                angka: '0',
                label: 'Statistik Baru',
                icon: 'Award',
                urutan: stats.length + 1,
            },
        ]);
        toast.success('Statistik baru ditambahkan! Silakan sesuaikan.');
    };

    const handleDeleteStat = (id: number) => {
        setStats((prev) => prev.filter((s) => s.id !== id));
        toast.success('Item statistik berhasil dihapus!');
    };

    const handleStatChange = (
        id: number,
        field: 'angka' | 'label' | 'icon',
        value: string,
    ) => {
        setStats((prev) =>
            prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
        );
    };

    const handleSaveStatistik = () => {
        const statsPayload = stats.map((s, idx) => ({
            ...s,
            id: String(s.id).length > 10 ? null : s.id,
            urutan: idx + 1,
        }));

        router.put(
            '/admin/beranda/statistik',
            { stats: statsPayload },
            {
                onSuccess: () => {
                    toast.success('Statistik kelembagaan berhasil diperbarui!');
                },
                onError: (err: any) => {
                    toast.error(
                        (Object.values(err)[0] as string) ||
                            'Gagal menyimpan statistik kelembagaan.',
                    );
                },
            },
        );
    };

    // ────────────────────────────────────────────────────────
    // 4. LAYANAN BKA STATE & ACTIONS
    // ────────────────────────────────────────────────────────
    const [layananSection, setLayananSection] = useState(initialLayananSection);
    const [layananItems, setLayananItems] = useState(initialLayananItems);

    useEffect(() => {
        setLayananSection(initialLayananSection);
    }, [initialLayananSection]);

    useEffect(() => {
        setLayananItems(initialLayananItems);
    }, [initialLayananItems]);

    const handleAddLayanan = () => {
        if (layananItems.length >= 6) {
            toast.warning('Batas maksimum 6 item layanan tercapai!');

            return;
        }

        setLayananItems((prev) => [
            ...prev,
            {
                id: Date.now(),
                title: 'Layanan Baru',
                desc: 'Deskripsi singkat mengenai layanan kelembagaan baru.',
                icon: 'Settings2',
                urutan: layananItems.length + 1,
            },
        ]);
        toast.success('Item layanan baru ditambahkan!');
    };

    const handleDeleteLayanan = (id: number) => {
        setLayananItems((prev) => prev.filter((l) => l.id !== id));
        toast.success('Item layanan berhasil dihapus!');
    };

    const handleLayananItemChange = (
        id: number,
        field: 'title' | 'desc' | 'icon',
        value: string,
    ) => {
        setLayananItems((prev) =>
            prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
        );
    };

    const handleSaveLayanan = (e: React.FormEvent) => {
        e.preventDefault();

        const itemsPayload = layananItems.map((item, idx) => ({
            id: String(item.id).length > 10 ? null : item.id,
            title: item.title,
            desc: item.desc,
            icon: item.icon,
            urutan: idx + 1,
        }));

        router.put(
            '/admin/beranda/layanan',
            {
                judul: layananSection.judul,
                desc: layananSection.desc,
                youtubeUrl: layananSection.youtubeUrl,
                items: itemsPayload,
            },
            {
                onSuccess: () => {
                    toast.success('Pengaturan Layanan BKA berhasil disimpan!');
                },
                onError: (err: any) => {
                    toast.error(
                        (Object.values(err)[0] as string) ||
                            'Gagal menyimpan pengaturan layanan.',
                    );
                },
            },
        );
    };

    return (
        <>
            <Head title="Kelola Beranda" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-neutral-800">
                            <Home className="size-6 text-emerald-600" />
                            Kelola Halaman Beranda
                        </h1>
                        <p className="mt-1 text-sm leading-relaxed font-normal text-neutral-500">
                            Sesuaikan slider hero, kata sambutan kepala biro,
                            statistik kelembagaan, serta daftar layanan publik
                            yang tampil di beranda utama.
                        </p>
                    </div>
                </div>

                {/* Glassmorphic Tabs Shell */}
                <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-[20%_1fr]">
                    {/* Tab Navigation Pane */}
                    <div className="flex w-full shrink-0 scrollbar-none flex-row gap-1.5 overflow-x-auto pb-2 select-none lg:w-full lg:flex-col lg:pb-0">
                        <button
                            onClick={() => setActiveTab('banners')}
                            className={cn(
                                'flex w-full shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-wide whitespace-nowrap transition-all outline-none',
                                activeTab === 'banners'
                                    ? 'rounded-l-none rounded-r-xl border-l-[3px] border-emerald-600 bg-emerald-50 pl-3 text-emerald-800 shadow-xs'
                                    : 'text-neutral-500 hover:bg-neutral-100/70 hover:text-neutral-900',
                            )}
                        >
                            <Sliders className="size-4.5 shrink-0" />
                            <span>1. Slide Banners ({banners.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('kepalaBiro')}
                            className={cn(
                                'flex w-full shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-wide whitespace-nowrap transition-all outline-none',
                                activeTab === 'kepalaBiro'
                                    ? 'rounded-l-none rounded-r-xl border-l-[3px] border-emerald-600 bg-emerald-50 pl-3 text-emerald-800 shadow-xs'
                                    : 'text-neutral-500 hover:bg-neutral-100/70 hover:text-neutral-900',
                            )}
                        >
                            <Award className="size-4.5 shrink-0" />
                            <span>2. Kepala Biro</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('stats')}
                            className={cn(
                                'flex w-full shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-wide whitespace-nowrap transition-all outline-none',
                                activeTab === 'stats'
                                    ? 'rounded-l-none rounded-r-xl border-l-[3px] border-emerald-600 bg-emerald-50 pl-3 text-emerald-800 shadow-xs'
                                    : 'text-neutral-500 hover:bg-neutral-100/70 hover:text-neutral-900',
                            )}
                        >
                            <Sparkles className="size-4.5 shrink-0" />
                            <span>3. Statistik Kelembagaan</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('services')}
                            className={cn(
                                'flex w-full shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-wide whitespace-nowrap transition-all outline-none',
                                activeTab === 'services'
                                    ? 'rounded-l-none rounded-r-xl border-l-[3px] border-emerald-600 bg-emerald-50 pl-3 text-emerald-800 shadow-xs'
                                    : 'text-neutral-500 hover:bg-neutral-100/70 hover:text-neutral-900',
                            )}
                        >
                            <Layout className="size-4.5 shrink-0" />
                            <span>4. Layanan BKA</span>
                        </button>

                        <div className="my-4 hidden border-t border-neutral-100 lg:block" />

                        <a
                            href="/admin/bidang"
                            className="group hidden items-center justify-between rounded-xl border border-emerald-100/50 bg-emerald-50/30 p-3.5 text-emerald-800 transition-all hover:border-emerald-200 hover:bg-emerald-50/50 lg:flex"
                        >
                            <div className="flex flex-col">
                                <span className="text-xs font-bold tracking-wider text-emerald-700 uppercase">
                                    Modul CRUD
                                </span>
                                <span className="mt-0.5 text-sm font-medium text-neutral-500 transition-colors group-hover:text-emerald-950">
                                    Kelola Bidang BKA
                                </span>
                            </div>
                            <ArrowRight className="size-4 text-emerald-600 transition-all group-hover:translate-x-0.5" />
                        </a>
                    </div>

                    {/* Tab Content Display */}
                    <div className="w-full min-w-0 space-y-6">
                        {/* TAB 1: SLIDE BANNERS */}
                        {activeTab === 'banners' && (
                            <div className="w-full space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                                <div className="flex flex-col justify-between gap-3 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center">
                                    <div>
                                        <h2 className="text-base font-bold tracking-tight text-neutral-800">
                                            Slide Hero Banners
                                        </h2>
                                        <p className="mt-0.5 text-sm font-light text-neutral-400">
                                            Atur banner promosi beranda.
                                            Maksimal 5 banner aktif.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleOpenAddBanner}
                                        disabled={banners.length >= 5}
                                        className="inline-flex animate-in items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all outline-none fade-in hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Plus className="size-4" />
                                        Tambah Slide
                                    </button>
                                </div>

                                {/* Banner List */}
                                <div className="space-y-4">
                                    {banners.map((banner, index) => (
                                        <div
                                            key={banner.id}
                                            className={cn(
                                                'group flex flex-col items-start gap-4 rounded-xl border border-neutral-200 bg-neutral-50/40 p-4 transition-all hover:bg-neutral-50/80 md:flex-row md:items-center',
                                                !banner.active && 'opacity-60',
                                            )}
                                        >
                                            {/* Preview Thumbnail */}
                                            <div className="size-24 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 select-none">
                                                <img
                                                    src={banner.imgUrl}
                                                    alt={banner.title}
                                                    className="size-full object-cover"
                                                />
                                            </div>

                                            {/* Content Metadata */}
                                            <div className="min-w-0 flex-1 space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="truncate text-sm font-extrabold text-neutral-800">
                                                        {banner.title}
                                                    </h3>
                                                    <span
                                                        className={cn(
                                                            'rounded px-2 py-0.5 text-xs font-bold tracking-wide uppercase select-none',
                                                            banner.active
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : 'bg-neutral-100 text-neutral-500',
                                                        )}
                                                    >
                                                        {banner.active
                                                            ? 'Aktif'
                                                            : 'Draf'}
                                                    </span>
                                                </div>
                                                <p className="line-clamp-2 text-xs leading-relaxed font-normal text-neutral-600">
                                                    {banner.desc}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
                                                    <span className="max-w-[150px] truncate rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-neutral-500">
                                                        {banner.btnText}
                                                    </span>
                                                    <span>·</span>
                                                    <span className="max-w-[200px] truncate font-mono text-neutral-400">
                                                        {banner.btnUrl}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Controls */}
                                            <div className="flex w-full items-center justify-end gap-1.5 self-end border-t border-neutral-200/50 pt-2.5 md:w-auto md:self-center md:border-t-0 md:pt-0">
                                                {/* Reorder Arrows */}
                                                <button
                                                    onClick={() =>
                                                        handleMoveBanner(
                                                            index,
                                                            'up',
                                                        )
                                                    }
                                                    disabled={index === 0}
                                                    className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 outline-none hover:bg-neutral-100/80 disabled:cursor-not-allowed disabled:opacity-30"
                                                    title="Pindah ke atas"
                                                >
                                                    <ArrowUp className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleMoveBanner(
                                                            index,
                                                            'down',
                                                        )
                                                    }
                                                    disabled={
                                                        index ===
                                                        banners.length - 1
                                                    }
                                                    className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 outline-none hover:bg-neutral-100/80 disabled:cursor-not-allowed disabled:opacity-30"
                                                    title="Pindah ke bawah"
                                                >
                                                    <ArrowDown className="size-4" />
                                                </button>

                                                <div className="mx-1 h-5 w-px bg-neutral-200" />

                                                {/* Toggle Status */}
                                                <button
                                                    onClick={() =>
                                                        handleToggleBannerStatus(
                                                            banner.id,
                                                        )
                                                    }
                                                    className={cn(
                                                        'rounded-lg border p-1.5 text-sm font-semibold transition-all outline-none',
                                                        banner.active
                                                            ? 'border-amber-200 bg-amber-50/40 text-amber-700 hover:bg-amber-50'
                                                            : 'border-emerald-200 bg-emerald-50/40 text-emerald-700 hover:bg-emerald-50',
                                                    )}
                                                    title={
                                                        banner.active
                                                            ? 'Sembunyikan'
                                                            : 'Tampilkan'
                                                    }
                                                >
                                                    <Eye className="size-4" />
                                                </button>

                                                {/* Edit & Delete */}
                                                <button
                                                    onClick={() =>
                                                        handleOpenEditBanner(
                                                            banner.id,
                                                        )
                                                    }
                                                    className="rounded-lg border border-neutral-200 p-1.5 text-neutral-600 outline-none hover:bg-neutral-100/80"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteBanner(
                                                            banner.id,
                                                        )
                                                    }
                                                    className="rounded-lg border border-red-100 p-1.5 text-red-600 outline-none hover:bg-red-50"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {banners.length === 0 && (
                                        <div className="rounded-2xl border-2 border-dashed border-neutral-100 py-12 text-center">
                                            <Sliders className="mx-auto mb-3 size-12 animate-pulse text-neutral-300" />
                                            <h3 className="text-sm font-semibold text-neutral-700">
                                                Belum Ada Slide Banner
                                            </h3>
                                            <p className="mx-auto mt-1 max-w-xs text-xs text-neutral-400">
                                                Tontonan slider utama beranda
                                                kosong. Klik "Tambah Slide" di
                                                atas untuk membuat banner baru.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 2: KEPALA BIRO */}
                        {activeTab === 'kepalaBiro' && (
                            <div className="flex w-full animate-in flex-col gap-6 fade-in xl:flex-row">
                                {/* Form Pane */}
                                <div className="min-w-0 flex-1 space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                                    <div className="border-b border-neutral-100 pb-4">
                                        {/* Foto Kepala Biro & Upload Section */}
                                        <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/30 p-5">
                                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                                <label className="flex items-center gap-2 text-sm font-bold text-neutral-700">
                                                    <ImageIcon className="size-4 text-emerald-600" />
                                                    Foto Kepala Biro (Rasio 1:1
                                                    atau 3:4)
                                                </label>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setAssetPickerTarget(
                                                                'kepalaBiro',
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-600 shadow-xs hover:bg-neutral-50 hover:text-emerald-700"
                                                    >
                                                        <ImageIcon className="size-3.5" />
                                                        Pilih dari Aset
                                                    </button>
                                                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700">
                                                        <Upload className="size-3.5" />
                                                        Unggah Langsung
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={
                                                                handleKbFileChange
                                                            }
                                                        />
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Manual URL input fallback */}
                                            <div className="space-y-1">
                                                <input
                                                    type="text"
                                                    placeholder="Atau masukkan URL gambar di sini..."
                                                    value={kepalaBiro.fotoUrl}
                                                    onChange={(e) =>
                                                        setKepalaBiro(
                                                            (prev) => ({
                                                                ...prev,
                                                                fotoUrl:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 font-mono text-xs text-neutral-600 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <form
                                        onSubmit={handleSaveKepalaBiro}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-neutral-700">
                                                    Nama Lengkap
                                                </label>
                                                <input
                                                    type="text"
                                                    value={kepalaBiro.nama}
                                                    onChange={(e) =>
                                                        setKepalaBiro(
                                                            (prev) => ({
                                                                ...prev,
                                                                nama: e.target
                                                                    .value,
                                                            }),
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-neutral-700">
                                                    Periode Jabatan
                                                </label>
                                                <input
                                                    type="text"
                                                    value={kepalaBiro.periode}
                                                    onChange={(e) =>
                                                        setKepalaBiro(
                                                            (prev) => ({
                                                                ...prev,
                                                                periode:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-neutral-700">
                                                Jabatan Resmi
                                            </label>
                                            <input
                                                type="text"
                                                value={kepalaBiro.jabatan}
                                                onChange={(e) =>
                                                    setKepalaBiro((prev) => ({
                                                        ...prev,
                                                        jabatan: e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-sm font-semibold text-neutral-700">
                                                <label>
                                                    Sambutan Kepala Biro
                                                </label>
                                                <span className="text-xs font-light text-neutral-400">
                                                    {kepalaBiro.sambutan.length}{' '}
                                                    / 2000 karakter
                                                </span>
                                            </div>
                                            <textarea
                                                rows={6}
                                                value={kepalaBiro.sambutan}
                                                onChange={(e) =>
                                                    setKepalaBiro((prev) => ({
                                                        ...prev,
                                                        sambutan:
                                                            e.target.value.slice(
                                                                0,
                                                                2000,
                                                            ),
                                                    }))
                                                }
                                                className="text-neutral-650 text-neutral-750 w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm leading-relaxed text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                            />
                                        </div>

                                        <div className="flex items-center justify-end border-t border-neutral-100 pt-4">
                                            <button
                                                type="submit"
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all outline-none hover:bg-emerald-700 active:scale-95"
                                            >
                                                <Check className="size-4.5" />
                                                Simpan Perubahan
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Live Preview Pane */}
                                <div className="w-full shrink-0 space-y-4 xl:w-[320px]">
                                    <div className="flex items-center justify-between rounded-2xl border border-dashed border-neutral-200 bg-neutral-900/5 p-4">
                                        <div className="flex items-center gap-2">
                                            <Eye className="size-4.5 text-emerald-600" />
                                            <span className="text-sm font-bold text-neutral-700">
                                                Live Preview
                                            </span>
                                        </div>
                                        <span className="text-xs font-medium text-neutral-400">
                                            Real-time Sinkron
                                        </span>
                                    </div>

                                    {/* Preview Sambutan Card (Copied directly from frontend layout spec) */}
                                    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-md">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="mb-3 size-32 overflow-hidden rounded-full border border-neutral-200/60 bg-neutral-50 shadow-inner select-none">
                                                <img
                                                    src={kepalaBiro.fotoUrl}
                                                    alt={kepalaBiro.nama}
                                                    className="size-full object-cover"
                                                />
                                            </div>
                                            <h3 className="text-base leading-tight font-bold text-neutral-800">
                                                {kepalaBiro.nama ||
                                                    'Nama Kepala Biro'}
                                            </h3>
                                            <p className="mt-0.5 text-sm font-bold tracking-wide text-emerald-700 uppercase">
                                                {kepalaBiro.jabatan ||
                                                    'Jabatan'}
                                            </p>
                                            <span className="mt-1 flex items-center gap-1 text-xs font-light text-neutral-400">
                                                <Calendar className="size-3.5" />
                                                Periode:{' '}
                                                {kepalaBiro.periode || '—'}
                                            </span>
                                        </div>

                                        <div className="h-px bg-neutral-100" />

                                        <div className="space-y-2">
                                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 uppercase select-none">
                                                Kata Sambutan
                                            </span>
                                            <p className="text-justify text-sm leading-relaxed font-normal text-neutral-600 italic">
                                                "
                                                {kepalaBiro.sambutan ||
                                                    'Sambutan kepala biro akan dicantumkan di sini...'}
                                                "
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: STATISTIK KELEMBAGAAN */}
                        {activeTab === 'stats' && (
                            <div className="w-full animate-in space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] fade-in md:p-8">
                                <div className="flex flex-col justify-between gap-3 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center">
                                    <div>
                                        <h2 className="text-base font-bold tracking-tight text-neutral-800">
                                            Statistik Kelembagaan
                                        </h2>
                                        <p className="mt-0.5 text-sm font-light text-neutral-400">
                                            Konfigurasi panel angka statistik
                                            utama di beranda (Maksimal 4 item).
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddStat}
                                        disabled={stats.length >= 4}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all outline-none hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Plus className="size-4" />
                                        Tambah Statistik
                                    </button>
                                </div>

                                {/* Statistik Repeater Grid */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {stats.map((item) => (
                                        <div
                                            key={item.id}
                                            className="group relative space-y-3 rounded-xl border border-neutral-200 bg-neutral-50/40 p-4"
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteStat(item.id)
                                                }
                                                className="absolute top-3 right-3 rounded-lg border border-red-50 p-1.5 text-red-500 transition-all outline-none hover:border-red-100 hover:bg-red-50"
                                                title="Hapus"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>

                                            <div className="flex items-center gap-3">
                                                {/* Curated Icon Selector */}
                                                <div className="w-full max-w-[140px] space-y-1.5">
                                                    <label className="text-xs font-semibold text-neutral-500 uppercase">
                                                        Ikon
                                                    </label>
                                                    <IconPicker
                                                        value={item.icon}
                                                        onChange={(val) =>
                                                            handleStatChange(
                                                                item.id,
                                                                'icon',
                                                                val,
                                                            )
                                                        }
                                                    />
                                                </div>

                                                {/* Stat Number */}
                                                <div className="flex-1 space-y-1.5">
                                                    <label className="font-mono text-xs font-semibold text-neutral-500 uppercase">
                                                        Angka
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={item.angka}
                                                        onChange={(e) =>
                                                            handleStatChange(
                                                                item.id,
                                                                'angka',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-sm font-extrabold text-neutral-800 transition-all outline-none focus:border-emerald-600"
                                                    />
                                                </div>
                                            </div>

                                            {/* Stat Label */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-neutral-500 uppercase">
                                                    Label Deskripsi
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.label}
                                                    onChange={(e) =>
                                                        handleStatChange(
                                                            item.id,
                                                            'label',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-sm font-bold text-neutral-700 transition-all outline-none focus:border-emerald-600"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {stats.length === 0 && (
                                    <div className="rounded-2xl border-2 border-dashed border-neutral-100 py-12 text-center">
                                        <Sparkles className="mx-auto mb-3 size-12 animate-pulse text-neutral-300" />
                                        <h3 className="text-sm font-semibold text-neutral-700">
                                            Belum Ada Item Statistik
                                        </h3>
                                        <p className="mx-auto mt-1 max-w-xs text-xs text-neutral-400">
                                            Silakan klik "Tambah Statistik" di
                                            atas untuk menambahkan maksimal 4
                                            indikator data utama.
                                        </p>
                                    </div>
                                )}

                                {stats.length > 0 && (
                                    <div className="flex items-center justify-end border-t border-neutral-100 pt-4">
                                        <button
                                            type="button"
                                            onClick={handleSaveStatistik}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all outline-none hover:bg-emerald-700 active:scale-95"
                                        >
                                            <Check className="size-4.5" />
                                            Simpan Perubahan Statistik
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 4: LAYANAN BKA */}
                        {activeTab === 'services' && (
                            <form
                                onSubmit={handleSaveLayanan}
                                className="w-full animate-in space-y-6 fade-in"
                            >
                                {/* Global Section Setup */}
                                <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                                    <div className="border-b border-neutral-100 pb-4">
                                        <h2 className="text-base font-bold tracking-tight text-neutral-800">
                                            Pengaturan Bagian Layanan
                                        </h2>
                                        <p className="mt-0.5 text-sm font-light text-neutral-400">
                                            Kelola judul header bagian layanan
                                            dan tautan video profil YouTube
                                            resmi.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-neutral-700">
                                                Judul Layanan
                                            </label>
                                            <input
                                                type="text"
                                                value={layananSection.judul}
                                                onChange={(e) =>
                                                    setLayananSection(
                                                        (prev) => ({
                                                            ...prev,
                                                            judul: e.target
                                                                .value,
                                                        }),
                                                    )
                                                }
                                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-neutral-700">
                                                Tautan Video Profil YouTube
                                            </label>
                                            <input
                                                type="text"
                                                value={
                                                    layananSection.youtubeUrl
                                                }
                                                onChange={(e) =>
                                                    setLayananSection(
                                                        (prev) => ({
                                                            ...prev,
                                                            youtubeUrl:
                                                                e.target.value,
                                                        }),
                                                    )
                                                }
                                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 font-mono text-sm text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-neutral-700">
                                            Deskripsi Sub-header Layanan
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={layananSection.desc}
                                            onChange={(e) =>
                                                setLayananSection((prev) => ({
                                                    ...prev,
                                                    desc: e.target.value,
                                                }))
                                            }
                                            className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm leading-relaxed text-neutral-700 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                        />
                                    </div>
                                </div>

                                {/* Items Repeater Area */}
                                <div className="space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                                    <div className="flex flex-col justify-between gap-3 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center">
                                        <div>
                                            <h2 className="text-base font-bold tracking-tight text-neutral-800">
                                                Daftar Item Layanan
                                            </h2>
                                            <p className="mt-0.5 text-sm font-light text-neutral-400">
                                                Konfigurasi maksimal 6 item
                                                layanan publik di beranda.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddLayanan}
                                            disabled={layananItems.length >= 6}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all outline-none hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Plus className="size-4" />
                                            Tambah Item Layanan
                                        </button>
                                    </div>

                                    {/* Items List */}
                                    <div className="space-y-4">
                                        {layananItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="relative flex flex-col items-start gap-4 rounded-xl border border-neutral-200 bg-neutral-50/40 p-4 sm:flex-row"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteLayanan(
                                                            item.id,
                                                        )
                                                    }
                                                    className="absolute top-3 right-3 rounded-lg border border-red-50 bg-white p-1.5 text-red-500 transition-all outline-none hover:border-red-100 hover:bg-red-50"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>

                                                <div className="w-full space-y-1.5 sm:max-w-[160px]">
                                                    <label className="text-xs font-semibold text-neutral-500 uppercase">
                                                        Ikon
                                                    </label>
                                                    <IconPicker
                                                        value={item.icon}
                                                        onChange={(val) =>
                                                            handleLayananItemChange(
                                                                item.id,
                                                                'icon',
                                                                val,
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="w-full flex-1 space-y-3">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-semibold text-neutral-500 uppercase">
                                                            Judul Item
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={item.title}
                                                            onChange={(e) =>
                                                                handleLayananItemChange(
                                                                    item.id,
                                                                    'title',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="text-neutral-850 w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-semibold text-neutral-500 uppercase">
                                                            Deskripsi Item
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={item.desc}
                                                            onChange={(e) =>
                                                                handleLayananItemChange(
                                                                    item.id,
                                                                    'desc',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-sm leading-relaxed text-neutral-700 transition-all outline-none focus:border-emerald-600"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {layananItems.length === 0 && (
                                            <div className="rounded-2xl border-2 border-dashed border-neutral-100 py-12 text-center">
                                                <Layout className="mx-auto mb-3 size-12 animate-pulse text-neutral-300" />
                                                <h3 className="text-sm font-semibold text-neutral-700">
                                                    Belum Ada Item Layanan
                                                </h3>
                                                <p className="mx-auto mt-1 max-w-xs text-xs text-neutral-400">
                                                    Klik "Tambah Item Layanan"
                                                    untuk mendaftarkan layanan
                                                    publik baru.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex items-center justify-end">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all outline-none hover:bg-emerald-700 active:scale-95"
                                    >
                                        <Check className="size-4.5" />
                                        Simpan Seluruh Pengaturan Layanan
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* BANNER ADD/EDIT MODAL DIALOG */}
            <AdminModal
                isOpen={isBannerModalOpen}
                onClose={() => setIsBannerModalOpen(false)}
                title={
                    editingBannerId !== null
                        ? 'Edit Slide Banner'
                        : 'Tambah Slide Banner'
                }
                icon={<Home className="size-5 text-emerald-600" />}
                maxWidth="lg"
            >
                <form onSubmit={handleSaveBanner} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-neutral-700">
                            Judul Slide (Opsional, Maksimal 100)
                        </label>
                        <input
                            type="text"
                            maxLength={100}
                            value={bannerForm.title}
                            onChange={(e) =>
                                setBannerForm((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                }))
                            }
                            placeholder="Contoh: Portal Informasi BKA Resmi"
                            className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-neutral-700">
                            Deskripsi Pendek (Opsional, Maksimal 200)
                        </label>
                        <textarea
                            rows={3}
                            maxLength={200}
                            value={bannerForm.desc}
                            onChange={(e) =>
                                setBannerForm((prev) => ({
                                    ...prev,
                                    desc: e.target.value,
                                }))
                            }
                            placeholder="Contoh: Selamat datang di portal biro kelembagaan yang tepercaya..."
                            className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm leading-relaxed text-neutral-700 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700">
                                Teks Tombol CTA (Maks 30)
                            </label>
                            <input
                                type="text"
                                maxLength={30}
                                value={bannerForm.btnText}
                                onChange={(e) =>
                                    setBannerForm((prev) => ({
                                        ...prev,
                                        btnText: e.target.value,
                                    }))
                                }
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700">
                                Tautan Tombol CTA (URL Valid)
                            </label>
                            <input
                                type="text"
                                value={bannerForm.btnUrl}
                                onChange={(e) =>
                                    setBannerForm((prev) => ({
                                        ...prev,
                                        btnUrl: e.target.value,
                                    }))
                                }
                                placeholder="Contoh: /admin/berita"
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 font-mono text-sm text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                            <label className="text-sm font-bold text-neutral-700">
                                Gambar Banner (Rekomendasi: 1600 x 680 piksel)
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setAssetPickerTarget('banner')
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-bold text-neutral-600 shadow-xs hover:bg-neutral-50 hover:text-emerald-700"
                                >
                                    <ImageIcon className="size-3" />
                                    Pilih dari Aset
                                </button>
                                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700">
                                    <Upload className="size-3" />
                                    Unggah Langsung
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleBannerFileChange}
                                    />
                                </label>
                            </div>
                        </div>
                        <input
                            type="text"
                            value={bannerForm.imgUrl}
                            onChange={(e) =>
                                setBannerForm((prev) => ({
                                    ...prev,
                                    imgUrl: e.target.value,
                                }))
                            }
                            placeholder="Contoh: https://images.unsplash.com/... atau dari unggahan"
                            className="w-full rounded-xl border border-neutral-200 bg-white p-3 font-mono text-sm text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="active"
                                checked={bannerForm.active}
                                onChange={(e) =>
                                    setBannerForm((prev) => ({
                                        ...prev,
                                        active: e.target.checked,
                                    }))
                                }
                                className="size-5 cursor-pointer rounded border-neutral-300 text-emerald-600 focus:ring-emerald-600"
                            />
                            <label
                                htmlFor="active"
                                className="cursor-pointer text-sm font-semibold text-neutral-700 select-none"
                            >
                                Tampilkan langsung (Aktif)
                            </label>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsBannerModalOpen(false)}
                                className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-600 outline-none hover:bg-neutral-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isProcessingBanner}
                                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all outline-none hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isProcessingBanner ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Slide'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </AdminModal>

            {/* MODAL: DELETE BANNER CONFIRMATION */}
            <AdminModal
                isOpen={bannerToDelete !== null}
                onClose={() => setBannerToDelete(null)}
                title="Hapus Slide Banner?"
                icon={<Trash2 className="size-5 text-red-600" />}
                maxWidth="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-neutral-500">
                        Apakah Anda yakin ingin menghapus slide banner ini secara permanen?
                        Tautan slide ini tidak akan dapat diakses lagi oleh publik.
                    </p>
                    <div className="flex items-center justify-end gap-3 border-t border-neutral-100 pt-4">
                        <button
                            type="button"
                            onClick={() => setBannerToDelete(null)}
                            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-semibold text-neutral-600 transition-colors outline-none hover:bg-neutral-50"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmDeleteBanner}
                            disabled={isDeletingBanner}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all outline-none hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isDeletingBanner ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                'Hapus Permanen'
                            )}
                        </button>
                    </div>
                </div>
            </AdminModal>

            <AssetPickerModal
                isOpen={assetPickerTarget !== null}
                onClose={() => setAssetPickerTarget(null)}
                onSelect={handleSelectAsset}
            />

            <ImageUploadModal
                isOpen={isBannerUploadModalOpen}
                onClose={() => setIsBannerUploadModalOpen(false)}
                file={selectedBannerFile}
                onConfirm={handleBannerUploadConfirm}
                defaultWidth={1600}
                defaultQuality={85}
            />

            <ImageUploadModal
                isOpen={isKbUploadModalOpen}
                onClose={() => setIsKbUploadModalOpen(false)}
                file={selectedKbFile}
                onConfirm={handleKbUploadConfirm}
                defaultWidth={600}
                defaultQuality={75}
                aspectRatio={1}
            />
        </>
    );
}

// Map the static breadcrumbs so that AppSidebarLayout renders them perfectly in top bar
EditBeranda.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Kelola Beranda',
            href: '/admin/beranda',
        },
    ],
};
