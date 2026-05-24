import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Images, ArrowLeft, Save, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { AssetPickerModal } from '@/components/admin/asset-picker-modal';
import { ImageUploadModal } from '@/components/admin/image-upload-modal';
import { formatFileSize } from '@/lib/format-file-size';

export default function TambahAlbum() {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80');

    // Picker states
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSlugEdited, setIsSlugEdited] = useState(false);

    // Auto-slug
    const handleTitleChange = (val: string) => {
        setTitle(val);
        if (!isSlugEdited) {
            const generated = val
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
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

    // Upload & optimize cover image
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
        setCoverUrl(result.base64);
        toast.success('Cover album berhasil diunggah & dioptimasi!');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (title.trim().length < 5) {
            toast.error('Judul album minimal harus 5 karakter!');
            return;
        }
        if (!slug.trim()) {
            toast.error('Slug URL wajib diisi!');
            return;
        }

        setIsSaving(true);

        try {
            const saved = localStorage.getItem('bka_albums');
            const list = saved ? JSON.parse(saved) : [];

            if (list.some((a: any) => a.slug === slug)) {
                toast.error('Slug URL sudah digunakan! Ubah secara manual.');
                setIsSaving(false);
                return;
            }

            const nextId = list.length > 0 ? Math.max(...list.map((a: any) => a.id)) + 1 : 1;
            const newAlbum = {
                id: nextId,
                title: title.trim(),
                slug: slug.trim(),
                description: description.trim(),
                date,
                coverUrl,
                photos: []
            };

            const updatedList = [newAlbum, ...list];
            localStorage.setItem('bka_albums', JSON.stringify(updatedList));

            toast.success(`Album "${title}" berhasil dibuat! Silakan kelola foto di halaman edit.`);
            router.visit('/admin/dokumentasi');
        } catch {
            toast.error('Gagal menyimpan album.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Head title="Tambah Album Baru - Admin BKA" />

            <div className="mx-auto w-full max-w-3xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-neutral-400 font-semibold mb-1">
                            <Link href="/admin/dokumentasi" className="hover:text-emerald-700 flex items-center gap-1 transition-colors select-none">
                                <ArrowLeft className="size-4" />
                                Kembali ke Daftar
                            </Link>
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-800 flex items-center gap-2">
                            <Images className="size-6 text-emerald-600" />
                            Tambah Album Dokumentasi Baru
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1 font-light leading-relaxed">
                            Buat folder album untuk merangkum foto-foto liputan sarana prasarana, rapat kerja, dan kegiatan BKA.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8 space-y-5">
                        
                        {/* Judul */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700">Judul Album</label>
                            <input
                                type="text"
                                maxLength={150}
                                required
                                value={title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Contoh: Kunjungan Evaluasi LLDIKTI Wilayah X"
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                        </div>

                        {/* Slug URL */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1">
                                <Globe className="size-4 text-neutral-400" />
                                Slug URL Album
                                <span className="text-xs font-normal text-neutral-400">(Auto-generated / Editable)</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={slug}
                                onChange={(e) => handleSlugChange(e.target.value)}
                                placeholder="contoh: kunjungan-evaluasi-lldikti"
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 font-mono text-sm text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                        </div>

                        {/* Tanggal & Deskripsi */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5 md:col-span-1">
                                <label className="text-sm font-semibold text-neutral-700">Tanggal Kegiatan</label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-semibold text-neutral-700">Deskripsi Singkat (Maks 500 Karakter)</label>
                                <textarea
                                    maxLength={500}
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Rangkuman singkat isi album liputan kegiatan ini..."
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 resize-none"
                                />
                            </div>
                        </div>

                        {/* Foto Sampul */}
                        <div className="space-y-3 pt-2">
                            <label className="text-sm font-semibold text-neutral-700 block">Foto Sampul Album (Rasio 16:9)</label>
                            
                            <div className="flex flex-col md:flex-row gap-4 items-start">
                                <div className="flex-1 space-y-3 w-full">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={coverUrl}
                                            onChange={(e) => setCoverUrl(e.target.value)}
                                            placeholder="URL Gambar..."
                                            className="flex-1 rounded-xl border border-neutral-200 bg-white p-3 text-xs font-mono text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setIsPickerOpen(true)}
                                            className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-100"
                                        >
                                            Pilih dari Aset
                                        </button>
                                    </div>

                                    {/* Upload directly with WebP compression options */}
                                    <div className="border border-dashed border-neutral-200 rounded-xl p-4 space-y-3 bg-neutral-50/50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-neutral-600">Unggah Gambar Langsung</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="w-full text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 file:hover:bg-emerald-100"
                                        />
                                    </div>
                                </div>

                                {/* Preview container */}
                                <div className="aspect-video w-full md:w-56 rounded-xl border border-neutral-200/60 overflow-hidden bg-neutral-100 flex items-center justify-center">
                                    <img 
                                        src={coverUrl} 
                                        alt="Pratinjau Cover" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/800x450/E8F5E9/1B5E20?text=Album+BKA';
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href="/admin/dokumentasi"
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
                            {isSaving ? 'Menyimpan...' : 'Simpan Album'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Asset Picker Modal */}
            <AssetPickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={setCoverUrl}
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
        </>
    );
}

TambahAlbum.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Kelola Dokumentasi',
            href: '/admin/dokumentasi',
        },
        {
            title: 'Tambah Album',
            href: '/admin/dokumentasi/create',
        },
    ],
};
