import { useState } from 'react';
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
    Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { AssetPickerModal } from '@/components/admin/asset-picker-modal';
import { ImageUploadModal } from '@/components/admin/image-upload-modal';

export default function CreateBidang() {
    // Current Active Tab for dividing the complex form
    const [activeTab, setActiveTab] = useState<'info' | 'kepala' | 'anggota' | 'cta'>('info');

    // Modals & Upload State
    const [assetPickerTarget, setAssetPickerTarget] = useState<'banner' | 'kepala' | null>(null);
    const [uploadTarget, setUploadTarget] = useState<'banner' | 'kepala' | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (target: 'banner' | 'kepala') => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

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
    const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800');

    // Kepala Bagian Urusan
    const [kepalaNama, setKepalaNama] = useState('');
    const [kepalaJabatan, setKepalaJabatan] = useState('');
    const [kepalaFoto, setKepalaFoto] = useState('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80');
    const [kepalaTugas, setKepalaTugas] = useState('');

    // Anggota Staf Repeater list
    const [anggotaList, setAnggotaList] = useState<{ nama: string; jabatan: string }[]>([
        { nama: '', jabatan: '' }
    ]);

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
        setAnggotaList(prev => [...prev, { nama: '', jabatan: '' }]);
    };

    const handleRemoveAnggota = (idx: number) => {
        setAnggotaList(prev => prev.filter((_, i) => i !== idx));
    };

    const handleAnggotaChange = (idx: number, field: 'nama' | 'jabatan', val: string) => {
        setAnggotaList(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
    };

    const handleMoveAnggota = (idx: number, direction: 'up' | 'down') => {
        if (direction === 'up' && idx === 0) return;
        if (direction === 'down' && idx === anggotaList.length - 1) return;

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
        const cleanedAnggota = anggotaList.filter(item => item.nama.trim() && item.jabatan.trim());

        // Construct new item
        const stored = localStorage.getItem('bka_bidangs');
        let bidangsList = [];
        if (stored) {
            try {
                bidangsList = JSON.parse(stored);
            } catch (err) {
                bidangsList = [];
            }
        }

        // Check if slug is unique
        const isSlugTaken = bidangsList.some((b: any) => b.slug === slug);
        if (isSlugTaken) {
            setActiveTab('info');
            toast.error('Slug sudah digunakan! Silakan ganti slug Anda.');
            return;
        }

        const newBidang = {
            id: Date.now().toString(),
            nama,
            slug,
            deskripsiSingkat,
            deskripsiLengkap,
            urutan: bidangsList.length + 1,
            kepalaBagian: {
                nama: kepalaNama,
                jabatan: kepalaJabatan,
                foto: kepalaFoto,
                deskripsiTugas: kepalaTugas
            },
            anggota: cleanedAnggota,
            cta: ctaHeading.trim() ? {
                heading: ctaHeading,
                subCta: ctaSub,
                btnText: ctaBtnText,
                btnUrl: ctaBtnUrl
            } : undefined
        };

        const updated = [...bidangsList, newBidang];
        localStorage.setItem('bka_bidangs', JSON.stringify(updated));
        
        toast.success(`Bidang "${nama}" berhasil didaftarkan!`);
        
        // Return back using Inertia routing visit
        router.visit('/admin/bidang');
    };

    return (
        <>
            <Head title="Tambah Bidang BKA" />

            <div className="p-6 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-neutral-400 font-semibold mb-1">
                            <Link href="/admin/bidang" className="hover:text-emerald-700 flex items-center gap-1 transition-colors select-none">
                                <ArrowLeft className="size-4" />
                                Kembali ke Daftar
                            </Link>
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-800 flex items-center gap-2">
                            <Briefcase className="size-6 text-emerald-600" />
                            Tambah Bidang Kelembagaan
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1 font-light leading-relaxed">
                            Buat departemen baru di bawah BKA dengan form terstruktur. Isilah data bidang secara komprehensif.
                        </p>
                    </div>
                </div>

                {/* Form Shell */}
                <div className="grid w-full grid-cols-1 gap-8 items-start lg:grid-cols-[28%_1fr]">
                    {/* Multi-Tab Navigation Panel */}
                    <div className="w-full lg:w-full flex flex-row lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none shrink-0 select-none">
                        <button
                            type="button"
                            onClick={() => setActiveTab('info')}
                            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all outline-none text-left w-full shrink-0 whitespace-nowrap ${
                                activeTab === 'info'
                                    ? "bg-emerald-50 text-emerald-800 border-l-[3px] border-emerald-600 rounded-r-xl rounded-l-none pl-3 shadow-xs"
                                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/70"
                            }`}
                        >
                            <Sliders className="size-4.5 shrink-0" />
                            <span>1. Info Dasar Bidang</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('kepala')}
                            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all outline-none text-left w-full shrink-0 whitespace-nowrap ${
                                activeTab === 'kepala'
                                    ? "bg-emerald-50 text-emerald-800 border-l-[3px] border-emerald-600 rounded-r-xl rounded-l-none pl-3 shadow-xs"
                                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/70"
                            }`}
                        >
                            <Award className="size-4.5 shrink-0" />
                            <span>2. Kepala Divisi / Bagian</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('anggota')}
                            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all outline-none text-left w-full shrink-0 whitespace-nowrap ${
                                activeTab === 'anggota'
                                    ? "bg-emerald-50 text-emerald-800 border-l-[3px] border-emerald-600 rounded-r-xl rounded-l-none pl-3 shadow-xs"
                                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/70"
                            }`}
                        >
                            <Users className="size-4.5 shrink-0" />
                            <span>3. Anggota Staf ({anggotaList.length})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('cta')}
                            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all outline-none text-left w-full shrink-0 whitespace-nowrap ${
                                activeTab === 'cta'
                                    ? "bg-emerald-50 text-emerald-800 border-l-[3px] border-emerald-600 rounded-r-xl rounded-l-none pl-3 shadow-xs"
                                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/70"
                            }`}
                        >
                            <Megaphone className="size-4.5 shrink-0" />
                            <span>4. Call to Action (CTA)</span>
                        </button>
                    </div>

                    {/* Active Form Content */}
                    <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-6">
                        {/* TAB 1: INFORMASI BIDANG */}
                        {activeTab === 'info' && (
                            <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 md:p-8 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-6 w-full">
                                <div className="border-b border-neutral-100 pb-4">
                                    <h2 className="text-base font-bold text-neutral-800 tracking-tight flex items-center gap-1.5">
                                        <Sliders className="size-5 text-emerald-600" />
                                        Informasi Dasar Bidang
                                    </h2>
                                    <p className="text-sm text-neutral-400 font-light mt-0.5">Berikan penamaan bidang yang jelas serta penjelasan tugas deskriptif publik.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Nama Bidang */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-neutral-700">Nama Bidang Organisasi</label>
                                        <input
                                            type="text"
                                            maxLength={100}
                                            value={nama}
                                            onChange={(e) => handleNamaChange(e.target.value)}
                                            placeholder="Contoh: Bidang Pengadaan & Logistik Aset"
                                            className="w-full text-sm p-3 border border-neutral-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all font-semibold text-neutral-800 bg-white"
                                        />
                                    </div>

                                    {/* Slug (Auto-generated) */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1">
                                            Slug URL (Unik)
                                            <span className="text-xs font-normal text-neutral-400">(Auto-generated)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                            placeholder="contoh: pengadaan-logistik"
                                            className="w-full text-sm p-3 border border-neutral-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all font-mono text-neutral-600 bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Deskripsi Singkat */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm font-semibold text-neutral-700">
                                        <label>Deskripsi Singkat Halaman Depan</label>
                                        <span className="text-xs text-neutral-400 font-light">{deskripsiSingkat.length} / 200 karakter</span>
                                    </div>
                                    <input
                                        type="text"
                                        maxLength={200}
                                        value={deskripsiSingkat}
                                        onChange={(e) => setDeskripsiSingkat(e.target.value)}
                                        placeholder="Tulis ringkasan singkat 1-2 kalimat untuk kartu depan..."
                                        className="w-full text-sm p-3 border border-neutral-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all text-neutral-700 bg-white"
                                    />
                                </div>

                                {/* Deskripsi Lengkap */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm font-semibold text-neutral-700">
                                        <label>Deskripsi Detail Halaman Profil</label>
                                        <span className="text-xs text-neutral-400 font-light">{deskripsiLengkap.length} / 2000 karakter</span>
                                    </div>
                                    <textarea
                                        rows={6}
                                        maxLength={2000}
                                        value={deskripsiLengkap}
                                        onChange={(e) => setDeskripsiLengkap(e.target.value)}
                                        placeholder="Jelaskan secara komprehensif wewenang, alur tugas, serta kontribusi divisi ini bagi kemajuan civitas akademika UMRI..."
                                        className="w-full text-sm p-3 border border-neutral-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all leading-relaxed text-neutral-600 bg-white"
                                    />
                                </div>

                                {/* Banner Gambar */}
                                <div className="space-y-1.5">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                        <label className="text-sm font-bold text-neutral-700">Gambar Banner Latar (Rasio 16:9)</label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setAssetPickerTarget('banner')}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 hover:text-emerald-700 shadow-xs"
                                            >
                                                <ImageIcon className="size-3" />
                                                Pilih dari Aset
                                            </button>
                                            <label className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs cursor-pointer">
                                                <Upload className="size-3" />
                                                Unggah Langsung
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleFileChange('banner')}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={bannerUrl}
                                        onChange={(e) => setBannerUrl(e.target.value)}
                                        placeholder="Contoh: https://images.unsplash.com/... atau dari unggahan"
                                        className="w-full text-sm p-3 border border-neutral-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all font-mono text-neutral-600 bg-white"
                                    />
                                    {bannerUrl.trim() && (
                                        <div className="size-24 rounded-lg overflow-hidden border border-neutral-200 mt-2 bg-neutral-50 select-none">
                                            <img src={bannerUrl} alt="Preview Banner" className="size-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                {/* Buttons footer */}
                                <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                                    <span className="text-sm text-neutral-400 flex items-center gap-1">
                                        <Info className="size-4 text-neutral-400" />
                                        Isi data kepala divisi selanjutnya di Tab 2.
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('kepala')}
                                        className="inline-flex items-center gap-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm px-4 py-2.5 transition-all outline-none"
                                    >
                                        Lanjut ke Kepala Urusan
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: KEPALA BAGIAN */}
                        {activeTab === 'kepala' && (
                            <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 md:p-8 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-6 w-full">
                                <div className="border-b border-neutral-100 pb-4">
                                    <h2 className="text-base font-bold text-neutral-800 tracking-tight flex items-center gap-1.5">
                                        <Award className="size-5 text-emerald-600" />
                                        Kepala Divisi / Bagian Urusan
                                    </h2>
                                    <p className="text-sm text-neutral-400 font-light mt-0.5">Lengkapi profil pimpinan tertinggi dari unit kerja operasional bidang ini.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Nama Kepala */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-neutral-700">Nama Lengkap & Gelar</label>
                                        <input
                                            type="text"
                                            maxLength={100}
                                            value={kepalaNama}
                                            onChange={(e) => setKepalaNama(e.target.value)}
                                            placeholder="Contoh: Heni Marlina, S.Ak."
                                            className="w-full text-sm p-3 border border-neutral-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all font-semibold text-neutral-800 bg-white"
                                        />
                                    </div>

                                    {/* Jabatan Resmi */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-neutral-700">Jabatan Resmi</label>
                                        <input
                                            type="text"
                                            maxLength={100}
                                            value={kepalaJabatan}
                                            onChange={(e) => setKepalaJabatan(e.target.value)}
                                            placeholder="Contoh: Kepala Urusan Keuangan & Pembiayaan"
                                            className="w-full text-sm p-3 border border-neutral-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all font-medium text-neutral-800 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                    {/* Foto URL input */}
                                    <div className="md:col-span-9 space-y-1.5">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                            <label className="text-sm font-bold text-neutral-700">Foto Profil Kepala (Rasio 3:4 atau 1:1)</label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setAssetPickerTarget('kepala')}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 hover:text-emerald-700 shadow-xs"
                                                >
                                                    <ImageIcon className="size-3" />
                                                    Pilih dari Aset
                                                </button>
                                                <label className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs cursor-pointer">
                                                    <Upload className="size-3" />
                                                    Unggah Langsung
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleFileChange('kepala')}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            value={kepalaFoto}
                                            onChange={(e) => setKepalaFoto(e.target.value)}
                                            placeholder="Contoh: https://images.unsplash.com/... atau dari unggahan"
                                            className="w-full text-sm p-3 border border-neutral-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all font-mono text-neutral-600 bg-white"
                                        />
                                    </div>

                                    {/* Foto Preview */}
                                    <div className="md:col-span-3 flex justify-center self-end">
                                        <div className="size-24 rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50 shadow-inner select-none">
                                            <img src={kepalaFoto} alt="Preview Foto Kepala" className="size-full object-cover" />
                                        </div>
                                    </div>
                                </div>

                                {/* Deskripsi Tugas Kepala */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm font-semibold text-neutral-700">
                                        <label>Deskripsi Tugas & Wewenang Kepala</label>
                                        <span className="text-xs text-neutral-400 font-light">{kepalaTugas.length} / 500 karakter</span>
                                    </div>
                                    <textarea
                                        rows={4}
                                        maxLength={500}
                                        value={kepalaTugas}
                                        onChange={(e) => setKepalaTugas(e.target.value)}
                                        placeholder="Jabarkan lingkup wewenang jabatan, tanggung jawab koordinasi, dan tugas pemantauan berkala..."
                                        className="w-full text-sm p-3 border border-neutral-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all leading-relaxed text-neutral-600 bg-white"
                                    />
                                </div>

                                {/* Buttons footer */}
                                <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('info')}
                                        className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 text-neutral-600 font-semibold text-sm px-4 py-2.5 hover:bg-neutral-50 transition-all outline-none bg-white"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('anggota')}
                                        className="inline-flex items-center gap-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm px-4 py-2.5 transition-all outline-none"
                                    >
                                        Lanjut ke Anggota Staf
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: ANGGOTA STAF */}
                        {activeTab === 'anggota' && (
                            <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 md:p-8 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-6 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                                    <div>
                                        <h2 className="text-base font-bold text-neutral-800 tracking-tight flex items-center gap-1.5">
                                            <Users className="size-5 text-emerald-600" />
                                            Daftar Anggota Staf
                                        </h2>
                                        <p className="text-sm text-neutral-400 font-light mt-0.5">Kelola data anggota pelaksana di unit kerja ini. Maksimal 20 staf.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddAnggota}
                                        disabled={anggotaList.length >= 20}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-3.5 py-2 transition-all shadow-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="size-4" />
                                        Tambah Anggota Staf
                                    </button>
                                </div>

                                {/* Staf Repeater list */}
                                <div className="space-y-4">
                                    {anggotaList.map((item, idx) => (
                                        <div key={idx} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/40 relative flex flex-col md:flex-row gap-4 items-center group">
                                            {/* Action Delete */}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAnggota(idx)}
                                                className="absolute top-3 right-3 p-1.5 rounded-lg border border-red-50 text-red-500 hover:bg-red-50 hover:border-red-100 transition-all outline-none bg-white"
                                                title="Hapus Staf"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>

                                            {/* Order Arrow indicator */}
                                            <div className="flex md:flex-col gap-1 items-center justify-center shrink-0 pr-2 border-r border-neutral-200/50">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveAnggota(idx, 'up')}
                                                    disabled={idx === 0}
                                                    className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 outline-none"
                                                >
                                                    <ArrowUp className="size-4 text-neutral-500" />
                                                </button>
                                                <span className="text-xs font-extrabold text-neutral-450 font-mono select-none uppercase">
                                                    staf #{idx + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveAnggota(idx, 'down')}
                                                    disabled={idx === anggotaList.length - 1}
                                                    className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 outline-none"
                                                >
                                                    <ArrowDown className="size-4 text-neutral-500" />
                                                </button>
                                            </div>

                                            {/* Fields */}
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-4 md:pt-0">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-neutral-500 uppercase">Nama Lengkap Staf</label>
                                                    <input
                                                        type="text"
                                                        value={item.nama}
                                                        onChange={(e) => handleAnggotaChange(idx, 'nama', e.target.value)}
                                                        placeholder="Contoh: Rika Amalia"
                                                        className="w-full text-sm p-2.5 border border-neutral-200 bg-white rounded-lg focus:border-emerald-600 outline-none transition-all font-semibold text-neutral-800"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-neutral-500 uppercase">Jabatan / Peran Staf</label>
                                                    <input
                                                        type="text"
                                                        value={item.jabatan}
                                                        onChange={(e) => handleAnggotaChange(idx, 'jabatan', e.target.value)}
                                                        placeholder="Contoh: Staf Kasir & Pelayanan Pembayaran"
                                                        className="w-full text-sm p-2.5 border border-neutral-200 bg-white rounded-lg focus:border-emerald-600 outline-none transition-all text-neutral-700"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {anggotaList.length === 0 && (
                                        <div className="text-center py-10 border-2 border-dashed border-neutral-100 rounded-2xl">
                                            <Users className="size-10 mx-auto mb-2.5 text-neutral-300 animate-pulse" />
                                            <h3 className="font-semibold text-neutral-700 text-sm">Belum Ada Anggota Divisi</h3>
                                            <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                                                Klik "Tambah Anggota Staf" untuk mendaftarkan staf operasional bidang ini.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Buttons footer */}
                                <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('kepala')}
                                        className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 text-neutral-600 font-semibold text-sm px-4 py-2.5 hover:bg-neutral-50 transition-all outline-none bg-white"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('cta')}
                                        className="inline-flex items-center gap-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm px-4 py-2.5 transition-all outline-none"
                                    >
                                        Lanjut ke Call to Action (CTA)
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: CALL TO ACTION */}
                        {activeTab === 'cta' && (
                            <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 md:p-8 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-6 w-full">
                                <div className="border-b border-neutral-100 pb-4">
                                    <h2 className="text-base font-bold text-neutral-800 tracking-tight flex items-center gap-1.5">
                                        <Megaphone className="size-5 text-emerald-600" />
                                        Aksi / Promosi Divisi (CTA — Opsional)
                                    </h2>
                                    <p className="text-sm text-neutral-400 font-light mt-0.5">Konfigurasi panel iklan kecil (banner ajakan) di bagian bawah profil bidang.</p>
                                </div>

                                <div className="space-y-4">
                                    {/* Heading CTA */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-neutral-700">Heading CTA (Judul Ajakan Besar)</label>
                                        <input
                                            type="text"
                                            maxLength={100}
                                            value={ctaHeading}
                                            onChange={(e) => setCtaHeading(e.target.value)}
                                            placeholder="Contoh: Butuh Bantuan Administrasi Keuangan?"
                                            className="w-full text-sm p-3 border border-neutral-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all font-semibold text-neutral-800 bg-white"
                                        />
                                    </div>

                                    {/* Sub Heading CTA */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-neutral-700">Deskripsi Sub-CTA (Penjelasan Tambahan)</label>
                                        <input
                                            type="text"
                                            maxLength={100}
                                            value={ctaSub}
                                            onChange={(e) => setCtaSub(e.target.value)}
                                            placeholder="Contoh: Hubungi helpdesk keuangan BKA atau pelajari berkas panduan online."
                                            className="w-full text-sm p-3 border border-neutral-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all text-neutral-700 bg-white"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Teks Tombol */}
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-neutral-700">Teks Tombol Aksi</label>
                                            <input
                                                type="text"
                                                maxLength={30}
                                                value={ctaBtnText}
                                                onChange={(e) => setCtaBtnText(e.target.value)}
                                                className="w-full text-sm p-3 border border-neutral-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all text-neutral-850 text-neutral-800 bg-white"
                                            />
                                        </div>

                                        {/* Link Tautan */}
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-neutral-700">Tautan Tujuan Tombol (URL Valid)</label>
                                            <input
                                                type="text"
                                                value={ctaBtnUrl}
                                                onChange={(e) => setCtaBtnUrl(e.target.value)}
                                                placeholder="Contoh: /kontak atau https://..."
                                                className="w-full text-sm p-3 border border-neutral-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all font-mono text-neutral-600 bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons footer */}
                                <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('anggota')}
                                        className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 text-neutral-600 font-semibold text-sm px-4 py-2.5 hover:bg-neutral-50 transition-all outline-none bg-white"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 transition-all shadow-md active:scale-95 outline-none"
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
                        toast.success('Gambar banner berhasil diunggah & dioptimasi!');
                    } else if (uploadTarget === 'kepala') {
                        setKepalaFoto(result.base64);
                        toast.success('Foto kepala divisi berhasil diunggah & dioptimasi!');
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
