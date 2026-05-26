import { Head, Link, useForm } from '@inertiajs/react';
import {
    Megaphone,
    ArrowLeft,
    Save,
    Globe,
    Image as ImageIcon,
    Paperclip,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AssetPickerModal } from '@/components/admin/asset-picker-modal';
import { ImageUploadModal } from '@/components/admin/image-upload-modal';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { formatFileSize } from '@/lib/format-file-size';
import { optimizeFile } from '@/lib/image-optimizer';

interface Attachment {
    name: string;
    url: string;
    size: number;
    extension: string;
}

interface AnnouncementItem {
    id: number;
    title: string;
    slug: string;
    content: string;
    status: 'draf' | 'terpublikasi' | 'diarsipkan';
    isPenting: boolean;
    date: string;
    thumbnail: string;
    attachments: Attachment[];
}

interface EditPengumumanProps {
    announcement: AnnouncementItem;
}

export default function EditPengumuman({ announcement }: EditPengumumanProps) {
    const { data, setData, post, processing, errors } = useForm({
        judul: announcement.title || '',
        slug: announcement.slug || '',
        status: announcement.status || 'draf',
        is_penting: announcement.isPenting || false,
        tanggal_publikasi: announcement.date || '',
        thumbnail: announcement.thumbnail || '',
        isi: announcement.content || '',
        attachments: announcement.attachments || [],
        _method: 'PUT',
    });

    // Modal Asset Picker
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    // Direct Upload Optimization Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(
        null,
    );
    const [isSlugEdited, setIsSlugEdited] = useState(true);

    // Auto-slug generator
    const handleTitleChange = (val: string) => {
        if (!isSlugEdited) {
            const generated = val
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');

            setData((prevData) => ({
                ...prevData,
                judul: val,
                slug: generated,
            }));
        } else {
            setData('judul', val);
        }
    };

    const handleSlugChange = (val: string) => {
        setIsSlugEdited(true);
        const cleaned = val
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        setData('slug', cleaned);
    };

    // Direct Image Upload & Compression
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setData('thumbnail', result.base64);
        toast.success(
            'Gambar cover pengumuman berhasil diunggah & dioptimasi!',
        );
    };

    // Direct Attachment File Upload
    const handleAttachmentUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const files = e.target.files;

        if (!files || files.length === 0) {
            return;
        }

        if (data.attachments.length + files.length > 3) {
            toast.error('Maksimal lampiran adalah 3 berkas!');
            return;
        }

        const newAttachments = [...data.attachments];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

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
                    extension: result.extension,
                });
            } catch (err) {
                toast.error(`Gagal memuat berkas "${file.name}"`);
            }
        }

        setData('attachments', newAttachments);
        toast.success('Lampiran berhasil ditambahkan.');
        e.target.value = '';
    };

    // Delete Attachment
    const handleDeleteAttachment = (index: number) => {
        setData(
            'attachments',
            data.attachments.filter((_, idx) => idx !== index),
        );
    };

    // Form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validations
        if (data.judul.trim().length < 10) {
            toast.error('Judul pengumuman minimal harus 10 karakter!');
            return;
        }

        if (!data.slug.trim()) {
            toast.error('Slug URL wajib diisi!');
            return;
        }

        if (data.isi.replace(/<[^>]*>/g, '').trim().length < 20) {
            toast.error('Isi pengumuman minimal harus 20 karakter!');
            return;
        }

        post(`/admin/pengumuman/${announcement.id}`, {
            onSuccess: () => {
                toast.success(
                    `Pengumuman "${data.judul}" berhasil diperbarui!`,
                );
            },
            onError: (errs) => {
                Object.values(errs).forEach((err) => {
                    toast.error(err);
                });
            },
        });
    };

    return (
        <>
            <Head title={`Edit Pengumuman - ${data.judul}`} />

            <div className="mx-auto w-full max-w-3xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center">
                    <div>
                        <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-neutral-400">
                            <Link
                                href="/admin/pengumuman"
                                className="flex items-center gap-1 transition-colors select-none hover:text-emerald-700"
                            >
                                <ArrowLeft className="size-4" />
                                Kembali ke Daftar
                            </Link>
                        </div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-neutral-800">
                            <Megaphone className="size-6 text-emerald-600" />
                            Edit Pengumuman: {data.judul}
                        </h1>
                        <p className="mt-1 text-sm leading-relaxed font-light text-neutral-500">
                            Sesuaikan isi pengumuman, ubah tingkat penting,
                            status publikasi, atau berkas lampiran.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-5 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                        {/* Judul */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-neutral-700">
                                    Judul Pengumuman
                                </label>
                                <span
                                    className={`text-xs ${data.judul.length < 10 ? 'text-red-500' : 'text-neutral-400'}`}
                                >
                                    {data.judul.length} / 200 karakter (min 10)
                                </span>
                            </div>
                            <input
                                type="text"
                                maxLength={200}
                                required
                                value={data.judul}
                                onChange={(e) =>
                                    handleTitleChange(e.target.value)
                                }
                                placeholder="Contoh: Jadwal Pembayaran Uang Kuliah Semester Ganjil TA 2026/2027"
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                            {errors.judul && (
                                <p className="text-xs font-semibold text-red-500">
                                    {errors.judul}
                                </p>
                            )}
                        </div>

                        {/* Slug URL */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1 text-sm font-semibold text-neutral-700">
                                <Globe className="size-4 text-neutral-400" />
                                Slug URL Pengumuman
                                <span className="text-xs font-normal text-neutral-400">
                                    (Auto-generated / Editable)
                                </span>
                            </label>
                            <input
                                type="text"
                                required
                                value={data.slug}
                                onChange={(e) =>
                                    handleSlugChange(e.target.value)
                                }
                                placeholder="contoh: jadwal-pembayaran-uang-kuliah"
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 font-mono text-sm text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                            {errors.slug && (
                                <p className="text-xs font-semibold text-red-500">
                                    {errors.slug}
                                </p>
                            )}
                        </div>

                        {/* Status, Tanggal, & Penting */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700">
                                    Status
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) =>
                                        setData('status', e.target.value as any)
                                    }
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-colors focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                >
                                    <option value="draf">Draf</option>
                                    <option value="terpublikasi">
                                        Terpublikasi
                                    </option>
                                    <option value="diarsipkan">
                                        Diarsipkan
                                    </option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700">
                                    Tanggal Rilis
                                </label>
                                <input
                                    type="date"
                                    value={data.tanggal_publikasi}
                                    onChange={(e) =>
                                        setData(
                                            'tanggal_publikasi',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                            </div>

                            <label className="mt-6 flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 select-none">
                                <input
                                    type="checkbox"
                                    checked={data.is_penting}
                                    onChange={(e) =>
                                        setData('is_penting', e.target.checked)
                                    }
                                    className="size-4 cursor-pointer rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-neutral-700">
                                        Tandai Penting
                                    </span>
                                    <span className="text-[10px] text-neutral-400">
                                        Tampil pin di atas.
                                    </span>
                                </div>
                            </label>
                        </div>

                        {/* Image Thumbnail with picker integration */}
                        <div className="space-y-3 pt-2">
                            <label className="block text-sm font-semibold text-neutral-700">
                                Gambar Cover Pengumuman (Opsional)
                            </label>

                            <div className="flex flex-col items-start gap-4 md:flex-row">
                                <div className="w-full flex-1 space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={data.thumbnail}
                                            onChange={(e) =>
                                                setData(
                                                    'thumbnail',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="URL Gambar..."
                                            className="flex-1 rounded-xl border border-neutral-200 bg-white p-3 font-mono text-xs text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsPickerOpen(true)
                                            }
                                            className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-100"
                                        >
                                            Pilih dari Aset
                                        </button>
                                    </div>

                                    {/* Upload directly with WebP compression options */}
                                    <div className="space-y-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-neutral-600">
                                                Unggah Gambar Langsung
                                            </span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="w-full text-xs text-neutral-500 file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-emerald-700 file:hover:bg-emerald-100"
                                        />
                                    </div>
                                </div>

                                {/* Preview container */}
                                <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-200/60 bg-neutral-100 md:w-56">
                                    <img
                                        src={data.thumbnail}
                                        alt="Pratinjau Cover"
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80';
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Rich Content Editor */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-neutral-700">
                                    Konten Pengumuman
                                </label>
                                <span className="text-xs font-medium text-neutral-400">
                                    Minimal 20 karakter
                                </span>
                            </div>
                            <RichTextEditor
                                value={data.isi}
                                onChange={(val) => setData('isi', val)}
                                className="border-neutral-200 focus-within:border-emerald-600 focus-within:ring-emerald-600/20"
                            />
                            {errors.isi && (
                                <p className="text-xs font-semibold text-red-500">
                                    {errors.isi}
                                </p>
                            )}
                        </div>

                        {/* Attachments Repeater Upload */}
                        <div className="space-y-3 border-t border-neutral-100 pt-3">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-1 text-sm font-semibold text-neutral-700">
                                    <Paperclip className="size-4 text-neutral-500" />
                                    Lampiran Berkas ({data.attachments.length} /
                                    3)
                                </label>
                                <span className="text-[10px] font-bold text-neutral-400">
                                    PDF / Word / Excel, maks 10MB
                                </span>
                            </div>

                            {/* Direct attachments picker */}
                            {data.attachments.length < 3 && (
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.docx,.xlsx,.pptx"
                                    onChange={handleAttachmentUpload}
                                    className="w-full text-xs text-neutral-500 file:mr-3 file:rounded-xl file:border-0 file:bg-neutral-100 file:px-4 file:py-2 file:text-xs file:font-bold file:text-neutral-700 file:hover:bg-neutral-200"
                                />
                            )}

                            {/* Attachment list */}
                            {data.attachments.length > 0 && (
                                <div className="space-y-2 pt-1">
                                    {data.attachments.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/50 p-3"
                                        >
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <div className="rounded bg-emerald-600 px-2 py-0.5 text-[9px] font-extrabold text-white uppercase shadow-sm">
                                                    {file.extension}
                                                </div>
                                                <span
                                                    className="truncate text-xs font-bold text-neutral-800"
                                                    title={file.name}
                                                >
                                                    {file.name}
                                                </span>
                                                <span className="text-[10px] font-semibold text-neutral-400">
                                                    ({formatFileSize(file.size)}
                                                    )
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteAttachment(idx)
                                                }
                                                className="rounded p-1 text-red-600 hover:bg-red-50"
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
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-98 disabled:opacity-50"
                        >
                            <Save className="size-4" />
                            {processing
                                ? 'Menyimpan...'
                                : 'Perbarui Pengumuman'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Asset Picker Modal */}
            <AssetPickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={(url) => setData('thumbnail', url)}
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

EditPengumuman.layout = {
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
            title: 'Edit Pengumuman',
            href: '#',
        },
    ],
};
