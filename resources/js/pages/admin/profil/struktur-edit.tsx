import { Head, useForm } from '@inertiajs/react';
import {
    Users,
    Save,
    ExternalLink,
    Image as ImageIcon,
    Plus,
    Trash2,
    Edit2,
    ArrowUp,
    ArrowDown,
    X,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AssetPickerModal } from '@/components/admin/asset-picker-modal';
import { ImageUploadModal } from '@/components/admin/image-upload-modal';
import { optimizeFile } from '@/lib/image-optimizer';

interface AnggotaStaf {
    id: number;
    nama: string;
    jabatan: string;
    foto?: string;
    urutan: number;
    isNew?: boolean;
}

const DEFAULT_BAGAN =
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&q=80';

const DEFAULT_STAFF: AnggotaStaf[] = [
    {
        id: 1,
        nama: 'Dina Amalia, S.E., Ak.',
        jabatan: 'Kepala Bagian Keuangan & Verifikasi',
        foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
        urutan: 1,
    },
    {
        id: 2,
        nama: 'Budi Hartono, S.Kom.',
        jabatan: 'Kepala Bagian Pengelolaan Aset & Inventaris',
        foto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
        urutan: 2,
    },
    {
        id: 3,
        nama: 'Rina Marlina, A.Md.',
        jabatan: 'Staf Administrasi Pembayaran SPP',
        foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
        urutan: 3,
    },
    {
        id: 4,
        nama: 'Fahmi Syahputra, S.Ak.',
        jabatan: 'Staf Verifikasi & Anggaran Belanja',
        foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        urutan: 4,
    },
    {
        id: 5,
        nama: 'Siti Rahmah, S.E.',
        jabatan: 'Staf Logistik & Pengadaan Barang',
        foto: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&q=80',
        urutan: 5,
    },
    {
        id: 6,
        nama: 'Andi Wijaya, A.Md.T.',
        jabatan: 'Staf Sarana Prasarana & Inventaris Aset',
        foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
        urutan: 6,
    },
];

interface Props {
    gambarBagan: string | null;
    anggotaList: AnggotaStaf[];
}

export default function EditStruktur({ gambarBagan, anggotaList }: Props) {
    const { data, setData, put, processing } = useForm({
        gambarBagan: gambarBagan || DEFAULT_BAGAN,
        anggotaList:
            anggotaList && anggotaList.length > 0 ? anggotaList : DEFAULT_STAFF,
    });

    // Modal Asset Picker
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    // Direct Upload Optimization Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(
        null,
    );

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
        setData('gambarBagan', result.base64);
        toast.success('Gambar bagan berhasil diunggah & dioptimasi!');
    };

    // Modal Staf State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStafId, setEditingStafId] = useState<number | null>(null);
    const [stafForm, setStafForm] = useState({
        nama: '',
        jabatan: '',
        foto: '',
        urutan: 0,
        isNew: false,
    });

    // Open Add Staf Modal
    const handleOpenAdd = () => {
        setEditingStafId(null);
        setStafForm({
            nama: '',
            jabatan: '',
            foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
            urutan: data.anggotaList.length + 1,
            isNew: true,
        });
        setIsModalOpen(true);
    };

    // Open Edit Staf Modal
    const handleOpenEdit = (staf: AnggotaStaf) => {
        setEditingStafId(staf.id);
        setStafForm({
            nama: staf.nama,
            jabatan: staf.jabatan,
            foto: staf.foto || '',
            urutan: staf.urutan,
            isNew: staf.isNew || false,
        });
        setIsModalOpen(true);
    };

    // Handle delete staf
    const handleDeleteStaf = (id: number) => {
        const updated = data.anggotaList
            .filter((s) => s.id !== id)
            .map((s, idx) => ({
                ...s,
                urutan: idx + 1,
            }));
        setData('anggotaList', updated);
        toast.success('Anggota staf berhasil dihapus dari daftar.');
    };

    // Handle Save Staf Form (Modal)
    const handleSaveStafForm = (e: React.FormEvent) => {
        e.preventDefault();

        if (!stafForm.nama.trim() || !stafForm.jabatan.trim()) {
            toast.error('Nama dan Jabatan staf wajib diisi!');
            return;
        }

        if (editingStafId !== null) {
            // Edit
            const updated = data.anggotaList.map((s) =>
                s.id === editingStafId ? { ...s, ...stafForm } : s,
            );
            setData('anggotaList', updated);
            toast.success('Data staf berhasil diperbarui!');
        } else {
            // Create
            const nextId =
                data.anggotaList.length > 0
                    ? Math.max(...data.anggotaList.map((s) => s.id)) + 1
                    : 1;
            const newStaf: AnggotaStaf = {
                id: nextId,
                nama: stafForm.nama,
                jabatan: stafForm.jabatan,
                foto: stafForm.foto,
                urutan: data.anggotaList.length + 1,
                isNew: true,
            };
            setData('anggotaList', [...data.anggotaList, newStaf]);
            toast.success('Staf baru ditambahkan!');
        }

        setIsModalOpen(false);
    };

    // Sorting/Reordering Staf
    const handleMoveUp = (index: number) => {
        if (index === 0) {
            return;
        }

        const items = [...data.anggotaList];
        const temp = items[index];
        items[index] = items[index - 1];
        items[index - 1] = temp;

        const updated = items.map((s, idx) => ({ ...s, urutan: idx + 1 }));
        setData('anggotaList', updated);
    };

    const handleMoveDown = (index: number) => {
        if (index === data.anggotaList.length - 1) {
            return;
        }

        const items = [...data.anggotaList];
        const temp = items[index];
        items[index] = items[index + 1];
        items[index + 1] = temp;

        const updated = items.map((s, idx) => ({ ...s, urutan: idx + 1 }));
        setData('anggotaList', updated);
    };

    // Handle Save All to Backend
    const handleSaveAll = (e: React.FormEvent) => {
        e.preventDefault();

        put('/admin/profil/struktur', {
            onSuccess: () => {
                toast.success(
                    'Bagan & daftar personalia BKA berhasil disimpan!',
                );
            },
            onError: () => {
                toast.error('Gagal menyimpan struktur organisasi.');
            },
        });
    };

    return (
        <>
            <Head title="Edit Struktur Organisasi - BKA UMRI" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-neutral-800">
                            <Users className="size-6 text-emerald-600" />
                            Kelola Bagan & Struktur Personalia
                        </h1>
                        <p className="mt-1 text-sm leading-relaxed font-normal text-neutral-500">
                            Unggah bagan organisasi terbaru dan perbarui data
                            anggota staf pelaksana resmi di lingkungan BKA UMRI.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <a
                            href="/profil/struktur-organisasi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-xs transition-colors hover:bg-neutral-50 hover:text-neutral-950"
                        >
                            <ExternalLink className="size-4" />
                            Lihat Halaman
                        </a>
                    </div>
                </div>

                {/* Form layout wrapper with Grid cols */}
                <form
                    onSubmit={handleSaveAll}
                    className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-[28%_1fr]"
                >
                    {/* Left Side Panel */}
                    <div className="space-y-4 rounded-2xl border border-neutral-200/60 bg-neutral-50/50 p-6">
                        <h2 className="text-sm font-bold tracking-wider text-emerald-800 uppercase">
                            Panduan Organisasi
                        </h2>

                        <div className="space-y-3 text-xs leading-relaxed text-neutral-600">
                            <p>
                                <strong>Bagan Struktur:</strong> Diagram visual
                                alur koordinasi struktural. Gunakan format
                                gambar PNG/JPG/SVG dengan tautan URL valid.
                            </p>
                            <p>
                                <strong>Personalia:</strong> Daftar pejabat/staf
                                pelaksana BKA. Urutan pada baris tabel
                                menentukan urutan card pameran staf di website.
                            </p>
                            <p>
                                Pimpinan utama (Kepala Biro) otomatis disajikan
                                secara terpisah di bagian paling atas pada
                                halaman publik.
                            </p>
                        </div>

                        <div className="border-t border-neutral-200 pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-98 disabled:opacity-50"
                            >
                                <Save className="size-4.5" />
                                {processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Struktur'}
                            </button>
                        </div>
                    </div>

                    {/* Right Side Panel Inputs */}
                    <div className="space-y-6">
                        {/* Bagan Diagram Card */}
                        <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                                <ImageIcon className="size-5 text-emerald-600" />
                                <h3 className="text-base font-bold tracking-tight text-neutral-800">
                                    Bagan Alur Organisasi
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-neutral-700">
                                        URL Gambar Bagan
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={data.gambarBagan}
                                            onChange={(e) =>
                                                setData(
                                                    'gambarBagan',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Tulis tautan gambar diagram (PNG/JPG)..."
                                            className="flex-1 rounded-xl border border-neutral-200 bg-white p-3 font-mono text-sm text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
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
                                    <div className="mt-3 space-y-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-4">
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
                                    <span className="mt-2 block text-[11px] leading-relaxed text-neutral-400">
                                        Rekomendasi rasio gambar lebar
                                        (landscape), background
                                        putih/transparan, resolusi minimal
                                        1200px lebar.
                                    </span>
                                </div>

                                {/* Preview Bagan */}
                                <div className="flex min-h-[160px] items-center justify-center overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                                    {data.gambarBagan ? (
                                        <img
                                            src={data.gambarBagan}
                                            alt="Preview Bagan"
                                            className="max-h-[150px] rounded-lg object-contain shadow-xs"
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLImageElement
                                                ).src =
                                                    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&q=80';
                                            }}
                                        />
                                    ) : (
                                        <div className="space-y-1 text-center text-neutral-400">
                                            <ImageIcon className="mx-auto size-8 opacity-45" />
                                            <span className="text-xs">
                                                Gambar kosong
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Personalia List Card */}
                        <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <Users className="size-5 text-emerald-600" />
                                    <h3 className="text-base font-bold tracking-tight text-neutral-800">
                                        Daftar Anggota Staf (
                                        {data.anggotaList.length})
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleOpenAdd}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100"
                                >
                                    <Plus className="size-3.5" />
                                    Tambah Anggota
                                </button>
                            </div>

                            {/* Table of Staff */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-neutral-100 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                                            <th className="w-16 py-3 pl-3">
                                                Foto
                                            </th>
                                            <th className="px-3 py-3">
                                                Nama Lengkap
                                            </th>
                                            <th className="px-3 py-3">
                                                Jabatan / Bagian
                                            </th>
                                            <th className="w-20 px-3 py-3 text-center">
                                                Urutan
                                            </th>
                                            <th className="w-32 py-3 pr-3 text-right">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 text-sm text-neutral-800">
                                        {data.anggotaList
                                            .sort((a, b) => a.urutan - b.urutan)
                                            .map((staf, index) => (
                                                <tr
                                                    key={staf.id || index}
                                                    className="group hover:bg-neutral-50/40"
                                                >
                                                    <td className="py-3 pl-3">
                                                        <div className="size-10 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
                                                            {staf.foto ? (
                                                                <img
                                                                    src={
                                                                        staf.foto
                                                                    }
                                                                    alt={
                                                                        staf.nama
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <User className="h-full w-full p-2 text-neutral-400" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 font-semibold text-neutral-900">
                                                        {staf.nama}
                                                    </td>
                                                    <td className="px-3 py-3 font-medium text-neutral-500">
                                                        {staf.jabatan}
                                                    </td>
                                                    <td className="px-3 py-3 text-center font-bold text-neutral-600">
                                                        #{index + 1}
                                                    </td>
                                                    <td className="py-3 pr-3 text-right">
                                                        <div className="inline-flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    index === 0
                                                                }
                                                                onClick={() =>
                                                                    handleMoveUp(
                                                                        index,
                                                                    )
                                                                }
                                                                className="rounded p-1.5 text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent"
                                                                title="Naikkan"
                                                            >
                                                                <ArrowUp className="size-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    index ===
                                                                    data
                                                                        .anggotaList
                                                                        .length -
                                                                        1
                                                                }
                                                                onClick={() =>
                                                                    handleMoveDown(
                                                                        index,
                                                                    )
                                                                }
                                                                className="rounded p-1.5 text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent"
                                                                title="Turunkan"
                                                            >
                                                                <ArrowDown className="size-3.5" />
                                                            </button>
                                                            <div className="mx-1 h-4 w-[1px] bg-neutral-200" />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleOpenEdit(
                                                                        staf,
                                                                    )
                                                                }
                                                                className="rounded p-1.5 text-neutral-600 hover:bg-neutral-200"
                                                                title="Edit"
                                                            >
                                                                <Edit2 className="size-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteStaf(
                                                                        staf.id,
                                                                    )
                                                                }
                                                                className="rounded p-1.5 text-red-600 hover:bg-red-50"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}

                                        {data.anggotaList.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="py-12 text-center text-neutral-400"
                                                >
                                                    <Users className="mx-auto mb-2 size-12 opacity-30" />
                                                    <p className="text-sm font-semibold">
                                                        Belum ada anggota
                                                        terdaftar
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={handleOpenAdd}
                                                        className="mt-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                                                    >
                                                        Tambah anggota pertama
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Custom Modal Popup for Add/Edit Staff (100% Anti-overlap & layout responsive) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-200 fade-in">
                    <div className="relative w-full max-w-lg animate-in rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl duration-200 zoom-in-95">
                        {/* Close button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                        >
                            <X className="size-5" />
                        </button>

                        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-800">
                            <User className="size-5 text-emerald-600" />
                            {editingStafId !== null
                                ? 'Edit Data Anggota Staf'
                                : 'Tambah Anggota Staf Baru'}
                        </h3>

                        <form
                            onSubmit={handleSaveStafForm}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700">
                                    Nama Lengkap & Gelar
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={stafForm.nama}
                                    onChange={(e) =>
                                        setStafForm((prev) => ({
                                            ...prev,
                                            nama: e.target.value,
                                        }))
                                    }
                                    placeholder="Contoh: Dina Amalia, S.E., Ak."
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700">
                                    Jabatan Resmi
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={stafForm.jabatan}
                                    onChange={(e) =>
                                        setStafForm((prev) => ({
                                            ...prev,
                                            jabatan: e.target.value,
                                        }))
                                    }
                                    placeholder="Contoh: Staf Administrasi Keuangan"
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700">
                                    Foto Profil (Rasio 1:1)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (file.size > 2 * 1024 * 1024) {
                                                toast.error(
                                                    'Ukuran gambar maksimal 2 MB.',
                                                );
                                                return;
                                            }
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setStafForm((prev) => ({
                                                    ...prev,
                                                    foto: reader.result as string,
                                                }));
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="w-full text-xs text-neutral-500 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
                                />
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={
                                            stafForm.foto.startsWith(
                                                'data:image/',
                                            )
                                                ? ''
                                                : stafForm.foto
                                        }
                                        onChange={(e) =>
                                            setStafForm((prev) => ({
                                                ...prev,
                                                foto: e.target.value,
                                            }))
                                        }
                                        placeholder="Atau masukkan URL foto..."
                                        className="w-full rounded-xl border border-neutral-200 bg-white p-3 font-mono text-xs text-neutral-500 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    />
                                </div>
                            </div>

                            {/* Foto preview in modal */}
                            {stafForm.foto && (
                                <div className="flex justify-center pt-2">
                                    <div className="size-16 overflow-hidden rounded-full border border-neutral-200">
                                        <img
                                            src={stafForm.foto}
                                            alt="Preview Staf"
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLImageElement
                                                ).src =
                                                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2.5 border-t border-neutral-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
                                >
                                    {editingStafId !== null
                                        ? 'Perbarui Data'
                                        : 'Tambah Staf'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Asset Picker Modal */}
            <AssetPickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={(url) => setData('gambarBagan', url)}
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

EditStruktur.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Profil Organisasi',
            href: '#',
        },
        {
            title: 'Struktur Organisasi',
            href: '/admin/profil/struktur',
        },
    ],
};
