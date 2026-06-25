import { Head, Link, useForm } from '@inertiajs/react';
import { Images, ArrowLeft, Save, Globe } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AssetPickerModal } from '@/components/admin/asset-picker-modal';
import { ImageUploadModal } from '@/components/admin/image-upload-modal';

interface TambahAlbumProps {
    categories: string[];
}

export default function TambahAlbum({ categories = [] }: TambahAlbumProps) {
    const { data, setData, post, processing, errors } = useForm({
        judul: '',
        slug: '',
        deskripsi: '',
        tanggal_kegiatan: new Date().toISOString().split('T')[0],
        kategori: categories.length > 0 ? categories[0] : 'Keuangan',
        coverUrl:
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
    });

    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(
        null,
    );
    const [isSlugEdited, setIsSlugEdited] = useState(false);

    const handleTitleChange = (val: string) => {
        if (!isSlugEdited) {
            const generated = val
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            setData((prev) => ({
                ...prev,
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
        setData('coverUrl', result.base64);
        toast.success('Cover album berhasil diunggah & dioptimasi!');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.judul.trim().length < 5) {
            toast.error('Judul album minimal harus 5 karakter!');
            return;
        }

        if (!data.slug.trim()) {
            toast.error('Slug URL wajib diisi!');
            return;
        }

        post('/admin/dokumentasi', {
            onSuccess: () => {
                toast.success(
                    `Album "${data.judul}" berhasil dibuat! Silakan kelola foto di halaman edit.`,
                );
            },
            onError: (errs) => {
                if (errs.slug) {
                    toast.error(
                        'Slug URL sudah digunakan! Ubah secara manual.',
                    );
                } else if (errs.judul) {
                    toast.error(errs.judul);
                } else {
                    toast.error('Gagal menyimpan album. Periksa input Anda.');
                }
            },
        });
    };

    return (
        <>
            <Head title="Tambah Album Baru - Admin BKA" />

            <div className="mx-auto w-full max-w-3xl space-y-6 p-6 md:space-y-8 md:p-8">
                <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center">
                    <div>
                        <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-neutral-400">
                            <Link
                                href="/admin/dokumentasi"
                                className="flex items-center gap-1 transition-colors select-none hover:text-emerald-700"
                            >
                                <ArrowLeft className="size-4" />
                                Kembali ke Daftar
                            </Link>
                        </div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-neutral-800">
                            <Images className="size-6 text-emerald-600" />
                            Tambah Album Dokumentasi Baru
                        </h1>
                        <p className="mt-1 text-sm leading-relaxed font-light text-neutral-500">
                            Buat folder album untuk merangkum foto-foto liputan
                            sarana prasarana, rapat kerja, dan kegiatan BKA.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-5 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700">
                                Judul Album
                            </label>
                            <input
                                type="text"
                                maxLength={150}
                                required
                                value={data.judul}
                                onChange={(e) =>
                                    handleTitleChange(e.target.value)
                                }
                                placeholder="Contoh: Kunjungan Evaluasi LLDIKTI Wilayah X"
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                            {errors.judul && (
                                <p className="text-xs font-semibold text-red-600">
                                    {errors.judul}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1 text-sm font-semibold text-neutral-700">
                                <Globe className="size-4 text-neutral-400" />
                                Slug URL Album
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
                                placeholder="contoh: kunjungan-evaluasi-lldikti"
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 font-mono text-sm text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                            {errors.slug && (
                                <p className="text-xs font-semibold text-red-600">
                                    {errors.slug}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-1.5 md:col-span-1">
                                <label className="text-sm font-semibold text-neutral-700">
                                    Kategori Album
                                </label>
                                <select
                                    value={data.kategori}
                                    onChange={(e) =>
                                        setData('kategori', e.target.value)
                                    }
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                    {categories.length === 0 && (
                                        <option value="Tanpa Kategori">
                                            Tanpa Kategori
                                        </option>
                                    )}
                                </select>
                            </div>

                            <div className="space-y-1.5 md:col-span-1">
                                <label className="text-sm font-semibold text-neutral-700">
                                    Tanggal Kegiatan
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={data.tanggal_kegiatan}
                                    onChange={(e) =>
                                        setData(
                                            'tanggal_kegiatan',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                            </div>

                            <div className="space-y-1.5 md:col-span-1">
                                <label className="text-sm font-semibold text-neutral-700">
                                    Deskripsi Singkat (Maks 500 Karakter)
                                </label>
                                <textarea
                                    maxLength={500}
                                    rows={2}
                                    value={data.deskripsi}
                                    onChange={(e) =>
                                        setData('deskripsi', e.target.value)
                                    }
                                    placeholder="Rangkuman singkat isi album liputan kegiatan ini..."
                                    className="w-full resize-none rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="block text-sm font-semibold text-neutral-700">
                                Foto Sampul Album (Rasio 16:9)
                            </label>

                            <div className="flex flex-col items-start gap-4 md:flex-row">
                                <div className="w-full flex-1 space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={data.coverUrl}
                                            onChange={(e) =>
                                                setData(
                                                    'coverUrl',
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

                                <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-200/60 bg-neutral-100 md:w-56">
                                    <img
                                        src={data.coverUrl}
                                        alt="Pratinjau Cover"
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                'https://placehold.co/800x450/E8F5E9/1B5E20?text=Album+BKA';
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href="/admin/dokumentasi"
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
                            {processing ? 'Menyimpan...' : 'Simpan Album'}
                        </button>
                    </div>
                </form>
            </div>

            <AssetPickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={(val) => setData('coverUrl', val)}
            />

            <ImageUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setSelectedUploadFile(null);
                }}
                file={selectedUploadFile}
                onConfirm={handleUploadConfirm}
                aspectRatio={16 / 9}
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
