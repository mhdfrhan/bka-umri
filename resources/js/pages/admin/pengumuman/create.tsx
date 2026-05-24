import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Megaphone, ArrowLeft, Save, Globe, Image as ImageIcon, Paperclip, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { AssetPickerModal } from '@/components/admin/asset-picker-modal';
import { ImageUploadModal } from '@/components/admin/image-upload-modal';
import { formatFileSize } from '@/lib/format-file-size';
import { optimizeFile } from '@/lib/image-optimizer';

interface Attachment {
    name: string;
    url: string;
    size: number;
    extension: string;
}

export default function TambahPengumuman() {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'draf' | 'terpublikasi' | 'diarsipkan'>('draf');
    const [isPenting, setIsPenting] = useState(false);
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80');
    
    // Attachments State
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    
    // Modal Asset Picker
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    
    // Direct Upload Optimization Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSlugEdited, setIsSlugEdited] = useState(false);

    // Auto-slug generator
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

    // Direct Image Upload & Compression
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
        toast.success('Gambar cover pengumuman berhasil diunggah & dioptimasi!');
    };

    // Direct Attachment File Upload
    const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (attachments.length + files.length > 3) {
            toast.error('Maksimal lampiran adalah 3 berkas!');
            return;
        }

        const newAttachments = [...attachments];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Limit 10MB
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File "${file.name}" melebihi batas 10MB!`);
                continue;
            }

            try {
                const result = await optimizeFile(file);
                newAttachments.push({
                    name: result.name,
                    url: result.base64,
                    size: result.size,
                    extension: result.extension
                });
            } catch (err) {
                toast.error(`Gagal memuat berkas "${file.name}"`);
            }
        }

        setAttachments(newAttachments);
        toast.success('Lampiran berhasil ditambahkan.');
        e.target.value = '';
    };

    // Delete Attachment
    const handleDeleteAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, idx) => idx !== index));
    };

    // Form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validations
        if (title.trim().length < 10) {
            toast.error('Judul pengumuman minimal harus 10 karakter!');
            return;
        }
        if (!slug.trim()) {
            toast.error('Slug URL wajib diisi!');
            return;
        }
        if (content.replace(/<[^>]*>/g, '').trim().length < 20) {
            toast.error('Isi pengumuman minimal harus 20 karakter!');
            return;
        }

        setIsSaving(true);

        try {
            const saved = localStorage.getItem('bka_pengumuman');
            const list = saved ? JSON.parse(saved) : [];

            // Slug uniqueness
            if (list.some((a: any) => a.slug === slug)) {
                toast.error('Slug URL sudah digunakan! Ubah secara manual.');
                setIsSaving(false);
                return;
            }

            const nextId = list.length > 0 ? Math.max(...list.map((a: any) => a.id)) + 1 : 1;
            const newAnnouncement = {
                id: nextId,
                title: title.trim(),
                slug: slug.trim(),
                content: content.trim(),
                excerpt: content.replace(/<[^>]*>/g, '').slice(0, 160) + '...',
                date: date || new Date().toISOString().split('T')[0],
                author: 'Admin BKA',
                status,
                isPenting,
                thumbnail,
                attachments
            };

            const updatedList = [newAnnouncement, ...list];
            localStorage.setItem('bka_pengumuman', JSON.stringify(updatedList));

            toast.success(`Pengumuman "${title}" berhasil dibuat!`);
            router.visit('/admin/pengumuman');
        } catch {
            toast.error('Gagal menyimpan pengumuman.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Head title="Tambah Pengumuman Baru - Admin BKA" />

            <div className="mx-auto w-full max-w-3xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-neutral-400 font-semibold mb-1">
                            <Link href="/admin/pengumuman" className="hover:text-emerald-700 flex items-center gap-1 transition-colors select-none">
                                <ArrowLeft className="size-4" />
                                Kembali ke Daftar
                            </Link>
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-800 flex items-center gap-2">
                            <Megaphone className="size-6 text-emerald-600" />
                            Tambah Pengumuman Baru
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1 font-light leading-relaxed">
                            Terbitkan pengumuman penting akademik, prosedur keuangan, atau edaran administrasi kampus.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8 space-y-5">
                        
                        {/* Judul */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-neutral-700">Judul Pengumuman</label>
                                <span className={`text-xs ${title.length < 10 ? 'text-red-500' : 'text-neutral-400'}`}>
                                    {title.length} / 200 karakter (min 10)
                                </span>
                            </div>
                            <input
                                type="text"
                                maxLength={200}
                                required
                                value={title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Contoh: Jadwal Pembayaran Uang Kuliah Semester Ganjil TA 2026/2027"
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                        </div>

                        {/* Slug URL */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1">
                                <Globe className="size-4 text-neutral-400" />
                                Slug URL Pengumuman
                                <span className="text-xs font-normal text-neutral-400">(Auto-generated / Editable)</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={slug}
                                onChange={(e) => handleSlugChange(e.target.value)}
                                placeholder="contoh: jadwal-pembayaran-uang-kuliah"
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 font-mono text-sm text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                        </div>

                        {/* Status, Tanggal, & Penting */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-colors focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                >
                                    <option value="draf">Draf</option>
                                    <option value="terpublikasi">Terpublikasi</option>
                                    <option value="diarsipkan">Diarsipkan</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700">Tanggal Rilis</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer select-none border border-neutral-200 rounded-xl px-4 py-2 mt-6">
                                <input
                                    type="checkbox"
                                    checked={isPenting}
                                    onChange={(e) => setIsPenting(e.target.checked)}
                                    className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 size-4 cursor-pointer"
                                />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-neutral-700">Tandai Penting</span>
                                    <span className="text-[10px] text-neutral-400">Tampil pin di atas.</span>
                                </div>
                            </label>
                        </div>

                        {/* Image Thumbnail with picker integration */}
                        <div className="space-y-3 pt-2">
                            <label className="text-sm font-semibold text-neutral-700 block">Gambar Cover Pengumuman (Opsional)</label>
                            
                            <div className="flex flex-col md:flex-row gap-4 items-start">
                                {/* Image input and selection buttons */}
                                <div className="flex-1 space-y-3 w-full">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={thumbnail}
                                            onChange={(e) => setThumbnail(e.target.value)}
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
                                        src={thumbnail} 
                                        alt="Pratinjau Cover" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80';
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Rich Content Editor */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-neutral-700">Konten Pengumuman</label>
                                <span className="text-xs text-neutral-400 font-medium">Minimal 20 karakter</span>
                            </div>
                            <RichTextEditor
                                value={content}
                                onChange={setContent}
                                className="border-neutral-200 focus-within:border-emerald-600 focus-within:ring-emerald-600/20"
                            />
                        </div>

                        {/* Attachments Repeater Upload */}
                        <div className="space-y-3 pt-3 border-t border-neutral-100">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1">
                                    <Paperclip className="size-4 text-neutral-500" />
                                    Lampiran Berkas ({attachments.length} / 3)
                                </label>
                                <span className="text-[10px] font-bold text-neutral-400">PDF / Word / Excel, maks 10MB</span>
                            </div>

                            {/* Direct attachments picker */}
                            {attachments.length < 3 && (
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.docx,.xlsx,.pptx"
                                    onChange={handleAttachmentUpload}
                                    className="w-full text-xs text-neutral-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-neutral-100 file:text-neutral-700 file:hover:bg-neutral-200"
                                />
                            )}

                            {/* Attachment list */}
                            {attachments.length > 0 && (
                                <div className="space-y-2 pt-1">
                                    {attachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 bg-neutral-50/50">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="text-[9px] font-extrabold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded shadow-sm">
                                                    {file.extension}
                                                </div>
                                                <span className="text-xs font-bold text-neutral-800 truncate" title={file.name}>
                                                    {file.name}
                                                </span>
                                                <span className="text-[10px] text-neutral-400 font-semibold">({formatFileSize(file.size)})</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteAttachment(idx)}
                                                className="p-1 rounded hover:bg-red-50 text-red-600"
                                                title="Hapus Lampiran"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href="/admin/pengumuman"
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
                            {isSaving ? 'Menyimpan...' : 'Simpan Pengumuman'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Asset Picker Modal */}
            <AssetPickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
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
        </>
    );
}

TambahPengumuman.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Kelola Pengumuman',
            href: '/admin/pengumuman',
        },
        {
            title: 'Tambah Pengumuman',
            href: '/admin/pengumuman/create',
        },
    ],
};
