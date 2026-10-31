import { Head, usePage, router } from '@inertiajs/react';
import {
    Settings2,
    Mail,
    Share2,
    Info,
    Save,
    Plus,
    Trash2,
    ShieldAlert,
    Globe,
    MapPin,
    Phone,
    Clock,
    Sparkles,
    CheckCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { optimizeFile } from '@/lib/image-optimizer';
import { AssetPickerModal } from '@/components/admin/asset-picker-modal';
import { ImageUploadModal } from '@/components/admin/image-upload-modal';

interface MediaSosialItem {
    platform: string;
    url: string;
}

interface WebSettings {
    alamat: string;
    telepon: string;
    email: string;
    jam_operasional: string;
    google_maps_embed: string;
    mediaSosial: MediaSosialItem[];
    nama_website: string;
    deskripsi_seo: string;
    logo_base64?: string;
    favicon_base64?: string;
    pemberitahuan_aktif?: string;
    pemberitahuan_gambar?: string;
    pemberitahuan_link_url?: string;
    pemberitahuan_link_teks?: string;
    pemberitahuan_tombol_teks?: string;
}

export default function WebSettingsCMS({
    dbSettings,
}: {
    dbSettings?: WebSettings;
}) {
    const { auth } = usePage().props as any;

    // Auth authorization check: Super Admin check
    const isSuperAdmin =
        auth?.user?.roles?.includes('super_admin') ||
        auth?.user?.role === 'super_admin' ||
        false;

    // Tabs navigation: 'kontak', 'sosmed', 'sistem', 'pemberitahuan'
    const [activeTab, setActiveTab] = useState<
        'kontak' | 'sosmed' | 'sistem' | 'pemberitahuan'
    >('kontak');

    // States
    const [settings, setSettings] = useState<WebSettings>(
        dbSettings || DEFAULT_SETTINGS,
    );

    // Modal states for popup notification image upload & asset selection
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(
        null,
    );

    // Handler for flyer image selection
    const handleFlyerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File gambar melebihi batas 10MB!');
            return;
        }

        setSelectedUploadFile(file);
        setIsUploadModalOpen(true);
        e.target.value = '';
    };

    const handleUploadConfirm = (result: { base64: string }) => {
        setSettings((prev) => ({
            ...prev,
            pemberitahuan_gambar: result.base64,
        }));
        toast.success('Gambar flyer berhasil diunggah & dioptimasi!');
    };

    // Sync settings from database props
    useEffect(() => {
        if (dbSettings) {
            setSettings(dbSettings);
        }
    }, [dbSettings]);

    // Tab 1: Save Contact Info
    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(
            '/admin/settings',
            {
                alamat: settings.alamat,
                telepon: settings.telepon,
                email: settings.email,
                jam_operasional: settings.jam_operasional,
                google_maps_embed: settings.google_maps_embed,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        'Informasi kontak kantor berhasil diperbarui',
                    );
                },
                onError: (err) => {
                    toast.error(
                        (Object.values(err)[0] as string) ||
                            'Gagal memperbarui informasi kontak',
                    );
                },
            },
        );
    };

    // Tab 2: Sosmed Repeater handlers
    const handleSosmedChange = (
        index: number,
        field: keyof MediaSosialItem,
        value: string,
    ) => {
        const updatedSosmed = [...settings.mediaSosial];
        updatedSosmed[index] = { ...updatedSosmed[index], [field]: value };
        setSettings((prev) => ({ ...prev, mediaSosial: updatedSosmed }));
    };

    const handleAddSosmed = () => {
        const updatedSosmed = [
            ...settings.mediaSosial,
            { platform: 'Instagram', url: '' },
        ];
        setSettings((prev) => ({ ...prev, mediaSosial: updatedSosmed }));
    };

    const handleRemoveSosmed = (index: number) => {
        const updatedSosmed = settings.mediaSosial.filter(
            (_, idx) => idx !== index,
        );
        setSettings((prev) => ({ ...prev, mediaSosial: updatedSosmed }));
        toast.info('Tautan media sosial dihapus dari draf');
    };

    const handleSosmedSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const invalidUrls = settings.mediaSosial.some(
            (item) => !item.url || !item.url.startsWith('http'),
        );
        if (invalidUrls) {
            toast.error(
                'Harap masukkan URL media sosial yang valid (mulai dengan http:// atau https://)',
            );
            return;
        }

        router.post(
            '/admin/settings',
            {
                mediaSosial: settings.mediaSosial as any,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        'Tautan media sosial resmi berhasil diperbarui',
                    );
                },
                onError: (err) => {
                    toast.error(
                        (Object.values(err)[0] as string) ||
                            'Gagal memperbarui tautan media sosial',
                    );
                },
            },
        );
    };

    // Tab 3: System settings image upload to Base64 (optimized to WebP)
    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        field: 'logo_base64' | 'favicon_base64' | 'pemberitahuan_gambar',
    ) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        // Limit size validation before optimization (prevent crash on extremely large files)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File gambar melebihi batas 10MB!');
            return;
        }

        // Configuration per image type
        let maxWidth = 800;
        let quality = 0.75;
        if (field === 'logo_base64') {
            maxWidth = 500;
            quality = 0.85;
        } else if (field === 'favicon_base64') {
            maxWidth = 64;
            quality = 0.9;
        } else if (field === 'pemberitahuan_gambar') {
            maxWidth = 1200; // notification flyer is larger and needs high clarity
            quality = 0.8;
        }

        const optimizePromise = optimizeFile(file, maxWidth, quality);

        toast.promise(optimizePromise, {
            loading: 'Mengompresi & mengoptimasi gambar...',
            success: (result) => {
                setSettings((prev) => ({ ...prev, [field]: result.base64 }));
                const savings = Math.round(
                    ((result.originalSize - result.size) /
                        result.originalSize) *
                        100,
                );
                return `Gambar berhasil diunggah & dioptimasi (${savings}% lebih hemat)!`;
            },
            error: 'Gagal mengompresi gambar',
        });

        // Reset file input value to allow uploading the same file again
        e.target.value = '';
    };

    const handleSystemSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isSuperAdmin) {
            toast.error(
                'Hanya Super Admin yang diizinkan memperbarui pengaturan sistem',
            );

            return;
        }

        router.post(
            '/admin/settings',
            {
                nama_website: settings.nama_website,
                deskripsi_seo: settings.deskripsi_seo,
                logo_base64: settings.logo_base64 || null,
                favicon_base64: settings.favicon_base64 || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        'Konfigurasi identitas sistem & SEO berhasil diperbarui',
                    );
                },
                onError: (err) => {
                    toast.error(
                        (Object.values(err)[0] as string) ||
                            'Gagal memperbarui pengaturan sistem',
                    );
                },
            },
        );
    };

    const handleNotificationSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post(
            '/admin/settings',
            {
                pemberitahuan_aktif: settings.pemberitahuan_aktif || '0',
                pemberitahuan_gambar: settings.pemberitahuan_gambar || null,
                pemberitahuan_link_url: settings.pemberitahuan_link_url || '',
                pemberitahuan_link_teks: settings.pemberitahuan_link_teks || '',
                pemberitahuan_tombol_teks:
                    settings.pemberitahuan_tombol_teks || '',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        'Pengaturan popup pemberitahuan berhasil diperbarui',
                    );
                },
                onError: (err) => {
                    toast.error(
                        (Object.values(err)[0] as string) ||
                            'Gagal memperbarui pengaturan pemberitahuan',
                    );
                },
            },
        );
    };

    return (
        <>
            <Head title="Pengaturan Web - Admin BKA UMRI" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header section */}
                <div className="flex flex-col gap-2 border-b border-neutral-100 pb-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
                            <Settings2 className="text-[#0a6c32]" size={28} />
                            Pengaturan Website
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500">
                            Kelola profil kontak kantor BKA, tautan sosial media, sistem SEO, dan banner pengumuman popup.
                        </p>
                    </div>
                </div>

                {/* Dashboard layout with Glassmorphic Tab Selector & Panel */}
                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Left vertical tab selectors (3/12 width equivalent) */}
                    <div className="flex shrink-0 flex-col gap-2 lg:w-64">
                        <button
                            onClick={() => setActiveTab('kontak')}
                            className={`flex w-full items-center gap-3 rounded-2xl border p-4.5 text-left text-xs font-bold transition-all ${
                                activeTab === 'kontak'
                                    ? 'border-[#0a6c32] bg-emerald-50/20 text-[#0a6c32] shadow-xs'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                            }`}
                        >
                            <MapPin size={16} />
                            <span>Informasi Kontak</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('sosmed')}
                            className={`flex w-full items-center gap-3 rounded-2xl border p-4.5 text-left text-xs font-bold transition-all ${
                                activeTab === 'sosmed'
                                    ? 'border-[#0a6c32] bg-emerald-50/20 text-[#0a6c32] shadow-xs'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                            }`}
                        >
                            <Share2 size={16} />
                            <span>Media Sosial</span>
                        </button>

                        {isSuperAdmin && (
                            <button
                                onClick={() => setActiveTab('sistem')}
                                className={`flex w-full items-center justify-between rounded-2xl border p-4.5 text-left text-xs font-bold transition-all ${
                                    activeTab === 'sistem'
                                        ? 'border-[#0a6c32] bg-emerald-50/20 text-[#0a6c32] shadow-xs'
                                        : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Globe size={16} />
                                    <span>Pengaturan Sistem</span>
                                </div>
                                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[9px] font-extrabold text-amber-700 uppercase">
                                    Super
                                </span>
                            </button>
                        )}

                        <button
                            onClick={() => setActiveTab('pemberitahuan')}
                            className={`flex w-full items-center gap-3 rounded-2xl border p-4.5 text-left text-xs font-bold transition-all ${
                                activeTab === 'pemberitahuan'
                                    ? 'border-[#0a6c32] bg-emerald-50/20 text-[#0a6c32] shadow-xs'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                            }`}
                        >
                            <Sparkles size={16} />
                            <span>Popup Pemberitahuan</span>
                        </button>
                    </div>

                    {/* Right panels display box */}
                    <div className="flex-1 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
                        {/* PANEL 1: INFORMASI KONTAK */}
                        {activeTab === 'kontak' && (
                            <form
                                onSubmit={handleContactSubmit}
                                className="flex flex-col gap-6"
                            >
                                <div>
                                    <h2 className="text-base font-bold text-neutral-900">
                                        Informasi Kontak Biro
                                    </h2>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Sesuaikan informasi kontak resmi yang
                                        ditampilkan di halaman publik Hubungi
                                        Kami.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-neutral-800">
                                            Telepon / Hotline Kantor *
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.telepon}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    telepon: e.target.value,
                                                }))
                                            }
                                            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-neutral-800">
                                            Email Resmi Kantor *
                                        </label>
                                        <input
                                            type="email"
                                            value={settings.email}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    email: e.target.value,
                                                }))
                                            }
                                            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5 md:col-span-2">
                                        <label className="text-xs font-bold text-neutral-800">
                                            Alamat Lengkap Kantor *
                                        </label>
                                        <textarea
                                            value={settings.alamat}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    alamat: e.target.value,
                                                }))
                                            }
                                            rows={3}
                                            className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5 md:col-span-2">
                                        <label className="text-xs font-bold text-neutral-800">
                                            Jam Kerja / Jam Operasional *
                                        </label>
                                        <textarea
                                            value={settings.jam_operasional}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    jam_operasional:
                                                        e.target.value,
                                                }))
                                            }
                                            rows={2}
                                            className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5 md:col-span-2">
                                        <label className="text-xs font-bold text-neutral-800">
                                            URL Google Maps Iframe String *
                                        </label>
                                        <textarea
                                            value={settings.google_maps_embed}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    google_maps_embed:
                                                        e.target.value,
                                                }))
                                            }
                                            rows={3}
                                            className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 font-mono text-[11px] outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                            required
                                        />
                                        <p className="mt-0.5 text-[10px] leading-normal text-neutral-400">
                                            Masukkan link iframe (dari Google
                                            Maps - Bagikan - Sematkan Peta).
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-end border-t border-neutral-100 pt-4">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#0a6c32] px-5 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#085627]"
                                    >
                                        <Save size={14} />
                                        <span>Simpan Perubahan Kontak</span>
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* PANEL 2: TAUTAN SOSIAL MEDIA */}
                        {activeTab === 'sosmed' && (
                            <form
                                onSubmit={handleSosmedSubmit}
                                className="flex flex-col gap-6"
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-base font-bold text-neutral-900">
                                            Tautan Media Sosial Resmi
                                        </h2>
                                        <p className="mt-1 text-xs text-neutral-500">
                                            Atur daftar repeater link tautan
                                            sosial media resmi BKA UMRI.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddSosmed}
                                        className="inline-flex items-center gap-1 rounded-xl bg-[#0a6c32] px-3 py-2 text-[11px] font-bold text-white shadow-xs transition-all hover:bg-[#085627]"
                                    >
                                        <Plus size={13} />
                                        <span>Tambah Tautan</span>
                                    </button>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {settings.mediaSosial.length > 0 ? (
                                        settings.mediaSosial.map(
                                            (med, index) => (
                                                <div
                                                    key={index}
                                                    className="border-neutral-150 flex items-center gap-3 rounded-2xl border bg-neutral-50/20 p-3"
                                                >
                                                    <div className="w-1/3 max-w-[160px] min-w-[120px]">
                                                        <select
                                                            value={med.platform}
                                                            onChange={(e) =>
                                                                handleSosmedChange(
                                                                    index,
                                                                    'platform',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs font-bold outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                                        >
                                                            <option value="Facebook">
                                                                Facebook
                                                            </option>
                                                            <option value="Instagram">
                                                                Instagram
                                                            </option>
                                                            <option value="YouTube">
                                                                YouTube
                                                            </option>
                                                            <option value="Twitter">
                                                                X / Twitter
                                                            </option>
                                                            <option value="LinkedIn">
                                                                LinkedIn
                                                            </option>
                                                            <option value="TikTok">
                                                                TikTok
                                                            </option>
                                                        </select>
                                                    </div>
                                                    <div className="flex-1">
                                                        <input
                                                            type="url"
                                                            placeholder="Masukkan URL profil lengkap..."
                                                            value={med.url}
                                                            onChange={(e) =>
                                                                handleSosmedChange(
                                                                    index,
                                                                    'url',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                                            required
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveSosmed(
                                                                index,
                                                            )
                                                        }
                                                        className="shrink-0 rounded-xl p-2 text-red-500 hover:bg-red-50"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ),
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 text-center text-neutral-400">
                                            <Share2
                                                size={40}
                                                className="mb-2 stroke-1 text-neutral-300"
                                            />
                                            <span className="text-xs font-semibold">
                                                Tautan Belum Dikonfigurasi
                                            </span>
                                            <p className="mt-0.5 text-[10px]">
                                                Silakan klik Tambah Tautan untuk
                                                memasukkan akun sosial media
                                                resmi.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center justify-end border-t border-neutral-100 pt-4">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#0a6c32] px-5 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#085627]"
                                    >
                                        <Save size={14} />
                                        <span>Simpan Perubahan Tautan</span>
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* PANEL 3: PENGATURAN SISTEM (RESTRICTED TO SUPER ADMIN) */}
                        {activeTab === 'sistem' && (
                            <form
                                onSubmit={handleSystemSubmit}
                                className="flex flex-col gap-6"
                            >
                                <div>
                                    <h2 className="flex items-center gap-1.5 text-base font-bold text-neutral-900">
                                        Identitas Sistem & Metadata SEO
                                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[8px] font-black text-amber-700 uppercase">
                                            Super Admin Only
                                        </span>
                                    </h2>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Konfigurasi branding nama portal website
                                        utama serta deskripsi optimasi search
                                        engine (SEO).
                                    </p>
                                </div>

                                {/* Security Warning Banner for Non-Super Admins */}
                                {!isSuperAdmin && (
                                    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                                        <ShieldAlert
                                            size={18}
                                            className="mt-0.5 shrink-0 text-amber-600"
                                        />
                                        <div>
                                            <span className="font-bold">
                                                Mode Baca Saja (Read-Only)
                                            </span>
                                            <p className="mt-0.5 leading-relaxed text-amber-700">
                                                Akun Anda tidak memiliki lisensi
                                                peran **Super Admin**. Anda
                                                diizinkan untuk melihat
                                                konfigurasi, namun tidak dapat
                                                menyimpan perubahan.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-5">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-neutral-800">
                                            Nama Website Utama *
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.nama_website}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    nama_website:
                                                        e.target.value,
                                                }))
                                            }
                                            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32] disabled:bg-neutral-50 disabled:text-neutral-500"
                                            disabled={!isSuperAdmin}
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-neutral-800">
                                            Deskripsi SEO Global (Meta
                                            Description) *
                                        </label>
                                        <textarea
                                            value={settings.deskripsi_seo}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    deskripsi_seo:
                                                        e.target.value,
                                                }))
                                            }
                                            rows={3}
                                            className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32] disabled:bg-neutral-50 disabled:text-neutral-500"
                                            maxLength={160}
                                            disabled={!isSuperAdmin}
                                            required
                                        />
                                        <div className="mt-0.5 flex items-center justify-between text-[10px] font-semibold text-neutral-400">
                                            <span>
                                                Batas disarankan untuk deskripsi
                                                Google.
                                            </span>
                                            <span>
                                                {settings.deskripsi_seo.length}{' '}
                                                / 160 Karakter
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-2 grid grid-cols-1 gap-5 md:grid-cols-2">
                                        {/* Logo Branding */}
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-bold text-neutral-800">
                                                Logo Portal Resmi (SVG/PNG/WEBP)
                                            </span>
                                            <div className="border-neutral-150 flex items-center gap-4 rounded-2xl border bg-neutral-50/30 p-4">
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white p-2 shadow-2xs">
                                                    {settings.logo_base64 ? (
                                                        <img
                                                            src={
                                                                settings.logo_base64
                                                            }
                                                            alt="Website Logo"
                                                            className="h-full w-full object-contain"
                                                        />
                                                    ) : (
                                                        <Globe
                                                            className="text-neutral-300"
                                                            size={32}
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                                    <input
                                                        type="file"
                                                        accept=".png,.svg,.jpg,.jpeg,.webp"
                                                        onChange={(e) =>
                                                            handleImageUpload(
                                                                e,
                                                                'logo_base64',
                                                            )
                                                        }
                                                        className="hidden"
                                                        id="logo-uploader-btn"
                                                        disabled={!isSuperAdmin}
                                                    />
                                                    <label
                                                        htmlFor="logo-uploader-btn"
                                                        className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[11px] font-bold shadow-2xs transition-all hover:bg-neutral-50 ${
                                                            !isSuperAdmin
                                                                ? 'cursor-not-allowed opacity-50'
                                                                : ''
                                                        }`}
                                                    >
                                                        <span>Unggah Logo</span>
                                                    </label>
                                                    <span className="text-[9px] leading-normal font-semibold text-neutral-400">
                                                        Max 500 KB, format
                                                        resolusi tinggi
                                                        disarankan.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Favicon Branding */}
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-bold text-neutral-800">
                                                Favicon Shortcut Icon
                                                (.ico/.png)
                                            </span>
                                            <div className="border-neutral-150 flex items-center gap-4 rounded-2xl border bg-neutral-50/30 p-4">
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
                                                    {settings.favicon_base64 ? (
                                                        <img
                                                            src={
                                                                settings.favicon_base64
                                                            }
                                                            alt="Website Favicon"
                                                            className="h-8 w-8 object-contain"
                                                        />
                                                    ) : (
                                                        <Globe
                                                            className="text-neutral-300"
                                                            size={24}
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                                    <input
                                                        type="file"
                                                        accept=".ico,.png,.webp"
                                                        onChange={(e) =>
                                                            handleImageUpload(
                                                                e,
                                                                'favicon_base64',
                                                            )
                                                        }
                                                        className="hidden"
                                                        id="favicon-uploader-btn"
                                                        disabled={!isSuperAdmin}
                                                    />
                                                    <label
                                                        htmlFor="favicon-uploader-btn"
                                                        className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[11px] font-bold shadow-2xs transition-all hover:bg-neutral-50 ${
                                                            !isSuperAdmin
                                                                ? 'cursor-not-allowed opacity-50'
                                                                : ''
                                                        }`}
                                                    >
                                                        <span>
                                                            Unggah Favicon
                                                        </span>
                                                    </label>
                                                    <span className="text-[9px] leading-normal font-semibold text-neutral-400">
                                                        Max 100 KB, rasio kotak
                                                        persegi (e.g. 32x32).
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-end border-t border-neutral-100 pt-4">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#0a6c32] px-5 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#085627] disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={!isSuperAdmin}
                                    >
                                        <Save size={14} />
                                        <span>Simpan Pengaturan Sistem</span>
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* PANEL 4: POPUP PEMBERITAHUAN */}
                        {activeTab === 'pemberitahuan' && (
                            <form
                                onSubmit={handleNotificationSubmit}
                                className="flex flex-col gap-6"
                            >
                                <div>
                                    <h2 className="text-base font-bold text-neutral-900">
                                        Manajemen Popup Pemberitahuan Beranda
                                    </h2>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Konfigurasikan pengumuman visual
                                        (flyer/banner) penting yang akan muncul
                                        secara otomatis saat pengunjung pertama
                                        kali membuka beranda utama.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-5">
                                    {/* Toggle Aktif */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-neutral-800">
                                            Status Popup Pemberitahuan *
                                        </label>
                                        <div className="w-full max-w-[200px]">
                                            <select
                                                value={
                                                    settings.pemberitahuan_aktif ||
                                                    '0'
                                                }
                                                onChange={(e) =>
                                                    setSettings((prev) => ({
                                                        ...prev,
                                                        pemberitahuan_aktif:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs font-bold outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                                required
                                            >
                                                <option value="0">
                                                    Nonaktif (Sembunyikan)
                                                </option>
                                                <option value="1">
                                                    Aktif (Tampilkan)
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Upload Banner */}
                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-neutral-800">
                                            Poster / Flyer Pemberitahuan *
                                        </span>
                                        <div className="border-neutral-150 flex flex-col items-center gap-6 rounded-2xl border bg-neutral-50/30 p-4 md:flex-row">
                                            {/* Preview */}
                                            <div className="flex h-48 w-48 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white p-2 shadow-2xs">
                                                {settings.pemberitahuan_gambar ? (
                                                    <img
                                                        src={
                                                            settings.pemberitahuan_gambar
                                                        }
                                                        alt="Flyer Pemberitahuan"
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <Sparkles
                                                        className="animate-pulse stroke-1 text-neutral-300"
                                                        size={48}
                                                    />
                                                )}
                                            </div>

                                            <div className="flex min-w-0 flex-1 flex-col gap-3">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={
                                                            settings.pemberitahuan_gambar ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            setSettings(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    pemberitahuan_gambar:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                        placeholder="URL Gambar..."
                                                        className="flex-1 rounded-xl border border-neutral-200 bg-white p-3 font-mono text-xs text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setIsPickerOpen(
                                                                true,
                                                            )
                                                        }
                                                        className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100"
                                                    >
                                                        Pilih dari Aset
                                                    </button>
                                                </div>

                                                <div className="space-y-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-neutral-600">
                                                            Unggah Gambar
                                                            Langsung
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={
                                                            handleFlyerFileChange
                                                        }
                                                        className="w-full text-xs text-neutral-500 file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-emerald-700 file:hover:bg-emerald-100"
                                                    />
                                                </div>

                                                {settings.pemberitahuan_gambar && (
                                                    <div className="flex justify-start">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSettings(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        pemberitahuan_gambar:
                                                                            '',
                                                                    }),
                                                                );
                                                                toast.info(
                                                                    'Flyer dihapus dari draf',
                                                                );
                                                            }}
                                                            className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50"
                                                        >
                                                            Hapus Flyer
                                                        </button>
                                                    </div>
                                                )}
                                                <span className="text-[9px] leading-normal font-semibold text-neutral-400">
                                                    Rekomendasi rasio portrait
                                                    atau persegi (e.g.
                                                    800x1000px) agar pas di
                                                    layar. Kompresi otomatis
                                                    akan menyesuaikan ukuran &
                                                    format WebP.
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA Link URL */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-neutral-800">
                                            Tautan URL Pengalihan (CTA Link URL)
                                            - Opsional
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://example.com/halaman-tujuan..."
                                            value={
                                                settings.pemberitahuan_link_url ||
                                                ''
                                            }
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    pemberitahuan_link_url:
                                                        e.target.value,
                                                }))
                                            }
                                            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                        />
                                        <p className="text-[10px] font-medium text-neutral-400">
                                            Jika diisi, poster pemberitahuan
                                            dapat diklik oleh pengguna untuk
                                            mengarah ke URL ini.
                                        </p>
                                    </div>

                                    {/* CTA Button Label */}
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-neutral-800">
                                                Label Tombol Aksi (CTA Button) -
                                                Opsional
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Daftar Sekarang"
                                                value={
                                                    settings.pemberitahuan_tombol_teks ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    setSettings((prev) => ({
                                                        ...prev,
                                                        pemberitahuan_tombol_teks:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                            />
                                            <p className="text-[10px] font-medium text-neutral-400">
                                                Jika diisi, tombol aksi tambahan
                                                akan tampil di bawah flyer di
                                                popup.
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-neutral-800">
                                                Teks Link Deskripsi (Optional
                                                Description Link) - Opsional
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Pelajari lebih lanjut..."
                                                value={
                                                    settings.pemberitahuan_link_teks ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    setSettings((prev) => ({
                                                        ...prev,
                                                        pemberitahuan_link_teks:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                            />
                                            <p className="text-[10px] font-medium text-neutral-400">
                                                Teks bantuan opsional yang
                                                diletakkan di bawah gambar
                                                popup.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-end border-t border-neutral-100 pt-4">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#0a6c32] px-5 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#085627]"
                                    >
                                        <Save size={14} />
                                        <span>
                                            Simpan Pengaturan Pemberitahuan
                                        </span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Asset Picker Modal */}
            <AssetPickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={(url) =>
                    setSettings((prev) => ({
                        ...prev,
                        pemberitahuan_gambar: url,
                    }))
                }
            />

            {/* Image Upload Modal */}
            <ImageUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setSelectedUploadFile(null);
                }}
                file={selectedUploadFile}
                onConfirm={handleUploadConfirm}
                defaultWidth={1200}
                defaultQuality={80}
            />
        </>
    );
}

WebSettingsCMS.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Pengaturan Web',
            href: '/admin/settings',
        },
    ],
};
