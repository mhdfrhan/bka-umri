import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Compass, Target, Plus, Trash2, ArrowUp, ArrowDown, Save, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface MisiItem {
    id: number;
    isi: string;
    urutan: number;
}

const DEFAULT_VISI = 'Menjadi penyelenggara administrasi keuangan dan pengelolaan aset yang unggul, terpercaya, transparan, dan akuntabel berbasis digitalisasi layanan demi mendukung Universitas Muhammadiyah Riau yang cerdas, inovatif, dan berkemajuan pada tahun 2028.';

const DEFAULT_MISI: MisiItem[] = [
    {
        id: 1,
        isi: 'Menyelenggarakan sistem perencanaan, penganggaran, dan pengendalian keuangan yang efisien, transparan, dan akuntabel.',
        urutan: 1
    },
    {
        id: 2,
        isi: 'Mengembangkan digitalisasi administrasi layanan keuangan terintegrasi guna memberikan kemudahan pelayanan terbaik bagi seluruh mahasiswa dan civitas akademika.',
        urutan: 2
    },
    {
        id: 3,
        isi: 'Melaksanakan penataan, pembukuan, dan pelaporan sarana, prasarana, serta aset fisik universitas secara profesional dan akurat.',
        urutan: 3
    },
    {
        id: 4,
        isi: 'Mengoptimalkan pemanfaatan dan produktivitas aset fisik maupun finansial kampus untuk keberlangsungan finansial universitas yang mandiri.',
        urutan: 4
    },
    {
        id: 5,
        isi: 'Membina kualitas sumber daya manusia pengelola keuangan dan logistik yang berintegritas tinggi, kompeten, dan memegang teguh nilai-nilai Al-Islam Kemuhammadiyahan.',
        urutan: 5
    }
];

export default function EditVisiMisi() {
    const [visi, setVisi] = useState('');
    const [misiList, setMisiList] = useState<MisiItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Load initial data
    useEffect(() => {
        const savedData = localStorage.getItem('bka_visi_misi');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setVisi(parsed.visi || DEFAULT_VISI);
                setMisiList(parsed.misiItems || DEFAULT_MISI);
            } catch (e) {
                setVisi(DEFAULT_VISI);
                setMisiList(DEFAULT_MISI);
            }
        } else {
            setVisi(DEFAULT_VISI);
            setMisiList(DEFAULT_MISI);
        }
    }, []);

    // Handle add mission
    const handleAddMisi = () => {
        if (misiList.length >= 10) {
            toast.warning('Maksimum 10 poin misi diperbolehkan!');
            return;
        }
        const nextId = misiList.length > 0 ? Math.max(...misiList.map(m => m.id)) + 1 : 1;
        const newMisi: MisiItem = {
            id: nextId,
            isi: '',
            urutan: misiList.length + 1
        };
        setMisiList([...misiList, newMisi]);
    };

    // Handle remove mission
    const handleRemoveMisi = (id: number) => {
        if (misiList.length <= 1) {
            toast.warning('Minimal harus terdapat 1 poin misi!');
            return;
        }
        const updated = misiList.filter(m => m.id !== id).map((m, idx) => ({
            ...m,
            urutan: idx + 1
        }));
        setMisiList(updated);
    };

    // Handle change text mission
    const handleChangeMisi = (id: number, text: string) => {
        const updated = misiList.map(m => m.id === id ? { ...m, isi: text } : m);
        setMisiList(updated);
    };

    // Reorder actions
    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        const items = [...misiList];
        const temp = items[index];
        items[index] = items[index - 1];
        items[index - 1] = temp;
        
        const updated = items.map((m, idx) => ({ ...m, urutan: idx + 1 }));
        setMisiList(updated);
    };

    const handleMoveDown = (index: number) => {
        if (index === misiList.length - 1) return;
        const items = [...misiList];
        const temp = items[index];
        items[index] = items[index + 1];
        items[index + 1] = temp;

        const updated = items.map((m, idx) => ({ ...m, urutan: idx + 1 }));
        setMisiList(updated);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!visi.trim()) {
            toast.error('Visi organisasi tidak boleh kosong!');
            return;
        }
        const hasEmptyMisi = misiList.some(m => !m.isi.trim());
        if (hasEmptyMisi) {
            toast.error('Terdapat poin misi yang masih kosong! Harap isi atau hapus poin tersebut.');
            return;
        }

        setIsSaving(true);
        try {
            const dataToSave = {
                visi: visi.trim(),
                misiItems: misiList
            };
            localStorage.setItem('bka_visi_misi', JSON.stringify(dataToSave));
            toast.success('Visi & Misi BKA berhasil disimpan secara lokal!');
        } catch (error) {
            toast.error('Gagal menyimpan data.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Head title="Edit Visi & Misi - BKA UMRI" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-neutral-800">
                            <Compass className="size-6 text-emerald-600" />
                            Kelola Visi & Misi Organisasi
                        </h1>
                        <p className="mt-1 text-sm leading-relaxed font-normal text-neutral-500">
                            Rumuskan visi jangka panjang dan misi strategis penunjang pelayanan administrasi keuangan serta sarana prasarana.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <a
                            href="/profil/visi-misi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-xs transition-colors hover:bg-neutral-50 hover:text-neutral-950"
                        >
                            <ExternalLink className="size-4" />
                            Lihat Halaman
                        </a>
                    </div>
                </div>

                {/* Form Shell with CSS Grid for perfect layout alignment */}
                <form onSubmit={handleSave} className="grid w-full grid-cols-1 gap-8 items-start lg:grid-cols-[28%_1fr]">
                    
                    {/* Left Column Information */}
                    <div className="space-y-4 rounded-2xl border border-neutral-200/60 bg-neutral-50/50 p-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800">Panduan Rumusan</h2>
                        
                        <div className="space-y-3.5 text-xs text-neutral-600 leading-relaxed">
                            <div className="flex gap-2">
                                <span className="text-emerald-600 font-bold">1.</span>
                                <span><strong>Visi:</strong> Harus merepresentasikan cita-cita besar BKA UMRI hingga target tahun pencapaian tertentu (e.g. 2028).</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-emerald-600 font-bold">2.</span>
                                <span><strong>Misi:</strong> Terdiri atas 1–10 langkah konkret. Disusun terurut sesuai skala implementasi pengerjaan.</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-emerald-600 font-bold">3.</span>
                                <span>Gunakan tombol panah (<ArrowUp className="inline size-3" /> / <ArrowDown className="inline size-3" />) untuk merubah prioritas urutan misi dengan mudah.</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-neutral-200">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-98 disabled:opacity-50"
                            >
                                <Save className="size-4.5" />
                                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </div>

                    {/* Right Column Form Inputs */}
                    <div className="space-y-6">
                        
                        {/* Visi Card */}
                        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8 space-y-4">
                            <div className="border-b border-neutral-100 pb-3 flex items-center gap-2">
                                <Compass className="size-5 text-emerald-600" />
                                <h3 className="text-base font-bold text-neutral-800 tracking-tight">Pernyataan Visi BKA</h3>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-semibold text-neutral-700">Teks Visi Utama</label>
                                    <span className={`text-xs ${visi.length > 450 ? 'text-red-500 font-semibold' : 'text-neutral-400'}`}>
                                        {visi.length} / 500 karakter
                                    </span>
                                </div>
                                <textarea
                                    maxLength={500}
                                    rows={4}
                                    value={visi}
                                    onChange={(e) => setVisi(e.target.value)}
                                    placeholder="Masukkan visi resmi BKA..."
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm leading-relaxed text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                            </div>
                        </div>

                        {/* Misi Card */}
                        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8 space-y-4">
                            <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Target className="size-5 text-emerald-600" />
                                    <h3 className="text-base font-bold text-neutral-800 tracking-tight">Daftar Poin Misi BKA ({misiList.length})</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddMisi}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all text-xs font-bold"
                                >
                                    <Plus className="size-3.5" />
                                    Tambah Poin
                                </button>
                            </div>

                            <div className="space-y-3">
                                {misiList
                                    .sort((a, b) => a.urutan - b.urutan)
                                    .map((misi, index) => (
                                        <div key={misi.id} className="flex items-center gap-3 bg-neutral-50/60 p-3 rounded-xl border border-neutral-200/60 transition-all hover:bg-neutral-50">
                                            {/* Order indicator */}
                                            <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100/70 text-sm font-extrabold text-emerald-800">
                                                {index + 1}
                                            </span>

                                            {/* Mission input */}
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    maxLength={200}
                                                    value={misi.isi}
                                                    onChange={(e) => handleChangeMisi(misi.id, e.target.value)}
                                                    placeholder="Tulis poin pernyataan misi..."
                                                    className="w-full border-none bg-transparent py-1 text-sm font-medium text-neutral-800 focus:outline-none focus:ring-0"
                                                />
                                            </div>

                                            {/* Sorting & Deleting controls */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                    type="button"
                                                    disabled={index === 0}
                                                    onClick={() => handleMoveUp(index)}
                                                    className="p-1 rounded hover:bg-neutral-200 text-neutral-500 disabled:opacity-30 disabled:hover:bg-transparent"
                                                    title="Pindahkan ke atas"
                                                >
                                                    <ArrowUp className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={index === misiList.length - 1}
                                                    onClick={() => handleMoveDown(index)}
                                                    className="p-1 rounded hover:bg-neutral-200 text-neutral-500 disabled:opacity-30 disabled:hover:bg-transparent"
                                                    title="Pindahkan ke bawah"
                                                >
                                                    <ArrowDown className="size-4" />
                                                </button>
                                                <div className="h-4 w-[1px] bg-neutral-200 mx-0.5" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMisi(misi.id)}
                                                    className="p-1 rounded hover:bg-red-50 text-red-600"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                {misiList.length === 0 && (
                                    <div className="text-center py-8 border border-dashed border-neutral-200 rounded-xl">
                                        <Target className="mx-auto mb-2 size-8 text-neutral-300 animate-pulse" />
                                        <p className="text-sm font-semibold text-neutral-600">Poin Misi Kosong</p>
                                        <button
                                            type="button"
                                            onClick={handleAddMisi}
                                            className="mt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                                        >
                                            Tambah misi pertama
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </>
    );
}

EditVisiMisi.layout = {
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
            title: 'Visi & Misi',
            href: '/admin/profil/visi-misi',
        },
    ],
};
