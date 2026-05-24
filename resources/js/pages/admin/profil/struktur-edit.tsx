import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Users, Save, ExternalLink, Image as ImageIcon, Plus, Trash2, Edit2, ArrowUp, ArrowDown, X, User } from 'lucide-react';
import { toast } from 'sonner';

interface AnggotaStaf {
    id: number;
    nama: string;
    jabatan: string;
    foto?: string;
    urutan: number;
}

const DEFAULT_BAGAN = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&q=80';

const DEFAULT_STAFF: AnggotaStaf[] = [
    {
        id: 1,
        nama: 'Dina Amalia, S.E., Ak.',
        jabatan: 'Kepala Bagian Keuangan & Verifikasi',
        foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
        urutan: 1
    },
    {
        id: 2,
        nama: 'Budi Hartono, S.Kom.',
        jabatan: 'Kepala Bagian Pengelolaan Aset & Inventaris',
        foto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
        urutan: 2
    },
    {
        id: 3,
        nama: 'Rina Marlina, A.Md.',
        jabatan: 'Staf Administrasi Pembayaran SPP',
        foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
        urutan: 3
    },
    {
        id: 4,
        nama: 'Fahmi Syahputra, S.Ak.',
        jabatan: 'Staf Verifikasi & Anggaran Belanja',
        foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        urutan: 4
    },
    {
        id: 5,
        nama: 'Siti Rahmah, S.E.',
        jabatan: 'Staf Logistik & Pengadaan Barang',
        foto: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&q=80',
        urutan: 5
    },
    {
        id: 6,
        nama: 'Andi Wijaya, A.Md.T.',
        jabatan: 'Staf Sarana Prasarana & Inventaris Aset',
        foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
        urutan: 6
    }
];

export default function EditStruktur() {
    const [gambarBagan, setGambarBagan] = useState('');
    const [anggotaList, setAnggotaList] = useState<AnggotaStaf[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Modal Staf State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStafId, setEditingStafId] = useState<number | null>(null);
    const [stafForm, setStafForm] = useState({
        nama: '',
        jabatan: '',
        foto: '',
        urutan: 0
    });

    // Load initial data
    useEffect(() => {
        const savedData = localStorage.getItem('bka_struktur_organisasi');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setGambarBagan(parsed.gambarBagan || DEFAULT_BAGAN);
                setAnggotaList(parsed.anggotaList || DEFAULT_STAFF);
            } catch (e) {
                setGambarBagan(DEFAULT_BAGAN);
                setAnggotaList(DEFAULT_STAFF);
            }
        } else {
            setGambarBagan(DEFAULT_BAGAN);
            setAnggotaList(DEFAULT_STAFF);
        }
    }, []);

    // Open Add Staf Modal
    const handleOpenAdd = () => {
        setEditingStafId(null);
        setStafForm({
            nama: '',
            jabatan: '',
            foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
            urutan: anggotaList.length + 1
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
            urutan: staf.urutan
        });
        setIsModalOpen(true);
    };

    // Handle delete staf
    const handleDeleteStaf = (id: number) => {
        const updated = anggotaList.filter(s => s.id !== id).map((s, idx) => ({
            ...s,
            urutan: idx + 1
        }));
        setAnggotaList(updated);
        toast.success('Anggota staf berhasil dihapus dari daftar sementara.');
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
            const updated = anggotaList.map(s => 
                s.id === editingStafId ? { ...s, ...stafForm } : s
            );
            setAnggotaList(updated);
            toast.success('Data staf berhasil diperbarui!');
        } else {
            // Create
            const nextId = anggotaList.length > 0 ? Math.max(...anggotaList.map(s => s.id)) + 1 : 1;
            const newStaf: AnggotaStaf = {
                id: nextId,
                ...stafForm,
                urutan: anggotaList.length + 1
            };
            setAnggotaList([...anggotaList, newStaf]);
            toast.success('Staf baru ditambahkan ke daftar sementara!');
        }
        setIsModalOpen(false);
    };

    // Sorting/Reordering Staf
    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        const items = [...anggotaList];
        const temp = items[index];
        items[index] = items[index - 1];
        items[index - 1] = temp;

        const updated = items.map((s, idx) => ({ ...s, urutan: idx + 1 }));
        setAnggotaList(updated);
    };

    const handleMoveDown = (index: number) => {
        if (index === anggotaList.length - 1) return;
        const items = [...anggotaList];
        const temp = items[index];
        items[index] = items[index + 1];
        items[index + 1] = temp;

        const updated = items.map((s, idx) => ({ ...s, urutan: idx + 1 }));
        setAnggotaList(updated);
    };

    // Handle Save All to LocalStorage
    const handleSaveAll = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const dataToSave = {
                gambarBagan,
                anggotaList
            };
            localStorage.setItem('bka_struktur_organisasi', JSON.stringify(dataToSave));
            toast.success('Bagan & daftar personalia BKA berhasil disimpan secara lokal!');
        } catch (error) {
            toast.error('Gagal menyimpan struktur organisasi.');
        } finally {
            setIsSaving(false);
        }
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
                            Unggah bagan organisasi terbaru dan perbarui data anggota staf pelaksana resmi di lingkungan BKA UMRI.
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
                <form onSubmit={handleSaveAll} className="grid w-full grid-cols-1 gap-8 items-start lg:grid-cols-[28%_1fr]">
                    
                    {/* Left Side Panel */}
                    <div className="space-y-4 rounded-2xl border border-neutral-200/60 bg-neutral-50/50 p-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800">Panduan Organisasi</h2>
                        
                        <div className="space-y-3 text-xs text-neutral-600 leading-relaxed">
                            <p>
                                <strong>Bagan Struktur:</strong> Diagram visual alur koordinasi struktural. Gunakan format gambar PNG/JPG/SVG dengan tautan URL valid.
                            </p>
                            <p>
                                <strong>Personalia:</strong> Daftar pejabat/staf pelaksana BKA. Urutan pada baris tabel menentukan urutan card pameran staf di website.
                            </p>
                            <p>
                                Pimpinan utama (Kepala Biro) otomatis disajikan secara terpisah di bagian paling atas pada halaman publik.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-neutral-200">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-98 disabled:opacity-50"
                            >
                                <Save className="size-4.5" />
                                {isSaving ? 'Menyimpan...' : 'Simpan Struktur'}
                            </button>
                        </div>
                    </div>

                    {/* Right Side Panel Inputs */}
                    <div className="space-y-6">
                        
                        {/* Bagan Diagram Card */}
                        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8 space-y-4">
                            <div className="border-b border-neutral-100 pb-3 flex items-center gap-2">
                                <ImageIcon className="size-5 text-emerald-600" />
                                <h3 className="text-base font-bold text-neutral-800 tracking-tight">Bagan Alur Organisasi</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-neutral-700">URL Gambar Bagan</label>
                                    <input
                                        type="text"
                                        value={gambarBagan}
                                        onChange={(e) => setGambarBagan(e.target.value)}
                                        placeholder="Tulis tautan gambar diagram (PNG/JPG)..."
                                        className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-mono text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    />
                                    <span className="text-[11px] text-neutral-400 block leading-relaxed">
                                        Rekomendasi rasio gambar lebar (landscape), background putih/transparan, resolusi minimal 1200px lebar.
                                    </span>
                                </div>

                                {/* Preview Bagan */}
                                <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 flex items-center justify-center min-h-[160px] overflow-hidden">
                                    {gambarBagan ? (
                                        <img 
                                            src={gambarBagan} 
                                            alt="Preview Bagan" 
                                            className="max-h-[150px] object-contain rounded-lg shadow-xs"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&q=80';
                                            }}
                                        />
                                    ) : (
                                        <div className="text-center text-neutral-400 space-y-1">
                                            <ImageIcon className="mx-auto size-8 opacity-45" />
                                            <span className="text-xs">Gambar kosong</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Personalia List Card */}
                        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8 space-y-4">
                            <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="size-5 text-emerald-600" />
                                    <h3 className="text-base font-bold text-neutral-800 tracking-tight">Daftar Anggota Staf ({anggotaList.length})</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleOpenAdd}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all text-xs font-bold"
                                >
                                    <Plus className="size-3.5" />
                                    Tambah Anggota
                                </button>
                            </div>

                            {/* Table of Staff */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-neutral-100 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                            <th className="py-3 pl-3 w-16">Foto</th>
                                            <th className="py-3 px-3">Nama Lengkap</th>
                                            <th className="py-3 px-3">Jabatan / Bagian</th>
                                            <th className="py-3 px-3 w-20 text-center">Urutan</th>
                                            <th className="py-3 pr-3 w-32 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 text-sm text-neutral-800">
                                        {anggotaList
                                            .sort((a, b) => a.urutan - b.urutan)
                                            .map((staf, index) => (
                                                <tr key={staf.id} className="hover:bg-neutral-50/40 group">
                                                    <td className="py-3 pl-3">
                                                        <div className="size-10 rounded-full overflow-hidden border border-neutral-200 bg-neutral-100">
                                                            {staf.foto ? (
                                                                <img src={staf.foto} alt={staf.nama} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User className="w-full h-full p-2 text-neutral-400" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3 font-semibold text-neutral-900">{staf.nama}</td>
                                                    <td className="py-3 px-3 font-medium text-neutral-500">{staf.jabatan}</td>
                                                    <td className="py-3 px-3 text-center font-bold text-neutral-600">
                                                        #{index + 1}
                                                    </td>
                                                    <td className="py-3 pr-3 text-right">
                                                        <div className="inline-flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                disabled={index === 0}
                                                                onClick={() => handleMoveUp(index)}
                                                                className="p-1.5 rounded hover:bg-neutral-200 text-neutral-500 disabled:opacity-30 disabled:hover:bg-transparent"
                                                                title="Naikkan"
                                                            >
                                                                <ArrowUp className="size-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={index === anggotaList.length - 1}
                                                                onClick={() => handleMoveDown(index)}
                                                                className="p-1.5 rounded hover:bg-neutral-200 text-neutral-500 disabled:opacity-30 disabled:hover:bg-transparent"
                                                                title="Turunkan"
                                                            >
                                                                <ArrowDown className="size-3.5" />
                                                            </button>
                                                            <div className="h-4 w-[1px] bg-neutral-200 mx-1" />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenEdit(staf)}
                                                                className="p-1.5 rounded hover:bg-neutral-200 text-neutral-600"
                                                                title="Edit"
                                                            >
                                                                <Edit2 className="size-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteStaf(staf.id)}
                                                                className="p-1.5 rounded hover:bg-red-50 text-red-600"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}

                                        {anggotaList.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center text-neutral-400">
                                                    <Users className="mx-auto size-12 opacity-30 mb-2" />
                                                    <p className="text-sm font-semibold">Belum ada anggota terdaftar</p>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg rounded-2xl bg-white border border-neutral-200 p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        {/* Close button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                        >
                            <X className="size-5" />
                        </button>

                        <h3 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
                            <User className="size-5 text-emerald-600" />
                            {editingStafId !== null ? 'Edit Data Anggota Staf' : 'Tambah Anggota Staf Baru'}
                        </h3>

                        <form onSubmit={handleSaveStafForm} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700">Nama Lengkap & Gelar</label>
                                <input
                                    type="text"
                                    required
                                    value={stafForm.nama}
                                    onChange={(e) => setStafForm(prev => ({ ...prev, nama: e.target.value }))}
                                    placeholder="Contoh: Dina Amalia, S.E., Ak."
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700">Jabatan Resmi</label>
                                <input
                                    type="text"
                                    required
                                    value={stafForm.jabatan}
                                    onChange={(e) => setStafForm(prev => ({ ...prev, jabatan: e.target.value }))}
                                    placeholder="Contoh: Staf Administrasi Keuangan"
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700">URL Foto Profil (Rasio 1:1)</label>
                                <input
                                    type="text"
                                    value={stafForm.foto}
                                    onChange={(e) => setStafForm(prev => ({ ...prev, foto: e.target.value }))}
                                    placeholder="Contoh: https://images.unsplash.com/..."
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-mono text-neutral-600 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                            </div>

                            {/* Foto preview in modal */}
                            {stafForm.foto && (
                                <div className="flex justify-center pt-2">
                                    <div className="size-16 rounded-full overflow-hidden border border-neutral-200">
                                        <img 
                                            src={stafForm.foto} 
                                            alt="Preview Staf" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition-all"
                                >
                                    {editingStafId !== null ? 'Perbarui Data' : 'Tambah Staf'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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
