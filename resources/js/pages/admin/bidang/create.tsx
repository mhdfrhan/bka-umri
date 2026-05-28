import { Head, Link, router } from '@inertiajs/react';
import {
    Briefcase,
    ArrowLeft,
    Check,
    Info,
    Users,
    Plus,
    Trash2,
    Sliders,
    Sparkles,
    Megaphone,
    Award,
    Image as ImageIcon,
    ArrowUp,
    ArrowDown,
    Upload,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AssetPickerModal } from '@/components/admin/asset-picker-modal';
import { ImageUploadModal } from '@/components/admin/image-upload-modal';

const getSocialUrl = (list: { platform: string; url: string }[] | undefined, platform: string) => {
    const raw = list?.find(item => item.platform === platform)?.url || '';
    if (platform === 'email' && raw.startsWith('mailto:')) {
        return raw.slice(7);
    }
    if (platform === 'instagram' && raw.includes('instagram.com/')) {
        const parts = raw.split('instagram.com/');
        return parts[parts.length - 1].replace(/\/+$/, '');
    }
    return raw;
};

const updateSocialUrl = (list: { platform: string; url: string }[] | undefined, platform: string, val: string) => {
    const newList = [...(list || [])];
    const index = newList.findIndex(item => item.platform === platform);
    
    let formattedUrl = val;
    if (val && platform === 'whatsapp') {
        if (!val.startsWith('http')) {
            let clean = val.replace(/[^0-9+]/g, '');
            if (clean.startsWith('0')) {
                clean = '62' + clean.slice(1);
            } else if (clean.startsWith('+')) {
                clean = clean.slice(1);
            }
            formattedUrl = `https://wa.me/${clean}`;
        }
    } else if (val && platform === 'email') {
        if (!val.startsWith('mailto:')) {
            formattedUrl = `mailto:${val}`;
        }
    } else if (val && platform === 'instagram') {
        let username = val.trim().replace(/^@/, '');
        if (username.includes('instagram.com/')) {
            const parts = username.split('instagram.com/');
            username = parts[parts.length - 1].replace(/\/+$/, '');
        }
        formattedUrl = `https://instagram.com/${username}`;
    }

    if (index > -1) {
        if (val) {
            newList[index] = { platform, url: formattedUrl };
        } else {
            newList.splice(index, 1);
        }
    } else if (val) {
        newList.push({ platform, url: formattedUrl });
    }
    return newList;
};

export default function CreateBidang() {
    // Current Active Tab for dividing the complex form
    const [activeTab, setActiveTab] = useState<
        'info' | 'kepala' | 'anggota' | 'cta'
    >('info');

    // Modals & Upload State
    const [assetPickerTarget, setAssetPickerTarget] = useState<
        'banner' | 'kepala' | number | null
    >(null);
    const [uploadTarget, setUploadTarget] = useState<
        'banner' | 'kepala' | number | null
    >(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange =
        (target: 'banner' | 'kepala' | number) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];

            if (!file) {
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                toast.error('File gambar melebihi batas 10MB!');

                return;
            }

            setSelectedFile(file);
            setUploadTarget(target);
            e.target.value = '';
        };

    const handleSelectAsset = (url: string) => {
        if (assetPickerTarget === 'banner') {
            setBannerUrl(url);
        } else if (assetPickerTarget === 'kepala') {
            setKepalaFoto(url);
        } else if (typeof assetPickerTarget === 'number') {
            handleAnggotaChange(assetPickerTarget, 'foto', url);
        }

        setAssetPickerTarget(null);
    };

    // ────────────────────────────────────────────────────────
    // FORM STATE
    // ────────────────────────────────────────────────────────
    const [nama, setNama] = useState('');
    const [slug, setSlug] = useState('');
    const [deskripsiSingkat, setDeskripsiSingkat] = useState('');
    const [deskripsiLengkap, setDeskripsiLengkap] = useState('');
    const [bannerUrl, setBannerUrl] = useState(
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
    );

    // Kepala Bagian Urusan
    const [kepalaNama, setKepalaNama] = useState('');
    const [kepalaJabatan, setKepalaJabatan] = useState('');
    const [kepalaFoto, setKepalaFoto] = useState(
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    );
    const [kepalaTugas, setKepalaTugas] = useState('');

    // Kepala Bagian Media Sosial
    const [kepalaWa, setKepalaWa] = useState('');
    const [kepalaEmail, setKepalaEmail] = useState('');
    const [kepalaLinkedin, setKepalaLinkedin] = useState('');
    const [kepalaInstagram, setKepalaInstagram] = useState('');

    // Anggota Staf Repeater list
    const [anggotaList, setAnggotaList] = useState<
        { nama: string; jabatan: string; foto?: string; media_sosial?: { platform: string; url: string }[] }[]
    >([{ nama: '', jabatan: '', foto: '', media_sosial: [] }]);

    // CTA (Call to Action) Aksen
    const [ctaHeading, setCtaHeading] = useState('');
    const [ctaSub, setCtaSub] = useState('');
    const [ctaBtnText, setCtaBtnText] = useState('Hubungi Kami');
    const [ctaBtnUrl, setCtaBtnUrl] = useState('');

    // ────────────────────────────────────────────────────────
    // AUTO SLUG GENERATION
    // ────────────────────────────────────────────────────────
    const handleNamaChange = (val: string) => {
        setNama(val);
        // Clean slug: lowercase, replace spaces & special chars with dash
        const generatedSlug = val
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        setSlug(generatedSlug);
    };

    // ────────────────────────────────────────────────────────
    // ANGGOTA REPEATER ACTIONS
    // ────────────────────────────────────────────────────────
    const handleAddAnggota = () => {
        if (anggotaList.length >= 20) {
            toast.warning('Maksimal 20 anggota staf divisi tercapai!');

            return;
        }

        setAnggotaList((prev) => [...prev, { nama: '', jabatan: '', foto: '' }]);
    };

    const handleRemoveAnggota = (idx: number) => {
        setAnggotaList((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleAnggotaChange = (
        idx: number,
        field: 'nama' | 'jabatan' | 'foto',
        val: string,
    ) => {
        setAnggotaList((prev) =>
            prev.map((item, i) =>
                i === idx ? { ...item, [field]: val } : item,
            ),
        );
    };

    const handleMoveAnggota = (idx: number, direction: 'up' | 'down') => {
        if (direction === 'up' && idx === 0) {
            return;
        }

        if (direction === 'down' && idx === anggotaList.length - 1) {
            return;
        }

        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        const newAnggota = [...anggotaList];
        const temp = newAnggota[idx];
        newAnggota[idx] = newAnggota[targetIdx];
        newAnggota[targetIdx] = temp;
        setAnggotaList(newAnggota);
    };

    // ────────────────────────────────────────────────────────
    // SUBMIT SAVING
    // ────────────────────────────────────────────────────────
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // VALIDATIONS
        if (!nama.trim()) {
            setActiveTab('info');
            toast.error('Nama Bidang wajib diisi!');

            return;
        }

        if (!slug.trim()) {
            setActiveTab('info');
            toast.error('Slug Bidang wajib diisi!');

            return;
        }

        if (!deskripsiSingkat.trim()) {
            setActiveTab('info');
            toast.error('Deskripsi Singkat wajib diisi!');

            return;
        }

        if (!kepalaNama.trim() || !kepalaJabatan.trim()) {
            setActiveTab('kepala');
            toast.error('Nama dan Jabatan Kepala Bagian wajib diisi!');

            return;
        }

        // Clean up empty members
        const cleanedAnggota = anggotaList.filter(
            (item) => item.nama.trim() && item.jabatan.trim(),
        );

        // Send data to backend
        router.post(
            '/admin/bidang',
            {
                nama,
                slug,
                deskripsiSingkat,
                deskripsiLengkap,
                bannerUrl,
                kepalaNama,
                kepalaJabatan,
                kepalaFoto,
                kepalaTugas,
                kepalaWa,
                kepalaEmail,
                kepalaLinkedin,
                kepalaInstagram,
                anggota: cleanedAnggota,
                ctaHeading,
                ctaSub,
                ctaBtnText,
                ctaBtnUrl,
            },
            {
                onSuccess: () => {
                    toast.success(`Bidang "${nama}" berhasil didaftarkan!`);
                },
                onError: (errs) => {
                    const firstError = Object.values(errs)[0];
                    toast.error(firstError || 'Gagal menyimpan bidang.');
                },
            },
        );
    };

    return (
        <>
            <Head title="Tambah Bidang BKA" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center">
                    <div>
                        <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-neutral-400">
                            <Link
                                href="/admin/bidang"
                                className="flex items-center gap-1 transition-colors select-none hover:text-emerald-700"
                            >
                                <ArrowLeft className="size-4" />
                                Kembali ke Daftar
                            </Link>
                        </div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-neutral-800">
                            <Briefcase className="size-6 text-emerald-600" />
                            Tambah Bidang Kelembagaan
                        </h1>
                        <p className="mt-1 text-sm leading-relaxed font-light text-neutral-500">
                            Buat departemen baru di bawah BKA dengan form
                            terstruktur. Isilah data bidang secara komprehensif.
                        </p>
                    </div>
                    {/* Header Save Button */}
                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            type="submit"
                            form="bidang-form"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all outline-none hover:bg-emerald-700 active:scale-95"
                        >
                            <Check className="size-4" />
                            Simpan Bidang
                        </button>
                    </div>
                </div>

                {/* Form Shell */}
                <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-[20%_1fr]">
                    {/* Multi-Tab Navigation Panel */}
                    <div className="flex w-full shrink-0 scrollbar-none flex-row gap-1.5 overflow-x-auto pb-2 select-none lg:w-full lg:flex-col lg:pb-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab('info')}
                            className={`flex w-full shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-wide whitespace-nowrap transition-all outline-none ${
                                activeTab === 'info'
                                    ? 'rounded-l-none rounded-r-xl border-l-[3px] border-emerald-600 bg-emerald-50 pl-3 text-emerald-800 shadow-xs'
                                    : 'text-neutral-500 hover:bg-neutral-100/70 hover:text-neutral-900'
                            }`}
                        >
                            <Sliders className="size-4.5 shrink-0" />
                            <span>1. Info Dasar Bidang</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('kepala')}
                            className={`flex w-full shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-wide whitespace-nowrap transition-all outline-none ${
                                activeTab === 'kepala'
                                    ? 'rounded-l-none rounded-r-xl border-l-[3px] border-emerald-600 bg-emerald-50 pl-3 text-emerald-800 shadow-xs'
                                    : 'text-neutral-500 hover:bg-neutral-100/70 hover:text-neutral-900'
                            }`}
                        >
                            <Award className="size-4.5 shrink-0" />
                            <span>2. Kepala Divisi / Bagian</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('anggota')}
                            className={`flex w-full shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-wide whitespace-nowrap transition-all outline-none ${
                                activeTab === 'anggota'
                                    ? 'rounded-l-none rounded-r-xl border-l-[3px] border-emerald-600 bg-emerald-50 pl-3 text-emerald-800 shadow-xs'
                                    : 'text-neutral-500 hover:bg-neutral-100/70 hover:text-neutral-900'
                            }`}
                        >
                            <Users className="size-4.5 shrink-0" />
                            <span>3. Anggota Staf ({anggotaList.length})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('cta')}
                            className={`flex w-full shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-wide whitespace-nowrap transition-all outline-none ${
                                activeTab === 'cta'
                                    ? 'rounded-l-none rounded-r-xl border-l-[3px] border-emerald-600 bg-emerald-50 pl-3 text-emerald-800 shadow-xs'
                                    : 'text-neutral-500 hover:bg-neutral-100/70 hover:text-neutral-900'
                            }`}
                        >
                            <Megaphone className="size-4.5 shrink-0" />
                            <span>4. Call to Action (CTA)</span>
                        </button>

                        {/* Save Button Sidebar (Desktop) */}
                        <div className="hidden lg:mt-6 lg:block">
                            <button
                                type="submit"
                                form="bidang-form"
                                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md transition-all outline-none hover:bg-emerald-700 active:scale-95"
                            >
                                <Check className="size-4" />
                                Simpan Bidang
                            </button>
                        </div>
                    </div>

                    {/* Active Form Content */}
                    <form
                        id="bidang-form"
                        onSubmit={handleSubmit}
                        className="w-full min-w-0 space-y-6"
                    >
                        {/* TAB 1: INFORMASI BIDANG */}
                        {activeTab === 'info' && (
                            <div className="w-full space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                                <div className="border-b border-neutral-100 pb-4">
                                    <h2 className="flex items-center gap-1.5 text-base font-bold tracking-tight text-neutral-800">
                                        <Sliders className="size-5 text-emerald-600" />
                                        Informasi Dasar Bidang
                                    </h2>
                                    <p className="mt-0.5 text-sm font-light text-neutral-400">
                                        Berikan penamaan bidang yang jelas serta
                                        penjelasan tugas deskriptif publik.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {/* Nama Bidang */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-neutral-700">
                                            Nama Bidang Organisasi
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={100}
                                            value={nama}
                                            onChange={(e) =>
                                                handleNamaChange(e.target.value)
                                            }
                                            placeholder="Contoh: Bidang Pengadaan & Logistik Aset"
                                            className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                        />
                                    </div>

                                    {/* Slug (Auto-generated) */}
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1 text-sm font-semibold text-neutral-700">
                                            Slug URL (Unik)
                                            <span className="text-xs font-normal text-neutral-400">
                                                (Auto-generated)
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={slug}
                                            onChange={(e) =>
                                                setSlug(
                                                    e.target.value
                                                        .toLowerCase()
                                                        .replace(/\s+/g, '-'),
                                                )
                                            }
                                            placeholder="contoh: pengadaan-logistik"
                                            className="w-full rounded-xl border border-neutral-200 bg-white p-3 font-mono text-sm text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                        />
                                    </div>
                                </div>

                                {/* Deskripsi Singkat */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm font-semibold text-neutral-700">
                                        <label>
                                            Deskripsi Singkat Halaman Depan
                                        </label>
                                        <span className="text-xs font-light text-neutral-400">
                                            {deskripsiSingkat.length} / 200
                                            karakter
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        maxLength={200}
                                        value={deskripsiSingkat}
                                        onChange={(e) =>
                                            setDeskripsiSingkat(e.target.value)
                                        }
                                        placeholder="Tulis ringkasan singkat 1-2 kalimat untuk kartu depan..."
                                        className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm text-neutral-700 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    />
                                </div>

                                {/* Deskripsi Lengkap */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm font-semibold text-neutral-700">
                                        <label>
                                            Deskripsi Detail Halaman Profil
                                        </label>
                                        <span className="text-xs font-light text-neutral-400">
                                            {deskripsiLengkap.length} / 2000
                                            karakter
                                        </span>
                                    </div>
                                    <textarea
                                        rows={6}
                                        maxLength={2000}
                                        value={deskripsiLengkap}
                                        onChange={(e) =>
                                            setDeskripsiLengkap(e.target.value)
                                        }
                                        placeholder="Jelaskan secara komprehensif wewenang, alur tugas, serta kontribusi divisi ini bagi kemajuan civitas akademika UMRI..."
                                        className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm leading-relaxed text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    />
                                </div>

                                {/* Banner Gambar */}
                                <div className="space-y-1.5">
                                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                        <label className="text-sm font-bold text-neutral-700">
                                            Gambar Banner Latar (Rasio 16:9)
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setAssetPickerTarget(
                                                        'banner',
                                                    )
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
                                                    onChange={handleFileChange(
                                                        'banner',
                                                    )}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={bannerUrl}
                                        onChange={(e) =>
                                            setBannerUrl(e.target.value)
                                        }
                                        placeholder="Contoh: https://images.unsplash.com/... atau dari unggahan"
                                        className="w-full rounded-xl border border-neutral-200 bg-white p-3 font-mono text-sm text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    />
                                    {bannerUrl.trim() && (
                                        <div className="mt-2 size-24 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 select-none">
                                            <img
                                                src={bannerUrl}
                                                alt="Preview Banner"
                                                className="size-full object-cover"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Buttons footer */}
                                <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                                    <span className="flex items-center gap-1 text-sm text-neutral-400">
                                        <Info className="size-4 text-neutral-400" />
                                        Isi data kepala divisi selanjutnya di
                                        Tab 2.
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('kepala')}
                                        className="inline-flex items-center gap-1 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition-all outline-none hover:bg-neutral-800"
                                    >
                                        Lanjut ke Kepala Urusan
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: KEPALA BAGIAN */}
                        {activeTab === 'kepala' && (
                            <div className="w-full space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                                <div className="border-b border-neutral-100 pb-4">
                                    <h2 className="flex items-center gap-1.5 text-base font-bold tracking-tight text-neutral-800">
                                        <Award className="size-5 text-emerald-600" />
                                        Kepala Divisi / Bagian Urusan
                                    </h2>
                                    <p className="mt-0.5 text-sm font-light text-neutral-400">
                                        Lengkapi profil pimpinan tertinggi dari
                                        unit kerja operasional bidang ini.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {/* Nama Kepala */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-neutral-700">
                                            Nama Lengkap & Gelar
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={100}
                                            value={kepalaNama}
                                            onChange={(e) =>
                                                setKepalaNama(e.target.value)
                                            }
                                            placeholder="Contoh: Heni Marlina, S.Ak."
                                            className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                        />
                                    </div>

                                    {/* Jabatan Resmi */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-neutral-700">
                                            Jabatan Resmi
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={100}
                                            value={kepalaJabatan}
                                            onChange={(e) =>
                                                setKepalaJabatan(e.target.value)
                                            }
                                            placeholder="Contoh: Kepala Urusan Keuangan & Pembiayaan"
                                            className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-medium text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
                                    {/* Foto URL input */}
                                    <div className="space-y-1.5 md:col-span-9">
                                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                            <label className="text-sm font-bold text-neutral-700">
                                                Foto Profil Kepala (Rasio 3:4
                                                atau 1:1)
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setAssetPickerTarget(
                                                            'kepala',
                                                        )
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
                                                        onChange={handleFileChange(
                                                            'kepala',
                                                        )}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            value={kepalaFoto}
                                            onChange={(e) =>
                                                setKepalaFoto(e.target.value)
                                            }
                                            placeholder="Contoh: https://images.unsplash.com/... atau dari unggahan"
                                            className="w-full rounded-xl border border-neutral-200 bg-white p-3 font-mono text-sm text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                        />
                                    </div>

                                    {/* Foto Preview */}
                                    <div className="flex justify-center self-end md:col-span-3">
                                        <div className="size-24 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 shadow-inner select-none">
                                            <img
                                                src={kepalaFoto}
                                                alt="Preview Foto Kepala"
                                                className="size-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Deskripsi Tugas Kepala */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm font-semibold text-neutral-700">
                                        <label>
                                            Deskripsi Tugas & Wewenang Kepala
                                        </label>
                                        <span className="text-xs font-light text-neutral-400">
                                            {kepalaTugas.length} / 500 karakter
                                        </span>
                                    </div>
                                    <textarea
                                        rows={4}
                                        maxLength={500}
                                        value={kepalaTugas}
                                        onChange={(e) =>
                                            setKepalaTugas(e.target.value)
                                        }
                                        placeholder="Jabarkan lingkup wewenang jabatan, tanggung jawab koordinasi, dan tugas pemantauan berkala..."
                                        className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm leading-relaxed text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    />
                                </div>

                                {/* Media Sosial Kepala (Opsional) */}
                                <div className="border-t border-neutral-100 pt-5 mt-5">
                                    <h3 className="text-sm font-bold text-neutral-800 mb-3 flex items-center gap-1.5">
                                        <Sparkles className="size-4 text-emerald-600" />
                                        Media Sosial Kepala Bagian (Opsional)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-neutral-600">WhatsApp (Nomor atau Link)</label>
                                            <input
                                                type="text"
                                                value={kepalaWa}
                                                onChange={(e) => setKepalaWa(e.target.value)}
                                                placeholder="Contoh: 08123456789 atau https://wa.me/..."
                                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-neutral-600">Email Address</label>
                                            <input
                                                type="email"
                                                value={kepalaEmail}
                                                onChange={(e) => setKepalaEmail(e.target.value)}
                                                placeholder="Contoh: nama@umri.ac.id"
                                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-neutral-600">LinkedIn URL</label>
                                            <input
                                                type="text"
                                                value={kepalaLinkedin}
                                                onChange={(e) => setKepalaLinkedin(e.target.value)}
                                                placeholder="Contoh: https://linkedin.com/in/username"
                                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-neutral-600">Instagram URL</label>
                                            <input
                                                type="text"
                                                value={kepalaInstagram}
                                                onChange={(e) => setKepalaInstagram(e.target.value)}
                                                placeholder="Contoh: https://instagram.com/username"
                                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons footer */}
                                <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('info')}
                                        className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-600 transition-all outline-none hover:bg-neutral-50"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('anggota')}
                                        className="inline-flex items-center gap-1 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition-all outline-none hover:bg-neutral-800"
                                    >
                                        Lanjut ke Anggota Staf
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: ANGGOTA STAF */}
                        {activeTab === 'anggota' && (
                            <div className="w-full space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                                <div className="flex flex-col justify-between gap-3 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center">
                                    <div>
                                        <h2 className="flex items-center gap-1.5 text-base font-bold tracking-tight text-neutral-800">
                                            <Users className="size-5 text-emerald-600" />
                                            Daftar Anggota Staf
                                        </h2>
                                        <p className="mt-0.5 text-sm font-light text-neutral-400">
                                            Kelola data anggota pelaksana di
                                            unit kerja ini. Maksimal 20 staf.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddAnggota}
                                        disabled={anggotaList.length >= 20}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all outline-none hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Plus className="size-4" />
                                        Tambah Anggota Staf
                                    </button>
                                </div>

                                {/* Staf Repeater list */}
                                <div className="space-y-4">
                                    {anggotaList.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="group relative flex flex-col items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50/40 p-4 md:flex-row"
                                        >
                                            {/* Action Delete */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveAnggota(idx)
                                                }
                                                className="absolute top-3 right-3 rounded-lg border border-red-50 bg-white p-1.5 text-red-500 transition-all outline-none hover:border-red-100 hover:bg-red-50"
                                                title="Hapus Staf"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>

                                            {/* Order Arrow indicator */}
                                            <div className="flex shrink-0 items-center justify-center gap-1 border-r border-neutral-200/50 pr-2 md:flex-col">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleMoveAnggota(
                                                            idx,
                                                            'up',
                                                        )
                                                    }
                                                    disabled={idx === 0}
                                                    className="rounded p-1 outline-none hover:bg-neutral-100 disabled:opacity-30"
                                                >
                                                    <ArrowUp className="size-4 text-neutral-500" />
                                                </button>
                                                <span className="text-neutral-450 font-mono text-xs font-extrabold uppercase select-none">
                                                    staf #{idx + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleMoveAnggota(
                                                            idx,
                                                            'down',
                                                        )
                                                    }
                                                    disabled={
                                                        idx ===
                                                        anggotaList.length - 1
                                                    }
                                                    className="rounded p-1 outline-none hover:bg-neutral-100 disabled:opacity-30"
                                                >
                                                    <ArrowDown className="size-4 text-neutral-500" />
                                                </button>
                                            </div>

                                            {/* Foto Staf */}
                                            <div className="flex flex-col items-center gap-2 shrink-0 md:border-r md:border-neutral-200/50 md:pr-4">
                                                <div className="size-16 overflow-hidden rounded-full border border-neutral-200 bg-neutral-50 select-none shadow-inner">
                                                    <img
                                                        src={item.foto || 'https://placehold.co/80x80/E8F5E9/1B5E20?text=Staf'}
                                                        alt="Foto Staf"
                                                        className="size-full object-cover"
                                                        onError={(e) => {
                                                            (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/80x80/E8F5E9/1B5E20?text=Staf';
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setAssetPickerTarget(idx)}
                                                        className="rounded-lg bg-white border border-neutral-200 p-1.5 text-neutral-600 hover:text-emerald-700 shadow-3xs hover:bg-neutral-50"
                                                        title="Pilih dari Aset"
                                                    >
                                                        <ImageIcon className="size-3.5" />
                                                    </button>
                                                    <label className="cursor-pointer rounded-lg bg-emerald-600 p-1.5 text-white hover:bg-emerald-700 shadow-3xs flex items-center justify-center">
                                                        <Upload className="size-3.5" />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={handleFileChange(idx)}
                                                        />
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Fields */}
                                            <div className="w-full flex-1 space-y-3 pt-4 md:pt-0">
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-semibold text-neutral-500 uppercase">
                                                            Nama Lengkap Staf
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={item.nama}
                                                            onChange={(e) =>
                                                                handleAnggotaChange(
                                                                    idx,
                                                                    'nama',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            placeholder="Contoh: Rika Amalia"
                                                            className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-semibold text-neutral-500 uppercase">
                                                            Jabatan / Peran Staf
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={item.jabatan}
                                                            onChange={(e) =>
                                                                handleAnggotaChange(
                                                                    idx,
                                                                    'jabatan',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            placeholder="Contoh: Staf Kasir & Pelayanan Pembayaran"
                                                            className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-sm text-neutral-700 transition-all outline-none focus:border-emerald-600"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Medsos Staf (Optional Inputs) */}
                                                <div className="border-t border-neutral-200/55 pt-2.5 mt-2">
                                                    <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Media Sosial Staf (Opsional)</div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                                                        <div>
                                                            <input
                                                                type="text"
                                                                value={getSocialUrl(item.media_sosial, 'whatsapp')}
                                                                onChange={(e) => {
                                                                    const updated = updateSocialUrl(item.media_sosial, 'whatsapp', e.target.value);
                                                                    handleAnggotaChange(idx, 'media_sosial' as any, updated as any);
                                                                }}
                                                                placeholder="WhatsApp (cth: 0812...)"
                                                                className="w-full rounded-lg border border-neutral-200 bg-white p-2 text-xs text-neutral-750 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                                            />
                                                        </div>
                                                        <div>
                                                            <input
                                                                type="text"
                                                                value={getSocialUrl(item.media_sosial, 'email')}
                                                                onChange={(e) => {
                                                                    const updated = updateSocialUrl(item.media_sosial, 'email', e.target.value);
                                                                    handleAnggotaChange(idx, 'media_sosial' as any, updated as any);
                                                                }}
                                                                placeholder="Email (cth: a@b.com)"
                                                                className="w-full rounded-lg border border-neutral-200 bg-white p-2 text-xs text-neutral-750 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                                            />
                                                        </div>
                                                        <div>
                                                            <input
                                                                type="text"
                                                                value={getSocialUrl(item.media_sosial, 'linkedin')}
                                                                onChange={(e) => {
                                                                    const updated = updateSocialUrl(item.media_sosial, 'linkedin', e.target.value);
                                                                    handleAnggotaChange(idx, 'media_sosial' as any, updated as any);
                                                                }}
                                                                placeholder="LinkedIn URL"
                                                                className="w-full rounded-lg border border-neutral-200 bg-white p-2 text-xs text-neutral-755 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                                            />
                                                        </div>
                                                        <div>
                                                            <input
                                                                type="text"
                                                                value={getSocialUrl(item.media_sosial, 'instagram')}
                                                                onChange={(e) => {
                                                                    const updated = updateSocialUrl(item.media_sosial, 'instagram', e.target.value);
                                                                    handleAnggotaChange(idx, 'media_sosial' as any, updated as any);
                                                                }}
                                                                placeholder="Instagram URL"
                                                                className="w-full rounded-lg border border-neutral-200 bg-white p-2 text-xs text-neutral-755 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {anggotaList.length === 0 && (
                                        <div className="rounded-2xl border-2 border-dashed border-neutral-100 py-10 text-center">
                                            <Users className="mx-auto mb-2.5 size-10 animate-pulse text-neutral-300" />
                                            <h3 className="text-sm font-semibold text-neutral-700">
                                                Belum Ada Anggota Divisi
                                            </h3>
                                            <p className="mx-auto mt-1 max-w-xs text-xs text-neutral-400">
                                                Klik "Tambah Anggota Staf" untuk
                                                mendaftarkan staf operasional
                                                bidang ini.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Buttons footer */}
                                <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('kepala')}
                                        className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-600 transition-all outline-none hover:bg-neutral-50"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('cta')}
                                        className="inline-flex items-center gap-1 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition-all outline-none hover:bg-neutral-800"
                                    >
                                        Lanjut ke Call to Action (CTA)
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: CALL TO ACTION */}
                        {activeTab === 'cta' && (
                            <div className="w-full space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                                <div className="border-b border-neutral-100 pb-4">
                                    <h2 className="flex items-center gap-1.5 text-base font-bold tracking-tight text-neutral-800">
                                        <Megaphone className="size-5 text-emerald-600" />
                                        Aksi / Promosi Divisi (CTA — Opsional)
                                    </h2>
                                    <p className="mt-0.5 text-sm font-light text-neutral-400">
                                        Konfigurasi panel iklan kecil (banner
                                        ajakan) di bagian bawah profil bidang.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {/* Heading CTA */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-neutral-700">
                                            Heading CTA (Judul Ajakan Besar)
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={100}
                                            value={ctaHeading}
                                            onChange={(e) =>
                                                setCtaHeading(e.target.value)
                                            }
                                            placeholder="Contoh: Butuh Bantuan Administrasi Keuangan?"
                                            className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                        />
                                    </div>

                                    {/* Sub Heading CTA */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-neutral-700">
                                            Deskripsi Sub-CTA (Penjelasan
                                            Tambahan)
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={100}
                                            value={ctaSub}
                                            onChange={(e) =>
                                                setCtaSub(e.target.value)
                                            }
                                            placeholder="Contoh: Hubungi helpdesk keuangan BKA atau pelajari berkas panduan online."
                                            className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm text-neutral-700 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {/* Teks Tombol */}
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-neutral-700">
                                                Teks Tombol Aksi
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={30}
                                                value={ctaBtnText}
                                                onChange={(e) =>
                                                    setCtaBtnText(
                                                        e.target.value,
                                                    )
                                                }
                                                className="text-neutral-850 w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                            />
                                        </div>

                                        {/* Link Tautan */}
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-neutral-700">
                                                Tautan Tujuan Tombol (URL Valid)
                                            </label>
                                            <input
                                                type="text"
                                                value={ctaBtnUrl}
                                                onChange={(e) =>
                                                    setCtaBtnUrl(e.target.value)
                                                }
                                                placeholder="Contoh: /kontak atau https://..."
                                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 font-mono text-sm text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons footer */}
                                <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('anggota')}
                                        className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-600 transition-all outline-none hover:bg-neutral-50"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all outline-none hover:bg-emerald-700 active:scale-95"
                                    >
                                        <Check className="size-4" />
                                        Simpan Bidang Baru
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <AssetPickerModal
                isOpen={assetPickerTarget !== null}
                onClose={() => setAssetPickerTarget(null)}
                onSelect={handleSelectAsset}
            />

            <ImageUploadModal
                isOpen={uploadTarget !== null && selectedFile !== null}
                onClose={() => {
                    setSelectedFile(null);
                    setUploadTarget(null);
                }}
                file={selectedFile}
                onConfirm={(result) => {
                    if (uploadTarget === 'banner') {
                        setBannerUrl(result.base64);
                        toast.success(
                            'Gambar banner berhasil diunggah & dioptimasi!',
                        );
                    } else if (uploadTarget === 'kepala') {
                        setKepalaFoto(result.base64);
                        toast.success(
                            'Foto kepala divisi berhasil diunggah & dioptimasi!',
                        );
                    } else if (typeof uploadTarget === 'number') {
                        handleAnggotaChange(uploadTarget, 'foto', result.base64);
                        toast.success(
                            'Foto anggota staf berhasil diunggah & dioptimasi!',
                        );
                    }

                    setSelectedFile(null);
                    setUploadTarget(null);
                }}
                defaultWidth={uploadTarget === 'banner' ? 1200 : 600}
                defaultQuality={uploadTarget === 'banner' ? 80 : 75}
            />
        </>
    );
}

// Layout Breadcrumbs Setup for top admin bar
CreateBidang.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Kelola Bidang',
            href: '/admin/bidang',
        },
        {
            title: 'Tambah Bidang',
            href: '/admin/bidang/create',
        },
    ],
};
