import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import {
    FolderOpen,
    FileText,
    Plus,
    Trash2,
    Edit2,
    ArrowUp,
    ArrowDown,
    Search,
    Upload,
    Download,
    FileSpreadsheet,
    Presentation,
    AlertCircle,
    Info,
    FileArchive,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/format-date';
import { formatFileSize } from '@/lib/format-file-size';

interface KategoriLampiran {
    id: string;
    nama: string;
    slug: string;
    deskripsi: string;
    urutan: number;
}

interface BerkasItem {
    id: string;
    kategori_id: string;
    nama_tampilan: string;
    deskripsi: string;
    tipe_file: string;
    ukuran: number;
    tanggal_upload: string;
    download_url: string;
}

const INITIAL_CATEGORIES: KategoriLampiran[] = [
    {
        id: 'cat-1',
        nama: 'Peraturan & Kebijakan',
        slug: 'peraturan-dan-kebijakan',
        deskripsi:
            'Surat Keputusan Rektor, Peraturan Pemerintah, dan Ketetapan Keuangan Kampus.',
        urutan: 1,
    },
    {
        id: 'cat-2',
        nama: 'Formulir Kemahasiswaan',
        slug: 'formulir-kemahasiswaan',
        deskripsi:
            'Formulir dispensasi SPP, pengajuan dana BEM/HMPS, dan SPJ Kegiatan.',
        urutan: 2,
    },
    {
        id: 'cat-3',
        nama: 'Panduan & SOP Pelayanan',
        slug: 'panduan-dan-sop-pelayanan',
        deskripsi:
            'SOP pengajuan dana, panduan pembayaran Virtual Account, dan lainnya.',
        urutan: 3,
    },
    {
        id: 'cat-4',
        nama: 'Rencana & Laporan Anggaran',
        slug: 'rencana-dan-laporan-anggaran',
        deskripsi:
            'Sosialisasi RKAT, pagu dana belanja fakultas, dan transparansi keuangan.',
        urutan: 4,
    },
];

const INITIAL_FILES: BerkasItem[] = [
    {
        id: 'file-1',
        kategori_id: 'cat-1',
        nama_tampilan:
            'Surat Keputusan Rektor tentang Bagi Hasil Kerja Sama Keuangan.pdf',
        deskripsi:
            'Regulasi internal penetapan persentase pembagian hasil kerja sama universitas dengan pihak luar.',
        tipe_file: 'pdf',
        ukuran: 1245000,
        tanggal_upload: '2026-05-18',
        download_url:
            'data:application/pdf;base64,JVBERi0xLjQKJdPr6gogMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PiBlbmRvYmoKMiAwIG9iagogIDw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbIDMgMCBSIF0gL0NvdW50IDEgPj4gZW5kb2JqCjMgMCBSIHhtbA==',
    },
    {
        id: 'file-2',
        kategori_id: 'cat-1',
        nama_tampilan:
            'Peraturan Universitas tentang Sistem Tata Kelola Keuangan 2026.pdf',
        deskripsi:
            'Buku panduan utama standarisasi pelaporan keuangan, kas keluar, dan pertanggungjawaban unit.',
        tipe_file: 'pdf',
        ukuran: 2450000,
        tanggal_upload: '2026-05-15',
        download_url:
            'data:application/pdf;base64,JVBERi0xLjQKJdPr6gogMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PiBlbmRvYmoKMiAwIG9iagogIDw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbIDMgMCBSIF0gL0NvdW50IDEgPj4gZW5kb2JqCjMgMCBSIHhtbA==',
    },
    {
        id: 'file-3',
        kategori_id: 'cat-2',
        nama_tampilan:
            'Formulir Pengajuan Dispensasi Keterlambatan Pembayaran Kuliah.pdf',
        deskripsi:
            'Formulir wajib diisi bagi mahasiswa yang ingin menangguhkan pembayaran SPP dengan alasan mendesak.',
        tipe_file: 'pdf',
        ukuran: 345000,
        tanggal_upload: '2026-05-22',
        download_url:
            'data:application/pdf;base64,JVBERi0xLjQKJdPr6gogMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PiBlbmRvYmoKMiAwIG9iagogIDw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbIDMgMCBSIF0gL0NvdW50IDEgPj4gZW5kb2JqCjMgMCBSIHhtbA==',
    },
    {
        id: 'file-4',
        kategori_id: 'cat-3',
        nama_tampilan:
            'Buku Panduan Tata Cara Pembayaran Virtual Account BSI.pdf',
        deskripsi:
            'Panduan lengkap cara transfer SPP lewat teller, ATM, Mobile Banking, dan Internet Banking Bank Syariah Indonesia.',
        tipe_file: 'pdf',
        ukuran: 1890000,
        tanggal_upload: '2026-05-20',
        download_url:
            'data:application/pdf;base64,JVBERi0xLjQKJdPr6gogMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PiBlbmRvYmoKMiAwIG9iagogIDw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbIDMgMCBSIF0gL0NvdW50IDEgPj4gZW5kb2JqCjMgMCBSIHhtbA==',
    },
];

export default function LampiranDokumenCMS() {
    const [categories, setCategories] = useState<KategoriLampiran[]>([]);
    const [files, setFiles] = useState<BerkasItem[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Modal forms states
    const [categoryModal, setCategoryModal] = useState<{
        isOpen: boolean;
        mode: 'add' | 'edit';
        id?: string;
        nama: string;
        deskripsi: string;
    }>({ isOpen: false, mode: 'add', nama: '', deskripsi: '' });

    const [fileModal, setFileModal] = useState<{
        isOpen: boolean;
        mode: 'add' | 'edit';
        id?: string;
        kategori_id: string;
        nama_tampilan: string;
        deskripsi: string;
        fileDataUrl?: string;
        fileName?: string;
        fileSize?: number;
    }>({
        isOpen: false,
        mode: 'add',
        kategori_id: '',
        nama_tampilan: '',
        deskripsi: '',
    });

    const [deleteConfirm, setDeleteConfirm] = useState<{
        type: 'category' | 'file';
        id: string;
        title: string;
    } | null>(null);

    // Initial hydration from local storage
    useEffect(() => {
        const savedCategories = localStorage.getItem('bka_kategori_lampiran');
        const savedFiles = localStorage.getItem('bka_berkas_lampiran');

        if (savedCategories) {
            try {
                const parsedCat = JSON.parse(savedCategories);
                setCategories(parsedCat);
                if (parsedCat.length > 0) {
                    setSelectedCategoryId(parsedCat[0].id);
                }
            } catch {
                setCategories(INITIAL_CATEGORIES);
                setSelectedCategoryId(INITIAL_CATEGORIES[0].id);
            }
        } else {
            setCategories(INITIAL_CATEGORIES);
            localStorage.setItem(
                'bka_kategori_lampiran',
                JSON.stringify(INITIAL_CATEGORIES),
            );
            setSelectedCategoryId(INITIAL_CATEGORIES[0].id);
        }

        if (savedFiles) {
            try {
                setFiles(JSON.parse(savedFiles));
            } catch {
                setFiles(INITIAL_FILES);
            }
        } else {
            setFiles(INITIAL_FILES);
            localStorage.setItem(
                'bka_berkas_lampiran',
                JSON.stringify(INITIAL_FILES),
            );
        }
    }, []);

    // Helper to persist categories
    const saveCategoriesToLocalStorage = (updatedCats: KategoriLampiran[]) => {
        setCategories(updatedCats);
        localStorage.setItem(
            'bka_kategori_lampiran',
            JSON.stringify(updatedCats),
        );
    };

    // Helper to persist files
    const saveFilesToLocalStorage = (updatedFiles: BerkasItem[]) => {
        setFiles(updatedFiles);
        localStorage.setItem(
            'bka_berkas_lampiran',
            JSON.stringify(updatedFiles),
        );
    };

    // Reorder Categories
    const handleReorderCategory = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= categories.length) return;

        const updated = [...categories];
        const temp = updated[index];
        updated[index] = updated[newIndex];
        updated[newIndex] = temp;

        // Recalculate 'urutan' sequence
        const finalized = updated.map((cat, idx) => ({
            ...cat,
            urutan: idx + 1,
        }));
        saveCategoriesToLocalStorage(finalized);
        toast.success('Urutan kategori berhasil diperbarui');
    };

    // Category Add / Update
    const handleCategorySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryModal.nama.trim()) {
            toast.error('Nama kategori wajib diisi');
            return;
        }

        const slug = categoryModal.nama
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');

        if (categoryModal.mode === 'add') {
            const newCat: KategoriLampiran = {
                id: 'cat-' + Date.now(),
                nama: categoryModal.nama,
                slug,
                deskripsi: categoryModal.deskripsi,
                urutan: categories.length + 1,
            };
            const updated = [...categories, newCat];
            saveCategoriesToLocalStorage(updated);
            setSelectedCategoryId(newCat.id);
            toast.success('Kategori baru berhasil ditambahkan');
        } else {
            const updated = categories.map((cat) => {
                if (cat.id === categoryModal.id) {
                    return {
                        ...cat,
                        nama: categoryModal.nama,
                        slug,
                        deskripsi: categoryModal.deskripsi,
                    };
                }
                return cat;
            });
            saveCategoriesToLocalStorage(updated);
            toast.success('Kategori berhasil diperbarui');
        }

        setCategoryModal({
            isOpen: false,
            mode: 'add',
            nama: '',
            deskripsi: '',
        });
    };

    // File selection/Drag & drop parsing to Base64
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validations
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Ukuran berkas melebihi batas 10 MB');
            return;
        }

        const ext = file.name.split('.').pop()?.toLowerCase();
        const allowedExts = [
            'pdf',
            'doc',
            'docx',
            'xls',
            'xlsx',
            'ppt',
            'pptx',
            'zip',
            'rar',
        ];
        if (!ext || !allowedExts.includes(ext)) {
            toast.error(
                'Format berkas tidak diizinkan. Gunakan PDF/Office Document/Archive.',
            );
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setFileModal((prev) => ({
                ...prev,
                fileDataUrl: base64,
                fileName: file.name,
                fileSize: file.size,
                nama_tampilan: prev.nama_tampilan || file.name, // Auto-fill display name
            }));
            toast.success('Berkas siap diunggah');
        };
        reader.readAsDataURL(file);
    };

    // File Add / Update
    const handleFileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fileModal.nama_tampilan.trim()) {
            toast.error('Nama tampilan berkas wajib diisi');
            return;
        }

        if (fileModal.mode === 'add' && !fileModal.fileDataUrl) {
            toast.error('Anda harus mengunggah berkas terlebih dahulu');
            return;
        }

        const ext =
            fileModal.fileName?.split('.').pop()?.toLowerCase() || 'pdf';

        if (fileModal.mode === 'add') {
            const newFile: BerkasItem = {
                id: 'file-' + Date.now(),
                kategori_id: selectedCategoryId,
                nama_tampilan: fileModal.nama_tampilan,
                deskripsi: fileModal.deskripsi,
                tipe_file: ext,
                ukuran: fileModal.fileSize || 0,
                tanggal_upload: new Date().toISOString().split('T')[0],
                download_url: fileModal.fileDataUrl || '',
            };
            const updated = [newFile, ...files];
            saveFilesToLocalStorage(updated);
            toast.success('Berkas berhasil diunggah');
        } else {
            const updated = files.map((file) => {
                if (file.id === fileModal.id) {
                    return {
                        ...file,
                        nama_tampilan: fileModal.nama_tampilan,
                        deskripsi: fileModal.deskripsi,
                        // Update file content only if newly uploaded
                        download_url:
                            fileModal.fileDataUrl || file.download_url,
                        tipe_file:
                            fileModal.fileName
                                ?.split('.')
                                .pop()
                                ?.toLowerCase() || file.tipe_file,
                        ukuran: fileModal.fileSize || file.ukuran,
                    };
                }
                return file;
            });
            saveFilesToLocalStorage(updated);
            toast.success('Informasi berkas berhasil diperbarui');
        }

        setFileModal({
            isOpen: false,
            mode: 'add',
            kategori_id: '',
            nama_tampilan: '',
            deskripsi: '',
        });
    };

    // Confirm deletes
    const handleConfirmDelete = () => {
        if (!deleteConfirm) return;

        if (deleteConfirm.type === 'category') {
            // Delete category & all contained files
            const updatedCats = categories.filter(
                (c) => c.id !== deleteConfirm.id,
            );
            const updatedFiles = files.filter(
                (f) => f.kategori_id !== deleteConfirm.id,
            );
            saveCategoriesToLocalStorage(updatedCats);
            saveFilesToLocalStorage(updatedFiles);

            if (
                selectedCategoryId === deleteConfirm.id &&
                updatedCats.length > 0
            ) {
                setSelectedCategoryId(updatedCats[0].id);
            } else {
                setSelectedCategoryId('');
            }
            toast.success(
                'Kategori beserta seluruh berkas di dalamnya berhasil dihapus',
            );
        } else {
            // Delete single file
            const updatedFiles = files.filter((f) => f.id !== deleteConfirm.id);
            saveFilesToLocalStorage(updatedFiles);
            toast.success('Berkas berhasil dihapus');
        }

        setDeleteConfirm(null);
    };

    // Icons mapper for specific file formats
    const getFileIconComponent = (ext: string) => {
        switch (ext.toLowerCase()) {
            case 'pdf':
                return <FileText className="text-red-500" size={20} />;
            case 'xls':
            case 'xlsx':
            case 'csv':
                return (
                    <FileSpreadsheet className="text-emerald-600" size={20} />
                );
            case 'doc':
            case 'docx':
                return <FileText className="text-blue-500" size={20} />;
            case 'ppt':
            case 'pptx':
                return <Presentation className="text-amber-500" size={20} />;
            case 'zip':
            case 'rar':
                return <FileArchive className="text-violet-500" size={20} />;
            default:
                return <FileText className="text-neutral-500" size={20} />;
        }
    };

    // Filter files list based on selected category & query search
    const filteredFiles = files.filter(
        (f) =>
            f.kategori_id === selectedCategoryId &&
            (f.nama_tampilan
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
                f.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())),
    );

    const activeCategoryName =
        categories.find((c) => c.id === selectedCategoryId)?.nama ||
        'Pilih Kategori';
    const activeCategoryDesc =
        categories.find((c) => c.id === selectedCategoryId)?.deskripsi || '';

    return (
        <>
            <Head title="Kelola Lampiran Dokumen - Admin BKA" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-2 border-b border-neutral-100 pb-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
                            <FolderOpen className="text-[#1B5E20]" size={28} />
                            Kelola Lampiran & Dokumen Penting
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500">
                            Kelola kategori dokumen beserta lampiran berkas
                            resmi untuk diunduh publik.
                        </p>
                    </div>
                </div>

                {/* Split Master Detail Panel Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* LEFT PANEL: Master Kategori (4/12 cols) */}
                    <div className="flex h-[650px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs lg:col-span-5">
                        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 p-4">
                            <span className="text-sm font-bold text-neutral-800">
                                Daftar Folder Kategori ({categories.length})
                            </span>
                            <button
                                onClick={() =>
                                    setCategoryModal({
                                        isOpen: true,
                                        mode: 'add',
                                        nama: '',
                                        deskripsi: '',
                                    })
                                }
                                className="inline-flex items-center gap-1 rounded-xl bg-[#1B5E20] px-2.5 py-1.5 text-[11px] font-bold text-white shadow-xs transition-all hover:bg-[#145218]"
                            >
                                <Plus size={13} />
                                <span>Tambah Folder</span>
                            </button>
                        </div>

                        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                            {categories.length > 0 ? (
                                categories.map((cat, index) => {
                                    const fileCount = files.filter(
                                        (f) => f.kategori_id === cat.id,
                                    ).length;
                                    const isSelected =
                                        cat.id === selectedCategoryId;

                                    return (
                                        <div
                                            key={cat.id}
                                            onClick={() =>
                                                setSelectedCategoryId(cat.id)
                                            }
                                            className={`group relative flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-4 transition-all ${
                                                isSelected
                                                    ? 'border-[#1B5E20] bg-emerald-50/20 shadow-xs'
                                                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/30'
                                            }`}
                                        >
                                            <div className="flex min-w-0 flex-1 items-start gap-3">
                                                <div
                                                    className={`shrink-0 rounded-lg p-2.5 ${
                                                        isSelected
                                                            ? 'bg-[#1B5E20] text-white'
                                                            : 'bg-neutral-100 text-neutral-500'
                                                    }`}
                                                >
                                                    <FolderOpen size={18} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3
                                                        className={`truncate text-sm font-bold ${
                                                            isSelected
                                                                ? 'text-[#1B5E20]'
                                                                : 'text-neutral-900'
                                                        }`}
                                                    >
                                                        {cat.nama}
                                                    </h3>
                                                    <p className="mt-0.5 line-clamp-1 text-[11px] text-neutral-400">
                                                        {cat.deskripsi ||
                                                            'Tidak ada deskripsi'}
                                                    </p>
                                                    <span className="mt-2 inline-block rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-500">
                                                        {fileCount} Berkas
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions panel */}
                                            <div className="absolute top-3 right-3 flex shrink-0 items-center gap-1 rounded-lg border border-neutral-100 bg-white/95 p-0.5 opacity-0 shadow-xs transition-opacity group-hover:opacity-100">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReorderCategory(
                                                            index,
                                                            'up',
                                                        );
                                                    }}
                                                    disabled={index === 0}
                                                    className="rounded-md p-1 text-neutral-400 hover:text-neutral-600 disabled:opacity-30"
                                                    title="Pindah Ke Atas"
                                                >
                                                    <ArrowUp size={13} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReorderCategory(
                                                            index,
                                                            'down',
                                                        );
                                                    }}
                                                    disabled={
                                                        index ===
                                                        categories.length - 1
                                                    }
                                                    className="rounded-md p-1 text-neutral-400 hover:text-neutral-600 disabled:opacity-30"
                                                    title="Pindah Ke Bawah"
                                                >
                                                    <ArrowDown size={13} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCategoryModal({
                                                            isOpen: true,
                                                            mode: 'edit',
                                                            id: cat.id,
                                                            nama: cat.nama,
                                                            deskripsi:
                                                                cat.deskripsi,
                                                        });
                                                    }}
                                                    className="rounded-md p-1 text-blue-500 hover:bg-blue-50 hover:text-blue-700"
                                                    title="Edit Folder"
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirm({
                                                            type: 'category',
                                                            id: cat.id,
                                                            title: cat.nama,
                                                        });
                                                    }}
                                                    className="rounded-md p-1 text-red-500 hover:bg-red-50 hover:text-red-700"
                                                    title="Hapus Folder"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400">
                                    <FolderOpen
                                        size={48}
                                        className="mb-3 stroke-1 text-neutral-300"
                                    />
                                    <span className="text-xs font-semibold">
                                        Folder Kategori Belum Ada
                                    </span>
                                    <p className="mt-1 max-w-[200px] text-[10px]">
                                        Silakan buat folder pertama Anda untuk
                                        mulai mengunggah lampiran dokumen.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Detail Berkas per Kategori (8/12 cols) */}
                    <div className="flex h-[650px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs lg:col-span-7">
                        {selectedCategoryId ? (
                            <>
                                {/* Category Header */}
                                <div className="flex flex-col gap-4 border-b border-neutral-100 bg-neutral-50/50 p-5">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <span className="text-[10px] font-extrabold tracking-wider text-[#1B5E20] uppercase">
                                                Folder Terpilih
                                            </span>
                                            <h2 className="mt-0.5 text-lg font-bold text-neutral-900">
                                                {activeCategoryName}
                                            </h2>
                                            {activeCategoryDesc && (
                                                <p className="mt-1 max-w-xl text-xs text-neutral-500">
                                                    {activeCategoryDesc}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() =>
                                                setFileModal({
                                                    isOpen: true,
                                                    mode: 'add',
                                                    kategori_id:
                                                        selectedCategoryId,
                                                    nama_tampilan: '',
                                                    deskripsi: '',
                                                })
                                            }
                                            className="inline-flex items-center gap-1.5 self-start rounded-xl bg-[#1B5E20] px-4 py-2 text-xs font-bold whitespace-nowrap text-white shadow-xs transition-all hover:bg-[#145218]"
                                        >
                                            <Upload size={14} />
                                            <span>Unggah Berkas Baru</span>
                                        </button>
                                    </div>

                                    {/* Search input in Folder */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder={`Cari berkas dalam folder ${activeCategoryName}...`}
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            className="w-full rounded-xl border border-neutral-200 bg-white py-2 pr-4 pl-9 text-xs outline-none focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20]"
                                        />
                                        <Search
                                            size={14}
                                            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-neutral-400"
                                        />
                                    </div>
                                </div>

                                {/* Files Table */}
                                <div className="flex-1 overflow-y-auto p-4">
                                    {filteredFiles.length > 0 ? (
                                        <div className="flex flex-col gap-3">
                                            {filteredFiles.map((file) => (
                                                <div
                                                    key={file.id}
                                                    className="border-neutral-150 hover:border-neutral-250 flex flex-col justify-between gap-3 rounded-xl border bg-white p-4 transition-all hover:bg-neutral-50/20 sm:flex-row sm:items-center"
                                                >
                                                    <div className="flex min-w-0 flex-1 items-start gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50">
                                                            {getFileIconComponent(
                                                                file.tipe_file,
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-sm leading-snug font-bold break-all text-neutral-900">
                                                                {
                                                                    file.nama_tampilan
                                                                }
                                                            </h3>
                                                            {file.deskripsi && (
                                                                <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">
                                                                    {
                                                                        file.deskripsi
                                                                    }
                                                                </p>
                                                            )}
                                                            <div className="mt-2 flex items-center gap-4 text-[10px] font-semibold text-neutral-400">
                                                                <span>
                                                                    Ukuran:{' '}
                                                                    {formatFileSize(
                                                                        file.ukuran,
                                                                    )}
                                                                </span>
                                                                <span>
                                                                    Format:{' '}
                                                                    {file.tipe_file.toUpperCase()}
                                                                </span>
                                                                <span>
                                                                    Diunggah:{' '}
                                                                    {formatDate(
                                                                        file.tanggal_upload,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex shrink-0 items-center gap-1.5 self-end border-t border-neutral-100 pt-2 sm:self-center sm:border-0 sm:pt-0">
                                                        <a
                                                            href={
                                                                file.download_url
                                                            }
                                                            download={
                                                                file.nama_tampilan
                                                            }
                                                            className="rounded-xl p-2 text-[#1B5E20] hover:bg-emerald-50"
                                                            title="Unduh Berkas"
                                                        >
                                                            <Download
                                                                size={15}
                                                            />
                                                        </a>
                                                        <button
                                                            onClick={() =>
                                                                setFileModal({
                                                                    isOpen: true,
                                                                    mode: 'edit',
                                                                    id: file.id,
                                                                    kategori_id:
                                                                        file.kategori_id,
                                                                    nama_tampilan:
                                                                        file.nama_tampilan,
                                                                    deskripsi:
                                                                        file.deskripsi,
                                                                    fileName:
                                                                        file.nama_tampilan,
                                                                    fileSize:
                                                                        file.ukuran,
                                                                })
                                                            }
                                                            className="rounded-xl p-2 text-blue-500 hover:bg-blue-50"
                                                            title="Edit Berkas"
                                                        >
                                                            <Edit2 size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setDeleteConfirm(
                                                                    {
                                                                        type: 'file',
                                                                        id: file.id,
                                                                        title: file.nama_tampilan,
                                                                    },
                                                                )
                                                            }
                                                            className="rounded-xl p-2 text-red-500 hover:bg-red-50"
                                                            title="Hapus Berkas"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-400">
                                            <FileText
                                                size={48}
                                                className="mb-3 stroke-1 text-neutral-300"
                                            />
                                            <span className="text-xs font-semibold">
                                                Folder Kategori Masih Kosong
                                            </span>
                                            <p className="mt-1 max-w-[240px] text-[10px]">
                                                Belum ada dokumen di folder ini.
                                                Unggah file PDF/Word/Excel
                                                perdana Anda sekarang.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-neutral-400">
                                <FolderOpen
                                    size={64}
                                    className="mb-3 stroke-1 text-neutral-300"
                                />
                                <h3 className="text-sm font-bold text-neutral-800">
                                    Folder Belum Dipilih
                                </h3>
                                <p className="mt-1.5 max-w-[280px] text-xs leading-relaxed text-neutral-400">
                                    Silakan pilih salah satu folder kategori di
                                    sebelah kiri untuk mengelola berkas lampiran
                                    penting.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL: KATEGORI FORM */}
                {categoryModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs transition-all select-none fade-in">
                        <div className="w-full max-w-md animate-in space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl duration-200 zoom-in-95">
                            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                                <h3 className="flex items-center gap-2 text-base font-bold text-neutral-800">
                                    <FolderOpen className="size-5 text-emerald-600" />
                                    {categoryModal.mode === 'add'
                                        ? 'Buat Kategori Folder Baru'
                                        : 'Edit Kategori Folder'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCategoryModal({
                                            isOpen: false,
                                            mode: 'add',
                                            nama: '',
                                            deskripsi: '',
                                        })
                                    }
                                    className="p-1 text-sm font-semibold text-neutral-400 outline-none hover:text-neutral-600"
                                >
                                    Tutup
                                </button>
                            </div>

                            <form
                                onSubmit={handleCategorySubmit}
                                className="space-y-4"
                            >
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-neutral-700">
                                        Nama Folder *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Regulasi Pembayaran SPP"
                                        value={categoryModal.nama}
                                        onChange={(e) =>
                                            setCategoryModal((prev) => ({
                                                ...prev,
                                                nama: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-neutral-700">
                                        Deskripsi Singkat
                                    </label>
                                    <textarea
                                        placeholder="Tuliskan keterangan isi folder berkas ini..."
                                        value={categoryModal.deskripsi}
                                        onChange={(e) =>
                                            setCategoryModal((prev) => ({
                                                ...prev,
                                                deskripsi: e.target.value,
                                            }))
                                        }
                                        rows={3}
                                        className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    />
                                </div>

                                <div className="mt-4 flex items-center justify-end gap-3 border-t border-neutral-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCategoryModal({
                                                isOpen: false,
                                                mode: 'add',
                                                nama: '',
                                                deskripsi: '',
                                            })
                                        }
                                        className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 transition-colors outline-none hover:bg-neutral-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-[#1B5E20] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all outline-none hover:bg-[#145218]"
                                    >
                                        {categoryModal.mode === 'add'
                                            ? 'Buat Kategori'
                                            : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL: BERKAS FILE FORM */}
                {fileModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs transition-all select-none fade-in">
                        <div className="w-full max-w-lg animate-in space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl duration-200 zoom-in-95">
                            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                                <h3 className="flex items-center gap-2 text-base font-bold text-neutral-800">
                                    <FileText className="size-5 text-emerald-600" />
                                    {fileModal.mode === 'add'
                                        ? 'Unggah Berkas Baru'
                                        : 'Edit Keterangan Berkas'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFileModal({
                                            isOpen: false,
                                            mode: 'add',
                                            kategori_id: '',
                                            nama_tampilan: '',
                                            deskripsi: '',
                                        })
                                    }
                                    className="p-1 text-sm font-semibold text-neutral-400 outline-none hover:text-neutral-600"
                                >
                                    Tutup
                                </button>
                            </div>

                            <form
                                onSubmit={handleFileSubmit}
                                className="space-y-4"
                            >
                                {/* Upload Box Area (Only required/shown for add, optional for replace in edit) */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-neutral-700">
                                        {fileModal.mode === 'add'
                                            ? 'Berkas Dokumen *'
                                            : 'Ganti Berkas Dokumen (Opsional)'}
                                    </label>
                                    <div className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 p-6 text-center transition-colors hover:border-[#1B5E20]">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                                            className="absolute inset-0 cursor-pointer opacity-0"
                                        />
                                        <Upload
                                            size={24}
                                            className="mb-2 text-neutral-400"
                                        />
                                        <span className="text-xs font-bold text-neutral-700">
                                            {fileModal.fileName
                                                ? 'Ganti File Terpilih'
                                                : 'Klik atau Seret Berkas ke Sini'}
                                        </span>
                                        <span className="mt-1 max-w-[280px] text-[10px] leading-normal text-neutral-400">
                                            Mendukung PDF, Word, Excel, PPT,
                                            ZIP/RAR hingga batas 10 MB.
                                        </span>
                                    </div>

                                    {/* Preview selected file info */}
                                    {fileModal.fileName && (
                                        <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#E8F5E9] bg-emerald-50/20 p-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1B5E20] text-white">
                                                <FileText size={16} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-bold text-neutral-800">
                                                    {fileModal.fileName}
                                                </p>
                                                {fileModal.fileSize && (
                                                    <span className="text-[10px] font-semibold text-neutral-400">
                                                        {formatFileSize(
                                                            fileModal.fileSize,
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-neutral-700">
                                        Nama Tampilan Dokumen *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Masukkan judul nama dokumen resmi..."
                                        value={fileModal.nama_tampilan}
                                        onChange={(e) =>
                                            setFileModal((prev) => ({
                                                ...prev,
                                                nama_tampilan: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                        required
                                    />
                                    <p className="mt-0.5 text-[10px] leading-normal text-neutral-400">
                                        Judul ini yang akan dibaca oleh publik
                                        saat mengunduh dokumen.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-neutral-700">
                                        Keterangan/Deskripsi Singkat
                                    </label>
                                    <textarea
                                        placeholder="Tuliskan keterangan mengenai fungsi/isi berkas ini..."
                                        value={fileModal.deskripsi}
                                        onChange={(e) =>
                                            setFileModal((prev) => ({
                                                ...prev,
                                                deskripsi: e.target.value,
                                            }))
                                        }
                                        rows={3}
                                        className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    />
                                </div>

                                <div className="mt-4 flex items-center justify-end gap-3 border-t border-neutral-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFileModal({
                                                isOpen: false,
                                                mode: 'add',
                                                kategori_id: '',
                                                nama_tampilan: '',
                                                deskripsi: '',
                                            })
                                        }
                                        className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 transition-colors outline-none hover:bg-neutral-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-[#1B5E20] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all outline-none hover:bg-[#145218]"
                                    >
                                        {fileModal.mode === 'add'
                                            ? 'Unggah Berkas'
                                            : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL: DELETE CONFIRMATION */}
                {deleteConfirm && (
                    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs transition-all select-none fade-in">
                        <div className="w-full max-w-sm animate-in rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-2xl duration-200 zoom-in-95">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="mb-1 text-base font-bold text-neutral-950">
                                {deleteConfirm.type === 'category'
                                    ? 'Hapus Folder Kategori?'
                                    : 'Hapus Berkas Dokumen?'}
                            </h3>
                            <p className="mb-6 px-2 text-xs leading-relaxed text-neutral-500">
                                {deleteConfirm.type === 'category' ? (
                                    <>
                                        Apakah Anda yakin ingin menghapus folder
                                        "<strong>{deleteConfirm.title}</strong>
                                        "? Seluruh berkas dokumen di dalamnya
                                        akan dihapus secara permanen dari sistem
                                        lokal.
                                    </>
                                ) : (
                                    <>
                                        Apakah Anda yakin ingin menghapus berkas
                                        "<strong>{deleteConfirm.title}</strong>
                                        "? Tautan unduhan berkas ini tidak akan
                                        dapat diakses lagi.
                                    </>
                                )}
                            </p>
                            <div className="flex items-center justify-center gap-3 border-t border-neutral-100 pt-4">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 transition-colors outline-none hover:bg-neutral-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all outline-none hover:bg-red-700"
                                >
                                    Hapus Permanen
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

LampiranDokumenCMS.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Kelola Dokumen Penting',
            href: '/admin/dokumen',
        },
    ],
};
