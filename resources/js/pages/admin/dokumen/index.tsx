import { Head, router } from '@inertiajs/react';
import {
    FolderOpen,
    FileText,
    Plus,
    Trash2,
    Edit2,
    ArrowUp,
    ArrowDown,
    FolderPlus,
    ChevronLeft,
    Search,
    Upload,
    Download,
    FileSpreadsheet,
    Presentation,
    AlertCircle,
    Info,
    FileArchive,
    GripVertical,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/format-date';
import { formatFileSize } from '@/lib/format-file-size';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface KategoriLampiran {
    id: string;
    nama: string;
    slug: string;
    deskripsi: string;
    urutan: number;
    parent_id?: string | null;
    deleted_at?: string | null;
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
    deleted_at?: string | null;
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
        download_url: '',
    },
];

interface AdminDokumenProps {
    categories?: KategoriLampiran[];
    files?: BerkasItem[];
}

export default function LampiranDokumenCMS({
    categories = [],
    files = [],
}: AdminDokumenProps) {
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [categoryModal, setCategoryModal] = useState<{
        isOpen: boolean;
        mode: 'add' | 'edit';
        id?: string;
        nama: string;
        deskripsi: string;
        parent_id?: string | null;
    }>({ isOpen: false, mode: 'add', nama: '', deskripsi: '', parent_id: null });

    const [fileModal, setFileModal] = useState<{
        isOpen: boolean;
        mode: 'add' | 'edit';
        id?: string;
        kategori_id: string;
        nama_tampilan: string;
        deskripsi: string;
        file?: File;
        fileDataUrl?: string;
        fileName?: string;
        fileSize?: number;
        files?: {
            file: File;
            fileDataUrl: string;
            fileName: string;
            fileSize: number;
        }[];
        compress?: boolean;
    }>({
        isOpen: false,
        mode: 'add',
        kategori_id: '',
        nama_tampilan: '',
        deskripsi: '',
        compress: false,
        files: [],
    });

    const [deleteConfirm, setDeleteConfirm] = useState<{
        type: 'category' | 'file';
        id: string;
        title: string;
    } | null>(null);

    const [isSubmittingFile, setIsSubmittingFile] = useState(false);

    // Auto-select first category when categories are loaded
    useEffect(() => {
        if (categories.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(categories[0].id);
        }
    }, [categories, selectedCategoryId]);

    // Trash logic
    const [showTrashed, setShowTrashed] = useState(() => {
        if (typeof window !== 'undefined') {
            return (
                new URLSearchParams(window.location.search).get('trashed') ===
                'true'
            );
        }
        return false;
    });

    const toggleTrashed = () => {
        const newValue = !showTrashed;
        setShowTrashed(newValue);
        router.get(
            '/admin/dokumen',
            { trashed: newValue ? 'true' : undefined },
            { preserveState: true },
        );
    };

    const handleRestoreKategori = (id: string) => {
        toast.promise(
            new Promise((resolve, reject) => {
                router.post(
                    `/admin/dokumen/kategori/${id}/restore`,
                    {},
                    {
                        onSuccess: () => resolve(true),
                        onError: () =>
                            reject(new Error('Gagal memulihkan kategori')),
                    },
                );
            }),
            {
                loading: 'Memulihkan...',
                success: 'Kategori berhasil dipulihkan!',
                error: 'Terjadi kesalahan saat memulihkan.',
            },
        );
    };

    const handleRestoreBerkas = (id: string) => {
        toast.promise(
            new Promise((resolve, reject) => {
                router.post(
                    `/admin/dokumen/berkas/${id}/restore`,
                    {},
                    {
                        onSuccess: () => resolve(true),
                        onError: () =>
                            reject(new Error('Gagal memulihkan berkas')),
                    },
                );
            }),
            {
                loading: 'Memulihkan...',
                success: 'Berkas berhasil dipulihkan!',
                error: 'Terjadi kesalahan saat memulihkan.',
            },
        );
    };

    // Reorder Categories on backend
    const handleReorderCategory = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= categories.length) {
            return;
        }

        const updated = [...categories];
        const temp = updated[index];
        updated[index] = updated[newIndex];
        updated[newIndex] = temp;

        const ids = updated.map((cat) => cat.id);

        router.post(
            '/admin/dokumen/kategori/reorder',
            { ids },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Urutan kategori berhasil diperbarui');
                },
                onError: () => {
                    toast.error('Gagal memperbarui urutan kategori');
                },
            },
        );
    };

    const activeSubCategoriesForReorder = categories.filter(c => c.parent_id === selectedCategoryId && (showTrashed ? true : !c.deleted_at));
    const activeFilesForReorder = files.filter(f => f.kategori_id === selectedCategoryId);

    type UnifiedItem =
        | ({ type: 'folder' } & KategoriLampiran)
        | ({ type: 'file' } & Lampiran);

    const [localUnifiedList, setLocalUnifiedList] = useState<UnifiedItem[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const unifiedList: UnifiedItem[] = [
        ...activeSubCategoriesForReorder.map(s => ({ ...s, type: 'folder' as const })),
        ...activeFilesForReorder.map(f => ({ ...f, type: 'file' as const }))
    ].sort((a, b) => (a.urutan || 0) - (b.urutan || 0));

    useEffect(() => {
        setLocalUnifiedList(unifiedList);
    }, [categories, files, selectedCategoryId, showTrashed]);

    const filteredUnifiedList = localUnifiedList.filter((item) => {
        if (item.type === 'folder') {
            return item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   (item.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase()));
        } else {
            return item.nama_tampilan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   (item.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase()));
        }
    });

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        setDragOverIndex(index);
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === targetIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const updated = [...localUnifiedList];
        const draggedItem = updated[draggedIndex];
        
        updated.splice(draggedIndex, 1);
        updated.splice(targetIndex, 0, draggedItem);

        setLocalUnifiedList(updated);

        const items = updated.map((item) => ({ id: item.id, type: item.type }));

        router.post(
            '/admin/dokumen/berkas/reorder-unified',
            { items },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Urutan berhasil diperbarui');
                },
                onError: () => {
                    toast.error('Gagal memperbarui urutan');
                    setLocalUnifiedList(unifiedList);
                },
            },
        );

        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };


    // Category Add / Update on backend
    const handleCategorySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingFile(true);

        const payload = {
            nama: categoryModal.nama,
            deskripsi: categoryModal.deskripsi,
            parent_id: categoryModal.parent_id,
        };

        if (categoryModal.mode === 'add') {
            router.post(
                '/admin/dokumen/kategori',
                payload,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Kategori baru berhasil ditambahkan');
                        setCategoryModal({
                            isOpen: false,
                            mode: 'add',
                            nama: '',
                            deskripsi: '',
                        });
                    },
                    onError: (errors: any) => {
                        if (errors.nama) {
                            toast.error(errors.nama);
                        } else {
                            toast.error('Gagal menambahkan kategori');
                        }
                    },
                },
            );
        } else {
            router.put(
                `/admin/dokumen/kategori/${categoryModal.id}`,
                payload,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Kategori berhasil diperbarui');
                        setCategoryModal({
                            isOpen: false,
                            mode: 'add',
                            nama: '',
                            deskripsi: '',
                        });
                    },
                    onError: (errors: any) => {
                        if (errors.nama) {
                            toast.error(errors.nama);
                        } else {
                            toast.error('Gagal memperbarui kategori');
                        }
                    },
                },
            );
        }
    };

    // File selection/Drag & drop parsing to Base64
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        const extMatch = (name: string) =>
            name.split('.').pop()?.toLowerCase() || '';
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
        const validFiles: File[] = [];

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const ext = extMatch(file.name);
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`Ukuran ${file.name} melebihi batas 10 MB`);
                continue;
            }
            if (ext && allowedExts.includes(ext)) {
                validFiles.push(file);
            } else {
                toast.error(`Format berkas ${file.name} tidak diizinkan.`);
            }
        }

        if (validFiles.length === 0) return;

        const readFiles = validFiles.map((file) => {
            return new Promise<{
                file: File;
                fileDataUrl: string;
                fileName: string;
                fileSize: number;
            }>((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    resolve({
                        file: file,
                        fileDataUrl: event.target?.result as string,
                        fileName: file.name,
                        fileSize: file.size,
                    });
                };
                reader.readAsDataURL(file);
            });
        });

        const newFilesData = await Promise.all(readFiles);

        setFileModal((prev) => {
            const currentFiles = prev.files || [];

            if (prev.mode === 'edit') {
                return {
                    ...prev,
                    file: newFilesData[0].file,
                    fileDataUrl: newFilesData[0].fileDataUrl,
                    fileName: newFilesData[0].fileName,
                    fileSize: newFilesData[0].fileSize,
                };
            }

            const updatedFiles = [...currentFiles, ...newFilesData];
            const isMultiple = updatedFiles.length > 1;

            return {
                ...prev,
                files: updatedFiles,
                file: updatedFiles[0].file,
                fileDataUrl: updatedFiles[0].fileDataUrl,
                fileName: updatedFiles[0].fileName,
                fileSize: updatedFiles[0].fileSize,
                nama_tampilan: isMultiple
                    ? ''
                    : prev.nama_tampilan || updatedFiles[0].fileName,
            };
        });

        toast.success(`${newFilesData.length} berkas siap diunggah`);
        e.target.value = '';
    };

    const removeFile = (indexToRemove: number) => {
        setFileModal((prev) => {
            const updatedFiles = (prev.files || []).filter(
                (_, i) => i !== indexToRemove,
            );

            if (updatedFiles.length === 0) {
                return {
                    ...prev,
                    files: [],
                    fileDataUrl: undefined,
                    fileName: undefined,
                    fileSize: undefined,
                    nama_tampilan: '',
                };
            }

            return {
                ...prev,
                files: updatedFiles,
                fileDataUrl: updatedFiles[0].fileDataUrl,
                fileName: updatedFiles[0].fileName,
                fileSize: updatedFiles[0].fileSize,
                nama_tampilan:
                    updatedFiles.length > 1 ? '' : updatedFiles[0].fileName,
            };
        });
    };

    // File Add / Update on backend
    const handleFileSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (
            fileModal.mode === 'add' &&
            (!fileModal.files || fileModal.files.length === 0)
        ) {
            toast.error('Anda harus mengunggah berkas terlebih dahulu');
            return;
        }

        const isMultiple = fileModal.files && fileModal.files.length > 1;

        if (!isMultiple && !fileModal.nama_tampilan.trim()) {
            toast.error('Nama tampilan berkas wajib diisi');
            return;
        }

        if (fileModal.mode === 'add') {
            setIsSubmittingFile(true);
            if (isMultiple) {
                const totalFiles = fileModal.files!.length;
                let uploadedCount = 0;
                let hasError = false;

                const uploadSequentially = async () => {
                    for (let i = 0; i < totalFiles; i++) {
                        const fileItem = fileModal.files![i];
                        toast.info(
                            `Mengunggah file ${i + 1} dari ${totalFiles}: ${fileItem.fileName}...`,
                            {
                                id: 'upload-progress',
                                duration: 10000,
                            },
                        );

                        try {
                            await new Promise<void>((resolve, reject) => {
                                router.post(
                                    '/admin/dokumen/berkas',
                                    {
                                        kategori_id: selectedCategoryId,
                                        nama_tampilan: fileItem.fileName
                                            .split('.')
                                            .slice(0, -1)
                                            .join('.')
                                            .slice(0, 150),
                                        deskripsi: '',
                                        berkas: fileItem.file,
                                        fileName: fileItem.fileName,
                                        compress: fileModal.compress,
                                    },
                                    {
                                        preserveScroll: true,
                                        preserveState: true,
                                        onSuccess: () => {
                                            uploadedCount++;
                                            resolve();
                                        },
                                        onError: (err) => {
                                            reject(err);
                                        },
                                    },
                                );
                            });
                        } catch (err) {
                            hasError = true;
                            toast.error(
                                `Gagal mengunggah ${fileItem.fileName}`,
                            );
                            break;
                        }
                    }

                    setIsSubmittingFile(false);
                    toast.dismiss('upload-progress');

                    if (!hasError) {
                        toast.success(
                            `${uploadedCount} berkas berhasil diunggah`,
                        );
                        setFileModal({
                            isOpen: false,
                            mode: 'add',
                            kategori_id: '',
                            nama_tampilan: '',
                            deskripsi: '',
                            files: [],
                        });
                        router.reload();
                    }
                };

                uploadSequentially();
            } else {
                router.post(
                    '/admin/dokumen/berkas',
                    {
                        kategori_id: selectedCategoryId,
                        nama_tampilan: fileModal.nama_tampilan,
                        deskripsi: fileModal.deskripsi,
                        berkas: fileModal.file,
                        fileName: fileModal.fileName,
                        compress: fileModal.compress,
                    },
                    {
                        preserveScroll: true,
                        onStart: () => setIsSubmittingFile(true),
                        onFinish: () => setIsSubmittingFile(false),
                        onSuccess: () => {
                            toast.success('Berkas berhasil diunggah');
                            setFileModal({
                                isOpen: false,
                                mode: 'add',
                                kategori_id: '',
                                nama_tampilan: '',
                                deskripsi: '',
                                files: [],
                            });
                        },
                        onError: () => {
                            toast.error('Gagal mengunggah berkas');
                        },
                    },
                );
            }
        } else {
            // Use POST with method spoofing _method: 'PUT' for binary file uploads in Laravel
            router.post(
                `/admin/dokumen/berkas/${fileModal.id}`,
                {
                    _method: 'PUT',
                    nama_tampilan: fileModal.nama_tampilan,
                    deskripsi: fileModal.deskripsi,
                    berkas: fileModal.file || null,
                    fileName: fileModal.fileName || null,
                    compress: fileModal.compress,
                },
                {
                    preserveScroll: true,
                    onStart: () => setIsSubmittingFile(true),
                    onFinish: () => setIsSubmittingFile(false),
                    onSuccess: () => {
                        toast.success('Informasi berkas berhasil diperbarui');
                        setFileModal({
                            isOpen: false,
                            mode: 'add',
                            kategori_id: '',
                            nama_tampilan: '',
                            deskripsi: '',
                            files: [],
                        });
                    },
                    onError: () => {
                        toast.error('Gagal memperbarui berkas');
                    },
                },
            );
        }
    };

    // Confirm deletes on backend
    const handleConfirmDelete = () => {
        if (!deleteConfirm) return;

        if (deleteConfirm.type === 'category') {
            router.delete(`/admin/dokumen/kategori/${deleteConfirm.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        showTrashed
                            ? 'Kategori berhasil dihapus permanen'
                            : 'Kategori berhasil dipindahkan ke Sampah',
                    );
                    setDeleteConfirm(null);
                    // Select another category if possible
                    const remaining = categories.filter(
                        (c) => c.id !== deleteConfirm.id,
                    );
                    if (remaining.length > 0) {
                        setSelectedCategoryId(remaining[0].id);
                    } else {
                        setSelectedCategoryId('');
                    }
                },
                onError: () => {
                    toast.error('Gagal menghapus kategori');
                },
            });
        } else {
            router.delete(`/admin/dokumen/berkas/${deleteConfirm.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        showTrashed
                            ? 'Berkas berhasil dihapus permanen'
                            : 'Berkas berhasil dipindahkan ke Sampah',
                    );
                    setDeleteConfirm(null);
                },
                onError: () => {
                    toast.error('Gagal menghapus berkas');
                },
            });
        }
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

    const activeCategory = categories.find((c) => c.id === selectedCategoryId);
    const activeCategoryName = activeCategory?.nama || 'Pilih Kategori';
    const activeCategoryDesc = activeCategory?.deskripsi || '';

    // Build hierarchical tree
    const buildCategoryTree = (list: KategoriLampiran[], parentId: string | null = null, depth = 0): (KategoriLampiran & { depth: number })[] => {
        const children = list.filter(c => c.parent_id === parentId);
        return children.reduce((acc, curr) => {
            return [...acc, { ...curr, depth }, ...buildCategoryTree(list, curr.id, depth + 1)];
        }, [] as (KategoriLampiran & { depth: number })[]);
    };

    const categoryTree = buildCategoryTree(categories);

    return (
        <>
            <Head title="Kelola Lampiran Dokumen - Admin BKA" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-2 border-b border-neutral-100 pb-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
                            <FolderOpen className="text-[#0a6c32]" size={28} />
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
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleTrashed}
                                    className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold shadow-xs transition-colors ${showTrashed ? 'border border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200' : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'}`}
                                >
                                    <Trash2 className="size-4" />
                                    <span>
                                        {showTrashed
                                            ? 'Data Aktif'
                                            : 'Lihat Sampah'}
                                    </span>
                                </button>
                                <button
                                    onClick={() =>
                                        setCategoryModal({
                                            isOpen: true,
                                            mode: 'add',
                                            nama: '',
                                            deskripsi: '',
                                        })
                                    }
                                    className="inline-flex items-center gap-1 rounded-xl bg-[#0a6c32] px-2.5 py-1.5 text-[11px] font-bold text-white shadow-xs transition-all hover:bg-[#085627]"
                                >
                                    <Plus size={13} />
                                    <span>Tambah Folder</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                            {categoryTree.length > 0 ? (
                                categoryTree.map((cat, index) => {
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
                                            style={{ marginLeft: `${cat.depth * 1.5}rem` }}
                                            className={`group relative flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-4 transition-all ${
                                                isSelected
                                                    ? 'border-[#0a6c32] bg-emerald-50/20 shadow-xs'
                                                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/30'
                                            }`}
                                        >
                                            <div className="flex min-w-0 flex-1 items-start gap-3">
                                                <div
                                                    className={`shrink-0 rounded-lg p-2.5 ${
                                                        isSelected
                                                            ? 'bg-[#0a6c32] text-white'
                                                            : 'bg-neutral-100 text-neutral-500'
                                                    }`}
                                                >
                                                    <FolderOpen size={18} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3
                                                        className={`truncate text-sm font-bold ${
                                                            isSelected
                                                                ? 'text-[#0a6c32]'
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
                                                            parent_id: cat.parent_id,
                                                        });
                                                    }}
                                                    className="rounded-md p-1 text-blue-500 hover:bg-blue-50"
                                                    title="Edit Kategori"
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                                {cat.deleted_at && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRestoreKategori(
                                                                cat.id,
                                                            );
                                                        }}
                                                        className="rounded-md p-1 text-emerald-500 hover:bg-emerald-50"
                                                        title="Pulihkan Kategori"
                                                    >
                                                        <AlertCircle
                                                            size={13}
                                                        />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirm({
                                                            type: 'category',
                                                            id: cat.id,
                                                            title: cat.nama,
                                                        });
                                                    }}
                                                    className="rounded-md p-1 text-red-500 hover:bg-red-50"
                                                    title={
                                                        cat.deleted_at
                                                            ? 'Hapus Permanen'
                                                            : 'Hapus (Soft Delete)'
                                                    }
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
                                            <span className="text-[10px] font-extrabold tracking-wider text-[#0a6c32] uppercase">
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
                                        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                                            {activeCategory?.parent_id && (
                                                <button
                                                    onClick={() => setSelectedCategoryId(activeCategory.parent_id!)}
                                                    className="inline-flex items-center justify-center gap-1.5 self-start rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 shadow-xs transition-all hover:bg-neutral-50"
                                                    title="Kembali ke Induk"
                                                >
                                                    <ChevronLeft size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() =>
                                                    setCategoryModal({
                                                        isOpen: true,
                                                        mode: 'add',
                                                        nama: '',
                                                        deskripsi: '',
                                                        parent_id: selectedCategoryId,
                                                    })
                                                }
                                                className="inline-flex items-center justify-center gap-1.5 self-start rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold whitespace-nowrap text-neutral-700 shadow-xs transition-all hover:bg-neutral-50"
                                            >
                                                <FolderPlus size={14} />
                                                <span>Buat Sub-Folder</span>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setFileModal({
                                                        isOpen: true,
                                                        mode: 'add',
                                                        kategori_id: selectedCategoryId,
                                                        nama_tampilan: '',
                                                        deskripsi: '',
                                                    })
                                                }
                                                className="inline-flex items-center justify-center gap-1.5 self-start rounded-xl bg-[#0a6c32] px-4 py-2 text-xs font-bold whitespace-nowrap text-white shadow-xs transition-all hover:bg-[#085627]"
                                            >
                                                <Upload size={14} />
                                                <span>Unggah Berkas</span>
                                            </button>
                                        </div>
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
                                            className="w-full rounded-xl border border-neutral-200 bg-white py-2 pr-4 pl-9 text-xs outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                        />
                                        <Search
                                            size={14}
                                            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-neutral-400"
                                        />
                                    </div>
                                </div>

                                {/* Files Table */}
                                <div className="flex-1 overflow-y-auto p-4">
                                    {filteredUnifiedList.length > 0 ? (
                                        <div className="flex flex-col gap-3">
                                            {filteredUnifiedList.map((item, index) => {
                                                if (item.type === 'folder') {
                                                    const subcat = item as any;
                                                    const subFileCount = files.filter(f => f.kategori_id === subcat.id).length;
                                                    return (
                                                        <div
                                                            key={`folder-${subcat.id}`}
                                                            draggable={!searchQuery}
                                                            onDragStart={(e) => handleDragStart(e, index)}
                                                            onDragOver={(e) => handleDragOver(e, index)}
                                                            onDrop={(e) => handleDrop(e, index)}
                                                            onDragEnd={handleDragEnd}
                                                            className={`border-neutral-150 hover:border-[#0a6c32] flex flex-col justify-between gap-3 rounded-xl border bg-neutral-50/50 p-4 transition-all hover:bg-emerald-50/20 sm:flex-row sm:items-center cursor-pointer ${
                                                                draggedIndex === index ? 'opacity-40 border-dashed border-[#0a6c32]' : ''
                                                            } ${dragOverIndex === index ? 'border-[#0a6c32] bg-emerald-50/10' : ''}`}
                                                            onClick={(e) => {
                                                                if ((e.target as HTMLElement).closest('button')) return;
                                                                setSelectedCategoryId(subcat.id);
                                                            }}
                                                        >
                                                            <div className="flex min-w-0 flex-1 items-start gap-3">
                                                                {!searchQuery && (
                                                                    <div className="flex shrink-0 items-center self-center cursor-grab active:cursor-grabbing text-neutral-400 p-1 hover:text-neutral-600">
                                                                        <GripVertical size={16} />
                                                                    </div>
                                                                )}
                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-[#0a6c32]">
                                                                    <FolderOpen size={18} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h3 className="text-sm leading-snug font-bold break-all text-neutral-900 group-hover:text-[#0a6c32]">
                                                                        {subcat.nama}
                                                                    </h3>
                                                                    {subcat.deskripsi && (
                                                                        <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">
                                                                            {subcat.deskripsi}
                                                                        </p>
                                                                    )}
                                                                    <div className="mt-2 flex items-center gap-4 text-[10px] font-semibold text-neutral-400">
                                                                        <span>{subFileCount} Berkas di dalam</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex shrink-0 items-center justify-end gap-1 sm:mt-0">
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // File Rendering
                                                const file = item as any;
                                                return (
                                                <div
                                                    key={`file-${file.id}`}
                                                    draggable={!searchQuery}
                                                    onDragStart={(e) => handleDragStart(e, index)}
                                                    onDragOver={(e) => handleDragOver(e, index)}
                                                    onDrop={(e) => handleDrop(e, index)}
                                                    onDragEnd={handleDragEnd}
                                                    className={`border-neutral-150 hover:border-neutral-250 flex flex-col justify-between gap-3 rounded-xl border bg-white p-4 transition-all hover:bg-neutral-50/20 sm:flex-row sm:items-center ${
                                                        draggedIndex === index ? 'opacity-40 border-dashed border-[#0a6c32]' : ''
                                                    } ${dragOverIndex === index ? 'border-[#0a6c32] bg-emerald-50/10' : ''}`}
                                                >
                                                    <div className="flex min-w-0 flex-1 items-start gap-3">
                                                        {!searchQuery && (
                                                            <div className="flex shrink-0 items-center self-center cursor-grab active:cursor-grabbing text-neutral-400 p-1 hover:text-neutral-600">
                                                                <GripVertical size={16} />
                                                            </div>
                                                        )}
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

                                                    <div className="flex shrink-0 items-center justify-end gap-1 sm:mt-0">
                                                        {!file.deleted_at &&
                                                            file.download_url && (
                                                                <a
                                                                    href={
                                                                        file.download_url
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center justify-center rounded-lg border border-neutral-200 bg-white p-2 text-neutral-600 shadow-xs transition-colors hover:bg-neutral-50"
                                                                    title="Unduh Berkas"
                                                                >
                                                                    <Download
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                </a>
                                                            )}
                                                        {!file.deleted_at && (
                                                            <button
                                                                onClick={() =>
                                                                    setFileModal(
                                                                        {
                                                                            isOpen: true,
                                                                            mode: 'edit',
                                                                            id: file.id,
                                                                            kategori_id:
                                                                                file.kategori_id,
                                                                            nama_tampilan:
                                                                                file.nama_tampilan,
                                                                            deskripsi:
                                                                                file.deskripsi,
                                                                            compress: false,
                                                                        },
                                                                    )
                                                                }
                                                                className="flex items-center justify-center rounded-lg border border-neutral-200 bg-white p-2 text-neutral-600 shadow-xs transition-colors hover:bg-neutral-50"
                                                                title="Edit Detail"
                                                            >
                                                                <Edit2
                                                                    size={14}
                                                                />
                                                            </button>
                                                        )}
                                                        {file.deleted_at && (
                                                            <button
                                                                onClick={() =>
                                                                    handleRestoreBerkas(
                                                                        file.id,
                                                                    )
                                                                }
                                                                className="flex items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-emerald-600 shadow-xs transition-colors hover:bg-emerald-100"
                                                                title="Pulihkan Berkas"
                                                            >
                                                                <AlertCircle
                                                                    size={14}
                                                                />
                                                            </button>
                                                        )}
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
                                                            className="flex items-center justify-center rounded-lg border border-red-100 bg-red-50 p-2 text-red-600 shadow-xs transition-colors hover:bg-red-100"
                                                            title={
                                                                file.deleted_at
                                                                    ? 'Hapus Permanen'
                                                                    : 'Hapus Berkas (Soft Delete)'
                                                            }
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                );
                                            })}
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
                                    <label className="mb-1 block text-[13px] font-bold text-neutral-800">
                                        Pilih Induk Folder (Opsional)
                                    </label>
                                    <select
                                        value={categoryModal.parent_id || ''}
                                        onChange={(e) =>
                                            setCategoryModal({
                                                ...categoryModal,
                                                parent_id: e.target.value || null,
                                            })
                                        }
                                        className="w-full rounded-xl border border-neutral-300 bg-neutral-50 p-3 text-sm outline-none transition-all focus:border-[#0a6c32] focus:bg-white focus:ring-1 focus:ring-[#0a6c32]"
                                    >
                                        <option value="">-- Tidak ada induk (Folder Utama) --</option>
                                        {categories
                                            .filter(c => c.id !== categoryModal.id)
                                            .map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.nama}
                                                </option>
                                            ))}
                                    </select>
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
                                        className="rounded-xl bg-[#0a6c32] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all outline-none hover:bg-[#085627]"
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
                                    <div className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 p-6 text-center transition-colors hover:border-[#0a6c32]">
                                        <input
                                            type="file"
                                            multiple={fileModal.mode === 'add'}
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
                                                ? fileModal.mode === 'edit'
                                                    ? 'Ganti File Terpilih'
                                                    : 'Tambah File Lainnya'
                                                : 'Klik atau Seret Berkas ke Sini'}
                                        </span>
                                        <span className="mt-1 max-w-[280px] text-[10px] leading-normal text-neutral-400">
                                            Mendukung PDF, Word, Excel, PPT,
                                            ZIP/RAR. Bisa memilih banyak file
                                            sekaligus.
                                        </span>
                                    </div>

                                    {/* Preview selected file info */}
                                    {fileModal.mode === 'edit' &&
                                        fileModal.fileName && (
                                            <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#e6f4ea] bg-emerald-50/20 p-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0a6c32] text-white">
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

                                    {fileModal.mode === 'add' &&
                                        fileModal.files &&
                                        fileModal.files.length > 0 && (
                                            <div className="mt-2 flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
                                                {fileModal.files.map(
                                                    (f, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-between gap-3 rounded-xl border border-[#e6f4ea] bg-emerald-50/20 p-2.5"
                                                        >
                                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0a6c32] text-white">
                                                                <FileText
                                                                    size={14}
                                                                />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-xs font-bold text-neutral-800">
                                                                    {f.fileName}
                                                                </p>
                                                                <span className="text-[10px] font-semibold text-neutral-400">
                                                                    {formatFileSize(
                                                                        f.fileSize,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeFile(
                                                                        idx,
                                                                    )
                                                                }
                                                                className="rounded-lg bg-red-50 p-1 text-red-500 outline-none hover:bg-red-100 hover:text-red-700"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="16"
                                                                    height="16"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <line
                                                                        x1="18"
                                                                        y1="6"
                                                                        x2="6"
                                                                        y2="18"
                                                                    ></line>
                                                                    <line
                                                                        x1="6"
                                                                        y1="6"
                                                                        x2="18"
                                                                        y2="18"
                                                                    ></line>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}

                                    {fileModal.fileName
                                        ?.toLowerCase()
                                        .endsWith('.pdf') && (
                                        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3">
                                            <input
                                                type="checkbox"
                                                id="compress-pdf"
                                                checked={
                                                    fileModal.compress || false
                                                }
                                                onChange={(e) =>
                                                    setFileModal((prev) => ({
                                                        ...prev,
                                                        compress:
                                                            e.target.checked,
                                                    }))
                                                }
                                                className="mt-0.5 rounded border-neutral-300 text-amber-600 focus:ring-amber-600"
                                            />
                                            <div>
                                                <label
                                                    htmlFor="compress-pdf"
                                                    className="cursor-pointer text-xs font-bold text-neutral-800"
                                                >
                                                    Kompres Ukuran PDF
                                                </label>
                                                <p className="mt-0.5 text-[10px] leading-relaxed text-neutral-500">
                                                    Centang untuk memperkecil
                                                    ukuran file PDF (menghemat
                                                    penyimpanan server).
                                                    Resolusi dan kualitas gambar
                                                    di dalam PDF mungkin sedikit
                                                    berkurang.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Show individual inputs only if uploading a single file or editing */}
                                {(!fileModal.files ||
                                    fileModal.files.length <= 1) && (
                                    <>
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
                                                        nama_tampilan:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                                required={
                                                    fileModal.files &&
                                                    fileModal.files.length <= 1
                                                }
                                            />
                                            <p className="mt-0.5 text-[10px] leading-normal text-neutral-400">
                                                Judul ini yang akan dibaca oleh
                                                publik saat mengunduh dokumen.
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
                                                        deskripsi:
                                                            e.target.value,
                                                    }))
                                                }
                                                rows={3}
                                                className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Notification for multiple upload mode */}
                                {fileModal.mode === 'add' &&
                                    fileModal.files &&
                                    fileModal.files.length > 1 && (
                                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                                            <p className="text-xs font-medium text-emerald-800">
                                                <strong>
                                                    Mode Unggah Sekaligus Aktif!
                                                </strong>
                                                <br />
                                                Anda akan mengunggah{' '}
                                                {fileModal.files.length}{' '}
                                                dokumen. Nama tampilan akan
                                                otomatis disesuaikan dengan nama
                                                asli file (tanpa ekstensi). Anda
                                                dapat mengedit keterangan
                                                masing-masing file secara
                                                spesifik setelah file berhasil
                                                diunggah.
                                            </p>
                                        </div>
                                    )}

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
                                        disabled={isSubmittingFile}
                                        className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all outline-none ${
                                            isSubmittingFile
                                                ? 'cursor-not-allowed bg-neutral-400'
                                                : 'bg-[#0a6c32] hover:bg-[#085627]'
                                        }`}
                                    >
                                        {isSubmittingFile ? (
                                            <>
                                                <svg
                                                    className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                {fileModal.mode === 'add'
                                                    ? 'Mengunggah...'
                                                    : 'Menyimpan...'}
                                            </>
                                        ) : fileModal.mode === 'add' ? (
                                            'Unggah Berkas'
                                        ) : (
                                            'Simpan Perubahan'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL: DELETE CONFIRMATION */}
                <ConfirmDialog
                    isOpen={deleteConfirm !== null}
                    onClose={() => setDeleteConfirm(null)}
                    onConfirm={handleConfirmDelete}
                    title={
                        deleteConfirm?.type === 'category'
                            ? showTrashed
                                ? 'Hapus Permanen Kategori Folder?'
                                : 'Pindah ke Sampah?'
                            : showTrashed
                              ? 'Hapus Permanen Berkas?'
                              : 'Pindah ke Sampah?'
                    }
                    description={
                        deleteConfirm?.type === 'category'
                            ? `Apakah Anda yakin ingin ${showTrashed ? 'menghapus permanen' : 'memindahkan'} folder "${deleteConfirm?.title}"? ${showTrashed ? 'Seluruh berkas dokumen di dalamnya akan dihapus secara permanen.' : 'Folder beserta dokumen di dalamnya akan dipindahkan ke Sampah.'}`
                            : `Apakah Anda yakin ingin ${showTrashed ? 'menghapus permanen' : 'memindahkan'} berkas "${deleteConfirm?.title}"? ${showTrashed ? 'Tautan unduhan berkas ini tidak akan dapat diakses lagi.' : 'Berkas akan dipindahkan ke Sampah.'}`
                    }
                    confirmText={
                        showTrashed ? 'Hapus Permanen' : 'Pindah ke Sampah'
                    }
                    danger={true}
                />
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
