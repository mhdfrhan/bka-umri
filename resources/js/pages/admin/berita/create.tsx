import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Newspaper,
    ArrowLeft,
    Save,
    Globe,
    Image as ImageIcon,
    Upload,
    Sliders,
} from 'lucide-react';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { AssetPickerModal } from '@/components/admin/asset-picker-modal';
import { ImageUploadModal } from '@/components/admin/image-upload-modal';

const DEFAULT_CATEGORIES = [
    'Kegiatan',
    'Layanan',
    'Mitra',
    'Prestasi',
    'Aturan',
];

export default function TambahBerita() {
    const [categories, setCategories] = useState<string[]>([]);

    // Form States
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [category, setCategory] = useState('');
    const [thumbnail, setThumbnail] = useState(
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    );
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<
        'draf' | 'terpublikasi' | 'diarsipkan'
    >('draf');
    const [date, setDate] = useState(
        () => new Date().toISOString().split('T')[0],
    );
    const [isSaving, setIsSaving] = useState(false);

    // Asset Picker Modal State
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

    // Direct Upload Optimization Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(
        null,
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File gambar melebihi batas 10MB!');
            return;
        }

        setSelectedUploadFile(file);
        setIsUploadModalOpen(true);
        e.target.value = '';
    };

    const handleUploadConfirm = (result: { base64: string }) => {
        setThumbnail(result.base64);
        toast.success('Gambar cover berhasil diunggah & dioptimasi!');
    };

    // Is slug edited manually?
    const [isSlugEdited, setIsSlugEdited] = useState(false);

    // Load categories
    useEffect(() => {
        const savedCategories = localStorage.getItem('bka_categories');
        if (savedCategories) {
            try {
                const parsed = JSON.parse(savedCategories);
                setCategories(parsed);
                if (parsed.length > 0) setCategory(parsed[0]);
            } catch (e) {
                setCategories(DEFAULT_CATEGORIES);
                setCategory(DEFAULT_CATEGORIES[0]);
            }
        } else {
            setCategories(DEFAULT_CATEGORIES);
            setCategory(DEFAULT_CATEGORIES[0]);
        }
    }, []);

    // Auto-slug generator
    const handleTitleChange = (val: string) => {
        setTitle(val);
        if (!isSlugEdited) {
            const generated = val
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // remove special characters
                .replace(/\s+/g, '-') // replace spaces with dashes
                .replace(/-+/g, '-'); // remove redundant dashes
            setSlug(generated);
        }
    };

    const handleSlugChange = (val: string) => {
        setIsSlugEdited(true);
        const cleaned = val
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        setSlug(cleaned);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validations
        if (title.trim().length < 10) {
            toast.error('Judul berita minimal harus 10 karakter!');
            return;
        }
        if (!slug.trim()) {
            toast.error('Slug URL wajib diisi!');
            return;
        }
        if (!thumbnail.trim()) {
            toast.error('URL gambar cover/thumbnail wajib diisi!');
            return;
        }
        if (content.replace(/<[^>]*>/g, '').trim().length < 50) {
            toast.error('Isi berita minimal harus 50 karakter!');
            return;
        }

        setIsSaving(true);

        try {
            const savedNews = localStorage.getItem('bka_berita');
            let newsList = [];
            if (savedNews) {
                try {
                    newsList = JSON.parse(savedNews);
                } catch {
                    newsList = [];
                }
            }

            // Slug uniqueness check
            const isSlugTaken = newsList.some((n: any) => n.slug === slug);
            if (isSlugTaken) {
                toast.error(
                    'Slug URL sudah digunakan artikel lain! Ubah slug secara manual.',
                );
                setIsSaving(false);
                return;
            }

            const nextId =
                newsList.length > 0
                    ? Math.max(...newsList.map((n: any) => n.id)) + 1
                    : 1;
            const newArticle = {
                id: nextId,
                title: title.trim(),
                slug: slug.trim(),
                category: category || 'Tanpa Kategori',
                thumbnail: thumbnail.trim(),
                content: content.trim(),
                excerpt: content.replace(/<[^>]*>/g, '').slice(0, 160) + '...',
                date: date || new Date().toISOString().split('T')[0],
                author: 'Admin BKA',
                status,
            };

            const updatedList = [newArticle, ...newsList];
            localStorage.setItem('bka_berita', JSON.stringify(updatedList));

            toast.success(`Berita "${title}" berhasil diterbitkan!`);
            router.visit('/admin/berita');
        } catch (error) {
            toast.error('Gagal memproses berita.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Head title="Tambah Berita Baru - BKA UMRI" />

            <div className="mx-auto w-full max-w-3xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center">
                    <div>
                        <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-neutral-400">
                            <Link
                                href="/admin/berita"
                                className="flex items-center gap-1 transition-colors select-none hover:text-emerald-700"
                            >
                                <ArrowLeft className="size-4" />
                                Kembali ke Daftar
                            </Link>
                        </div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-neutral-800">
                            <Newspaper className="size-6 text-emerald-600" />
                            Tambah Berita Baru
                        </h1>
                        <p className="mt-1 text-sm leading-relaxed font-light text-neutral-500">
                            Buat tulisan berita, laporan kegiatan, atau info
                            pengumuman administrasi baru.
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-5 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                        {/* Judul Berita */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-neutral-700">
                                    Judul Berita
                                </label>
                                <span
                                    className={`text-xs ${title.length < 10 ? 'text-red-500' : 'text-neutral-400'}`}
                                >
                                    {title.length} / 200 karakter (min 10)
                                </span>
                            </div>
                            <input
                                type="text"
                                maxLength={200}
                                required
                                value={title}
                                onChange={(e) =>
                                    handleTitleChange(e.target.value)
                                }
                                placeholder="Contoh: Sosialisasi Pengajuan Beasiswa Mahasiswa UMRI 2026"
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                        </div>

                        {/* Slug URL */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1 text-sm font-semibold text-neutral-700">
                                <Globe className="size-4 text-neutral-400" />
                                Slug URL Artikel
                                <span className="text-xs font-normal text-neutral-400">
                                    (Auto-generated / Editable)
                                </span>
                            </label>
                            <input
                                type="text"
                                required
                                value={slug}
                                onChange={(e) =>
                                    handleSlugChange(e.target.value)
                                }
                                placeholder="contoh: sosialisasi-pengajuan-beasiswa"
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 font-mono text-sm text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                        </div>

                        {/* Kategori & Status (Grid) */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700">
                                    Kategori Artikel
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-colors focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                >
                                    {categories.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                    <option value="Tanpa Kategori">
                                        Tanpa Kategori
                                    </option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700">
                                    Status Publikasi
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) =>
                                        setStatus(e.target.value as any)
                                    }
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-colors focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                >
                                    <option value="draf">
                                        Draf (Disimpan Intern)
                                    </option>
                                    <option value="terpublikasi">
                                        Terpublikasi (Tampil Publik)
                                    </option>
                                    <option value="diarsipkan">
                                        Diarsipkan (Disembunyikan)
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* Tanggal Rilis Berita */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700">
                                Tanggal Rilis Berita
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                        </div>

                        {/* Cover Image & Upload Section */}
                        <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/30 p-5">
                            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                                <label className="flex items-center gap-2 text-sm font-bold text-neutral-700">
                                    <ImageIcon className="size-4 text-emerald-600" />
                                    Gambar Cover Berita (Rasio 16:9)
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsAssetModalOpen(true)
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
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Manual URL input fallback */}
                            <div className="space-y-1">
                                <input
                                    type="text"
                                    placeholder="Atau masukkan URL gambar di sini..."
                                    value={thumbnail}
                                    onChange={(e) =>
                                        setThumbnail(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 font-mono text-xs text-neutral-600 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                                />
                            </div>

                            {/* Thumbnail preview */}
                            {thumbnail && (
                                <div className="space-y-1.5 border-t border-neutral-100 pt-2">
                                    <label className="block text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                        Preview Gambar Cover
                                    </label>
                                    <div className="group relative flex aspect-video max-w-md items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50/50">
                                        <img
                                            src={thumbnail}
                                            alt="Preview Cover"
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLImageElement
                                                ).src =
                                                    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <AssetPickerModal
                            isOpen={isAssetModalOpen}
                            onClose={() => setIsAssetModalOpen(false)}
                            onSelect={setThumbnail}
                        />

                        <ImageUploadModal
                            isOpen={isUploadModalOpen}
                            onClose={() => {
                                setIsUploadModalOpen(false);
                                setSelectedUploadFile(null);
                            }}
                            file={selectedUploadFile}
                            onConfirm={handleUploadConfirm}
                        />

                        {/* Editor Konten */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-neutral-700">
                                    Isi Konten Berita
                                </label>
                                <span className="text-xs font-medium text-neutral-400">
                                    Minimal 50 karakter
                                </span>
                            </div>
                            <RichTextEditor
                                value={content}
                                onChange={setContent}
                                className="border-neutral-200 focus-within:border-emerald-600 focus-within:ring-emerald-600/20"
                            />
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href="/admin/berita"
                            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-98 disabled:opacity-50"
                        >
                            <Save className="size-4" />
                            {isSaving ? 'Menyimpan...' : 'Simpan Berita'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

TambahBerita.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Kelola Berita',
            href: '/admin/berita',
        },
        {
            title: 'Tambah Berita',
            href: '/admin/berita/create',
        },
    ],
};
